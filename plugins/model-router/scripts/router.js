#!/usr/bin/env node
/* model-router: a model and effort router for Claude Code.

One script handles every hook event the plugin registers:
  SessionStart       remember the model; give Claude the routing card (the ladders) once per session
  UserPromptSubmit   tell Claude its model and effort when they change, note a delegation keyword
                     (solo, orchestrate low, orchestrate high), and, when the prompt's wording clearly points
                     at a kind of work this session's model or effort is too low for, add a one-line keyword hint
                     for Claude (77% right at high confidence on unseen prompts; Claude's own reading wins).
                     MODEL_ROUTER_KEYWORD_HINTS=1 shows every hint to you, "cheaper" ones included; =0 turns hints off
  PreModelSwitch     show what a switch re-sends; Claude Code's own confirmation stays
  PostModelSwitch    remember the new model and tell Claude with the next request
  Stop               remember the effort level that ran
  PreToolUse:Agent   make every subagent spawn name a model, so no helper silently runs on
                     Opus or Fable (set MODEL_ROUTER_GUARD=0 to turn this off)

From a shell:  node router.js --classify "some prompt"   prints the route as JSON
               node router.js --card                     prints the routing card

No hook can set the model or effort; the hints tell you, the worker agents carry their own.
policy.json is generated (tools/build.js); this file holds no model and effort pair of its own.
Node 18+, no dependencies. MIT licence. The classifier is a port of router.py 0.2.0 (same regular
expressions, same scores). Ideas and agent wording adapted from donimas/ai-routing @ 4a8312f (MIT); the
brief-and-check loop from the Omega guide (murphmaxxing.com); delegation limits from r/ClaudeAI 1x1nsaz
and 1xn0e12.
*/
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

const HERE = __dirname;

// ----------------------------------------------------------------------------- policy

function loadPolicy(file) {
  return JSON.parse(fs.readFileSync(file || process.env.MODEL_ROUTER_POLICY || path.join(HERE, "policy.json"), "utf8"));
}

function profile(policy) {
  const p = String(process.env.MODEL_ROUTER_PROFILE || policy.profile || "max").toLowerCase();
  return ["max", "pro", "lean"].includes(p) ? p : "max";
}

/** Map a model id, alias or label to haiku/sonnet/opus/fable. */
function modelKey(name) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  for (const [key, words] of [["fable", ["fable", "mythos"]], ["opus", ["opus"]], ["sonnet", ["sonnet"]], ["haiku", ["haiku"]]]) {
    if (words.some(w => n.includes(w))) return key;
  }
  return null;
}

// ----------------------------------------------------------------------------- classifier

const PRIORITY = ["risky", "debug", "plan", "review", "research", "edit", "write", "search", "quick"];

// The patterns below were written for Python's `re`. py2js keeps their meaning in JavaScript:
// \b, \w and \d are Unicode-aware as in Python, "." never matches a newline unless DOTALL is set,
// "$" also matches before one trailing newline, and "^"/"$" follow Python's MULTILINE rules.
const W = String.raw`\p{L}\p{N}_`;
function py2js(src, { multiline = false, dotall = false, ascii = false } = {}) {
  let out = "", inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      const n = src[++i];
      if (ascii && "bwd".includes(n)) out += "\\" + n;   // plain ASCII text: the built-in classes mean the same
      else if (n === "b" && !inClass) out += `(?:(?<=[${W}])(?![${W}])|(?<![${W}])(?=[${W}]))`;
      else if (n === "w") out += inClass ? W : `[${W}]`;
      else if (n === "d") out += String.raw`\p{Nd}`;
      else if (/[A-Za-z0-9]/.test(n)) out += "\\" + n;
      else if ("^$\\.*+?()[]{}|/".includes(n) || (n === "-" && inClass)) out += "\\" + n;
      else out += n;
    } else if (inClass) {
      if (c === "]") inClass = false;
      out += c;
    } else if (c === "[") {
      inClass = true; out += c;
      if (src[i + 1] === "^") out += src[++i];
    } else if (c === ".") out += dotall ? "." : String.raw`[^\n]`;
    else if (c === "$") out += multiline ? String.raw`(?=\n|(?![\s\S]))` : String.raw`(?=\n?(?![\s\S]))`;
    else if (c === "^") out += multiline ? String.raw`(?:(?<![\s\S])|(?<=\n))` : "^";
    else out += c;
  }
  return out;
}
const rx = (p, o = {}) => ({ p, o, flags: "gu" + (o.cs ? "" : "i") + (o.dotall ? "s" : "") });   // compiled on first use
const pick = (re, s) => {
  const k = /^[\x00-\x7f]*$/.test(s) ? "asc" : "uni";               // plain ASCII text takes the built-in classes
  return re[k] || (re[k] = new RegExp(py2js(re.p, { ...re.o, ascii: k === "asc" }), re.flags));
};
const matches = (re, s) => [...s.matchAll(pick(re, s))];   // Python findall
const found = (re, s) => s.search(pick(re, s)) >= 0;       // Python search (and match, for ^-anchored patterns)

