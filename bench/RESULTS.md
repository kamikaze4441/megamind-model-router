# Bench results

Run on 2026-11-06 in a claude.ai session (Claude Code 2.1.319 harness). Re-run: `python3 -I bench/make_results.py`.

## 1. Routing accuracy (keyword rules first, then Claude as the judge)

| Set | Prompts | Written by | Class right | Model right | Cheaper than label | Silent | Risky under-routed | ms/prompt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| heldin.jsonl (v1) | 90 | the router's author; tuned on it | 100.0% | 100.0% | 0 | 4 | 0/10 | 0.314 |
| heldout.jsonl (v0) | 117 | Sonnet 5.5 from CLASSES.md only; first contact | 67.5% | 76.9% | 22 | 28 | 3/13 | 0.348 |
| heldout.jsonl (v1) | 117 | same set, after v1 was tuned on it (not independent) | 98.3% | 99.1% | 1 | 7 | 0/13 | 0.377 |
| heldout2.jsonl (v1) | 117 | Opus 5.5 from CLASSES.md only; v1 frozen first | 55.6% | 60.7% | 31 | 37 | 7/13 | 0.722 |
| heldout2 (Claude as judge: Haiku 5.5 · low) | 117 | same prompts, labels hidden from the judge | 95.7% | 96.6% | 4 | 0 | 0/13 | – |
| heldout2 (Claude as judge: Sonnet 5.5 · medium) | 117 | same prompts, labels hidden from the judge | 97.4% | 97.4% | 3 | 0 | 0/13 | – |

"Model right" compares the model the router recommends with the model the label's class maps to. "Silent" = unsure or low confidence: the hook shows nothing. The honest keyword numbers are the first-contact rows: v0 on heldout.jsonl and v1 on heldout2.jsonl. The judge rows are v0.2's mechanism: Claude reads the class definitions and labels each prompt. Caveat: heldout2's labels were written by another Claude model (Opus 5.5), which may share the judges' reading of the classes.

## 2. Tier bench (real model runs, graded by script)

| Group (router's tier) | Haiku 5.5 · low | Sonnet 5.5 · medium | Opus 5.5 · high |
| --- | --- | --- | --- |
| A search: 6 questions over a 12-file repo (Haiku · low) | 6/6 · 7.7 s | 6/6 · 9.6 s | 6/6 · 8.2 s |
| B edit: 6 functions from a spec, hidden tests (Sonnet · medium) | 6/6 · 25.0 s | 6/6 · 19.7 s | 6/6 · 18.4 s |
| C debug: 6 buggy functions, hidden tests (Opus · high) | 6/6 · 13.7 s | 6/6 · 11.3 s | 6/6 · 18.8 s |
| D review: 10 snippets (3 safe) + 10 claims (Opus · high) | 20/20 · 6.9 s | 20/20 · 6.6 s | 20/20 · 7.3 s |

Every tier solved every item: these small, fully specified tasks don't separate the models. Each run's context ended at 91.6k–96.7k tokens, of which about 92k is the harness's fixed system prompt and tool list (a probe that only replied "ok" read 93,051), so the run-to-run token differences are noise. List price per input token (platform.claude.com pricing): Haiku 5.5 $0.10/M, Sonnet 5.5 $2/M, Opus 5.5 $4/M, Fable 5.1 $10/M.

## 3. Hooks

20/20 hook cases pass (`bench/hooks/test_hooks.py`); `UserPromptSubmit` takes 37.8 ms median, 44.9 ms p95 (Python start-up included). Claude Code 2.1.319 loaded the plugin with `--plugin-dir`: 4 agents, `/model-router:route` and all 6 hooks registered (this cloud sandbox doesn't run hooks; the live check runs on your machine).
