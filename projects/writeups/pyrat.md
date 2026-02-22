---
title: Pyrat
difficulty: Easy
environment: Linux
tags:
  - Python
  - SUID
  - Path Hijack
  - SSH
  - Linux
  - Enumeration
image: "https://cards.scryfall.io/art_crop/front/4/6/46419d29-21a1-4753-a2f0-1d0d996ec54e.jpg?1608910463"
image_alt: "Soul Shatter art"
date: 2026-02-21
---

## Overview

Pyrat is an easy-difficulty Linux machine that focuses on Python-based exploitation techniques. The box involves enumerating a custom Python web application and leveraging its vulnerabilities to gain initial access.

## Reconnaissance

### Nmap Scan

```
$ nmap -sC -sV -oN nmap/pyrat 10.10.11.xx
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1
80/tcp open  http    Python/3.11 aiohttp
8000/tcp open  http   SimpleHTTPServer 0.6
```

Initial scan reveals SSH, a Python aiohttp web server on port 80, and a SimpleHTTPServer on port 8000.

### Web Enumeration

Browsing to port 8000 reveals a directory listing with exposed Python source files. The main application source leaks credentials hardcoded in configuration.

## Exploitation

### Initial Access

Using the discovered credentials, we can authenticate to the aiohttp application's admin panel. The admin panel contains a file upload feature vulnerable to path traversal.

```
$ curl -X POST http://10.10.11.xx/upload \
  -H "Cookie: session=admin_token" \
  -F "file=@shell.py;filename=../../app/routes.py"
```

### Privilege Escalation

Once on the box, we find a SUID binary that loads Python modules from a writable path:

```
$ find / -perm -4000 -type f 2>/dev/null
/opt/checker
$ strings /opt/checker | grep import
import rat_config
```

By creating a malicious `rat_config.py` in the Python path, we hijack the import and get root execution.

## Flags

- **User:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Root:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Lessons Learned

This box highlights the dangers of running development servers in production, hardcoded credentials, and unsafe SUID binaries that rely on Python imports from writable paths.
