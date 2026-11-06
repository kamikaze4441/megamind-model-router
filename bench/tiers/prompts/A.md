You are given a small Python repository (line numbers on the left).

### app/main.py
```
  1| from app.config import settings
  2| from app.mailer import send_email
  3| from app.jobs import nightly_report
  4| 
  5| 
  6| def run():
  7|     # TODO: move startup checks into a health module
  8|     if settings.get("notify_on_start"):
  9|         send_email("ops@example.com", "started", "service is up")
 10|     nightly_report()
```

### app/config.py
```
  1| import os
  2| 
  3| DEFAULT_TIMEOUT = 45
  4| settings = {
  5|     "log_dir": os.environ.get("APP_LOG_DIR", "/var/log/app"),
  6|     "notify_on_start": True,
  7| }
```

### app/mailer.py
```
  1| import smtplib
  2| from app.retry import retry
  3| 
  4| 
  5| @retry(times=3)
  6| def send_email(to, subject, body):
  7|     with smtplib.SMTP("localhost") as s:
  8|         s.sendmail("noreply@example.com", [to], f"Subject: {subject}\n\n{body}")
```

### app/retry.py
```
  1| import functools
  2| import time
  3| 
  4| 
  5| def retry(times=2, delay=1.0):
  6|     def deco(fn):
  7|         @functools.wraps(fn)
  8|         def wrapper(*a, **kw):
  9|             for i in range(times):
 10|                 try:
 11|                     return fn(*a, **kw)
 12|                 except Exception:
 13|                     if i == times - 1:
 14|                         raise
 15|                     time.sleep(delay)
 16|         return wrapper
 17|     return deco
```

### app/jobs.py
```
  1| import requests
  2| from app.mailer import send_email
  3| from app.retry import retry
  4| from app.config import DEFAULT_TIMEOUT
  5| 
  6| 
  7| @retry(times=5)
  8| def fetch_stats(url):
  9|     return requests.get(url, timeout=DEFAULT_TIMEOUT).json()
 10| 
 11| 
 12| def nightly_report():
 13|     stats = fetch_stats("https://stats.example.com/daily")
 14|     # TODO: handle empty stats
 15|     send_email("team@example.com", "nightly", str(stats))
```

### app/webhooks.py
```
  1| import requests
  2| 
  3| 
  4| def post_slack(url, text):
  5|     # TODO(ops): rotate the webhook url
  6|     requests.post(url, json={"text": text}, timeout=10)
```

### app/cleanup.py
```
  1| import os
  2| import shutil
  3| import time
  4| from app.config import settings
  5| 
  6| 
  7| def purge_old_logs(days=30):
  8|     for name in os.listdir(settings["log_dir"]):
  9|         path = os.path.join(settings["log_dir"], name)
 10|         if os.path.getmtime(path) < time.time() - days * 86400:
 11|             os.remove(path)
 12| 
 13| 
 14| def wipe_tmp():
 15|     shutil.rmtree("/tmp/app-cache", ignore_errors=True)
```

### app/users.py
```
  1| from app.db import query
  2| from app.retry import retry
  3| 
  4| 
  5| @retry()
  6| def get_user(uid):
  7|     return query("SELECT * FROM users WHERE id = ?", (uid,))
  8| 
  9| 
 10| def deactivate(uid):
 11|     query("UPDATE users SET active = 0 WHERE id = ?", (uid,))
```

### app/db.py
```
  1| import sqlite3
  2| 
  3| DB_PATH = "/srv/app/app.db"
  4| 
  5| 
  6| def query(sql, params=()):
  7|     with sqlite3.connect(DB_PATH) as c:
  8|         return c.execute(sql, params).fetchall()
```

### scripts/backfill.py
```
  1| from app.users import deactivate
  2| from app.mailer import send_email
  3| 
  4| 
  5| def run(ids):
  6|     for uid in ids:
  7|         deactivate(uid)
  8|         send_email("audit@example.com", "deactivated", str(uid))
```

### scripts/export.py
```
  1| import csv
  2| import requests
  3| 
  4| 
  5| def export(url, out):
  6|     rows = requests.get(url, timeout=30).json()
  7|     with open(out, "w", newline="") as f:
  8|         csv.writer(f).writerows(rows)
```

### tests/test_mailer.py
```
  1| from unittest import mock
  2| from app import mailer
  3| 
  4| 
  5| def test_send_email_calls_smtp():
  6|     with mock.patch("smtplib.SMTP") as m:
  7|         mailer.send_email("a@b.c", "s", "b")  # TODO: assert on the message body
  8|         assert m.called
```

Answer from the files above only. Return one JSON object with these keys:
- "A1": sorted list of every file under app/ or scripts/ that calls send_email (exclude the file that defines it, and exclude tests/).
- "A2": {"file": file that defines DEFAULT_TIMEOUT, "value": its value as a number, "used_in": sorted list of the other files that use it}.
- "A3": sorted list of every TODO comment as "path:line".
- "A4": sorted list of the files that import the requests library.
- "A5": {"count": how many functions are decorated with @retry, "functions": sorted list as "path:function_name"}.
- "A6": {"key": the settings key for the log directory, "env_var": the environment variable that overrides it, "default": the default path}.
