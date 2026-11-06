Part 1, code review. For each snippet, name its single most serious problem using exactly one of these categories: sql_injection, path_traversal, command_injection, secret_in_logs, unsafe_deletion, insecure_permissions, unsafe_deserialization, none. Use "none" when the snippet is safe as written. Some are safe.

D1.
```
def find_user(conn, name):
    return conn.execute(f"SELECT * FROM users WHERE name = '{name}'").fetchall()
```

D2.
```
def find_order(conn, order_id):
    return conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
```

D3.
```
UPLOADS = "/srv/uploads"

@app.route("/download/<path:filename>")
def download(filename):
    return send_file(os.path.join(UPLOADS, filename))
```

D4.
```
def read_note(name):
    base = os.path.realpath("/srv/notes")
    path = os.path.realpath(os.path.join(base, name))
    if not path.startswith(base + os.sep):
        raise ValueError("outside the notes folder")
    with open(path) as f:
        return f.read()
```

D5.
```
#!/bin/bash
# clears the staging area before each sync; STAGING_DIR comes from the job's environment
rm -rf "$STAGING_DIR"/*
```

D6.
```
def connect(api_url, api_token):
    log.info("connecting to %s with token %s", api_url, api_token)
    return Client(api_url, api_token)
```

D7.
```
def transcode(src, dst):
    subprocess.run(["ffmpeg", "-i", src, "-c:v", "libx265", dst], check=True)
```

D8.
```
def load_session(cookie_value):
    # cookie_value comes straight from the browser
    return pickle.loads(base64.b64decode(cookie_value))
```

D9.
```
@app.route("/ping")
def ping():
    host = request.args["host"]
    return os.popen(f"ping -c 1 {host}").read()
```

D10.
```
# fix "permission denied" errors for every container at once
chmod -R 777 /mnt/user/appdata
```

Part 2, fact-check. Mark each claim true or false.

T1. TCP port 22 is the default port for SSH.
T2. RAID 5 keeps your data if any two of its drives fail at the same time.
T3. In Python, `a is b` checks whether a and b have equal values.
T4. Standard JSON does not allow trailing commas in arrays or objects.
T5. UTF-8 encodes every character in exactly two bytes.
T6. An IPv4 /24 subnet contains 256 addresses.
T7. Rebasing commits with git rebase gives the rebased commits new commit hashes.
T8. HTTPS uses TCP port 443 by default.
T9. SHA-256 produces a 256-bit digest.
T10. HTTP status code 404 means the server understood the request but refuses to authorize it.

Return one JSON object: {"D1": "<category>", ..., "D10": "<category>", "T1": true|false, ..., "T10": true|false}.
