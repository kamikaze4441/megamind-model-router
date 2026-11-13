# Grading task

Below are twelve writing tasks. Under each task are 2 texts, A to B, written by 2 different writers for that task. The letters are shuffled anew for every task, so A in one task is not the same writer as A in another. Judge every text on its own merits, for the reader the task names.

For each task:

1. Score every text from 1 (poor) to 5 (excellent) on five points:
   - facts: every fact the task requires is there and right, nothing is invented, nothing the task forbids is included
   - limits: the length limit and the format the task asks for are kept. The word count of each text, counted by script, is in its heading; trust it and do not count yourself
   - clear: the reader gets the point on first reading; the order makes sense
   - tone: fits the reader and the occasion. For the translations: correct, natural German in the formal register, with German conventions for dates, times and prices
   - filler: 5 means no padding, stock phrases or repetition; 1 means a lot
2. Rank the 2 texts from best to worst, as the reader of that task would. No ties, every letter exactly once.
3. Add a note of at most 25 words on what decided the top and the bottom.

Write one JSON object, and nothing else, to a file named grades.json in the same folder as this file. Shape:

{"t01": {"scores": {"A": {"facts": 5, "limits": 5, "clear": 4, "tone": 4, "filler": 3}, "B": {...}, "C": {...}, "D": {...}, "E": {...}, "F": {...}}, "rank": ["C", "A", "F", "B", "E", "D"], "note": "..."}, "t02": {...}, ..., "t12": {...}}

Read this whole file and write grades.json once. The file is long: if your Read tool cuts it off, pass allow_large or read the rest in further Read calls of this same file. Use no other tool and no other file: no advisor, no helper, no search. Then reply with exactly one line:
MODEL=<the model name your own system prompt gives you>; TASKS=<number of tasks graded>


==================== t01 ====================

## Task 1: apology email (file 01.txt)

Write the email that Fenwick Cycle Parts sends to a customer. Use only the facts below and invent nothing. Between 120 and 170 words, counting everything from the greeting to the sign-off. No subject line.

Facts:
- Customer: Ms Ilse Brandner. Order number 48213, placed on 2 November.
- She ordered a Shimano 105 rear derailleur (11-speed). We sent a 10-speed Tiagra derailleur instead.
- Cause: a picking mistake in our warehouse.
- The correct derailleur ships on 14 November by express delivery, at no charge to her.
- A prepaid return label for the wrong part is attached to this email. She has 30 days to send the part back.
- We refund 15% of the order value, €18.60, to her original payment method within 5 working days.
- Sender: Tomasz Reddy, Customer Service. She can reply to this email or call 0800 555 0199.
- Internal note, not for the customer: the warehouse is run by Hartwell Logistics. Do not name them and do not blame a third party.

----- t01 text A (154 words) -----
Dear Ms Brandner,

I am sorry that your order 48213, placed on 2 November, arrived with the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), and we sent a 10-speed Tiagra derailleur instead. The cause was a picking mistake in our warehouse, and it was our error.

Here is how we are putting it right.

The correct derailleur ships on 14 November by express delivery, at no charge to you.

A prepaid return label for the wrong part is attached to this email. You have 30 days to send the part back.

We are refunding 15% of the order value, €18.60, to your original payment method within 5 working days.

Please reply to this email or call me on 0800 555 0199 if anything is unclear or you would like to talk it through.

Again, my apologies for the trouble and the delay.

Kind regards,
Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text A -----

----- t01 text B (135 words) -----
Dear Ms Brandner,

We are sorry. On 2 November you ordered a Shimano 105 rear derailleur (11-speed) under order number 48213, but we sent you a 10-speed Tiagra derailleur instead. This was a picking mistake in our warehouse, and we apologise for the error and the trouble it has caused you.

The correct derailleur will ship on 14 November by express delivery, at no charge to you.

A prepaid return label for the wrong part is attached to this email. You have 30 days to send the Tiagra derailleur back.

We will also refund 15% of the order value, €18.60, to your original payment method within 5 working days.

If you have any questions, please reply to this email or call us on 0800 555 0199.

Yours sincerely,

Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text B -----


==================== t02 ====================

## Task 2: summary (file 02.txt)

Summarise the report below for a council member who has two minutes before the vote. Between 120 and 150 words, one paragraph, no heading and no bullets. The summary must say how bus journey times changed, how car journey times changed, how bus ridership changed, what the report recommends, and when the Council votes.

Report:

Calder Road bus lane trial: twelve-month evaluation
Report of the Director of Transport to Marrowick City Council

1. Purpose

This report sets out what happened during the twelve-month trial of a bus lane on Calder Road, and recommends what the Council should do next. The Council is asked to decide at its meeting on 18 June whether the lane should be kept.

2. Background

Calder Road is the main route between the city centre and the eastern suburbs of Thornaby and Easthope. Six bus routes use it, carrying about 21,000 passengers on a normal weekday, and before the trial it was the least reliable bus corridor in the city: in the autumn of 2024, fewer than six in ten peak-time buses ran within five minutes of the timetable. The two operators, Marrowick Buses and Calder Valley Coaches, told us that they had added four extra vehicles to the corridor simply to keep to the timetable, at a cost that was passed on in fares.

In November 2024 the Council agreed to test a bus lane rather than build one outright. A trial under an experimental traffic order can be changed or removed quickly, and it allows a decision to be made on evidence from the street itself rather than on a traffic model. The trial ran from 3 March 2025 to 28 February 2026.

3. What was done

One general traffic lane in each direction was converted to a bus lane over 4.2 kilometres, from the Station Street junction to the Easthope roundabout. The lane operated from 7 a.m. to 7 p.m., Monday to Saturday. Cycles, taxis and emergency vehicles were allowed to use it; motorcycles were not, a point we return to in section 9.

Eleven sets of traffic signals were re-timed, and at four of them buses were given a short head start. Three bus stops were moved by up to 40 metres so that buses could pull back into the lane more easily, and shelters with real-time displays were installed at nine stops. Thirty-eight on-street parking spaces were removed and 22 were provided again in side streets. Six loading bays were kept on Calder Road itself, but their hours were cut to 10 a.m. to 3 p.m.

