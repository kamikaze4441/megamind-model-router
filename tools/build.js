#!/usr/bin/env node
/* model-router build: evidence -> policy.json -> every file that carries the routing table.

  node tools/build.js            write the outputs
  node tools/build.js --check    write nothing; exit 1 if an output on disk differs from what the inputs give
  node tools/build.js --print    print the ladders and stop

Inputs:  evidence/points.csv (built by tools/frontier.js from the launch-page chart data)
         evidence/routing-inputs.json (hand-written: floors, starts, the ladders of classes without a benchmark)
Outputs: plugins/model-router/scripts/policy.json, hooks/hooks.json, .claude-plugin/plugin.json (version),
         agents/*.md (model and effort lines), skills/route/SKILL.md, skill/model-router/SKILL.md,
         chat/instructions.txt, chat/claude-md.txt, the table block in README.md, evidence/ladders.md.
The routing card is not a file: router.js builds it from policy.json when a session starts; the checks below read it too.
Node 18+, no dependencies.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const rd = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const IN = JSON.parse(rd("evidence/routing-inputs.json"));
const MODELS = IN.models, EFF = IN.efforts, RULE = IN.rule, PROFILES = Object.keys(IN.profiles);
const opt = n => { const i = process.argv.indexOf(n); return i > 0 ? +process.argv[i + 1] : null; };   // --print only: try other constants
if (opt("--near-tie") !== null) RULE.near_tie = opt("--near-tie");
if (opt("--tolerance") !== null) RULE.tolerance = { points: opt("--tolerance"), elo: opt("--tolerance") * 20 };
const TRIAL = opt("--near-tie") !== null || opt("--tolerance") !== null;
if (TRIAL && !process.argv.includes("--print")) throw new Error("--near-tie and --tolerance only go with --print");
const keyOfLabel = Object.fromEntries(Object.entries(MODELS).map(([k, v]) => [v.label, k]));

// ----------------------------------------------------------------------------- evidence -> ladders

function parseLine(l) {
  const out = []; let cur = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur); return out;
}
const POINTS = rd("evidence/points.csv").trim().split("\n").slice(1).map(parseLine)
  .map(([bench, model, effort, score, unit, cost]) => ({ bench, model: keyOfLabel[model], effort, score: +score, unit, cost: +cost }))
  .filter(p => p.model);                                   // current models only
const id = p => `${p.model || p[0]}/${p.effort || p[1]}`;
const short = p => `${MODELS[p[0]].label.replace(/ \d.*/, "")} · ${p[1]}`;
const full = p => `${MODELS[p[0]].label} · ${p[1]}`;
const money = c => "$" + (c < 1 ? c.toFixed(3) : c.toFixed(2));

function benchPoints(bench, prof) {
  const P = IN.profiles[prof];
  const rows = POINTS.filter(p => p.bench === bench && P.models.includes(p.model) && !RULE.exclude_efforts.includes(p.effort))
    .map(p => (p.model === "fable" ? { ...p, cost: p.cost * P.fable_weight } : p));
  if (!rows.length) throw new Error(`no points for "${bench}" in profile ${prof}`);
  return rows;
}
const frontier = rows => rows
  .filter(r => !rows.some(o => o !== r && o.cost <= r.cost && o.score >= r.score && (o.cost < r.cost || o.score > r.score)))
  .sort((a, b) => a.cost - b.cost);

function dataLadder(cls, prof) {
  const c = IN.classes[cls], log = [];
  const [lead, ...others] = c.benchmarks;
  let steps = frontier(benchPoints(lead, prof));
  log.push(`Lead benchmark: ${lead}. Not beaten on score and cost: ${steps.map(p => `${short([p.model, p.effort])} ${p.score} @ ${money(p.cost)}`).join(" → ")}`);
  for (const b of others) {                               // a pair another listed benchmark shows as beaten is removed
    const rows = benchPoints(b, prof), ok = new Set(frontier(rows).map(id)), has = new Set(rows.map(id));
    const out = steps.filter(p => has.has(id(p)) && !ok.has(id(p)));
    if (out.length) log.push(`Removed, beaten on ${b}: ${out.map(p => short([p.model, p.effort])).join(", ")}`);
    steps = steps.filter(p => !out.includes(p));
  }
  const [fm, fe] = c.floor;
  const below = steps.filter(p => MODELS[p.model].rank < MODELS[fm].rank || (p.model === fm && EFF[p.effort] < EFF[fe]));
  if (below.length) log.push(`Below the floor (${short(c.floor)}): ${below.map(p => short([p.model, p.effort])).join(", ")}`);
  steps = steps.filter(p => !below.includes(p));
  const merged = [];                                      // pairs within near_tie in cost are one step: the higher score stays
  for (let i = 0; i < steps.length;) {
    let j = i;
    while (j + 1 < steps.length && steps[j + 1].cost <= steps[i].cost * (1 + RULE.near_tie)) j++;
    if (j > i) log.push(`Same cost within ${RULE.near_tie * 100}%: ${steps.slice(i, j + 1).map(p => short([p.model, p.effort])).join(", ")}; kept ${short([steps[j].model, steps[j].effort])}`);
    merged.push(steps[j]); i = j + 1;
  }
  const tol = /elo/i.test(merged[0].unit) ? RULE.tolerance.elo : RULE.tolerance.points;
  const kept = [merged[0]], small = [];
  for (const p of merged.slice(1)) (p.score - kept[kept.length - 1].score >= tol ? kept : small).push(p);
  if (small.length) log.push(`Gain under ${tol} ${/elo/i.test(merged[0].unit) ? "Elo" : "points"} over the step below: ${small.map(p => short([p.model, p.effort])).join(", ")}`);
  if (c.start_by_test && IN.profiles[prof].models.includes(c.start_by_test.pair[0])) {   // a step set by hand from an own test
    const s = c.start_by_test, i = kept.findIndex(p => id(p) === id(s.replaces)), t = benchPoints(lead, prof).find(p => id(p) === id(s.pair));
    if (i < 0 || !t) throw new Error(`${cls}/${prof}: start_by_test wants ${short(s.pair)} in place of ${short(s.replaces)}, but ${i < 0 ? `${short(s.replaces)} is no longer a step` : `${short(s.pair)} has no point on ${lead}`}. Look at the new evidence, then change or drop start_by_test.`);
    log.push(`Step set by hand from an own test: ${short(s.pair)} (${t.score} @ ${money(t.cost)}) in place of ${short(s.replaces)} (${kept[i].score} @ ${money(kept[i].cost)}). ${s.why}`);
    kept[i] = t;
  }
  if (c.top && IN.profiles[prof].models.includes(c.top[0]) && id(kept[kept.length - 1]) !== id(c.top)) {   // a top step set by hand
    const t = steps.find(p => id(p) === id(c.top));
    if (!t) throw new Error(`${cls}/${prof}: the top step ${short(c.top)} is beaten or missing on ${lead}`);
    kept.splice(0, kept.length, ...kept.filter(p => id(p) !== id(c.top)), t);
    log.push(`Top step added by hand: ${short(c.top)} (${c.top_why})`);
  }
  log.push(`Ladder: ${kept.map(p => `${short([p.model, p.effort])} (${p.score} @ ${money(p.cost)})`).join(" → ")}`);
  return { ladder: kept.map(p => [p.model, p.effort]), log };
}

function ladders() {
  const out = {};
  for (const cls of IN.class_order) {
    const c = IN.classes[cls];
    out[cls] = {};
    for (const prof of PROFILES) {
      let r;
      if (c.benchmarks) r = dataLadder(cls, prof);
      else {
        const ladder = c.ladder.filter(p => IN.profiles[prof].models.includes(p[0]));
        r = { ladder, log: [`Judgment${c.ladder_why ? ` (${c.ladder_why.replace(/^judgment: /, "")})` : ": no benchmark stands in for this class"}. Ladder: ${ladder.map(short).join(" → ")}`] };
      }
      if (!r.ladder.length) throw new Error(`${cls}/${prof}: empty ladder`);
      const start = Math.min(c.start, r.ladder.length - 1);
      const want = c.start_pair && c.start_pair[prof];
      if (want && !TRIAL && JSON.stringify(r.ladder[start]) !== JSON.stringify(want)) {
        throw new Error(`${cls}/${prof}: the start step is now ${short(r.ladder[start])}, routing-inputs.json expects ${short(want)}. Ladder: ${r.ladder.map(short).join(" → ")}. Look at the new evidence, then change start or start_pair.`);
      }
      out[cls][prof] = { ...r, start, checked: c.checkable ? Math.max(0, start - 1) : start };
    }
  }
  return out;
}

// ----------------------------------------------------------------------------- policy.json

const L = ladders();
function policy() {
  const classes = {};
  for (const cls of IN.class_order) {
    const c = IN.classes[cls], e = {};
    for (const prof of PROFILES) e[prof] = L[cls][prof].ladder[L[cls][prof].start];   // the start pair, where 0.2 had the one fixed pair
    Object.assign(e, { why: c.why, help: c.help, delegate: c.delegate, basis: c.benchmarks ? "data" : "judgment", checkable: !!c.checkable });
    if (c.start_by_test) e.start_basis = "own test";
    if (c.plan_first) e.plan_first = true;
    if (c.no_step_down) e.no_step_down = true;
    if (c.not_below_author) e.not_below_author = true;
    if (c.note) e.note = c.note;
    e.ladders = Object.fromEntries(PROFILES.map(p => [p, L[cls][p].ladder]));
    e.checked = Object.fromEntries(PROFILES.map(p => [p, L[cls][p].ladder[L[cls][p].checked]]));
    classes[cls] = e;
  }
  const base = MODELS.haiku.input_usd_per_mtok;
  return {
    version: 2,
    note: "Generated by tools/build.js from evidence/points.csv and evidence/routing-inputs.json: change those and rebuild. Each class has a ladder per profile, cheapest step first; max, pro and lean hold the start step and checked the step to start on when the result can be checked cheaply. The hooks re-read this file on every prompt.",
    plugin_version: IN.plugin_version,
    profile: IN.default_profile,
    models: MODELS, efforts: EFF,
    classes,
    unsure: { ...Object.fromEntries(PROFILES.map(p => [p, IN.unsure.pair])), why: IN.unsure.why },
    rules: { small_bug: pickKeys(IN.rules.small_bug, ["from", "as", "ask", "then", "why", "max_code_lines"]),
             named_effort: pickKeys(IN.rules.named_effort, ["floor_class", "ask", "then", "why"]) },
    helpers: Object.fromEntries(Object.entries(IN.helpers).map(([k, v]) => [k, v.pair])),
    summary_helper: IN.summary_helper.pair,
    agents: Object.fromEntries(Object.entries(IN.helpers).map(([k, v]) => [k, `model-router:${k} (${full(v.pair)}): ${v.does}`])),
    price_ratio: Object.fromEntries(Object.entries(MODELS).map(([k, v]) => [k, Math.round(v.input_usd_per_mtok / base)])),
    excluded_efforts: RULE.exclude_efforts,
    orchestrator: IN.orchestrator,
  };
}
function pickKeys(o, keys) { return Object.fromEntries(keys.map(k => [k, o[k]])); }
function stringify(o) {                                    // one line per pair list, like the 0.2 file
  return JSON.stringify(o, null, 2)
    .replace(/\[\s*("[^"\[\]]*"(?:,\s*"[^"\[\]]*")*)\s*\]/g, (_, a) => "[" + a.replace(/\s*\n\s*/g, " ") + "]")
    .replace(/\[\s*((?:\["[^\]]*"\],?\s*)+)\]/g, (_, a) => "[" + a.trim().replace(/\s*\n\s*/g, " ") + "]") + "\n";
}

// ----------------------------------------------------------------------------- text carriers

const POL = policy();
const ladderText = (cls, prof, lab = short) => L[cls][prof].ladder.map((p, i) => (i === L[cls][prof].start && L[cls][prof].ladder.length > 1 ? `**${lab(p)}**` : lab(p))).join(" → ");
const startOf = (cls, prof) => L[cls][prof].ladder[L[cls][prof].start];
const checkedOf = (cls, prof) => L[cls][prof].ladder[L[cls][prof].checked];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const upsOf = (cls, prof) => L[cls][prof].ladder.slice(L[cls][prof].start + 1);
// The start comes first and is named as the start. A ladder with the start marked in the middle was read by
// Haiku · low as starting at its first step (trap test, 2026-11-12).
const stepsText = (cls, prof, lab = short) => {
  const s = startOf(cls, prof), c = checkedOf(cls, prof), up = upsOf(cls, prof);
  return lab(s) + (same(s, c) ? "" : ` (${lab(c)} with a cheap check)`) + (up.length ? `, then ${up.map(lab).join(" → ")}` : "");
};
const ratio = Object.entries(POL.price_ratio).map(([k, v]) => `${MODELS[k].label.replace(/ \d.*/, "")}${k === "haiku" ? " is" : ""} ${v}`).join(", ");
const helperPair = k => short(IN.helpers[k].pair);
const NICK = { quick: "lookups", search: "searches", write: "writing and day-to-day plans", edit: "scoped edits", debug: "debugging",
               risky: "anything with money, security, data or live servers, and any change to code that handles them",
               review: "reviews and fact-checks", research: "research", plan: "architecture and long-term plans for a system or project" };
// The two rules on top of the table come from evidence/routing-inputs.json. where: the carrier's words for the start model.
const RULES = IN.rules;
const bugRule = lab => RULES.small_bug.then.replace("{pair}", lab(startOf(RULES.small_bug.as, "max")));
const effortRule = (lab, where) => RULES.named_effort.then.replace("{where}", where).replace("{floor}", lab(startOf(RULES.named_effort.floor_class, "max")));
const rulesLine = (lab, where) => `${RULES.small_bug.ask} ${bugRule(lab)} ${RULES.named_effort.ask} ${effortRule(lab, where)}`.replace(/\.$/, "");
for (const p of PROFILES) for (const k of [RULES.small_bug.as, RULES.named_effort.floor_class]) {   // the rule texts name one pair for every plan
  if (!same(startOf(k, p), startOf(k, "max"))) throw new Error(`rules: ${k} starts on another pair in profile ${p}, and the rule texts name one pair`);
}

function rows(prof) {                                      // classes that share a ladder and a start share a row
  const out = [];
  for (const cls of IN.class_order) {
    const sig = JSON.stringify([L[cls].max, L[cls].pro, IN.classes[cls].plan_first]);
    const hit = out.find(r => r.sig === sig);
    if (hit) hit.classes.push(cls); else out.push({ sig, classes: [cls] });
  }
  return out;
}
function suffix(cls) {
  const c = IN.classes[cls];
  if (c.plan_first) return `, plan first; never lower; ${c.note}`;
  if (c.not_below_author) return "; never below the pair that did the work";
  return "";
}
function startsLine(prof, lab = short) {                   // one clause per row: where each kind of work starts
  const R = rows(prof), names = r => r.classes.map(c => NICK[c]).join(" and ");
  const lower = R.filter(r => !same(startOf(r.classes[0], prof), checkedOf(r.classes[0], prof)));
  return R.map(r => `${names(r)} → ${lab(startOf(r.classes[0], prof))}`).join("; ")
    + (lower.length ? `. When a test, a command or a lookup can check the result, start one step lower: ${lower.map(r => `${names(r)} → ${lab(checkedOf(r.classes[0], prof))}`).join("; ")}` : "")
    + IN.class_order.filter(c => IN.classes[c].note).map(c => `. ${IN.classes[c].note.replace(/^./, x => x.toUpperCase())}`).join("")
    + `. ${rulesLine(lab, "the start model of that kind of work")}`;
}

function leanSteps() {
  const diff = IN.class_order.filter(c => !same(L[c].max.ladder, L[c].lean.ladder) || L[c].max.start !== L[c].lean.start);
  return diff.length ? diff.map(c => `${NICK[c]} starts on ${stepsText(c, "lean")}`).join("; ") : "no change";
}

function skillMd() {
  const table = rows("max").map(r => {
    const cls = r.classes[0], s = startOf(cls, "max"), c = checkedOf(cls, "max"), up = upsOf(cls, "max");
    const task = r.classes.map((c, i) => (i ? IN.classes[c].task.replace(/^./, x => x.toLowerCase()) : IN.classes[c].task)).join("; ");
    const pro = same(L[cls].max, L[cls].pro) ? "same" : stepsText(cls, "pro") + (IN.classes[cls].plan_first ? ", plan first" : "");
    return `| ${task} | **${short(s)}**${suffix(cls)} | ${same(s, c) ? "—" : short(c)} | ${up.length ? up.map(short).join(" → ") : "—"} | ${pro} |`;
  }).join("\n");
  return `---
