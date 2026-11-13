#!/usr/bin/env node
/* Trap prompts for the part of routing a script cannot do: Claude reading the skill and placing a task.

  node score_traps.js --prompts                     the 40 prompts without labels
  node score_traps.js --task <SKILL.md>             the whole task text for a judge: instructions, that skill, the prompts
  node score_traps.js --keywords                    score the hook's delegation-keyword parser on them (no model needed)
  node score_traps.js <answers.json> --policy <policy.json> [--repeat <answers2.json>] [--show-misses]

A judge is a Claude model given one skill text (the 0.2.0 skill or the new one) and the prompts, asked to
answer for each id: {"class": "...", "pick": ["model", "effort"], "mode": "solo" | "low" | "high" | null}, where
pick is the model and effort the skill says the task should run on and mode is what the first word asks for.
The expected pick comes from the policy that matches the skill: the class's pair for 0.2.0; for the ladder
policy the start step, or the step below it when the prompt carries a cheap check ("check": true).
--repeat scores how often a second run of the same judge gives the same pick.

Answers are normalised before scoring ("Haiku 5.5" to haiku, "Extra high" to xhigh, "none" to null); the
output counts the values that needed it and the answers that still hold a value outside the allowed sets.
For the 0.2.0 policy the output also has pick_right_tier_lower_ok: the 0.2.0 skill lets "small, fully
specified tasks" go one tier lower without saying which tasks those are, so this figure also accepts the
model one tier below the expected one on any prompt that is not risky (the most the rule could excuse).
quick_search_swaps counts quick answered as search or the reverse (the new skill has them in one row).
--set <file> reads another prompt file in place of traps.jsonl (also for --prompts, --task and --keywords).
traps2.jsonl is the 40 prompts with four relabelled after the first run ("relabelled" says why) plus nine new
ones; its rows carry "group" (small-bug, named-effort, control; none = core, the prompts both skill versions
place alike) and the output then has pick-right per group. took_first_step counts answers that give the
cheapest step of the labelled class's ladder where a higher step is expected (classes whose ladder begins at its
start are left out); took_first_step_core is the same count on the prompts without a group.
The labels were written by Claude (Fable 5.2), not by a person: read the scores with that in mind.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const router = require(path.join(__dirname, "..", "..", "plugins", "model-router", "scripts", "router.js"));
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const rows = fs.readFileSync(arg("--set") || path.join(__dirname, "traps.jsonl"), "utf8").split("\n").filter(l => l.trim()).map(l => JSON.parse(l));
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];

const MODELS = ["haiku", "sonnet", "opus", "fable"];
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];
const CLASSES = ["quick", "search", "write", "edit", "debug", "risky", "review", "research", "plan"];
const MODES = ["solo", "low", "high", null];

const TASK = `# Task

Below are a skill (instructions for choosing a Claude model and effort) and ${rows.length} user prompts. For each prompt, say where the skill places it. Use only the skill text in this file and ignore any other guidance about models or effort that you may have. Do not carry out the prompts. Assume the Max plan.

Write one JSON object, and nothing else, to a file named answers.json in the same folder as this file. Its keys are the prompt ids and each value is {"class": C, "pick": [M, E], "mode": D}:

- C is the kind of task: one of quick, search, write, edit, debug, risky, review, research, plan (quick is a short question with a known answer; search is finding, reading or listing things).
- M and E are the model and effort the skill says this task should start on. M is one of haiku, sonnet, opus, fable. E is one of low, medium, high, xhigh, max.
- D is what a keyword at the very start of the prompt asks for about helpers: "solo" (no helpers), "high" (orchestrate: helpers do the bulk of the work), "low" (helpers only for bulk reading and test runs, if the skill has such a mode), or null when the prompt does not start with such a keyword.

Read this file once, write answers.json once, and use no other tool. Then reply with exactly one line:
MODEL=<the model name your own system prompt gives you>; OTHER=<yes or no: does your context, apart from this file, hold other instructions for choosing a model or effort>
`;

// One answer, cleaned: [answer, values changed, valid].
function norm(g) {
  let changed = 0;
  const low = v => typeof v === "string" ? v.toLowerCase().trim() : v;
  const fix = (v, to) => { if (v !== to) changed++; return to; };
  const cls = fix(g.class, low(g.class));
  let pick = g.pick;
  if (Array.isArray(pick) && pick.length === 2) {
    const m = low(pick[0]), e = String(low(pick[1])).replace(/[\s_-]+/g, "");
    const model = MODELS.find(k => typeof m === "string" && m.includes(k)) || m;
    const effort = e === "extrahigh" ? "xhigh" : e;
    if (model !== pick[0] || effort !== pick[1]) changed++;
    pick = [model, effort];
  }
  let mode = g.mode === undefined ? null : low(g.mode);
  if (mode === "none" || mode === "null" || mode === "") mode = null;
  if (mode !== (g.mode === undefined ? null : g.mode)) changed++;
  const valid = CLASSES.includes(cls) && Array.isArray(pick) && pick.length === 2 && MODELS.includes(pick[0]) && EFFORTS.includes(pick[1]) && MODES.includes(mode);
  return [{ class: cls, pick, mode }, changed, valid];
}

if (process.argv.includes("--prompts")) {
  for (const r of rows) console.log(JSON.stringify({ id: r.id, prompt: r.prompt }));
} else if (process.argv.includes("--task")) {
  console.log(TASK + "\n## Skill\n\n" + fs.readFileSync(arg("--task"), "utf8").trim() + "\n\n## Prompts\n");
  for (const r of rows) console.log(JSON.stringify({ id: r.id, prompt: r.prompt }));
} else if (process.argv.includes("--keywords")) {
  const pol = router.loadPolicy(arg("--policy") || undefined);
  const wrong = rows.filter(r => router.parseMode(r.prompt, pol).mode !== r.mode);
  console.log(JSON.stringify({ test: "delegation keywords (hook parser)", n: rows.length, right: rows.length - wrong.length,
                               wrong: wrong.map(r => `${r.id}: got ${router.parseMode(r.prompt, pol).mode}, expected ${r.mode}`) }));
  process.exitCode = wrong.length ? 1 : 0;
} else {
  const pol = router.loadPolicy(arg("--policy") || undefined);
  const v2 = pol.version >= 2;
  const rank = p => pol.models[p[0]].rank * 10 + pol.efforts[p[1]];
  const expected = r => {
    const e = pol.classes[r.class];
    const list = (v2 ? r.accept_new : r.accept_old) || [v2 && r.check && e.checked ? e.checked.max : e.max];
    return list;
  };
  const got = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const again = arg("--repeat") ? JSON.parse(fs.readFileSync(arg("--repeat"), "utf8")) : null;
  const groups = {}; let first = 0, firstCore = 0;
  let cls = 0, pick = 0, tier = 0, mode = 0, under = 0, riskyUnder = 0, risky = 0, banned = 0, same = 0, missing = 0, normalised = 0, invalid = 0, swaps = 0;
  const misses = [];
  for (const r of rows) {
    if (!got[r.id] || typeof got[r.id] !== "object") { missing++; continue; }
    const [g, changed, valid] = norm(got[r.id]);
    normalised += changed;
    if (!valid) invalid++;
    const exp = expected(r), ok = exp.some(p => eq(p, g.pick));
    cls += (r.accept_class || [r.class]).includes(g.class);
    const gr = groups[r.group || "core"] = groups[r.group || "core"] || [0, 0];
    gr[1]++; gr[0] += ok;
    const lad = v2 && pol.classes[r.class].ladders ? pol.classes[r.class].ladders.max : null;
    const tookFirst = !!(lad && !ok && !eq(lad[0], pol.classes[r.class].max) && eq(lad[0], g.pick) && !exp.some(p => eq(p, lad[0])));   // a ladder that begins at its start has no first step to misread
    first += tookFirst; firstCore += tookFirst && !r.group;
    swaps += g.class !== r.class && ["quick", "search"].includes(g.class) && ["quick", "search"].includes(r.class);
    pick += ok;
    tier += ok || (valid && r.class !== "risky" && exp.some(p => pol.models[g.pick[0]].rank === pol.models[p[0]].rank - 1));
    mode += g.mode === r.mode;
    const low = valid && rank(g.pick) < Math.min(...exp.map(rank));
    under += !!low;
    if (r.class === "risky") { risky++; riskyUnder += !!low; }
    if (r.not_models && valid && r.not_models.includes(g.pick[0])) banned++;
    if (again && again[r.id] && eq(norm(again[r.id])[0].pick, g.pick)) same++;
    if (!ok) misses.push(`${r.id} ${r.class}${g.class === r.class ? "" : " (answered " + g.class + ")"} (${r.trap}): got ${JSON.stringify(g.pick)}, expected ${JSON.stringify(exp)}`);
  }
  const n = rows.length;
  const out = { answers: path.basename(process.argv[2]), policy: `v${pol.version}`, n, missing, invalid, normalised, class_right: cls, quick_search_swaps: swaps, pick_right: pick };
  if (!v2) out.pick_right_tier_lower_ok = tier;
  if (v2) Object.assign(out, { took_first_step: first, took_first_step_core: firstCore });
  if (Object.keys(groups).length > 1) out.groups = Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, `${v[0]}/${v[1]}`]));
  Object.assign(out, { mode_right: mode, under_routed: under, risky_under_routed: `${riskyUnder}/${risky}`, fable_on_security: banned,
                       same_pick_on_repeat: again ? `${same}/${n}` : "not run" });
  console.log(JSON.stringify(out));
  if (process.argv.includes("--show-misses")) for (const m of misses) console.log("  MISS " + m);
}
