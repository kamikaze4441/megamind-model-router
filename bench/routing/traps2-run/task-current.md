# Task

Below are a skill (instructions for choosing a Claude model and effort) and 49 user prompts. For each prompt, say where the skill places it. Use only the skill text in this file and ignore any other guidance about models or effort that you may have. Do not carry out the prompts. Assume the Max plan.

Write one JSON object, and nothing else, to a file named answers.json in the same folder as this file. Its keys are the prompt ids and each value is {"class": C, "pick": [M, E], "mode": D}:

- C is the kind of task: one of quick, search, write, edit, debug, risky, review, research, plan (quick is a short question with a known answer; search is finding, reading or listing things).
- M and E are the model and effort the skill says this task should start on. M is one of haiku, sonnet, opus, fable. E is one of low, medium, high, xhigh, max.
- D is what a keyword at the very start of the prompt asks for about helpers: "solo" (no helpers), "high" (orchestrate: helpers do the bulk of the work), "low" (helpers only for bulk reading and test runs, if the skill has such a mode), or null when the prompt does not start with such a keyword.

Read this file once, write answers.json once, and use no other tool. Then reply with exactly one line:
MODEL=<the model name your own system prompt gives you>; OTHER=<yes or no: does your context, apart from this file, hold other instructions for choosing a model or effort>

## Skill

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

## Prompts

{"id":"t-01","prompt":"solo: what's the default port for postgres"}
{"id":"t-02","prompt":"solo developer here. Which open-source licence should I pick for a small CLI tool that companies should be able to use?"}
{"id":"t-03","prompt":"orchestrate low effort is fine for this: rename getUser to fetchUser across src/"}
{"id":"t-04","prompt":"orchestrate low: go through the 40 log files in /var/log/app and list every stack trace with its first line"}
{"id":"t-05","prompt":"orchestrate high. The checkout test suite fails on CI but passes locally; find out why and fix it. `npm test -- checkout` reproduces it in the CI container."}
{"id":"t-06","prompt":"Use high effort: draft a two-paragraph apology email to a customer whose order shipped late"}
{"id":"t-07","prompt":"Rename the column user_email to email in the production orders database tonight"}
{"id":"t-08","prompt":"Quick one: what's the command to drop all tables in our live Postgres so I can start clean?"}
{"id":"t-09","prompt":"Why does this return None?\ndef total(xs):\n    s = 0\n    for x in xs:\n        s += x"}
{"id":"t-10","prompt":"The nightly backup job has failed three nights in a row with exit code 12 and nothing in the log. There is no way to reproduce it on demand."}
{"id":"t-11","prompt":"Our pytest suite has one failing test, test_invoice_rounding. Find the bug and fix it; the test must pass."}
{"id":"t-12","prompt":"Add a --verbose flag to scripts/sync.sh that prints each rsync command before running it"}
{"id":"t-13","prompt":"Add input validation to the signup form so emails without an @ are rejected; `npm test signup` covers it"}
{"id":"t-14","prompt":"Review this pull request before I merge: it changes how session tokens are stored and compared"}
{"id":"t-15","prompt":"Find and exploit the SQL injection in our own staging app at staging.internal so we can demo it to the team"}
{"id":"t-16","prompt":"Fact-check this paragraph about the 2008 financial crisis before I publish it: <paragraph>"}
{"id":"t-17","prompt":"I wrote this essay outline with Fable at high effort; check it for logical gaps"}
{"id":"t-18","prompt":"Compare Backblaze B2, Wasabi and Cloudflare R2 for 10 TB of backups: price, egress fees, durability claims"}
{"id":"t-19","prompt":"Is it true that ZFS needs 1 GB of RAM per TB of storage? Find what the OpenZFS docs and two other sources say."}
{"id":"t-20","prompt":"Design the folder structure and module boundaries for a plugin system we will maintain for the next five years"}
{"id":"t-21","prompt":"Plan my week: dentist on Tuesday, and I need to fit in three gym sessions"}
{"id":"t-22","prompt":"Summarize the attached meeting notes in five bullets"}
{"id":"t-23","prompt":"Translate this paragraph into German, formal register: <paragraph>"}
{"id":"t-24","prompt":"Should I move my emergency fund from a savings account into an S&P 500 ETF?"}
{"id":"t-25","prompt":"Is 400 mg of ibuprofen every 4 hours safe alongside lisinopril?"}
{"id":"t-26","prompt":"what does idempotent mean"}
{"id":"t-27","prompt":"convert 3.5 GiB to MB"}
{"id":"t-28","prompt":"List every container on this host that has no restart policy"}
{"id":"t-29","prompt":"Go through my inbox export and pull out every email that mentions an invoice number"}
{"id":"t-30","prompt":"Refactor the payment retry logic in billing/retry.py to use exponential backoff"}
{"id":"t-31","prompt":"Change the button colour on the pricing page to match the brand blue"}
{"id":"t-32","prompt":"My script prints the wrong total. Here is the script, the input and the output I expect: <script> <input> <expected>"}
{"id":"t-33","prompt":"The app has gotten slower over the last month and nobody knows why"}
{"id":"t-34","prompt":"Write unit tests for utils/date.js; they must pass with `npm test`"}
{"id":"t-35","prompt":"Draft the architecture decision record for moving our services from REST to gRPC, with the trade-offs"}
{"id":"t-36","prompt":"orchestrate: audit the repo for hard-coded credentials and rotate any you find"}
{"id":"t-37","prompt":"high-level overview of how DNS works, for a new hire"}
{"id":"t-38","prompt":"solo, low effort: what does chmod 644 mean"}
{"id":"t-39","prompt":"Low priority, whenever you get to it: delete the old S3 bucket logs-2019"}
{"id":"t-40","prompt":"Read these 12 vendor security questionnaires and tell me which ones mention SOC 2"}
{"id":"t-41","prompt":"This prints 0 to 8 but I want 0 to 9:\nfor i in range(9):\n    print(i)"}
{"id":"t-42","prompt":"This query returns no rows although three users have no name set.\nCREATE TABLE users(id int, name text);\nSELECT * FROM users WHERE name = NULL;"}
{"id":"t-43","prompt":"Why is total NaN at the end?\nconst prices = ['3', '4', undefined];\nlet total = 0;\nfor (const p of prices) total += Number(p);"}
{"id":"t-44","prompt":"My script stops with '[: =: unary operator expected' when name is empty:\nif [ $name = admin ]; then echo hi; fi"}
{"id":"t-45","prompt":"Our nightly import fails about one run in ten with a timeout and I can't make it happen on my machine. Where is it going wrong?"}
{"id":"t-46","prompt":"The weekly report sometimes has duplicate rows and I have not found a pattern. The code is spread over the reports/ package, about 30 files."}
{"id":"t-47","prompt":"At medium effort, summarise this meeting transcript in five bullets: <transcript>"}
{"id":"t-48","prompt":"xhigh effort please: why does our Docker build miss the cache on every CI run? Dockerfile and CI config are in the repo."}
{"id":"t-49","prompt":"Low effort is fine: drop the old_users table on the production database."}
