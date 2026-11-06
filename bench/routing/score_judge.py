"""Score an LLM judge's labels (id -> class) against heldout2.jsonl: python3 -I score_judge.py judge-<model>.json"""
import json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "plugins", "model-router", "scripts"))
import router
pol = router.load_policy(); R = {k: v["rank"] for k, v in pol["models"].items()}
t = lambda c: (pol["classes"].get(c) or pol["unsure"])["max"][0]
rows = {json.loads(l)["id"]: json.loads(l) for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "heldout2.jsonl"))}
got = json.load(open(sys.argv[1]))
n = len(rows); missing = [k for k in rows if k not in got]
cls_ok = sum(got.get(k) == r["class"] for k, r in rows.items())
tier_ok = sum(t(got.get(k, "unsure")) == t(r["class"]) for k, r in rows.items())
under = sum(R[t(got.get(k, "unsure"))] < R[t(r["class"])] for k, r in rows.items())
risky = [k for k, r in rows.items() if r["class"] == "risky"]
risky_under = sum(R[t(got.get(k, "unsure"))] < R["opus"] for k in risky)
print(json.dumps({"judge": os.path.basename(sys.argv[1]), "n": n, "missing": len(missing), "class_accuracy": round(cls_ok / n, 3),
                  "tier_accuracy": round(tier_ok / n, 3), "under_routed": under, "risky_under_routed": f"{risky_under}/{len(risky)}"}))
