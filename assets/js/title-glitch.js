// Title glitch: occasionally replace brand text with numbers or hex, then revert and wait
(function(){
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  function randHexChar(){ const chars='0123456789abcdef'; return chars[Math.floor(Math.random()*chars.length)]; }
  function randBinChar(){ return Math.random() < 0.5 ? '0' : '1'; }
  function randomString(len, type){
    let s='';
    for(let i=0;i<len;i++) s += (type==='hex' ? randHexChar() : randBinChar());
    return s;
  }

  const els = Array.from(document.querySelectorAll('.autograph, .autograph-painter'));
  if(els.length === 0) return;

  els.forEach(el => {
    const original = el.textContent || '';
    // we want a static prefix "> " that never mutates and should be present
    const PREFIX = '> ';
    // split into per-character spans (if not already done)
    let spans = Array.from(el.querySelectorAll('.autograph-char'));
    let prefixSpan = el.querySelector('.autograph-prefix');
    if(spans.length === 0){
      // determine display text without the prefix if it's already present
      const hasPrefix = original.startsWith(PREFIX);
      const display = hasPrefix ? original.slice(PREFIX.length) : original;
      el.textContent = '';
      // create static prefix span
      prefixSpan = document.createElement('span');
      prefixSpan.className = 'autograph-prefix';
      prefixSpan.textContent = PREFIX;
      el.appendChild(prefixSpan);
      // create per-character spans for the rest of the text
      const chars = Array.from(display);
      chars.forEach(ch=>{
        const s = document.createElement('span');
        s.className = 'autograph-char';
        s.textContent = ch;
        el.appendChild(s);
      });
      spans = Array.from(el.querySelectorAll('.autograph-char'));
      // fix widths to prevent layout shift (also lock prefix width)
      [prefixSpan, ...spans].forEach(s=>{
        const w = s.offsetWidth;
        s.style.width = w + 'px';
        // make sure prefix isn't selectable/animated
        if(s.classList.contains('autograph-prefix')) s.style.userSelect = 'none';
      });
    } else {
      // if spans already exist, try to find/create a prefix span
      if(!prefixSpan){
        prefixSpan = document.createElement('span');
        prefixSpan.className = 'autograph-prefix';
        prefixSpan.textContent = PREFIX;
        el.insertBefore(prefixSpan, spans[0]);
        const w = prefixSpan.offsetWidth;
        prefixSpan.style.width = w + 'px';
        prefixSpan.style.userSelect = 'none';
      }
    }
    const len = spans.length || 0;
    const originalChars = spans.map(s=>s.textContent);
    // On-demand scan triggered by mouseenter; cancel on mouseleave
    el._glitchRunning = false;
    el.addEventListener('mouseenter', ()=>{
      if(el._glitchRunning) return;
      el._glitchRunning = true;
      el._glitchCancel = false;
      (async function scan(){
        // pick binary or hex for this scan
        const type = Math.random() < 0.5 ? 'hex' : 'bin';
        // how many chars to shift at a time (1..3)
        const changeCount = 1 + Math.floor(Math.random()*3);
        const stepDelay = Math.random() * 50;

  // start position (introduce mutated chars gradually from the rightmost char)
  const start = Math.max(0, len - 1);
        // initialize carry buffer so subsequent chars remember the previous mutated char
        let carry = Array.from({length: changeCount}, ()=> randomString(1, type));
        // run right-to-left scan
        for(let i = start; i >= 0; i--){
          if(el._glitchCancel) break;
          // set mutated chars for indices [i .. i+changeCount-1] using carry
          for(let j=0;j<changeCount;j++){
            const idx = i + j;
            if(idx < 0 || idx >= len) continue;
            spans[idx].textContent = carry[j];
            spans[idx].classList.add('autograph-glitch');
          }
          // revert the block to the right (previous position)
          const rightIdx = i + changeCount;
          if(rightIdx < len){
            spans[rightIdx].textContent = originalChars[rightIdx];
            spans[rightIdx].classList.remove('autograph-glitch');
          }
          // update carry: new random char enters at front, others shift right
          const newFirst = randomString(1, type);
          carry = [newFirst, ...carry].slice(0, changeCount);
          await sleep(stepDelay + Math.floor(Math.random()*80));
        }
        // 33% chance to bounce back (left-to-right) before cleanup
        if(!el._glitchCancel && Math.random() < 0.33){
          // left-to-right scan: initialize carry (fresh) but shift in opposite direction
          carry = Array.from({length: changeCount}, ()=> randomString(1, type));
          // end position should allow gradual introduction up to the rightmost char
          const end = Math.max(0, len - 1);
          for(let i = 0; i <= end; i++){
            if(el._glitchCancel) break;
            // set mutated chars for indices [i .. i+changeCount-1] using carry
            for(let j=0;j<changeCount;j++){
              const idx = i + j;
              if(idx < 0 || idx >= len) continue;
              spans[idx].textContent = carry[j];
              spans[idx].classList.add('autograph-glitch');
            }
            // revert the block to the left (previous position)
            const leftIdx = i - 1;
            if(leftIdx >= 0){
              spans[leftIdx].textContent = originalChars[leftIdx];
              spans[leftIdx].classList.remove('autograph-glitch');
            }
            // update carry: shift left and push a new char at the end
            const newLast = randomString(1, type);
            carry = [...carry.slice(1), newLast].slice(0, changeCount);
            await sleep(stepDelay + Math.floor(Math.random()*80));
          }
        }
        // cleanup: revert any mutated spans
        for(let k=0;k<len;k++){
          spans[k].textContent = originalChars[k];
          spans[k].classList.remove('autograph-glitch');
        }
        el._glitchRunning = false;
      })();
    });
    el.addEventListener('mouseleave', ()=>{ el._glitchCancel = true; });
  });
})();
