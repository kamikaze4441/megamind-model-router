#!/usr/bin/env node
// Applies the decision rule of the writing test (fixed before the run, see NOTES.md and README.md here).
// Usage: node decide.js [--root DIR]
// Reads  DIR/private/{runs.tsv,checks.json,key-g1.json,key-g2.json}, DIR/sheets/{g1,g2}/grades.json,
//        and, if present, DIR/sheets/owner/picks.txt  ("t01:CA t02:FB ...") with DIR/private/key-owner.json
// Writes DIR/private/decision.json and prints a report. Exit 2 = a grader file is invalid.
const fs = require('fs');
const path = require('path');
const { ids, readRuns } = require('./check.js');

const BASE = 'haiku-xhigh';
const COMPARE = [['sonnet-medium', BASE], ['sonnet-high', BASE], ['sonnet-high', 'sonnet-medium']];
const CRIT = ['facts', 'limits', 'clear', 'tone', 'filler'];
const GRADERS = ['g1', 'g2'];

const args = process.argv.slice(2);
const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : __dirname;
const J = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const runs = readRuns(root);
const arms = [...new Set(runs.map((r) => r.arm))];
const folderOf = (arm, run) => (runs.find((r) => r.arm === arm && r.run === run) || {}).folder;
const armOf = Object.fromEntries(runs.map((r) => [r.folder, r.arm]));
const checks = J('private/checks.json');

// ---- load and validate the graders' files
const rank = {}, score = {}, notes = {}, problems = [];
for (const g of GRADERS) {
  const key = J(`private/key-${g}.json`);
  let grades;
  try { grades = J(`sheets/${g}/grades.json`); } catch (e) { problems.push(`${g}: grades.json unreadable (${e.message})`); continue; }
  rank[g] = {}; score[g] = {}; notes[g] = {};
  for (const id of ids) {
    const letters = Object.keys(key[id]).sort();
    const t = grades[id];
    if (!t) { problems.push(`${g} ${id}: missing`); continue; }
    const r = t.rank;
    if (!Array.isArray(r) || r.length !== letters.length || r.slice().sort().join('') !== letters.join('')) {
      problems.push(`${g} ${id}: rank is not each letter once (${JSON.stringify(r)})`); continue;
    }
    rank[g][id] = {}; score[g][id] = {};
    r.forEach((l, i) => { rank[g][id][key[id][l]] = i + 1; });
    for (const l of letters) {
      const s = (t.scores || {})[l];
      if (!s || CRIT.some((c) => !Number.isInteger(s[c]) || s[c] < 1 || s[c] > 5)) { problems.push(`${g} ${id} ${l}: scores missing or not 1 to 5`); continue; }
      score[g][id][key[id][l]] = s;
    }
    notes[g][id] = t.note || '';
  }
}
if (problems.length) {
  console.log('INVALID grader file(s):\n ' + problems.join('\n '));
  fs.writeFileSync(path.join(root, 'private', 'decision.json'), JSON.stringify({ valid: false, problems }, null, 1));
  process.exit(2);
}

// ---- pairs: task t and run r, arm a's run r against arm b's run r
const maxRun = Math.max(...runs.map((r) => r.run));
function compare(a, b) {
  const counts = {}; let pairs = 0;
  const perKind = {};
  for (const g of GRADERS) counts[g] = { ranks: 0, combined: 0 };
  for (const id of ids) for (let r = 1; r <= maxRun; r++) {
    const fa = folderOf(a, r), fb = folderOf(b, r);
    if (!fa || !fb) continue;
    pairs++;
    const okA = checks[fa][id].ok, okB = checks[fb][id].ok;
    for (const g of GRADERS) {
      const byRank = rank[g][id][fa] < rank[g][id][fb];
      const combined = okA !== okB ? okA : byRank;
      if (byRank) counts[g].ranks++;
      if (combined) counts[g].combined++;
    }
  }
  const threshold = Math.ceil((pairs * 2) / 3);
  const min = Math.min(...GRADERS.flatMap((g) => [counts[g].ranks, counts[g].combined]));
  return { a, b, pairs, threshold, counts, min, wins: min >= threshold, borderline: min === threshold || min === threshold - 1 };
}
const comparisons = COMPARE.filter(([a, b]) => arms.includes(a) && arms.includes(b)).map(([a, b]) => compare(a, b));
const find = (a, b) => comparisons.find((c) => c.a === a && c.b === b);

// ---- verdict
const cm = find('sonnet-medium', BASE), ch = find('sonnet-high', BASE), chm = find('sonnet-high', 'sonnet-medium');
let verdict;
if (!cm.wins && !ch.wins) verdict = 'Haiku xhigh stays the start for writing: no Sonnet arm reached the threshold with both graders under both countings.';
else if (cm.wins && ch.wins) verdict = (chm.wins ? 'Sonnet high' : 'Sonnet medium') + ' is the candidate start (both Sonnet arms beat Haiku xhigh; Sonnet high ' + (chm.wins ? 'also beat' : 'did not beat') + ' Sonnet medium by the same rule). Provisional until the owner ranks.';
else verdict = (cm.wins ? 'Sonnet medium' : 'Sonnet high') + ' is the candidate start (it beat Haiku xhigh; the other Sonnet arm did not). Provisional until the owner ranks.';
const border = [cm, ch].filter((c) => c.borderline).map((c) => c.a);
if (border.length) verdict += ` BORDERLINE for ${border.join(' and ')}: one pair would flip it, so one more writer run for Haiku xhigh and that arm is graded and that result is final.`;

