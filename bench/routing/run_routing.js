#!/usr/bin/env node
/* Routing accuracy bench: node run_routing.js <set.jsonl> [--show-misses] [--json out.json] [--policy policy.json]
                                               [--expect stored-results.json]

Scores the keyword classifier's class and model against labelled prompts:
  class accuracy, model accuracy (the recommended model), under-routes (a cheaper model than the
  label's), over-routes, and how often the router stays silent (unsure or low confidence).
The policy's rules (small bug, named effort) are left out, so the figures are the bare classifier's; --rules applies them.
--expect compares every count and the confusion table with a stored result (ms_per_prompt aside)
and exits 1 on any difference. Port of run_routing.py.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const router = require(path.join(__dirname, "..", "..", "plugins", "model-router", "scripts", "router.js"));

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const policy = router.loadPolicy(arg("--policy") || undefined);
if (!process.argv.includes("--rules")) delete policy.rules;   // the sets were labelled before the small-bug and named-effort rules
const RANK = Object.fromEntries(Object.entries(policy.models).map(([k, v]) => [k, v.rank]));
const tier = cls => (policy.classes[cls] || policy.unsure).max[0];
const round3 = x => Math.round(x * 1000) / 1000;

function main() {
  const file = process.argv[2];
  const rows = fs.readFileSync(file, "utf8").split("\n").filter(l => l.trim()).map(l => JSON.parse(l));
  const n = rows.length;
  let clsOk = 0, tierOk = 0, under = 0, over = 0, silent = 0, riskyTotal = 0, riskyUnder = 0, highN = 0, highOk = 0;
  const conf = {}, misses = [];
  const t0 = process.hrtime.bigint();
  for (const r of rows) {
    const out = router.route(r.prompt, policy);
    const got = out.class, want = r.class;
    const gm = tier(got), wm = tier(want);
    conf[want] = conf[want] || {};
    conf[want][got] = (conf[want][got] || 0) + 1;
    clsOk += got === want;
    tierOk += gm === wm;
    under += RANK[gm] < RANK[wm];
    over += RANK[gm] > RANK[wm];
    silent += got === "unsure" || out.confidence === "low";
    if (out.confidence === "high") { highN++; highOk += got === want; }
    if (want === "risky") { riskyTotal++; riskyUnder += RANK[gm] < RANK[wm]; }
    if (got !== want) misses.push([r.id, want, got, out.confidence, r.prompt.slice(0, 110)]);
  }
  const dt = Number(process.hrtime.bigint() - t0) / 1e6 / Math.max(n, 1);
  const res = {
    set: path.basename(file), n,
    class_accuracy: round3(clsOk / n), tier_accuracy: round3(tierOk / n),
    under_routed: under, over_routed: over, silent,
    risky_under_routed: `${riskyUnder}/${riskyTotal}`,
    ms_per_prompt: round3(dt), confusion: conf,
  };
  const { confusion, ...flat } = res;
  console.log(JSON.stringify({ ...flat, high_confidence: `${highOk}/${highN} right` }));
  if (process.argv.includes("--show-confusion")) {
    for (const want of router.PRIORITY) console.log(`  ${want.padEnd(9)}`, JSON.stringify(conf[want] || {}));
  }
  if (process.argv.includes("--show-misses")) for (const m of misses) console.log("  MISS", JSON.stringify(m));
  if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify(res, null, 1));
  const expect = arg("--expect");
  if (expect) {
    let want = JSON.parse(fs.readFileSync(expect, "utf8"));
    if (want.routing) want = want.routing[arg("--expect-key") || res.set];
    const diffs = [];
    for (const k of ["n", "class_accuracy", "tier_accuracy", "under_routed", "over_routed", "silent", "risky_under_routed"]) {
      if (want[k] !== res[k]) diffs.push(`${k}: stored ${want[k]}, got ${res[k]}`);
    }
    if (want.confusion) {
      for (const w of new Set([...Object.keys(want.confusion), ...Object.keys(conf)])) {
        for (const g of new Set([...Object.keys(want.confusion[w] || {}), ...Object.keys(conf[w] || {})])) {
          const a = (want.confusion[w] || {})[g] || 0, b = (conf[w] || {})[g] || 0;
          if (a !== b) diffs.push(`confusion ${w} -> ${g}: stored ${a}, got ${b}`);
        }
      }
    }
    console.log(diffs.length ? `PARITY FAIL (${diffs.length}):\n  ` + diffs.join("\n  ")
      : `PARITY OK with ${path.basename(expect)}${want.confusion ? " (counts and confusion table)" : " (counts)"}`);
    if (diffs.length) process.exitCode = 1;
  }
}

main();
