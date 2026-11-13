#!/usr/bin/env node
/* Hook tests: run router.js the way Claude Code does (JSON on stdin) and check what comes back.

  node bench/hooks/test_hooks.js     runs every case, the delegation-keyword table, then times 100 UserPromptSubmit calls

The cases follow test_hooks.py of 0.2.0; expectations changed where 0.3.0 changed the behaviour (ladders,
delegation modes, the keyword hint for Claude on by default).
*/
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { spawnSync } = require("child_process");

const ROUTER = path.join(__dirname, "..", "..", "plugins", "model-router", "scripts", "router.js");
const router = require(ROUTER);
const policy = router.loadPolicy();
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "mr-data-"));
const PROJ = fs.mkdtempSync(path.join(os.tmpdir(), "mr-proj-"));

function hook(payload, env) {
  const e = Object.assign({ PATH: process.env.PATH || "", HOME: process.env.HOME || "/tmp", CLAUDE_PLUGIN_DATA: DATA, CLAUDE_PROJECT_DIR: PROJ }, env || {});
  const r = spawnSync(process.execPath, [ROUTER], { input: typeof payload === "string" ? payload : JSON.stringify(payload), encoding: "utf8", env: e, timeout: 10000 });
  assert.strictEqual(r.status, 0, r.stderr);
  return r.stdout.trim() ? JSON.parse(r.stdout) : null;
}
const state = sid => JSON.parse(fs.readFileSync(path.join(DATA, "sessions", sid + ".json"), "utf8"));
const P = (sid, prompt) => ({ hook_event_name: "UserPromptSubmit", session_id: sid, prompt });
const ctxOf = o => (o && o.hookSpecificOutput ? o.hookSpecificOutput.additionalContext : "");
const SHOW = { MODEL_ROUTER_KEYWORD_HINTS: "1" };
const FIND = "find every file in this repo that imports requests";