name: model-router
description: Picks the Claude model and effort that fit a task from measured cost and score curves, and hands bulk work to cheaper helpers. Use at the start of every task, when a prompt starts with "orchestrate" or "solo", or when asked which model or effort to use.
---

# Model router

## 1. Check the fit (every task)

Start on the pair in the second column; the next two columns say when to start lower and where to climb. Models: ${Object.values(MODELS).map(m => m.label).join(", ")}. Efforts: low, medium, high, xhigh (Extra high).

| Task | Start on (Max plan) | Start here instead when a cheap check exists | Then climb to | On Pro, start on |
| --- | --- | --- | --- | --- |
${table}

- **Can the result be checked cheaply** (tests, a command, a fact to look up)? Then start on the pair in the third column, run the check, and climb one step each time it fails. Writing and plans have no such check.
- **${RULES.small_bug.ask}** ${bugRule(short)}
- **${RULES.named_effort.ask}** ${effortRule(short, "the row's start model")}
- **What does a mistake cost?** Judge what is being touched, not the kind of change: money, security, data or a live system puts the task on the risky row, whatever else it is.
- **How many steps, how much bulk reading?** These decide what goes to helpers (section 2), not the step.

When unsure: ${short(IN.unsure.pair)}. Max effort is on no ladder: it rarely beats xhigh and costs 2.5 to 3 times as much, so use it on request only. When the Fable allowance runs short: ${leanSteps()}.