Enforcement was by camera. For the first six weeks drivers received warning letters only. After that, 9,412 penalty notices were issued during the trial, with the monthly number falling from 1,870 in May 2025 to 310 in February 2026 as drivers got used to the layout.

4. Cost

The trial cost £1.3 million, of which £0.8 million was met by a grant from the regional transport authority. The largest items were the signals (£410,000), the cameras (£260,000) and the shelters (£190,000). Penalty notices brought in £286,000 after the cost of running the cameras; by law this money can be spent only on transport, and none of it has yet been committed. Removing the lane and restoring the road would cost about £0.2 million.

5. How we measured it

Bus journey times come from the operators' vehicle location systems, which record every bus. Car journey times come from anonymised sat-nav data bought from a commercial supplier, checked against our own number-plate cameras at each end of the corridor. Passenger numbers are ticket-machine counts. Collision figures are police records. We compared each month of the trial with the same month a year earlier, and we compared Calder Road with Harlow Road, a similar corridor that did not change, to allow for things that affected the whole city, such as the rail strike in October 2025 and the wet winter.

Two caveats matter. First, twelve months of collision data is a small sample, and we would not draw firm conclusions from it. Second, the roadworks on the ring road between June and August 2025 pushed extra traffic on to Calder Road, so the summer figures are fair neither to buses nor to cars; the headline figures below leave those three months out, and Appendix 1 gives them in full.

6. Results for buses

Peak-time bus journeys along the corridor became 19% faster. In minutes, the average morning peak journey from the Easthope roundabout to Station Street fell from 26 minutes to 21. Off-peak journeys changed much less, by about 4%, because the buses were not badly delayed off-peak to begin with. On Saturdays the gain was about 5%.

Reliability improved more than speed. The share of peak buses running within five minutes of the timetable rose from 58% to 83%. The operators have since taken three of the four extra vehicles off the corridor and used them to run a more frequent evening service on route 14, at no cost to the Council.

Passengers noticed. Ridership on the six routes rose by 11% over the year, against a rise of 2% on Harlow Road and 3% across the city. Most of the growth was at peak times, and ticket data suggests that about a third of it came from new passengers rather than from existing passengers travelling more often. In our on-bus survey of 1,204 passengers, 71% said the service had improved, 6% said it had got worse and the rest saw no difference.

7. Results for general traffic

Car journeys at peak times became 6% slower, which over the length of the corridor is about 50 seconds. This is less than the traffic model predicted before the trial (the model said 12%), and the gap is explained by two things: the re-timed signals helped cars as well as buses, and traffic on Calder Road fell by about 8% as some drivers changed route, changed their time of travel or switched to the bus.

We looked for that displaced traffic. Flows on Harlow Road rose by 3%, and on the residential streets north of Calder Road by between 1% and 5%. Wickham Lane was the exception, with a rise of 14% at the morning peak, and residents there have, with reason, complained. Section 10 proposes a remedy.

Off-peak car journey times did not change measurably.

Not everything worked. The head start for buses at the Albert Bridge junction caused long queues on the side road and was switched off in July 2025, with no loss to bus times that we could detect. The lane was also lightly used by buses on Saturday afternoons, and we propose to look again at Saturday hours at the two-year review.

8. Safety, cycling and air quality

There were 31 recorded injury collisions on the corridor in the trial year, against 37 the year before. Collisions involving cyclists fell from 14 to 9. As noted above, these numbers are too small to prove anything, but they do not suggest that the lane has made the road more dangerous, which was a concern raised when the trial was approved.

Cycle counts at the Albert Bridge counter rose by 23%. Cyclists told us that they value the lane mainly because it separates them from general traffic, though several pointed out that sharing with buses is not the same as a protected cycle track.

Roadside nitrogen dioxide at the Thornaby monitoring station fell by 5%, about the same as the fall across the city, so we do not claim an air quality benefit from the trial.

9. What people told us

We received 2,360 responses to the public consultation. Of those, 54% supported keeping the lane, 38% opposed it and 8% were undecided. Support was strongest among people who travel the corridor by bus or bicycle and weakest among those who drive it daily, which is what one would expect.

Businesses were more divided. We surveyed all 58 shops and cafés that front on to Calder Road. Thirty-one reported no change in takings over the year, 15 reported a fall and 12 reported a rise. Among those reporting a fall, the reason most often given was not the loss of parking but the shorter loading hours, which forced deliveries into the middle of the trading day. The Calder Road Traders' Association has asked for loading before 10 a.m. to be restored, and we think it has a fair case.

Motorcyclists' groups asked to be allowed into the lane, as they are in some other cities. The evidence from elsewhere is mixed, and we recommend a separate six-month test rather than a decision now.

Disabled residents raised the loss of parking outside the health centre at number 212. Two blue-badge bays were added there in September 2025, and we have had no complaints since.

The operators have written to say that, if the lane is made permanent, Marrowick Buses will freeze fares on the corridor for a year and add two buses an hour to route 9. These are offers, not contracts, and the Council should treat them as such.

10. Options

The Council has three options.

Option A is to remove the lane. This would cost about £0.2 million, would return peak bus journey times to roughly what they were, and would probably mean repaying part of the regional grant.

Option B is to make the lane permanent exactly as trialled. This is the cheapest option and keeps the benefits to buses, but it leaves the problems with loading and with Wickham Lane as they are.

Option C is to make the lane permanent with changes: restore loading from 7 a.m. to 10 a.m. in the six existing bays, with buses pulling out around any parked lorry; add a seventh bay near the market; close Wickham Lane to through traffic at its northern end between 7 a.m. and 9.30 a.m.; and review the scheme again after two years. We estimate that morning loading would give back about one percentage point of the gain in bus journey times. The changes would cost about £90,000, which can be met from penalty notice income.

11. Recommendation

