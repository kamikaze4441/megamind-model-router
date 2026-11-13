#!/usr/bin/env node
/* Builds ../traps3.jsonl: the 49 prompts of traps2.jsonl unchanged, plus 20 fresh ones for the row-wording re-test
   (2026-11-12). Run once, before the freeze:  node traps3-run/make_traps3.js   (from bench/routing)

Groups of the fresh prompts:
  everyday-plan  the word "plan" on a day, a week or a meeting: writing, not the plan row
  plan-control   a long-term plan for a system: must stay on the plan row
  risky-code     an edit, refactor or fix in code that takes payments, checks logins or holds secrets: risky
  near-miss      next to money or logins, but not that code: must not be pulled to risky
  schedule-control  the word "schedule" on a config edit and on a year-long plan: must not be pulled to writing
One key serves both arms: every label holds under the old rows and under the new ones.
The labels were written by Claude (Fable 5.2) in the session that wrote the new row wording.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..");
const old = fs.readFileSync(path.join(DIR, "traps2.jsonl"), "utf8").trim().split("\n");
const EP = { class: "write", mode: null, group: "everyday-plan", accept_new: [["haiku", "low"], ["haiku", "xhigh"]], trap: "the word plan; a day or a week, nothing long-term" };
const PC = { class: "plan", mode: null, group: "plan-control", trap: "none: a long-term plan for a system; must stay on the plan row" };
const RC = { class: "risky", mode: null, group: "risky-code" };
const NM = { mode: null, group: "near-miss" };
const E = [["sonnet", "high"], ["sonnet", "medium"]];        // near-miss edits: either edit step counts; the question is risky or not
const add = [
  { id: "t-50", prompt: "Plan my meals for next week; I am vegetarian and only cook on weekdays", ...EP },
  { id: "t-51", prompt: "Help me plan Saturday: farmers market in the morning, my daughter has a football match at 2, and friends are coming for dinner at 7", ...EP },
  { id: "t-52", prompt: "Make me a study plan for the five days before my statistics exam; I have about two hours each evening", ...EP },
  { id: "t-53", prompt: "Plan the agenda for tomorrow's 45-minute team meeting: budget update, hiring, and the office move", ...EP },
  { id: "t-54", prompt: "Plan how we split our monolith into services over the next two years; twelve engineers, one shared Postgres database", ...PC },
  { id: "t-55", prompt: "We need a roadmap for moving the whole product from REST polling to an event-driven design; lay out the phases and the trade-offs", ...PC },
  { id: "t-56", prompt: "Plan the data model for the multi-tenant version of our app; we will build on it for years", ...PC },
  { id: "t-57", prompt: "Refactor the login handler in auth/session.py: pull the token check out into its own function", ...RC, trap: "looks like a refactor; it is the code that checks logins" },
  { id: "t-58", prompt: "Small cleanup: rename the variables in charge_card() in payments/stripe.py so they are easier to read", ...RC, trap: "looks like a trivial edit; it is the code that takes payments" },
  { id: "t-59", prompt: "Add a retry with backoff to the function that captures payments in checkout/capture.ts", ...RC, trap: "looks like a small feature; a retry on capturing payments can charge twice" },
  { id: "t-60", prompt: "Fix the off-by-one in the expiry check for password reset tokens in accounts/reset.py; tests/test_reset.py covers it", ...RC, trap: "a scoped fix with a test; it is the code that checks reset tokens" },
  { id: "t-61", prompt: "Move the API keys out of config.py into a secrets loader module and update the three places that read them", ...RC, trap: "looks like a refactor; it is the code that holds secrets" },
  { id: "t-62", prompt: "Simplify the refund calculation in billing/refunds.py; three nested ifs could be one expression", ...RC, trap: "looks like a tidy-up; it decides how much money goes back" },
  { id: "t-63", prompt: "Our pytest suite has one failing test, test_tax_label_format, in the invoice PDF module. Find the bug and fix it; the test must pass.", class: "debug", check: true, ...NM, trap: "an invoice label, not money at risk; a test checks the fix" },
  { id: "t-64", prompt: "Change the colour of the Pay now button on the checkout page from blue to green in styles/checkout.css", class: "edit", ...NM, accept_new: E, trap: "the checkout page, but a stylesheet: not code that takes payments" },
  { id: "t-65", prompt: "Add a Remember this device checkbox with its label and help text to the login page template; markup only, the backend already supports it", class: "edit", ...NM, accept_new: E, trap: "the login page, but markup only: not code that checks logins" },
  { id: "t-66", prompt: "Add unit tests for the currency formatting helper format_money() in utils/format.py", class: "edit", ...NM, accept_new: E, trap: "formats amounts for display; takes no payment" },
  { id: "t-67", prompt: "Draft the email that tells the team about next week's release freeze and the plan for it", class: "write", mode: null, group: "everyday-plan", trap: "the word plan inside a writing task" },
  // "a schedule" is now in the writing row: these two must not follow the word there
  { id: "t-68", prompt: "Change the schedule of the report job in jobs/schedule.yaml from hourly to every 15 minutes", class: "edit", mode: null, group: "schedule-control", accept_new: E, trap: "the word schedule; a config edit" },
  { id: "t-69", prompt: "Lay out the release schedule for the next twelve months across the web, mobile and API teams, with the dependencies between them", class: "plan", mode: null, group: "schedule-control", trap: "the word schedule; a year-long plan for a product" },
];
fs.writeFileSync(path.join(DIR, "traps3.jsonl"), old.concat(add.map(x => JSON.stringify(x))).join("\n") + "\n");
console.log(`${old.length} + ${add.length} rows`);
