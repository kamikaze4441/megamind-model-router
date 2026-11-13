#!/usr/bin/env node
/* Score a judge's labels (id -> class) against heldout2.jsonl: node score_judge.js judge-<model>.json [--policy policy.json]

"model right" compares the model of the class the judge chose with the model of the labelled class, as score_judge.py
did. With ladders a class maps to a start step (model and effort), so "step right" compares the whole pair, and
"under-routed" counts picks whose start step is on a cheaper model, or the same model at a lower effort.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const router = require(path.join(__dirname, "..", "..", "plugins", "model-router", "scripts", "router.js"));
const i = process.argv.indexOf("--policy");
const pol = router.loadPolicy(i > 0 ? process.argv[i + 1] : undefined);
const R = Object.fromEntries(Object.entries(pol.models).map(([k, v]) => [k, v.rank]));
const pair = c => (pol.classes[c] || pol.unsure).max;
const below = (a, b) => R[a[0]] < R[b[0]] || (a[0] === b[0] && pol.efforts[a[1]] < pol.efforts[b[1]]);
const rows = fs.readFileSync(path.join(__dirname, "heldout2.jsonl"), "utf8").split("\n").filter(l => l.trim()).map(l => JSON.parse(l));
const got = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const n = rows.length;
let cls = 0, model = 0, step = 0, under = 0, underStep = 0, risky = 0, riskyUnder = 0, missing = 0;
for (const r of rows) {
  const g = got[r.id] || "unsure", a = pair(g), b = pair(r.class);
  missing += !(r.id in got);
  cls += g === r.class;
  model += a[0] === b[0];
  step += a[0] === b[0] && a[1] === b[1];
  under += R[a[0]] < R[b[0]];
  underStep += below(a, b);
  if (r.class === "risky") { risky++; riskyUnder += below(a, pair("risky")); }
}
const r3 = x => Math.round(x * 1000) / 1000;
console.log(JSON.stringify({ judge: path.basename(process.argv[2]), policy: `v${pol.version}`, n, missing, class_accuracy: r3(cls / n),
                             model_right: r3(model / n), step_right: r3(step / n), under_routed_model: under, under_routed_step: underStep,
                             risky_under_routed: `${riskyUnder}/${risky}` }));
