# Writing test: setup and decision rule

Written and frozen by hash on 2026-11-12, before any writer ran. Design: `model-router/NOTES.md`, "Writing test design".

## Question
Should writing start at Haiku 5.5 xhigh (the computed start), at Sonnet 5.5 medium (the 0.2.0 pick) or at Sonnet 5.5 high?

## Setup
- Twelve tasks in `tasks/`, two of each kind: apology email from a fact list (t01, t07), summary in 120 to 150 words of a long text (t02 on a 1,800-word report, t08 on a 1,693-word article), translation English to German of a notice of about 200 words (t03, t09), explanation for a layperson (t04, t10), forum post from messy notes (t05, t11), rewrite at half length that keeps five facts (t06, t12). All texts and facts were invented for this test by Claude (Fable 5.2) in one session.
- Six writer runs, each a `general-purpose` helper in its own folder `run/wNN` holding only `task.md`; it writes `01.txt` to `12.txt` there. Arms and run numbers are fixed in `private/runs.tsv` before launch: w01 Haiku xhigh run 1, w02 Sonnet medium run 1, w03 Sonnet high run 1, w04 Haiku xhigh run 2, w05 Sonnet high run 2, w06 Sonnet medium run 2. w01 goes alone and is checked before the others start.
- Script checks (`checks.js`, `check.js`): the file is there, word limits, required facts (numbers, names, dates, with format variants), forbidden content. Self-test: `node check.js --selftest`.
- Blind sheets (`shuffle.js`): for each of three readers (grader 1, grader 2, the owner) an independent seeded letter order per task. Keys go to `private/`, never into a sheet folder. Each text's script word count is in its heading; script check results are not shown to graders.
- Two graders, Opus 5.5 high, `general-purpose` helpers, each reads only its own `sheets/gN/sheet.md` and writes `grades.json`: per task a strict rank of the six texts and five scores from 1 to 5 (facts, limits, clear, tone, filler).

## Valid runs
- A writer run is invalid, and repeated once, if its transcript shows another model or effort than asked for, a call to the advisor, to a helper or to any tool other than Read of its own `task.md` and Write of its own `NN.txt` files, or if any of the twelve files is missing or empty. A file written twice is noted, not invalid.
- A grader run is invalid, and repeated once, if its transcript shows another model or effort, any tool call other than Read of its own sheet and Write of its own `grades.json`, or if `decide.js` rejects the file (a task missing, a rank that is not every letter once, a score missing or outside 1 to 5).
- Nothing else is repeated, except as the borderline rule below says.

## Decision rule
- A pair is task t and run r: the Sonnet arm's run r text against Haiku xhigh's run r text for the same task. Twelve tasks and two runs give 24 pairs per Sonnet arm.
- Two countings per grader. By rank: the Sonnet text wins the pair if that grader ranks it above the Haiku text. With script checks: if exactly one of the two texts fails a script check, the failing text loses the pair; otherwise the rank decides.
- A Sonnet arm wins only if it takes at least 16 of the 24 pairs for each grader separately under both countings (so the lowest of the four counts is 16 or more). Otherwise Haiku xhigh stays the start.
- If both Sonnet arms win, Sonnet medium is the candidate, unless Sonnet high beats Sonnet medium by the same rule (16 of 24, both graders, both countings).
- Borderline: if for a Sonnet arm the lowest of the four counts is 15 or 16, one more writer run of Haiku xhigh and of that arm is made and graded by two fresh Opus high graders on a sheet of the new texts; the rule is then applied to all 36 pairs with a threshold of 24, and that result is final.
- The owner's ranking: a Sonnet arm that wins is the candidate only, provisional until the owner has ranked his top two per task from his own blind sheet. It "agrees" if that arm has more of his top-two picks than Haiku xhigh; the choice is his either way.
- Reported next to the rule, not part of it: mean rank, first places and rubric means per arm and grader, script checks passed per arm, mean rank by kind of task, how often the two graders order a pair of texts the same way.

## What this cannot show
Twenty-four pairs per arm are modest evidence. The graders are one model (Opus 5.5) and the tasks, facts and checks are Claude's. Writers and graders load the project's CLAUDE.md and state file (which names the three arms but none of the tasks), and their context offers an advisor tool backed by Fable 5.2, which the task forbids and the transcript check enforces.
