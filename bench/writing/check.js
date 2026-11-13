#!/usr/bin/env node
// Script checks on the writers' texts: file there, word limits, required facts, forbidden content.
// Usage: node check.js [--root DIR]      checks every run folder listed in DIR/private/runs.tsv,
//                                        writes DIR/private/checks.json, prints a summary
//        node check.js --selftest        tests every check against its own sample strings
const fs = require('fs');
const path = require('path');
const checks = require('./checks.js');

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const ids = Object.keys(checks).sort();
const fileOf = (id) => id.slice(1) + '.txt';

function checkText(id, text) {
  const c = checks[id];
  const fails = [];
  const t = text.replace(/^﻿/, '');
  const n = words(t);
  if (n === 0) return { words: 0, ok: false, fails: ['empty'] };
  if (n < c.min) fails.push(`too short (${n} < ${c.min})`);
  if (n > c.max) fails.push(`too long (${n} > ${c.max})`);
  for (const m of c.must) if (!m.test(t)) fails.push('missing: ' + m.name);
  for (const m of c.mustNot) if (m.test(t)) fails.push('has: ' + m.name);
  return { words: n, ok: fails.length === 0, fails };
}

function readRuns(root) {
  return fs.readFileSync(path.join(root, 'private', 'runs.tsv'), 'utf8').trim().split('\n')
    .map((l) => l.split('\t')).map(([folder, arm, run]) => ({ folder, arm, run: Number(run) }));
}

function selftest() {
  let bad = 0;
  const fail = (msg) => { bad++; console.log('SELFTEST FAIL: ' + msg); };
  for (const id of ids) {
    const c = checks[id];
    // 1. every ok sample satisfies its own check; every bad sample is caught
    for (const m of c.must) for (const s of m.ok) if (!m.test(m.first ? s : 'x ' + s + ' x')) fail(`${id} must "${m.name}" misses sample ${JSON.stringify(s)}`);
    for (const m of c.mustNot) for (const s of m.bad) if (!m.test('x ' + s + ' x')) fail(`${id} mustNot "${m.name}" misses sample ${JSON.stringify(s)}`);
    // 2. a text built from the first sample of each must, padded to the minimum, passes
    const build = (skip) => {
      const first = c.must.filter((m) => m.first && m !== skip).map((m) => m.ok[0]);
      const mid = c.must.filter((m) => !m.first && !m.line && m !== skip).map((m) => m.ok[0]);
      const lines = c.must.filter((m) => m.line && m !== skip).map((m) => m.ok[0].trim());
      let body = [...first, mid.join(' ')].join('\n');
      const pad = Math.max(0, c.min + 2 - words(body) - words(lines.join(' ')));
      body += ' ' + Array(pad).fill('lorem').join(' ');
      return body + (lines.length ? '\n' + lines.join('\n') : '');
    };
    const good = build(null);
    const r = checkText(id, good);
    if (!r.ok) fail(`${id} good text fails: ${r.fails.join('; ')}`);
    // 3. leaving out one fact fails exactly that check
    for (const m of c.must) {
      const r2 = checkText(id, build(m));
      // a sample of another check may also satisfy this one (e.g. two dates); only require that removal is noticed when it is not
      const stillThere = m.test(build(m));
      if (!stillThere && !r2.fails.includes('missing: ' + m.name)) fail(`${id} dropping "${m.name}" not noticed`);
    }
    // 4. each forbidden sample fails
    for (const m of c.mustNot) for (const s of m.bad) {
      const r3 = checkText(id, good + ' ' + s + ' x');
      if (!r3.fails.includes('has: ' + m.name)) fail(`${id} forbidden ${JSON.stringify(s)} not noticed`);
    }
    // 5. limits
    const long = good + ' ' + Array(c.max).fill('lorem').join(' ');
    if (!checkText(id, long).fails.some((f) => f.startsWith('too long'))) fail(`${id} too long not noticed`);
    if (!checkText(id, 'lorem ipsum').fails.some((f) => f.startsWith('too short'))) fail(`${id} too short not noticed`);
    if (checkText(id, '  \n ').fails[0] !== 'empty') fail(`${id} empty not noticed`);
  }
  console.log(bad ? `selftest: ${bad} problem(s)` : `selftest ok: ${ids.length} tasks, ${ids.reduce((a, id) => a + checks[id].must.length + checks[id].mustNot.length, 0)} checks`);
  process.exit(bad ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : __dirname;
  const runs = readRuns(root);
  const result = {};
  for (const { folder, arm, run } of runs) {
    result[folder] = {};
    let failed = 0, missing = 0;
    const lines = [];
    for (const id of ids) {
      const p = path.join(root, 'run', folder, fileOf(id));
      let r;
      if (!fs.existsSync(p)) { r = { words: 0, ok: false, fails: ['file missing'] }; missing++; }
      else r = checkText(id, fs.readFileSync(p, 'utf8'));
      result[folder][id] = r;
      if (!r.ok) { failed++; lines.push(`   ${id} (${r.words} w): ${r.fails.join('; ')}`); }
    }
    console.log(`${folder} ${arm} run ${run}: ${12 - failed} of 12 pass${missing ? `, ${missing} file(s) missing` : ''}`);
    for (const l of lines) console.log(l);
  }
  fs.writeFileSync(path.join(root, 'private', 'checks.json'), JSON.stringify(result, null, 1));
}

module.exports = { checkText, words, ids, fileOf, readRuns };
if (require.main === module) main();
