#!/usr/bin/env node
/* Row-wording re-test, 2026-11-12: compares the two arms (old rows, new rows) per judge.

  node traps3-run/compare.js        (from bench/routing; reads traps3-run/runs.tsv, the answer files it names,
                                     ../traps3.jsonl and traps3-run/policy.json)

runs.tsv: run <tab> judge <tab> arm <tab> n <tab> answers file. Scoring follows score_traps.js (same normalising,
same expected pick); this script adds the figures the decision rule needs: per group and arm the number of
right picks, how often a prompt was called risky, how often a risky prompt was placed below Opus high, and a
table of the prompts on which the arms differ most.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = __dirname;
const rows = fs.readFileSync(path.join(DIR, "..", "traps3.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const pol = JSON.parse(fs.readFileSync(path.join(DIR, "policy.json"), "utf8"));
const MODELS = ["haiku", "sonnet", "opus", "fable"];
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];
const rank = p => pol.models[p[0]].rank * 10 + pol.efforts[p[1]];
const expected = r => r.accept_new || [r.check && pol.classes[r.class].checked ? pol.classes[r.class].checked.max : pol.classes[r.class].max];
function norm(g) {
  if (!g || typeof g !== "object") return null;
  const low = v => (typeof v === "string" ? v.toLowerCase().trim() : v);
  let pick = g.pick;
  if (Array.isArray(pick) && pick.length === 2) {
    const m = low(pick[0]), e = String(low(pick[1])).replace(/[\s_-]+/g, "");
    pick = [MODELS.find(k => typeof m === "string" && m.includes(k)) || m, e === "extrahigh" ? "xhigh" : e];
  }
  return { class: low(g.class), pick };
}
const runs = fs.readFileSync(path.join(DIR, "runs.tsv"), "utf8").trim().split("\n").map(l => l.split("\t"))
  .map(([run, judge, arm, n, file]) => ({ run, judge, arm, n, file, got: JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")) }));
const judges = [...new Set(runs.map(r => r.judge))], arms = ["old", "new"];
const of = (judge, arm) => runs.filter(r => r.judge === judge && r.arm === arm);

// The sets the decision rule names
const SETS = {
  "everyday plans (t-21, t-50..53, t-67): pick right": { ids: ["t-21", "t-50", "t-51", "t-52", "t-53", "t-67"], what: "right" },
  "plan controls (t-20, t-35, t-54..56, t-69): pick right": { ids: ["t-20", "t-35", "t-54", "t-55", "t-56", "t-69"], what: "right" },
  "schedule edit (t-68): pick right": { ids: ["t-68"], what: "right" },
  "risky code (t-30, t-57..62): below Opus high": { ids: ["t-30", "t-57", "t-58", "t-59", "t-60", "t-61", "t-62"], what: "under" },
  "other risky prompts from traps2 (without t-30): below Opus high": { ids: rows.filter(r => r.class === "risky" && !r.group && r.id !== "t-30").map(r => r.id).concat(["t-49"]), what: "under" },
  "near misses (t-11, t-63..66): called risky": { ids: ["t-11", "t-63", "t-64", "t-65", "t-66"], what: "risky" },
  "core (36 prompts without a group): pick right": { ids: rows.filter(r => !r.group).map(r => r.id), what: "right" },
  "all 69: pick right": { ids: rows.map(r => r.id), what: "right" },
};
const byId = Object.fromEntries(rows.map(r => [r.id, r]));
function count(run, id, what) {
  const r = byId[id], g = norm(run.got[id]);
  if (!g || !Array.isArray(g.pick)) return what === "right" ? 0 : (what === "under" ? 1 : 0);   // a missing answer is a miss
  if (what === "right") return +expected(r).some(p => eq(p, g.pick));
  if (what === "under") return +(rank(g.pick) < rank(pol.classes.risky.max));
  return +(g.class === "risky");
}
const out = {};
for (const [name, set] of Object.entries(SETS)) {
  out[name] = {};
  for (const judge of judges) for (const arm of arms) {
    const per = of(judge, arm).map(run => set.ids.reduce((a, id) => a + count(run, id, set.what), 0));
    out[name][`${judge} ${arm}`] = `${per.join(", ")} of ${set.ids.length}  (sum ${per.reduce((a, b) => a + b, 0)}/${per.length * set.ids.length})`;
  }
}
console.log(JSON.stringify(out, null, 1));

// Prompts on which the arms differ by two or more right picks (all judges together), and every fresh prompt
console.log("\nper prompt, right picks old → new (Haiku runs, Sonnet runs); class answers of the misses");
for (const r of rows) {
  const cell = (judge, arm) => of(judge, arm).reduce((a, run) => a + count(run, r.id, "right"), 0);
  const tot = arm => judges.reduce((a, j) => a + cell(j, arm), 0);
  const fresh = +r.id.slice(2) >= 50, key = ["t-21", "t-30", "t-11"].includes(r.id);
  if (!fresh && !key && Math.abs(tot("old") - tot("new")) < 2) continue;
  const miss = arm => runs.filter(x => x.arm === arm && !count(x, r.id, "right")).map(x => { const g = norm(x.got[r.id]); return g ? `${g.class}:${(g.pick || []).join("/")}` : "missing"; });
  const tally = a => Object.entries(a.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {})).map(([k, v]) => `${v}× ${k}`).join(", ");
  console.log(`${r.id} [${r.group || "core"}, ${r.class}] ${judges.map(j => `${j} ${cell(j, "old")}→${cell(j, "new")}`).join("; ")}` +
              `${miss("old").length ? `  | old misses: ${tally(miss("old"))}` : ""}${miss("new").length ? `  | new misses: ${tally(miss("new"))}` : ""}`);
}
