#!/usr/bin/env node
// Reads a helper transcript (.jsonl) and prints what the run really was:
// models and efforts recorded, every tool call with its file path, and how often given phrases occur.
// Usage: node transcript_check.js <agent.jsonl> [--needle "text"]... [--ctx "text"]
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const needles = [];
let ctx = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--needle') needles.push(args[++i]);
  else if (args[i] === '--ctx') ctx = args[++i];
}
const raw = fs.readFileSync(file, 'utf8');
const lines = raw.split('\n').filter(Boolean);

const count = (re) => {
  const m = {};
  for (const x of raw.matchAll(re)) m[x[1]] = (m[x[1]] || 0) + 1;
  return m;
};

// Assistant turns: the model that answered, and the tools it called.
const answered = {};
const tools = [];
let usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
for (const l of lines) {
  let o;
  try { o = JSON.parse(l); } catch { continue; }
  const msg = o.message;
  if (o.type === 'assistant' && msg) {
    answered[msg.model] = (answered[msg.model] || 0) + 1;
    const u = msg.usage || {};
    usage.input += u.input_tokens || 0;
    usage.output += u.output_tokens || 0;
    usage.cacheRead += u.cache_read_input_tokens || 0;
    usage.cacheWrite += u.cache_creation_input_tokens || 0;
    for (const c of msg.content || []) {
      if (c.type === 'tool_use' || c.type === 'server_tool_use') {
        const inp = c.input || {};
        tools.push(c.name + (inp.file_path ? ' ' + inp.file_path : inp.command ? ' ' + String(inp.command).slice(0, 80) : ''));
      }
    }
  }
}

const out = {
  file: file.split('/').pop(),
  lines: lines.length,
  answeredBy: answered,
  modelStrings: count(/"model":"([^"]+)"/g),
  effort: count(/"effort":"([^"]+)"/g),
  perTurnEffort: count(/"perTurnEffort":"([^"]+)"/g),
  toolCalls: tools,
  usage,
  needles: Object.fromEntries(needles.map((n) => [n, raw.split(n).length - 1])),
};
console.log(JSON.stringify(out, null, 1));
if (ctx) {
  let i = raw.indexOf(ctx), n = 0;
  while (i !== -1 && n < 3) {
    console.log('--- ctx ' + (n + 1) + ': ' + JSON.stringify(raw.slice(Math.max(0, i - 200), i + ctx.length + 260)));
    i = raw.indexOf(ctx, i + 1); n++;
  }
}