If the model or effort you're running is below the task's step, or well above it on a lookup, writing or scoped-edit task, open the reply with one line, \`⚙ Better on <model> · <effort>: <reason>\`, then answer. Say nothing when it fits. An effort change keeps the cache and a model switch re-reads the whole chat, so suggest model switches at the start of a task. In Claude Code, a long task on Sonnet or Opus can also get a stronger second opinion: suggest \`/advisor fable\` once.

## 2. Delegate

The first word of a prompt sets how much goes to helpers. \`${IN.orchestrator.keyword_off}\` turns the router off for that prompt: no helpers and no "Better on" line. \`${IN.orchestrator.keyword_on} low\` keeps the work with you and uses helpers only for bulk reading and test runs. \`${IN.orchestrator.keyword_on}\` or \`${IN.orchestrator.keyword_on} high\` has you plan, check and answer while helpers do the rest. With no keyword it is high when you run Opus or Fable at ${IN.orchestrator.min_effort} or above, otherwise low. The words low and high here say how much is delegated and never change the effort: "${IN.orchestrator.keyword_on} at high effort" asks for effort high.

- **${helperPair("scout")} helpers:** search, read and extract from many files or pages; run tests and commands and report the output. For long material to summarize, ${short(IN.summary_helper.pair)}.
- **${helperPair("builder")} helpers:** drafts and routine edits from a clear brief.
- **Keep for yourself:** planning, hard code, reviews, fact-checks, the final answer, and risky work in every mode. Haiku fact-checks flag correct text as wrong, and cheap coders under an Opus planner did worse than Opus alone on hard tasks.
- **Brief every helper:** the goal, the inputs (paths, links, text) and "Done when:" with a check you can run or see. Re-run that check yourself before using the result. Send a failure back with the output attached; after two failures, do that step yourself.
- **Cost:** per input token ${ratio}. In the Claude app a helper starts with a fresh context of about 90k tokens, so delegate only bulk work and do small steps yourself.
- Run independent helpers in parallel. Never give a helper a Fable model.

## 3. Report

After a task that used helpers, add one line naming each helper that ran (model · effort) and what it did.
`;
}

