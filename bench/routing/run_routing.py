"""Routing accuracy bench: python3 -I run_routing.py <set.jsonl> [--show-misses] [--json out.json]

Scores the router's class and model tier against labelled prompts:
  class accuracy, tier accuracy (the recommended model), under-routes (a cheaper model than the
  label's), over-routes, and how often the router stays silent (unsure or low confidence).
"""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "plugins", "model-router", "scripts"))
import router  # noqa: E402

policy = router.load_policy()
RANK = {k: v["rank"] for k, v in policy["models"].items()}


def tier(cls):
    entry = policy["classes"].get(cls) or policy["unsure"]
    return entry["max"][0]


def main():
    path = sys.argv[1]
    show = "--show-misses" in sys.argv
    rows = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    n = len(rows)
    cls_ok = tier_ok = under = over = silent = 0
    risky_total = risky_under = 0
    conf = {}
    misses = []
    t0 = time.perf_counter()
    for r in rows:
        out = router.route(r["prompt"], policy)
        got, want = out["class"], r["class"]
        gm, wm = tier(got), tier(want)
        conf.setdefault(want, {}).setdefault(got, 0)
        conf[want][got] += 1
        cls_ok += got == want
        tier_ok += gm == wm
        under += RANK[gm] < RANK[wm]
        over += RANK[gm] > RANK[wm]
        silent += got == "unsure" or out["confidence"] == "low"
        if want == "risky":
            risky_total += 1
            risky_under += RANK[gm] < RANK[wm]
        if got != want:
            misses.append((r["id"], want, got, out["confidence"], r["prompt"][:110]))
    dt = (time.perf_counter() - t0) / max(n, 1) * 1000
    res = {
        "set": os.path.basename(path), "n": n,
        "class_accuracy": round(cls_ok / n, 3), "tier_accuracy": round(tier_ok / n, 3),
        "under_routed": under, "over_routed": over, "silent": silent,
        "risky_under_routed": f"{risky_under}/{risky_total}",
        "ms_per_prompt": round(dt, 3), "confusion": conf,
    }
    print(json.dumps({k: v for k, v in res.items() if k != "confusion"}, indent=1))
    print("confusion (label -> predicted):")
    for want in router.PRIORITY:
        print(f"  {want:9s}", {k: v for k, v in sorted(conf.get(want, {}).items(), key=lambda x: -x[1])})
    if show:
        for m in misses:
            print("  MISS", m)
    if "--json" in sys.argv:
        with open(sys.argv[sys.argv.index("--json") + 1], "w", encoding="utf-8") as f:
            json.dump(res, f, indent=1)


if __name__ == "__main__":
    main()