We recommend Option C: that the bus lane be made permanent, with the changes to loading bays and to Wickham Lane described above.

The trial did what it was meant to do. Buses are faster and far more reliable, more people are using them, and the cost to drivers has been smaller than forecast. The harms that did appear are real but local, and they can be dealt with without giving up the lane. Removing it would spend public money to make the corridor's bus service worse.

If the Council agrees on 18 June, a permanent traffic order would be advertised in July, and the changes to loading and to Wickham Lane would be in place by the end of October.

12. Appendices

Appendix 1 gives monthly figures for every measure, including the three summer months left out of the headline numbers. Appendix 2 is the consultation report. Appendix 3 is the traders' survey. Appendix 4 sets out the equality impact assessment. Appendix 5 reproduces the operators' letters.

----- t02 text A (136 words) -----
The Director of Transport recommends making the Calder Road bus lane permanent, with changes, after a twelve-month trial. Excluding the roadworks-hit summer months, peak bus journeys became 19% faster, and the share of peak buses running on time rose from 58% to 83%. Peak car journeys became 6% slower, about 50 seconds, far less than the 12% the traffic model predicted. Bus ridership rose 11%, against 3% citywide. Problems were local: Wickham Lane traffic rose 14% at the morning peak, and shorter loading hours hurt some traders. The recommended Option C restores morning loading, adds a loading bay, and closes Wickham Lane's northern end to through traffic at morning peak, for about £90,000 from penalty income. Removal would cost about £0.2 million and probably mean repaying part of the grant. The Council votes on 18 June.
----- end of t02 text A -----

----- t02 text B (146 words) -----
The Council votes on 18 June on whether to keep the Calder Road bus lane, which ran as a twelve-month trial. Peak-time bus journeys became 19% faster, and the morning trip from Easthope roundabout to Station Street fell from 26 minutes to 21. Bus ridership on the six routes rose by 11%, against 2% on a comparison road. Peak car journeys became 6% slower, about 50 seconds over the corridor, while off-peak car times did not change measurably. Traffic on Wickham Lane rose by 14% at the morning peak. The report recommends Option C: make the lane permanent, restore morning loading in the existing bays, add a seventh bay, and close Wickham Lane to through traffic at its northern end from 7 a.m. to 9.30 a.m. These changes would cost about £90,000, paid from penalty notice income, and the lane would be reviewed after two years.
----- end of t02 text B -----


==================== t03 ====================

## Task 3: translation into German (file 03.txt)

Translate the notice below into German for the tenants of an apartment building in Berlin. Address the readers formally (Sie). Keep every date, time, name and number, and write dates and times the way a German notice would. Write only the German text.

Notice:

Notice to all tenants of Lindenstraße 27

Dear tenants,

On Tuesday, 3 March 2026, the water supply to the whole building will be switched off from 8:30 a.m. to 2:30 p.m. The city water company is replacing the main valve in the basement, and the work cannot be done while the pipes are under pressure.

Please fill a few containers with water the evening before, for drinking, cooking and flushing. Do not run washing machines or dishwashers during these hours, and make sure all taps are closed before you leave home, so that nothing overflows when the water comes back.

When the supply returns, the water may look brown or cloudy for a short time. This is harmless. Let the cold tap run for about five minutes until it is clear.

The lift in Staircase B will also be out of service on that day between 9 a.m. and noon, because the technicians need the shaft to reach the pipes. Tenants who depend on the lift should contact the caretaker by Friday, 27 February, so that we can arrange help.

If you have questions, please call our caretaker, Mr Brandt, on 030 555 0142, on weekdays between 7 a.m. and 4 p.m.

We apologise for the inconvenience and thank you for your understanding.

Schubert Property Management