const ERROR_STRONG = rx([
  String.raw`(traceback \(most recent|exception\b|\berrno\b|stack ?trace|segfault|segmentation fault|`,
  String.raw`core dumped|panic(ked)?:|exit (code|status) [1-9]|status code [45]\d\d|\b(4|5)0\d (error|bad|not|internal|service)|`,
  String.raw`\berror:|\berror \d|\berr_[a-z_]+|fatal:|unhandled|undefined is not|cannot read propert|`,
  String.raw`nullpointer|permission denied|connection refused|no such file|command not found|`,
  String.raw`modulenotfounderror|importerror|syntaxerror|typeerror|valueerror|keyerror|attributeerror|`,
  String.raw`indexerror|nameerror|oomkilled|out of memory|kernel panic|failed to [a-z]+|\berr!|#n/a|#value!|#ref!|#div/0!|#name\?|\bdeauth\b)`,
].join(""));
const DEBUG_INTENT = rx([
  String.raw`(\bwhy (does|is|isn'?t|doesn'?t|won'?t|did|do|am|are|can'?t|cant|would|wont|dont|do i|is my|does my)\b|`,
  String.raw`not working|doesn'?t work|does not work|isn'?t working|stopped working|no longer work|`,
  String.raw`won'?t (start|boot|load|open|connect|play|work|save|sync|update|run|mount|show|turn on)|`,
  String.raw`wont (start|boot|load|open|connect|play|work|save|sync|update|run|mount|show)|`,
  String.raw`keeps? (crashing|failing|restarting|disconnecting|buffering|freezing|dropping|timing out|stopping|rebooting)|`,
  String.raw`\bbroke\b|\bbroken\b|\bbuggy\b|\bbug\b|\bdebug|\bcrash|\bhangs?\b|\bhanging\b|\bstuck\b|\bfreez|`,
  String.raw`\bslow(er|ly)?\b|\blaggy\b|unexpected|wrong (output|result|value|answer|number|total)|`,
  String.raw`returns? (none|null|nothing|nan|undefined|empty|0\b|zero)|fix (this|the|my|it) (error|bug|issue|crash|problem)|`,
  String.raw`what'?s (wrong|causing|happening)|what is (wrong|causing)|figure out why|troubleshoot|`,
  String.raw`\bfail(s|ed|ing)?\b|\berrors?\b|throws?\b|\bwarning\b|stopped (showing|loading|syncing|working)|\banymore\b|`,
  String.raw`(isn'?t|is not|aren'?t|not) (picking|showing|loading|working|syncing|downloading|updating|connecting|playing|responding|detecting|finding)|`,
  String.raw`(was|were) (fine|working) (before|last|yesterday|until|earlier)|used to work|\bsuddenly\b|keeps? \w+ing\b|\bwhy\s*[?.!]*$|`,
  String.raw`(can'?t|cant|cannot|unable to|couldn'?t) (reach|connect|access|load|open|see|log ?in|ping|mount|play|stream|find (my|the) )|`,
  String.raw`(prints?|returns?|shows?|outputs?|gives?) .{0,25}instead of|\b(drops?|dropping|disconnects?|crawl(s|ing)?)\b|`,
  String.raw`taking (forever|ages|hours|days)|(has been|been) (running|stuck|going) (for )?\d+|\bred x\b|`,
  String.raw`(says|shows) .{0,40}\bbut\b|\bbut .{0,30}\b(says|shows) (passed|ok|fine|connected|healthy|running)|gives (#|an? )?(error|wrong|nothing|blank))`,
].join(""));
const RISK_EXPLICIT = rx([
  String.raw`(\bis (it|this|that) safe\b|\bsafe to\b|without losing|data loss|lose (my|all|the|any) (data|files|photos|media|settings)|`,
  String.raw`irreversible|can'?t (be )?undo|cannot be undone|\bin prod\b|\bon prod\b|\bproduction\b|live server|`,
  String.raw`before i (delete|wipe|format|upgrade|migrate|reset|reinstall)|rm -rf|drop (table|database)|force[- ]push|`,
  String.raw`chmod (-r )?777|port[- ]forward|open (a |the )?port|expose .{0,30}(internet|public|outside)|`,
  String.raw`(should i|can i|is it (smart|wise|worth)|how much (should|can|do)|\bmove\b|withdraw|\binvest|\bput\b|\bsell\b|\bbuy\b|transfer|close|cash out|claim|deduct|refinanc|pay off|consolidate)`,
  String.raw`.{0,40}\b(tfsa|rrsp|fhsa|401k|ira|roth|mortgage|loan|savings|portfolio|brokerage|stocks?|shares|etfs?|index funds?|crypto|bitcoin|taxes|tax return|debt)\b|`,
  String.raw`(leaked|exposed|pasted|committed|pushed|posted|shared|leaking) (my|the|an?|our) (\w+ )?(api ?key|password|token|secret|private key|credentials|ssh key)|`,
  String.raw`(api ?key|password|token|secret|credentials) (in|on|to) (a |my |the )?(public|github)|e-?transfer|\bupfront\b|\bscam\b|`,
  String.raw`fine to (send|pay|give|share|wire)|\b(send|pay|wire) \$\d|`,
  String.raw`\b(invest|investing|refinanc|withdraw|wire (money|transfer))|\bdosage\b|\bdose of\b|`,
  String.raw`\bis it legal\b|\blawsuit\b|\bsue\b|\bmy lease\b|\bcontract\b)`,
].join(""));
const RISK_ACTION = rx([
  String.raw`\b(delete|deleting|remove|removing|wipe|wiping|format|formatting|erase|drop|truncate|purge|`,
  String.raw`migrat\w*|move|moving|restore|restoring|reset|resetting|rebuild|rebuilding|resize|shrink|expand|`,
  String.raw`replace|replacing|swap|upgrade|upgrading|downgrade|update|updating|change|changing|rotate|revoke|grant|`,
  String.raw`set ?up|setting up|configure|configuring|install|installing|expose|exposing|forward|forwarding|`,
  String.raw`disable|disabling|enable|enabling|turn off|chmod|chown|kill|reinstall|flash|flashing|`,
  String.raw`transfer|transferring|send money|pay|paying|sell|selling|buy (stock|shares|crypto|etf)|`,
  String.raw`cancel|cancelling|share (my|the) (password|key|token)|give .{0,20} access|run (this|it) (as root|with sudo))\b`,
].join(""));
const RISK_OBJECT = rx([
  String.raw`\b(database|db|tables?|schema|backups?|array|pool|disks?|drives?|partition|zfs|raid|parity|`,
  String.raw`appdata|production|prod|nas|unraid|containers?|docker|compose|vms?|firewall|ports?|router|vpn|tunnel|`,
  String.raw`cloudflare|dns|ssl|tls|certs?|certificate|password|passwords|passphrase|secrets?|api ?keys?|ssh|`,
  String.raw`sudo|root|permissions?|auth|oauth|login|2fa|mfa|accounts?|bank|money|payments?|credit card|invoice|`,
  String.raw`taxe?s?|tfsa|rrsp|fhsa|stocks?|shares|etfs?|crypto|bitcoin|loan|mortgage|insurance|lease|`,
  String.raw`medication|meds|prescription|bios|firmware|bootloader|partition table|all (my|the) (data|files|photos))\b`,
].join(""));
const PLAN = rx([
  String.raw`(\bdesign\b|\barchitect|\broadmap\b|\bstrategy\b|\bstrategi|\bblueprint\b|trade-?offs?|\blong[- ]term\b|`,
  String.raw`system design|\bspec(ification)?\b|decision record|\badr\b|from scratch|scal(e|ing|able) (up|this|to)|`,
  String.raw`plan (out|for|my|the|a|how)|planning (out|my|the|a)|how (should|would) (i|we|you) (structure|organi[sz]e|set up|approach|design|architect|build|split|lay out|handle)|`,
  String.raw`structure (my|the|a|this|our)|overall (setup|plan|structure|approach)|which (stack|framework|architecture|approach)|`,
  String.raw`\bphases?\b|\bmilestones?\b|best approach|approach (for|to) (building|designing|structuring|organi[sz]ing|migrating)|`,
  String.raw`lay out (a|the) plan|game plan|data model|folder structure|project structure|\bin (\d+|ten|five|a few) years\b|future-?proof|`,
  String.raw`still works? in|for the next \d+|\b\d+[- ]day plan\b|plan to (get|become|reach|learn|save|pay)|maintenance (schedule|plan)|`,
  String.raw`(yearly|annual|weekly|monthly) (schedule|plan|routine)|set up a (schedule|routine|system) for|`,
  String.raw`break (it|this|them|.{0,25}) (into|up into) (modules|parts|services|pieces|files|stages)|\bin stages\b)`,
].join(""));
const REVIEW = rx([
  String.raw`(^\s*review\b|\breview (this|my|the|it|these|our|that|his|her)\b|code review|\bpr\b|pull request|fact[- ]?check|double[- ]?check|sanity[- ]?check|look over|`,
  String.raw`\bproofread|\bcritique|\baudit\b|is (this|my|it|that) (right|correct|accurate|ok|okay|good|valid|sound|true)|`,
  String.raw`anything wrong|did i (miss|get|do)|check (this|my|the|over) (code|work|answer|math|essay|draft|plan|spec|config|doc|document|letter|email|post|claims?|numbers?|calculation|logic|reasoning|script|sql|query|translation)|`,
  String.raw`find (bugs|issues|mistakes|errors|problems|holes) in|spot (any )?(errors|mistakes|issues|problems)|`,
  String.raw`\bverify (this|that|my|the)|any (mistakes|errors|issues) in|what did i (miss|get wrong)|poke holes|tear (this|it) apart|`,
  String.raw`grade (this|my)|give (me )?feedback on|feedback on (my|this)|is my \w+( \w+)? (right|correct|accurate|ok|okay|good|valid)|`,
  String.raw`can you (proofread|review|look over|fact[- ]?check)|can you check (this|my|if|whether|for (errors|mistakes|bugs|typos))|`,
  String.raw`anything i (missed|forgot)|(take|have) a (second|double|closer|hard|careful) look|\bre-?check\b|look again at|`,
  String.raw`does (this|my|the) (\w+ ){0,2}(line|regex|formula|query|code|config|script|command|cron(tab)?|rule|function|logic) `,
  String.raw`(\w+ )?(run|match|work|do|handle|catch|cover)|check (my|this|the|these) .{0,30}\bfor (errors|mistakes|typos|bugs|issues|problems|weak|gaps)|`,
  String.raw`tell me if (there (are|is)|it has) (any )?(\w+ )?(mistakes|errors|issues|problems|bugs|typos)|\b(gaps|contradictions|inconsistencies|loopholes)\b)`,
].join(""));
const RESEARCH = rx([
  String.raw`(\bcompare\b|comparison|\bvs\.?\b|\bversus\b|which (is|one|would be|should i|do you) (better|best|get|buy|pick|choose|recommend)|`,
  String.raw`\bbest (way|ways|option|options|tool|tools|app|apps|service|model|laptop|phone|tv|monitor|router|nas|gpu|cpu|camera|`,
  String.raw`headphones|budget|alternative|setup|card|plan|brand|place|time)|recommend(ation)?s?\b|should i (buy|get|use|choose|go with|switch|pick|upgrade to)|`,
  String.raw`pros and cons|options (for|to)|alternatives? (to|for)|worth (it|buying|getting|the money|upgrading)|\blatest\b|`,
  String.raw`\bcurrent(ly)? (state|version|price|best|status)|\bnews\b|reviews? (of|for)|\bresearch\b|what'?s new|state of|\bdeals?\b|`,
  String.raw`price (of|for|history)|cheapest|benchmarks?|look into|dig into|deep dive|what do people (say|think)|reddit|`,
  String.raw`\bis better\b|(better|best),? .{0,40}\bor\b|which .{0,30}(is better|should i|to (get|buy|choose|pick))|`,
  String.raw`what are people saying|people say|should i get|find out (what|whats|what's|which|how|if|whether|why)|`,
  String.raw`lessons (we|i) can learn|what'?s (useful|worth (taking|copying|stealing))|is it any good)`,
].join(""));
const EDIT = rx([
  String.raw`(\badd (a|an|the|some|support|dark mode|logging|validation|tests?|error handling)\b|`,
  String.raw`\badd \w+ (validation|support|button|field|option|page|feature|check|toggle|endpoint|column|tests?|logging)\b|`,
  String.raw`\badd (type hints|types|comments|docstrings|a test|an option|a flag|retries|caching|a column|a field)\b|`,
  String.raw`\bmake (the|this|my) (script|function|app|code|bot|page|program|tool|site|website|component|button|query)\b|`,
  String.raw`change (the|this|my) (\w+ ){0,2}(line|text|label|title|subject|message|name|value|setting|wording|mapping|path)\b|`,
  String.raw`\b(in|to) (my|the) (compose|config|yaml|json|docker-compose|\.env|settings) file\b|\bimplement|\brefactor|\brename\b|`,
  String.raw`rewrite (this|the) (function|code|script|query|component|class|loop|regex)|`,
  String.raw`change (the|this|my) (code|function|script|config|setting|colou?r|text|label|layout|style|query|font|default|variable)|`,
  String.raw`update (the|this|my) (code|script|config|function|readme|file|yaml|json|css|html|query|template|docs?)|`,
  String.raw`(write|make|build|create|give) (me )?(a|an)? ?(small |quick |simple |little |short )?(script|function|regex|query|sql|bash|python|shell|class|component|unit tests?|tests? for|dockerfile|compose file|cron( job)?|workflow|macro|formula|webhook|endpoint|api route|css|html page|shortcut|alias)|`,
  String.raw`make (it|this) (also|so|return|accept|handle|work with|support|use)|convert (this|the|my) (\w+ ){0,2}(code|script|function|query|file|component|class)|port (this|it) to|`,
  String.raw`\bedit (the|this|my)|\bmodify\b|\btweak\b|\binsert\b|extract (a|this|the) (function|method|component)|`,
  String.raw`\bone-?liner\b|\bsnippet\b|\bhelper function\b|\bfunction (that|to|which)\b|\bscript (that|to|which)\b|\.py\b|\.js\b|\.ts\b|\.sh\b|\.yaml\b|\.yml\b|\.json\b|\.css\b)`,
].join(""));
const WRITE = rx([
  String.raw`(\b(text|message|note|email|dm|card) (to|for) (my|the|a|our)\b|\b(birthday|wedding|retirement|thank[- ]you|farewell) (message|card|note|wish|speech|toast)|`,
  String.raw`\bcover letter\b|\bproduct description\b|description (for|of) (my|the|a|our)|\blisting\b|\breadme\b|\bchangelog\b|release notes|`,
  String.raw`^\s*explain\b|like (i'?m|im|i am) (new|five|5|a beginner|dumb|twelve)|`,
  String.raw`\bwrite (a|an|me|my|the|up)?\s*(\w+ ){0,2}(email|e-mail|message|text|letter|post|reply|response|caption|bio|toast|speech|story|poem|tweet|`,
  String.raw`review for|description|cover letter|summary|thank|note|announcement|intro|paragraph|blog|newsletter|essay|article|report|update for)|`,
  String.raw`\bdraft\b|reply to|respond to|\brephrase|\breword|paraphrase|`,
  String.raw`rewrite (this|my|the|it) ?(email|message|text|paragraph|post|letter|intro|sentence|bio|description|so|to|in|more|less)?|`,
  String.raw`summari[sz]e|\btl;?dr\b|\btranslat|\bpolish (this|my|it)|make (this|it) (sound|more|less|shorter|longer|friendlier|professional|formal|casual|clearer|polite)|`,
  String.raw`explain .{0,40}\b(to|like|for) (me|my|a|an|someone|kids?|non-?technical)|in (simple|plain) (words|terms|english)|like i'?m (5|five)|\bcaption\b|\bheadline\b|subject line|\bslogan\b|\bwording\b|`,
  String.raw`how (do|should) i (say|word|phrase|tell|ask|respond)|what (should|do) i (say|write|reply))`,
].join(""));
const SEARCH = rx([
  String.raw`(\bfind (all|every|the|my|where|which|out where|any|me the|files?|emails?|lines?)\b|`,
  String.raw`where (is|are|did|do|does) .{0,40}(defined|stored|located|saved|kept|configured|set|used|mentioned|called|declared|live)|`,
  String.raw`\blocate\b|\blist (all|every|the|my|each|out)\b|\bsearch (for|my|the|through|in|across)\b|\bgrep\b|look (through|in|for) (my|the|all|this)|`,
  String.raw`go through (my|the|all|this|these)|scan (the|my|this|these|through)|pull out|extract (all|every|the|each|any) |`,
  String.raw`collect (all|every)|\bevery (file|email|mention|place|time|instance|occurrence|reference)|`,
  String.raw`\bin (my|the|this) (inbox|logs?|folder|files|repo|codebase|docs|documents|notes|vault|downloads|drive|spreadsheet|chat history|history)\b|`,
  String.raw`which (files?|emails?|pages?|lines?|containers?|messages?|notes?|functions?|scripts?|chats?)\b.{0,30}\b(contain|mention|use|have|reference|import|call|talk|say)|`,
  String.raw`which of (my|the|these|our) (\w+ ){0,2}(files?|emails?|threads?|messages?|notes?|pages?|docs?|documents?|chats?|photos?)|\bcount (the|all|how many)\b|how many (times|files|emails|lines|places|containers|references)|`,
  String.raw`\bshow me (all|every|where)|\bdig up\b|\btrack down\b)`,
].join(""));
const QUICK_START = rx([
  String.raw`^\s*(what|whats|what'?s|who|whos|when|where|which|how (do|does|can|to|much|many|long|old|far|big)|is|are|does|do|did|can|could|`,
  String.raw`should|was|were|define|meaning of|convert|tell me|quick q|eli5)\b`,
].join(""));
const QUICK_PHRASE = rx([
  String.raw`(\bstand for\b|meaning of|difference between|\bshortcut\b|keyboard shortcut|\bconvert\b .{0,20}\bto\b|`,
  String.raw`how many .{0,20} in (a|an|one)\b|what time zone|what year|who (is|was|invented|made|wrote)|\bdefine\b|`,
  String.raw`what does .{0,30} mean|what is (a|an|the)? ?[a-z0-9\-]+( [a-z0-9\-]+)?\??$|`,
  String.raw`^\s*[\d.,]+\s*[a-z°%]+ (in|to|into) [a-z°]+\s*\??$|^\s*(the )?(capital|population|height|size|age|currency|language|`,
  String.raw`time ?zone|meaning|definition|spelling|plural|synonym|antonym|opposite) of\b)`,
].join(""));
const GREETING = rx(String.raw`^\s*(hi|hey|hello|thanks|thank you|thx|ok|okay|cool|nice|lol|great|yes|no|yep|nope|sure)\b[\s!.?]*$`);
const CODE_FENCE = rx("```.*?(```|$)", { cs: true, dotall: true });
const LOG_LINE = rx(String.raw`^\s*(\[?\d{4}-\d\d-\d\d|\[?\d\d:\d\d:\d\d|[A-Z][a-z]{2} +\d{1,2} \d\d:\d\d)`, { cs: true, multiline: true });
const CODEY_LINE = rx(String.raw`^\s*([{}\[\]<>]|def |class |import |from |function |const |let |var |#include|SELECT |\$ |>>> |\w+\(.*\)\s*[;{]?\s*$)`, { cs: true, multiline: true });

