#!/usr/bin/env node
// Builds the blind sheets: for every reader an independent, seeded letter order per task.
// Usage: node shuffle.js [--root DIR]
// Reads  DIR/private/runs.tsv and DIR/run/<folder>/NN.txt
// Writes DIR/sheets/<reader>/sheet.md (graders g1, g2; plus sheet.html for the owner)
//        DIR/private/key-<reader>.json   {t01: {A: "w03", ...}, ...}   (never inside a sheet folder)
const fs = require('fs');
const path = require('path');
const { words, ids, fileOf, readRuns } = require('./check.js');

const SEEDS = { g1: 20261112, g2: 77120611, owner: 4441 };
const LETTERS = 'ABCDEFGH';

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const graderHead = (n) => `# Grading task

Below are twelve writing tasks. Under each task are ${n} texts, A to ${LETTERS[n - 1]}, written by ${n} different writers for that task. The letters are shuffled anew for every task, so A in one task is not the same writer as A in another. Judge every text on its own merits, for the reader the task names.

For each task:

1. Score every text from 1 (poor) to 5 (excellent) on five points:
   - facts: every fact the task requires is there and right, nothing is invented, nothing the task forbids is included
   - limits: the length limit and the format the task asks for are kept. The word count of each text, counted by script, is in its heading; trust it and do not count yourself
   - clear: the reader gets the point on first reading; the order makes sense
   - tone: fits the reader and the occasion. For the translations: correct, natural German in the formal register, with German conventions for dates, times and prices
   - filler: 5 means no padding, stock phrases or repetition; 1 means a lot
2. Rank the ${n} texts from best to worst, as the reader of that task would. No ties, every letter exactly once.
3. Add a note of at most 25 words on what decided the top and the bottom.

Write one JSON object, and nothing else, to a file named grades.json in the same folder as this file. Shape:

{"t01": {"scores": {"A": {"facts": 5, "limits": 5, "clear": 4, "tone": 4, "filler": 3}, "B": {...}, "C": {...}, "D": {...}, "E": {...}, "F": {...}}, "rank": ["C", "A", "F", "B", "E", "D"], "note": "..."}, "t02": {...}, ..., "t12": {...}}

Read this whole file and write grades.json once. The file is long: if your Read tool cuts it off, pass allow_large or read the rest in further Read calls of this same file. Use no other tool and no other file: no advisor, no helper, no search. Then reply with exactly one line:
MODEL=<the model name your own system prompt gives you>; TASKS=<number of tasks graded>
`;