function routeMd() {
  const workers = Object.entries(IN.helpers).map(([k, v]) => `model-router:${k} (${full(v.pair)}: ${v.does.split(";")[0]})`).join(", ");
  const lad = prof => rows(prof).map(r => `${r.classes.join(" and ")}: ${stepsText(r.classes[0], prof, full)}${IN.classes[r.classes[0]].plan_first ? ", plan first" : ""}`).join("; ");
  return `---
name: route
description: Show the model-router ladders and which model and effort fit a task. Type /model-router:route followed by the task.
argument-hint: "[task]"
disable-model-invocation: true
---

Answer in at most ten lines.

1. If a task was given ("$ARGUMENTS"), name its class (${IN.class_order.join(", ").replace(/, ([^,]*)$/, " or $1")}), the pair it starts on, whether a cheap check (tests, a command, a fact to look up) lets it start on the pair in parentheses, and which worker should take the bulk of it: ${workers}.
2. Then where each class starts. The first pair is the start, a pair in parentheses is the start when a cheap check exists, and the pairs after "then" are the steps to climb, one each time the check fails. Max plan: ${lad("max")}. Pro plan: ${lad("pro")}. When unsure: ${full(IN.unsure.pair)}. ${rulesLine(full, "the start model of that class")}. Max effort is on no ladder.
3. Remind: an effort change keeps the cache (\`/effort <level>\`, or \`ultrathink\` for one turn); a model switch (\`/model <name>\`) re-reads the conversation, so switch at the start of a task.
`;
}

