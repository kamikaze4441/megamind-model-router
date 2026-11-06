# model-router (Claude Code plugin)

Gives Claude a routing table at session start and tells it its model and effort whenever they change, so Claude checks
every prompt and says in one line when another model or effort fits better. Adds four fixed-tier workers (`scout` and
`runner` on Haiku 5.5 · low, `builder` on Sonnet 5.5 · medium, `reviewer` on Opus 5.5 · high), a guard that makes every
other subagent spawn name a model, a cache-cost note before `/model` switches, and `/model-router:route <task>`.
Needs Claude Code 2.1.293 or later and `python3` (3.9+). Docs, bench and options: the repository README.
