#!/usr/bin/env node
// End-to-end dry run on dummy texts in a throwaway folder: check, shuffle, round trip, decision rule.
// Usage: node dryrun.js <empty scratch dir>
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { ids, fileOf } = require('./check.js');

const root = process.argv[2];
if (!root) { console.error('give a scratch dir'); process.exit(1); }
const here = __dirname;
const RUNS = [['w01', 'haiku-xhigh', 1], ['w02', 'sonnet-medium', 1], ['w03', 'sonnet-high', 1], ['w04', 'haiku-xhigh', 2], ['w05', 'sonnet-high', 2], ['w06', 'sonnet-medium', 2]];
let bad = 0;
const ok = (cond, msg) => { if (!cond) { bad++; console.log('DRYRUN FAIL: ' + msg); } };

fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(path.join(root, 'private'), { recursive: true });
fs.writeFileSync(path.join(root, 'private', 'runs.tsv'), RUNS.map((r) => r.join('\t')).join('\n') + '\n');
for (const [f] of RUNS) {
  fs.mkdirSync(path.join(root, 'run', f), { recursive: true });
  for (const id of ids) fs.writeFileSync(path.join(root, 'run', f, fileOf(id)), `Dummy text of ${f} for ${id}.\nSecond line with <b>markup</b> & an ampersand.\n`);
}
// one missing file must be reported, then put back
fs.rmSync(path.join(root, 'run', 'w03', '07.txt'));
let out = execFileSync('node', [path.join(here, 'check.js'), '--root', root], { encoding: 'utf8' });
ok(/w03 sonnet-high run 1: 0 of 12 pass, 1 file\(s\) missing/.test(out), 'missing file not reported');
fs.writeFileSync(path.join(root, 'run', 'w03', '07.txt'), 'Dummy text of w03 for t07.\n');
execFileSync('node', [path.join(here, 'check.js'), '--root', root], { encoding: 'utf8' });

out = execFileSync('node', [path.join(here, 'shuffle.js'), '--root', root], { encoding: 'utf8' });
// round trip: every text in every sheet is the file its key names; letter orders differ between readers
const keys = {};
for (const reader of ['g1', 'g2', 'owner']) {
  const key = keys[reader] = JSON.parse(fs.readFileSync(path.join(root, 'private', `key-${reader}.json`), 'utf8'));
  const sheet = fs.readFileSync(path.join(root, 'sheets', reader, 'sheet.md'), 'utf8');
  for (const id of ids) {
    ok(Object.values(key[id]).slice().sort().join() === RUNS.map((r) => r[0]).sort().join(), `${reader} ${id}: key is not a permutation`);
    for (const [letter, folder] of Object.entries(key[id])) {
      const m = sheet.match(new RegExp(`----- ${id} text ${letter} \\((\\d+) words\\) -----\\n([\\s\\S]*?)\\n----- end of ${id} text ${letter} -----`));
      ok(m && m[2].startsWith(`Dummy text of ${folder} for ${id}.`), `${reader} ${id} ${letter}: sheet text is not ${folder}'s`);
    }
  }
  ok(!/w0\d|haiku|sonnet/i.test(sheet.replace(/Dummy text of w0\d/g, '')), `${reader}: sheet names a folder or an arm`);
}
ok(JSON.stringify(keys.g1) !== JSON.stringify(keys.g2) && JSON.stringify(keys.g1) !== JSON.stringify(keys.owner), 'readers share a letter order');
const again = execFileSync('node', [path.join(here, 'shuffle.js'), '--root', root], { encoding: 'utf8' });
ok(JSON.stringify(keys.g1) === fs.readFileSync(path.join(root, 'private', 'key-g1.json'), 'utf8').replace(/\s+/g, '').replace(/^/, '') || JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, 'private', 'key-g1.json'), 'utf8'))) === JSON.stringify(keys.g1), 'shuffle is not repeatable');
const h = fs.readFileSync(path.join(root, 'sheets', 'owner', 'sheet.html'), 'utf8');
ok(h.includes('&lt;b&gt;markup&lt;/b&gt; &amp; an ampersand') && !h.includes('<b>markup</b>'), 'html sheet does not escape text');

