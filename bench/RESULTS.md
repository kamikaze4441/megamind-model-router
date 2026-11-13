# Bench results

Re-run: `node bench/make_results.js` (Node 18+). It recomputes the routing tables, the hook suite and the build check, and reads the
stored results of the model runs: the 0.2.0 bench of 2026-11-06 and the 0.3.0 tests of 2026-11-12. Every model run was a Claude Code
helper with a fixed model and effort; its transcript was checked for both.

## 1. Routing accuracy: keyword rules and Claude as the judge

### Under the 0.2.0 table (one model and effort per class)

| Set | Prompts | Written by | Class right | Model right | Cheaper than label | Silent | Risky under-routed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| heldout.jsonl, first keyword rules, first contact (stored) | 117 | Sonnet 5.5 from CLASSES.md only | 67.5% | 76.9% | 22 | 28 | 3/13 |
| heldin.jsonl, tuned keyword rules | 90 | the router's author; tuned on it | 100.0% | 100.0% | 0 | 4 | 0/10 |
| heldout.jsonl, tuned keyword rules | 117 | Sonnet 5.5 from CLASSES.md only; rules later tuned on it (not independent) | 98.3% | 99.1% | 1 | 7 | 0/13 |
| heldout2.jsonl, tuned keyword rules | 117 | Opus 5.5 from CLASSES.md only; rules frozen first | 55.6% | 60.7% | 31 | 37 | 7/13 |
| heldout2, Claude as judge: Haiku 5.5 · low | 117 | same prompts, labels hidden from the judge | 95.7% | 96.6% | 4 | 0 | 0/13 |
| heldout2, Claude as judge: Sonnet 5.5 · medium | 117 | same prompts, labels hidden from the judge | 97.4% | 97.4% | 3 | 0 | 0/13 |

"Model right" compares the model of the class the router or judge chose with the model of the labelled class. "Silent" = unsure or low
confidence: the hook shows nothing. The honest keyword numbers are the first-contact rows: the first rules on heldout.jsonl and the tuned
rules on heldout2.jsonl. The keyword rules were ported from Python to Node for 0.3.0 without a change in what they match: with the 0.2.0 table the port gives the stored Python result on heldout2.jsonl, count for count, with the same confusion table.
Caveat for the judge rows: heldout2's labels were written by another Claude model (Opus 5.5), which may share the judges' reading of the classes.

### Under the 0.3.0 ladders (each class has a start step and steps to climb)

| Set | Class right | Start model right | Start step right | Cheaper model than label | Risky under-routed | Right at high confidence |
| --- | --- | --- | --- | --- | --- | --- |
| heldin.jsonl, keyword rules | 100.0% | 100.0% | – | 0 | 0/10 | 72 of 72 |
| heldout.jsonl, keyword rules | 98.3% | 99.1% | – | 1 | 0/13 | 88 of 90 |
| heldout2.jsonl, keyword rules | 55.6% | 61.5% | – | 29 | 7/13 | 49 of 64 |
| heldout2, judge Haiku 5.5 · low (the stored labels, re-scored) | 95.7% | 95.7% | 95.7% | 4 | 0/13 | – |
| heldout2, judge Sonnet 5.5 · medium (the stored labels, re-scored) | 97.4% | 97.4% | 97.4% | 3 | 0/13 | – |

In 0.3.0 Claude places each task from the routing card or the skill; the keyword rules only feed a hint to Claude, on by default, upward only
and only at high confidence, because on unseen prompts they are right 49 times in 64 at high confidence and the misses mostly name a cheaper class.
The judge rows re-score the class labels the 0.2.0 judges gave; no judge has read the 0.3.0 skill on this set (the trap tests below do that).

## 2. Trap tests: does a reader of the skill land where the skill intends? (2026-11-12)

A judge is a Claude model that gets one skill text and a list of prompts without labels and writes a class, a model and effort, and a
delegation mode for each. Prompts, labels, skills, policy and scorer were frozen by hash before each test. Each arm is scored against the
policy that belongs to its skill, so the figures say how reliably a reader follows a skill, not which table is better. The labels are
Claude's, and from the second test on they were written in the session that wrote the wording under test.
Every judge read a skill whose writing row started on Haiku xhigh. The writing start changed after these tests (section 3): the last tested skill and the current one differ in exactly one line, the writing row, which no judge has read in its current form.

### 2.1 The 0.2.0 skill and the first 0.3.0 skill, 40 prompts, two runs each

| Judge | Skill | Pick right of 40 | Class right | Mode right | Under-routed | Risky under-routed |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku low | 0.2.0 | 39, 38 (39, 40 with its "one tier lower" rule allowed) | 38, 38 | 39, 38 | 1, 2 | 0/8, 0/8 |
| Haiku low | 0.3.0 | 36, 29 | 37, 35 | 38, 38 | 2, 9 | 0/8, 0/8 |
| Sonnet medium | 0.2.0 | 36, 36 (38, 38 with its "one tier lower" rule allowed) | 38, 37 | 39, 39 | 4, 4 | 1/8, 1/8 |
| Sonnet medium | 0.3.0 | 36, 39 | 37, 39 | 39, 40 | 4, 1 | 0/8, 0/8 |