const instructionsTxt = () => `Model router: if my task needs a different model or effort than the one you're running, open with one line, "⚙ Better on <model> · <effort>: <reason>", then answer; say nothing when it fits. Where each kind of work starts: ${startsLine("max")}. The model-router skill has the full ladders. When my prompt starts with "${IN.orchestrator.keyword_on}", or you're Opus or Fable at high, xhigh or max, work as orchestrator with the model-router skill: plan and check the work yourself, hand bulk searching, reading and test runs to ${helperPair("scout")} helpers and drafts or routine edits to ${helperPair("builder")} helpers, each with a "Done when" check you re-run. "${IN.orchestrator.keyword_on} low" keeps the work with you and uses helpers only for bulk reading and test runs. Keep reviews, fact-checks, hard code and risky work yourself, and skip helpers for small steps. "${IN.orchestrator.keyword_off}" at the start of a prompt turns all of this off.
`;

const claudeMd = () => `## model-router
- At the start of every task, place it on a ladder: ${startsLine("max")}. Full ladders: \`/model-router:route\`.
- If this session's model or effort is below the task's step, or well above it on a lookup, writing or scoped-edit task, open the reply with one line, \`⚙ Better on <model> · <effort>: <reason>\`, then do the task. Say nothing when it fits. For risky work on Haiku or Sonnet, ask before acting.
- Hand bulk searching and reading to \`model-router:scout\`, test runs to \`model-router:runner\`, routine edits to \`model-router:builder\` and risky diffs to \`model-router:reviewer\`; any other Agent call names a model. Small steps stay with you. A prompt starting with \`${IN.orchestrator.keyword_off}\` turns this off; \`${IN.orchestrator.keyword_on} low\` and \`${IN.orchestrator.keyword_on} high\` set how much is delegated.
`;