function classify(prompt) {
  const raw = prompt || "";
  const hasFence = found(CODE_FENCE, raw);
  const hasCode = hasFence || matches(CODEY_LINE, raw).length >= 2;
  const prose = raw.replace(pick(CODE_FENCE, raw), " ");
  const words = prose.split(/\s+/u).filter(Boolean).length;
  const s = Object.fromEntries(PRIORITY.map(k => [k, 0]));
  const why = [];

  if (found(GREETING, raw)) return { class: "quick", confidence: "high", scores: s, why: ["greeting"], words };

  const errStrong = found(ERROR_STRONG, raw) || matches(LOG_LINE, raw).length >= 2;
  const debugHits = matches(DEBUG_INTENT, prose).length;
  if (errStrong) { s.debug += 3; why.push("error text"); }
  if (debugHits) { s.debug += Math.min(debugHits, 3) * 1.2; why.push("debug words"); }

  if (found(RISK_EXPLICIT, raw)) { s.risky += 3; why.push("risk words"); }
  const acts = matches(RISK_ACTION, prose), objs = matches(RISK_OBJECT, prose);
  if (acts.length && objs.length) {
    const distinct = new Set(objs.map(m => m[1])).size;   // as matched, case kept (as in the Python version)
    s.risky += distinct === 1 ? 1.5 : (distinct === 2 ? 2.0 : 2.5);
    why.push("risky action on a risky object");
  }

  for (const [key, pat, w] of [["plan", PLAN, 1.6], ["review", REVIEW, 1.8], ["research", RESEARCH, 1.4],
                               ["edit", EDIT, 1.5], ["write", WRITE, 1.6], ["search", SEARCH, 1.7]]) {
    const n = matches(pat, key === "edit" || key === "review" ? raw : prose).length;
    if (n) { s[key] += w * Math.min(n, 3); why.push(`${key} words`); }
  }

  if (hasCode) {
    if (s.debug > 0) s.debug += 1;
    else if (s.review > 0) s.review += 1;
    else s.edit += 1.2;
    why.push("code");
  }

  const quickOk = words <= 25 && !hasCode && !errStrong && !PRIORITY.some(k => k !== "quick" && s[k] > 0);
  if (quickOk) {
    if (found(QUICK_START, prose)) s.quick += 1.6;
    if (found(QUICK_PHRASE, prose)) s.quick += 1.6;
    if (words <= 12 && found(QUICK_START, prose)) s.quick += 0.6;
  }
  if (s.quick && !PRIORITY.some(k => k !== "quick" && s[k])) why.push("short question");

  // risky beats everything once it has a real signal; debug words alone don't make a task risky
  const order = [...PRIORITY].sort((a, b) => (s[b] - s[a]) || (PRIORITY.indexOf(a) - PRIORITY.indexOf(b)));
  let top = order[0], second = order[1];
  if (s.risky >= 3) {            // explicit risk words win; action+object alone competes on score
    top = "risky";
    second = order.find(k => k !== "risky");
  }
  const best = s[top], runnerUp = s[second];
  if (best <= 0) return { class: "unsure", confidence: "none", scores: s, why: ["no signal"], words };
  let conf;
  if (top === "risky") conf = best >= 3 ? "high" : "medium";
  else if (best >= 3 || (best >= 1.5 && best - runnerUp >= 1)) conf = "high";
  else if (best - runnerUp >= 0.5) conf = "medium";
  else conf = "low";
  return { class: top, confidence: conf, scores: s, why, words };
}