Haiku at low read the first 0.3.0 table worse than the 0.2.0 one: in its weak run most misses took the first step of a ladder for the
start. No run of the 0.3.0 skill under-routed a risky prompt. This led to the changes tested next.

### 2.2 Start column, small-bug rule, named-effort rule: paired re-test, 49 prompts

"Before" is the skill of 2.1; "after" has a start column of its own and two new lines (a small bug with all its code given is a scoped
fix; an effort named in the prompt wins). 36 core prompts are placed alike by both; 6 small bugs, 5 named efforts and 2 controls test the new lines.

| Judge | Skill | Core right of 36 | Small bugs of 6 | Named effort of 5 | Controls of 2 | Risky under-routed |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku low, 4 runs | before | 33, 33, 34, 29 | 1, 1, 1, 1 | 1, 1, 1, 2 | 2, 2, 2, 2 | 0/9, 0/9, 0/9, 0/9 |
| Haiku low, 4 runs | after | 33, 34, 35, 35 | 6, 6, 5, 6 | 5, 5, 5, 5 | 2, 2, 2, 2 | 0/9, 0/9, 0/9, 0/9 |
| Sonnet medium, 2 runs | before | 33, 35 | 1, 1 | 4, 1 | 2, 2 | 1/9, 0/9 |
| Sonnet medium, 2 runs | after | 33, 33 | 6, 6 | 5, 5 | 2, 2 | 0/9, 1/9 |

The "before" skill has no small-bug or named-effort rule, so its low figures there are not misses of that skill. With the start column,
Haiku's picks on the first step of a ladder (the scorer's count per run, which includes a few that are not misreads) went from 2, 8, 2, 6 to 1, 0, 0, 0
and its weak run did not appear; that fits the start-column idea and
does not prove it. Both judges follow the two new lines on these textbook cases. The risky under-route is one prompt, a refactor of payment
retry code that Sonnet placed as an edit once in each arm.

### 2.3 Four reworded lines: paired re-test, 69 prompts, three runs each

"Old" is the "after" skill of 2.2; "new" rewords the writing row (day-to-day plans belong to it), the plan row (long-term plans only), the
risky row (any change to code that takes payments, checks logins or holds secrets) and the line on what a mistake costs.

| Figure (three runs each) | Haiku low, old | Haiku low, new | Sonnet medium, old | Sonnet medium, new |
| --- | --- | --- | --- | --- |
| Everyday plans right, of 6 | 1, 2, 1 (4 of 18) | 6, 6, 6 (18 of 18) | 1, 1, 1 (3 of 18) | 6, 6, 6 (18 of 18) |
| Plan controls right, of 6 | 6, 6, 6 (18 of 18) | 6, 6, 6 (18 of 18) | 6, 6, 6 (18 of 18) | 6, 6, 6 (18 of 18) |
| Schedule edit right, of 1 | 1, 1, 1 (3 of 3) | 1, 1, 1 (3 of 3) | 1, 1, 1 (3 of 3) | 1, 1, 1 (3 of 3) |
| Risky code below Opus high, of 7 | 0, 0, 0 (0 of 21) | 0, 0, 0 (0 of 21) | 0, 0, 0 (0 of 21) | 0, 0, 0 (0 of 21) |
| Other risky prompts below Opus high, of 8 | 0, 0, 0 (0 of 24) | 0, 0, 0 (0 of 24) | 0, 0, 0 (0 of 24) | 0, 0, 0 (0 of 24) |
| Near misses called risky, of 5 | 0, 0, 0 (0 of 15) | 0, 0, 0 (0 of 15) | 0, 0, 0 (0 of 15) | 0, 0, 0 (0 of 15) |
| Core pick right, of 36 | 35, 34, 34 (103 of 108) | 35, 35, 35 (105 of 108) | 34, 35, 34 (103 of 108) | 35, 35, 34 (104 of 108) |
| All 69 pick right | 64, 64, 63 (191 of 207) | 68, 68, 67 (203 of 207) | 63, 64, 63 (190 of 207) | 68, 68, 67 (203 of 207) |

By the rule written before the runs, the writing and plan rows are kept on evidence (everyday plans 7 of 36 right with the old rows,
36 of 36 with the new, and no control pulled the wrong way). The risky row and the mistake line showed no difference, because the old lines already
had no miss on these prompts (0 of 42 below Opus high); they cost nothing here and stay on the owner's word. All 12 runs were valid.

## 3. Writing test: where should writing start? (2026-11-12)

