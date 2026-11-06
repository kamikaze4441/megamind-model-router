"""Tier bench: four groups of graded tasks, one prompt per group, run on Haiku·low, Sonnet·medium and Opus·high.

  python3 -I tasks.py write              writes prompts/A.md … D.md
  python3 -I tasks.py grade A ans.json   prints the score for one answer file as JSON

A  search/extract  (router: Haiku 5.5 · low)    6 questions over a 12-file mini repo, exact answers
B  edit            (router: Sonnet 5.5 · medium) 6 small functions from a spec, hidden tests
C  debug           (router: Opus 5.5 · high)     6 buggy functions to fix, hidden tests
D  review          (router: Opus 5.5 · high)     10 code snippets (7 real issues, 3 safe decoys) + 10 claims to fact-check
"""
import json
import os
import subprocess
import sys
import tempfile
import textwrap

HERE = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------------------------------------------- A: search
REPO = {
"app/main.py": '''from app.config import settings
from app.mailer import send_email
from app.jobs import nightly_report


def run():
    # TODO: move startup checks into a health module
    if settings.get("notify_on_start"):
        send_email("ops@example.com", "started", "service is up")
    nightly_report()
''',
"app/config.py": '''import os

DEFAULT_TIMEOUT = 45
settings = {
    "log_dir": os.environ.get("APP_LOG_DIR", "/var/log/app"),
    "notify_on_start": True,
}
''',
"app/mailer.py": '''import smtplib
from app.retry import retry


@retry(times=3)
def send_email(to, subject, body):
    with smtplib.SMTP("localhost") as s:
        s.sendmail("noreply@example.com", [to], f"Subject: {subject}\\n\\n{body}")
''',
"app/retry.py": '''import functools
import time


def retry(times=2, delay=1.0):
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*a, **kw):
            for i in range(times):
                try:
                    return fn(*a, **kw)
                except Exception:
                    if i == times - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return deco
''',
"app/jobs.py": '''import requests
from app.mailer import send_email
from app.retry import retry
from app.config import DEFAULT_TIMEOUT


@retry(times=5)
def fetch_stats(url):
    return requests.get(url, timeout=DEFAULT_TIMEOUT).json()


def nightly_report():
    stats = fetch_stats("https://stats.example.com/daily")
    # TODO: handle empty stats
    send_email("team@example.com", "nightly", str(stats))
''',
"app/webhooks.py": '''import requests


def post_slack(url, text):
    # TODO(ops): rotate the webhook url
    requests.post(url, json={"text": text}, timeout=10)
''',
"app/cleanup.py": '''import os
import shutil
import time
from app.config import settings


def purge_old_logs(days=30):
    for name in os.listdir(settings["log_dir"]):
        path = os.path.join(settings["log_dir"], name)
        if os.path.getmtime(path) < time.time() - days * 86400:
            os.remove(path)


def wipe_tmp():
    shutil.rmtree("/tmp/app-cache", ignore_errors=True)
''',
"app/users.py": '''from app.db import query
from app.retry import retry


@retry()
def get_user(uid):
    return query("SELECT * FROM users WHERE id = ?", (uid,))


def deactivate(uid):
    query("UPDATE users SET active = 0 WHERE id = ?", (uid,))
''',
"app/db.py": '''import sqlite3

DB_PATH = "/srv/app/app.db"


def query(sql, params=()):
    with sqlite3.connect(DB_PATH) as c:
        return c.execute(sql, params).fetchall()
''',
"scripts/backfill.py": '''from app.users import deactivate
from app.mailer import send_email


def run(ids):
    for uid in ids:
        deactivate(uid)
        send_email("audit@example.com", "deactivated", str(uid))
''',
"scripts/export.py": '''import csv
import requests


def export(url, out):
    rows = requests.get(url, timeout=30).json()
    with open(out, "w", newline="") as f:
        csv.writer(f).writerows(rows)
''',
"tests/test_mailer.py": '''from unittest import mock
from app import mailer


def test_send_email_calls_smtp():
    with mock.patch("smtplib.SMTP") as m:
        mailer.send_email("a@b.c", "s", "b")  # TODO: assert on the message body
        assert m.called
''',
}