// ----------------------------------------------------------------------------- rules on top of the classes
// policy.rules (optional: a policy without it routes as before). Both rules apply after the keyword classifier
// and leave its patterns and scores alone. What counts as code, as small and as "all here" is judgment.

// A line that looks like a statement: it ends like one or starts like one. Indentation alone is not enough, and neither is
// a code fence: error output is often indented or fenced, and it is not the code.
const CODE_LINE = new RegExp([
  String.raw`[;{}]\s*$`,
  String.raw`\w\([^)]*\)\s*:\s*$`,
  String.raw`^\s*(?:for \w+ in .+|while .+|if .+|elif .+|else|try|except.*|with .+):\s*$`,
  String.raw`^\s*(?:def \w|class \w+[:(]|import \w|from [\w.]+ import |function \w*\(|(?:const|let|var) \w+\s*=|#include|SELECT |CREATE |INSERT |UPDATE |\$ |>>> )`,
  String.raw`^\s*[\w.\[\]]+\s*[-+*\/]?=\s*\S+;?\s*$`,
  String.raw`^\s*\w[\w.]*\(.*\)\s*$`,
].join("|"));
// The prose says the code is not all in the prompt, or that the failure does not show on every run.
const ELSEWHERE = new RegExp([
  String.raw`\b(?:repo(?:sitory)?|code ?base|package|other files?|rest of|spread over|in production|on prod|sometimes|intermittent\w*|flaky|randomly|occasionally|now and then|once in a while|one (?:run|time|request) in|can(?:'|’|no)?t (?:reproduce|make it happen)|cannot reproduce)\b`,
  String.raw`(?:^|\s)[\w.-]+\/[\w.-]+(?:\/[\w.\/-]*|\.\w{1,5})(?=$|[\s.,;:)])`,
].join("|"), "i");

