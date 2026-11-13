# megamind-model-router

Stop running everything on the top model, or a hard task on a cheap one. **model-router** gives Claude a routing table
and has it check every prompt against it: when the model or effort you picked doesn't fit, Claude says so in one line
(`⚙ Better on Opus 5.5 · high: risky change to a live database`) and carries on. On Opus or Fable at High or above, Claude
also works as an orchestrator, handing bulk searching, reading and test runs to Haiku helpers and routine edits to a
Sonnet helper. No hook can switch your model or effort, so the router tells you and leaves the switch to you.

| Where | What loads by itself on every prompt |
| --- | --- |
| **Claude Code** (terminal, and the desktop app's Code tab) | The `model-router` plugin: hooks add the routing card at session start and tell Claude its model and effort whenever they change, and a guard makes every subagent spawn name a model. Four worker agents carry fixed tiers. Zero tokens per prompt when nothing changed. |
| **claude.ai** (chat and Cowork) | Plugin hooks don't run there. Use the two lines in [`chat/instructions.txt`](chat/instructions.txt) in **Settings › Your Claude › Instructions** (applied to every conversation) and the [`model-router`](skill/model-router/SKILL.md) skill for the full table. |

## Install

**Claude Code** (Claude Code 2.1.293 or later, so `haiku` means Haiku 5.5; Node 18+ as `node`):

1. In a Claude Code session, type `/plugin marketplace add kamikaze4441/megamind-model-router`.
2. Type `/plugin install model-router@megamind-model-router` and pick the **user** scope in the panel. A plugin installed at
   user scope in the terminal is also available in the desktop app's local sessions on the same computer. In the desktop
   app you can also install it with **+** next to the prompt box → **Add plugins** after step 1.
3. Check: a new session shows `⚙ model-router 0.3.0 on (max plan)`, and `/model-router:route find every TODO in src`
   answers with a class, the step it starts on and a worker.

Options (environment variables): `MODEL_ROUTER_PROFILE=pro` for the Pro plan's ladders (`lean` when the Fable allowance runs short); `MODEL_ROUTER_GUARD=0` to stop
the spawn guard; `MODEL_ROUTER_KEYWORD_HINTS=1` to also see the keyword hint the hook gives Claude when a prompt's wording clearly
doesn't fit the session (`=0` turns the hint off; it is 77% right at high confidence on unseen prompts: see the bench).

**claude.ai:**

1. Skill: zip the folder `skill/model-router` (the folder itself at the zip's root) and upload it in **Customize › Skills
   › + › Create skill › Upload a skill**.
2. Instructions: paste [`chat/instructions.txt`](chat/instructions.txt) into **Settings › Your Claude › Instructions**.

<!-- table:start -->
## The table

Each class has a start, the pair work begins on, and steps to climb when that is not enough. When the result can be checked
cheaply (tests, a command, a fact to look up), start on the pair in the third column and climb one step each time the check
fails.

| Class | Start on (Max) | Start here instead when a cheap check exists | Then climb to | On Pro, start on | Built from | Worker for the bulk |
| --- | --- | --- | --- | --- | --- | --- |
| quick: short question with a known answer | **Haiku 5.5 · low** | – | Haiku 5.5 · high → Sonnet 5.5 · high | same | judgment | – |
| search: find, read or list things in files, logs, pages or an inbox | **Haiku 5.5 · low** | – | Haiku 5.5 · high → Sonnet 5.5 · high | same | judgment | `scout` |
| write: emails, posts, summaries, translations, explanations, day-to-day plans such as a week or a schedule | **Sonnet 5.5 · medium** | – | Opus 5.5 · medium → Opus 5.5 · high → Opus 5.5 · xhigh | same | GDPval-AA v2.1, AA-Briefcase v1.1; the start from an own test | – |
| edit: a scoped change: small feature, fix, script, config | **Sonnet 5.5 · high** | Sonnet 5.5 · medium | Opus 5.5 · medium | same | FrontierCode v1.1, main set, CursorBench 4.0 | `builder`, then `runner` |
| debug: something broken, cause unknown | **Fable 5.2 · low** | Opus 5.5 · medium | Fable 5.2 · medium → Opus 5.5 · xhigh → Fable 5.2 · xhigh | Opus 5.5 · high (Opus 5.5 · medium with a cheap check), then Opus 5.5 · xhigh | FrontierCode 2.0, Terminal-Bench 4.0 | `runner` to reproduce |
| risky: money, security, credentials, deleting or migrating data, live servers, legal or medical decisions; any change, even a refactor, to code that takes payments, checks logins or holds secrets | **Opus 5.5 · high**, plan first; never lower | – | – | same | judgment | `reviewer` before applying |
| review: check or fact-check existing work | **Opus 5.5 · high** | – | Fable 5.2 · medium | Opus 5.5 · high | judgment | – |
| research: compare sources, buying decisions, current state of things | **Fable 5.2 · low** | Opus 5.5 · medium | Fable 5.2 · high → Fable 5.2 · xhigh | Opus 5.5 · high (Opus 5.5 · medium with a cheap check), then Opus 5.5 · xhigh | WANDR, Humanity’s Last Exam (with tools) | `scout` |
| plan: architecture, system design, long-term choices for a system, product or project | **Fable 5.2 · medium** | – | Fable 5.2 · high → Fable 5.2 · xhigh | Opus 5.5 · high | judgment | – |

When unsure: Sonnet 5.5 · high. Is it a small bug with all its code in the prompt? That is a scoped fix, not debugging: Sonnet 5.5 · high, and run the code to check. Does the prompt name an effort? It wins: use the named effort on the start model of that class. Risky work still never goes below Opus 5.5 · high. Max effort is on no ladder.
When the Fable allowance runs short (`MODEL_ROUTER_PROFILE=lean`): debugging starts on Opus · high (Opus · medium with a cheap check), then Opus · xhigh → Fable · xhigh; research starts on Opus · high (Opus · medium with a cheap check), then Fable · low → Fable · high → Fable · xhigh. Mid-task, change effort (`/effort`, or
`ultrathink` for one turn: the cache is kept) rather than the model (`/model` re-reads the whole conversation).

The ladders are built, not hand-written: `node tools/build.js` reads [`evidence/points.csv`](evidence/points.csv) (score and
cost per task for every model and effort, with sources) and [`evidence/routing-inputs.json`](evidence/routing-inputs.json)
(floors, starts and the classes no benchmark covers), and writes `policy.json`, the skill, the route skill, the workers and
this table. [`evidence/ladders.md`](evidence/ladders.md) shows the working for each class and its whole ladder, the steps
below the start included.

Workers (in `plugins/model-router/agents/`): `scout` on Haiku 5.5 · low, `runner` on Haiku 5.5 · low, `builder` on Sonnet 5.5 · high, `reviewer` on Opus 5.5 · high. Every brief carries a "Done when:" check that the orchestrator re-runs
before it uses the result; after two failures it does that step itself.
<!-- table:end -->

## Bench (Nov 12, 2026) · full tables in [`bench/RESULTS.md`](bench/RESULTS.md)

- **Keyword routing doesn't generalise, so Claude does the placing.** Frozen before each test, keyword rules in the hook
  picked the right model for 76.9% of 117 unseen prompts written by Sonnet 5.5 and, after tuning, for 60.7% of 117 prompts
  written by Opus 5.5, with 7 of 13 risky prompts sent to a cheaper model. Given the class definitions and those same 117
  prompts with the labels hidden, Haiku 5.5 · low picked the right model for 96.6% and Sonnet 5.5 · medium for 97.4%, with
  no risky prompt under-routed. So Claude places each task from the card or the skill, and the keyword rules only feed it
  an upward hint at high confidence (49 of 64 right on unseen prompts).
- **A cheap reader follows the skill.** Judges that got only the skill and a list of trap prompts landed where the skill
  intends: in the last test (69 prompts, three runs each) Haiku 5.5 · low and Sonnet 5.5 · medium both picked the intended
  model and effort for 67 or 68, and no run sent a risky prompt below Opus 5.5 · high. Two findings on the way changed the
  skill: Haiku took the first step of a ladder for the start (the table now has a start column of its own), and "plan my
  week" went to the planning row (the rows were reworded: 7 of 36 everyday plans right before, 36 of 36 after).
- **The ladders come from published curves, and one start from our own test.** `tools/build.js` builds each ladder from
  vendor-published score and cost per model and effort. Writing is the exception: on twelve writing tasks, blind Opus
  graders preferred Sonnet 5.5 at medium to Haiku 5.5 at xhigh in 30 and 27 of 36 pairs, so writing starts on
  Sonnet 5.5 · medium although the benchmark ranks Haiku at xhigh higher at the same cost.
- **Small tasks don't need Opus** (the 0.2.0 bench, Nov 6). Haiku 5.5 · low, Sonnet 5.5 · medium and Opus 5.5 · high each
  solved 38 of 38 graded items (6 search questions over a 12-file repo, 6 functions from a spec, 6 bug fixes, 10 code
  snippets with 3 safe decoys and 10 claims to fact-check). Community measurements on harder work: Haiku 5.5 matched
  Opus 5.5 on code search (44 vs 45 of 48 files) at about a fourteenth of the cost but marked 30 correct sentences as
  errors when fact-checking (Opus 0) (r/ClaudeAI 1x1nsaz, 2026-10-09); on 12 hard coding tasks, no Opus-led team of cheap
  coders beat Opus alone (81%) (r/ClaudeAI 1xn0e12, 2026-11-03).
- **Hooks:** 38 of 38 cases pass; about 75 ms median per prompt, Node start-up included.

Not verified: that routed work comes out better or cheaper end to end (no outcome test has been run); the labels of the
trap tests (Claude wrote prompts, labels and wording), which also read the skill before its writing row changed (the
only line that differs); the graders' taste in the writing test (all were Opus 5.5); plugin
0.3.0 installed through `/plugin` (the live check ran the hook from a project settings file and saw the session-start
card and the per-prompt line, not the Stop hook or the spawn guard); how reliably Claude writes the one-line note
mid-session; and how much each model weighs against plan limits (Anthropic doesn't publish it).

Stored test files: the `*.sha256` lists under `bench/` record what was frozen before each test. Their paths come from
the working layout (some name `next/`, `repo-snapshot/` or the removed `router.py`), so not all of them verify from a
clone. Four files in `bench/writing` (`RULE.md`, `decide.js`, `dryrun.js`, `shuffle.js`) were edited after the freeze to
replace the owner's name and nothing else, so `writing-frozen.sha256` matches 24 of its 28 files; `decide.js` still
reproduces the stored `private/decision.json`. The owner's blind sheet (never ranked) and its key are not in the repo.

## Credits

Worker wording and the spawn guard adapt [donimas/ai-routing](https://github.com/donimas/ai-routing) @ 4a8312f (MIT); the
brief-and-check loop is an idea from the Omega guide on murphmaxxing.com. See [`NOTICE.md`](NOTICE.md). Licence: MIT.