def a_expected():
    todos = []
    for path, text in REPO.items():
        for i, line in enumerate(text.splitlines(), 1):
            if "TODO" in line:
                todos.append(f"{path}:{i}")
    return {
        "A1": sorted(["app/main.py", "app/jobs.py", "scripts/backfill.py"]),
        "A2": {"file": "app/config.py", "value": 45, "used_in": ["app/jobs.py"]},
        "A3": sorted(todos),
        "A4": sorted(["app/jobs.py", "app/webhooks.py", "scripts/export.py"]),
        "A5": {"count": 3, "functions": sorted(["app/mailer.py:send_email", "app/jobs.py:fetch_stats", "app/users.py:get_user"])},
        "A6": {"key": "log_dir", "env_var": "APP_LOG_DIR", "default": "/var/log/app"},
    }


def a_prompt():
    files = []
    for path, text in REPO.items():
        numbered = "\n".join(f"{i:>3}| {l}" for i, l in enumerate(text.splitlines(), 1))
        files.append(f"### {path}\n```\n{numbered}\n```")
    return ("You are given a small Python repository (line numbers on the left).\n\n" + "\n\n".join(files) + """

Answer from the files above only. Return one JSON object with these keys:
- "A1": sorted list of every file under app/ or scripts/ that calls send_email (exclude the file that defines it, and exclude tests/).
- "A2": {"file": file that defines DEFAULT_TIMEOUT, "value": its value as a number, "used_in": sorted list of the other files that use it}.
- "A3": sorted list of every TODO comment as "path:line".
- "A4": sorted list of the files that import the requests library.
- "A5": {"count": how many functions are decorated with @retry, "functions": sorted list as "path:function_name"}.
- "A6": {"key": the settings key for the log directory, "env_var": the environment variable that overrides it, "default": the default path}.
""")


def grade_a(ans):
    exp = a_expected()
    res = {}
    norm = lambda v: sorted(str(x).strip() for x in (v or []))
    res["A1"] = norm(ans.get("A1")) == exp["A1"]
    a2 = ans.get("A2") or {}
    res["A2"] = (str(a2.get("file", "")).strip() == "app/config.py" and str(a2.get("value")).strip() in ("45", "45.0")
                 and norm(a2.get("used_in")) == exp["A2"]["used_in"])
    res["A3"] = norm(ans.get("A3")) == exp["A3"]
    res["A4"] = norm(ans.get("A4")) == exp["A4"]
    a5 = ans.get("A5") or {}
    res["A5"] = str(a5.get("count")).strip() == "3" and norm(a5.get("functions")) == exp["A5"]["functions"]
    a6 = ans.get("A6") or {}
    res["A6"] = (str(a6.get("key", "")).strip().strip('"') == "log_dir" and str(a6.get("env_var", "")).strip() == "APP_LOG_DIR"
                 and str(a6.get("default", "")).strip() == "/var/log/app")
    return res