// A stack trace or a compiler message shows where it failed, not the code: frame lines (and the source line Python prints
// under each), gutter lines ("3 |  let w = v;") and pointers don't count.
const TRACE_LINE = /^\s*(?:Traceback \(most recent call last\)|File ".*", line \d+|at .+[(:]\S*:\d+(?::\d+)?\)?\s*$|\d*\s*\||-->|\^+\s*$)/;
function givenCode(raw) {
  let inFence = false, code = 0, skip = false;
  const prose = [];
  (raw || "").split("\n").forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (skip) { skip = false; return; }
    if (TRACE_LINE.test(line)) { skip = /^\s*File "/.test(line); return; }
    if ((inFence || i > 0) && CODE_LINE.test(line)) code++; else if (!inFence) prose.push(line);
  });
  return { code, prose: prose.join("\n") };
}

/** A small bug with all its code in the prompt: some code is given, not much of it, no log, nothing that points elsewhere. */
function smallBug(raw, rule) {
  const g = givenCode(raw);
  if (g.code < 2 || g.code > (rule.max_code_lines || 40)) return false;
  if (matches(LOG_LINE, raw || "").length >= 2) return false;
  return !ELSEWHERE.test(g.prose);
}

const LEVEL = String.raw`(low|medium|high|xhigh|x-high|extra[- ]high|max(?:imum)?)`;
const NOUN = "(?:effort|thinking|reasoning)";
const NAMED_EFFORT = [
  String.raw`\b(?:at|use|using)\s+(?:an?\s+|the\s+)?${LEVEL}[- ]${NOUN}\b`,          // "at medium effort", "use high effort"
  String.raw`^\s*${LEVEL} ${NOUN}\b`,                                                // the prompt opens with "low effort ..."
  String.raw`[.!?:;,]\s*${LEVEL} effort(?:\s+(?:please|is (?:fine|enough|ok|okay|plenty)|will do|only)\b|\s*:)`,
  String.raw`\beffort\s*[:=]\s*${LEVEL}\b`,                                          // "effort: low"
  String.raw`\b(?:set|keep|put|raise|lower|bump)\s+(?:the\s+)?effort\s+(?:level\s+)?(?:to|at)\s+${LEVEL}\b`,
].map(p => new RegExp(p, "i"));
const ABOUT_PAST_WORK = /\b(?:wrote|written|made|generated|produced|drafted|built|ran|was|were|did)\b/i;   // "written with Fable at high effort"
const ASKS_ABOUT_EFFORT = /^\s*(?:should (?:i|we)|is it worth|what (?:does|is)|when (?:should|to)|does|do (?:i|we))\b/i;

/** The effort a prompt asks for ("use high effort: ...", "low effort is fine"), or null. A question about effort names none. */
function namedEffort(prompt) {
  const text = prompt || "";
  for (const re of NAMED_EFFORT) {
    const m = re.exec(text);
    if (!m) continue;
    const from = Math.max(...[".", "!", "?", ":", ";", "\n"].map(ch => text.lastIndexOf(ch, m.index))) + 1;
    const tail = /[.!?:;\n]/.exec(text.slice(m.index + m[0].length));
    if (tail && tail[0] === "?" && ASKS_ABOUT_EFFORT.test(text.slice(from))) continue;
    if (ABOUT_PAST_WORK.test(text.slice(from, m.index))) continue;
    const w = m[1].toLowerCase();
    return w.startsWith("max") ? "max" : (/^(x|extra)/.test(w) ? "xhigh" : w);
  }
  return null;
}

