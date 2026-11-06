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

**Claude Code** (Claude Code 2.1.293 or later, so `haiku` means Haiku 5.5; Python 3.9+ as `python3`):

1. In a Claude Code session, type `/plugin marketplace add kamikaze4441/megamind-model-router`.
2. Type `/plugin install model-router@megamind-model-router` and pick the **user** scope in the panel. A plugin installed at
   user scope in the terminal is also available in the desktop app's local sessions on the same computer. In the desktop
   app you can also install it with **+** next to the prompt box → **Add plugins** after step 1.
3. Check: a new session shows `⚙ model-router 0.2.0 on (max plan)`, and `/model-router:route find every TODO in src`
   answers with a class, a model and a worker.

Options (environment variables): `MODEL_ROUTER_PROFILE=pro` for the Pro plan's table; `MODEL_ROUTER_GUARD=0` to stop
the spawn guard; `MODEL_ROUTER_KEYWORD_HINTS=1` to also get a zero-token keyword hint before each reply (61% right on
unseen prompts: see the bench).

**claude.ai:**

1. Skill: zip the folder `skill/model-router` (the folder itself at the zip's root) and upload it in **Customize › Skills
   › + › Create skill › Upload a skill**.
2. Instructions: paste [`chat/instructions.txt`](chat/instructions.txt) into **Settings › Your Claude › Instructions**.

## The table

| Class | Max plan | Pro plan | Worker for the bulk |
| --- | --- | --- | --- |
| quick: short question with a known answer | Haiku 5.5 · low | same | – |
| search: find, read, list in files, logs, pages | Haiku 5.5 · low | same | `scout` |
| write: emails, posts, summaries, explanations | Sonnet 5.5 · medium | same | – |
| edit: a scoped change (small feature, fix, script, config) | Sonnet 5.5 · medium | same | `builder`, then `runner` |
| debug: broken, cause unknown | Opus 5.5 · high | Sonnet 5.5 · high | `runner` to reproduce |
| risky: money, security, credentials, data, live servers, legal or medical | Opus 5.5 · high, plan first | Sonnet 5.5 · high | `reviewer` before applying |
| review: check or fact-check existing work | Opus 5.5 · high | Sonnet 5.5 · high | – (stays on the main model) |
| research: compare sources, buying decisions | Opus 5.5 · high | Sonnet 5.5 · high | `scout` reads, the main model checks facts |
| plan: architecture, design, long-term choices | Fable 5.1 · high | Opus 5.5 · high | – |

When unsure: Sonnet 5.5 · medium. Never route risky work to the cheapest tier. A small, fully specified task can go a tier
lower. Mid-task, change effort (`/effort`, or `ultrathink` for one turn: the cache is kept) rather than the model
(`/model` re-reads the whole conversation). Edit [`policy.json`](plugins/model-router/scripts/policy.json) to change any route.

Workers (in `plugins/model-router/agents/`): `scout` and `runner` on Haiku 5.5 · low, `builder` on Sonnet 5.5 · medium,
`reviewer` on Opus 5.5 · high. Every brief carries a "Done when:" check that the orchestrator re-runs before it uses the
result; after two failures it does that step itself.

## Bench (Nov 6, 2026) · full tables in [`bench/RESULTS.md`](bench/RESULTS.md)

- **Keyword routing doesn't generalise, so v0.2 doesn't rely on it.** The first version classified prompts with keyword
  rules in the hook. Frozen before each test, it picked the right model for 76.9% of 117 unseen prompts written by Sonnet
  5.5, and after tuning, 60.7% of 117 prompts written by Opus 5.5 for other kinds of users, with 7 of 13 risky prompts sent
  to a cheaper model.
- **Claude as the judge does.** On those same 117 prompts, with the labels hidden, Haiku 5.5 · low picked the right model
  for 96.6% and Sonnet 5.5 · medium for 97.4%, with no risky prompt under-routed. That is v0.2's mechanism. Caveat: the
  labels were written by another Claude model.
- **Small tasks don't need Opus.** Haiku 5.5 · low, Sonnet 5.5 · medium and Opus 5.5 · high each solved 38 of 38 graded
  items (6 search questions over a 12-file repo, 6 functions from a spec, 6 bug fixes, 10 code snippets with 3 safe decoys
  and 10 claims to fact-check). The tiers above Haiku rest on community measurements on harder work, not on this bench:
  Haiku 5.5 matched Opus 5.5 on code search (44 vs 45 of 48 files) at about a fourteenth of the cost but marked 30 correct
  sentences as errors when fact-checking (Opus 0) (r/ClaudeAI 1x1nsaz, 2026-10-09); on 12 hard coding tasks, no
  Opus-led team of cheap coders beat Opus alone (81%) (r/ClaudeAI 1xn0e12, 2026-11-03).
- **Hooks:** 20 of 20 cases pass; 37 ms median per prompt. Claude Code 2.1.319 loads the plugin with all 6 hooks, 4
  agents and `/model-router:route`.

Not verified: the hooks firing live (the bench sandbox registers them but doesn't run them), how reliably Claude writes
the one-line note mid-session (the bench measures its classification, not its compliance), and how much each model
weighs against plan limits (Anthropic doesn't publish it).

## Credits

Worker wording and the spawn guard adapt [donimas/ai-routing](https://github.com/donimas/ai-routing) @ 4a8312f (MIT); the
brief-and-check loop is an idea from the Omega guide on murphmaxxing.com. See [`NOTICE.md`](NOTICE.md). Licence: MIT.