# ----------------------------------------------------------------------------- B: edit (write from a spec)
B_SPECS = {
"B1": ("parse_duration(s: str) -> int", '''Parse a duration like "1h30m15s", "45m", "2h", "90s" or "1h5s" into seconds.
Each unit (h, m, s) appears at most once and in the order h, m, s; numbers are non-negative integers; no spaces.
Raise ValueError for an empty string, unknown units, wrong order ("5m1h"), a repeated unit, a missing number, or decimals.'''),
"B2": ("slugify(title: str) -> str", '''Lowercase the title; remove accents (é→e, ñ→n, ü→u) using Unicode decomposition; turn every run of
characters that are not a-z or 0-9 into a single hyphen; strip leading and trailing hyphens; cut the result to at most
50 characters and strip a trailing hyphen again. If the result is empty, return "untitled".'''),
"B3": ("merge_intervals(intervals: list[list[int]]) -> list[list[int]]", '''Merge overlapping or touching intervals ([1,4] and [4,5]
become [1,5]). The input may be unsorted or empty; return the merged intervals sorted by start. Do not modify the input list
or its inner lists.'''),
"B4": ("compare_versions(a: str, b: str) -> int", '''Compare dotted numeric versions with an optional leading "v" or "V". Missing parts
count as 0 ("1.0" equals "1.0.0"); parts compare as numbers ("1.10" is newer than "1.9"). Return -1 if a is older, 0 if equal,
1 if a is newer.'''),
"B5": ("split_csv_line(line: str) -> list[str]", '''Split one CSV line on commas. A field may be wrapped in double quotes; inside
quotes, commas are literal and a doubled quote ("") stands for one quote character. Unquoted fields are returned exactly as
written (no trimming). An empty line returns [""].'''),
"B6": ("chunk_by_size(items: list, max_bytes: int, size) -> list[list]", '''Greedy chunking: go through items in order and add each to
the current chunk while the chunk's total size(item) stays at or under max_bytes; when the next item would push it over, start
a new chunk. An item larger than max_bytes goes alone in its own chunk. Never return an empty chunk; empty input returns [].'''),
}
B_TESTS = {
"B1": '''
assert parse_duration("1h30m15s") == 5415
assert parse_duration("45m") == 2700
assert parse_duration("2h") == 7200
assert parse_duration("90s") == 90
assert parse_duration("1h5s") == 3605
assert parse_duration("0s") == 0
for bad in ["", "5m1h", "1h1h", "h", "10x", "1.5h", " 1h", "1h 5m", "m5"]:
    try:
        parse_duration(bad)
    except ValueError:
        pass
    else:
        raise AssertionError("no ValueError for %r" % bad)
''',
"B2": '''
assert slugify("Hello, World!") == "hello-world"
assert slugify("Crème brûlée") == "creme-brulee"
assert slugify("  --A__B--  ") == "a-b"
assert slugify("!!!") == "untitled"
assert slugify("a" * 60) == "a" * 50
assert slugify("word " * 20) == ("word-" * 10)[:50].rstrip("-")
assert slugify("Ñandú über") == "nandu-uber"
assert slugify("x" * 49 + " y") == "x" * 49
''',
"B3": '''
assert merge_intervals([[1,3],[2,6],[8,10],[15,18]]) == [[1,6],[8,10],[15,18]]
assert merge_intervals([[1,4],[4,5]]) == [[1,5]]
assert merge_intervals([]) == []
assert merge_intervals([[5,7],[1,2]]) == [[1,2],[5,7]]
assert merge_intervals([[1,10],[2,3]]) == [[1,10]]
src = [[3,4],[1,3]]
out = merge_intervals(src)
assert out == [[1,4]] and src == [[3,4],[1,3]]
inner = [[1,2],[2,3]]
merge_intervals(inner)
assert inner == [[1,2],[2,3]]
''',
"B4": '''
assert compare_versions("1.10.0", "1.9.9") == 1
assert compare_versions("v2.0", "2") == 0
assert compare_versions("1.0.0", "1.0.1") == -1
assert compare_versions("V3.1", "v3.1.0.0") == 0
assert compare_versions("10", "9.99") == 1
assert compare_versions("0.9", "0.10") == -1
''',
"B5": '''
assert split_csv_line('a,"b,c",d') == ['a', 'b,c', 'd']
assert split_csv_line('"he said ""hi""",x') == ['he said "hi"', 'x']
assert split_csv_line('a,,b') == ['a', '', 'b']
assert split_csv_line('') == ['']
assert split_csv_line('"",x') == ['', 'x']
assert split_csv_line(' a , b') == [' a ', ' b']
assert split_csv_line('a,') == ['a', '']
''',
"B6": '''
L = len
assert chunk_by_size(["aa","bb","cc"], 4, L) == [["aa","bb"],["cc"]]
assert chunk_by_size(["aaaaa","b"], 4, L) == [["aaaaa"],["b"]]
assert chunk_by_size([], 5, L) == []
assert chunk_by_size(["a","b","c"], 10, L) == [["a","b","c"]]
assert chunk_by_size(["aaa","bb","aaaaaa","c"], 5, L) == [["aaa","bb"],["aaaaaa"],["c"]]
assert chunk_by_size(["b","aaaaaa"], 5, L) == [["b"],["aaaaaa"]]
''',
}


