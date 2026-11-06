"""Collect every bench number into bench/RESULTS.md and bench/results.json:  python3 -I make_results.py"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, "routing")
T = os.path.join(HERE, "tiers")


def routing(set_name):
    out = subprocess.run([sys.executable, "-I", os.path.join(R, "run_routing.py"), os.path.join(R, set_name)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out[: out.index("}") + 1])


res = {"routing": {}, "tiers": {}, "hooks": None}
for name in ("heldin.jsonl", "heldout.jsonl", "heldout2.jsonl"):
    if os.path.exists(os.path.join(R, name)):
        res["routing"][name] = routing(name)
v0 = os.path.join(R, "results-heldout.json")
if os.path.exists(v0):
    res["routing"]["heldout.jsonl (v0, frozen, first run)"] = {k: v for k, v in json.load(open(v0)).items() if k != "confusion"}

usage = json.load(open(os.path.join(T, "usage.json")))
for g in "ABCD":
    for t in ("haiku", "sonnet", "opus"):
        p = os.path.join(T, "results", f"{g}-{t}.json")
        if not os.path.exists(p):
            continue
        g_out = subprocess.run([sys.executable, "-I", os.path.join(T, "tasks.py"), "grade", g, p], capture_output=True, text=True,
                               check=True).stdout
        d = json.loads(g_out)
        u = usage.get(f"{g}-{t}", {})
        res["tiers"][f"{g}-{t}"] = {"score": d["score"], "of": d["of"], "context_tokens": u.get("tokens"), "ms": u.get("ms"),
                                    "notes": d["notes"]}

h = subprocess.run([sys.executable, "-I", os.path.join(HERE, "hooks", "test_hooks.py")], capture_output=True, text=True)
res["hooks"] = json.loads(h.stdout.strip().splitlines()[-1])

with open(os.path.join(HERE, "results.json"), "w", encoding="utf-8") as f:
    json.dump(res, f, indent=1)

L = ["# Bench results", "", "Run on 2026-11-06 in a claude.ai session (Claude Code 2.1.319 harness). Re-run: `python3 -I bench/make_results.py`.", "",
     "## 1. Routing accuracy (keyword rules first, then Claude as the judge)", "",
     "| Set | Prompts | Written by | Class right | Model right | Cheaper than label | Silent | Risky under-routed | ms/prompt |",
     "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
who = {"heldin.jsonl": "the router's author; tuned on it", "heldout.jsonl (v0, frozen, first run)": "Sonnet 5.5 from CLASSES.md only; first contact",
       "heldout.jsonl": "same set, after v1 was tuned on it (not independent)", "heldout2.jsonl": "Opus 5.5 from CLASSES.md only; v1 frozen first"}
for name in ("heldin.jsonl", "heldout.jsonl (v0, frozen, first run)", "heldout.jsonl", "heldout2.jsonl"):
    r = res["routing"].get(name)
    if not r:
        continue
    L.append(f"| {name.split(' ')[0]}{' (v0)' if 'v0' in name else (' (v1)' if name != 'heldin.jsonl' else ' (v1)')} | {r['n']} | {who[name]} | "
             f"{r['class_accuracy']:.1%} | {r['tier_accuracy']:.1%} | {r['under_routed']} | {r['silent']} | {r['risky_under_routed']} | {r['ms_per_prompt']} |")
judges = {}
for m in ("haiku", "sonnet"):
    jp = os.path.join(R, f"judge-{m}.json")
    if os.path.exists(jp):
        out = subprocess.run([sys.executable, "-I", os.path.join(R, "score_judge.py"), jp], capture_output=True, text=True, check=True).stdout
        judges[m] = json.loads(out)
res["judges"] = judges
for m, lab in (("haiku", "Claude as judge: Haiku 5.5 · low"), ("sonnet", "Claude as judge: Sonnet 5.5 · medium")):
    j = judges.get(m)
    if j:
        L.append(f"| heldout2 ({lab}) | {j['n']} | same prompts, labels hidden from the judge | {j['class_accuracy']:.1%} | "
                 f"{j['tier_accuracy']:.1%} | {j['under_routed']} | 0 | {j['risky_under_routed']} | – |")
L += ["", "\"Model right\" compares the model the router recommends with the model the label's class maps to. \"Silent\" = unsure or "
      "low confidence: the hook shows nothing. The honest keyword numbers are the first-contact rows: v0 on heldout.jsonl and v1 on heldout2.jsonl. "
      "The judge rows are v0.2's mechanism: Claude reads the class definitions and labels each prompt. Caveat: heldout2's labels were written "
      "by another Claude model (Opus 5.5), which may share the judges' reading of the classes.", "",
      "## 2. Tier bench (real model runs, graded by script)", "",
      "| Group (router's tier) | Haiku 5.5 · low | Sonnet 5.5 · medium | Opus 5.5 · high |", "| --- | --- | --- | --- |"]
names = {"A": "A search: 6 questions over a 12-file repo (Haiku · low)", "B": "B edit: 6 functions from a spec, hidden tests (Sonnet · medium)",
         "C": "C debug: 6 buggy functions, hidden tests (Opus · high)", "D": "D review: 10 snippets (3 safe) + 10 claims (Opus · high)"}
for g in "ABCD":
    cells = []
    for t in ("haiku", "sonnet", "opus"):
        x = res["tiers"].get(f"{g}-{t}")
        cells.append(f"{x['score']}/{x['of']} · {x['ms']/1000:.1f} s" if x else "–")
    L.append(f"| {names[g]} | " + " | ".join(cells) + " |")
L += ["", "Every tier solved every item: these small, fully specified tasks don't separate the models. Each run's context ended at "
      "91.6k–96.7k tokens, of which about 92k is the harness's fixed system prompt and tool list (a probe that only replied \"ok\" "
      "read 93,051), so the run-to-run token differences are noise. List price per input token (platform.claude.com pricing): "
      "Haiku 5.5 $0.10/M, Sonnet 5.5 $2/M, Opus 5.5 $4/M, Fable 5.1 $10/M.", "",
      "## 3. Hooks", "", f"{res['hooks']['hook_cases_passed']}/{res['hooks']['hook_cases']} hook cases pass "
      f"(`bench/hooks/test_hooks.py`); `UserPromptSubmit` takes {res['hooks']['userpromptsubmit_ms_median']} ms median, "
      f"{res['hooks']['userpromptsubmit_ms_p95']} ms p95 (Python start-up included). Claude Code 2.1.319 loaded the plugin with "
      "`--plugin-dir`: 4 agents, `/model-router:route` and all 6 hooks registered (this cloud sandbox doesn't run hooks; the live "
      "check runs on your machine)."]
with open(os.path.join(HERE, "RESULTS.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(L) + "\n")
print("\n".join(L))
