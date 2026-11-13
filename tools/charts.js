// Extract every embedded chart (series,x,y,label CSV + title + series names) from a saved Anthropic launch page.
const fs = require("fs");
const [p, out] = process.argv.slice(2);
let t = fs.readFileSync(p, "utf8").split('\\"').join('"').split("\\n").join("\n");
const re = /"_type":"chart"[^]*?"data":"(series,x,y[^"]*)"/g; let m; const rows = []; const seen = new Set();
while ((m = re.exec(t))) {
  const tail = t.slice(m.index, m.index + 9000);
  const title = (tail.match(/"subtitle":"([^"]*)","title":"([^"]*)"/) || [])[2] || "?";
  const xl = (tail.match(/"xAxis":\{[^}]*"label":"([^"]*)"/) || [])[1] || "";
  const yl = (tail.match(/"yAxis":\{[^}]*"label":"([^"]*)"/) || [])[1] || "";
  const names = {}; const sr = /"id":"([^"]+)","name":"([^"]+)"/g; let s;
  while ((s = sr.exec(tail))) names[s[1]] = names[s[1]] || s[2];
  const key = title + m[1].length; if (seen.has(key)) continue; seen.add(key);
  for (const line of m[1].split("\n").slice(1)) {
    const [sid, x, y, label] = line.replace(/\\$/, "").split(",");
    if (!sid) continue;
    rows.push([title, names[sid] || sid, label, x, y, xl, yl]);
  }
}
const csv = ["benchmark,model,effort,x,y,x_label,y_label", ...rows.map(r => r.map(v => /,/.test(v) ? `"${v}"` : v).join(","))].join("\n") + "\n";
if (out) fs.writeFileSync(out, csv);
const by = {}; for (const r of rows) (by[r[0]] = by[r[0]] || []).push(r);
for (const k in by) { console.log(`## ${k}  [x=${by[k][0][5]} | y=${by[k][0][6]}]`); const bm = {}; for (const r of by[k]) (bm[r[1]] = bm[r[1]] || []).push(`${r[2]} ${r[4]}@${r[3]}`); for (const mname in bm) console.log(`  ${mname}: ${bm[mname].join("; ")}`); }
console.log("rows:", rows.length);
