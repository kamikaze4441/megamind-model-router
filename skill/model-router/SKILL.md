---
name: model-router
description: Picks the Claude model and effort that fit a task, and runs Opus as orchestrator with Haiku and Sonnet subagents. Use at the start of a task, on "orchestrate", or when asked which model.
---

# Model router

## 1. Check the fit (every task)

| Task | Model · effort (Max) | On Pro |
| --- | --- | --- |
| Quick question with a known answer | Haiku 5.5 · Low | same |
| Finding, reading or listing things in files, logs, pages, an inbox | Haiku 5.5 · Low | same |
| Writing: emails, posts, summaries, translations, explanations | Sonnet 5.5 · Medium | same |
| A scoped edit: small feature, fix, script, config change | Sonnet 5.5 · Medium | same |
| Debugging an unknown cause | Opus 5.5 · High | Sonnet 5.5 · High |
| Risky: money, security, passwords, deleting or migrating data, live servers, legal or medical decisions | Opus 5.5 · High, plan first | Sonnet 5.5 · High |
| Reviewing or fact-checking work | Opus 5.5 · High | Sonnet 5.5 · High |
| Research across sources, buying decisions | Opus 5.5 · High | Sonnet 5.5 · High |
| Architecture, design, long-term plans | Fable 5.1 · High (Opus 5.5 · Extra high near the Fable cap) | Opus 5.5 · High |

When unsure: Sonnet 5.5 · Medium. Never the cheapest tier on risky work. Small, fully specified tasks (all the code or facts are in the prompt) can go one tier lower.

If the model or effort you're running doesn't fit, open the reply with one line, `⚙ Better on <model> · <effort>: <reason>`, then answer. Say nothing when it fits. Mid-conversation an effort change keeps the cache and a model switch re-reads the whole chat, so suggest model switches at the start of a task.

## 2. Orchestrate

On when you run Opus or Fable at High, Extra high or Max, or the prompt starts with "orchestrate"; a prompt starting with "solo" turns it off. You plan, judge and answer; helpers do the bulk work they match you on.

- **Haiku 5.5 · Low helpers:** search, read and extract from many files or pages; run tests and commands and report the output.
- **Sonnet 5.5 · Medium helpers:** drafts and routine edits from a clear brief.
- **Keep for yourself:** planning, hard code, reviews, fact-checks and the final answer. Haiku fact-checks flag correct text as wrong, and cheap coders under an Opus planner did worse than Opus alone on hard tasks.
- **Brief every helper:** the goal, the inputs (paths, links, text) and "Done when:" with a check you can run or see. Re-run that check yourself before using the result. Send a failure back with the output attached; after two failures, do that step yourself instead of redoing the whole task.
- **Cost:** per input token Haiku is 1, Sonnet 20, Opus 40, Fable 100. In the Claude app a helper starts with a fresh context of about 90k tokens, so delegate only bulk work (long reading, many files, parallel searches) and do small steps yourself.
- Run independent helpers in parallel. Never give a helper a Fable model.

## 3. Report

After an orchestrated task, add one line naming each helper that ran (model · effort) and what it did.
