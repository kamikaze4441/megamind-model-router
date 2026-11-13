#!/usr/bin/env node
// Borderline rule of RULE.md: adds the extension run (ext/: one more Haiku xhigh and Sonnet medium run,
// two fresh graders) to the first 24 pairs and applies the threshold of 24 of 36. Written after the freeze,
// before the extension texts existed. Extension grader g1 is added to first-round grader g1, g2 to g2.
const fs = require('fs');
const path = require('path');
const { ids } = require('./check.js');
const J = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, p), 'utf8'));
const main = J('private/decision.json').comparisons.find((c) => c.a === 'sonnet-medium' && c.b === 'haiku-xhigh');
const checks = J('ext/private/checks.json');
const S = 'w08', H = 'w07';
const out = {}; const problems = [];
for (const g of ['g1', 'g2']) {
  const key = J(`ext/private/key-${g}.json`), grades = J(`ext/sheets/${g}/grades.json`);
  let ranks = 0, combined = 0, sFirst = 0;
  const rub = { [S]: 0, [H]: 0 };
  for (const id of ids) {
    const t = grades[id], letters = Object.keys(key[id]).sort();
    if (!t || !Array.isArray(t.rank) || t.rank.slice().sort().join('') !== letters.join('')) { problems.push(`${g} ${id}: bad rank`); continue; }
    const pos = {}; t.rank.forEach((l, i) => { pos[key[id][l]] = i; });
    for (const l of letters) { const s = (t.scores || {})[l]; if (!s) { problems.push(`${g} ${id} ${l}: no scores`); continue; } rub[key[id][l]] += (s.facts + s.limits + s.clear + s.tone + s.filler) / 5; }
    const byRank = pos[S] < pos[H];
    const okS = checks[S][id].ok, okH = checks[H][id].ok;
    if (byRank) ranks++;
    if (okS !== okH ? okS : byRank) combined++;
  }
  out[g] = { ext: { ranks, combined }, total: { ranks: main.counts[g].ranks + ranks, combined: main.counts[g].combined + combined },
    rubric: { 'sonnet-medium': +(rub[S] / 12).toFixed(2), 'haiku-xhigh': +(rub[H] / 12).toFixed(2) } };
}
if (problems.length) { console.log('INVALID: ' + problems.join('; ')); process.exit(2); }
const min = Math.min(out.g1.total.ranks, out.g1.total.combined, out.g2.total.ranks, out.g2.total.combined);
const res = { pairs: 36, threshold: 24, graders: out, min, wins: min >= 24 };
fs.writeFileSync(path.join(__dirname, 'ext/private/decision.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
console.log(res.wins ? 'FINAL: Sonnet medium beats Haiku xhigh (24 or more of 36 for both graders under both countings).' : 'FINAL: Sonnet medium does not reach 24 of 36 with both graders.');