function readmeBlock() {
  const t = IN.class_order.map(cls => {
    const c = IN.classes[cls];
    const worker = { scout: "`scout`", builder: "`builder`, then `runner`", runner: "`runner` to reproduce", reviewer: "`reviewer` before applying" }[c.delegate] || "–";
    const s = startOf(cls, "max"), ck = checkedOf(cls, "max"), up = upsOf(cls, "max");
    const pro = same(L[cls].max, L[cls].pro) ? "same" : stepsText(cls, "pro", full);
    return `| ${cls}: ${c.help} | **${full(s)}**${c.plan_first ? ", plan first; never lower" : ""} | ${same(s, ck) ? "–" : full(ck)} | ${up.length ? up.map(full).join(" → ") : "–"} | ${pro} | ${c.benchmarks ? c.benchmarks.join(", ") + (c.start_by_test ? "; the start from an own test" : "") : "judgment"} | ${worker} |`;
  }).join("\n");
  const w = Object.entries(IN.helpers).map(([k, v]) => `\`${k}\` on ${full(v.pair)}`).join(", ");
  return `## The table

Each class has a start, the pair work begins on, and steps to climb when that is not enough. When the result can be checked
cheaply (tests, a command, a fact to look up), start on the pair in the third column and climb one step each time the check
fails.

| Class | Start on (Max) | Start here instead when a cheap check exists | Then climb to | On Pro, start on | Built from | Worker for the bulk |
| --- | --- | --- | --- | --- | --- | --- |
${t}

When unsure: ${full(IN.unsure.pair)}. ${rulesLine(full, "the start model of that class")}. Max effort is on no ladder.
When the Fable allowance runs short (\`MODEL_ROUTER_PROFILE=lean\`): ${leanSteps()}. Mid-task, change effort (\`/effort\`, or
\`ultrathink\` for one turn: the cache is kept) rather than the model (\`/model\` re-reads the whole conversation).

The ladders are built, not hand-written: \`node tools/build.js\` reads [\`evidence/points.csv\`](evidence/points.csv) (score and
cost per task for every model and effort, with sources) and [\`evidence/routing-inputs.json\`](evidence/routing-inputs.json)
(floors, starts and the classes no benchmark covers), and writes \`policy.json\`, the skill, the route skill, the workers and
this table. [\`evidence/ladders.md\`](evidence/ladders.md) shows the working for each class and its whole ladder, the steps
below the start included.

Workers (in \`plugins/model-router/agents/\`): ${w}. Every brief carries a "Done when:" check that the orchestrator re-runs
before it uses the result; after two failures it does that step itself.
`;
}

