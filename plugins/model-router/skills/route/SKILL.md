---
name: route
description: Show the model-router table and which model and effort fit a task. Type /model-router:route followed by the task.
argument-hint: "[task]"
disable-model-invocation: true
---

Answer in at most eight lines.

1. If a task was given ("$ARGUMENTS"), name its class (quick, search, write, edit, debug, risky, review, research or plan), the model and effort that fit, and which worker should take the bulk of it: model-router:scout (Haiku 5.5 · low: find, read, list), model-router:runner (Haiku 5.5 · low: run tests and commands), model-router:builder (Sonnet 5.5 · medium: one scoped edit), model-router:reviewer (Opus 5.5 · high: risky changes, steps that failed twice).
2. Then the table: quick and search → Haiku 5.5 · low; write and edit → Sonnet 5.5 · medium; debug, risky, review and research → Opus 5.5 · high (Sonnet 5.5 · high on Pro); plan → Fable 5.1 · high on Max (Opus 5.5 · high on Pro). When unsure: Sonnet 5.5 · medium. Small, fully specified tasks can go one tier lower.
3. Remind: an effort change keeps the cache (`/effort <level>`, or `ultrathink` for one turn); a model switch (`/model <name>`) re-reads the conversation, so switch at the start of a task.
