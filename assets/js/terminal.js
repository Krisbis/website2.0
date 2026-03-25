// Lightweight terminal emulator
(function () {
  const output = document.getElementById('output');
  const input = document.getElementById('cmdInput');
  const btnClear = document.getElementById('btnClear');

  if (!output || !input) return;

  /*
   Simple in-memory "filesystem" for the terminal emulator.
   To add or edit files, modify the `fs` object below.
   Example:
     fs['readme.txt'] = {
       type: 'file',
       content: 'Hello — edit this text to change what `cat readme.txt` displays',
       size: 123,
       mtime: Date.now()
     };
   Directories are objects with type: 'dir' and children array (names).
  */
  const STORAGE_KEY = 'xorxorplain_fs_v1';

  const defaultFs = {
    // home-level directories
    'About': { type: 'dir', children: [] },
    'Projects': { type: 'dir', children: [] },
    'blog': { type: 'dir', children: [] },

    // sample files (you can edit these)
    'readme.txt': { type: 'file', content: 'Welcome!\nCan you find the key?', size: 'Welcome!\nCan you find the key?'.length, mtime: Date.now() - 1000 * 60 * 60 * 24, owner: 'xorxor' },
    '.secret': { type: 'file', content: 'top-secret', size: 10, mtime: Date.now() - 1000 * 60 * 60, owner: 'xorxor' },
    '.key': { type: 'file', content: 'XorAsOTPreliesTo=1)TrulyRandomKey2)KeyLength=MessageLength3)KeyIsUsedOnlyOnce.ThisKeyFailsPointNo.1&2....DoesThisKeyFindItsLock?Hint__:WebsitesGreetsYouWithWhatDevelopedElementWhenYourConnectionIsSlow', size: 128, mtime: Date.now() - 1000 * 60 * 60 * 24, owner: 'xorxor' },
    'cat.txt': {
      type: 'file',
      content: "  /\\_/\\\n ( o.o )\n  > ^ <\n",
      size: "  /\\_/\\\n ( o.o )\n  > ^ <\n".length,
      mtime: Date.now() - 1000 * 60 * 30,
      owner: 'xorxor'
    },
  };

  // load from localStorage if present, otherwise use default
  let fs;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      fs = JSON.parse(saved);
      // merge any missing default entries (new files added in code) into saved fs
      for (const k in defaultFs) {
        if (!(k in fs)) {
          fs[k] = defaultFs[k];
        }
      }
      // persist merged fs so new defaults appear on subsequent loads
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fs)); } catch (e) { /* ignore */ }
    } else { fs = defaultFs; }
  } catch (e) { fs = defaultFs; }

  function saveFs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fs)); } catch (e) { /* ignore */ }
  }

  // helper to list names in home (non-recursive)
  function listEntries(showAll) {
    return Object.keys(fs).filter(name => showAll ? true : !name.startsWith('.')).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  function formatMode(entry) {
    const owner = (entry && entry.owner) ? entry.owner : 'xorxor';
    if (entry.type === 'dir') {
      // owner 'user' has write on dirs, 'xorxor' does not
      return owner === 'user' ? 'drwxr-xr-x' : 'dr-xr-xr-x';
    }
    // files: owner 'user' is writable by visitor; files owned by 'xorxor' are read-only to visitor
    return owner === 'user' ? '-rw-r--r--' : '-r--r--r--';
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  function formatSize(n) {
    if (n < 1024) return n + 'B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + 'K';
    return Math.round(n / (1024 * 1024)) + 'M';
  }

  const commands = {
    help() {
      return [
        'Available commands: help, whoami, id, uname, date, pwd, ls, cat, cd, touch, write, rm, base64, theme, projects, contact, echo, clear'
      ];
    },
    whoami() { return ['user']; },
    id() { return ['uid=1000(user) gid=1000(user) groups=1000(user)']; },
    date() { return [new Date().toString()] },
    uname(args) {
      if (args && (args.includes('-a') || args.includes('--all'))) {
        return ['Linux null 6.6.0-xorxor #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'];
      }
      return ['Linux'];
    },

    pwd() { return ['~'] },

    ls(args) {
      // args may be ['-la'] or []
      const showAll = args && args.includes('-a') || args && args.includes('-la') || args && args.includes('-l') && args.includes('-a');
      const long = args && (args.includes('-l') || args.includes('-la'));
      const names = listEntries(showAll);
      if (long) {
        return names.map(name => {
          const entry = fs[name];
          const mode = formatMode(entry);
          const owner = entry.owner || 'xorxor';
          const size = entry.size || (entry.type === 'dir' ? 0 : (entry.content ? entry.content.length : 0));
          const mtime = entry.mtime || Date.now();
          const mtimeStr = formatDate(mtime);
          const suffix = entry.type === 'dir' ? '/' : '';
          return `${mode} 1 ${owner} ${owner} ${formatSize(size)} ${mtimeStr} ${name}${suffix}`;
        });
      }
      // simple column-like output (one per line)
      return names.map(name => {
        const entry = fs[name];
        return entry.type === 'dir' ? name + '/' : name;
      });
    },

    cat(args) {
      if (!args || args.length === 0) return ['cat: missing operand'];
      const name = args[0];
      const entry = fs[name];
      if (!entry) return [`cat: ${name}: No such file or directory`];
      if (entry.type === 'dir') return [`cat: ${name}: Is a directory`];
      return [entry.content || ''];
    },

    cd(args) {
      if (!args || args.length === 0) return ['cd: missing operand'];
      const name = args[0];
      // map directory names to pages (case-insensitive)
      const target = Object.keys(fs).find(k => k.toLowerCase() === name.toLowerCase());
      if (!target) return [`cd: ${name}: No such file or directory`];
      if (fs[target].type !== 'dir') return [`cd: ${name}: Not a directory`];
      // redirect for known directories
      if (target.toLowerCase() === 'projects') {
        window.location.href = '/projects/projects.html';
        return ['opening projects...'];
      }
      if (target.toLowerCase() === 'about') {
        window.location.href = '/about.html';
        return ['opening about...'];
      }
      if (target.toLowerCase() === 'blog') {
        window.location.href = 'blog/index.html';
        return ['opening blog...'];
      }
      return [`cd: ${name}: Directory exists but no action defined`];
    },
    projects() { return ['Hammer - Medium / Web', 'Lookup - Easy / Linux & Web', 'Pyrat - Easy / Linux', '', 'Run "cd Projects" to view all writeups.'] },
    contact() { return ['email: xorxorplain@proton.me', 'PGP: You can download my public key from the root of the website (xorxorplain.com/pgp_public.asc)'] },
    echo(args) { return [args.join(' ')] },

    touch(args) {
      if (!args || args.length === 0) return ['touch: missing file operand'];
      const name = args[0];
      const existing = fs[name];
      if (existing && existing.type === 'dir') return [`touch: cannot create file '${name}': Is a directory`];
      // if it exists and owned by xorxor, visitor cannot modify
      if (existing && existing.owner && existing.owner === 'xorxor') {
        return [`touch: cannot modify '${name}': Permission denied`];
      }
      fs[name] = existing || { type: 'file', content: '', size: 0, mtime: Date.now(), owner: 'user' };
      // If the file already existed keep owner; otherwise owner is set to 'user'
      fs[name].mtime = Date.now();
      fs[name].size = fs[name].content ? fs[name].content.length : 0;
      saveFs();
      return [`created ${name}`];
    },

    write(args) {
      if (!args || args.length < 2) return ['write: usage: write <file> <text>'];
      const name = args[0];
      const content = args.slice(1).join(' ');
      const existing = fs[name];
      if (existing && existing.type === 'dir') return [`write: ${name}: Is a directory`];
      // if existing is owned by xorxor, deny
      if (existing && existing.owner && existing.owner === 'xorxor') {
        return [`write: ${name}: Permission denied`];
      }
      fs[name] = { type: 'file', content: content, size: content.length, mtime: Date.now(), owner: 'user' };
      saveFs();
      return [`wrote ${fs[name].size} bytes to ${name}`];
    },

    rm(args) {
      if (!args || args.length === 0) return ['rm: missing operand'];
      const name = args[0];
      const entry = fs[name];
      if (!entry) return [`rm: cannot remove '${name}': No such file or directory`];
      if (entry.type === 'dir') return [`rm: cannot remove '${name}': Is a directory`];
      if (entry.owner && entry.owner === 'xorxor') return [`rm: cannot remove '${name}': Permission denied`];
      delete fs[name];
      saveFs();
      return [`removed ${name}`];
    },

    base64(args) {
      const usage = [
        'usage: base64 [OPTION] <string>',
        '  -d, --decode   decode base64 string',
        '  -e, --encode   encode string as base64 (default)',
        '  --             treat remaining input as literal text'
      ];

      if (!args || args.length === 0) return usage;

      let mode = 'encode';
      let sawDecode = false;
      let sawEncode = false;
      let parsingFlags = true;
      const payloadParts = [];

      for (let i = 0; i < args.length; i++) {
        const token = args[i];

        if (parsingFlags && token === '--') {
          parsingFlags = false;
          continue;
        }

        if (parsingFlags && token === '--help') {
          return usage;
        }

        if (parsingFlags && (token === '-d' || token === '--decode')) {
          sawDecode = true;
          mode = 'decode';
          continue;
        }

        if (parsingFlags && (token === '-e' || token === '--encode')) {
          sawEncode = true;
          mode = 'encode';
          continue;
        }

        if (parsingFlags && token.startsWith('-')) {
          return [
            `base64: invalid option '${token}'`,
            'Try "base64 --help" for usage.'
          ];
        }

        payloadParts.push(token);
      }

      if (sawDecode && sawEncode) {
        return ['base64: choose either encode or decode, not both'];
      }

      const input = payloadParts.join(' ');
      if (input.length === 0) return ['base64: missing operand'];

      const MAX_INPUT_CHARS = 8192;
      if (input.length > MAX_INPUT_CHARS) {
        return [`base64: input too large (max ${MAX_INPUT_CHARS} characters)`];
      }

      if (mode === 'decode') {
        const compact = input.replace(/\s+/g, '');
        if (compact.length === 0) return ['base64: missing operand'];

        if (compact.length % 4 !== 0) {
          return ['base64: invalid input — length must be a multiple of 4'];
        }

        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(compact)) {
          return ['base64: invalid input — malformed base64'];
        }

        try {
          const binaryStr = atob(compact);
          const bytes = Uint8Array.from(binaryStr, function (c) { return c.charCodeAt(0); });
          const decoded = new TextDecoder().decode(bytes);
          return [decoded];
        } catch (e) {
          return ['base64: invalid input — could not decode'];
        }
      }

      try {
        const bytes = new TextEncoder().encode(input);
        const CHUNK_SIZE = 0x8000;
        let binaryStr = '';
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
          const chunk = bytes.subarray(i, i + CHUNK_SIZE);
          binaryStr += String.fromCharCode.apply(null, chunk);
        }
        return [btoa(binaryStr)];
      } catch (e) {
        return ['base64: encoding failed'];
      }
    },

    theme(args) {
      if (!args || args.length === 0) {
        return [
          'usage: theme <hex colour>',
          'example: theme #FF0000',
          'Accepts 3 or 6 digit hex with or without #.',
          'Use "theme reset" to restore default.'
        ];
      }
      let raw = args[0].replace(/^#/, '');

      if (raw.toLowerCase() === 'reset') raw = 'D7DCE6';   // default white-ish

      // expand shorthand (#F00 → FF0000)
      if (/^[0-9a-fA-F]{3}$/.test(raw)) {
        raw = raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2];
      }

      if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
        return ['theme: invalid hex colour. Use format #RRGGBB or #RGB.'];
      }

      const r = parseInt(raw.substring(0, 2), 16);
      const g = parseInt(raw.substring(2, 4), 16);
      const b = parseInt(raw.substring(4, 6), 16);

      // find terminal centre on screen as ripple origin
      const termEl = document.querySelector('.terminal-card') || document.getElementById('terminal');
      let ox = window.innerWidth / 2, oy = window.innerHeight / 2;
      if (termEl) {
        const rect = termEl.getBoundingClientRect();
        ox = rect.left + rect.width / 2;
        oy = rect.top + rect.height / 2;
      }

      if (typeof window.__duneColorRipple === 'function') {
        window.__duneColorRipple(ox, oy, { r: r, g: g, b: b });
      }

      return [`theme set to #${raw.toUpperCase()}`];
    }
  };

  // simple command history
  const history = [];
  let historyIndex = 0; // points into history; historyIndex === history.length means blank new entry

  function appendLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    // if caller requested raw (no coloring), render as plain text
    if (cls && cls.split && cls.split(' ').includes('raw')) {
      div.textContent = text;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
      return div;
    }
    // escape html
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    // helper to wrap directory names (ending with /)
    let html = esc(text);
    // special handling for the echoed user command prompt
    if (cls && cls.split(' ').includes('user-cmd')) {
      // try to split prompt from the command
      const parts = text.split(/\s/, 1);
      // detect common prompt prefix 'user@null:~$ '
      const promptMatch = text.match(/^(user@[^:]+:[^$]+\$\s+)/);
      if (promptMatch) {
        const prompt = esc(promptMatch[1]);
        const rest = esc(text.slice(promptMatch[1].length));
        html = `<span class="ps1">${prompt}</span><span class="cmd-text">${rest}</span>`;
      } else {
        html = `<span class="ps1">${esc('user@null:~$ ')}</span><span class="cmd-text">${esc(text)}</span>`;
      }
      div.innerHTML = html;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
      return div;
    }
    // color common error messages
    const errPatterns = [/permission denied/i, /no such file/i, /missing operand/i, /is a directory/i, /command not found/i];
    if (errPatterns.some(rx => rx.test(text))) {
      div.innerHTML = `<span class="term-error">${html}</span>`;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
      return div;
    }
    // color directory-like entries (ending with /)
    html = html.replace(/(\b[\w\-\.]+\/?)/g, function (m) {
      if (/\/$/.test(m)) return `<span class="term-dir">${m}</span>`;
      return m;
    });
    // color owner/meta fields if present (simple heuristic for long listing)
    html = html.replace(/^(\S+\s+\d+\s+)(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/, '$1<span class="term-meta">$2</span> <span class="term-meta">$3</span> <span class="term-meta">$4</span> $5');
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    return div;
  }

  function typeText(text, cb) {
    const line = document.createElement('div');
    line.className = 'line';
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
    let i = 0;
    const speed = 8;
    const t = setInterval(() => {
      line.textContent += text.charAt(i);
      i++;
      output.scrollTop = output.scrollHeight;
      if (i >= text.length) { clearInterval(t); if (cb) cb(); }
    }, speed);
  }

  function runCommand(raw) {
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // echo the typed command
    appendLine('user@null:~$ ' + raw, 'user-cmd');

    if (cmd === 'clear') {
      output.innerHTML = '';
      return;
    }

    if (cmd === 'sudo') {
      appendLine('user is not in the sudoers file.');
      appendLine('This incident will be reported.');
      return;
    }

    const fn = commands[cmd];
    if (fn) {
      const res = fn(args);
      if (Array.isArray(res)) {
        // if this is 'cat' output, render raw (no coloring) so ASCII art and file content remains intact
        if (cmd === 'cat') {
          res.forEach(line => appendLine(line, 'raw'));
        } else {
          res.forEach(line => appendLine(line));
        }
      } else if (typeof res === 'string') {
        appendLine(res);
      }
    } else {
      appendLine(cmd + ': command not found');
    }
  }

  // welcome banner
  const banner = [
    'xorxorplain • terminal emulator',
    "Type 'help' for a list of commands."
  ];
  banner.forEach((t, i) => setTimeout(() => appendLine(t), i * 220));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value;
      if (val.trim() !== '') {
        history.push(val);
        historyIndex = history.length;
      }
      runCommand(val);
      input.value = '';
    }
    // history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex] || '';
      } else if (historyIndex === 0) {
        input.value = history[0] || '';
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex] || '';
      } else {
        historyIndex = history.length;
        input.value = '';
      }
    }
    if (e.key === 'c' && e.ctrlKey) { // emulate ctrl+c
      appendLine('^C');
      input.value = '';
    }
    // Tab completion: commands (first word) or filenames (subsequent words)
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value;
      const cursorPos = input.selectionStart;
      const before = val.slice(0, cursorPos);
      const after = val.slice(cursorPos);
      const parts = before.split(/\s+/);
      const partial = (parts[parts.length - 1] || '').toLowerCase();

      if (partial.length === 0) return;

      let candidates;
      if (parts.length <= 1) {
        // completing a command name
        const cmdNames = Object.keys(commands).concat(['clear', 'sudo']);
        candidates = cmdNames.filter(c => c.startsWith(partial));
      } else {
        // completing a filename/dirname from the filesystem
        const fsNames = Object.keys(fs);
        candidates = fsNames.filter(n => n.toLowerCase().startsWith(partial));
      }

      if (candidates.length === 1) {
        // single match — complete it
        const prefix = before.slice(0, before.length - parts[parts.length - 1].length);
        input.value = prefix + candidates[0] + after;
        input.selectionStart = input.selectionEnd = (prefix + candidates[0]).length;
      } else if (candidates.length > 1) {
        // find longest common prefix among candidates
        let common = candidates[0];
        for (let ci = 1; ci < candidates.length; ci++) {
          while (!candidates[ci].toLowerCase().startsWith(common.toLowerCase())) {
            common = common.slice(0, -1);
          }
        }
        if (common.length > partial.length) {
          // extend to common prefix (preserve original casing of the first match)
          const prefix = before.slice(0, before.length - parts[parts.length - 1].length);
          const match = candidates.find(c => c.toLowerCase().startsWith(common.toLowerCase())) || common;
          const completed = match.slice(0, common.length);
          input.value = prefix + completed + after;
          input.selectionStart = input.selectionEnd = (prefix + completed).length;
        } else {
          // show all candidates
          appendLine('user@null:~$ ' + val, 'user-cmd');
          appendLine(candidates.join('  '));
        }
      }
    }
  });

  btnClear && btnClear.addEventListener('click', () => { output.innerHTML = ''; input.focus(); });

  // focus when clicking anywhere on terminal
  document.getElementById('terminal').addEventListener('click', () => input.focus());

  // small accessibility: focus input on load
  window.addEventListener('load', () => input.focus());
})();
