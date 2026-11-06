Write six small Python functions. Use only the standard library. Each answer must be complete code that defines the function (imports included).

B1. Write `parse_duration(s: str) -> int` in Python 3.
Parse a duration like "1h30m15s", "45m", "2h", "90s" or "1h5s" into seconds.
Each unit (h, m, s) appears at most once and in the order h, m, s; numbers are non-negative integers; no spaces.
Raise ValueError for an empty string, unknown units, wrong order ("5m1h"), a repeated unit, a missing number, or decimals.

B2. Write `slugify(title: str) -> str` in Python 3.
Lowercase the title; remove accents (é→e, ñ→n, ü→u) using Unicode decomposition; turn every run of
characters that are not a-z or 0-9 into a single hyphen; strip leading and trailing hyphens; cut the result to at most
50 characters and strip a trailing hyphen again. If the result is empty, return "untitled".

B3. Write `merge_intervals(intervals: list[list[int]]) -> list[list[int]]` in Python 3.
Merge overlapping or touching intervals ([1,4] and [4,5]
become [1,5]). The input may be unsorted or empty; return the merged intervals sorted by start. Do not modify the input list
or its inner lists.

B4. Write `compare_versions(a: str, b: str) -> int` in Python 3.
Compare dotted numeric versions with an optional leading "v" or "V". Missing parts
count as 0 ("1.0" equals "1.0.0"); parts compare as numbers ("1.10" is newer than "1.9"). Return -1 if a is older, 0 if equal,
1 if a is newer.

B5. Write `split_csv_line(line: str) -> list[str]` in Python 3.
Split one CSV line on commas. A field may be wrapped in double quotes; inside
quotes, commas are literal and a doubled quote ("") stands for one quote character. Unquoted fields are returned exactly as
written (no trimming). An empty line returns [""].

B6. Write `chunk_by_size(items: list, max_bytes: int, size) -> list[list]` in Python 3.
Greedy chunking: go through items in order and add each to
the current chunk while the chunk's total size(item) stays at or under max_bytes; when the next item would push it over, start
a new chunk. An item larger than max_bytes goes alone in its own chunk. Never return an empty chunk; empty input returns [].

Return one JSON object: {"B1": "<python code>", ..., "B6": "<python code>"}.
