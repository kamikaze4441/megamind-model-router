#!/usr/bin/env node
// model-router evidence build (draft, planning phase).
// Reads evidence/raw/*.csv (chart points copied from vendor launch pages), writes evidence/points.csv
// (one row per benchmark x model x effort, with source) and prints, per benchmark, the efficient frontier:
// the pairs no other pair beats on both score and cost. Usage: node tools/frontier.js [--fable-weight N]
// The raw files come from: curl -sL <launch page> -o page.html; node tools/charts.js page.html evidence/raw/<name>.csv
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "evidence");
const SOURCES = {
  "anthropic-fable-5-2-charts.csv": { url: "https://www.anthropic.com/claude-fable-and-mythos-5-2", published: "2026-11-09", rank: 4 },
  "anthropic-claude-haiku-5-5-charts.csv": { url: "https://www.anthropic.com/claude-haiku-5-5", published: "2026-10-07", rank: 3 },
  "anthropic-claude-sonnet-5-5-charts.csv": { url: "https://www.anthropic.com/claude-sonnet-5-5", published: "2026-09-28", rank: 2 },
  "anthropic-claude-opus-5-5-charts.csv": { url: "https://www.anthropic.com/claude-opus-5-5", published: "", rank: 1 },
};
const wi = process.argv.indexOf("--fable-weight");
const FABLE_W = wi > 0 ? +process.argv[wi + 1] : 1;   // multiplies Fable cost: 1 = dollar curves as published, 2 = Fable must win at twice the cost
const CURRENT = ["Haiku 5.5", "Sonnet 5.5", "Opus 5.5", "Fable 5.2"];
const EFFORTS = { Low: "low", Med: "medium", High: "high", Xhigh: "xhigh", Max: "max" };
const BENCH = { "WANDR (relaxed score)": "WANDR" };

function parseLine(l) {
  const out = []; let cur = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur); return out;
}

const rows = [];
for (const [file, src] of Object.entries(SOURCES)) {
  const p = path.join(ROOT, "raw", file);
  if (!fs.existsSync(p)) continue;
  for (const l of fs.readFileSync(p, "utf8").trim().split("\n").slice(1)) {
    const [bench, modelRaw, effRaw, x, y, xl, yl] = parseLine(l);
    const effort = EFFORTS[effRaw.trim()];
    if (!effort) continue;                       // time-series charts (no effort label) are not routing evidence
    let model = modelRaw.replace(/\*\*/g, "").trim();
    let note = "";
    const m = model.match(/^(.*?)\s*\((.*)\)$/);
    if (m) { model = m[1]; note = m[2]; }
    if (/\$0\.20 cache reads/.test(note)) continue; // Sonnet 5.5 cache reads cost $0.10; keep that variant
    rows.push({ bench: BENCH[bench] || bench, model, effort, cost: +x, score: +y, unit: yl, cost_unit: xl.replace(/ \(USD, log scale\)/, ""),
      source: src.url, published: src.published, rank: src.rank, read: "2026-11-11", grade: "vendor" });
  }
}
// one row per benchmark x model x effort: the newest page wins
const best = new Map();
for (const r of rows) { const k = [r.bench, r.model, r.effort].join("|"); if (!best.has(k) || best.get(k).rank < r.rank) best.set(k, r); }
const points = [...best.values()].sort((a, b) => a.bench.localeCompare(b.bench) || a.model.localeCompare(b.model) || a.cost - b.cost);
const head = "benchmark,model,effort,score,score_unit,cost_usd,cost_unit,grade,source,published,read";
fs.writeFileSync(path.join(ROOT, "points.csv"), head + "\n" + points.map(r =>
  [r.bench, r.model, r.effort, r.score, r.unit, r.cost, r.cost_unit, r.grade, r.source, r.published, r.read].map(v => /,/.test(String(v)) ? `"${v}"` : v).join(",")).join("\n") + "\n");

const byBench = {};
for (const r of points) if (CURRENT.includes(r.model)) (byBench[r.bench] = byBench[r.bench] || []).push(/^Fable/.test(r.model) ? { ...r, cost: r.cost * FABLE_W } : r);
if (FABLE_W !== 1) console.log(`Fable cost multiplied by ${FABLE_W}.`);
const short = r => `${r.model.replace(/ 5\.\d/, "")} ${r.effort}`;
for (const [bench, rs] of Object.entries(byBench)) {
  const models = [...new Set(rs.map(r => r.model))];
  if (models.length < 2) continue;
  const frontier = rs.filter(r => !rs.some(o => o !== r && o.cost <= r.cost && o.score >= r.score && (o.cost < r.cost || o.score > r.score)))
    .sort((a, b) => a.cost - b.cost);
  const top = Math.max(...rs.map(r => r.score));
  const elo = /elo/i.test(rs[0].unit);
  const near = rs.filter(r => (elo ? top - r.score <= 60 : top - r.score <= 3)).sort((a, b) => a.cost - b.cost)[0];
  const dominated = rs.filter(r => !frontier.includes(r)).map(short);
  console.log(`\n### ${bench} (${models.map(m => m.replace(/ 5\.\d/, "")).join(", ")}; ${rs[0].unit})`);
  console.log("Frontier, cheapest first: " + frontier.map(r => `${short(r)} ${r.score} @ $${r.cost < 1 ? r.cost.toFixed(3) : r.cost.toFixed(2)}`).join(" → "));
  console.log(`Cheapest within ${elo ? "60 Elo" : "3 points"} of the best (${top}): ${short(near)} @ $${near.cost < 1 ? near.cost.toFixed(3) : near.cost.toFixed(2)}`);
  console.log("Never worth it here: " + (dominated.join(", ") || "none"));
}
console.error(`\npoints.csv: ${points.length} rows, ${Object.keys(byBench).length} benchmarks with current Claude models`);