const cases = {
  t_session_start() {
    const o = hook({ hook_event_name: "SessionStart", session_id: "s1", source: "startup", model: "claude-opus-5-5" });
    const ctx = ctxOf(o);
    assert(ctx.includes("place the task before you start") && ctx.includes("This session: Opus 5.5") && ctx.includes("Better on"), ctx);
    assert(ctx.includes("debug (something broken, cause unknown): Fable 5.2 · low (Opus 5.5 · medium with a cheap check), then Fable 5.2 · medium") && ctx.includes("questions place a task") && !/\b5\.1\b/.test(ctx), ctx);
    assert(o.systemMessage.startsWith(`⚙ model-router ${policy.plugin_version} on (max plan)`), o.systemMessage);
    assert.strictEqual(state("s1").model, "opus");
  },
  t_resume_no_banner() {
    const o = hook({ hook_event_name: "SessionStart", session_id: "s1", source: "resume" });
    assert(!("systemMessage" in o) && state("s1").model === "opus");
  },
  t_announces_once_and_never_pushes_a_cheaper_hint() {
    const o = hook(P("s1", FIND), { CLAUDE_EFFORT: "xhigh" });
    assert(!("systemMessage" in o), JSON.stringify(o));               // nothing shown to the user unless asked
    assert(ctxOf(o).includes("now runs Opus 5.5 · xhigh; delegation high") && !ctxOf(o).includes("keyword hint"), ctxOf(o));
    assert.strictEqual(hook(P("s1", "and the ones that import json"), { CLAUDE_EFFORT: "xhigh" }), null);
  },
  t_cheaper_hint_shown_to_user_on_request() {
    const o = hook(P("s1", FIND), { ...SHOW, CLAUDE_EFFORT: "xhigh" });
    assert(o.systemMessage.includes("search → Haiku 5.5 · low") && o.systemMessage.includes("/effort low"), JSON.stringify(o));
    assert(!ctxOf(o).includes("keyword hint"), ctxOf(o));
  },
  t_debug_on_sonnet_low() {
    const p = hook({ hook_event_name: "PostModelSwitch", session_id: "s1", to_model: "claude-sonnet-5-5", from_model: "claude-opus-5-5" });
    assert(state("s1").model === "sonnet" && ctxOf(p).includes("now runs Sonnet 5.5"), JSON.stringify(p));
    const o = hook(P("s1", "the docker container exits immediately with exit code 137, why"), { ...SHOW, CLAUDE_EFFORT: "low" });
    const m = o.systemMessage;
    assert(m.includes("debug → Fable 5.2 · low (Opus · medium when a check can catch a mistake)") && m.includes("/model opus re-reads this chat once"), m);
    assert(ctxOf(o).includes("delegation low"), ctxOf(o));
    assert(ctxOf(o).includes("keyword hint") && ctxOf(o).includes("your own reading of the task wins") && ctxOf(o).includes("/model opus"), ctxOf(o));
  },
  t_up_hint_reaches_claude_by_default_and_only_once() {
    const DBG = "the docker container exits immediately with exit code 137, why";
    assert.strictEqual(hook(P("s1", DBG), { CLAUDE_EFFORT: "low" }), null);              // same class, same session pair: not repeated
    hook(P("s1", "ok thanks"), { CLAUDE_EFFORT: "low" });                                // a prompt without a hint clears the guard
    const o = hook(P("s1", DBG), { CLAUDE_EFFORT: "low" });
    assert(!("systemMessage" in o) && ctxOf(o).includes("keyword hint") && ctxOf(o).includes("debug → Fable 5.2 · low"), JSON.stringify(o));
  },
  t_hints_off() {
    const o = hook(P("s1", "run rm -rf on the old backup share to free space"), { MODEL_ROUTER_KEYWORD_HINTS: "0", CLAUDE_EFFORT: "low" });
    assert.strictEqual(o, null);
  },
  t_effort_only_hint() {
    hook({ hook_event_name: "PostModelSwitch", session_id: "s1", to_model: "claude-opus-5-5" });
    const o = hook(P("s1", "help me migrate my unraid array to bigger drives without losing data"), { ...SHOW, CLAUDE_EFFORT: "low" });
    assert(o.systemMessage.includes("risky → Opus 5.5 · high") && o.systemMessage.includes("/effort high") && o.systemMessage.includes("ultrathink"), JSON.stringify(o));
  },
  t_opus_medium_fits_checked_debug() {
    const o = hook(P("s1", "the docker container exits immediately with exit code 137, why"), { ...SHOW, CLAUDE_EFFORT: "medium" });
    assert(o === null || !("systemMessage" in o), JSON.stringify(o));
  },
  t_fits_silent() {
    const o = hook(P("s1", "review this pull request for bugs before i merge it"), { ...SHOW, CLAUDE_EFFORT: "high" });
    assert(o === null || (!("systemMessage" in o) && !ctxOf(o).includes("keyword hint")), JSON.stringify(o));
  },
  t_overpowered_midsession_effort_tip() {
    const o = hook(P("s1", "what does ZFS stand for"), { ...SHOW, CLAUDE_EFFORT: "max" });
    assert(o && o.systemMessage.includes("/effort low") && !o.systemMessage.includes("/model"), JSON.stringify(o));
  },
  t_slash_command_ignored() {
    assert.strictEqual(hook(P("s1", "/model opus")), null);
  },
  t_solo_keyword() {
    const o = hook(P("s1", "solo: find every TODO in src"), { CLAUDE_EFFORT: "xhigh" });
    const ctx = ctxOf(o);
    assert(ctx.includes("solo for this prompt") && !ctx.includes("keyword hint"), JSON.stringify(o));
  },
  t_solo_as_a_plain_word() {
    const o = hook(P("s1", "solo developer here, what does CI stand for"), { CLAUDE_EFFORT: "xhigh" });
    assert(!ctxOf(o).includes("solo for this prompt"), JSON.stringify(o));
  },
  t_orchestrate_low_and_high() {
    const lo = hook(P("s1", "orchestrate low: tidy the imports in src/app.js"), { CLAUDE_EFFORT: "xhigh" });
    assert(ctxOf(lo).includes("orchestrate low for this prompt"), JSON.stringify(lo));
    const hi = hook(P("s1", "orchestrate tidy the imports in src/app.js"), { CLAUDE_EFFORT: "xhigh" });
    assert(ctxOf(hi).includes("orchestrate high for this prompt"), JSON.stringify(hi));
  },
  t_unknown_model_quiet_for_cheap() {
    assert.strictEqual(hook(P("fresh", "summarize this article in 5 bullets"), SHOW), null);
  },
  t_unknown_model_speaks_for_risky() {
    const o = hook(P("fresh2", "run rm -rf on the old backup share to free space"), SHOW);
    assert(o && o.systemMessage.includes("risky → Opus 5.5 · high"), JSON.stringify(o));
  },
  t_pro_profile_has_no_fable_step() {
    const o = hook({ hook_event_name: "SessionStart", session_id: "pro1", source: "startup", model: "claude-sonnet-5-5" }, { MODEL_ROUTER_PROFILE: "pro" });
    assert(o.systemMessage.includes("(pro plan)") && !ctxOf(o).includes("Fable 5.2 ·") && ctxOf(o).includes("Opus 5.5 · high (Opus 5.5 · medium with a cheap check), then Opus 5.5 · xhigh"), ctxOf(o));
  },
  t_lean_profile_keeps_coding_on_opus() {
    const o = hook({ hook_event_name: "SessionStart", session_id: "lean1", source: "startup", model: "claude-opus-5-5" }, { MODEL_ROUTER_PROFILE: "lean" });
    assert(/debug \([^)]*\): Opus 5\.5 · high \(Opus 5\.5 · medium with a cheap check\), then Opus 5\.5 · xhigh → Fable 5\.2 · xhigh/.test(ctxOf(o)), ctxOf(o));
  },
  t_pre_switch_cost() {
    const o = hook({ hook_event_name: "PreModelSwitch", session_id: "s1", from_model: "claude-sonnet-5-5", to_model: "claude-opus-5-5",
                     context_tokens: 182340, prompt_cache_warm: true, estimated_cache_write_usd: 0.91 });
    assert(o.systemMessage.includes("~182k tokens") && o.systemMessage.includes("$0.91") && !JSON.stringify(o).includes("permissionDecision"), JSON.stringify(o));
  },
  t_pre_switch_cold_quiet() {
    assert.strictEqual(hook({ hook_event_name: "PreModelSwitch", session_id: "s1", context_tokens: 180000, prompt_cache_warm: false }), null);
  },
  t_stop_records_effort() {
    hook({ hook_event_name: "Stop", session_id: "s1", effort: { level: "xhigh" } });
    assert.strictEqual(state("s1").effort, "xhigh");
  },
  t_guard_denies_modelless_explore() {
    const o = hook({ hook_event_name: "PreToolUse", session_id: "s1", tool_name: "Agent", tool_input: { subagent_type: "Explore", prompt: "x" } });
    assert(o.hookSpecificOutput.permissionDecision === "deny" && o.hookSpecificOutput.permissionDecisionReason.includes("model set to"));
  },
  t_guard_allows() {
    for (const ti of [{ subagent_type: "Explore", model: "haiku" }, { subagent_type: "model-router:scout" }, { subagent_type: "fork" },
                      { subagent_type: "impeccable:impeccable-documenter" }]) {
      assert.strictEqual(hook({ hook_event_name: "PreToolUse", session_id: "s1", tool_name: "Agent", tool_input: ti }), null, JSON.stringify(ti));
    }
  },
  t_guard_reads_agent_files() {
    const d = path.join(PROJ, ".claude", "agents");
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "helper.md"), "---\nname: helper\ndescription: x\nmodel: haiku\n---\nbody\n");
    fs.writeFileSync(path.join(d, "lazy.md"), "---\nname: lazy\ndescription: x\nmodel: inherit\n---\nbody\n");
    assert.strictEqual(hook({ hook_event_name: "PreToolUse", session_id: "s1", tool_name: "Agent", tool_input: { subagent_type: "helper" } }), null);
    const o = hook({ hook_event_name: "PreToolUse", session_id: "s1", tool_name: "Agent", tool_input: { subagent_type: "lazy" } });
    assert.strictEqual(o.hookSpecificOutput.permissionDecision, "deny");
  },
  t_guard_off_switch() {
    assert.strictEqual(hook({ hook_event_name: "PreToolUse", session_id: "s1", tool_name: "Agent", tool_input: { subagent_type: "Explore" } },
                            { MODEL_ROUTER_GUARD: "0" }), null);
  },
  t_bad_input_never_blocks() {
    for (const bad of ["not json", "", "{}", JSON.stringify({ hook_event_name: "UserPromptSubmit" })]) {
      const r = spawnSync(process.execPath, [ROUTER], { input: bad, encoding: "utf8", timeout: 10000, env: { PATH: process.env.PATH || "", HOME: "/tmp", CLAUDE_PLUGIN_DATA: DATA } });
      assert.strictEqual(r.status, 0, bad);
    }
  },
  t_hooks_file_runs_node() {
    const h = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "plugins", "model-router", "hooks", "hooks.json"), "utf8")).hooks;
    const cmds = Object.values(h).flat().flatMap(x => x.hooks.map(y => y.command));
    assert(cmds.length === 6 && cmds.every(c => c === 'node "${CLAUDE_PLUGIN_ROOT}/scripts/router.js"'), JSON.stringify(cmds));
  },

  // The start comes first in the card (no ladder with a marked start), and the card carries the skill's two extra rules.
  t_card_reads_start_first() {
    const ctx = ctxOf(hook({ hook_event_name: "SessionStart", session_id: "c1", source: "startup", model: "claude-opus-5-5" }));
    assert(!ctx.includes("[") && !/bracket/i.test(ctx), ctx);
    assert(ctx.includes("edit (a scoped change: small feature, fix, script, config): Sonnet 5.5 · high (Sonnet 5.5 · medium with a cheap check), then Opus 5.5 · medium"), ctx);
    assert(/write \([^)]*\): Sonnet 5\.5 · medium, then Opus 5\.5 · medium/.test(ctx) && !ctx.includes("Haiku 5.5 · high → Sonnet 5.5 · medium"), ctx);
    assert(/risky \([^)]*\): Opus 5\.5 · high, plan first, never lower/.test(ctx), ctx);
    assert(ctx.includes("small bug with all its code in the prompt") && ctx.includes("name an effort"), ctx);
  },
  // A small bug with all its code in the prompt is a scoped fix (the edit start, run the code), not the debug ladder.
  t_small_bug_with_code_given_is_a_scoped_fix() {
    hook({ hook_event_name: "SessionStart", session_id: "sb1", source: "startup", model: "claude-sonnet-5-5" });
    const fits = hook(P("sb1", SMALL_BUG), { ...SHOW, CLAUDE_EFFORT: "high" });           // 0.3.0: a debug hint to move to Opus
    assert(fits === null || (!("systemMessage" in fits) && !ctxOf(fits).includes("keyword hint")), JSON.stringify(fits));
    hook({ hook_event_name: "SessionStart", session_id: "sb2", source: "startup", model: "claude-haiku-5-5" });
    const o = hook(P("sb2", SMALL_BUG), { ...SHOW, CLAUDE_EFFORT: "low" });
    assert(o.systemMessage.includes("edit → Sonnet 5.5 · high") && o.systemMessage.includes("small bug") && o.systemMessage.includes("/model sonnet"), JSON.stringify(o));
    assert(ctxOf(o).includes("keyword hint") && ctxOf(o).includes("edit → Sonnet 5.5 · high"), ctxOf(o));
  },
  t_small_bug_rule_draws_the_line() {
    const r = p => router.route(router.parseMode(p, policy).rest, policy);
    for (const p of SMALL_BUGS) { const x = r(p); assert(x.rule === "small-bug" && x.class === "edit" && x.model === "sonnet" && x.effort === "high" && x.checked.join() === "sonnet,high", `${JSON.stringify(p)} → ${x.class} ${x.rule}`); }
    for (const p of NOT_SMALL_BUGS) { const x = r(p); assert(x.rule === undefined && x.class === "debug", `${JSON.stringify(p)} → ${x.class} ${x.rule}`); }
  },
  t_debug_without_given_code_stays_on_the_debug_ladder() {
    hook({ hook_event_name: "SessionStart", session_id: "sb3", source: "startup", model: "claude-sonnet-5-5" });
    for (const p of NOT_SMALL_BUGS.slice(0, 3)) {
      const o = hook(P("sb3", p), { ...SHOW, CLAUDE_EFFORT: "high" });
      assert(o && o.systemMessage.includes("debug → Fable 5.2 · low"), `${JSON.stringify(p)} → ${JSON.stringify(o)}`);
    }
  },
  // An effort named in the prompt wins, on the start model of that kind of work; risky work keeps its floor.
  t_named_effort_parser() {
    const wrong = NAMED.filter(([p, want]) => (router.namedEffort(p) || null) !== want).map(([p, want]) => `${JSON.stringify(p)} → ${router.namedEffort(p)}, expected ${want}`);
    assert.strictEqual(wrong.length, 0, wrong.join("; "));
  },
  t_named_effort_wins_on_the_start_model() {
    hook({ hook_event_name: "SessionStart", session_id: "ne1", source: "startup", model: "claude-sonnet-5-5" });
    const quiet = hook(P("ne1", "low effort is fine for this: rename getUser to fetchUser across src/"), { ...SHOW, CLAUDE_EFFORT: "low" });
    assert(quiet === null || (!("systemMessage" in quiet) && !ctxOf(quiet).includes("keyword hint")), JSON.stringify(quiet));   // 0.3.0: "/effort medium"
    const up = hook(P("ne1", "Use high effort: refactor the parser module into two files"), { ...SHOW, CLAUDE_EFFORT: "medium" });
    assert(up && up.systemMessage.includes("edit → Sonnet 5.5 · high") && up.systemMessage.includes("names effort high") && up.systemMessage.includes("/effort high"), JSON.stringify(up));
    assert(ctxOf(up).includes("keyword hint"), ctxOf(up));
    const r = router.route("xhigh effort please: the docker container exits immediately with exit code 137, why", policy);
    assert(r.class === "debug" && r.named === "xhigh" && r.model === "fable" && r.effort === "xhigh" && r.checked.join() === "fable,xhigh", JSON.stringify([r.class, r.named, r.model, r.effort, r.checked]));
  },
  t_named_effort_never_lowers_risky_work() {                      // also true in 0.3.0; here it guards the new rule
    hook({ hook_event_name: "SessionStart", session_id: "ne2", source: "startup", model: "claude-opus-5-5" });
    const o = hook(P("ne2", "Low effort is fine: drop the old_users table on the production database."), { ...SHOW, CLAUDE_EFFORT: "low" });
    assert(o && o.systemMessage.includes("risky → Opus 5.5 · high") && o.systemMessage.includes("/effort high"), JSON.stringify(o));
    const r = router.route("max effort: drop the old_users table on the production database.", policy);
    assert(r.class === "risky" && r.model === "opus" && r.effort === "max", JSON.stringify([r.class, r.model, r.effort]));
  },
  t_named_effort_beside_a_delegation_keyword() {
    const m = router.parseMode("orchestrate low effort is fine for this: rename getUser to fetchUser across src/", policy);
    assert(m.mode === "high" && router.route(m.rest, policy).named === "low", JSON.stringify(m));
    const n = router.parseMode("orchestrate low: rename getUser to fetchUser across src/", policy);
    assert(n.mode === "low" && router.route(n.rest, policy).named === undefined, JSON.stringify(n));
  },
  t_rules_are_optional_in_the_policy() {                            // a policy.json without "rules" (0.3.0) still routes
    const old = JSON.parse(JSON.stringify(policy)); delete old.rules;
    const r = router.route(SMALL_BUG, old);
    assert(r.class === "debug" && r.rule === undefined && r.named === undefined, JSON.stringify(r.class));
    assert(router.card(old).includes("Sonnet 5.5 · high (Sonnet 5.5 · medium with a cheap check)") && !router.card(old).includes("small bug"));
  },
};