// ---- descriptive figures
const stats = {};
for (const g of GRADERS) {
  stats[g] = {};
  for (const arm of arms) {
    const fs_ = runs.filter((r) => r.arm === arm).map((r) => r.folder);
    let sumRank = 0, n = 0, firsts = 0, topTwo = 0;
    const crit = Object.fromEntries(CRIT.map((c) => [c, 0]));
    for (const id of ids) for (const f of fs_) {
      const rk = rank[g][id][f];
      sumRank += rk; n++; if (rk === 1) firsts++; if (rk <= 2) topTwo++;
      for (const c of CRIT) crit[c] += score[g][id][f][c];
    }
    stats[g][arm] = { meanRank: +(sumRank / n).toFixed(2), firsts, topTwo, texts: n,
      rubric: Object.fromEntries(CRIT.map((c) => [c, +(crit[c] / n).toFixed(2)])),
      rubricMean: +(CRIT.reduce((a, c) => a + crit[c], 0) / n / CRIT.length).toFixed(2) };
  }
}
const scriptPass = {};
for (const arm of arms) {
  const fs_ = runs.filter((r) => r.arm === arm).map((r) => r.folder);
  scriptPass[arm] = { pass: fs_.reduce((a, f) => a + ids.filter((id) => checks[f][id].ok).length, 0), of: fs_.length * ids.length };
}
// agreement of the two graders: share of text pairs within a task that both order the same way
let same = 0, all = 0;
const folders = runs.map((r) => r.folder);
for (const id of ids) for (let i = 0; i < folders.length; i++) for (let j = i + 1; j < folders.length; j++) {
  all++;
  const d1 = rank.g1[id][folders[i]] - rank.g1[id][folders[j]], d2 = rank.g2[id][folders[i]] - rank.g2[id][folders[j]];
  if (d1 * d2 > 0) same++;
}
// per kind of task: mean rank per arm (both graders)
const kinds = {};
const checksDef = require('./checks.js');
for (const id of ids) {
  const k = checksDef[id].kind; kinds[k] = kinds[k] || {};
  for (const f of folders) for (const g of GRADERS) {
    const a = armOf[f]; kinds[k][a] = kinds[k][a] || [0, 0];
    kinds[k][a][0] += rank[g][id][f]; kinds[k][a][1]++;
  }
}
const byKind = Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, [s, n]]) => [a, +(s / n).toFixed(2)]))]));

// ---- The owner's picks, if given
let owner = null;
const picksPath = path.join(root, 'sheets', 'owner', 'picks.txt');
if (fs.existsSync(picksPath)) {
  const key = J('private/key-owner.json');
  owner = { tasks: 0, best: {}, topTwo: {}, bad: [] };
  for (const arm of arms) { owner.best[arm] = 0; owner.topTwo[arm] = 0; }
  for (const tok of fs.readFileSync(picksPath, 'utf8').trim().split(/\s+/).filter(Boolean)) {
    const m = tok.match(/^(t\d\d):([A-H-])([A-H-])$/);
    if (!m || !key[m[1]] || (m[2] !== '-' && !key[m[1]][m[2]]) || (m[3] !== '-' && !key[m[1]][m[3]]) || (m[2] === m[3] && m[2] !== '-')) { owner.bad.push(tok); continue; }
    owner.tasks++;
    if (m[2] !== '-') { owner.best[armOf[key[m[1]][m[2]]]]++; owner.topTwo[armOf[key[m[1]][m[2]]]]++; }
    if (m[3] !== '-') owner.topTwo[armOf[key[m[1]][m[3]]]]++;
  }
  owner.agrees = Object.fromEntries(arms.filter((a) => a !== BASE).map((a) => [a, owner.topTwo[a] > owner.topTwo[BASE]]));
}

const decision = { valid: true, comparisons, verdict, stats, scriptPass, graderAgreement: { same, of: all, share: +(same / all).toFixed(3) }, byKind, owner, notes };
fs.writeFileSync(path.join(root, 'private', 'decision.json'), JSON.stringify(decision, null, 1));

// ---- report
console.log('Pairs won (task and run; first arm ranked above second):');
for (const c of comparisons) {
  console.log(` ${c.a} over ${c.b}: ` + GRADERS.map((g) => `${g} ${c.counts[g].ranks} by rank, ${c.counts[g].combined} with script checks`).join('; ') + ` | of ${c.pairs}, threshold ${c.threshold}, lowest ${c.min}${c.wins ? ' WINS' : ''}${c.borderline ? ' BORDERLINE' : ''}`);
}
console.log('Script checks passed: ' + arms.map((a) => `${a} ${scriptPass[a].pass}/${scriptPass[a].of}`).join(', '));
for (const g of GRADERS) console.log(`${g}: ` + arms.map((a) => `${a} mean rank ${stats[g][a].meanRank}, first ${stats[g][a].firsts}, top two ${stats[g][a].topTwo}, rubric ${stats[g][a].rubricMean}`).join(' | '));
console.log(`Graders order a pair of texts the same way in ${same} of ${all} (${(100 * same / all).toFixed(0)}%)`);
console.log('Mean rank by kind of task: ' + JSON.stringify(byKind));
if (owner) console.log('Owner: ' + JSON.stringify(owner));
console.log('VERDICT: ' + verdict);