function laddersMd() {
  let s = `# Ladders (generated by tools/build.js; do not edit)\n\nRule: ${RULE.about}\nTolerance: ${RULE.tolerance.points} points or ${RULE.tolerance.elo} Elo. Efforts left out: ${RULE.exclude_efforts.join(", ")} (${RULE.exclude_efforts_why})\nScores and costs are vendor-run benchmark results at API prices; see EVIDENCE.md for their limits.\n`;
  for (const cls of IN.class_order) {
    const c = IN.classes[cls];
    s += `\n## ${cls}: ${c.help}\n`;
    if (c.floor) s += `Floor: ${short(c.floor)} (${c.floor_why}). Start: step ${c.start + 1}${c.checkable ? ", one lower when the result can be checked" : ""} (${c.start_by_test ? "set from an own test, see below" : "judgment"}).\n`;
    let prev = null;
    for (const prof of PROFILES) {
      const body = L[cls][prof].log.map(l => `- ${l}`).join("\n");
      s += `\n**${prof}** (${IN.profiles[prof].about}): start ${short(startOf(cls, prof))}\n` + (body === prev ? "- as above\n" : body + "\n");
      prev = body;
    }
  }
  return s;
}

function patched(file, edits) {                             // in-place edits of files that are mostly hand-written
  let s = rd(file);
  for (const [re, to, must] of edits) {
    if (must !== false && !re.test(s)) throw new Error(`${file}: nothing matches ${re}`);
    s = s.replace(re, to);
  }
  return s;
}