const SMALL_BUG = "Why does this return None?\ndef total(xs):\n    s = 0\n    for x in xs:\n        s += x";
const SMALL_BUGS = [
  SMALL_BUG,
  "Why is total NaN at the end?\nconst prices = ['3', '4', undefined];\nlet total = 0;\nfor (const p of prices) total += Number(p);",
  "this function crashes with a TypeError, why?\n```js\nfunction first(xs) {\n  return xs[0].name;\n}\nfirst([]);\n```",
  "My loop is broken, it never stops:\n    i = 0\n    while i < 10:\n        print(i)",
];
const NOT_SMALL_BUGS = [
  "the docker container exits immediately with exit code 137, why",                                                        // no code
  "Our nightly import fails about one run in ten with a timeout and I can't reproduce the error on my machine. Why does it fail?",   // no code, no check
  "Why does this crash sometimes? The rest of the job runner is in the repo under src/jobs/.\n```py\ndef run(job):\n    return job.start()\n```",   // the code is not all here
  "getting this when i run my code, it worked fine yesterday\n\nTraceback (most recent call last):\n  File \"main.py\", line 14, in <module>\n    total += int(row[2])\nValueError: invalid literal for int() with base 10: ''",   // a traceback is not the code
  "why does this fail?\n```\n" + Array.from({ length: 80 }, (_, i) => `step_${i}(ctx);`).join("\n") + "\n```",                // not small
  // error output is not the code, fenced or indented
  "getting this when i run my code, it worked fine yesterday\n\n```\nTraceback (most recent call last):\n  File \"main.py\", line 14, in <module>\n    total += int(row[2])\nValueError: invalid literal for int() with base 10: ''\n```",
  "why does this fail to compile?\n```\nerror[E0382]: borrow of moved value: `v`\n  --> src/main.rs:5:20\n   |\n3  |     let w = v;\n5  |     println!(\"{:?}\", v);\n```",
  "why does the container exit?\n    standard_init_linux.go:228: exec user process caused: exec format error\n    exit status 1",
  "this crashes, why?\n```\nSELECT * FROM users WHERE name = NULL;\n```",                                              // one line: stay on debug when in doubt
];
const NAMED = [
  ["Use high effort: draft a two-paragraph apology email to a customer", "high"], ["At medium effort, summarise this meeting transcript", "medium"],
  ["xhigh effort please: why does our Docker build miss the cache", "xhigh"], ["Low effort is fine: drop the old_users table", "low"],
  ["low effort is fine for this: rename getUser to fetchUser across src/", "low"], ["rename the helper, effort: low", "low"],
  ["summarize this report at extra high effort", "xhigh"], ["think about this design at max effort", "max"],
  ["set the effort to high and review the PR", "high"], ["high effort review of the PR", "high"], ["At medium effort, why does this test fail?", "medium"],
  ["Low priority, whenever you get to it: delete the old S3 bucket logs-2019", null], ["give me a high-level overview of the repo", null],
  ["what does high effort do in Claude Code?", null], ["should I use xhigh effort for writing?", null],
  ["low-effort posts keep flooding the subreddit, draft a rule against them", null], ["is the effort high enough to justify a rewrite?", null],
  ["this needs a lot of effort, high stakes", null], ["medium rare steak, how long per side", null], ["find the max of this list", null],
  ["orchestrate low: find every TODO", null], ["I wrote this essay outline with Fable at high effort; check it for logical gaps", null],
  ["use Opus at high effort for this: fix the flaky test", "high"], ["quick one, low effort: what does chmod 644 mean", "low"], ["the fan runs at high speed with low effort from the pump", null],
];