----- t03 text A (219 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, 3. März 2026, wird die Wasserversorgung im gesamten Gebäude von 8:30 Uhr bis 14:30 Uhr abgestellt. Das städtische Wasserunternehmen ersetzt das Hauptventil im Keller. Diese Arbeiten können nicht durchgeführt werden, solange die Leitungen unter Druck stehen.

Bitte füllen Sie am Abend zuvor einige Behälter mit Wasser, zum Trinken, Kochen und Spülen. Bitte betreiben Sie während dieser Zeit keine Waschmaschinen oder Geschirrspüler, und achten Sie darauf, dass alle Wasserhähne geschlossen sind, bevor Sie Ihre Wohnung verlassen. So läuft nichts über, wenn das Wasser wieder fließt.

Wenn die Versorgung zurückkehrt, kann das Wasser kurze Zeit braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den kalten Wasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug im Treppenhaus B ist an diesem Tag außerdem von 9:00 bis 12:00 Uhr außer Betrieb, weil die Techniker den Schacht benötigen, um die Leitungen zu erreichen. Wenn Sie auf den Aufzug angewiesen sind, wenden Sie sich bitte bis Freitag, 27. Februar, an den Hausmeister, damit wir Ihnen helfen können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, werktags von 7:00 bis 16:00 Uhr.

Wir bitten um Ihr Verständnis für die Unannehmlichkeiten und danken Ihnen dafür.

Mit freundlichen Grüßen

Schubert Property Management
----- end of t03 text A -----

----- t03 text B (224 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, den 3. März 2026, wird die Wasserversorgung für das gesamte Gebäude von 8.30 Uhr bis 14.30 Uhr abgestellt. Die städtischen Wasserwerke tauschen das Hauptventil im Keller aus; die Arbeiten können nicht durchgeführt werden, solange die Leitungen unter Druck stehen.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, zum Kochen und für die Toilettenspülung. Nehmen Sie in diesen Stunden keine Waschmaschinen oder Geschirrspüler in Betrieb, und vergewissern Sie sich, dass alle Wasserhähne geschlossen sind, bevor Sie die Wohnung verlassen, damit nichts überläuft, wenn das Wasser zurückkehrt.

Wenn die Versorgung wieder einsetzt, kann das Wasser für kurze Zeit braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den Kaltwasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug in Treppenhaus B ist an diesem Tag ebenfalls von 9 bis 12 Uhr außer Betrieb, da die Techniker den Schacht benötigen, um an die Leitungen zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, melden sich bitte bis Freitag, den 27. Februar, beim Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, werktags zwischen 7 und 16 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Property Management
----- end of t03 text B -----


==================== t04 ====================

## Task 4: explanation for a layperson (file 04.txt)

Explain how public-key encryption lets you send a secret message to someone you have never met. The reader has no technical background: picture a grandparent who uses online banking and asked how it can be safe. Between 170 and 220 words. Use one everyday comparison and stay with it. Say that the public key can be given to anyone and that the private key is never shared. Do not use the words "algorithm", "prime", "cryptography" or "asymmetric". Plain text, no heading.

----- t04 text A (212 words) -----
Imagine your bank hands out free padlocks, already open, to anyone who asks. Each one can be snapped shut by anybody, but only the bank owns the key that opens them. That is the whole idea behind keeping your messages secret online.

When you visit your bank's website, your computer picks up one of these open padlocks. This is the public key, and it can be given to anyone, because an open padlock on its own is harmless. Your computer puts your message in a box, snaps the padlock shut and sends the box across the internet. Anyone who intercepts it finds only a locked box. They cannot open it, even though they could have collected the same open padlock themselves.

Only the bank holds the key to that padlock. This is the private key, and the bank never shares it with anyone, not even with you. When the box arrives, the bank turns the key, opens the padlock and reads your message.

So you and the bank never needed to meet or swap a secret beforehand. All it took was a padlock that anyone can close and only one party can open. That is why you can safely send your password to a website run by people you have never met.
----- end of t04 text A -----

----- t04 text B (203 words) -----
Imagine a metal box with a padlock, and the owner has a single key that never leaves their pocket. The owner posts out open padlocks to anyone who asks for one. Each open padlock is a public key. Anyone can have a copy, including strangers.

Say you want to send a secret message to someone you have never met. You ask them for one of their open padlocks, and they post it to you. You put your message in the box, snap their padlock shut and send the box on. Once the padlock clicks shut, nobody holding that padlock can open it again, not even you.

Only the owner can open the box. Their private key, the one that never leaves their pocket, is the only thing that unlocks it. Handing out padlocks does not weaken anything, because a padlock cannot open the box it has closed.

Online banking works in the same way. When your bank locks your details with its public key, a stranger who intercepts the message cannot read it, because only the bank's private key opens it. Nothing secret has to be shared in advance, and the one key that matters is the one the bank never gives away.
----- end of t04 text B -----


==================== t05 ====================

## Task 5: forum post from notes (file 05.txt)

Turn the notes below into a post for a home-networking help forum. Start with a line "Title: ..." and then the body. At most 220 words in total. Give a helper what they need (hardware, software versions, the exact error messages, what was already tried) and end with one clear question. Leave out anything private or beside the point.

Notes:

pihole dies again!!! 3rd time this month
- pi 4 (4gb), raspberry pi os bookworm 64bit, pihole v5.18.3, FTL 5.25.2
- router = fritzbox 7590, pi is the only dns handed out by dhcp
- after ~2 days (once 36h, once 50h-ish) all devices: no internet. web admin shows red "DNS resolution is currently unavailable"
- `pihole restartdns` fixes it instantly. reboot too
- tried: new sd card (sandisk 32gb) - same. static ip 192.168.178.2 - same. turned off ipv6 in fritzbox - same
- pihole -d: nothing obvious?? FTL log last line before it dies: "Maximum number of concurrent DNS queries reached (max: 150)"
- upstream = cloudflare 1.1.1.1 + quad9
- wifi pw for guest net: Tulip-4471-river (give to Sam on saturday)
- ISP put price up AGAIN, 44.99 now, call them
- temp of pi is fine, 48C
- is it the smart tv?? it spams queries, ~9000/day to some samsung domain
- dog vet thursday 16:15

----- t05 text A (180 words) -----
Title: Pi-hole stops resolving DNS every ~2 days; FTL log says max concurrent queries reached (150)

Hardware/software: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. Router is a FRITZ!Box 7590; the Pi is the only DNS server handed out by DHCP. Upstreams: Cloudflare 1.1.1.1 and Quad9.

Problem: after roughly 2 days (once about 36 h, once about 50 h) every device loses internet. The web admin shows a red "DNS resolution is currently unavailable". It has happened 3 times this month. `pihole restartdns` fixes it instantly, and so does a reboot.

The last line in the FTL log before it dies: "Maximum number of concurrent DNS queries reached (max: 150)". `pihole -d` shows nothing obvious. Pi temperature is fine (48 C).

Already tried, no change: new SD card (SanDisk 32 GB), static IP 192.168.178.2, IPv6 turned off in the FRITZ!Box.

Suspect: a smart TV sends about 9000 queries a day to a Samsung domain.

Question: is the TV the likely cause, and if so, should I raise the limit or block that Samsung domain?
----- end of t05 text A -----

----- t05 text B (173 words) -----
Title: Pi-hole DNS dies after ~2 days: max concurrent queries reached

Setup: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. The router is a FRITZ!Box 7590, and the Pi is the only DNS server it hands out by DHCP. Upstream is Cloudflare 1.1.1.1 and Quad9.

Symptom: after about 36 to 50 hours, all devices lose internet access. The web admin shows a red "DNS resolution is currently unavailable". `pihole restartdns` fixes it at once, and so does a reboot.

Last line of the FTL log before it dies: "Maximum number of concurrent DNS queries reached (max: 150)". `pihole -d` showed nothing obvious to me. Pi temperature is 48 °C.

Already tried, same result each time: new SD card (SanDisk 32 GB), static IP 192.168.178.2, IPv6 turned off on the FRITZ!Box.

A Samsung smart TV sends about 9,000 queries a day to one Samsung domain, so I suspect it, but I have not confirmed it.

Question: how do I find which client is sending the flood of queries?
----- end of t05 text B -----


==================== t06 ====================

## Task 6: shorter rewrite (file 06.txt)

Rewrite the announcement below in at most 150 words; it has about 320. Keep the five things staff must act on: the move date, the new address, when the crates arrive, when IT disconnects the computers, and how parking works. Plain prose, no bullet list.

Announcement:

Dear colleagues,

As many of you will no doubt already be aware from the various conversations that have been taking place around the office over the course of the last several weeks, and indeed from the update that was shared at the most recent all-hands meeting, the time has finally come for us to share with you the details of our long-awaited and much-discussed relocation to new premises. We are delighted to be able to confirm that the move will be taking place on Friday 9 January, and that from Monday 12 January onwards everybody will be working from our new home, which is located on the third floor of 14 Kestrel Way.

In order to make the whole process as smooth and as painless as it possibly can be for everyone concerned, packing crates will be delivered to each and every desk on Monday 5 January, and we would kindly ask that you make sure that all of your belongings have been packed into them and clearly labelled with your name by the end of the day on Thursday.

It is also very important to be aware that our colleagues in the IT team will be going around the office disconnecting all desktop computers at 3 p.m. on Thursday 8 January, which means that it would be extremely sensible to save your work and shut down well before that time; laptops should simply be taken home with you.

Finally, a word on the subject of parking, which we know has been a topic of considerable interest. The new building has 40 spaces, which is somewhat fewer than we currently enjoy, and so a permit will be required in order to use them. Permits can be requested from Dana Whitlock in Facilities, and they will be allocated on a first-come, first-served basis.

Thank you, as always, for your patience and cooperation during what we appreciate is a busy period.

The Office Management Team

----- t06 text A (118 words) -----
Dear colleagues,

We move on Friday 9 January. From Monday 12 January everyone will work at our new home, the third floor of 14 Kestrel Way.

Packing crates will arrive at every desk on Monday 5 January. Please pack your belongings and label each crate with your name by the end of Thursday.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Take laptops home with you.

The new building has only 40 parking spaces, fewer than now, and a permit is required. Request one from Dana Whitlock in Facilities; permits are allocated first-come, first-served.

Thank you for your patience.

The Office Management Team
----- end of t06 text A -----

----- t06 text B (134 words) -----
Dear colleagues,

The move takes place on Friday 9 January. From Monday 12 January, everyone works from our new home on the third floor of 14 Kestrel Way.

Packing crates arrive at every desk on Monday 5 January. Please pack all your belongings into them and label them clearly with your name by the end of Thursday.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Laptops should be taken home with you.

Parking: the new building has 40 spaces, fewer than we have now, so a permit is required. Request one from Dana Whitlock in Facilities. Permits are allocated on a first-come, first-served basis.

Thank you for your patience and cooperation during this busy period.

The Office Management Team
----- end of t06 text B -----


==================== t07 ====================

## Task 7: apology email (file 07.txt)

Write the email that Tallybook, an online invoicing service, sends to every customer affected by an outage. Use only the facts below and invent nothing. Between 130 and 180 words, counting everything from the greeting to the sign-off. No subject line.

Facts:
- Tallybook was unavailable on Tuesday 3 November from 09:12 to 11:47 UTC (2 hours 35 minutes).
- Cause: a security certificate on our main database expired. The renewal reminder went to a mailbox that nobody was reading.
- No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.
- What we changed: certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.
- Every affected account gets a credit of 7 days on its subscription, applied automatically by 10 November. Customers do not need to do anything.
- Status and incident history: status.tallybook.example
- Sender: Mara Okafor, Head of Support.
- Internal note, not for customers: legal asks that we do not promise it will never happen again and that we do not use the word "guarantee".

----- t07 text A (143 words) -----
Dear customer,

On Tuesday 3 November, Tallybook was unavailable from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. I am sorry for the disruption to your work.

The cause was an expired security certificate on our main database. The renewal reminder was sent to a mailbox that nobody was reading, and that was our failure.

No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have made two changes: certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

Every affected account will receive a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

You can find the current status and incident history at status.tallybook.example.

Again, my apologies.

Mara Okafor
Head of Support
Tallybook
----- end of t07 text A -----

----- t07 text B (144 words) -----
Dear customer,

Tallybook was unavailable on Tuesday 3 November from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption this caused you. We know how much you rely on invoices going out on time.

The cause was a security certificate on our main database that expired. The renewal reminder was sent to a mailbox that nobody was reading. No data was lost. Invoices scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have changed two things. Certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

Every affected account will receive a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

For the full incident history, visit status.tallybook.example.

Yours sincerely,

Mara Okafor
Head of Support
Tallybook
----- end of t07 text B -----


==================== t08 ====================

## Task 8: summary (file 08.txt)

Summarise the article below for a reader who will not read it. Between 120 and 150 words, one paragraph, no heading and no bullets. The summary must say when the repair programme started, what happened to sales of new tools afterwards, how many repairs the company now does a year, what the main difficulty is, and what the company will do next.

Article:

The toolmaker that decided to sell fewer tools

On a Tuesday morning in the repair room at Tidewater Tools, Agnes Holroyd is taking apart a hand plane that is older than she is. It arrived in a shoebox from a joiner in Aberdeen, with a note saying that his father bought it in 1974 and that the adjuster had finally seized. Holroyd, who is 29 and has worked here for six years, frees it with penetrating oil and a brass drift, replaces a worn screw, flattens the sole on a granite plate and sharpens the iron. The whole job takes forty minutes. The joiner will be charged £22 plus postage.

"He could buy a new one from us for £145," she says. "I'd rather he didn't."

This is not how manufacturers usually talk about their customers. But Tidewater, a family-owned maker of woodworking hand tools in Sheffield, has spent the past three years on an experiment that most of its competitors regard as eccentric and a few regard as suicidal: it will repair any tool it has ever made, for as long as the company exists, at a price that barely covers the work.

A firm that nearly wasn't

Tidewater was founded in 1961 by Walter Marsh, a pattern-maker who thought he could make a better chisel than the ones he was issued at work. For forty years it did well enough, selling planes, chisels and saws to tradesmen and school workshops. Then the school workshops closed, the tradesmen bought cordless tools, and cheap imports took the hobby market. By 2009 the company was down to 31 employees and, in the words of Walter's granddaughter Helen Marsh, who now runs it, "about eight months from the end".

What saved it was a change of customer. A new generation of amateur woodworkers, many of them office workers who had learned from online videos, were willing to pay for hand tools that were made well and would last. Tidewater raised its quality, raised its prices and found that both went down well. Today it employs 84 people and sells in 30 countries.

The repair programme grew out of that recovery, and out of a complaint. In 2022 a customer wrote to say that a plane he had bought two years earlier had a cracked handle, that he had been quoted six weeks for a replacement part, and that a company which advertised tools "for life" ought to behave as though it meant it. Helen Marsh read the letter aloud at a management meeting. "Nobody argued with him," she says. "That was the uncomfortable part."

What the promise is

The programme began in March 2023. Its terms fit on a postcard. Send in any Tidewater tool, of any age, in any condition. The company will tell you within five working days what it will cost to put right, and the price will be the cost of parts and labour with almost nothing on top. If the tool cannot be repaired, the company will say so and offer 30% off a replacement.

Marsh expected a few hundred tools a year. In the first twelve months the repair room received more than 6,000. It now handles about 11,300 repairs a year with a staff of nine, and the queue stands at just under three weeks. The oldest tool to come in so far was a chisel from the first year of production. The strangest was a plane that had been through a house fire and was returned to its owner, working, with the scorch marks left on at her request.

The cost

The obvious objection is the one that Tidewater's own finance director, Colin Abara, made at the time: a tool that is repaired is a tool that is not replaced. "I said we were building a machine for destroying our own sales," he recalls. "For about a year, I was right."

In the first year of the programme, sales of new tools fell by 9%. Some of that was the wider market, which was soft; some of it, Abara is sure, was customers repairing what they would otherwise have replaced. The repair room itself lost money. The company's profit for the year fell by almost a third, and Marsh had what she describes as "a number of frank conversations" with the bank.

Then the line turned. In the second year, sales of new tools grew by 14%, and they have kept growing since, though more slowly. Abara, who now describes himself as a convert, puts this down to three things.

The first is price. A tool that can always be repaired holds its value, and Tidewater's planes now sell second-hand for around 80% of their new price. Customers know this, and it makes a £145 plane easier to justify.

The second is that repair customers come back. The company's records show that someone who has had a tool repaired is roughly twice as likely to buy a new, different tool within a year as someone who has not. "They send in a plane and buy a saw," says Abara. "We had the sums the wrong way round. The repair isn't instead of a sale. It's the reason for the next one."

The third is harder to measure. The programme has been written about a good deal, and Tidewater's spending on advertising has fallen by about half since 2023 without any visible harm.

The repair room still barely pays for itself. Marsh says it runs at a margin of about 4% in a good month and at a loss in a bad one, and she has no plans to change the pricing. "If we start making real money on repairs, we'll start wanting things to break," she says.

The problem in the basement

The real difficulty is not money but parts. Tools made since about 1990 were designed on computer, and the company holds drawings for every component. Anything older is another matter. Tidewater changed its designs often in its first three decades, kept poor records, and in 1987 lost many of its original patterns in a flood. For models made before 1990, a replacement part frequently does not exist and cannot simply be ordered.

The answer has been slow and expensive. Two of the nine repair staff now spend most of their time measuring old tools and drawing their parts, building what Holroyd calls "the library": a catalogue of some 2,400 components so far, with perhaps as many again still to do. Parts that are needed often are cast in small batches. Parts that are needed once are machined by hand, which can turn a £20 repair into a £90 one. The company absorbs the difference. Marsh will not say what this costs, only that it is "the thing that keeps Colin awake".

There is a people problem too. The work needs fitters who can diagnose a fault in a sixty-year-old tool by feel, and such people are not easy to hire. Tidewater has taken on four apprentices specifically for the repair room since 2023, and Holroyd, who trains them, says it takes about two years before one can work unsupervised. One has already been hired away by a competitor that is setting up a repair service of its own, which Marsh says she chooses to take as a compliment.

What the rivals think

Not everyone is persuaded. The managing director of a larger toolmaker, who asked not to be named, said that Tidewater's approach works only for a small company selling expensive products to enthusiasts. "Their customers are romantics," he said. "Mine want a chisel by Friday." He also pointed out that a private, family-owned firm can accept a bad year in a way that a company with outside shareholders cannot.

Marsh agrees with the second point and half agrees with the first. She thinks the model would work for any product that is simple enough to take apart and good enough to be worth it, and that the number of such products is larger than manufacturers like to admit. But she concedes that Tidewater had advantages: customers who care, products without electronics, and nobody to answer to but the bank.

Dr Ruth Okonjo, who studies manufacturing at the University of Leeds and has followed the programme since it began, says the interesting result is not that repair can be good for sales, which has been shown before, but how long it took. "Most firms that try this give up in the first year, when the numbers look terrible," she says. "The lesson is less about repair than about patience, and about who owns the company."

There are smaller lessons as well. Tidewater found that customers wanted to know who had mended their tool, so every repair now carries the fitter's name. It found that a fixed price list did not work, because no two sixty-year-old planes have been neglected in the same way, and went back to quoting each job. And it found that about one tool in twelve arrives needing nothing but sharpening, which the repair room now does for a flat £6 while trying not to sound disappointed.

Next

The Sheffield repair room is full. In spring 2027 Tidewater will open a second repair workshop, in Leeds, in a former printworks ten minutes' walk from the station. It will take six staff at first and will handle saws and chisels, leaving planes, which are the most complicated work, in Sheffield. The company hopes this will bring the queue down to one week.

Marsh is also considering whether to publish the library of old parts, so that owners and independent repairers can make their own. Abara is against it. Holroyd is for it, on the grounds that the tools matter more than who mends them.

Back in the repair room, she wraps the Aberdeen plane in brown paper and puts a card in the box. Every repaired tool goes out with one. It gives the date, the name of the person who did the work, and a line that Walter Marsh is supposed to have said to customers who brought his chisels back blunt: "Look after it, and send it back when you can't."

----- t08 text A (142 words) -----
Tidewater Tools, a Sheffield toolmaker, began a repair programme in March 2023: it will repair any tool it has ever made, at a price close to the cost of parts and labour. Sales of new tools fell by 9% in the first year, partly because customers were repairing rather than replacing, but rose by 14% in the second year and have kept growing since. The company now handles about 11,300 repairs a year, and the queue stands at just under three weeks. The main difficulty is parts: for tools made before 1990 a replacement part often does not exist, so staff measure old tools and draw their parts. Next, the company will open a second repair workshop in Leeds in spring 2027, and it is considering publishing its library of old parts so that owners and independent repairers can make their own.
----- end of t08 text A -----

----- t08 text B (137 words) -----
Tidewater Tools, a family-owned Sheffield maker of woodworking hand tools, began its repair programme in March 2023, promising to mend any tool it has ever made at close to cost. Sales of new tools fell 9% in the first year and profit dropped by almost a third, but sales then grew 14% in the second year and have kept rising, as repair customers prove likely to buy again. The company now carries out about 11,300 repairs a year. The main difficulty is parts: for models made before about 1990, drawings are often missing, so staff measure old tools and redraw their parts, and one-off parts can cost far more than customers pay. Next, in spring 2027, Tidewater will open a second repair workshop in Leeds, handling saws and chisels, hoping to cut the queue to a week.
----- end of t08 text B -----


==================== t09 ====================

## Task 9: translation into German (file 09.txt)

Translate the notice below into German for the users of a public library. Address the readers formally (Sie). Keep every date, time, price, name and address, and write dates, times and prices the way a German notice would. Write only the German text.

Notice:

Riverside Public Library: changes from 1 February 2026

Dear readers,

From Sunday, 1 February 2026, our opening hours and fees will change.

The library will be open Monday to Friday from 10 a.m. to 7 p.m. and on Saturdays from 10 a.m. to 2 p.m. It stays closed on Sundays and public holidays. The book return box at the main entrance can be used at any time.

The late fee will be €0.50 per item per day, up to a maximum of €10 per item. Reserving a book that is on loan costs €1. Membership remains free for everyone under 18; adults pay €12 per year.

Library cards that expire in January can be renewed at the front desk. Please bring your card and a valid photo ID. You can also renew online if your address has not changed.

Please note that the reading room on the second floor is closed for renovation until 15 April. During this time, the study desks on the ground floor are available, and the Wi-Fi works throughout the building.

If you have questions, write to info@riverside-library.example or ask our staff.

We look forward to your visit.

Your library team

----- t09 text A (187 words) -----
Riverside Public Library: Änderungen ab 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10:00 bis 19:00 Uhr und samstags von 10:00 bis 14:00 Uhr geöffnet. Sonntags und an gesetzlichen Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang können Sie jederzeit nutzen.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines ausgeliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können Sie an der Information verlängern. Bitte bringen Sie Ihren Ausweis und einen gültigen Lichtbildausweis mit. Sie können Ihren Ausweis auch online verlängern, wenn sich Ihre Adresse nicht geändert hat.

Bitte beachten Sie: Der Lesesaal im zweiten Obergeschoss ist bis zum 15. April wegen Renovierungsarbeiten geschlossen. In dieser Zeit stehen Ihnen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie bitte an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text A -----

----- t09 text B (184 words) -----
Riverside Public Library: Änderungen ab 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, dem 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines entliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können an der Anmeldung verlängert werden. Bitte bringen Sie Ihren Ausweis und einen gültigen Lichtbildausweis mit. Sie können auch online verlängern, wenn sich Ihre Adresse nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im zweiten Obergeschoss bis zum 15. April wegen Renovierung geschlossen ist. In dieser Zeit stehen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text B -----


==================== t10 ====================

## Task 10: explanation for a layperson (file 10.txt)

Explain why a phone battery holds less charge after a few years. The reader is a phone owner with no technical background who asked: "Why does my phone die by 4 p.m. now?" Between 150 and 200 words. Say that heat speeds up the wear. End with exactly three practical tips as a numbered list (1., 2., 3.). Do not use the words "anode", "cathode", "electrolyte" or "SEI". Plain text, no heading.

----- t10 text A (180 words) -----
Your phone battery stores energy by shuttling tiny charged particles back and forth between two layers inside it. Every time you charge and use the phone, that shuttling causes a little wear. Small bits of the battery's insides get used up or clogged, so there is less room to hold charge. After a couple of years, the battery simply cannot hold what it once did, which is why your phone now runs out by 4 p.m.

Heat makes this wear faster. A battery that often gets hot, from sitting in a sunny car, charging under a pillow or running demanding games, ages much more quickly than one kept cool.

You cannot stop the ageing, but you can slow it:

1. Keep the phone out of heat: do not leave it in direct sun or a hot car, and take off a thick case while charging.
2. Avoid the extremes: try to keep the charge between about 20% and 80% when you can.
3. Charge slowly when you can, for example overnight with a standard charger rather than a fast one.
----- end of t10 text A -----

----- t10 text B (186 words) -----
Battery wear is a common reason why a phone that lasted all day now dies by 4 p.m. Each charge and use causes a small, permanent change to the materials that store the power. Over the years there is less of the material that can hold charge, so the battery stores less than it did when new.

Every battery wears this way, but heat speeds up the wear. A battery that gets hot, from a warm pocket, direct sunlight, a demanding game or fast charging, ages more quickly, because the chemical changes that cause wear happen faster at high temperatures. This is why a phone that was fine in its first year can lose a lot of capacity after three or four years.

Nothing is broken, and the change is gradual. You can slow it down with three simple habits:

1. Keep the phone out of direct sunlight and off hot surfaces, such as a car dashboard.
2. Take thick cases off while charging, and avoid charging under a pillow or blanket.
3. Turn on the optimised or battery-health charging setting, if your phone has one.
----- end of t10 text B -----


==================== t11 ====================

## Task 11: forum post from notes (file 11.txt)

Turn the notes below into a post for a woodworking forum. Start with a line "Title: ..." and then the body. At most 200 words in total. Give a helper what they need (the wood, the product, how it was applied, the conditions, what happened) and end with one clear question. Leave out anything private or beside the point.

Notes:

table top STILL sticky. day 4
- oak, 180 x 90 cm, glued up from 5 boards, for the dining table
- sanded 80 / 120 / 180 / 240 (was 240 too fine? read that somewhere)
- finish: Osmo Polyx-Oil 3032 satin, 2 coats, 24h apart, put on with a brush, did NOT wipe off the excess on coat 2 (ran out of rags)
- garage, unheated, 11 °C, window shut
- coat 1 felt dry next morning. coat 2 = tacky after 4 days, fingerprints stay
- tin says dry in 8-10 h at 23 °C
- wiped a corner with mineral spirits yesterday, looks a bit dull there now
- Derek has the trailer till sunday, call him 07700 900153
- table has to be done by the 29th, mum's birthday dinner, 12 people!!
- options?? wait / move it indoors / strip it and start over
- paid 61 for the tin, not buying another one if I can help it

----- t11 text A (178 words) -----
Title: Osmo Polyx-Oil still tacky after 4 days on oak table top, cold garage

Project: a dining table top in oak, 180 x 90 cm, glued up from 5 boards. I sanded 80/120/180/240 (could 240 be too fine for oil?).

Finish: Osmo Polyx-Oil 3032 satin, two coats by brush, 24 hours apart. I did not wipe off the excess on coat 2 because I ran out of rags.

Conditions: unheated garage at 11 °C, window shut. The tin says dry in 8 to 10 hours at 23 °C.

What happened: coat 1 felt dry the next morning. Coat 2 is still tacky after 4 days and fingerprints stay. Yesterday I wiped one corner with mineral spirits; it now looks a bit dull there.

Options I see: wait, move it indoors to warm up, or strip it and start over. It has to be ready by the 29th, and I would rather not buy another tin.

Question: given the unwiped second coat and the cold, is warming the top indoors likely to cure it, or should I strip it?
----- end of t11 text A -----

----- t11 text B (135 words) -----
Title: Osmo Polyx-Oil oak table top still tacky after 4 days

Oak dining table top, 180 x 90 cm, glued up from five boards.

Sanded with 80, 120, 180 and 240 grit.

Finish: Osmo Polyx-Oil 3032 satin, two coats 24 hours apart, applied with a brush. I did not wipe off the excess after coat 2, as I had run out of rags.

Conditions: unheated garage at 11 °C, window shut. The tin says dry in 8 to 10 hours at 23 °C.

Coat 1 felt dry the next morning. Coat 2 is still tacky after four days, and fingerprints stay in it. Yesterday I wiped one corner with mineral spirits, and it now looks dull there.

Will the finish cure if I bring the table indoors now, or does it have to be stripped?
----- end of t11 text B -----


==================== t12 ====================

## Task 12: shorter rewrite (file 12.txt)

Rewrite the newsletter below in at most 160 words; it has about 330. Keep the five things members must act on or know: the date, time and place of the Annual General Meeting; the new membership fee and when it starts; the new head coach and when she starts; the deadline for kit orders; and the call for volunteers for the summer tournament, with its date. Plain prose, no bullet list.

Newsletter:

Dear members and friends of Hollins Harriers,

We hope that this newsletter finds you all in good health and good spirits, and that you have managed to keep up at least some of your running through what has been, by anybody's standards, a remarkably wet and windy winter. There is quite a lot of news to get through this time around, so we would encourage you to make yourself a cup of tea and settle in.

First and foremost, we would like to draw your attention to the fact that the club's Annual General Meeting will be held on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. It really is important that as many members as possible come along, because this is your opportunity to have your say.

On the subject of money, which is never anyone's favourite topic, the committee has, after a great deal of careful thought and discussion, come to the decision that the annual membership fee will need to go up from £35 to £40, with effect from 1 April. This is the first increase in six years.

We are also absolutely thrilled to be able to announce that Priya Raman will be joining us as our new head coach, and she will be taking her first sessions in May. Many of you will know Priya from the county cross-country scene.

If you would like to order new club kit in time for the summer season, please be aware that orders must reach Jo, our kit secretary, by 28 February at the very latest, as the supplier will not accept late orders.

Last but by no means least, our summer tournament takes place on Sunday 12 July, and we are looking for six volunteers to help with marshalling and refreshments. If you think you might be able to spare a few hours, please do speak to any member of the committee.

With very best wishes for the season ahead,

The Committee

----- t12 text A (115 words) -----
Dear members,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come and have your say.

The annual membership fee rises from £35 to £40 on 1 April, the first increase in six years.

Priya Raman joins us as head coach and takes her first sessions in May.

If you want new club kit for the summer, orders must reach Jo, our kit secretary, by 28 February. Late orders cannot be accepted.

We need six volunteers for marshalling and refreshments at our summer tournament on Sunday 12 July. If you can spare a few hours, please speak to any committee member.

The Committee
----- end of t12 text A -----

----- t12 text B (130 words) -----
Dear members and friends of Hollins Harriers,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come along and have your say.

The annual membership fee goes up from £35 to £40 on 1 April, the first increase in six years.

Priya Raman joins us as our new head coach, and she takes her first sessions in May.

If you want new club kit for the summer, orders must reach Jo, our kit secretary, by 28 February, as the supplier will not accept late orders.

Finally, our summer tournament is on Sunday 12 July, and we need six volunteers for marshalling and refreshments. Please speak to any committee member if you can help.

With best wishes,

The Committee
----- end of t12 text B -----
