#!/usr/bin/env node
// Validates one helper run against RULE.md ("Valid runs") from its transcript and its folder.
// Usage: node validate.js writer <folder> <agent.jsonl> <model-id> <effort>
//        node validate.js grader <g1|g2> <agent.jsonl> <model-id> <effort>
// Written after the freeze (it judges runs, not texts). Exit 0 = valid, 1 = invalid.
const fs = require('fs');
const path = require('path');
const [kind, name, file, model, effort] = process.argv.slice(2);
const here = process.env.WT_ROOT || __dirname;
const dir = kind === 'writer' ? path.join(here, 'run', name) : path.join(here, 'sheets', name);
const raw = fs.readFileSync(file, 'utf8');
const problems = [], notes = [];

const answered = {}, tools = [];
const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
const seen = new Set();
for (const l of raw.split('\n').filter(Boolean)) {
  let o; try { o = JSON.parse(l); } catch { continue; }
  const msg = o.message;
  if (o.type !== 'assistant' || !msg) continue;
  answered[msg.model] = (answered[msg.model] || 0) + 1;
  if (msg.id && !seen.has(msg.id)) {
    seen.add(msg.id);
    const u = msg.usage || {};
    usage.input += u.input_tokens || 0; usage.output += u.output_tokens || 0;
    usage.cacheRead += u.cache_read_input_tokens || 0; usage.cacheWrite += u.cache_creation_input_tokens || 0;
  }
  for (const c of msg.content || []) if (/tool_use$/.test(c.type)) tools.push({ name: c.name, path: (c.input || {}).file_path || '' });
}
const count = (re) => { const m = {}; for (const x of raw.matchAll(re)) m[x[1]] = (m[x[1]] || 0) + 1; return m; };
const efforts = count(/"effort":"([^"]+)"/g), perTurn = count(/"perTurnEffort":"([^"]+)"/g);

if (Object.keys(answered).join() !== model) problems.push(`answered by ${JSON.stringify(answered)}, wanted ${model}`);
if (Object.keys(efforts).join() !== effort) problems.push(`effort ${JSON.stringify(efforts)}, wanted ${effort}`);
if (Object.keys(perTurn).join() !== effort) problems.push(`perTurnEffort ${JSON.stringify(perTurn)}, wanted ${effort}`);

const allowedRead = path.join(dir, kind === 'writer' ? 'task.md' : 'sheet.md');
const writes = {};
let reads = 0;
for (const t of tools) {
  if (t.name === 'SubagentHandback') continue; // the final report to the caller
  if (t.name === 'Read' && t.path === allowedRead) { reads++; continue; }
  if (t.name === 'Write' && path.dirname(t.path) === dir && (kind === 'writer' ? /^(0[1-9]|1[0-2])\.txt$/ : /^grades\.json$/).test(path.basename(t.path))) {
    writes[path.basename(t.path)] = (writes[path.basename(t.path)] || 0) + 1; continue;
  }
  problems.push(`tool call not allowed: ${t.name} ${t.path}`);
}
if (reads < 1) problems.push('never read its file');
if (reads > 1) notes.push(`${reads} Reads of its file`);
for (const [f, n] of Object.entries(writes)) if (n > 1) notes.push(`${f} written ${n} times`);
const want = kind === 'writer' ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0') + '.txt') : ['grades.json'];
for (const f of want) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p) || !fs.readFileSync(p, 'utf8').trim()) problems.push(`${f} missing or empty`);
}
const extra = fs.readdirSync(dir).filter((f) => !want.includes(f) && f !== path.basename(allowedRead));
if (extra.length) notes.push('extra files: ' + extra.join(', '));

const total = usage.input + usage.output + usage.cacheRead + usage.cacheWrite;
console.log(`${name} ${kind}: ${problems.length ? 'INVALID' : 'valid'} | model ${Object.keys(answered).join()} | effort ${Object.keys(efforts).join()} / per turn ${Object.keys(perTurn).join()} | reads ${reads}, writes ${Object.values(writes).reduce((a, b) => a + b, 0)} to ${Object.keys(writes).length} file(s) | tokens in ${usage.input} out ${usage.output} cache read ${usage.cacheRead} cache write ${usage.cacheWrite} (sum ${total})`);
for (const p of problems) console.log('  PROBLEM: ' + p);
for (const n of notes) console.log('  note: ' + n);
process.exit(problems.length ? 1 : 0);
