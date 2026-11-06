"""Hook tests: run router.py the way Claude Code does (JSON on stdin) and check what comes back.

  python3 -I test_hooks.py          runs every case, then times 100 UserPromptSubmit calls
"""
import json
import os
import statistics
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROUTER = os.path.join(HERE, "..", "..", "plugins", "model-router", "scripts", "router.py")
DATA = tempfile.mkdtemp(prefix="mr-data-")
PROJ = tempfile.mkdtemp(prefix="mr-proj-")


def hook(payload, env=None):
    e = {"PATH": os.environ.get("PATH", ""), "HOME": os.environ.get("HOME", "/tmp"), "CLAUDE_PLUGIN_DATA": DATA,
         "CLAUDE_PROJECT_DIR": PROJ}
    e.update(env or {})
    r = subprocess.run([sys.executable, "-I", ROUTER], input=json.dumps(payload) if isinstance(payload, dict) else payload,
                       capture_output=True, text=True, env=e, timeout=10)
    assert r.returncode == 0, (r.returncode, r.stderr)
    return json.loads(r.stdout) if r.stdout.strip() else None


def state(sid):
    with open(os.path.join(DATA, "sessions", sid + ".json")) as f:
        return json.load(f)


results = []

def case(name, fn):
    try:
        fn()
        results.append((name, True, ""))
    except AssertionError as e:
        results.append((name, False, repr(e)[:300]))


def t_session_start():
    o = hook({"hook_event_name": "SessionStart", "session_id": "s1", "source": "startup", "model": "claude-opus-5-5"})
    ctx = o["hookSpecificOutput"]["additionalContext"]
    assert "On every prompt, check the fit" in ctx and "This session: Opus 5.5" in ctx and "Better on" in ctx, ctx
    assert o["systemMessage"].startswith("⚙ model-router")
    assert state("s1")["model"] == "opus"


def t_resume_no_banner():
    o = hook({"hook_event_name": "SessionStart", "session_id": "s1", "source": "resume"})
    assert "systemMessage" not in o and state("s1")["model"] == "opus"


def t_default_announces_model_and_effort_once():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "find every file in this repo that imports requests"},
             {"CLAUDE_EFFORT": "xhigh"})
    assert "systemMessage" not in o, o
    ctx = o["hookSpecificOutput"]["additionalContext"]
    assert "now runs Opus 5.5 · xhigh; orchestrator mode on" in ctx, ctx
    o2 = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "and the ones that import json"},
              {"CLAUDE_EFFORT": "xhigh"})
    assert o2 is None, o2


def t_keyword_hint_opt_in():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "find every file in this repo that imports requests"},
             {"MODEL_ROUTER_KEYWORD_HINTS": "1", "CLAUDE_EFFORT": "xhigh"})
    assert "Haiku 5.5" in o["systemMessage"] and "/effort low" in o["systemMessage"], o


def t_debug_on_sonnet_low():
    p = hook({"hook_event_name": "PostModelSwitch", "session_id": "s1", "to_model": "claude-sonnet-5-5", "from_model": "claude-opus-5-5"})
    assert state("s1")["model"] == "sonnet" and "now runs Sonnet 5.5" in p["hookSpecificOutput"]["additionalContext"], p
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1",
              "prompt": "the docker container exits immediately with exit code 137, why"}, {"MODEL_ROUTER_KEYWORD_HINTS": "1", "CLAUDE_EFFORT": "low"})
    assert "Opus 5.5 · high" in o["systemMessage"] and "/model opus re-reads this chat once" in o["systemMessage"], o


def t_effort_only_hint():
    hook({"hook_event_name": "PostModelSwitch", "session_id": "s1", "to_model": "claude-opus-5-5"})
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1",
              "prompt": "help me migrate my unraid array to bigger drives without losing data"}, {"MODEL_ROUTER_KEYWORD_HINTS": "1", "CLAUDE_EFFORT": "low"})
    assert "/effort high" in o["systemMessage"] and "ultrathink" in o["systemMessage"], o


def t_fits_silent():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1",
              "prompt": "review this pull request for bugs before i merge it"}, {"MODEL_ROUTER_KEYWORD_HINTS": "1", "CLAUDE_EFFORT": "high"})
    assert o is None or "systemMessage" not in o, o


def t_overpowered_midsession_effort_tip():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "what does ZFS stand for"},
             {"MODEL_ROUTER_KEYWORD_HINTS": "1", "CLAUDE_EFFORT": "max"})
    assert o and "/effort low" in o["systemMessage"] and "/model" not in o["systemMessage"], o


def t_slash_command_ignored():
    assert hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "/model opus"}) is None


def t_solo_keyword():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "s1", "prompt": "solo: find every TODO in src"},
             {"CLAUDE_EFFORT": "max"})
    assert "solo for this prompt" in o["hookSpecificOutput"]["additionalContext"] and "orchestrator" not in o["hookSpecificOutput"]["additionalContext"], o


