---
name: model-router
description: Picks the Claude model and effort that fit a task from measured cost and score curves, and hands bulk work to cheaper helpers. Use at the start of every task, when a prompt starts with "orchestrate" or "solo", or when asked which model or effort to use.
---

# Model router

## 1. Check the fit (every task)

Each row is a ladder, cheapest step first; start at the bold step. Models: Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2. Efforts: low, medium, high, xhigh (Extra high).

| Task | Ladder on Max | On Pro |
| --- | --- | --- |
| Quick question with a known answer; finding, reading or listing things in files, logs, pages, an inbox | **Haiku · low** → Haiku · high → Sonnet · high | same |
| Writing: emails, posts, summaries, translations, explanations | Haiku · high → **Haiku · xhigh** → Opus · medium → Opus · high → Opus · xhigh | same |
| A scoped edit: small feature, fix, script, config change | Sonnet · medium → **Sonnet · high** → Opus · medium | same |
| Debugging an unknown cause; multi-step agent coding | Opus · medium → **Fable · low** → Fable · medium → Opus · xhigh → Fable · xhigh | Opus · medium → **Opus · high** → Opus · xhigh |
| Risky: money, security, passwords, deleting or migrating data, live servers, legal or medical decisions | Opus · high, plan first; never lower; security work stays on Opus (Fable 5.2 blocks most of it) | same |
| Reviewing or fact-checking work | **Opus · high** → Fable · medium; never below the pair that did the work | Opus · high |
| Research across sources, buying decisions | Opus · medium → **Fable · low** → Fable · high → Fable · xhigh | Opus · medium → **Opus · high** → Opus · xhigh |
| Architecture, design, long-term plans | Opus · high → **Fable · medium** → Fable · high → Fable · xhigh | Opus · high |

- **Can the result be checked cheaply** (tests, a command, a fact to look up)? Then start one step below the bold one, run the check, and climb one step each time it fails. Writing and plans have no such check.
- **What does a mistake cost?** Money, security, data or a live system puts the task on the risky row, whatever else it is.
- **How many steps, how much bulk reading?** These decide what goes to helpers (section 2), not the step.

When unsure: Sonnet · high. Max effort is on no ladder: it rarely beats xhigh and costs 2.5 to 3 times as much, so use it on request only. When the Fable allowance runs short: debugging Opus · medium → **Opus · high** → Opus · xhigh → Fable · xhigh; research Opus · medium → **Opus · high** → Fable · low → Fable · high → Fable · xhigh.

If the model or effort you're running is below the task's step, or well above it on a lookup, writing or scoped-edit task, open the reply with one line, `⚙ Better on <model> · <effort>: <reason>`, then answer. Say nothing when it fits. An effort change keeps the cache and a model switch re-reads the whole chat, so suggest model switches at the start of a task. In Claude Code, a long task on Sonnet or Opus can also get a stronger second opinion: suggest `/advisor fable` once.

## 2. Delegate

The first word of a prompt sets how much goes to helpers. `solo` turns the router off for that prompt: no helpers and no "Better on" line. `orchestrate low` keeps the work with you and uses helpers only for bulk reading and test runs. `orchestrate` or `orchestrate high` has you plan, check and answer while helpers do the rest. With no keyword it is high when you run Opus or Fable at high or above, otherwise low. The words low and high here say how much is delegated and never change the effort: "orchestrate at high effort" asks for effort high.

- **Haiku · low helpers:** search, read and extract from many files or pages; run tests and commands and report the output. For long material to summarize, Haiku · high.
- **Sonnet · high helpers:** drafts and routine edits from a clear brief.
- **Keep for yourself:** planning, hard code, reviews, fact-checks, the final answer, and risky work in every mode. Haiku fact-checks flag correct text as wrong, and cheap coders under an Opus planner did worse than Opus alone on hard tasks.
- **Brief every helper:** the goal, the inputs (paths, links, text) and "Done when:" with a check you can run or see. Re-run that check yourself before using the result. Send a failure back with the output attached; after two failures, do that step yourself.
- **Cost:** per input token Haiku is 1, Sonnet 20, Opus 40, Fable 80. In the Claude app a helper starts with a fresh context of about 90k tokens, so delegate only bulk work and do small steps yourself.
- Run independent helpers in parallel. Never give a helper a Fable model.

## 3. Report

After a task that used helpers, add one line naming each helper that ran (model · effort) and what it did.