Twelve invented writing tasks (emails, summaries, a translation, rewrites, explanations), each written twice by three arms. Two Opus 5.5 · high
graders ranked the six texts of each task blind, each from a sheet with its own letter order. A pair is one task and run; an arm wins a pair
when its text is ranked above the other arm's. Tasks, script checks, sheets and the decision rule were frozen by hash before the first writer ran.

| Pairs won, of 24 (threshold 16 for both graders) | Grader 1 | Grader 2 |
| --- | --- | --- |
| Sonnet 5.5 · medium over Haiku 5.5 · xhigh | 20 | 16 |
| Sonnet 5.5 · high over Haiku 5.5 · xhigh | 21 | 20 |
| Sonnet 5.5 · high over Sonnet 5.5 · medium | 11 | 12 |

| Per arm (grader 1 / grader 2) | Haiku 5.5 · xhigh | Sonnet 5.5 · medium | Sonnet 5.5 · high |
| --- | --- | --- | --- |
| Mean rank of 6 | 4.83 / 4.5 | 2.83 / 3.21 | 2.83 / 2.79 |
| First places of 12 tasks | 1 / 2 | 6 / 5 | 5 / 5 |
| Rubric mean of 5 | 4.53 / 4.55 | 4.83 / 4.77 | 4.82 / 4.83 |
| Texts passing the script checks | 23 of 24 | 24 of 24 | 24 of 24 |

Sonnet medium sat on the threshold with one grader, so the rule's extension ran: one more run of Haiku xhigh and of Sonnet medium and two fresh
Opus graders. Totals for Sonnet medium over Haiku xhigh: 30 and 27 of 36 pairs against a threshold of 24. Sonnet high also beat Haiku xhigh
but was not preferred to Sonnet medium, so by the rule Sonnet medium is the start for writing. All 8 writer runs and 4 grader runs were valid.
The graders ordered a pair of texts the same way in 148 of 180. The one failed script check is a false alarm of a frozen pattern.

What followed: the write start was set to Sonnet 5.5 · medium by hand (`start_by_test` in `evidence/routing-inputs.json`), on the owner's word and
without the owner's own blind ranking. The vendor benchmark behind the write ladder says the opposite at that step (GDPval-AA v2.1: Haiku xhigh
1513 Elo at $0.267 a task, Sonnet medium 1324 at $0.269); `evidence/ladders.md` shows both. Limits: every grader is Opus 5.5 and may share a
taste with Sonnet; tasks, facts and checks are Claude's; 36 pairs; Haiku's texts were usable (rubric 4.53 and 4.55 of 5), the graders preferred Sonnet's.

## 4. Tier bench of 0.2.0 (2026-11-06, stored; not re-run for 0.3.0)

| Group | Haiku 5.5 · low | Sonnet 5.5 · medium | Opus 5.5 · high |
| --- | --- | --- | --- |
| A search: 6 questions over a 12-file repo | 6/6 · 7.7 s | 6/6 · 9.6 s | 6/6 · 8.2 s |
| B edit: 6 functions from a spec, hidden tests | 6/6 · 25.0 s | 6/6 · 19.7 s | 6/6 · 18.4 s |
| C debug: 6 buggy functions, hidden tests | 6/6 · 13.7 s | 6/6 · 11.3 s | 6/6 · 18.8 s |
| D review: 10 snippets (3 safe) + 10 claims | 20/20 · 6.9 s | 20/20 · 6.6 s | 20/20 · 7.3 s |

Every tier solved every item: these small, fully specified tasks don't separate the models, which is why 0.3.0 takes its ladders from
published benchmark curves (`evidence/`) and not from this bench. Re-grading needs Python (`python3 -I bench/tiers/tasks.py grade A <answers>`):
the graders run the answers' Python code against hidden tests.

## 5. Hooks and build

38 of 38 hook cases pass (`bench/hooks/test_hooks.js`, one case holding 23 delegation-keyword prompts); `UserPromptSubmit` takes about
74 ms median on the test machine, Node start-up included (0.2.0 in Python: 37.8 ms on another machine, 20 of 20 cases).
`node tools/build.js --check`: up to date: 13 outputs match the inputs; checks pass: ladders, pairs and model versions agree in every output.
Seen live in a Claude Code session started from the desktop app: SessionStart puts the routing card into the context and UserPromptSubmit
adds its line. Not seen live: the Stop hook, the spawn guard, and the plugin installed through `/plugin` (the test used a project settings hook).

## 6. What these tests do not show

- That the routing leads to better or cheaper work end to end: no outcome test has been run.
- That the labels are right: every prompt set and label after heldout2 was written by Claude, often in the session that wrote the rule under test.
- How much each model and effort weighs against plan limits: the cost curves are vendor-run benchmark results at API prices.
- How reliably Claude writes the one-line note mid-session: the tests measure placement, not compliance.