function route(prompt, policy) {
  policy = policy || loadPolicy();
  const c = classify(prompt);
  const prof = profile(policy), rules = policy.rules || {};
  let entry = policy.classes[c.class] || policy.unsure;
  let pair = entry[prof];                                    // where this kind of work starts
  let ladder = entry.ladders ? entry.ladders[prof] : [pair];
  let checked = entry.checked ? entry.checked[prof] : pair;
  let reason = entry.why || "";
  const sb = rules.small_bug;
  if (sb && c.class === sb.from && policy.classes[sb.as] && smallBug(prompt, sb)) {
    entry = policy.classes[sb.as];
    pair = entry[prof];
    ladder = entry.ladders[prof].slice(entry.ladders[prof].findIndex(p => p[0] === pair[0] && p[1] === pair[1]));
    checked = pair;                                          // running the code is the check: no step lower
    reason = sb.why;
    c.why.push("small bug, code given");
    Object.assign(c, { class: sb.as, rule: "small-bug" });
  }
  const named = rules.named_effort && c.class !== "unsure" ? namedEffort(prompt) : null;
  if (named) {
    const kept = entry.no_step_down && policy.efforts[named] < policy.efforts[pair[1]];   // risky work keeps its step
    pair = [pair[0], kept ? pair[1] : named];
    checked = pair;
    reason = rules.named_effort.why.replace("{effort}", named) + (kept ? `; ${c.class} work never goes below its step` : "");
    c.named = named;
  }
  return Object.assign(c, { model: pair[0], effort: pair[1], profile: prof, reason, delegate: entry.delegate ?? null, ladder, checked });
}

// ----------------------------------------------------------------------------- state

function stateDir() {
  const base = process.env.CLAUDE_PLUGIN_DATA || path.join(os.homedir(), ".claude", "model-router");
  const d = path.join(base, "sessions");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

function statePath(sessionId) {
  const safe = String(sessionId || "nosession").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
  return path.join(stateDir(), safe + ".json");
}

function loadState(sessionId) {
  try { return JSON.parse(fs.readFileSync(statePath(sessionId), "utf8")); } catch { return {}; }
}

function saveState(sessionId, st) {
  const p = statePath(sessionId), tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(st));
  fs.renameSync(tmp, p);
}

function pruneStates(days = 7) {
  const cutoff = Date.now() - days * 86400 * 1000;
  const d = stateDir();
  for (const name of fs.readdirSync(d)) {
    const p = path.join(d, name);
    try { if (fs.statSync(p).mtimeMs < cutoff) fs.unlinkSync(p); } catch { /* ignore */ }
  }
}

/** Last assistant model in the transcript tail (an undocumented field; best effort only). */
function modelFromTranscript(file) {
  try {
    if (!file || !fs.statSync(file).isFile()) return null;
    const fd = fs.openSync(file, "r");
    const size = fs.fstatSync(fd).size, start = Math.max(0, size - 262144);
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    const all = [...buf.toString("utf8").matchAll(/"model"\s*:\s*"(claude-[a-z0-9\-\[\].]+)"/g)];
    return all.length ? all[all.length - 1][1] : null;
  } catch { return null; }
}

// ----------------------------------------------------------------------------- messages

function label(policy, model, effort) {
  const m = (policy.models[model || ""] || {}).label || model || "?";
  return effort ? `${m} · ${effort}` : m;
}

const short = (policy, p) => `${policy.models[p[0]].label.replace(/ \d.*/, "")} · ${p[1]}`;

function card(policy, session) {
  const prof = profile(policy);
  const L = p => label(policy, p[0], p[1]), same = (x, y) => x[0] === y[0] && x[1] === y[1];
  // The start comes first and is named as the start: a ladder with the start marked in the middle was read by
  // Haiku · low as starting at its first step (trap test, 2026-11-12). Steps below the start that no check leads to are left out.
  const groups = new Map();                                  // classes that share their steps share a clause
  for (const cls of [...PRIORITY].reverse()) {
    const e = policy.classes[cls], lad = e.ladders[prof], s = e[prof], c = e.checked ? e.checked[prof] : s;
    const up = lad.slice(lad.findIndex(p => same(p, s)) + 1);
    const text = L(s) + (same(s, c) ? "" : ` (${L(c)} with a cheap check)`) + (e.plan_first ? ", plan first, never lower" : "")
      + (up.length ? `, then ${up.map(L).join(" → ")}` : "") + (e.note ? `; ${e.note}` : "") + (e.not_below_author ? ", never below the pair that did the work" : "");
    if (!groups.has(text)) groups.set(text, []);
    groups.get(text).push(`${cls} (${e.help})`);
  }
  const ladders = [...groups].map(([k, v]) => `${v.join(", ")}: ${k}`).join("; ");
  const R = policy.rules || {};                              // the two rules on top of the classes, when the policy has them
  const rules = (R.small_bug ? `${R.small_bug.ask} ${R.small_bug.then.replace("{pair}", L(policy.classes[R.small_bug.as][prof]))} ` : "")
    + (R.named_effort ? `${R.named_effort.ask} ${R.named_effort.then.replace("{where}", "the start model of that kind of work")
      .replace("{floor}", L(policy.classes[R.named_effort.floor_class][prof]))} ` : "");
  const a = policy.agents, o = policy.orchestrator, u = policy.unsure[prof];
  const prices = Object.entries(policy.price_ratio).map(([k, v]) => `${policy.models[k].label.replace(/ \d.*/, "")} ${v}`).join(", ");
  return (
    "model-router (plugin). On every prompt, place the task before you start.\n"
    + (session ? `- This session: ${session}.\n` : "")
    + `- Where each kind of work starts (${prof} plan). The first pair is the start, a pair in parentheses is the start when a `
    + `cheap check exists, and the pairs after 'then' are the steps to climb: ${ladders}. `
    + `Priority when two classes fit: ${PRIORITY.join(", ")}. When unsure: ${label(policy, u[0], u[1])}. `
    + `Effort ${policy.excluded_efforts.join(", ")} is on no ladder; use it on request only.\n`
    + "- These questions place a task. Can the result be checked cheaply (tests, a command, a fact to look up)? Then start on "
    + "the pair in parentheses, run the check and climb one step each time it fails; writing and plans have no such check. "
    + rules
    + "What does a mistake cost? Judge what is being touched, not the kind of change: money, security, data or a live system "
    + "makes the task risky, whatever else it is. How many steps, and how much bulk reading? Those decide what goes to workers, "
    + "not the step.\n"
    + "- If the session's model or effort is below the task's step, or well above it on quick, search, write or edit work, start "
    + "your reply with one line, '⚙ Better on <model> · <effort>: <reason>', then do the task (for risky work on Haiku or Sonnet, "
    + "ask before acting). Mid-task suggest /effort (keeps the cache) rather than /model (re-reads the conversation). Say nothing "
    + "when it fits. On a long task with Sonnet or Opus as the main model you may suggest /advisor fable once.\n"
    + `- Workers with a fixed model and effort: ${a.scout}; ${a.runner}; ${a.builder}; ${a.reviewer}. For long material to `
    + `summarize, call scout with effort ${policy.summary_helper[1]}. Any other Agent call must pass model: haiku for search, reading `
    + "and test runs; sonnet for drafts and routine edits; opus for reviews and hard problems. Never a Fable worker.\n"
    + `- Delegation is set by the first word of a prompt. '${o.keyword_off}': router off for that prompt, no workers and no 'Better on' `
    + `line. '${o.keyword_on} low': do the work here, workers only for bulk reading and test runs. '${o.keyword_on}' or '${o.keyword_on} high': `
    + `plan, check and answer here, workers do the rest. No keyword: high on ${o.models.map(m => policy.models[m].label.replace(/ \d.*/, "")).join(" or ")} `
    + `at ${o.min_effort} or above, otherwise low. Here low and high mean how much is delegated, never the effort. Every brief has the `
    + "goal, the inputs and a 'Done when:' check that you re-run; keep reviews, fact-checks, hard code and risky work here in every "
    + `mode; after two failures do that step yourself. Price per input token: ${prices}. Small steps stay here.`
  );
}

