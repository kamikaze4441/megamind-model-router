Each function below has a bug. Find it and return the complete corrected code for each one (same function name and signature, imports included, standard library only).

C1. Bug report: first_index returns the wrong index on lists with repeated values.
```python
def first_index(a, target):
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
```

C2. Bug report: Customers say the split amounts don't add up to the bill.
```python
def split_bill(total, n):
    """Split total dollars (a float such as 100.0) among n people. Return n amounts in dollars, each rounded to cents,
    that add up exactly to total; when it doesn't divide evenly, the first people pay the extra cents."""
    share = round(total / n, 2)
    return [share] * n
```

C3. Bug report: Tags from one call show up in later calls, and callers' lists change.
```python
def add_tag(tag, tags=[]):
    """Return a NEW list made of tags plus tag (no duplicates). Calls must not affect each other or the caller's list."""
    if tag not in tags:
        tags.append(tag)
    return tags
```

C4. Bug report: Around daylight-saving changes the result is an hour off.
```python
from datetime import timedelta, timezone
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")

def next_day_same_time(dt):
    """dt is an aware datetime in America/New_York. Return the same wall-clock time on the next calendar day,
    in America/New_York."""
    utc = dt.astimezone(timezone.utc)
    return (utc + timedelta(hours=24)).astimezone(NY)
```

C5. Bug report: Some negative numbers survive.
```python
def remove_negatives(nums):
    """Remove every negative number from nums IN PLACE and return the same list object."""
    for x in nums:
        if x < 0:
            nums.remove(x)
    return nums
```

C6. Bug report: Page counts are off.
```python
def page_count(total_items, per_page):
    """Number of pages needed to show total_items with per_page items per page. Zero items need zero pages."""
    return total_items // per_page + 1
```

Return one JSON object: {"C1": "<python code>", ..., "C6": "<python code>"}.
