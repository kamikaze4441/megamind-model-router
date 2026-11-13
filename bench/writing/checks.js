// Script checks for the writing test: length limits, required facts, forbidden content.
// Every check carries sample strings (ok: must match, bad: must be caught) used by `check.js --selftest`.
// Facts are matched on numbers, names and dates with format variants, never on phrasing.

const day = (d, m, weekday) => {
  const parts = [
    `\\b${d}(st|nd|rd|th)?\\s+(of\\s+)?${m}`,
    `${m}[a-z]*\\.?\\s+${d}(st|nd|rd|th)?\\b`,
  ];
  if (weekday) parts.push(`${weekday},?\\s+(the\\s+)?${d}(st|nd|rd|th)?\\b`);
  return new RegExp(parts.join('|'), 'i');
};
const digits = (want) => (text) => text.replace(/\D/g, '').includes(want);
const re = (r) => (text) => r.test(text);

const onePara = { name: 'more than one paragraph', test: re(/\S\s*\n\s*\n\s*\S/), bad: ['first part.\n\nsecond part.'] };
const noBullets = { name: 'bullet list', test: re(/^\s*[-*•]\s+\S/m), bad: ['\n- a bullet point'] };
const noFence = { name: 'code fence', test: re(/```/), bad: ['```'] };
const english = (words) => ({ name: 'English left in', test: re(new RegExp(`\\b(${words})\\b`, 'i')), bad: words.split('|').map((w) => ` ${w} `) });
const formal = { name: 'formal address', test: re(/\b(Sie|Ihnen|Ihre[nmrs]?)\b/), ok: ['Bitte füllen Sie', 'Wir danken Ihnen', 'Ihre Hausverwaltung'] };

module.exports = {
  t01: {
    kind: 'apology', min: 120, max: 170,
    must: [
      { name: 'order number', test: re(/48213/), ok: ['order 48213', 'Order #48213'] },
      { name: 'ship date 14 November', test: re(day(14, 'Nov')), ok: ['on 14 November', 'November 14th', 'on the 14th of November', '14 Nov'] },
      { name: 'refund 18.60', test: re(/18[.,]60/), ok: ['€18.60', '18,60 EUR'] },
      { name: 'refund 15%', test: re(/\b15\s?(%|per\s?cent)/i), ok: ['15%', '15 percent', '15 per cent'] },
      { name: 'return label', test: re(/label/i), ok: ['prepaid return label'] },
      { name: '30 days', test: re(/\b30[\s-]days?\b|thirty days/i), ok: ['within 30 days', 'thirty days', '30-day'] },
      { name: 'sender', test: re(/Tomasz Reddy/), ok: ['Tomasz Reddy'] },
    ],
    mustNot: [
      { name: 'names the warehouse firm', test: re(/Hartwell/i), bad: ['Hartwell Logistics'] },
      noFence,
    ],
  },
  t02: {
    kind: 'summary', min: 120, max: 150,
    must: [
      { name: 'bus times 19%', test: re(/\b19\s?(%|per\s?cent)|\b26\b[^.\n]{0,40}\b21\b/i), ok: ['19% faster', '19 per cent', 'from 26 minutes to 21'] },
      { name: 'car times 6% or 50 seconds', test: re(/\b6\s?(%|per\s?cent)|\bsix per\s?cent|\b50 seconds/i), ok: ['6% slower', 'six per cent', 'about 50 seconds'] },
      { name: 'ridership 11%', test: re(/\b11\s?(%|per\s?cent)|eleven per\s?cent/i), ok: ['rose 11%', '11 percent'] },
      { name: 'recommends permanent', test: re(/permanent/i), ok: ['made permanent', 'permanently'] },
      { name: 'vote 18 June', test: re(day(18, 'June')), ok: ['on 18 June', 'June 18'] },
    ],
    mustNot: [onePara, noBullets, noFence],
  },
  t03: {
    kind: 'translation', min: 150, max: 250,
    must: [
      { name: 'date 3 March', test: re(/\b3\.\s?März|\b0?3\.0?3\.(2026|26)\b/), ok: ['3. März 2026', '03.03.2026', '3.März'] },
      { name: 'time 8:30', test: re(/\b0?8[:.]30(?!\d)/), ok: ['8:30 Uhr', '08.30 Uhr', '8:30Uhr'] },
      { name: 'time 14:30', test: re(/\b14[:.]30(?!\d)/), ok: ['14:30 Uhr', '14.30 Uhr'] },
      { name: 'date 27 February', test: re(/\b27\.\s?Februar|\b27\.0?2\./), ok: ['27. Februar', '27.02.2026', '27.2.'] },
      { name: 'time 16 Uhr', test: re(/\b16([:.]00)?\s?Uhr|\b16[:.]00(?!\d)/), ok: ['16 Uhr', '16:00 Uhr', '7:00 bis 16:00'] },
      { name: 'caretaker name', test: re(/Brandt/), ok: ['Herrn Brandt'] },
      { name: 'phone number', test: digits('0305550142'), ok: ['030 555 0142', '030/5550142', '(030) 555 01 42'] },
      { name: 'address', test: re(/Lindenstra(ß|ss)e 27/), ok: ['Lindenstraße 27', 'Lindenstrasse 27'] },
      { name: 'five minutes', test: re(/fünf\s+Minuten|\b5\s+Minuten/), ok: ['etwa fünf Minuten', 'ca. 5 Minuten'] },
      formal,
    ],
    mustNot: [english('the|and|please|tenants|water'), noFence],
  },
  t04: {
    kind: 'explanation', min: 170, max: 220,
    must: [
      { name: 'public key', test: re(/public key/i), ok: ['The public key', 'public keys'] },
      { name: 'private key', test: re(/private key/i), ok: ['a private key'] },
    ],
    mustNot: [
      { name: 'banned word', test: re(/algorithm|\bprimes?\b|cryptograph|asymmetric/i), bad: ['an algorithm', 'two primes', 'prime number', 'cryptography', 'asymmetric'] },
      noFence,
    ],
  },
  t05: {
    kind: 'forum', min: 80, max: 220,
    must: [
      { name: 'title line', test: (t) => /^Title:\s*\S/.test(t.trim()), ok: ['Title: Pi-hole stops resolving'], first: true },
      { name: 'Pi-hole version', test: re(/5\.18\.3/), ok: ['Pi-hole v5.18.3'] },
      { name: 'OS', test: re(/bookworm/i), ok: ['Raspberry Pi OS Bookworm'] },
      { name: 'router', test: re(/7590/), ok: ['Fritz!Box 7590'] },
      { name: 'error in admin page', test: re(/DNS resolution is currently unavailable/i), ok: ['"DNS resolution is currently unavailable"'] },
      { name: 'FTL log line', test: re(/Maximum number of concurrent DNS queries/i), ok: ['Maximum number of concurrent DNS queries reached (max: 150)'] },
      { name: 'a question', test: re(/\?/), ok: ['What should I check next?'] },
    ],
    mustNot: [
      { name: 'private or off-topic note', test: re(/Tulip|44[.,]99|\bvet\b|\bSam\b/i), bad: ['Tulip-4471-river', '44.99', 'the vet', 'give to Sam'] },
      noFence,
    ],
  },
  t06: {
    kind: 'rewrite', min: 70, max: 150,
    must: [
      { name: 'move date 9 January', test: re(day(9, 'Jan', 'Friday')), ok: ['Friday 9 January', 'January 9', 'Friday the 9th'] },
      { name: 'address', test: re(/14 Kestrel Way/i), ok: ['14 Kestrel Way'] },
      { name: 'third floor', test: re(/third floor|3rd floor|floor 3\b/i), ok: ['third floor', '3rd floor'] },
      { name: 'crates 5 January', test: re(day(5, 'Jan', 'Monday')), ok: ['Monday 5 January', 'on Monday, 5th'] },
      { name: 'IT date 8 January', test: re(day(8, 'Jan', 'Thursday')), ok: ['Thursday 8 January', 'Thursday the 8th'] },
      { name: 'IT time 3 p.m.', test: re(/\b3([:.]00)?\s?p\.?\s?m\b|\b15[:.]00(?!\d)/i), ok: ['3 p.m.', '3pm', '3:00 PM', '15:00'] },
      { name: '40 spaces', test: re(/\b40\b/), ok: ['40 spaces'] },
      { name: 'permit', test: re(/permit/i), ok: ['a permit'] },
      { name: 'Dana', test: re(/Dana/), ok: ['Dana Whitlock'] },
    ],
    mustNot: [noBullets, noFence],
  },
  t07: {
    kind: 'apology', min: 130, max: 180,
    must: [
      { name: 'start 09:12', test: re(/\b0?9[:.]12(?!\d)/), ok: ['09:12', '9.12'] },
      { name: 'end 11:47', test: re(/\b11[:.]47(?!\d)/), ok: ['11:47'] },
      { name: 'invoices sent 12:05', test: re(/\b12[:.]05(?!\d)/), ok: ['12:05 UTC'] },
      { name: 'cause: certificate', test: re(/certificate/i), ok: ['a security certificate'] },
      { name: 'no data lost', test: re(/\bdata\b/i), ok: ['No data was lost'] },
      { name: 'credit of 7 days', test: re(/\b(7|seven)[\s-]days?\b|\b(one|a) week\b|\b(one|1)[\s-]week\b/i), ok: ['7 days', 'seven-day credit', 'one week'] },
      { name: 'status page', test: re(/status\.tallybook\.example/i), ok: ['status.tallybook.example'] },
      { name: 'sender', test: re(/Mara Okafor/), ok: ['Mara Okafor'] },
    ],
    mustNot: [
      { name: 'promise or guarantee', test: re(/guarantee|never happen again/i), bad: ['we guarantee', 'this will never happen again'] },
      noFence,
    ],
  },
  t08: {
    kind: 'summary', min: 120, max: 150,
    must: [
      { name: 'started 2023', test: re(/\b2023\b/), ok: ['in March 2023'] },
      { name: 'sales fell 9%', test: re(/\b9\s?(%|per\s?cent)|nine per\s?cent/i), ok: ['fell 9%', 'nine per cent'] },
      { name: 'sales rose 14%', test: re(/\b14\s?(%|per\s?cent)|fourteen per\s?cent/i), ok: ['grew 14%', '14 percent'] },
      { name: '11,300 repairs', test: re(/\b11[,.\s]?300\b/), ok: ['11,300', '11300', '11.300'] },
      { name: 'parts for pre-1990 tools', test: re(/1990/), ok: ['before 1990', 'pre-1990'] },
      { name: 'Leeds workshop', test: re(/Leeds/), ok: ['in Leeds'] },
      { name: 'spring 2027', test: re(/\b2027\b/), ok: ['spring 2027'] },
    ],
    mustNot: [onePara, noBullets, noFence],
  },
  t09: {
    kind: 'translation', min: 150, max: 240,
    must: [
      { name: 'date 1 February', test: re(/\b1\.\s?Februar|\b0?1\.0?2\.(2026|26)\b/), ok: ['1. Februar 2026', '01.02.2026'] },
      { name: 'closes 19 Uhr', test: re(/\b19([:.]00)?\b/), ok: ['19 Uhr', '19:00 Uhr', '10–19 Uhr'] },
      { name: 'Saturday 14 Uhr', test: re(/\b14([:.]00)?\b/), ok: ['14 Uhr', '14.00 Uhr'] },
      { name: 'late fee 0,50', test: re(/\b0,50\b|\b50\s?Cent/), ok: ['0,50 €', '50 Cent'] },
      { name: 'maximum 10 euros', test: re(/\b10(,00|,[–-]+)?\s?(€|Euro|EUR)|(€|EUR)\s?10\b/), ok: ['10 €', '10 Euro', '10,00 €', '€ 10', '10,– €'] },
      { name: 'adults 12 euros', test: re(/\b12(,00|,[–-]+)?\s?(€|Euro|EUR)|(€|EUR)\s?12\b/), ok: ['12 €', '12 Euro', '12,00 Euro'] },
      { name: 'under 18', test: re(/\b18\b/), ok: ['unter 18 Jahren'] },
      { name: 'reading room until 15 April', test: re(/\b15\.\s?April|\b15\.0?4\./), ok: ['15. April', '15.04.'] },
      { name: 'email address', test: re(/info@riverside-library\.example/), ok: ['info@riverside-library.example'] },
      formal,
    ],
    mustNot: [english('the|and|please|readers'), noFence],
  },
  t10: {
    kind: 'explanation', min: 150, max: 200,
    must: [
      { name: 'heat', test: re(/\bheat|\bhot\b|\bwarm|temperature/i), ok: ['Heat speeds this up', 'a hot car', 'high temperatures'] },
      { name: 'tip 1', test: re(/^\s*1[.)]\s+\S/m), ok: ['\n1. Keep it cool'], line: true },
      { name: 'tip 2', test: re(/^\s*2[.)]\s+\S/m), ok: ['\n2. Avoid zero'], line: true },
      { name: 'tip 3', test: re(/^\s*3[.)]\s+\S/m), ok: ['\n3. Unplug at 80'], line: true },
    ],
    mustNot: [
      { name: 'more than three tips', test: re(/^\s*4[.)]\s+\S/m), bad: ['\n4. A fourth tip'] },
      { name: 'banned word', test: re(/\banodes?\b|\bcathodes?\b|electrolyte|\bSEI\b/i), bad: ['the anode', 'cathode', 'electrolyte', 'SEI layer'] },
      noFence,
    ],
  },
  t11: {
    kind: 'forum', min: 80, max: 200,
    must: [
      { name: 'title line', test: (t) => /^Title:\s*\S/.test(t.trim()), ok: ['Title: Hardwax oil still tacky'], first: true },
      { name: 'product 3032', test: re(/3032/), ok: ['Osmo Polyx-Oil 3032'] },
      { name: '11 degrees', test: re(/\b11\s?°\s?C|\b11\s?(degrees|deg\b|C\b)/i), ok: ['11 °C', '11°C', '11 degrees', '11C'] },
      { name: '240 grit', test: re(/\b240\b/), ok: ['up to 240 grit'] },
      { name: 'four days', test: re(/\b(4|four)\s+days|day\s+(4|four)|fourth day/i), ok: ['after 4 days', 'four days later', 'day 4'] },
      { name: 'excess not wiped off', test: re(/excess|surplus|wip\w*\s+(\w+\s+){0,3}off/i), ok: ['did not wipe off the excess', 'the surplus', 'wiped it off'] },
      { name: 'a question', test: re(/\?/), ok: ['Should I wait or strip it?'] },
    ],
    mustNot: [
      { name: 'private note', test: re(/07700|900\s?153|Derek/i), bad: ['07700 900153', 'Derek'] },
      noFence,
    ],
  },
  t12: {
    kind: 'rewrite', min: 80, max: 160,
    must: [
      { name: 'AGM date 20 March', test: re(day(20, 'Mar', 'Friday')), ok: ['Friday 20 March', 'March 20', '20th of March'] },
      { name: 'AGM time 7.30', test: re(/\b7[.:]30(?!\d)|\b19[.:]30(?!\d)/), ok: ['7.30 p.m.', '7:30pm', '19:30'] },
      { name: 'AGM place', test: re(/Hollins Community Hall/i), ok: ['Hollins Community Hall'] },
      { name: 'fee 40 pounds', test: re(/£\s?40\b|\b40\s?pounds/i), ok: ['£40', '40 pounds'] },
      { name: 'fee from 1 April', test: re(day(1, 'Apr')), ok: ['from 1 April', 'April 1'] },
      { name: 'coach name', test: re(/Priya Raman/), ok: ['Priya Raman'] },
      { name: 'coach starts in May', test: re(/\bMay\b/), ok: ['in May'] },
      { name: 'kit orders 28 February', test: re(day(28, 'Feb')), ok: ['by 28 February', 'February 28'] },
      { name: 'tournament 12 July', test: re(day(12, 'Jul', 'Sunday')), ok: ['Sunday 12 July', 'July 12'] },
      { name: 'volunteers', test: re(/volunteer/i), ok: ['six volunteers'] },
    ],
    mustNot: [noBullets, noFence],
  },
};