// The first word of a prompt can set how much is delegated. "low" and "high" there are amounts of delegation,
// not effort, and "solo" or "orchestrate" inside ordinary sentences is not a keyword.
const MODES = [
  ["solo: fix the typo", "solo"], ["solo fix the typo in README", "solo"], ["Solo, what's the capital of Peru", "solo"], ["solo", "solo"],
  ["solo developer here, how should I structure my repo", null], ["solo trip to Japan in March, plan it", null],
  ["soloist recommendations for violin", null],
  ["orchestrate: migrate the tests to vitest", "high"], ["orchestrate migrate the tests to vitest", "high"],
  ["orchestrate low: find every TODO", "low"], ["orchestrate low find every TODO", "low"], ["Orchestrate High — refactor auth", "high"],
  ["ORCHESTRATE LOW\nrename the helper", "low"],
  ["orchestrate low effort is enough, rename the variable", "high"],   // talks about effort: plain orchestrate
  ["orchestrate high effort review of the PR", "high"], ["orchestrate at low effort: list the files", "high"],
  ["orchestrate, low priority: clean up the logs", "high"],
  ["orchestration tools for k8s, compare them", null], ["orchestrated a deployment yesterday and it broke", null],
  ["low effort please: summarize this", null], ["high: is this safe", null], ["please orchestrate low", null],
  ["use high effort and orchestrate", null],
];
cases.t_delegation_keywords = () => {
  const wrong = MODES.filter(([p, want]) => router.parseMode(p, policy).mode !== want).map(([p, want]) => `${JSON.stringify(p)} → ${router.parseMode(p, policy).mode}, expected ${want}`);
  assert.strictEqual(wrong.length, 0, wrong.join("; "));
  assert.strictEqual(router.parseMode("orchestrate low: find every TODO", policy).rest, "find every TODO");
  assert.strictEqual(router.parseMode("solo — what is ZFS", policy).rest, "what is ZFS");
};

let passed = 0;
const names = Object.keys(cases);
for (const name of names) {
  try { cases[name](); passed++; if (process.argv.includes("-v")) console.log("PASS " + name); }
  catch (e) { console.log("FAIL " + name + "  " + String(e.message).slice(0, 400)); }
}
console.log(`${passed}/${names.length} hook cases pass (${MODES.length} delegation-keyword prompts inside one case)`);

const times = [];
const payload = P("timing", "the vm on unraid won't boot after the update, stuck on uefi shell");
for (let i = 0; i < 100; i++) {
  const t0 = process.hrtime.bigint();
  hook(payload, { CLAUDE_EFFORT: "medium" });
  times.push(Number(process.hrtime.bigint() - t0) / 1e6);
}
times.sort((a, b) => a - b);
console.log(JSON.stringify({ hook_cases_passed: passed, hook_cases: names.length,
                             userpromptsubmit_ms_median: Math.round((times[49] + times[50]) / 2 * 10) / 10, userpromptsubmit_ms_p95: Math.round(times[94] * 10) / 10 }));
fs.rmSync(DATA, { recursive: true, force: true });
fs.rmSync(PROJ, { recursive: true, force: true });
process.exitCode = passed === names.length ? 0 : 1;