def t_unknown_model_quiet_for_cheap():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "fresh", "prompt": "summarize this article in 5 bullets"},
             {"MODEL_ROUTER_KEYWORD_HINTS": "1"})
    assert o is None, o


def t_unknown_model_speaks_for_risky():
    o = hook({"hook_event_name": "UserPromptSubmit", "session_id": "fresh2", "prompt": "run rm -rf on the old backup share to free space"},
             {"MODEL_ROUTER_KEYWORD_HINTS": "1"})
    assert o and "risky → Opus 5.5 · high" in o["systemMessage"], o


def t_pre_switch_cost():
    o = hook({"hook_event_name": "PreModelSwitch", "session_id": "s1", "from_model": "claude-sonnet-5-5", "to_model": "claude-opus-5-5",
              "context_tokens": 182340, "prompt_cache_warm": True, "estimated_cache_write_usd": 0.91})
    assert "~182k tokens" in o["systemMessage"] and "$0.91" in o["systemMessage"] and "permissionDecision" not in json.dumps(o), o


def t_pre_switch_cold_quiet():
    assert hook({"hook_event_name": "PreModelSwitch", "session_id": "s1", "context_tokens": 180000, "prompt_cache_warm": False}) is None


def t_stop_records_effort():
    hook({"hook_event_name": "Stop", "session_id": "s1", "effort": {"level": "xhigh"}})
    assert state("s1")["effort"] == "xhigh"


def t_guard_denies_modelless_explore():
    o = hook({"hook_event_name": "PreToolUse", "session_id": "s1", "tool_name": "Agent", "tool_input": {"subagent_type": "Explore", "prompt": "x"}})
    assert o["hookSpecificOutput"]["permissionDecision"] == "deny" and "model set to" in o["hookSpecificOutput"]["permissionDecisionReason"]


def t_guard_allows():
    for ti in ({"subagent_type": "Explore", "model": "haiku"}, {"subagent_type": "model-router:scout"}, {"subagent_type": "fork"},
               {"subagent_type": "impeccable:impeccable-documenter"}):
        assert hook({"hook_event_name": "PreToolUse", "session_id": "s1", "tool_name": "Agent", "tool_input": ti}) is None, ti


def t_guard_reads_agent_files():
    d = os.path.join(PROJ, ".claude", "agents")
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "helper.md"), "w") as f:
        f.write("---\nname: helper\ndescription: x\nmodel: haiku\n---\nbody\n")
    with open(os.path.join(d, "lazy.md"), "w") as f:
        f.write("---\nname: lazy\ndescription: x\nmodel: inherit\n---\nbody\n")
    assert hook({"hook_event_name": "PreToolUse", "session_id": "s1", "tool_name": "Agent", "tool_input": {"subagent_type": "helper"}}) is None
    o = hook({"hook_event_name": "PreToolUse", "session_id": "s1", "tool_name": "Agent", "tool_input": {"subagent_type": "lazy"}})
    assert o["hookSpecificOutput"]["permissionDecision"] == "deny"


def t_guard_off_switch():
    assert hook({"hook_event_name": "PreToolUse", "session_id": "s1", "tool_name": "Agent", "tool_input": {"subagent_type": "Explore"}},
                {"MODEL_ROUTER_GUARD": "0"}) is None


def t_bad_input_never_blocks():
    for bad in ("not json", "", "{}", json.dumps({"hook_event_name": "UserPromptSubmit"})):
        e = {"PATH": os.environ.get("PATH", ""), "HOME": "/tmp", "CLAUDE_PLUGIN_DATA": DATA}
        r = subprocess.run([sys.executable, "-I", ROUTER], input=bad, capture_output=True, text=True, env=e, timeout=10)
        assert r.returncode == 0, (bad, r.returncode)


for name, fn in list(globals().items()):
    if name.startswith("t_") and callable(fn):
        case(name, fn)

passed = sum(ok for _, ok, _ in results)
for name, ok, why in results:
    print(("PASS " if ok else "FAIL ") + name + ("" if ok else "  " + why))
print(f"{passed}/{len(results)} hook cases pass")

times = []
payload = {"hook_event_name": "UserPromptSubmit", "session_id": "timing", "prompt": "the vm on unraid won't boot after the update, stuck on uefi shell"}
for _ in range(100):
    t0 = time.perf_counter()
    hook(payload, {"CLAUDE_EFFORT": "medium"})
    times.append((time.perf_counter() - t0) * 1000)
times.sort()
print(json.dumps({"hook_cases_passed": passed, "hook_cases": len(results),
                  "userpromptsubmit_ms_median": round(statistics.median(times), 1), "userpromptsubmit_ms_p95": round(times[94], 1)}))
sys.exit(0 if passed == len(results) else 1)
