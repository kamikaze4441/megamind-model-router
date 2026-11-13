#!/usr/bin/env node
// Builds task.md (what every writer reads) from tasks/t01.md ... t12.md.
// Usage: node build_task.js            writes task.md next to this script and prints word counts
const fs = require('fs');
const path = require('path');
const here = __dirname;
const ids = Array.from({ length: 12 }, (_, i) => 't' + String(i + 1).padStart(2, '0'));

const header = `# Task

Below are twelve writing tasks. Do each one as you would for a real reader: the texts will be read and judged by people.

For each task, write only the finished text to a file in the same folder as this file, named 01.txt for task 1 up to 12.txt for task 12. No notes to me, no word count, no markdown code fence, and no heading unless the task asks for one.

Length limits are hard limits. A word is anything between spaces, so "9 January" is two words and "first-come" is one. Everything in the file counts.

Read this file once and write each of the twelve files once. Use no other tool: no advisor, no helper, no search, no other file. Then reply with exactly one line:
MODEL=<the model name your own system prompt gives you>; FILES=<number of files written>
`;

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
let out = header;
for (const id of ids) {
  const t = fs.readFileSync(path.join(here, 'tasks', id + '.md'), 'utf8').trim();
  // Word count of the source material: everything after the first line that ends in a colon on its own.
  const m = t.match(/\n(Report|Article|Notice|Announcement|Newsletter|Notes|Facts):\n([\s\S]*)$/);
  console.log(id, 'task words', words(t), m ? `| ${m[1].toLowerCase()} words ${words(m[2])}` : '');
  out += '\n' + t + '\n';
}
fs.writeFileSync(path.join(here, 'task.md'), out);
console.log('task.md words', words(out), 'bytes', Buffer.byteLength(out));
