#!/usr/bin/env python3
"""model-router: a zero-token model and effort router for Claude Code.

One script handles every hook event the plugin registers:
  SessionStart       remember the model; give Claude the routing card once per session
  UserPromptSubmit   tell Claude its model and effort when they change (Claude judges the fit from
                     the routing card and opens its reply with one line when it doesn't); with
                     MODEL_ROUTER_KEYWORD_HINTS=1 also a zero-token keyword hint (61% on unseen prompts)
  PreModelSwitch     show what a switch re-sends; Claude Code's own confirmation stays
  PostModelSwitch    remember the new model and tell Claude with the next request
  Stop               remember the effort level that ran
  PreToolUse:Agent   make every subagent spawn name a model, so no helper silently runs on
                     Opus or Fable (set MODEL_ROUTER_GUARD=0 to turn this off)

From a shell:  router.py --classify "some prompt"   prints the route as JSON
               router.py --card                     prints the routing card

No hook can set the model or effort; the hints tell you, the worker agents carry their own.
Stdlib only, Python 3.9+. MIT licence. Ideas and agent wording adapted from
donimas/ai-routing @ 4a8312f (MIT); the brief-and-check loop from the Omega guide
(murphmaxxing.com); delegation limits from r/ClaudeAI 1x1nsaz and 1xn0e12.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = "0.2.0"

# ----------------------------------------------------------------------------- policy

def load_policy() -> dict:
    with open(os.path.join(HERE, "policy.json"), encoding="utf-8") as f:
        return json.load(f)


def profile(policy: dict) -> str:
    p = (os.environ.get("MODEL_ROUTER_PROFILE") or policy.get("profile") or "max").lower()
    return p if p in ("max", "pro") else "max"


def model_key(name: str | None) -> str | None:
    """Map a model id, alias or label to haiku/sonnet/opus/fable."""
    if not name:
        return None
    n = str(name).lower()
    for key, words in (("fable", ("fable", "mythos")), ("opus", ("opus",)),
                       ("sonnet", ("sonnet",)), ("haiku", ("haiku",))):
        if any(w in n for w in words):
            return key
    return None


# ----------------------------------------------------------------------------- classifier

PRIORITY = ["risky", "debug", "plan", "review", "research", "edit", "write", "search", "quick"]

def rx(p: str) -> re.Pattern:
    return re.compile(p, re.I)

ERROR_STRONG = rx(r"(traceback \(most recent|exception\b|\berrno\b|stack ?trace|segfault|segmentation fault|"
                  r"core dumped|panic(ked)?:|exit (code|status) [1-9]|status code [45]\d\d|\b(4|5)0\d (error|bad|not|internal|service)|"
                  r"\berror:|\berror \d|\berr_[a-z_]+|fatal:|unhandled|undefined is not|cannot read propert|"
                  r"nullpointer|permission denied|connection refused|no such file|command not found|"
                  r"modulenotfounderror|importerror|syntaxerror|typeerror|valueerror|keyerror|attributeerror|"
                  r"indexerror|nameerror|oomkilled|out of memory|kernel panic|failed to [a-z]+|\berr!|#n/a|#value!|#ref!|#div/0!|#name\?|\bdeauth\b)")
DEBUG_INTENT = rx(r"(\bwhy (does|is|isn'?t|doesn'?t|won'?t|did|do|am|are|can'?t|cant|would|wont|dont|do i|is my|does my)\b|"
                  r"not working|doesn'?t work|does not work|isn'?t working|stopped working|no longer work|"
                  r"won'?t (start|boot|load|open|connect|play|work|save|sync|update|run|mount|show|turn on)|"
                  r"wont (start|boot|load|open|connect|play|work|save|sync|update|run|mount|show)|"
                  r"keeps? (crashing|failing|restarting|disconnecting|buffering|freezing|dropping|timing out|stopping|rebooting)|"
                  r"\bbroke\b|\bbroken\b|\bbuggy\b|\bbug\b|\bdebug|\bcrash|\bhangs?\b|\bhanging\b|\bstuck\b|\bfreez|"
                  r"\bslow(er|ly)?\b|\blaggy\b|unexpected|wrong (output|result|value|answer|number|total)|"
                  r"returns? (none|null|nothing|nan|undefined|empty|0\b|zero)|fix (this|the|my|it) (error|bug|issue|crash|problem)|"
                  r"what'?s (wrong|causing|happening)|what is (wrong|causing)|figure out why|troubleshoot|"
                  r"\bfail(s|ed|ing)?\b|\berrors?\b|throws?\b|\bwarning\b|stopped (showing|loading|syncing|working)|\banymore\b|"
                  r"(isn'?t|is not|aren'?t|not) (picking|showing|loading|working|syncing|downloading|updating|connecting|playing|responding|detecting|finding)|"
                  r"(was|were) (fine|working) (before|last|yesterday|until|earlier)|used to work|\bsuddenly\b|keeps? \w+ing\b|\bwhy\s*[?.!]*$|"
                  r"(can'?t|cant|cannot|unable to|couldn'?t) (reach|connect|access|load|open|see|log ?in|ping|mount|play|stream|find (my|the) )|"
                  r"(prints?|returns?|shows?|outputs?|gives?) .{0,25}instead of|\b(drops?|dropping|disconnects?|crawl(s|ing)?)\b|"
                  r"taking (forever|ages|hours|days)|(has been|been) (running|stuck|going) (for )?\d+|\bred x\b|"
                  r"(says|shows) .{0,40}\bbut\b|\bbut .{0,30}\b(says|shows) (passed|ok|fine|connected|healthy|running)|gives (#|an? )?(error|wrong|nothing|blank))")
RISK_EXPLICIT = rx(r"(\bis (it|this|that) safe\b|\bsafe to\b|without losing|data loss|lose (my|all|the|any) (data|files|photos|media|settings)|"
                   r"irreversible|can'?t (be )?undo|cannot be undone|\bin prod\b|\bon prod\b|\bproduction\b|live server|"
                   r"before i (delete|wipe|format|upgrade|migrate|reset|reinstall)|rm -rf|drop (table|database)|force[- ]push|"
                   r"chmod (-r )?777|port[- ]forward|open (a |the )?port|expose .{0,30}(internet|public|outside)|"
                   r"(should i|can i|is it (smart|wise|worth)|how much (should|can|do)|\bmove\b|withdraw|\binvest|\bput\b|\bsell\b|\bbuy\b|transfer|close|cash out|claim|deduct|refinanc|pay off|consolidate)"
                   r".{0,40}\b(tfsa|rrsp|fhsa|401k|ira|roth|mortgage|loan|savings|portfolio|brokerage|stocks?|shares|etfs?|index funds?|crypto|bitcoin|taxes|tax return|debt)\b|"
                   r"(leaked|exposed|pasted|committed|pushed|posted|shared|leaking) (my|the|an?|our) (\w+ )?(api ?key|password|token|secret|private key|credentials|ssh key)|"
                   r"(api ?key|password|token|secret|credentials) (in|on|to) (a |my |the )?(public|github)|e-?transfer|\bupfront\b|\bscam\b|"
                   r"fine to (send|pay|give|share|wire)|\b(send|pay|wire) \$\d|"
                   r"\b(invest|investing|refinanc|withdraw|wire (money|transfer))|\bdosage\b|\bdose of\b|"
                   r"\bis it legal\b|\blawsuit\b|\bsue\b|\bmy lease\b|\bcontract\b)")
RISK_ACTION = rx(r"\b(delete|deleting|remove|removing|wipe|wiping|format|formatting|erase|drop|truncate|purge|"
                 r"migrat\w*|move|moving|restore|restoring|reset|resetting|rebuild|rebuilding|resize|shrink|expand|"
                 r"replace|replacing|swap|upgrade|upgrading|downgrade|update|updating|change|changing|rotate|revoke|grant|"
                 r"set ?up|setting up|configure|configuring|install|installing|expose|exposing|forward|forwarding|"
                 r"disable|disabling|enable|enabling|turn off|chmod|chown|kill|reinstall|flash|flashing|"
                 r"transfer|transferring|send money|pay|paying|sell|selling|buy (stock|shares|crypto|etf)|"
                 r"cancel|cancelling|share (my|the) (password|key|token)|give .{0,20} access|run (this|it) (as root|with sudo))\b")
RISK_OBJECT = rx(r"\b(database|db|tables?|schema|backups?|array|pool|disks?|drives?|partition|zfs|raid|parity|"
                 r"appdata|production|prod|nas|unraid|containers?|docker|compose|vms?|firewall|ports?|router|vpn|tunnel|"
                 r"cloudflare|dns|ssl|tls|certs?|certificate|password|passwords|passphrase|secrets?|api ?keys?|ssh|"
                 r"sudo|root|permissions?|auth|oauth|login|2fa|mfa|accounts?|bank|money|payments?|credit card|invoice|"
                 r"taxe?s?|tfsa|rrsp|fhsa|stocks?|shares|etfs?|crypto|bitcoin|loan|mortgage|insurance|lease|"
                 r"medication|meds|prescription|bios|firmware|bootloader|partition table|all (my|the) (data|files|photos))\b")
PLAN = rx(r"(\bdesign\b|\barchitect|\broadmap\b|\bstrategy\b|\bstrategi|\bblueprint\b|trade-?offs?|\blong[- ]term\b|"
          r"system design|\bspec(ification)?\b|decision record|\badr\b|from scratch|scal(e|ing|able) (up|this|to)|"
          r"plan (out|for|my|the|a|how)|planning (out|my|the|a)|how (should|would) (i|we|you) (structure|organi[sz]e|set up|approach|design|architect|build|split|lay out|handle)|"
          r"structure (my|the|a|this|our)|overall (setup|plan|structure|approach)|which (stack|framework|architecture|approach)|"
          r"\bphases?\b|\bmilestones?\b|best approach|approach (for|to) (building|designing|structuring|organi[sz]ing|migrating)|"
          r"lay out (a|the) plan|game plan|data model|folder structure|project structure|\bin (\d+|ten|five|a few) years\b|future-?proof|"
          r"still works? in|for the next \d+|\b\d+[- ]day plan\b|plan to (get|become|reach|learn|save|pay)|maintenance (schedule|plan)|"
          r"(yearly|annual|weekly|monthly) (schedule|plan|routine)|set up a (schedule|routine|system) for|"
          r"break (it|this|them|.{0,25}) (into|up into) (modules|parts|services|pieces|files|stages)|\bin stages\b)")
REVIEW = rx(r"(^\s*review\b|\breview (this|my|the|it|these|our|that|his|her)\b|code review|\bpr\b|pull request|fact[- ]?check|double[- ]?check|sanity[- ]?check|look over|"
            r"\bproofread|\bcritique|\baudit\b|is (this|my|it|that) (right|correct|accurate|ok|okay|good|valid|sound|true)|"
            r"anything wrong|did i (miss|get|do)|check (this|my|the|over) (code|work|answer|math|essay|draft|plan|spec|config|doc|document|letter|email|post|claims?|numbers?|calculation|logic|reasoning|script|sql|query|translation)|"
            r"find (bugs|issues|mistakes|errors|problems|holes) in|spot (any )?(errors|mistakes|issues|problems)|"
            r"\bverify (this|that|my|the)|any (mistakes|errors|issues) in|what did i (miss|get wrong)|poke holes|tear (this|it) apart|"
            r"grade (this|my)|give (me )?feedback on|feedback on (my|this)|is my \w+( \w+)? (right|correct|accurate|ok|okay|good|valid)|"
            r"can you (proofread|review|look over|fact[- ]?check)|can you check (this|my|if|whether|for (errors|mistakes|bugs|typos))|"
            r"anything i (missed|forgot)|(take|have) a (second|double|closer|hard|careful) look|\bre-?check\b|look again at|"
            r"does (this|my|the) (\w+ ){0,2}(line|regex|formula|query|code|config|script|command|cron(tab)?|rule|function|logic) "
            r"(\w+ )?(run|match|work|do|handle|catch|cover)|check (my|this|the|these) .{0,30}\bfor (errors|mistakes|typos|bugs|issues|problems|weak|gaps)|"
            r"tell me if (there (are|is)|it has) (any )?(\w+ )?(mistakes|errors|issues|problems|bugs|typos)|\b(gaps|contradictions|inconsistencies|loopholes)\b)")
RESEARCH = rx(r"(\bcompare\b|comparison|\bvs\.?\b|\bversus\b|which (is|one|would be|should i|do you) (better|best|get|buy|pick|choose|recommend)|"
              r"\bbest (way|ways|option|options|tool|tools|app|apps|service|model|laptop|phone|tv|monitor|router|nas|gpu|cpu|camera|"
              r"headphones|budget|alternative|setup|card|plan|brand|place|time)|recommend(ation)?s?\b|should i (buy|get|use|choose|go with|switch|pick|upgrade to)|"
              r"pros and cons|options (for|to)|alternatives? (to|for)|worth (it|buying|getting|the money|upgrading)|\blatest\b|"
              r"\bcurrent(ly)? (state|version|price|best|status)|\bnews\b|reviews? (of|for)|\bresearch\b|what'?s new|state of|\bdeals?\b|"
              r"price (of|for|history)|cheapest|benchmarks?|look into|dig into|deep dive|what do people (say|think)|reddit|"
              r"\bis better\b|(better|best),? .{0,40}\bor\b|which .{0,30}(is better|should i|to (get|buy|choose|pick))|"
              r"what are people saying|people say|should i get|find out (what|whats|what's|which|how|if|whether|why)|"
              r"lessons (we|i) can learn|what'?s (useful|worth (taking|copying|stealing))|is it any good)")
EDIT = rx(r"(\badd (a|an|the|some|support|dark mode|logging|validation|tests?|error handling)\b|"
          r"\badd \w+ (validation|support|button|field|option|page|feature|check|toggle|endpoint|column|tests?|logging)\b|"
          r"\badd (type hints|types|comments|docstrings|a test|an option|a flag|retries|caching|a column|a field)\b|"
          r"\bmake (the|this|my) (script|function|app|code|bot|page|program|tool|site|website|component|button|query)\b|"
          r"change (the|this|my) (\w+ ){0,2}(line|text|label|title|subject|message|name|value|setting|wording|mapping|path)\b|"
          r"\b(in|to) (my|the) (compose|config|yaml|json|docker-compose|\.env|settings) file\b|\bimplement|\brefactor|\brename\b|"
          r"rewrite (this|the) (function|code|script|query|component|class|loop|regex)|"
          r"change (the|this|my) (code|function|script|config|setting|colou?r|text|label|layout|style|query|font|default|variable)|"
          r"update (the|this|my) (code|script|config|function|readme|file|yaml|json|css|html|query|template|docs?)|"
          r"(write|make|build|create|give) (me )?(a|an)? ?(small |quick |simple |little |short )?(script|function|regex|query|sql|bash|python|shell|class|component|unit tests?|tests? for|dockerfile|compose file|cron( job)?|workflow|macro|formula|webhook|endpoint|api route|css|html page|shortcut|alias)|"
          r"make (it|this) (also|so|return|accept|handle|work with|support|use)|convert (this|the|my) (\w+ ){0,2}(code|script|function|query|file|component|class)|port (this|it) to|"
          r"\bedit (the|this|my)|\bmodify\b|\btweak\b|\binsert\b|extract (a|this|the) (function|method|component)|"
          r"\bone-?liner\b|\bsnippet\b|\bhelper function\b|\bfunction (that|to|which)\b|\bscript (that|to|which)\b|\.py\b|\.js\b|\.ts\b|\.sh\b|\.yaml\b|\.yml\b|\.json\b|\.css\b)")
WRITE = rx(r"(\b(text|message|note|email|dm|card) (to|for) (my|the|a|our)\b|\b(birthday|wedding|retirement|thank[- ]you|farewell) (message|card|note|wish|speech|toast)|"
           r"\bcover letter\b|\bproduct description\b|description (for|of) (my|the|a|our)|\blisting\b|\breadme\b|\bchangelog\b|release notes|"
           r"^\s*explain\b|like (i'?m|im|i am) (new|five|5|a beginner|dumb|twelve)|"
           r"\bwrite (a|an|me|my|the|up)?\s*(\w+ ){0,2}(email|e-mail|message|text|letter|post|reply|response|caption|bio|toast|speech|story|poem|tweet|"
           r"review for|description|cover letter|summary|thank|note|announcement|intro|paragraph|blog|newsletter|essay|article|report|update for)|"
           r"\bdraft\b|reply to|respond to|\brephrase|\breword|paraphrase|"
           r"rewrite (this|my|the|it) ?(email|message|text|paragraph|post|letter|intro|sentence|bio|description|so|to|in|more|less)?|"
           r"summari[sz]e|\btl;?dr\b|\btranslat|\bpolish (this|my|it)|make (this|it) (sound|more|less|shorter|longer|friendlier|professional|formal|casual|clearer|polite)|"
           r"explain .{0,40}\b(to|like|for) (me|my|a|an|someone|kids?|non-?technical)|in (simple|plain) (words|terms|english)|like i'?m (5|five)|\bcaption\b|\bheadline\b|subject line|\bslogan\b|\bwording\b|"
           r"how (do|should) i (say|word|phrase|tell|ask|respond)|what (should|do) i (say|write|reply))")
SEARCH = rx(r"(\bfind (all|every|the|my|where|which|out where|any|me the|files?|emails?|lines?)\b|"
            r"where (is|are|did|do|does) .{0,40}(defined|stored|located|saved|kept|configured|set|used|mentioned|called|declared|live)|"
            r"\blocate\b|\blist (all|every|the|my|each|out)\b|\bsearch (for|my|the|through|in|across)\b|\bgrep\b|look (through|in|for) (my|the|all|this)|"
            r"go through (my|the|all|this|these)|scan (the|my|this|these|through)|pull out|extract (all|every|the|each|any) |"
            r"collect (all|every)|\bevery (file|email|mention|place|time|instance|occurrence|reference)|"
            r"\bin (my|the|this) (inbox|logs?|folder|files|repo|codebase|docs|documents|notes|vault|downloads|drive|spreadsheet|chat history|history)\b|"
            r"which (files?|emails?|pages?|lines?|containers?|messages?|notes?|functions?|scripts?|chats?)\b.{0,30}\b(contain|mention|use|have|reference|import|call|talk|say)|"
            r"which of (my|the|these|our) (\w+ ){0,2}(files?|emails?|threads?|messages?|notes?|pages?|docs?|documents?|chats?|photos?)|\bcount (the|all|how many)\b|how many (times|files|emails|lines|places|containers|references)|"
            r"\bshow me (all|every|where)|\bdig up\b|\btrack down\b)")
QUICK_START = rx(r"^\s*(what|whats|what'?s|who|whos|when|where|which|how (do|does|can|to|much|many|long|old|far|big)|is|are|does|do|did|can|could|"
                 r"should|was|were|define|meaning of|convert|tell me|quick q|eli5)\b")
QUICK_PHRASE = rx(r"(\bstand for\b|meaning of|difference between|\bshortcut\b|keyboard shortcut|\bconvert\b .{0,20}\bto\b|"
                  r"how many .{0,20} in (a|an|one)\b|what time zone|what year|who (is|was|invented|made|wrote)|\bdefine\b|"
                  r"what does .{0,30} mean|what is (a|an|the)? ?[a-z0-9\-]+( [a-z0-9\-]+)?\??$|"
                  r"^\s*[\d.,]+\s*[a-z°%]+ (in|to|into) [a-z°]+\s*\??$|^\s*(the )?(capital|population|height|size|age|currency|language|"
                  r"time ?zone|meaning|definition|spelling|plural|synonym|antonym|opposite) of\b)")
GREETING = rx(r"^\s*(hi|hey|hello|thanks|thank you|thx|ok|okay|cool|nice|lol|great|yes|no|yep|nope|sure)\b[\s!.?]*$")
CODE_FENCE = re.compile(r"```.*?(```|$)", re.S)
LOG_LINE = re.compile(r"^\s*(\[?\d{4}-\d\d-\d\d|\[?\d\d:\d\d:\d\d|[A-Z][a-z]{2} +\d{1,2} \d\d:\d\d)", re.M)
CODEY_LINE = re.compile(r"^\s*([{}\[\]<>]|def |class |import |from |function |const |let |var |#include|SELECT |\$ |>>> |\w+\(.*\)\s*[;{]?\s*$)", re.M)


def classify(prompt: str) -> dict:
    raw = prompt or ""
    fences = CODE_FENCE.findall(raw)
    has_code = bool(fences) or len(CODEY_LINE.findall(raw)) >= 2
    prose = CODE_FENCE.sub(" ", raw)
    words = len(prose.split())
    s = {k: 0.0 for k in PRIORITY}
    why = []

    if GREETING.match(raw):
        return {"class": "quick", "confidence": "high", "scores": s, "why": ["greeting"], "words": words}

    err_strong = bool(ERROR_STRONG.search(raw)) or len(LOG_LINE.findall(raw)) >= 2
    debug_hits = len(DEBUG_INTENT.findall(prose))
    if err_strong:
        s["debug"] += 3; why.append("error text")
    if debug_hits:
        s["debug"] += min(debug_hits, 3) * 1.2; why.append("debug words")

    if RISK_EXPLICIT.search(raw):
        s["risky"] += 3; why.append("risk words")
    acts, objs = RISK_ACTION.findall(prose), RISK_OBJECT.findall(prose)
    if acts and objs:
        distinct = len({o if isinstance(o, str) else o[0] for o in objs})
        s["risky"] += 1.5 if distinct == 1 else (2.0 if distinct == 2 else 2.5)
        why.append("risky action on a risky object")

    for key, pat, w in (("plan", PLAN, 1.6), ("review", REVIEW, 1.8), ("research", RESEARCH, 1.4),
                        ("edit", EDIT, 1.5), ("write", WRITE, 1.6), ("search", SEARCH, 1.7)):
        n = len(pat.findall(raw if key in ("edit", "review") else prose))
        if n:
            s[key] += w * min(n, 3); why.append(f"{key} words")

    if has_code:
        if s["debug"] > 0:
            s["debug"] += 1
        elif s["review"] > 0:
            s["review"] += 1
        else:
            s["edit"] += 1.2
        why.append("code")

    quick_ok = words <= 25 and not has_code and not err_strong and not any(s[k] > 0 for k in PRIORITY if k != "quick")
    if quick_ok:
        if QUICK_START.match(prose):
            s["quick"] += 1.6
        if QUICK_PHRASE.search(prose):
            s["quick"] += 1.6
        if words <= 12 and QUICK_START.match(prose):
            s["quick"] += 0.6
    if s["quick"] and not any(s[k] for k in PRIORITY if k != "quick"):
        why.append("short question")

    # risky beats everything once it has a real signal; debug words alone don't make a task risky
    order = sorted(PRIORITY, key=lambda k: (-s[k], PRIORITY.index(k)))
    top, second = order[0], order[1]
    if s["risky"] >= 3:          # explicit risk words win; action+object alone competes on score
        top = "risky"
        second = next(k for k in order if k != "risky")
    best, runner_up = s[top], s[second]
    if best <= 0:
        return {"class": "unsure", "confidence": "none", "scores": s, "why": ["no signal"], "words": words}
    if top == "risky":
        conf = "high" if best >= 3 else "medium"
    elif best >= 3 or (best >= 1.5 and best - runner_up >= 1):
        conf = "high"
    elif best - runner_up >= 0.5:
        conf = "medium"
    else:
        conf = "low"
    return {"class": top, "confidence": conf, "scores": s, "why": why, "words": words}


def route(prompt: str, policy: dict | None = None) -> dict:
    policy = policy or load_policy()
    c = classify(prompt)
    prof = profile(policy)
    entry = policy["classes"].get(c["class"]) or policy["unsure"]
    model, effort = entry[prof]
    c.update({"model": model, "effort": effort, "profile": prof, "reason": entry.get("why", ""),
              "delegate": entry.get("delegate")})
    return c


# ----------------------------------------------------------------------------- state

def state_dir() -> str:
    base = os.environ.get("CLAUDE_PLUGIN_DATA") or os.path.join(os.path.expanduser("~"), ".claude", "model-router")
    d = os.path.join(base, "sessions")
    os.makedirs(d, exist_ok=True)
    return d


def state_path(session_id: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9_-]", "_", session_id or "nosession")[:80]
    return os.path.join(state_dir(), safe + ".json")


def load_state(session_id: str) -> dict:
    try:
        with open(state_path(session_id), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_state(session_id: str, st: dict) -> None:
    p = state_path(session_id)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(st, f)
    os.replace(tmp, p)


def prune_states(days: int = 7) -> None:
    cutoff = time.time() - days * 86400
    d = state_dir()
    for name in os.listdir(d):
        p = os.path.join(d, name)
        try:
            if os.path.getmtime(p) < cutoff:
                os.remove(p)
        except OSError:
            pass


def model_from_transcript(path: str | None) -> str | None:
    """Last assistant model in the transcript tail (an undocumented field; best effort only)."""
    if not path or not os.path.isfile(path):
        return None
    try:
        with open(path, "rb") as f:
            f.seek(0, 2)
            size = f.tell()
            f.seek(max(0, size - 262144))
            tail = f.read().decode("utf-8", "replace")
    except OSError:
        return None
    found = re.findall(r'"model"\s*:\s*"(claude-[a-z0-9\-\[\]\.]+)"', tail)
    return found[-1] if found else None


# ----------------------------------------------------------------------------- messages

def label(policy: dict, model: str | None, effort: str | None) -> str:
    m = policy["models"].get(model or "", {}).get("label", model or "?")
    return f"{m} · {effort}" if effort else m


CLASS_HELP = {
    "quick": "short question with a known answer",
    "search": "find, read or list things in files, logs, pages or an inbox",
    "write": "emails, posts, summaries, translations, explanations",
    "edit": "a scoped change: small feature, fix, script, config",
    "debug": "something broken, cause unknown",
    "risky": "money, security, credentials, deleting or migrating data, live servers, legal or medical decisions",
    "review": "check or fact-check existing work",
    "research": "compare sources, buying decisions, current state of things",
    "plan": "architecture, design, long-term choices",
}


def card(policy: dict, session: str | None = None) -> str:
    prof = profile(policy)
    groups: dict = {}
    for cls in PRIORITY[::-1]:
        m, eff = policy["classes"][cls][prof]
        groups.setdefault(f"{policy['models'][m]['label']} · {eff}", []).append(f"{cls} ({CLASS_HELP[cls]})")
    routes = "; ".join(f"{', '.join(v)} → {k}" for k, v in groups.items())
    a = policy["agents"]
    o = policy["orchestrator"]
    return (
        "model-router (plugin). On every prompt, check the fit before you start.\n"
        + (f"- This session: {session}.\n" if session else "")
        + f"- Routes ({prof} plan): {routes}. Priority when two fit: {', '.join(PRIORITY)}. When unsure: Sonnet 5.5 · medium. "
        "A small, fully specified task can go a tier lower; never route risky work to the cheapest tier.\n"
        "- If the session's model or effort clearly doesn't fit the task, start your reply with one line, "
        "'⚙ Better on <model> · <effort>: <reason>', then do the task (for risky work on Haiku or Sonnet, ask before acting). "
        "Mid-task suggest /effort (keeps the cache) rather than /model (re-reads the conversation). Say nothing when it fits.\n"
        f"- Workers with a fixed model and effort: {a['scout']}; {a['runner']}; {a['builder']}; {a['reviewer']}. Any other "
        "Agent call must pass model: haiku for search, reading and test runs; sonnet for drafts and routine edits; opus for "
        "reviews and hard problems.\n"
        f"- Orchestrator mode (Opus or Fable at {o['min_effort']} or above, or a prompt starting with '{o['keyword_on']}'; "
        f"'{o['keyword_off']}' turns it off): plan and check here; hand bulk searching, reading and test runs to scout or runner "
        "and routine edits to builder, each with a brief (goal, inputs, 'Done when:' check) whose check you re-run; keep reviews, "
        "fact-checks and hard code yourself; after two failures do that step yourself. Price per input token: Haiku 1, Sonnet 20, "
        "Opus 40, Fable 100. Small steps stay here."
    )


def hint(policy: dict, r: dict, cur_model: str | None, cur_effort: str | None, turn: int) -> str | None:
    """One line for the user, or None when the current setting fits."""
    if r["class"] == "unsure" or r["confidence"] == "low":
        return None
    eff = policy["efforts"]
    want_m, want_e = r["model"], r["effort"]
    rank = lambda m: policy["models"].get(m or "", {}).get("rank", 0)
    target = label(policy, want_m, want_e)
    head = f"⚙ model-router: {r['class']} → {target} ({r['reason']})"
    if cur_model is None:
        return head if r["class"] in ("risky", "debug", "plan", "review", "research") and r["confidence"] == "high" else None
    now = f"now {label(policy, cur_model, cur_effort)}"
    dm = rank(want_m) - rank(cur_model)
    de = (eff.get(want_e, 0) - eff.get(cur_effort, 0)) if cur_effort else 0
    if dm > 0:
        tip = f"/model {want_m} re-reads this chat once" if turn > 1 else f"/model {want_m}"
        if want_m == "fable":
            tip += " (Fable: Max plan, its own weekly cap)"
        return f"{head}; {now}. {tip}."
    if dm < 0 and r["class"] in ("quick", "search", "write", "edit"):
        if turn <= 1:
            return f"{head}; {now}. Cheaper: /model {want_m} before you go on."
        if cur_effort and eff.get(cur_effort, 0) > eff.get(want_e, 0) + 1:
            return f"{head}; {now}. /effort {want_e} keeps the cache; switch models in a new session."
        return None
    if de >= 1 and r["class"] in ("debug", "risky", "plan", "review", "research"):
        return f"{head}; {now}. /effort {want_e} (cache kept), or type ultrathink for this turn."
    if de <= -2:
        return f"{head}; {now}. /effort {want_e} saves usage (cache kept)."
    return None


def orchestrating(policy: dict, model: str | None, effort: str | None, prompt: str) -> bool:
    o = policy["orchestrator"]
    first = (prompt or "").strip().lower()
    if first.startswith(o["keyword_off"]):
        return False
    if first.startswith(o["keyword_on"]):
        return True
    eff = policy["efforts"]
    return model in o["models"] and effort is not None and eff.get(effort, 0) >= eff[o["min_effort"]]


# ----------------------------------------------------------------------------- hook handlers

def out(obj: dict | None) -> None:
    if obj:
        sys.stdout.write(json.dumps(obj))


def on_session_start(d: dict, policy: dict) -> dict | None:
    sid = d.get("session_id", "")
    st = load_state(sid)
    m = model_key(d.get("model")) or st.get("model")
    st.update({"model": m, "turn": 0 if d.get("source") in ("startup", "clear") else st.get("turn", 0)})
    save_state(sid, st)
    if d.get("source") == "startup":
        prune_states()
    session = label(policy, m, st.get("effort")) if m else None
    st["announced"] = [m, st.get("effort")]
    save_state(sid, st)
    o = {"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": card(policy, session)}}
    if d.get("source") == "startup":
        o["systemMessage"] = f"⚙ model-router {VERSION} on ({profile(policy)} plan). /model-router:route shows the table."
    return o


def on_prompt(d: dict, policy: dict) -> dict | None:
    prompt = d.get("prompt") or ""
    if prompt.lstrip().startswith("/") or len(prompt.strip()) < 2:
        return None
    sid = d.get("session_id", "")
    st = load_state(sid)
    st["turn"] = int(st.get("turn", 0)) + 1
    cur_m = st.get("model") or model_key(model_from_transcript(d.get("transcript_path")))
    cur_e = os.environ.get("CLAUDE_EFFORT") or (d.get("effort") or {}).get("level") or st.get("effort")
    cur_e = cur_e.lower() if isinstance(cur_e, str) and cur_e.lower() in policy["efforts"] else None
    st["model"] = cur_m
    orch = orchestrating(policy, cur_m, cur_e, prompt)
    lowered = prompt.strip().lower()
    notes = []
    if cur_m and [cur_m, cur_e] != st.get("announced"):
        notes.append(f"model-router: this session now runs {label(policy, cur_m, cur_e)}"
                     + ("; orchestrator mode on." if orch else "."))
        st["announced"] = [cur_m, cur_e]
    if lowered.startswith(policy["orchestrator"]["keyword_on"]) and not (cur_m in policy["orchestrator"]["models"]):
        notes.append("model-router: orchestrate requested; plan and check here and delegate per the routing card.")
    if lowered.startswith(policy["orchestrator"]["keyword_off"]):
        notes.append("model-router: solo for this prompt; no workers.")
    o: dict = {}
    if os.environ.get("MODEL_ROUTER_KEYWORD_HINTS") == "1":   # opt-in: keyword hints, measured at 61% on unseen prompts
        r = route(prompt, policy)
        st["last_route"] = [r["model"], r["effort"]]
        msg = hint(policy, r, cur_m, cur_e, st["turn"])
        if msg:
            o["systemMessage"] = msg
    save_state(sid, st)
    if notes:
        o["hookSpecificOutput"] = {"hookEventName": "UserPromptSubmit", "additionalContext": " ".join(notes)}
    return o or None


def on_pre_switch(d: dict, policy: dict) -> dict | None:
    toks = int(d.get("context_tokens") or 0)
    if not d.get("prompt_cache_warm") or toks < 20000:
        return None
    usd = d.get("estimated_cache_write_usd")
    cost = f" (≈${usd:.2f} at list price)" if isinstance(usd, (int, float)) else ""
    st = load_state(d.get("session_id", ""))
    tip = ""
    if st.get("last_route"):
        m, e = st["last_route"]
        tip = f" The last prompt routed to {label(policy, m, e)}."
    return {"systemMessage": f"⚙ model-router: this switch re-sends ~{toks // 1000}k tokens uncached{cost}. An effort change would keep the cache.{tip}"}


def on_post_switch(d: dict, policy: dict) -> dict | None:
    sid = d.get("session_id", "")
    st = load_state(sid)
    st["model"] = model_key(d.get("to_model")) or st.get("model")
    st["announced"] = [st["model"], st.get("effort")]
    save_state(sid, st)
    if not st["model"]:
        return None
    return {"hookSpecificOutput": {"hookEventName": "PostModelSwitch",
                                   "additionalContext": f"model-router: this session now runs {label(policy, st['model'], st.get('effort'))}."}}


def on_stop(d: dict, policy: dict) -> dict | None:
    level = (d.get("effort") or {}).get("level") or os.environ.get("CLAUDE_EFFORT")
    if level and str(level).lower() in policy["efforts"]:
        sid = d.get("session_id", "")
        st = load_state(sid)
        st["effort"] = str(level).lower()
        save_state(sid, st)
    return None


AGENT_FILE_MODEL = re.compile(r"^model:\s*(\S+)", re.M)

def agent_has_model(name: str, cwd: str | None) -> bool:
    project = os.environ.get("CLAUDE_PROJECT_DIR") or cwd or os.getcwd()
    for root in (os.path.join(project, ".claude", "agents"), os.path.join(os.path.expanduser("~"), ".claude", "agents")):
        if not os.path.isdir(root):
            continue
        for dirpath, _, files in os.walk(root):
            for fn in files:
                if not fn.endswith(".md"):
                    continue
                try:
                    with open(os.path.join(dirpath, fn), encoding="utf-8") as f:
                        text = f.read(4096)
                except OSError:
                    continue
                m = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
                if not m:
                    continue
                fm = m.group(1)
                n = re.search(r"^name:\s*(.+?)\s*$", fm, re.M)
                if (n and n.group(1).strip("'\"") == name) or fn[:-3] == name:
                    mm = AGENT_FILE_MODEL.search(fm)
                    return bool(mm and mm.group(1).strip("'\"") not in ("", "inherit"))
    return False


def on_pre_agent(d: dict, policy: dict) -> dict | None:
    if os.environ.get("MODEL_ROUTER_GUARD", "1") == "0":
        return None
    ti = d.get("tool_input") or {}
    if ti.get("model"):
        return None
    agent = str(ti.get("subagent_type") or "general-purpose")
    if agent == "fork" or ":" in agent:   # forks inherit by design; plugin agents carry their own model
        return None
    if agent_has_model(agent, d.get("cwd")):
        return None
    reason = (f"model-router: the '{agent}' agent would run on the main model. Call it again with model set to "
              "haiku (search, reading, test runs), sonnet (drafts, routine edits) or opus (reviews, hard problems), "
              "or use model-router:scout, runner, builder or reviewer.")
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                   "permissionDecisionReason": reason}}


HANDLERS = {"SessionStart": on_session_start, "UserPromptSubmit": on_prompt, "PreModelSwitch": on_pre_switch,
            "PostModelSwitch": on_post_switch, "Stop": on_stop, "PreToolUse": on_pre_agent}


def main(argv: list[str]) -> int:
    if len(argv) > 1 and argv[1] == "--classify":
        print(json.dumps(route(" ".join(argv[2:]) if len(argv) > 2 else sys.stdin.read()), indent=2))
        return 0
    if len(argv) > 1 and argv[1] == "--card":
        print(card(load_policy()))
        return 0
    try:
        d = json.load(sys.stdin)
        fn = HANDLERS.get(d.get("hook_event_name", ""))
        if fn:
            out(fn(d, load_policy()))
    except Exception as e:  # a hook must never block the session
        if os.environ.get("MODEL_ROUTER_DEBUG"):
            sys.stderr.write(f"model-router: {type(e).__name__}: {e}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