const ownerHead = (n) => `# Blind sheet

Twelve tasks, ${n} texts each, letters shuffled per task. For each task you want to judge, pick your best and second-best text. Skip any task you like (tasks 3 and 9 are German). Send the picks back as one line, for example: t01:CA t02:FB t04:AD
`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(tasks) {
  const body = tasks.map((t) => `
<section class="task" data-id="${t.id}">
  <h2>${esc(t.title)}</h2>
  <details><summary>The task as the writers got it</summary><pre class="brief">${esc(t.brief)}</pre></details>
  ${t.texts.map((x) => `
  <article data-letter="${x.letter}">
    <header><b>${x.letter}</b> <span class="wc">${x.words} words</span>
      <span class="btns"><button type="button" data-pick="1">Best</button><button type="button" data-pick="2">Second</button></span></header>
    <pre>${esc(x.text)}</pre>
  </article>`).join('')}
</section>`).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Writing test sheet</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6b6860;--line:#dedbd2;--card:#fff;--acc:#1f5f8b;--acc2:#8a5a00;--on:#fff}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#161615;--fg:#e9e6df;--mut:#9c988e;--line:#35332f;--card:#1f1e1c;--acc:#6db3e0;--acc2:#e0b050;--on:#111}}
:root[data-theme="dark"]{--bg:#161615;--fg:#e9e6df;--mut:#9c988e;--line:#35332f;--card:#1f1e1c;--acc:#6db3e0;--acc2:#e0b050;--on:#111}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:760px;margin:0 auto;padding:16px 16px 180px}
h1{font-size:1.4rem;margin:.6em 0 .2em} h2{font-size:1.1rem;margin:2em 0 .4em;padding-top:.8em;border-top:2px solid var(--line)}
p.lead{color:var(--mut);margin:.2em 0 1em}
details{margin:.3em 0 .8em} summary{cursor:pointer;color:var(--acc)}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:0}
pre.brief{font-size:.9rem;color:var(--mut);border-left:3px solid var(--line);padding-left:12px;max-height:22em;overflow:auto}
article{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:10px 0}
article header{display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap}
article header b{font-size:1.15rem} .wc{color:var(--mut);font-size:.85rem} .btns{margin-left:auto;display:flex;gap:6px}
button{font:inherit;font-size:.9rem;padding:5px 12px;border-radius:6px;border:1px solid var(--line);background:transparent;color:var(--fg);cursor:pointer}
article.p1{border-color:var(--acc)} article.p1 button[data-pick="1"]{background:var(--acc);color:var(--on);border-color:var(--acc)}
article.p2{border-color:var(--acc2)} article.p2 button[data-pick="2"]{background:var(--acc2);color:var(--on);border-color:var(--acc2)}
#bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px}
#bar div{max-width:760px;margin:0 auto;display:flex;gap:8px;align-items:center}
#out{flex:1;min-width:0;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
</style></head><body><main>
<h1>Writing test: blind sheet</h1>
<p class="lead">Twelve tasks, six texts each, letters shuffled per task. Tap Best and Second on the tasks you want to judge and skip the rest (tasks 3 and 9 are German). Then copy the line at the bottom and send it back.</p>
${body}
</main>
<div id="bar"><div><input id="out" readonly value="" aria-label="Your picks"><button type="button" id="copy">Copy</button></div></div>
<script>
(function(){
  var picks={};
  try{picks=JSON.parse(localStorage.getItem('wt-picks')||'{}')||{}}catch(e){picks={}}
  function render(){
    var parts=[];
    document.querySelectorAll('section.task').forEach(function(s){
      var id=s.dataset.id,p=picks[id]||{};
      s.querySelectorAll('article').forEach(function(a){
        a.classList.toggle('p1',p[1]===a.dataset.letter);a.classList.toggle('p2',p[2]===a.dataset.letter);
      });
      if(p[1]||p[2])parts.push(id+':'+(p[1]||'-')+(p[2]||'-'));
    });
    document.getElementById('out').value=parts.join(' ');
    try{localStorage.setItem('wt-picks',JSON.stringify(picks))}catch(e){}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('button[data-pick]');if(!b)return;
    var a=b.closest('article'),id=b.closest('section').dataset.id,k=b.dataset.pick,o=k==='1'?'2':'1',l=a.dataset.letter;
    var p=picks[id]||(picks[id]={});
    if(p[k]===l){delete p[k]}else{p[k]=l;if(p[o]===l)delete p[o]}
    render();
  });
  document.getElementById('copy').addEventListener('click',function(){
    var o=document.getElementById('out');o.select();
    if(navigator.clipboard){navigator.clipboard.writeText(o.value).catch(function(){document.execCommand('copy')})}else{document.execCommand('copy')}
  });
  render();
})();
</script></body></html>
`;
}

function main() {
  const args = process.argv.slice(2);
  const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : __dirname;
  const runs = readRuns(root);
  const folders = runs.map((r) => r.folder);
  for (const reader of Object.keys(SEEDS)) {
    const rnd = mulberry32(SEEDS[reader]);
    const key = {};
    const tasks = [];
    let md = reader === 'owner' ? ownerHead(folders.length) : graderHead(folders.length);
    for (const id of ids) {
      const order = shuffled(folders, rnd);
      key[id] = {};
      const brief = fs.readFileSync(path.join(__dirname, 'tasks', id + '.md'), 'utf8').trim();
      const title = brief.split('\n')[0].replace(/^#+\s*/, '').replace(/\s*\(file .*\)$/, '');
      md += `\n\n==================== ${id} ====================\n\n${brief}\n`;
      const texts = [];
      order.forEach((folder, i) => {
        const letter = LETTERS[i];
        key[id][letter] = folder;
        const text = fs.readFileSync(path.join(root, 'run', folder, fileOf(id)), 'utf8').replace(/^﻿/, '').trim();
        const n = words(text);
        md += `\n----- ${id} text ${letter} (${n} words) -----\n${text}\n----- end of ${id} text ${letter} -----\n`;
        texts.push({ letter, words: n, text });
      });
      tasks.push({ id, title: `${id.slice(1).replace(/^0/, '')}. ${title.replace(/^Task \d+:\s*/, '')}`, brief, texts });
    }
    const dir = path.join(root, 'sheets', reader);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'sheet.md'), md);
    if (reader === 'owner') fs.writeFileSync(path.join(dir, 'sheet.html'), html(tasks));
    fs.writeFileSync(path.join(root, 'private', `key-${reader}.json`), JSON.stringify(key, null, 1));
    console.log(`${reader}: sheet.md ${words(md)} words, ${Buffer.byteLength(md)} bytes`);
  }
}

module.exports = { LETTERS };
if (require.main === module) main();