def b_prompt():
    parts = [f"{k}. Write `{sig}` in Python 3.\n{textwrap.dedent(spec)}" for k, (sig, spec) in B_SPECS.items()]
    return ("Write six small Python functions. Use only the standard library. Each answer must be complete code that "
            "defines the function (imports included).\n\n" + "\n\n".join(parts) +
            '\n\nReturn one JSON object: {"B1": "<python code>", ..., "B6": "<python code>"}.\n')


# ----------------------------------------------------------------------------- C: debug (fix the bug)
C_BUGGY = {
"C1": ("first_index returns the wrong index on lists with repeated values.", '''def first_index(a, target):
    """Return the index of the FIRST occurrence of target in the sorted list a, or -1 if absent."""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
'''),
"C2": ("Customers say the split amounts don't add up to the bill.", '''def split_bill(total, n):
    """Split total dollars (a float such as 100.0) among n people. Return n amounts in dollars, each rounded to cents,
    that add up exactly to total; when it doesn't divide evenly, the first people pay the extra cents."""
    share = round(total / n, 2)
    return [share] * n
'''),
"C3": ("Tags from one call show up in later calls, and callers' lists change.", '''def add_tag(tag, tags=[]):
    """Return a NEW list made of tags plus tag (no duplicates). Calls must not affect each other or the caller's list."""
    if tag not in tags:
        tags.append(tag)
    return tags
'''),
"C4": ("Around daylight-saving changes the result is an hour off.", '''from datetime import timedelta, timezone
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")

def next_day_same_time(dt):
    """dt is an aware datetime in America/New_York. Return the same wall-clock time on the next calendar day,
    in America/New_York."""
    utc = dt.astimezone(timezone.utc)
    return (utc + timedelta(hours=24)).astimezone(NY)
'''),
"C5": ("Some negative numbers survive.", '''def remove_negatives(nums):
    """Remove every negative number from nums IN PLACE and return the same list object."""
    for x in nums:
        if x < 0:
            nums.remove(x)
    return nums
'''),
"C6": ("Page counts are off.", '''def page_count(total_items, per_page):
    """Number of pages needed to show total_items with per_page items per page. Zero items need zero pages."""
    return total_items // per_page + 1
'''),
}
C_TESTS = {
"C1": '''
assert first_index([1,2,2,2,3], 2) == 1
assert first_index([5,5,5,5], 5) == 0
assert first_index([1,3], 2) == -1
assert first_index([], 1) == -1
big = [0]*1000 + [1]*1000 + [2]*7
assert first_index(big, 1) == 1000 and first_index(big, 2) == 2000 and first_index(big, 0) == 0
''',
"C2": '''
def cents(xs): return [round(x * 100) for x in xs]
r = split_bill(100.0, 3); assert cents(r) == [3334, 3333, 3333], r
r = split_bill(0.05, 2); assert cents(r) == [3, 2], r
r = split_bill(10.0, 4); assert cents(r) == [250] * 4, r
r = split_bill(19.99, 7); assert sum(cents(r)) == 1999 and max(cents(r)) - min(cents(r)) <= 1 and cents(r) == sorted(cents(r), reverse=True), r
assert all(abs(x * 100 - round(x * 100)) < 1e-6 for x in split_bill(19.99, 7))
''',
"C3": '''
assert add_tag("a") == ["a"]
assert add_tag("b") == ["b"]
existing = ["x"]
out = add_tag("y", existing)
assert out == ["x", "y"] and existing == ["x"]
assert add_tag("x", ["x"]) == ["x"]
''',
"C4": '''
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
NY_ = ZoneInfo("America/New_York")
def ref(dt):
    return (dt.replace(tzinfo=None) + timedelta(days=1)).replace(tzinfo=NY_)
for args in [(2026,3,7,10,0), (2026,10,31,10,0), (2026,6,1,23,30), (2026,3,7,1,30)]:
    dt = datetime(*args, tzinfo=NY_)
    got, want = next_day_same_time(dt), ref(dt)
    assert got.replace(tzinfo=None) == want.replace(tzinfo=None), (dt, got, want)
    assert got.utcoffset() == want.utcoffset(), (dt, got, want)
''',
"C5": '''
a = [1, -2, -3, 4]
r = remove_negatives(a)
assert r == [1, 4] and r is a and a == [1, 4]
b = [-1, -1, -1]
assert remove_negatives(b) == [] and b == []
assert remove_negatives([]) == []
c = [0, -5, 5, -6, -7, 8]
assert remove_negatives(c) == [0, 5, 8]
''',
"C6": '''
assert page_count(0, 10) == 0
assert page_count(10, 10) == 1
assert page_count(11, 10) == 2
assert page_count(1, 10) == 1
assert page_count(100, 7) == 15
''',
}


