#!/usr/bin/env node
/* Collect the bench numbers into bench/RESULTS.md and bench/results.json:  node bench/make_results.js

Computed on each run: keyword routing and the stored judge labels (under routing/policy-0.2.0.json and under the
current policy), the two Sonnet runs per arm of the second trap test, the hook suite and build.js --check.
Read from stored files: the 0.2.0 tier bench and hook timing (results-0.2.0.json), the first keyword run
(routing/results-heldout.json), the trap-test scores (routing/traps*-run) and the writing test (writing/private,
writing/ext/private). Stored trap scores are not re-scored: each run was scored against the policy of its day.
Replaces make_results.py. Node 18+, no dependencies.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const HERE = __dirname;
const P = (...a) => path.join(HERE, ...a);
const J = f => JSON.parse(fs.readFileSync(P(f), "utf8"));
const node = (script, ...args) => spawnSync(process.execPath, [P(script), ...args], { encoding: "utf8", cwd: HERE });
const jsonLine = (out, which) => { const l = out.split("\n").filter(x => x.startsWith("{")); return JSON.parse(which === "last" ? l[l.length - 1] : l[0]); };
const pct = x => (x * 100).toFixed(1) + "%";
const OLD = "routing/policy-0.2.0.json";

// ----------------------------------------------------------------------------- 1. routing
const kw = (set, pol) => jsonLine(node("routing/run_routing.js", P("routing", set), ...(pol ? ["--policy", P(pol)] : [])).stdout);
const judge = (m, pol) => jsonLine(node("routing/score_judge.js", P(`routing/judge-${m}.json`), ...(pol ? ["--policy", P(pol)] : [])).stdout, "last");
const SETS = ["heldin.jsonl", "heldout.jsonl", "heldout2.jsonl"];
const routing = { "0.2.0": {}, "0.3.0": {} }, judges = { "0.2.0": {}, "0.3.0": {} };
for (const s of SETS) { routing["0.2.0"][s] = kw(s, OLD); routing["0.3.0"][s] = kw(s); }
for (const m of ["haiku", "sonnet"]) { judges["0.2.0"][m] = judge(m, OLD); judges["0.3.0"][m] = judge(m); }
const { confusion, ...first } = J("routing/results-heldout.json");
const parity = node("routing/run_routing.js", P("routing/heldout2.jsonl"), "--policy", P(OLD), "--expect", P("routing/results-heldout2-v1.json")).status === 0;
const who = { "heldin.jsonl": "the router's author; tuned on it", "heldout.jsonl": "Sonnet 5.5 from CLASSES.md only; rules later tuned on it (not independent)",
  "heldout2.jsonl": "Opus 5.5 from CLASSES.md only; rules frozen first" };
const JUDGE = { haiku: "Haiku 5.5 · low", sonnet: "Sonnet 5.5 · medium" };

const L = ["# Bench results", "",
  "Re-run: `node bench/make_results.js` (Node 18+). It recomputes the routing tables, the hook suite and the build check, and reads the",
  "stored results of the model runs: the 0.2.0 bench of 2026-11-06 and the 0.3.0 tests of 2026-11-12. Every model run was a Claude Code",
  "helper with a fixed model and effort; its transcript was checked for both.", "",
  "## 1. Routing accuracy: keyword rules and Claude as the judge", "",
  "### Under the 0.2.0 table (one model and effort per class)", "",
  "| Set | Prompts | Written by | Class right | Model right | Cheaper than label | Silent | Risky under-routed |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  `| heldout.jsonl, first keyword rules, first contact (stored) | ${first.n} | Sonnet 5.5 from CLASSES.md only | ${pct(first.class_accuracy)} | ${pct(first.tier_accuracy)} | ${first.under_routed} | ${first.silent} | ${first.risky_under_routed} |`];
for (const s of SETS) { const r = routing["0.2.0"][s]; L.push(`| ${s}, tuned keyword rules | ${r.n} | ${who[s]} | ${pct(r.class_accuracy)} | ${pct(r.tier_accuracy)} | ${r.under_routed} | ${r.silent} | ${r.risky_under_routed} |`); }
for (const m of ["haiku", "sonnet"]) { const j = judges["0.2.0"][m]; L.push(`| heldout2, Claude as judge: ${JUDGE[m]} | ${j.n} | same prompts, labels hidden from the judge | ${pct(j.class_accuracy)} | ${pct(j.model_right)} | ${j.under_routed_model} | 0 | ${j.risky_under_routed} |`); }
L.push("", `"Model right" compares the model of the class the router or judge chose with the model of the labelled class. "Silent" = unsure or low`,
  "confidence: the hook shows nothing. The honest keyword numbers are the first-contact rows: the first rules on heldout.jsonl and the tuned",
  "rules on heldout2.jsonl. The keyword rules were ported from Python to Node for 0.3.0 without a change in what they match: " +
  (parity ? "with the 0.2.0 table the port gives the stored Python result on heldout2.jsonl, count for count, with the same confusion table." : "PARITY WITH THE STORED PYTHON RESULT FAILED on heldout2.jsonl."),
  "Caveat for the judge rows: heldout2's labels were written by another Claude model (Opus 5.5), which may share the judges' reading of the classes.", "",
  "### Under the 0.3.0 ladders (each class has a start step and steps to climb)", "",
  "| Set | Class right | Start model right | Start step right | Cheaper model than label | Risky under-routed | Right at high confidence |",
  "| --- | --- | --- | --- | --- | --- | --- |");
for (const s of SETS) { const r = routing["0.3.0"][s]; L.push(`| ${s}, keyword rules | ${pct(r.class_accuracy)} | ${pct(r.tier_accuracy)} | – | ${r.under_routed} | ${r.risky_under_routed} | ${r.high_confidence.replace(" right", "").replace("/", " of ")} |`); }
for (const m of ["haiku", "sonnet"]) { const j = judges["0.3.0"][m]; L.push(`| heldout2, judge ${JUDGE[m]} (the stored labels, re-scored) | ${pct(j.class_accuracy)} | ${pct(j.model_right)} | ${pct(j.step_right)} | ${j.under_routed_model} | ${j.risky_under_routed} | – |`); }
const hc = routing["0.3.0"]["heldout2.jsonl"].high_confidence;
L.push("", "In 0.3.0 Claude places each task from the routing card or the skill; the keyword rules only feed a hint to Claude, on by default, upward only",
  `and only at high confidence, because on unseen prompts they are right ${hc.replace(" right", "").replace("/", " times in ")} at high confidence and the misses mostly name a cheaper class.`,
  "The judge rows re-score the class labels the 0.2.0 judges gave; no judge has read the 0.3.0 skill on this set (the trap tests below do that).", "");

// ----------------------------------------------------------------------------- 2. trap tests
const t1 = J("routing/traps-run/scores.json"), t2 = J("routing/traps2-run/scores.json").filter(x => x.groups), t3 = J("routing/traps3-run/scores.json");
const list = (rows, f) => rows.map(f).join(", ");
const tested = fs.readFileSync(P("routing/traps3-run/skill-new.md"), "utf8").split("\n"), now = fs.readFileSync(P("../skill/model-router/SKILL.md"), "utf8").split("\n");
const drift = tested.length === now.length ? now.filter((l, i) => l !== tested[i]) : null;
const skillDrift = drift && drift.length === 0 ? "the last tested skill and the current one are the same text."
  : drift && drift.length === 1 && drift[0].startsWith("| Writing") ? "the last tested skill and the current one differ in exactly one line, the writing row, which no judge has read in its current form."
  : `the last tested skill and the current one differ in ${drift ? drift.length + " lines" : "length"}, so these figures describe an earlier text.`;
const cmpText = fs.readFileSync(P("routing/traps3-run/compare-output.txt"), "utf8");
const cmpJson = JSON.parse(cmpText.slice(0, cmpText.indexOf("\n}\n") + 2));
const sums = (key, arms) => { const k = Object.keys(cmpJson).find(x => x.startsWith(key)); let a = 0, b = 0; for (const arm of arms) { const m = /sum (\d+)\/(\d+)/.exec(cmpJson[k][arm]); a += +m[1]; b += +m[2]; } return `${a} of ${b}`; };
L.push("## 2. Trap tests: does a reader of the skill land where the skill intends? (2026-11-12)", "",
  "A judge is a Claude model that gets one skill text and a list of prompts without labels and writes a class, a model and effort, and a",
  "delegation mode for each. Prompts, labels, skills, policy and scorer were frozen by hash before each test. Each arm is scored against the",
  "policy that belongs to its skill, so the figures say how reliably a reader follows a skill, not which table is better. The labels are",
  "Claude's, and from the second test on they were written in the session that wrote the wording under test.",
  `Every judge read a skill whose writing row started on Haiku xhigh. The writing start changed after these tests (section 3): ${skillDrift}`, "",
  "### 2.1 The 0.2.0 skill and the first 0.3.0 skill, 40 prompts, two runs each", "",
  "| Judge | Skill | Pick right of 40 | Class right | Mode right | Under-routed | Risky under-routed |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const jd of ["haiku-low", "sonnet-medium"]) for (const v of ["0.2.0", "0.3.0"]) {
  const r = t1.filter(x => x.answers.startsWith(`${jd}_${v}_`));
  L.push(`| ${jd === "haiku-low" ? "Haiku low" : "Sonnet medium"} | ${v} | ${list(r, x => x.pick_right)}${v === "0.2.0" ? ` (${list(r, x => x.pick_right_tier_lower_ok)} with its "one tier lower" rule allowed)` : ""} | ${list(r, x => x.class_right)} | ${list(r, x => x.mode_right)} | ${list(r, x => x.under_routed)} | ${list(r, x => x.risky_under_routed)} |`);
}
L.push("", "Haiku at low read the first 0.3.0 table worse than the 0.2.0 one: in its weak run most misses took the first step of a ladder for the",
  "start. No run of the 0.3.0 skill under-routed a risky prompt. This led to the changes tested next.", "",
  "### 2.2 Start column, small-bug rule, named-effort rule: paired re-test, 49 prompts", "",
  "\"Before\" is the skill of 2.1; \"after\" has a start column of its own and two new lines (a small bug with all its code given is a scoped",
  "fix; an effort named in the prompt wins). 36 core prompts are placed alike by both; 6 small bugs, 5 named efforts and 2 controls test the new lines.", "",
  "| Judge | Skill | Core right of 36 | Small bugs of 6 | Named effort of 5 | Controls of 2 | Risky under-routed |", "| --- | --- | --- | --- | --- | --- | --- |");
const g = (x, k) => x.groups[k].split("/")[0];
for (const [arm, lab] of [["current", "before"], ["changed", "after"]]) {
  const r = t2.filter(x => x.answers.startsWith(arm + "_"));
  L.push(`| Haiku low, 4 runs | ${lab} | ${list(r, x => g(x, "core"))} | ${list(r, x => g(x, "small-bug"))} | ${list(r, x => g(x, "named-effort"))} | ${list(r, x => g(x, "control"))} | ${list(r, x => x.risky_under_routed)} |`);
}
const sonnet2 = {};
for (const [arm, lab] of [["current", "before"], ["changed", "after"]]) {
  const r = [1, 2].map(i => { const o = node("routing/score_traps.js", P(`routing/traps2-run/sonnet-${arm}_${i}.json`), "--policy", P("routing/traps3-run/policy.json"), "--set", P("routing/traps2.jsonl")).stdout; return JSON.parse(o.slice(o.indexOf("{"))); });
  sonnet2[arm] = r.map(x => ({ groups: x.groups, risky_under_routed: x.risky_under_routed }));
  L.push(`| Sonnet medium, 2 runs | ${lab} | ${list(r, x => g(x, "core"))} | ${list(r, x => g(x, "small-bug"))} | ${list(r, x => g(x, "named-effort"))} | ${list(r, x => g(x, "control"))} | ${list(r, x => x.risky_under_routed)} |`);
}
L.push("", "The \"before\" skill has no small-bug or named-effort rule, so its low figures there are not misses of that skill. With the start column,",
  `Haiku's picks on the first step of a ladder (the scorer's count per run, which includes a few that are not misreads) went from ${list(t2.filter(x => x.answers.startsWith("current_")), x => x.took_first_step)} to ${list(t2.filter(x => x.answers.startsWith("changed_")), x => x.took_first_step)}`,
  "and its weak run did not appear; that fits the start-column idea and",
  "does not prove it. Both judges follow the two new lines on these textbook cases. The risky under-route is one prompt, a refactor of payment",
  "retry code that Sonnet placed as an edit once in each arm.", "",
  "### 2.3 Four reworded lines: paired re-test, 69 prompts, three runs each", "",
  "\"Old\" is the \"after\" skill of 2.2; \"new\" rewords the writing row (day-to-day plans belong to it), the plan row (long-term plans only), the",
  "risky row (any change to code that takes payments, checks logins or holds secrets) and the line on what a mistake costs.", "",
  "| Figure (three runs each) | Haiku low, old | Haiku low, new | Sonnet medium, old | Sonnet medium, new |", "| --- | --- | --- | --- | --- |");
const ROWS =[["everyday plans", "Everyday plans right, of 6"], ["plan controls", "Plan controls right, of 6"], ["schedule edit", "Schedule edit right, of 1"],
  ["risky code", "Risky code below Opus high, of 7"], ["other risky", "Other risky prompts below Opus high, of 8"], ["near misses", "Near misses called risky, of 5"],
  ["core", "Core pick right, of 36"], ["all 69", "All 69 pick right"]];
for (const [key, lab] of ROWS) {
  const k = Object.keys(cmpJson).find(x => x.startsWith(key));
  const cell = s => { const m = /^(.*) of \d+\s+\(sum (\d+)\/(\d+)\)/.exec(s); return `${m[1]} (${m[2]} of ${m[3]})`; };
  L.push(`| ${lab} | ${["haiku-low old", "haiku-low new", "sonnet-medium old", "sonnet-medium new"].map(a => cell(cmpJson[k][a])).join(" | ")} |`);
}
L.push("", `By the rule written before the runs, the writing and plan rows are kept on evidence (everyday plans ${sums("everyday plans", ["haiku-low old", "sonnet-medium old"])} right with the old rows,`,
  `${sums("everyday plans", ["haiku-low new", "sonnet-medium new"])} with the new, and no control pulled the wrong way). The risky row and the mistake line showed no difference, because the old lines already`,
  `had no miss on these prompts (${sums("risky code", ["haiku-low old", "sonnet-medium old"])} below Opus high); they cost nothing here and stay on the owner's word. All ${t3.length} runs were valid.`, "");

// ----------------------------------------------------------------------------- 3. writing test
const w = J("writing/private/decision.json"), wx = J("writing/ext/private/decision.json");
const gd = (model, effort) => { const l = fs.readFileSync(P("../evidence/points.csv"), "utf8").split("\n").find(x => x.startsWith(`GDPval-AA v2.1,${model},${effort},`)).split(","); return { score: +l[3], cost: +l[l.length - 6] }; };
const ARM = { "haiku-xhigh": "Haiku 5.5 · xhigh", "sonnet-medium": "Sonnet 5.5 · medium", "sonnet-high": "Sonnet 5.5 · high" };
L.push("## 3. Writing test: where should writing start? (2026-11-12)", "",
  "Twelve invented writing tasks (emails, summaries, a translation, rewrites, explanations), each written twice by three arms. Two Opus 5.5 · high",
  "graders ranked the six texts of each task blind, each from a sheet with its own letter order. A pair is one task and run; an arm wins a pair",
  "when its text is ranked above the other arm's. Tasks, script checks, sheets and the decision rule were frozen by hash before the first writer ran.", "",
  "| Pairs won, of 24 (threshold 16 for both graders) | Grader 1 | Grader 2 |", "| --- | --- | --- |");
for (const c of w.comparisons) L.push(`| ${ARM[c.a]} over ${ARM[c.b]} | ${c.counts.g1.ranks} | ${c.counts.g2.ranks} |`);
L.push("", "| Per arm (grader 1 / grader 2) | " + Object.keys(ARM).map(a => ARM[a]).join(" | ") + " |", "| --- | --- | --- | --- |",
  "| Mean rank of 6 | " + Object.keys(ARM).map(a => `${w.stats.g1[a].meanRank} / ${w.stats.g2[a].meanRank}`).join(" | ") + " |",
  "| First places of 12 tasks | " + Object.keys(ARM).map(a => `${w.stats.g1[a].firsts} / ${w.stats.g2[a].firsts}`).join(" | ") + " |",
  "| Rubric mean of 5 | " + Object.keys(ARM).map(a => `${w.stats.g1[a].rubricMean} / ${w.stats.g2[a].rubricMean}`).join(" | ") + " |",
  "| Texts passing the script checks | " + Object.keys(ARM).map(a => `${w.scriptPass[a].pass} of ${w.scriptPass[a].of}`).join(" | ") + " |", "",
  `Sonnet medium sat on the threshold with one grader, so the rule's extension ran: one more run of Haiku xhigh and of Sonnet medium and two fresh`,
  `Opus graders. Totals for Sonnet medium over Haiku xhigh: ${wx.graders.g1.total.ranks} and ${wx.graders.g2.total.ranks} of ${wx.pairs} pairs against a threshold of ${wx.threshold}. Sonnet high also beat Haiku xhigh`,
  "but was not preferred to Sonnet medium, so by the rule Sonnet medium is the start for writing. All 8 writer runs and 4 grader runs were valid.",
  `The graders ordered a pair of texts the same way in ${w.graderAgreement.same} of ${w.graderAgreement.of}. The one failed script check is a false alarm of a frozen pattern.`, "",
  "What followed: the write start was set to Sonnet 5.5 · medium by hand (`start_by_test` in `evidence/routing-inputs.json`), on the owner's word and",
  `without the owner's own blind ranking. The vendor benchmark behind the write ladder says the opposite at that step (GDPval-AA v2.1: Haiku xhigh`,
  `${gd("Haiku 5.5", "xhigh").score} Elo at $${gd("Haiku 5.5", "xhigh").cost.toFixed(3)} a task, Sonnet medium ${gd("Sonnet 5.5", "medium").score} at $${gd("Sonnet 5.5", "medium").cost.toFixed(3)}); \`evidence/ladders.md\` shows both. Limits: every grader is Opus 5.5 and may share a`,
  `taste with Sonnet; tasks, facts and checks are Claude's; ${wx.pairs} pairs; Haiku's texts were usable (rubric ${w.stats.g1["haiku-xhigh"].rubricMean} and ${w.stats.g2["haiku-xhigh"].rubricMean} of 5), the graders preferred Sonnet's.`, "");

// ----------------------------------------------------------------------------- 4. tier bench (0.2.0, stored)
const old = J("results-0.2.0.json");
const names = { A: "A search: 6 questions over a 12-file repo", B: "B edit: 6 functions from a spec, hidden tests", C: "C debug: 6 buggy functions, hidden tests", D: "D review: 10 snippets (3 safe) + 10 claims" };
L.push("## 4. Tier bench of 0.2.0 (2026-11-06, stored; not re-run for 0.3.0)", "",
  "| Group | Haiku 5.5 · low | Sonnet 5.5 · medium | Opus 5.5 · high |", "| --- | --- | --- | --- |");
for (const k of "ABCD") L.push(`| ${names[k]} | ` + ["haiku", "sonnet", "opus"].map(t => { const x = old.tiers[`${k}-${t}`]; return `${x.score}/${x.of} · ${(x.ms / 1000).toFixed(1)} s`; }).join(" | ") + " |");
L.push("", "Every tier solved every item: these small, fully specified tasks don't separate the models, which is why 0.3.0 takes its ladders from",
  "published benchmark curves (`evidence/`) and not from this bench. Re-grading needs Python (`python3 -I bench/tiers/tasks.py grade A <answers>`):",
  "the graders run the answers' Python code against hidden tests.", "");

// ----------------------------------------------------------------------------- 5. hooks and build
const hk = node("hooks/test_hooks.js"), hooks = jsonLine(hk.stdout, "last");
const bc = node("../tools/build.js", "--check"), build = bc.stdout.trim().split("\n");
L.push("## 5. Hooks and build", "",
  `${hooks.hook_cases_passed} of ${hooks.hook_cases} hook cases pass (\`bench/hooks/test_hooks.js\`, one case holding 23 delegation-keyword prompts); \`UserPromptSubmit\` takes about`,
  `${Math.round(hooks.userpromptsubmit_ms_median)} ms median on the test machine, Node start-up included (0.2.0 in Python: ${old.hooks.userpromptsubmit_ms_median} ms on another machine, ${old.hooks.hook_cases_passed} of ${old.hooks.hook_cases} cases).`,
  `\`node tools/build.js --check\`: ${build[0]}; ${build[build.length - 1]}.`,
  "Seen live in a Claude Code session started from the desktop app: SessionStart puts the routing card into the context and UserPromptSubmit",
  "adds its line. Not seen live: the Stop hook, the spawn guard, and the plugin installed through `/plugin` (the test used a project settings hook).", "",
  "## 6. What these tests do not show", "",
  "- That the routing leads to better or cheaper work end to end: no outcome test has been run.",
  "- That the labels are right: every prompt set and label after heldout2 was written by Claude, often in the session that wrote the rule under test.",
  "- How much each model and effort weighs against plan limits: the cost curves are vendor-run benchmark results at API prices.",
  "- How reliably Claude writes the one-line note mid-session: the tests measure placement, not compliance.", "");

fs.writeFileSync(P("RESULTS.md"), L.join("\n"));
fs.writeFileSync(P("results.json"), JSON.stringify({ routing, judges, keyword_port_parity_heldout2: parity, first_keyword_run_heldout: first,
  traps: { first: t1, second_haiku: t2, second_sonnet: sonnet2, third: t3, third_compare: cmpJson },
  writing: { first_round: w.comparisons, extension: wx, stats: w.stats, script_checks: w.scriptPass, grader_agreement: w.graderAgreement },
  tiers_0_2_0: old.tiers, hooks, hooks_0_2_0: old.hooks, build_check: build }, null, 1) + "\n");
console.log(`wrote RESULTS.md (${L.length} lines) and results.json; hook suite ${hooks.hook_cases_passed}/${hooks.hook_cases}; build check exit ${bc.status}; port parity ${parity}`);
process.exitCode = hk.status || bc.status || !parity ? 1 : 0;