// fabricated grades: sonnet-medium above haiku in exactly k of the 24 pairs; sonnet-high always last
function writeGrades(k, opts = {}) {
  for (const g of ['g1', 'g2']) {
    const inv = Object.fromEntries(ids.map((id) => [id, Object.fromEntries(Object.entries(keys[g][id]).map(([l, f]) => [f, l]))]));
    const grades = {}; let n = 0;
    for (const id of ids) {
      const order = [];
      for (const [sm, hk] of [['w02', 'w01'], ['w06', 'w04']]) { n++; order.push(...(n <= k ? [sm, hk] : [hk, sm])); }
      order.push('w03', 'w05');
      const rank = order.map((f) => inv[id][f]);
      if (opts.dup && g === 'g2' && id === 't05') rank[1] = rank[0];
      grades[id] = { scores: Object.fromEntries('ABCDEF'.split('').map((l) => [l, { facts: 4, limits: 5, clear: 3, tone: 4, filler: 3 }])), rank, note: 'dummy' };
    }
    fs.writeFileSync(path.join(root, 'sheets', g, 'grades.json'), JSON.stringify(grades));
  }
}
function decide() {
  const r = spawnSync('node', [path.join(here, 'decide.js'), '--root', root], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, d: JSON.parse(fs.readFileSync(path.join(root, 'private', 'decision.json'), 'utf8')) };
}
const cmp = (d) => d.comparisons.find((c) => c.a === 'sonnet-medium' && c.b === 'haiku-xhigh');
for (const [k, wins, border] of [[14, false, false], [15, false, true], [16, true, true], [17, true, false], [24, true, false], [0, false, false]]) {
  writeGrades(k);
  const { code, d } = decide();
  const c = cmp(d);
  ok(code === 0 && c.pairs === 24 && c.threshold === 16, `k=${k}: pairs or threshold wrong`);
  ok(c.counts.g1.ranks === k && c.counts.g2.ranks === k && c.min === k, `k=${k}: counted ${JSON.stringify(c.counts)}`);
  ok(c.wins === wins && c.borderline === border, `k=${k}: wins ${c.wins}, borderline ${c.borderline}`);
  ok(/Haiku xhigh stays/.test(d.verdict) === !wins, `k=${k}: verdict "${d.verdict}"`);
  ok(d.comparisons.find((x) => x.a === 'sonnet-high' && x.b === 'haiku-xhigh').min === 0, `k=${k}: sonnet-high should win nothing`);
}
// script checks: k=16 by rank, but one winning Sonnet text fails its check while Haiku's passes -> 15 combined, no win;
// and a Haiku text that fails where Sonnet's passes turns a lost pair into a won one in the combined count only
writeGrades(16);
const checksPath = path.join(root, 'private', 'checks.json');
const base = JSON.parse(fs.readFileSync(checksPath, 'utf8'));
for (const f of Object.keys(base)) for (const id of ids) base[f][id] = { words: 100, ok: true, fails: [] };
let c1 = JSON.parse(JSON.stringify(base)); c1.w02.t01 = { words: 100, ok: false, fails: ['x'] };
fs.writeFileSync(checksPath, JSON.stringify(c1));
let r = decide(); let c = cmp(r.d);
ok(c.counts.g1.ranks === 16 && c.counts.g1.combined === 15 && !c.wins && c.borderline, 'script failure of the Sonnet text not applied');
let c2 = JSON.parse(JSON.stringify(base)); c2.w04.t12 = { words: 100, ok: false, fails: ['x'] };
fs.writeFileSync(checksPath, JSON.stringify(c2));
writeGrades(15);
r = decide(); c = cmp(r.d);
ok(c.counts.g1.ranks === 15 && c.counts.g1.combined === 16 && !c.wins, 'a win under one counting only must not win');
// invalid grader file
writeGrades(20, { dup: true });
r = decide();
ok(r.code === 2 && r.d.valid === false && /g2 t05/.test(r.out), 'duplicate letter in a rank not rejected');
// The owner's picks
writeGrades(20);
fs.writeFileSync(checksPath, JSON.stringify(base));
const hk = keys.owner;
const letterOf = (id, f) => Object.entries(hk[id]).find(([, v]) => v === f)[0];
fs.writeFileSync(path.join(root, 'sheets', 'owner', 'picks.txt'), `t01:${letterOf('t01', 'w02')}${letterOf('t01', 'w01')} t02:${letterOf('t02', 'w06')}- t04:${letterOf('t04', 'w03')}${letterOf('t04', 'w02')} t99:AB\n`);
r = decide();
ok(r.d.owner && r.d.owner.tasks === 3 && r.d.owner.topTwo['sonnet-medium'] === 3 && r.d.owner.topTwo['haiku-xhigh'] === 1 && r.d.owner.best['sonnet-high'] === 1 && r.d.owner.bad.length === 1 && r.d.owner.agrees['sonnet-medium'] === true, 'owner tally wrong: ' + JSON.stringify(r.d.owner));

console.log(bad ? `dry run: ${bad} problem(s)` : 'dry run ok: check, shuffle round trip for three readers, 6 threshold cases, 2 script-check cases, invalid grades, owner tally');
process.exit(bad ? 1 : 0);