def c_prompt():
    parts = [f"{k}. Bug report: {report}\n```python\n{code}```" for k, (report, code) in C_BUGGY.items()]
    return ("Each function below has a bug. Find it and return the complete corrected code for each one (same function "
            "name and signature, imports included, standard library only).\n\n" + "\n\n".join(parts) +
            '\n\nReturn one JSON object: {"C1": "<python code>", ..., "C6": "<python code>"}.\n')


def run_tests(code, tests, timeout=20):
    """Run model-written code plus hidden tests in a separate, isolated Python process."""
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "t.py")
        with open(p, "w", encoding="utf-8") as f:
            f.write(code + "\n\n# ---- hidden tests\n" + tests)
        try:
            r = subprocess.run([sys.executable, "-I", p], cwd=d, capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            return False, "timeout"
        return r.returncode == 0, (r.stderr.strip().splitlines() or [""])[-1][:200]


def grade_code(ans, tests):
    res, notes = {}, {}
    for k, t in tests.items():
        code = ans.get(k)
        if not isinstance(code, str) or not code.strip():
            res[k], notes[k] = False, "no code"
            continue
        ok, why = run_tests(code, t)
        res[k] = ok
        if not ok:
            notes[k] = why
    return res, notes


# ----------------------------------------------------------------------------- D: review and fact-check
D_SNIPPETS = {
"D1": ("sql_injection", '''def find_user(conn, name):
    return conn.execute(f"SELECT * FROM users WHERE name = '{name}'").fetchall()'''),
"D2": ("none", '''def find_order(conn, order_id):
    return conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()'''),
"D3": ("path_traversal", '''UPLOADS = "/srv/uploads"

@app.route("/download/<path:filename>")
def download(filename):
    return send_file(os.path.join(UPLOADS, filename))'''),
"D4": ("none", '''def read_note(name):
    base = os.path.realpath("/srv/notes")
    path = os.path.realpath(os.path.join(base, name))
    if not path.startswith(base + os.sep):
        raise ValueError("outside the notes folder")
    with open(path) as f:
        return f.read()'''),
"D5": ("unsafe_deletion", '''#!/bin/bash
# clears the staging area before each sync; STAGING_DIR comes from the job's environment
rm -rf "$STAGING_DIR"/*'''),
"D6": ("secret_in_logs", '''def connect(api_url, api_token):
    log.info("connecting to %s with token %s", api_url, api_token)
    return Client(api_url, api_token)'''),
"D7": ("none", '''def transcode(src, dst):
    subprocess.run(["ffmpeg", "-i", src, "-c:v", "libx265", dst], check=True)'''),
"D8": ("unsafe_deserialization", '''def load_session(cookie_value):
    # cookie_value comes straight from the browser
    return pickle.loads(base64.b64decode(cookie_value))'''),
"D9": ("command_injection", '''@app.route("/ping")
def ping():
    host = request.args["host"]
    return os.popen(f"ping -c 1 {host}").read()'''),
"D10": ("insecure_permissions", '''# fix "permission denied" errors for every container at once
chmod -R 777 /mnt/user/appdata'''),
}
D_CATEGORIES = ["sql_injection", "path_traversal", "command_injection", "secret_in_logs", "unsafe_deletion",
                "insecure_permissions", "unsafe_deserialization", "none"]
D_CLAIMS = {
"T1": ("TCP port 22 is the default port for SSH.", True),
"T2": ("RAID 5 keeps your data if any two of its drives fail at the same time.", False),
"T3": ("In Python, `a is b` checks whether a and b have equal values.", False),
"T4": ("Standard JSON does not allow trailing commas in arrays or objects.", True),
"T5": ("UTF-8 encodes every character in exactly two bytes.", False),
"T6": ("An IPv4 /24 subnet contains 256 addresses.", True),
"T7": ("Rebasing commits with git rebase gives the rebased commits new commit hashes.", True),
"T8": ("HTTPS uses TCP port 443 by default.", True),
"T9": ("SHA-256 produces a 256-bit digest.", True),
"T10": ("HTTP status code 404 means the server understood the request but refuses to authorize it.", False),
}


def d_prompt():
    snips = [f"{k}.\n```\n{code}\n```" for k, (_, code) in D_SNIPPETS.items()]
    claims = [f"{k}. {text}" for k, (text, _) in D_CLAIMS.items()]
    return ("Part 1, code review. For each snippet, name its single most serious problem using exactly one of these "
            f"categories: {', '.join(D_CATEGORIES)}. Use \"none\" when the snippet is safe as written. Some are safe.\n\n"
            + "\n\n".join(snips) +
            "\n\nPart 2, fact-check. Mark each claim true or false.\n\n" + "\n".join(claims) +
            '\n\nReturn one JSON object: {"D1": "<category>", ..., "D10": "<category>", "T1": true|false, ..., "T10": true|false}.\n')


def grade_d(ans):
    res, fp_code, fp_claims, missed = {}, 0, 0, 0
    for k, (cat, _) in D_SNIPPETS.items():
        got = str(ans.get(k, "")).strip().lower()
        res[k] = got == cat
        if cat == "none" and got != "none":
            fp_code += 1
        if cat != "none" and got == "none":
            missed += 1
    for k, (_, truth) in D_CLAIMS.items():
        got = ans.get(k)
        if isinstance(got, str):
            got = got.strip().lower() == "true"
        res[k] = got is truth
        if truth and got is False:
            fp_claims += 1
    return res, {"safe_code_flagged": fp_code, "real_issue_missed": missed, "true_claims_marked_false": fp_claims}


# ----------------------------------------------------------------------------- CLI
PROMPTS = {"A": a_prompt, "B": b_prompt, "C": c_prompt, "D": d_prompt}


def grade(group, ans):
    if group == "A":
        r, extra = grade_a(ans), {}
    elif group == "B":
        r, extra = grade_code(ans, B_TESTS)
    elif group == "C":
        r, extra = grade_code(ans, C_TESTS)
    else:
        r, extra = grade_d(ans)
    return {"group": group, "score": sum(bool(v) for v in r.values()), "of": len(r), "items": r, "notes": extra}


def main():
    if sys.argv[1] == "write":
        os.makedirs(os.path.join(HERE, "prompts"), exist_ok=True)
        for g, fn in PROMPTS.items():
            with open(os.path.join(HERE, "prompts", f"{g}.md"), "w", encoding="utf-8") as f:
                f.write(fn())
        print("prompts written")
    elif sys.argv[1] == "grade":
        with open(sys.argv[3], encoding="utf-8") as f:
            ans = json.load(f)
        print(json.dumps(grade(sys.argv[2], ans)))
    elif sys.argv[1] == "selftest":
        # reference answers must score full marks
        ref_b = {
            "B1": "import re\ndef parse_duration(s):\n    m = re.fullmatch(r'(?:(\\d+)h)?(?:(\\d+)m)?(?:(\\d+)s)?', s)\n    if not s or not m or not any(m.groups()):\n        raise ValueError(s)\n    h, mi, se = (int(x) if x else 0 for x in m.groups())\n    return h*3600 + mi*60 + se\n",
            "B2": "import re, unicodedata\ndef slugify(t):\n    t = unicodedata.normalize('NFKD', t.lower()).encode('ascii','ignore').decode()\n    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:50].rstrip('-')\n    return t or 'untitled'\n",
            "B3": "def merge_intervals(iv):\n    out = []\n    for a, b in sorted([list(x) for x in iv]):\n        if out and a <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], b)\n        else:\n            out.append([a, b])\n    return out\n",
            "B4": "def compare_versions(a, b):\n    p = lambda v: [int(x) for x in v.lstrip('vV').split('.')]\n    x, y = p(a), p(b)\n    n = max(len(x), len(y)); x += [0]*(n-len(x)); y += [0]*(n-len(y))\n    return (x > y) - (x < y)\n",
            "B5": "import csv\ndef split_csv_line(line):\n    return next(csv.reader([line])) if line else ['']\n",
            "B6": "def chunk_by_size(items, max_bytes, size):\n    out, cur, tot = [], [], 0\n    for it in items:\n        s = size(it)\n        if cur and tot + s > max_bytes:\n            out.append(cur); cur, tot = [], 0\n        cur.append(it); tot += s\n    if cur: out.append(cur)\n    return out\n",
        }
        ref_c = {
            "C1": "def first_index(a, t):\n    lo, hi, ans = 0, len(a)-1, -1\n    while lo <= hi:\n        m = (lo+hi)//2\n        if a[m] == t: ans, hi = m, m-1\n        elif a[m] < t: lo = m+1\n        else: hi = m-1\n    return ans\n",
            "C2": "def split_bill(total, n):\n    c = round(total*100); b, e = divmod(c, n)\n    return [(b + (1 if i < e else 0))/100 for i in range(n)]\n",
            "C3": "def add_tag(tag, tags=None):\n    out = list(tags or [])\n    if tag not in out: out.append(tag)\n    return out\n",
            "C4": "from datetime import timedelta\nfrom zoneinfo import ZoneInfo\nNY = ZoneInfo('America/New_York')\ndef next_day_same_time(dt):\n    return (dt.replace(tzinfo=None) + timedelta(days=1)).replace(tzinfo=NY)\n",
            "C5": "def remove_negatives(nums):\n    nums[:] = [x for x in nums if x >= 0]\n    return nums\n",
            "C6": "def page_count(t, p):\n    return -(-t // p)\n",
        }
        ref_d = {k: v[0] for k, v in D_SNIPPETS.items()} | {k: v[1] for k, v in D_CLAIMS.items()}
        buggy_c = {k: v[1] for k, v in C_BUGGY.items()}
        for g, a in (("A", a_expected()), ("B", ref_b), ("C", ref_c), ("D", ref_d), ("C-buggy", buggy_c)):
            r = grade(g.split("-")[0], a)
            print(g, f"{r['score']}/{r['of']}", r["notes"] if r["notes"] else "")


if __name__ == "__main__":
    main()