/** Does the session's model and effort fit the routed class? Returns null when it does, else what to change. */
function fit(policy, r, curModel, curEffort) {
  const eff = policy.efforts;
  const rank = m => (policy.models[m || ""] || {}).rank || 0;
  const need = r.checked || [r.model, r.effort];             // the lowest step this kind of work should run on
  const start = [r.model, r.effort];
  const top = r.ladder ? r.ladder[r.ladder.length - 1] : start;
  const cheap = ["quick", "search", "write", "edit"].includes(r.class);
  if (rank(curModel) < rank(need[0])) return { kind: "model-up", want: need };
  if (curModel === need[0] && curEffort && (eff[curEffort] || 0) < eff[need[1]]) return { kind: "effort-up", want: need };
  if (cheap && rank(curModel) > rank(top[0])) return { kind: "model-down", want: start };
  const slack = r.named ? 1 : 2;                             // an effort the prompt names is exact; otherwise one level over is fine
  if (curModel === start[0] && curEffort && (eff[curEffort] || 0) >= eff[start[1]] + slack) return { kind: "effort-down", want: start };
  return null;
}

/** One line, or null when the current setting fits (or the classifier is unsure). */
function hint(policy, r, curModel, curEffort, turn) {
  if (r.class === "unsure" || r.confidence === "low") return null;
  const need = r.checked || [r.model, r.effort];
  const start = [r.model, r.effort];
  const range = need[0] === start[0] && need[1] === start[1] ? label(policy, start[0], start[1])
    : `${label(policy, start[0], start[1])} (${short(policy, need)} when a check can catch a mistake)`;
  const head = `⚙ model-router: ${r.class} → ${range} (${r.reason})`;
  if (curModel == null) {
    return ["risky", "debug", "plan", "review", "research"].includes(r.class) && r.confidence === "high" ? head : null;
  }
  const f = fit(policy, r, curModel, curEffort);
  if (!f) return null;
  const now = `now ${label(policy, curModel, curEffort)}`;
  const [m, e] = f.want;
  if (f.kind === "model-up") {
    let tip = turn > 1 ? `/model ${m} re-reads this chat once` : `/model ${m}`;
    if (m === "fable") tip += " (Fable has its own allowance)";
    return `${head}; ${now}. ${tip}.`;
  }
  if (f.kind === "effort-up") return `${head}; ${now}. /effort ${e} (cache kept), or type ultrathink for this turn.`;
  if (f.kind === "model-down") {
    if (turn <= 1) return `${head}; ${now}. Cheaper: /model ${m} before you go on.`;
    if (curEffort && (policy.efforts[curEffort] || 0) > policy.efforts[e] + 1) {
      return `${head}; ${now}. /effort ${e} keeps the cache; switch models in a new session.`;
    }
    return null;
  }
  return `${head}; ${now}. /effort ${e} saves usage (cache kept).`;
}

// A prompt's first word can set how much is delegated. "low" and "high" here are amounts of delegation, so
// "orchestrate high effort ..." is plain orchestrate, and "solo developer here ..." is not the keyword.
const SOLO_NOUNS = new Set(["developer", "dev", "founder", "trip", "travel", "traveler", "traveller", "project", "player", "game",
                            "artist", "album", "career", "parent", "practice", "practitioner", "entrepreneur", "business", "show",
                            "performance", "flight", "hike", "queue", "act", "instrument", "piece", "part", "cup", "401k"]);
function parseMode(prompt, policy) {
  const o = policy.orchestrator, text = prompt || "";
  const m = /^\s*([A-Za-z]+)([:,]?)[ \t]*([^\s:,.;!?]*)([:,]?)[ \t]*([^\s:,.;!?]*)/.exec(text);
  if (!m) return { mode: null, rest: text };
  const w0 = m[1].toLowerCase(), w1 = m[3].toLowerCase(), w2 = m[5].toLowerCase();
  const after = n => text.replace(new RegExp(`^\\s*(?:[A-Za-z]+[:,]?[ \\t]*){${n}}`), "").replace(/^[\s:,\-–—]+/, "");
  if (w0 === o.keyword_off) {
    if (!m[2] && SOLO_NOUNS.has(w1)) return { mode: null, rest: text };
    return { mode: "solo", rest: after(1) };
  }
  if (w0 === o.keyword_on) {
    if (!m[2] && (w1 === "low" || w1 === "high") && !["effort", "thinking", "reasoning"].includes(w2)) return { mode: w1, rest: after(2) };
    return { mode: "high", rest: after(1) };
  }
  return { mode: null, rest: text };
}

/** How much to delegate when the prompt has no keyword. */
function autoMode(policy, model, effort) {
  const o = policy.orchestrator, eff = policy.efforts;
  return o.models.includes(model) && effort != null && (eff[effort] || 0) >= eff[o.min_effort] ? "high" : "low";
}

const MODE_NOTE = {
  solo: "model-router: solo for this prompt; router off: no workers and no 'Better on' line.",
  low: "model-router: orchestrate low for this prompt; do the work here, workers only for bulk reading and test runs.",
  high: "model-router: orchestrate high for this prompt; plan, check and answer here and hand the rest to workers per the routing card (risky work stays here).",
};

// ----------------------------------------------------------------------------- hook handlers

function onSessionStart(d, policy) {
  const sid = d.session_id || "";
  const st = loadState(sid);
  const m = modelKey(d.model) || st.model || null;
  Object.assign(st, { model: m, turn: ["startup", "clear"].includes(d.source) ? 0 : (st.turn || 0) });
  saveState(sid, st);
  if (d.source === "startup") pruneStates();
  const session = m ? label(policy, m, st.effort) : null;
  st.announced = [m, st.effort ?? null];
  saveState(sid, st);
  const o = { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: card(policy, session) } };
  if (d.source === "startup") {
    o.systemMessage = `⚙ model-router ${policy.plugin_version || ""} on (${profile(policy)} plan). /model-router:route shows the ladders.`;
  }
  return o;
}