function outputs() {
  const o = {};
  o["plugins/model-router/scripts/policy.json"] = stringify(POL);
  const cmd = { type: "command", command: 'node "${CLAUDE_PLUGIN_ROOT}/scripts/router.js"', timeout: 10 };
  const ev = m => [m ? { matcher: m, hooks: [cmd] } : { hooks: [cmd] }];
  o["plugins/model-router/hooks/hooks.json"] = JSON.stringify({ hooks: { SessionStart: ev("startup|resume|clear|compact"), UserPromptSubmit: ev(),
    PreModelSwitch: ev(), PostModelSwitch: ev(), Stop: ev(), PreToolUse: ev("Agent|Task") } }, null, 2) + "\n";
  o["plugins/model-router/.claude-plugin/plugin.json"] = patched("plugins/model-router/.claude-plugin/plugin.json",
    [[/"version": "[^"]*"/, `"version": "${IN.plugin_version}"`]]);
  for (const [k, v] of Object.entries(IN.helpers)) {
    o[`plugins/model-router/agents/${k}.md`] = patched(`plugins/model-router/agents/${k}.md`,
      [[/^model: .*$/m, `model: ${v.pair[0]}`], [/^effort: .*$/m, `effort: ${v.pair[1]}`]]);
  }
  o["plugins/model-router/skills/route/SKILL.md"] = routeMd();
  o["skill/model-router/SKILL.md"] = skillMd();
  o["chat/instructions.txt"] = instructionsTxt();
  o["chat/claude-md.txt"] = claudeMd();
  o["README.md"] = patched("README.md", [[/<!-- table:start -->[\s\S]*<!-- table:end -->/, () => `<!-- table:start -->\n${readmeBlock()}<!-- table:end -->`]]);
  o["evidence/ladders.md"] = laddersMd();
  return o;
}

// ----------------------------------------------------------------------------- checks

function checks(o) {
  const bad = [];
  const allowed = new Set([IN.unsure.pair, IN.summary_helper.pair, ...Object.values(IN.helpers).map(h => h.pair)].map(id));
  for (const cls of IN.class_order) for (const prof of PROFILES) {
    const { ladder } = L[cls][prof];
    ladder.forEach(p => allowed.add(id(p)));
    if (ladder.some(p => RULE.exclude_efforts.includes(p[1]))) bad.push(`${cls}/${prof}: a left-out effort is on the ladder`);
    if (prof === "pro" && ladder.some(p => p[0] === "fable")) bad.push(`${cls}/pro: Fable on a Pro ladder`);
    if (IN.classes[cls].no_step_down && ladder.some(p => MODELS[p[0]].rank < MODELS.opus.rank || (p[0] === "opus" && EFF[p[1]] < EFF.high)))
      bad.push(`${cls}/${prof}: a step below Opus · high`);
    if (IN.classes[cls].benchmarks) {                        // every step is a measured pair no other pair beats on the lead benchmark
      const ok = new Set(frontier(benchPoints(IN.classes[cls].benchmarks[0], prof)).map(id));
      const hand = IN.classes[cls].start_by_test ? id(IN.classes[cls].start_by_test.pair) : null;   // the one step an own test put there
      ladder.forEach(p => { if (!ok.has(id(p)) && id(p) !== hand) bad.push(`${cls}/${prof}: ${short(p)} is beaten on the lead benchmark`); });
    }
  }
  for (const h of [...Object.values(IN.helpers), IN.summary_helper, IN.unsure]) if (h.pair[0] === "fable") bad.push("a helper or the unsure pick uses Fable");
  // every model · effort pair written anywhere must be a pair the policy knows, and every model version the current one
  const router = require(path.join(ROOT, "plugins/model-router/scripts/router.js"));
  const texts = { ...o };
  for (const prof of PROFILES) texts[`routing card (${prof})`] = router.card({ ...POL, profile: prof });
  texts["router.js"] = rd("plugins/model-router/scripts/router.js");
  delete texts["evidence/ladders.md"];                       // the working lists beaten pairs on purpose
  const names = Object.values(MODELS).map(m => m.label.replace(/ \d.*/, "")).join("|");
  for (const [file, text] of Object.entries(texts)) {
    for (const m of text.matchAll(new RegExp(`(${names})(?: (\\d+(?:\\.\\d+)?))? · (low|medium|high|xhigh|max)`, "gi"))) {
      const key = m[1].toLowerCase();
      if (!allowed.has(`${key}/${m[3].toLowerCase()}`)) bad.push(`${file}: "${m[0]}" is not a pair in the policy`);
    }
    if (new RegExp(`\\*\\*(?:${names})[^*|]*\\*\\* →|→ \\*\\*(?:${names})|\\[(?:${names})[^\\]]* · `).test(text)) bad.push(`${file}: a start is marked inside a ladder (the start goes first)`);
    for (const m of text.matchAll(new RegExp(`(${names}) (\\d+\\.\\d+)`, "g"))) {
      if (MODELS[m[1].toLowerCase()].label !== m[0] && !/written by|bench/i.test(text.slice(Math.max(0, m.index - 200), m.index)))
        bad.push(`${file}: "${m[0]}" is not the current ${m[1]}`);
    }
  }
  const lines = o["skill/model-router/SKILL.md"].trimEnd().split("\n").length;
  if (lines > 46) bad.push(`skill is ${lines} lines (limit 46)`);
  return { bad, lines, bytes: Buffer.byteLength(o["skill/model-router/SKILL.md"]) };
}

// ----------------------------------------------------------------------------- main

if (process.argv.includes("--print")) {
  for (const cls of IN.class_order) for (const prof of PROFILES) console.log(`${cls.padEnd(9)}${prof.padEnd(5)}${ladderText(cls, prof)}`);
  process.exit(0);
}
const o = outputs();
const check = process.argv.includes("--check");
const changed = Object.keys(o).filter(f => !fs.existsSync(path.join(ROOT, f)) || rd(f) !== o[f]);
if (!check) for (const f of changed) { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), o[f]); }
const c = checks(o);
console.log(check ? (changed.length ? `OUT OF DATE: ${changed.join(", ")}` : `up to date: ${Object.keys(o).length} outputs match the inputs`)
  : `wrote ${changed.length} of ${Object.keys(o).length} outputs${changed.length ? ": " + changed.join(", ") : ""}`);
console.log(`skill: ${c.lines} lines, ${c.bytes} bytes`);
console.log(c.bad.length ? `CHECKS FAILED (${c.bad.length}):\n  ` + c.bad.join("\n  ") : "checks pass: ladders, pairs and model versions agree in every output");
process.exitCode = (check && changed.length) || c.bad.length ? 1 : 0;
