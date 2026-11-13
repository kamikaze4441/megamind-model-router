# model-router: evidence

Read 2026-11-11. This file is never loaded during a task; it is the input to the build step.

- `raw/*.csv`: chart points copied from the data embedded in each launch page (exact numbers, not read off images).
- `points.csv`: 322 rows, one per benchmark, model and effort, with source and grade. Built by `node tools/frontier.js`.
- `frontier.md`: for each benchmark, the pairs no other pair beats on both score and cost. Same script. `frontier-fable-weight-2.md`: the same with Fable cost doubled (`--fable-weight 2`).
- `tools/charts.js` pulls the chart points out of a saved launch page.

## Sources and trust

| Source | Grade | What it gives | Limits |
| --- | --- | --- | --- |
| Anthropic launch pages: Fable 5.2 (2026-11-09), Haiku 5.5 (2026-10-07), Sonnet 5.5 (2026-09-28), Opus 5.5 (date not on page) | vendor | Score and cost per task at all five efforts on 14 benchmarks | Vendor-run. FrontierCode v1.1 and 2.0 are different tests. Cost is API dollars, not subscription usage |
| SemiAnalysis GDPx, 2026-11-02, read at source | independent | Opus 5.5 "best all-around"; native harness (Claude Code); pass@1 over three attempts; every model fails most expert tasks | The leaderboard is an image: 12.0% for Opus 5.5 and 8.5% at $67 a task for Fable 5.1 come from news coverage. Fable 5.2 shipped a week later and is not in it. No effort sweep |
| Claude Code docs: advisor, subagents (read 2026-11-11) | vendor docs | How advisor pairing and per-helper model and effort work | Advisor is experimental |
| r/ClaudeAI threads 1xtdfma, 1xsmqdd, 1xsyx2x, 1xth9t1 (2026-11-09 to 11) | community | How the models feel on a subscription | Anecdotes, two days after launch |
| `claude-api` skill price table (cached 2026-11-03) | vendor | Input / output per million tokens: Haiku 5.5 $0.10 / $0.50, Sonnet 5.5 $2 / $10, Opus 5.5 $4 / $20, Fable 5.2 $8 / $40, Fable 5.1 $10 / $50 | |

## What the curves say

Numbers are score at cost per task in dollars.

1. **Max effort does not pay for Opus and Fable on coding.** On FrontierCode 2.0 Fable 5.2 scores lower at Max than at Xhigh (45.7 vs 49.1) for three times the cost ($44.70 vs $14.19). Opus 5.5 Max adds 2 points over Xhigh for 2.5 times the cost, and scores lower than Xhigh on Terminal-Bench. Max still buys real gains elsewhere: BenchCAD (Fable 83.5 vs 74.1, Opus 65.3 vs 54.5), and for Haiku and Sonnet on several tests (Sonnet on Terminal-Bench 61.5 to 70.6 at 2.4 times the cost; Haiku on GDPval-AA 1513 to 1620 Elo at 3.2 times).
2. **The reading that started this work holds for coding.** FrontierCode 2.0: Fable 5.2 High 45.3 at $6.72 against Opus 5.5 Max 45.5 at $12.82. So Opus Max has no place in the table. One step further down: Fable Medium 37.6 at $2.48 beats Opus High 34.5 at $2.42, and Opus Xhigh 43.4 at $5.18 is the value step before Fable High.
3. **Research with tools is where Fable pays most.** WANDR: Fable Low 71.4 at $12.66 against Opus Medium 62.8 at $11.40 and Opus Max 72.3 at $38.68. Humanity's Last Exam with tools: Fable Low 68.4 at $0.19 against Opus Max 67.7 at $2.18. Today's skill sends research to Opus High.
4. **Opus Low is a trap on agent work; Opus Medium is the knee.** Low to Medium: FrontierCode 2.0 14.7 to 30.1, WANDR 31.2 to 62.8, Terminal-Bench 38.5 to 57.6. On FrontierCode v1.1 Opus peaks at Medium (54.6 at $0.80) and higher efforts add nothing.
5. **Sonnet's knee is High, not Medium.** FrontierCode v1.1: Medium 36.5 at $0.24, High 49.4 at $0.42. CursorBench: 39.2 at $0.70, then 47.8 at $1.67. Today's skill pins Sonnet to Medium.
6. **Haiku at High or Xhigh beats Sonnet Low and Medium on desk work, and loses on agent coding.** GDPval-AA: Haiku High 1420 Elo at $0.09 against Sonnet Medium 1324 at $0.27. OSWorld: Haiku Xhigh 67.6 at $0.28 against Sonnet Medium 66.0 at $0.93. Terminal-Bench: every Haiku effort above Low is beaten by Sonnet or Opus at the same cost. Today's skill pins Haiku to Low.
7. **Cybersecurity is not a Fable route.** The cyber rows and the CVE Rediscovery curve are Mythos 5.2 (verified organizations only) against Opus 5.5 "without safeguards". The page says Fable 5.2's safeguards block most cybersecurity tasks. On that chart Mythos Xhigh (88.1 at $2.40) does beat Opus Max (81.3 at $2.98), but neither line is a model a normal account can run that way. Security work stays on Opus 5.5.
8. **Fable 5.1 is stale.** Fable 5.2 beats it on every chart at a lower price (FrontierCode 2.0 at Xhigh: 49.1 vs 32.4). The skill and `policy.json` still name Fable 5.1.

## What the curves do not say

- They are vendor runs of benchmark tasks. GDPx (independent) has Opus 5.5 first and Fable 5.1 fifth and costliest, and the community threads call Opus 5.5 the daily driver, with Fable 5.2 for planning and orchestration and heavy on subscription usage. Neither tested Fable 5.2 at low effort.
- Dollars per task are API prices. On a subscription the limit is usage, and Fable has its own allowance; how fast each pair spends it is unmeasured.
- With Fable cost doubled, Fable High against Opus Max on FrontierCode 2.0 becomes a tie ($13.44 against $12.82), and Fable Low still beats Opus Xhigh and Max on research (WANDR, Humanity’s Last Exam with tools).
- Five of the nine task classes have no benchmark (table below). Those rows stay judgment and are marked as such.

## Task class to benchmark

| Class | Stand-in benchmark | Backed by data? |
| --- | --- | --- |
| quick | none (Humanity's Last Exam without tools is far harder than a quick question) | judgment |
| search | WANDR for large collection jobs; none for file and log search | partly |
| write | GDPval-AA, AA-Briefcase | yes |
| edit | FrontierCode v1.1, CursorBench | yes |
| debug | Terminal-Bench 4.0, FrontierCode 2.0 | yes |
| risky | none; GDPx found models at maximum effort breaking client-trust and safety rules in most runs | judgment |
| review | none | judgment |
| research | WANDR, Humanity's Last Exam with tools | yes |
| plan | none; community reports favour Fable 5.2 | judgment |

## Still to read

- Artificial Analysis pages for Fable 5.2 and Sonnet 5.5 (independent cost per task; one report puts Sonnet 5.5 Max at $7.60 a task).
- The Fable 5.2 system card.
- GDPx leaderboard numbers at source (image).
- The repo's own bench (the repo is private and not readable from here yet).