function onPrompt(d, policy) {
  const prompt = d.prompt || "";
  if (prompt.trimStart().startsWith("/") || prompt.trim().length < 2) return null;
  const sid = d.session_id || "";
  const st = loadState(sid);
  st.turn = (parseInt(st.turn, 10) || 0) + 1;
  const curM = st.model || modelKey(modelFromTranscript(d.transcript_path));
  let curE = process.env.CLAUDE_EFFORT || (d.effort || {}).level || st.effort;
  curE = typeof curE === "string" && curE.toLowerCase() in policy.efforts ? curE.toLowerCase() : null;
  st.model = curM || null;
  const { mode, rest } = parseMode(prompt, policy);
  const notes = [];
  if (curM && JSON.stringify([curM, curE]) !== JSON.stringify(st.announced || null)) {
    notes.push(`model-router: this session now runs ${label(policy, curM, curE)}; delegation ${autoMode(policy, curM, curE)} unless a prompt says otherwise.`);
    st.announced = [curM, curE];
  }
  if (mode) notes.push(MODE_NOTE[mode]);
  const o = {};
  const kw = process.env.MODEL_ROUTER_KEYWORD_HINTS;         // unset: hint for Claude; "1": also shown to you; "0": off
  if (kw !== "0" && mode !== "solo") {
    const r = route(rest, policy);
    st.last_route = [r.model, r.effort];
    const msg = hint(policy, r, curM, curE, st.turn);
    if (msg && kw === "1") o.systemMessage = msg;
    const key = msg ? [r.class, curM, curE].join("|") : null;
    // Claude only gets hints that point up. On unseen prompts 7 of 64 confident keyword guesses named a cheaper
    // class than the real one (one of them risky work), so "cheaper" is shown to you on request and never pushed.
    const f = curM ? fit(policy, r, curM, curE) : null;
    const up = !curM || (f !== null && f.kind.endsWith("-up"));
    if (msg && up && r.confidence === "high" && key !== st.hinted) {
      notes.push(msg.replace("⚙ model-router:", "model-router keyword hint (a guess from the prompt's wording; your own reading of the task wins):"));
    }
    st.hinted = key;
  }
  saveState(sid, st);
  if (notes.length) o.hookSpecificOutput = { hookEventName: "UserPromptSubmit", additionalContext: notes.join(" ") };
  return Object.keys(o).length ? o : null;
}

function onPreSwitch(d, policy) {
  const toks = parseInt(d.context_tokens, 10) || 0;
  if (!d.prompt_cache_warm || toks < 20000) return null;
  const usd = d.estimated_cache_write_usd;
  const cost = typeof usd === "number" ? ` (≈$${usd.toFixed(2)} at list price)` : "";
  const st = loadState(d.session_id || "");
  let tip = "";
  if (st.last_route) tip = ` The last prompt routed to ${label(policy, st.last_route[0], st.last_route[1])}.`;
  return { systemMessage: `⚙ model-router: this switch re-sends ~${Math.floor(toks / 1000)}k tokens uncached${cost}. An effort change would keep the cache.${tip}` };
}

function onPostSwitch(d, policy) {
  const sid = d.session_id || "";
  const st = loadState(sid);
  st.model = modelKey(d.to_model) || st.model || null;
  st.announced = [st.model, st.effort ?? null];
  saveState(sid, st);
  if (!st.model) return null;
  return { hookSpecificOutput: { hookEventName: "PostModelSwitch",
                                 additionalContext: `model-router: this session now runs ${label(policy, st.model, st.effort)}.` } };
}

function onStop(d, policy) {
  const level = (d.effort || {}).level || process.env.CLAUDE_EFFORT;
  if (level && String(level).toLowerCase() in policy.efforts) {
    const sid = d.session_id || "";
    const st = loadState(sid);
    st.effort = String(level).toLowerCase();
    saveState(sid, st);
  }
  return null;
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}

function agentHasModel(name, cwd) {
  const project = process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd();
  for (const root of [path.join(project, ".claude", "agents"), path.join(os.homedir(), ".claude", "agents")]) {
    let files;
    try { if (!fs.statSync(root).isDirectory()) continue; files = [...walk(root)]; } catch { continue; }
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      let text;
      try { text = fs.readFileSync(file, "utf8").slice(0, 4096); } catch { continue; }
      const m = /^---\s*\n([\s\S]*?)\n---/.exec(text);
      if (!m) continue;
      const fm = m[1];
      const n = /^name:\s*(.+?)\s*$/m.exec(fm);
      const strip = v => v.replace(/^['"]+|['"]+$/g, "");
      if ((n && strip(n[1]) === name) || path.basename(file).slice(0, -3) === name) {
        const mm = /^model:\s*(\S+)/m.exec(fm);
        return Boolean(mm && !["", "inherit"].includes(strip(mm[1])));
      }
    }
  }
  return false;
}

function onPreAgent(d, policy) {
  if ((process.env.MODEL_ROUTER_GUARD ?? "1") === "0") return null;
  const ti = d.tool_input || {};
  if (ti.model) return null;
  const agent = String(ti.subagent_type || "general-purpose");
  if (agent === "fork" || agent.includes(":")) return null;   // forks inherit by design; plugin agents carry their own model
  if (agentHasModel(agent, d.cwd)) return null;
  const reason = `model-router: the '${agent}' agent would run on the main model. Call it again with model set to `
    + "haiku (search, reading, test runs), sonnet (drafts, routine edits) or opus (reviews, hard problems), "
    + "or use model-router:scout, runner, builder or reviewer.";
  return { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } };
}

const HANDLERS = { SessionStart: onSessionStart, UserPromptSubmit: onPrompt, PreModelSwitch: onPreSwitch,
                   PostModelSwitch: onPostSwitch, Stop: onStop, PreToolUse: onPreAgent };

function main(argv) {
  if (argv[2] === "--classify") {
    const text = argv.length > 3 ? argv.slice(3).join(" ") : fs.readFileSync(0, "utf8");
    console.log(JSON.stringify(route(text), null, 2));
    return 0;
  }
  if (argv[2] === "--card") { console.log(card(loadPolicy())); return 0; }
  try {
    const d = JSON.parse(fs.readFileSync(0, "utf8"));
    const fn = HANDLERS[d.hook_event_name || ""];
    if (fn) {
      const o = fn(d, loadPolicy());
      if (o) process.stdout.write(JSON.stringify(o));
    }
  } catch (e) {  // a hook must never block the session
    if (process.env.MODEL_ROUTER_DEBUG) process.stderr.write(`model-router: ${e.name}: ${e.message}\n`);
  }
  return 0;
}

module.exports = { PRIORITY, loadPolicy, profile, modelKey, classify, route, card, fit, hint, parseMode, autoMode, label, smallBug, namedEffort };
if (require.main === module) process.exitCode = main(process.argv);
