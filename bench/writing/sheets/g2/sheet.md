# Grading task

Below are twelve writing tasks. Under each task are 6 texts, A to F, written by 6 different writers for that task. The letters are shuffled anew for every task, so A in one task is not the same writer as A in another. Judge every text on its own merits, for the reader the task names.

For each task:

1. Score every text from 1 (poor) to 5 (excellent) on five points:
   - facts: every fact the task requires is there and right, nothing is invented, nothing the task forbids is included
   - limits: the length limit and the format the task asks for are kept. The word count of each text, counted by script, is in its heading; trust it and do not count yourself
   - clear: the reader gets the point on first reading; the order makes sense
   - tone: fits the reader and the occasion. For the translations: correct, natural German in the formal register, with German conventions for dates, times and prices
   - filler: 5 means no padding, stock phrases or repetition; 1 means a lot
2. Rank the 6 texts from best to worst, as the reader of that task would. No ties, every letter exactly once.
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

----- t01 text A (136 words) -----
Dear Ms Brandner,

I am sorry that your order 48213, placed on 2 November, arrived with the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), and we sent a 10-speed Tiagra derailleur instead. The cause was a picking mistake in our warehouse, and the error is ours.

The correct derailleur ships on 14 November by express delivery, at no charge to you. A prepaid return label for the wrong part is attached to this email, and you have 30 days to send it back.

We are also refunding 15% of the order value, €18.60, to your original payment method within 5 working days.

If you have any questions, reply to this email or call me on 0800 555 0199.

Again, my apologies for the trouble.

Kind regards,
Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text A -----

----- t01 text B (142 words) -----
Dear Ms Brandner,

I am sorry that your order 48213, placed on 2 November, arrived with the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), and we sent a 10-speed Tiagra derailleur instead. The cause was a picking mistake in our warehouse, and it should not have happened.

Your correct derailleur will ship on 14 November by express delivery, at no charge to you. A prepaid return label for the wrong part is attached to this email, and you have 30 days to send it back.

We are also refunding 15% of the order value, €18.60, to your original payment method within 5 working days.

If you have any questions, please reply to this email or call me on 0800 555 0199.

Again, I apologise for the trouble this has caused.

Kind regards,
Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text B -----

----- t01 text C (138 words) -----
Dear Ms Brandner,

I am sorry that your order 48213, placed on 2 November, arrived with the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), and we sent a 10-speed Tiagra derailleur instead. The cause was a picking mistake in our warehouse, and the responsibility is ours.

The correct derailleur ships on 14 November by express delivery, at no charge to you. We are also refunding 15% of the order value, €18.60, to your original payment method within 5 working days.

A prepaid return label for the wrong part is attached to this email. You have 30 days to send the part back.

Again, I apologise for the trouble. If you have any questions, you can reply to this email or call me on 0800 555 0199.

Kind regards,
Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text C -----

----- t01 text D (131 words) -----
Dear Ms Brandner,

We are very sorry. Your order 48213, placed on 2 November, contained the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), but we sent a 10-speed Tiagra derailleur instead. The mistake was ours, made when our warehouse picked your order.

The correct derailleur ships on 14 November by express delivery, at no charge to you.

A prepaid return label for the wrong part is attached to this email. You have 30 days to send the part back.

We will also refund 15% of your order value, €18.60, to your original payment method within 5 working days.

If you have any questions, reply to this email or call us on 0800 555 0199. Thank you for your patience.

Kind regards,

Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text D -----

----- t01 text E (142 words) -----
Dear Ms Brandner,

I am sorry that your order 48213, placed on 2 November, arrived with the wrong part. You ordered a Shimano 105 rear derailleur (11-speed), and we sent you a 10-speed Tiagra derailleur instead. The cause was a picking mistake in our warehouse, and it was our error.

The correct derailleur ships on 14 November by express delivery, at no charge to you. A prepaid return label for the wrong part is attached to this email, and you have 30 days to send it back.

To make up for the trouble, we are refunding 15% of the order value, €18.60, to your original payment method within 5 working days.

If you have any questions, reply to this email or call me on 0800 555 0199.

Again, my apologies for the mistake.

Kind regards,
Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text E -----

----- t01 text F (139 words) -----
Dear Ms Brandner,

I am sorry about the mistake with your order 48213, placed on 2 November. You ordered a Shimano 105 rear derailleur (11-speed), but we sent a 10-speed Tiagra derailleur instead. The error was a picking mistake in our warehouse, and I apologise for the trouble it has caused you.

The correct derailleur will be sent to you on 14 November by express delivery, at no charge to you.

Please send the wrong part back using the prepaid return label attached to this email. You have 30 days to do so.

We will also refund 15% of the order value, €18.60, to your original payment method within 5 working days.

If you have any questions, you can reply to this email or call us on 0800 555 0199.

Yours sincerely,

Tomasz Reddy
Customer Service
Fenwick Cycle Parts
----- end of t01 text F -----


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

----- t02 text A (129 words) -----
The Calder Road bus lane trial, run from March 2025 to February 2026, worked well for buses at modest cost to drivers. Excluding the roadworks-distorted summer months, peak bus journeys became 19% faster (a morning journey fell from 26 minutes to 21), and peak-time punctuality rose from 58% to 83%. Peak car journeys became 6% slower, about 50 seconds, against a forecast of 12%. Bus ridership rose 11%, against 2% on a comparable road. Problems are local: Wickham Lane saw 14% more morning traffic, and shorter loading hours hurt some shops. The Director recommends Option C: make the lane permanent, restore morning loading, add a loading bay, close Wickham Lane's northern end at morning peak, and review after two years, costing about £90,000. The Council votes on 18 June.
----- end of t02 text A -----

----- t02 text B (147 words) -----
Calder Road's twelve-month bus lane trial has been evaluated. Peak-time bus journeys became 19% faster, and the share of peak buses running within five minutes of the timetable rose from 58% to 83%. Car journeys at peak times became 6% slower, about 50 seconds, which is less than the 12% the model predicted; off-peak car times did not change measurably. Bus ridership on the six routes rose by 11%, against 2% on Harlow Road and 3% across the city. The report recommends Option C: make the lane permanent, restore morning loading from 7 a.m. to 10 a.m. in the six existing bays, add a seventh bay near the market, close Wickham Lane to through traffic at its northern end from 7 a.m. to 9.30 a.m., and review after two years. The changes would cost about £90,000, met from penalty notice income. The Council votes on 18 June.
----- end of t02 text B -----

----- t02 text C (130 words) -----
On 18 June the Council votes on whether to keep the Calder Road bus lane, after a twelve-month trial. Peak bus journeys became 19% faster, and the share of buses running on time rose from 58% to 83%. Peak car journeys became 6% slower, about 50 seconds over the corridor, less than forecast, and off-peak times did not change. Bus ridership on the six routes rose by 11%, against 2% on Harlow Road and 3% across the city. The report recommends making the lane permanent with changes: restored morning loading at the six existing bays, a seventh bay near the market, morning closure of Wickham Lane to through traffic at its northern end, and a review after two years. The changes would cost about £90,000, met from penalty notice income.
----- end of t02 text C -----

----- t02 text D (134 words) -----
The Calder Road bus lane trial, run from March 2025 to February 2026, worked well for buses. Excluding the roadworks-distorted summer months, peak bus journeys became 19% faster (a morning journey fell from 26 to 21 minutes) and punctuality rose from 58% to 83%. Peak car journeys became 6% slower, about 50 seconds, far less than the 12% the model predicted. Bus ridership rose 11%, against 2% on a comparable road. Harms are local: Wickham Lane traffic rose 14% at the morning peak, and traders lost morning loading time. The Director recommends Option C: make the lane permanent, restore loading from 7 to 10 a.m., add a loading bay, close Wickham Lane's northern end at morning peak, and review after two years, for about £90,000 from penalty income. The Council votes on 18 June.
----- end of t02 text D -----

----- t02 text E (130 words) -----
Over the twelve-month Calder Road trial, peak-time bus journeys became 19% faster (the morning peak fell from 26 minutes to 21), and the share of peak buses running within five minutes of the timetable rose from 58% to 83%. Peak car journeys became 6% slower, about 50 seconds and far less than the 12% the model predicted. Bus ridership rose 11%, against 2% on a comparable road and 3% citywide. Harms were local: Wickham Lane traffic rose 14% at the morning peak, and shorter loading hours hurt some shops. The Director of Transport recommends making the lane permanent with changes: restore morning loading, add a market loading bay, and close Wickham Lane's northern end to through traffic in the morning peak, at about £90,000. The Council votes on 18 June.
----- end of t02 text E -----

----- t02 text F (132 words) -----
The Calder Road bus lane trial worked, and the Director of Transport recommends keeping it with changes. Peak bus journeys became 19% faster, with the morning trip falling from 26 to 21 minutes, and the share of peak buses on time rose from 58% to 83%. Bus ridership grew 11%, against 2% on a comparable road. Peak car journeys became 6% slower, about 50 seconds, far less than the 12% the traffic model predicted. Harms are local: loading hours cut for shops, and 14% more morning traffic on Wickham Lane. The report recommends making the lane permanent with morning loading restored, a seventh loading bay, a morning through-traffic closure of Wickham Lane's northern end, and a review after two years, costing about £90,000 from penalty income. The Council votes on 18 June.
----- end of t02 text F -----


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
Hinweis an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, den 3. März 2026, wird die Wasserversorgung für das gesamte Haus von 8.30 bis 14.30 Uhr abgestellt. Der städtische Wasserversorger tauscht den Hauptabsperrhahn im Keller aus, und die Arbeiten können nicht durchgeführt werden, solange die Leitungen unter Druck stehen.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, Kochen und für die Toilettenspülung. Betreiben Sie während dieser Zeit keine Waschmaschinen oder Geschirrspüler, und stellen Sie sicher, dass alle Wasserhähne geschlossen sind, bevor Sie das Haus verlassen, damit nichts überläuft, wenn das Wasser wieder anliegt.

Wenn die Versorgung wieder einsetzt, kann das Wasser kurzzeitig braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den Kaltwasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Am selben Tag ist außerdem der Aufzug in Treppenhaus B zwischen 9 und 12 Uhr außer Betrieb, da die Techniker den Schacht benötigen, um an die Leitungen zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, melden sich bitte bis Freitag, den 27. Februar, beim Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen erreichen Sie unseren Hausmeister, Herrn Brandt, unter 030 555 0142 montags bis freitags zwischen 7 und 16 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Hausverwaltung
----- end of t03 text A -----

----- t03 text B (216 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, dem 3. März 2026, wird die Wasserversorgung im gesamten Gebäude von 8:30 bis 14:30 Uhr abgestellt. Der städtische Wasserversorger tauscht im Keller das Hauptventil aus, und diese Arbeiten können nicht unter Druck ausgeführt werden.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, Kochen und Spülen. Betreiben Sie in dieser Zeit keine Waschmaschinen und Geschirrspüler, und achten Sie darauf, dass alle Wasserhähne geschlossen sind, bevor Sie Ihre Wohnung verlassen. So läuft nichts über, wenn das Wasser wieder fließt.

Wenn die Versorgung zurückkehrt, kann das Wasser für kurze Zeit braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den kalten Wasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug im Treppenhaus B ist an diesem Tag außerdem von 9 bis 12 Uhr außer Betrieb, weil die Techniker den Schacht benötigen, um an die Leitungen zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, wenden sich bitte bis Freitag, 27. Februar, an den Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, werktags zwischen 7 und 16 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Property Management
----- end of t03 text B -----

----- t03 text C (224 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Damen und Herren,

am Dienstag, dem 3. März 2026, wird die Wasserversorgung für das gesamte Gebäude von 8:30 Uhr bis 14:30 Uhr abgestellt. Die städtischen Wasserbetriebe tauschen das Hauptventil im Keller aus; die Arbeiten lassen sich nicht durchführen, solange die Rohre unter Druck stehen.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, zum Kochen und für die Toilettenspülung. Nehmen Sie während dieser Zeit keine Waschmaschinen oder Geschirrspüler in Betrieb, und vergewissern Sie sich, dass alle Wasserhähne geschlossen sind, bevor Sie die Wohnung verlassen, damit nichts überläuft, wenn das Wasser wieder anliegt.

Sobald die Versorgung wieder einsetzt, kann das Wasser kurzzeitig braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den Kaltwasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug in Treppenhaus B ist an diesem Tag ebenfalls zwischen 9:00 und 12:00 Uhr außer Betrieb, weil die Techniker den Schacht benötigen, um an die Rohre zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, wenden sich bitte bis Freitag, den 27. Februar, an den Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, werktags zwischen 7:00 und 16:00 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Property Management
----- end of t03 text C -----

----- t03 text D (223 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, den 3. März 2026, wird die Wasserversorgung für das gesamte Haus von 8.30 Uhr bis 14.30 Uhr abgestellt. Der städtische Wasserversorger tauscht das Hauptventil im Keller aus; die Arbeiten sind nicht möglich, solange die Leitungen unter Druck stehen.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, zum Kochen und für die Toilettenspülung. Betreiben Sie während dieser Zeit weder Waschmaschinen noch Geschirrspüler, und achten Sie darauf, dass alle Wasserhähne geschlossen sind, bevor Sie die Wohnung verlassen, damit nichts überläuft, wenn das Wasser wieder anliegt.

Wenn die Versorgung wieder einsetzt, kann das Wasser kurzzeitig braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den Kaltwasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Am selben Tag ist außerdem der Aufzug in Treppenhaus B zwischen 9 und 12 Uhr außer Betrieb, weil die Techniker den Schacht benötigen, um an die Rohre zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, wenden sich bitte bis Freitag, den 27. Februar, an den Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, montags bis freitags zwischen 7 und 16 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Property Management
----- end of t03 text D -----

----- t03 text E (217 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, 3. März 2026, wird die Wasserversorgung im gesamten Gebäude von 8:30 Uhr bis 14:30 Uhr abgestellt. Der städtische Wasserversorger tauscht im Keller das Hauptventil aus. Diese Arbeiten können nur durchgeführt werden, wenn die Leitungen drucklos sind.

Bitte füllen Sie am Abend zuvor einige Behälter mit Wasser, zum Trinken, Kochen und Spülen. Betreiben Sie in dieser Zeit keine Waschmaschinen und Geschirrspüler. Vergewissern Sie sich außerdem, dass alle Wasserhähne geschlossen sind, bevor Sie die Wohnung verlassen, damit nichts überläuft, wenn das Wasser wieder fließt.

Wenn die Versorgung wieder einsetzt, kann das Wasser kurze Zeit braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den kalten Wasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug im Treppenhaus B ist an diesem Tag außerdem von 9:00 Uhr bis 12:00 Uhr außer Betrieb, weil die Techniker den Schacht benötigen, um an die Leitungen zu gelangen. Wenn Sie auf den Aufzug angewiesen sind, wenden Sie sich bitte bis Freitag, 27. Februar, an unseren Hausmeister, damit wir Ihnen helfen können.

Bei Fragen erreichen Sie unseren Hausmeister, Herrn Brandt, unter 030 555 0142 werktags zwischen 7:00 Uhr und 16:00 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Property Management
----- end of t03 text E -----

----- t03 text F (223 words) -----
Mitteilung an alle Mieterinnen und Mieter der Lindenstraße 27

Sehr geehrte Mieterinnen und Mieter,

am Dienstag, den 3. März 2026, wird die Wasserversorgung für das gesamte Gebäude von 8:30 Uhr bis 14:30 Uhr abgestellt. Das städtische Wasserversorgungsunternehmen tauscht das Hauptventil im Keller aus; die Arbeiten können nicht durchgeführt werden, solange die Leitungen unter Druck stehen.

Bitte füllen Sie am Vorabend einige Behälter mit Wasser, zum Trinken, Kochen und für die Toilettenspülung. Nehmen Sie in dieser Zeit keine Waschmaschinen und Geschirrspüler in Betrieb, und achten Sie darauf, dass alle Wasserhähne geschlossen sind, bevor Sie die Wohnung verlassen, damit nichts überläuft, wenn das Wasser wieder anliegt.

Wenn die Versorgung wieder einsetzt, kann das Wasser kurzzeitig braun oder trüb aussehen. Das ist unbedenklich. Lassen Sie den Kaltwasserhahn etwa fünf Minuten laufen, bis das Wasser klar ist.

Der Aufzug in Treppenhaus B ist am selben Tag zwischen 9 Uhr und 12 Uhr ebenfalls außer Betrieb, da die Techniker den Schacht benötigen, um an die Leitungen zu gelangen. Mieterinnen und Mieter, die auf den Aufzug angewiesen sind, melden sich bitte bis Freitag, den 27. Februar, beim Hausmeister, damit wir Hilfe organisieren können.

Bei Fragen rufen Sie bitte unseren Hausmeister, Herrn Brandt, unter 030 555 0142 an, werktags zwischen 7 Uhr und 16 Uhr.

Wir bitten um Entschuldigung für die Unannehmlichkeiten und danken Ihnen für Ihr Verständnis.

Schubert Hausverwaltung
----- end of t03 text F -----


==================== t04 ====================

## Task 4: explanation for a layperson (file 04.txt)

Explain how public-key encryption lets you send a secret message to someone you have never met. The reader has no technical background: picture a grandparent who uses online banking and asked how it can be safe. Between 170 and 220 words. Use one everyday comparison and stay with it. Say that the public key can be given to anyone and that the private key is never shared. Do not use the words "algorithm", "prime", "cryptography" or "asymmetric". Plain text, no heading.

----- t04 text A (210 words) -----
Think of a padlock. Imagine you make thousands of identical open padlocks and leave them in a bowl at the post office, free for anybody to take. You keep the only key to all of them at home.

Now a stranger wants to send you a secret. They take one of your open padlocks, put their message in a box, and snap the padlock shut. Once it clicks, nobody can open the box, not even the person who locked it. It travels through the post, past all sorts of curious hands, and arrives at your door. You open it with your key.

That is how online banking works. The padlock is your bank's public key. The bank can give it to anyone, and it does, to every visitor to its website. Having a padlock tells a thief nothing about how to open one, so there is no harm in handing them out. The key that opens it is the private key. The bank never shares it with anyone and keeps it locked away on its own computers.

So when you type your password, your computer locks it with the bank's padlock first. Only the bank can unlock it. You never had to meet anyone or agree on a secret beforehand.
----- end of t04 text A -----

----- t04 text B (211 words) -----
Imagine you want people everywhere to be able to send you private letters, even people you have never met. You cannot meet each of them to hand over a secret code. So you do something clever. You make hundreds of open padlocks and leave them in a public place, perhaps on a table in the town square. Anyone can take one. Each padlock is yours, and only you own the one key that opens it.

Now a stranger wants to write to you. They put their message in a box, take one of your open padlocks, and snap it shut. Once it clicks closed, nobody can open that box, not even the person who locked it. They post it to you. When it arrives, you open it with your key and read the message.

That is how public-key encryption works. The open padlock is the public key: you can give it to anyone, and it does no harm if a thief gets one, because a padlock can only lock. The key that opens it is the private key. You never share it and it never leaves your hands.

When you use online banking, your computer and the bank do this in seconds, so what you send stays private all the way.
----- end of t04 text B -----

----- t04 text C (211 words) -----
Imagine you want to receive secret letters from someone you have never met. Here is how a special kind of padlock makes that possible.

First, the person makes a pair of keys: a public key and a private key. The public key is like a padlock they can hand out to anyone. They can give out as many copies as they like, on a website, in an email, or even on a noticeboard in a shop. Anyone can use it to lock a box.

The private key is the only key that opens those padlocks. It never leaves home. The owner keeps it safe and never shares it with anyone.

So here is what you do. You put your secret message in a small box, snap on one of the public padlocks, and post it. On its journey, anybody can see the box and even carry it, but nobody can open it. When it arrives, the owner uses the private key, which fits only the padlocks they made, and the box opens. Only they can read your message.

This is the same idea behind the padlock you see on your bank's website. Your details are locked before they leave your computer, and only the bank holds the key that opens them.
----- end of t04 text C -----

----- t04 text D (197 words) -----
Imagine a post box with a slot in the top. Anyone can post a letter through that slot, but only the person holding the key can open the box and read what is inside.

Public-key encryption works the same way. Your bank, or anyone else who wants to send you a secret message, uses your public key to lock the message. Your public key is like the slot. You can give it to anyone, put it on a website, and it does no harm, because it can only put messages in, never take them out.

Your private key is the only key that opens the box. It stays with you. You never share it with anyone, not with your bank, not with a friend, and not with the company that made your phone.

That is why this works even between people who have never met. A stranger can send you a secret without ever meeting you. Anyone who sees the message on its way cannot read it, because they have only the slot, not the key.

When you bank online, your browser uses this kind of locking to protect your details on their way to the bank.
----- end of t04 text D -----

----- t04 text E (207 words) -----
Imagine you own a box of open padlocks. You hand them out to anyone who asks, and you never worry about who gets one, because an open padlock cannot unlock anything. You keep the only key that opens them, and you never give that key to anybody.

Now a stranger wants to send you a private note. They write it, put it in a box, snap one of your padlocks shut on it and post the box to you. On the way, plenty of people may handle it, but nobody can look inside, not even the sender, since snapping the padlock shut is easy and opening it needs the key. When the box arrives, you open it with your key and read the note.

That is how online banking stays safe. Your bank gives out its padlock, called the public key, to anyone who visits its website. Your computer uses that padlock to lock up your details before they travel across the internet. Only the bank holds the matching key, called the private key, and it is never shared with anyone. So someone who copies the padlock still can't read a thing, and you never had to meet anyone from the bank first to set it up.
----- end of t04 text E -----

----- t04 text F (214 words) -----
Imagine you want people you have never met to be able to send you private letters. You make a thousand identical padlocks, all of them open, and leave them in a bowl on the village green with a sign saying: take one. Anyone can pick one up. That is your public key, and you can give it to anyone, even a stranger or a thief, because an open padlock lets nobody into anything.

Someone who wants to write to you puts their letter in a box, snaps your padlock shut on it and posts it to you. Snapping it shut is easy. Opening it is not. Once the padlock is closed, nobody without the key can get it open, not the sender, not anyone who steals the box on the way.

Only you can open it, because you kept the one key that fits your padlocks. That is your private key. You never lend it, copy it or send it to anyone.

When you use online banking, your computer and the bank's do this in a flash. Your computer takes the bank's open padlock, locks your details inside and sends them on. Only the bank holds the key. Though anyone can see the box travelling, only the bank can read what is in it.
----- end of t04 text F -----


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

----- t05 text A (183 words) -----
Title: Pi-hole stops resolving DNS every ~2 days until I restart DNS (FTL: max concurrent queries reached)

Hardware/software: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. Router is a FRITZ!Box 7590; the Pi is the only DNS server handed out by DHCP. Upstreams: Cloudflare 1.1.1.1 and Quad9.

Problem: After about two days (once 36 hours, once roughly 50) every device loses internet. The admin page shows a red "DNS resolution is currently unavailable". This has happened three times this month. "pihole restartdns" fixes it instantly, and so does a reboot.

The last FTL log line before it dies is:
"Maximum number of concurrent DNS queries reached (max: 150)"

Already tried: a new SD card (SanDisk 32 GB), a static IP (192.168.178.2), and turning off IPv6 in the FRITZ!Box. None changed anything. pihole -d shows nothing obvious, and the Pi's temperature is fine at 48 °C.

One suspect: my smart TV sends about 9,000 queries a day to a Samsung domain.

Question: Is the TV's query flood the likely cause, and if not, what else should I check?
----- end of t05 text A -----

----- t05 text B (191 words) -----
Title: Pi-hole v5 DNS dies every 2 days ("Maximum number of concurrent DNS queries reached")

Hardware and software: Raspberry Pi 4 (4 GB), Raspberry Pi OS bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. The Pi runs at 48 °C, which is fine. My FRITZ!Box 7590 hands out the Pi as the only DNS server by DHCP. Upstreams are Cloudflare 1.1.1.1 and Quad9.

Problem: this is the third time this month. After about two days (once 36 hours, once about 50 hours), every device loses internet. The web admin shows a red "DNS resolution is currently unavailable". `pihole restartdns` fixes it at once, and so does a reboot. The last FTL log line before it dies is: "Maximum number of concurrent DNS queries reached (max: 150)".

Already tried, same result each time: a new SD card (SanDisk 32 GB), a static IP (192.168.178.2), and IPv6 turned off in the FRITZ!Box.

`pihole -d` showed nothing obvious to me. I suspect a smart TV, which sends about 9,000 queries a day to one Samsung domain, but I have not confirmed it.

How can I find which device is causing the query flood on Pi-hole v5?
----- end of t05 text B -----

----- t05 text C (179 words) -----
Title: Pi-hole stops answering DNS after about two days, restart fixes it

Hardware and software: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. The router is a FRITZ!Box 7590, and the Pi is the only DNS server it hands out by DHCP. Upstream DNS is Cloudflare 1.1.1.1 and Quad9.

Symptom: after roughly two days (once 36 hours, once about 50), every device loses internet access. The web admin shows a red "DNS resolution is currently unavailable". pihole restartdns fixes it at once, and so does a reboot. The Pi runs at 48 °C, which is fine.

The last FTL log line before it dies: "Maximum number of concurrent DNS queries reached (max: 150)". I suspect a Samsung TV, which sends about 9,000 queries a day to one Samsung domain.

Already tried, no change: a new 32 GB SanDisk SD card, a static IP (192.168.178.2), and IPv6 turned off in the FRITZ!Box. pihole -d showed nothing obvious to me.

Question: how can I find out which device is using up the 150 concurrent queries?
----- end of t05 text C -----

----- t05 text D (180 words) -----
Title: Pi-hole loses DNS every ~2 days until restartdns (FTL: max concurrent queries 150)

Setup: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. Router is a FRITZ!Box 7590, and the Pi is the only DNS server its DHCP hands out. Upstreams are Cloudflare 1.1.1.1 and Quad9.

Problem: about every two days (once after 36 hours, once after roughly 50) every device loses internet and the web admin shows a red "DNS resolution is currently unavailable". Third time this month. `pihole restartdns` fixes it instantly, and so does a reboot.

The last FTL log line before it dies is "Maximum number of concurrent DNS queries reached (max: 150)". pihole -d shows nothing obvious, and the Pi runs at a fine 48 °C.

Already tried, with no change: a new SD card (SanDisk 32 GB), a static IP (192.168.178.2), and IPv6 switched off in the FRITZ!Box.

One suspect: a smart TV sends about 9,000 queries a day to a Samsung domain.

Question: how can I find out which client fills the 150-query limit before DNS dies?
----- end of t05 text D -----

----- t05 text E (186 words) -----
Title: Pi-hole 5.18.3 stops resolving DNS every 1-2 days, "Maximum number of concurrent DNS queries reached"

Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. Router is a FRITZ!Box 7590; the Pi is the only DNS server handed out by DHCP. Upstreams: Cloudflare 1.1.1.1 and Quad9.

Roughly every two days (once after about 36 hours, once after about 50) every device loses internet and the web admin shows a red "DNS resolution is currently unavailable". It has happened three times this month. pihole restartdns fixes it instantly, and so does a reboot. The Pi's temperature is fine at 48 C.

The last line in the FTL log before it dies is "Maximum number of concurrent DNS queries reached (max: 150)". pihole -d shows nothing obvious.

Already tried, with the same result each time: a new SD card (SanDisk 32 GB), a static IP (192.168.178.2) and IPv6 turned off in the FRITZ!Box.

One suspect: my smart TV sends about 9,000 queries a day to a Samsung domain. Is the TV the likely cause of hitting that limit, or should I look elsewhere?
----- end of t05 text E -----

----- t05 text F (187 words) -----
Title: Pi-hole stops resolving DNS every ~2 days, restartdns fixes it (FTL: max concurrent queries 150)

Hardware/software: Raspberry Pi 4 (4 GB), Raspberry Pi OS Bookworm 64-bit, Pi-hole v5.18.3, FTL 5.25.2. Router is a FRITZ!Box 7590, and the Pi is the only DNS server handed out by DHCP. Upstreams: Cloudflare 1.1.1.1 and Quad9.

Problem: roughly every 2 days (once after about 36 hours, once after about 50) all devices lose internet. The web admin shows a red "DNS resolution is currently unavailable". It has happened three times this month. `pihole restartdns` fixes it instantly, as does a reboot.

The last line in the FTL log before it dies is: "Maximum number of concurrent DNS queries reached (max: 150)". `pihole -d` shows nothing obvious. The Pi's temperature is fine, 48 °C.

Already tried, with no change: a new SD card (SanDisk 32 GB), a static IP (192.168.178.2), and turning off IPv6 in the FRITZ!Box.

One suspect: my smart TV sends about 9,000 queries a day to a Samsung domain.

Question: Could the TV be exhausting the 150-query limit, and what should I check or change to stop it?
----- end of t05 text F -----


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

----- t06 text A (120 words) -----
Dear colleagues,

We move on Friday 9 January to the third floor of 14 Kestrel Way, and everyone works there from Monday 12 January. Packing crates will be delivered to every desk on Monday 5 January. Please pack your belongings into them, clearly labelled with your name, by the end of Thursday.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Laptops should be taken home with you.

The new building has 40 parking spaces, fewer than we have now, so a permit is required. Request one from Dana Whitlock in Facilities. Permits are allocated first-come, first-served.

Thank you for your patience.

The Office Management Team
----- end of t06 text A -----

----- t06 text B (117 words) -----
Dear colleagues,

We move to our new offices on the third floor of 14 Kestrel Way on Friday 9 January; everyone works there from Monday 12 January.

Packing crates will arrive at every desk on Monday 5 January. Please pack and label your belongings with your name by the end of Thursday.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Take laptops home with you.

The new building has only 40 parking spaces, fewer than now, and a permit is required. Request one from Dana Whitlock in Facilities; permits are allocated first-come, first-served.

Thank you for your patience.

The Office Management Team
----- end of t06 text B -----

----- t06 text C (122 words) -----
Dear colleagues,

We move on Friday 9 January, and from Monday 12 January we will all work from our new third-floor office at 14 Kestrel Way.

Packing crates will be delivered to every desk on Monday 5 January. Please pack all your belongings and label the crates with your name by the end of Thursday 8 January.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down beforehand. Laptops should be taken home with you.

The new building has 40 parking spaces, so a permit is required. Request one from Dana Whitlock in Facilities. Permits are allocated first come, first served.

Thank you for your patience and cooperation.

The Office Management Team
----- end of t06 text C -----

----- t06 text D (125 words) -----
Dear colleagues,

We are moving to the third floor of 14 Kestrel Way. The move is on Friday 9 January, and everyone works from the new office from Monday 12 January.

Packing crates will arrive at every desk on Monday 5 January. Please pack your belongings, label each crate with your name, and have everything ready by the end of Thursday.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down before then. Take laptops home with you.

The new building has 40 parking spaces, fewer than we have now. A permit is required; request one from Dana Whitlock in Facilities. Permits are allocated first-come, first-served.

Thank you for your patience.

The Office Management Team
----- end of t06 text D -----

----- t06 text E (107 words) -----
Dear colleagues,

We are moving on Friday 9 January. From Monday 12 January we will work on the third floor of 14 Kestrel Way.

Packing crates will arrive at every desk on Monday 5 January. Please pack your belongings, labelled with your name, by the end of Thursday 8 January.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Take laptops home with you.

The new building has only 40 parking spaces, so a permit is required. Request one from Dana Whitlock in Facilities; permits are allocated first-come, first-served.

The Office Management Team
----- end of t06 text E -----

----- t06 text F (123 words) -----
Dear colleagues,

We move to our new home on the third floor of 14 Kestrel Way on Friday 9 January, and everyone works there from Monday 12 January.

Packing crates will arrive at every desk on Monday 5 January. Please pack your belongings and label each crate with your name by the end of Thursday 8 January.

IT will disconnect all desktop computers at 3 p.m. on Thursday 8 January, so save your work and shut down well before then. Take laptops home with you.

The new building has 40 parking spaces, fewer than we have now, and a permit is required. Request one from Dana Whitlock in Facilities; permits are allocated first-come, first-served.

Thank you for your cooperation.

The Office Management Team
----- end of t06 text F -----


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

----- t07 text A (140 words) -----
Dear customer,

Tallybook was unavailable on Tuesday 3 November from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption to your work.

The cause was an expired security certificate on our main database. The renewal reminder was sent to a mailbox that nobody was reading, and that was our failure.

No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have made two changes. Certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

As an apology, every affected account receives a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

Status and incident history are at status.tallybook.example.

Kind regards,
Mara Okafor
Head of Support
Tallybook
----- end of t07 text A -----

----- t07 text B (142 words) -----
Dear customer,

On Tuesday 3 November, Tallybook was unavailable from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption this caused you.

The cause was an expired security certificate on our main database. The renewal reminder went to a mailbox that nobody was reading. No data was lost, and invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have changed two things. Certificates now renew automatically, and expiry alerts go to the phone of the on-call engineer.

Your account will receive a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

You can find the status and incident history at status.tallybook.example.

Thank you for your patience.

Kind regards,

Mara Okafor
Head of Support
Tallybook
----- end of t07 text B -----

----- t07 text C (145 words) -----
Dear customer,

Tallybook was unavailable on Tuesday 3 November from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. I am sorry for the disruption.

The cause was a security certificate on our main database that expired. The renewal reminder went to a mailbox that nobody was reading. That was our failure.

No data was lost. Invoices scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have made two changes: certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

As an apology, every affected account receives a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

You can find the status and incident history at status.tallybook.example.

Thank you for your patience, and again, I am sorry.

Mara Okafor
Head of Support
Tallybook
----- end of t07 text C -----

----- t07 text D (155 words) -----
Dear customer,

On Tuesday 3 November, Tallybook was unavailable from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption, and we want to explain what happened.

A security certificate on our main database had expired. The renewal reminder went to a mailbox that nobody was reading. No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have changed two things. Certificates now renew automatically, and expiry alerts go to the phone of the on-call engineer.

Every affected account will receive a credit of 7 days on its subscription. It will be applied automatically by 10 November, so you do not need to do anything.

You can find the current status and incident history at status.tallybook.example.

Thank you for your patience, and we are sorry again for the trouble.

Mara Okafor
Head of Support
Tallybook
----- end of t07 text D -----

----- t07 text E (148 words) -----
Dear customer,

On Tuesday 3 November, Tallybook was unavailable from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption this caused you.

The cause was an expired security certificate on our main database. The renewal reminder went to a mailbox that nobody was reading, and that was our failure.

No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have made two changes. Certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

To make up for the outage, every affected account receives a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

You can see our status and incident history at status.tallybook.example.

Thank you for your patience.

Mara Okafor
Head of Support
Tallybook
----- end of t07 text E -----

----- t07 text F (145 words) -----
Dear customer,

Tallybook was unavailable on Tuesday 3 November from 09:12 to 11:47 UTC, a total of 2 hours 35 minutes. We are sorry for the disruption this caused to your work.

The cause was a security certificate on our main database that expired. The renewal reminder went to a mailbox that nobody was reading, and that was our failure.

No data was lost. Invoices that were scheduled to go out during the outage were sent at 12:05 UTC the same day.

We have changed two things: certificates now renew automatically, and expiry alerts go to the on-call engineer's phone.

Every affected account will receive a credit of 7 days on its subscription, applied automatically by 10 November. You do not need to do anything.

You can see the status and incident history at status.tallybook.example.

Once again, I apologise.

Mara Okafor
Head of Support
Tallybook
----- end of t07 text F -----


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

----- t08 text A (138 words) -----
Tidewater Tools, a family-owned Sheffield toolmaker, began offering to repair any tool it had ever made in March 2023, at a price that barely covers the work. In the first year sales of new tools fell 9% and profit fell by almost a third, but sales then grew 14% in the second year and have kept rising, because repaired tools hold their value and repair customers often buy again. The company now does about 11,300 repairs a year with nine staff. The main difficulty is parts: for tools made before 1990, drawings were lost or never kept, so staff are measuring old tools and drawing their parts, and fitters are hard to hire. Next, in spring 2027, Tidewater will open a second repair workshop in Leeds for saws and chisels, hoping to cut the queue to one week.
----- end of t08 text A -----

----- t08 text B (141 words) -----
Tidewater Tools, a family-owned Sheffield maker of woodworking hand tools, began repairing any tool it has ever made, at close to cost, in March 2023. Sales of new tools fell 9% in the first year and profit dropped by almost a third, but in the second year sales grew 14% and have kept rising, as repair customers proved likely to buy again. The repair room now handles about 11,300 repairs a year with nine staff. The main difficulty is parts: for tools made before 1990 many components no longer exist, so staff are measuring old tools and drawing the parts, and the company absorbs the extra cost of hand-made parts. Skilled fitters are also hard to find. Next, Tidewater will open a second repair workshop in Leeds in spring 2027 to cut the queue, and is weighing publishing its parts library.
----- end of t08 text B -----

----- t08 text C (147 words) -----
Tidewater Tools, a Sheffield toolmaker, began repairing any tool it has ever made in March 2023, charging prices that barely cover the work. Sales of new tools fell 9% in the first year of the programme, but rose 14% in the second and have kept growing since. The company now handles about 11,300 repairs a year, with a queue of just under three weeks. Its main difficulty is parts. For models made before 1990, a replacement part often does not exist, because designs changed often, records were poor and many original patterns were lost in a 1987 flood. Two of the nine repair staff spend most of their time measuring old tools and drawing their parts, building a catalogue of about 2,400 components. Next, Tidewater will open a second repair workshop in Leeds in spring 2027, and Helen Marsh is considering publishing the library of old parts.
----- end of t08 text C -----

----- t08 text D (140 words) -----
Tidewater Tools, a Sheffield toolmaker, began its repair programme in March 2023. It repairs any tool it has ever made, at close to cost. Sales of new tools fell 9% in the first year, then rose 14% in the second and have kept growing since, which the company credits partly to resale value and repeat buying. The company now handles about 11,300 repairs a year. The main difficulty is parts. Tools made before about 1990 often need parts that do not exist, because designs changed often, records were poor and many patterns were lost in a 1987 flood. Two of its nine repair staff now spend most of their time measuring old tools and drawing their parts. Next, the company will open a second repair workshop in Leeds in spring 2027 and is considering publishing its library of old parts.
----- end of t08 text D -----

----- t08 text E (136 words) -----
Tidewater Tools, a family-owned Sheffield toolmaker, began repairing any tool it has ever made, at close to cost, in March 2023. Sales of new tools fell 9% in the first year and profit dropped by almost a third, but sales then grew 14% in the second year and have kept rising, because repaired tools hold their value and repair customers come back to buy more. The company now does about 11,300 repairs a year. The main difficulty is parts: for tools made before 1990 the company often has no drawings, so staff are measuring old tools to build a catalogue of components, some of which must be machined by hand at extra cost to the company. In spring 2027 it will open a second repair workshop in Leeds, hoping to cut the queue to one week.
----- end of t08 text E -----

----- t08 text F (140 words) -----
Tidewater Tools, a Sheffield toolmaker, began repairing any tool it ever made, at close to cost, in March 2023. Sales of new tools fell 9% in the first year and profit dropped by almost a third, but sales then grew 14% in the second year and have kept rising, as repair customers proved about twice as likely to buy another tool. The repair room now does about 11,300 repairs a year and barely pays for itself. The main difficulty is parts: for tools made before 1990 the company often has no drawings, so staff are measuring old tools and building a catalogue of components, some machined by hand, with the company absorbing the extra cost. Next, Tidewater will open a second repair workshop in Leeds in spring 2027, handling saws and chisels, hoping to cut the queue to a week.
----- end of t08 text F -----


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

----- t09 text A (184 words) -----
Riverside Public Library: Änderungen ab dem 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, den 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines verliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können am Empfang verlängert werden. Bitte bringen Sie Ihren Ausweis und einen gültigen Lichtbildausweis mit. Sie können auch online verlängern, wenn sich Ihre Adresse nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im zweiten Stock wegen Renovierung bis zum 15. April geschlossen bleibt. In dieser Zeit stehen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text A -----

----- t09 text B (186 words) -----
Riverside Public Library: Änderungen ab 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, den 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines verliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können am Empfang verlängert werden. Bitte bringen Sie Ihren Ausweis und einen gültigen Lichtbildausweis mit. Sie können Ihren Ausweis auch online verlängern, wenn sich Ihre Anschrift nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im zweiten Stock wegen Renovierung bis zum 15. April geschlossen ist. In dieser Zeit stehen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie bitte an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text B -----

----- t09 text C (183 words) -----
Riverside Public Library: Änderungen ab 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, dem 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines verliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können am Empfang verlängert werden. Bitte bringen Sie Ihren Ausweis und einen gültigen Lichtbildausweis mit. Sie können auch online verlängern, wenn sich Ihre Anschrift nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im zweiten Obergeschoss wegen Renovierung bis zum 15. April geschlossen ist. In dieser Zeit stehen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text C -----

----- t09 text D (190 words) -----
Riverside Public Library: Änderungen ab dem 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, dem 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10:00 Uhr bis 19:00 Uhr und samstags von 10:00 Uhr bis 14:00 Uhr geöffnet. Sonntags und an gesetzlichen Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang können Sie jederzeit nutzen.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines ausgeliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können am Empfang verlängert werden. Bitte bringen Sie Ihren Bibliotheksausweis und einen gültigen Lichtbildausweis mit. Online können Sie Ihren Bibliotheksausweis ebenfalls verlängern, sofern sich Ihre Anschrift nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im zweiten Obergeschoss bis zum 15. April wegen Renovierungsarbeiten geschlossen ist. In dieser Zeit stehen Ihnen die Arbeitsplätze im Erdgeschoss zur Verfügung. Das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie an info@riverside-library.example oder wenden Sie sich an unser Personal.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text D -----

----- t09 text E (185 words) -----
Riverside Public Library: Änderungen ab 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, dem 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an gesetzlichen Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens 10 € pro Medium. Die Vormerkung eines entliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können Sie am Empfang verlängern. Bitte bringen Sie Ihren Bibliotheksausweis und einen gültigen Lichtbildausweis mit. Sie können den Bibliotheksausweis auch online verlängern, wenn sich Ihre Adresse nicht geändert hat.

Bitte beachten Sie: Der Lesesaal im zweiten Obergeschoss ist bis zum 15. April wegen Renovierungsarbeiten geschlossen. In dieser Zeit stehen die Arbeitsplätze im Erdgeschoss zur Verfügung, und das WLAN funktioniert im gesamten Gebäude.

Bei Fragen schreiben Sie an info@riverside-library.example oder wenden Sie sich an unser Personal.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text E -----

----- t09 text F (189 words) -----
Riverside Public Library: Änderungen ab dem 1. Februar 2026

Sehr geehrte Leserinnen und Leser,

ab Sonntag, dem 1. Februar 2026, ändern sich unsere Öffnungszeiten und Gebühren.

Die Bibliothek ist montags bis freitags von 10 bis 19 Uhr und samstags von 10 bis 14 Uhr geöffnet. Sonntags und an Feiertagen bleibt sie geschlossen. Die Rückgabebox am Haupteingang kann jederzeit genutzt werden.

Die Säumnisgebühr beträgt 0,50 € pro Medium und Tag, höchstens jedoch 10 € pro Medium. Die Vormerkung eines verliehenen Buches kostet 1 €. Die Mitgliedschaft bleibt für alle unter 18 Jahren kostenlos; Erwachsene zahlen 12 € pro Jahr.

Bibliotheksausweise, die im Januar ablaufen, können am Empfang verlängert werden. Bitte bringen Sie Ihren Bibliotheksausweis und einen gültigen Lichtbildausweis mit. Sie können Ihren Ausweis auch online verlängern, wenn sich Ihre Adresse nicht geändert hat.

Bitte beachten Sie, dass der Lesesaal im 2. Stock wegen Renovierung bis zum 15. April geschlossen ist. In dieser Zeit stehen die Lernplätze im Erdgeschoss zur Verfügung, und das WLAN steht im gesamten Gebäude zur Verfügung.

Bei Fragen schreiben Sie bitte an info@riverside-library.example oder sprechen Sie unser Personal an.

Wir freuen uns auf Ihren Besuch.

Ihr Bibliotheksteam
----- end of t09 text F -----


==================== t10 ====================

## Task 10: explanation for a layperson (file 10.txt)

Explain why a phone battery holds less charge after a few years. The reader is a phone owner with no technical background who asked: "Why does my phone die by 4 p.m. now?" Between 150 and 200 words. Say that heat speeds up the wear. End with exactly three practical tips as a numbered list (1., 2., 3.). Do not use the words "anode", "cathode", "electrolyte" or "SEI". Plain text, no heading.

----- t10 text A (189 words) -----
Your phone battery wears out a little with every charge, much like shoes wear down with every walk. Inside the battery, tiny chemical changes happen each time it charges and empties. Over hundreds of cycles, those changes build up and leave less room to store energy. The battery is not broken; it simply holds less than when it was new. So a phone that once lasted all day can run flat by 4 p.m.

Heat makes this wear much faster. A battery left in a hot car, on a sunny windowsill or under a pillow while charging ages quicker than one kept cool. Sitting at 100% for hours adds strain too. Older batteries also deliver power less smoothly, so a phone may shut down early even when the screen still shows some charge.

You cannot stop ageing, but you can slow it:

1. Keep the phone out of heat: no hot cars, direct sun, or thick cases while charging.
2. Avoid leaving it at 100% or fully empty for long; the middle range is gentler.
3. Turn on your phone's optimised or limited charging setting if it has one.
----- end of t10 text A -----

----- t10 text B (194 words) -----
A phone battery wears a little every time it is charged and used, a bit like shoe soles wear with every walk. Inside, slow chemical changes happen each time it fills and empties. Over hundreds of cycles, some of the material that stores energy gets used up or clogged, so the battery has less room to hold charge. After two or three years of daily use, it may hold only around 80% of what it did when new. That is why your phone, which once lasted all day, now gives up by 4 p.m.

Heat speeds up this wear. A warm battery ages faster, because the chemical changes that damage it run quicker as the temperature rises. A phone left on a car dashboard or charged under a pillow loses capacity sooner than one kept cool.

Three tips:

1. Keep your phone out of heat: no hot cars, no direct sunshine, and take off a thick case while charging.
2. Avoid draining it to zero or leaving it at 100% for hours; between 20% and 80% is gentler.
3. Turn on your phone's optimised charging setting, so it finishes just before you need it.
----- end of t10 text B -----

----- t10 text C (195 words) -----
Your phone battery works by moving tiny charged particles back and forth inside it, every time you charge it and use it. Over time, small amounts of the battery's inner material change or get stuck, so there is less room to store charge. A new battery might last all day, but after a few years the same battery simply holds less, which is why your phone now dies by 4 p.m.

Heat makes this wear happen faster. A phone left in a hot car, charged under a pillow or used for games while plugged in ages its battery much more quickly than one kept cool. Keeping the battery at very high or very low charge for long stretches also adds stress.

You can't stop the aging, but you can slow it:

1. Keep your phone cool: take it out of a thick case while charging and never leave it in direct sun or a hot car.
2. Avoid draining it to zero or sitting at 100% for hours; charging between roughly 20% and 80% is gentler.
3. Charge overnight with a slower charger when you can, and use fast charging only when you need it.
----- end of t10 text C -----

----- t10 text D (193 words) -----
A phone battery stores electricity in chemicals. Each charge and discharge slowly changes those chemicals, and some of the storing ability is lost for good. After a few years, the battery can hold noticeably less charge than it did when new.

The main cause is heat. Heat speeds up the wear, because the chemical changes happen faster when the battery is warm. A phone left in a hot car, charged under a pillow or running a demanding game gets hot, and each hot day takes a little more life from the battery. Fast charging also creates heat, so a warm phone wears out faster.

So a phone that dies by 4 p.m. is usually a worn battery that is being pushed hard by heat. Three things can help:

1. Keep the phone cool. Take a thick case off while charging, and do not leave it in sunlight or a hot car.
2. Turn on optimised charging if your phone offers it, so the battery does not sit at full charge for hours.
3. Lower the screen brightness and close apps you are not using, so the phone runs cooler and uses less power.
----- end of t10 text D -----

----- t10 text E (159 words) -----
Your battery stores energy by shuffling tiny charged particles back and forth, and every charge and discharge wears it down a little. After a few hundred full charges it can no longer hold as much as when it was new, so a phone that once lasted all day now gives up by 4 p.m.

Heat speeds up this wear. A phone left on a sunny dashboard, charged under a pillow or pushed through long games gets hot, and heat accelerates the chemical changes that permanently shrink the battery's capacity. Fast charging adds warmth too.

You cannot reverse the damage, but you can slow it:

1. Keep it cool: take off a thick case while charging and never leave it in a hot car or in direct sun.
2. Avoid extremes: aim to stay between about 20% and 80% charge when you can.
3. Use a regular charger overnight rather than a fast one, unless you are in a hurry.
----- end of t10 text E -----

----- t10 text F (190 words) -----
Think of your phone battery as a bottle that holds a little less every year. When the phone was new, the battery could store a full day's power. Each charge and each use causes small changes inside it. Over time, some of the material that stores the energy is used up or stops working well, so there is less charge to go around, and a phone that once lasted all day may now run out by 4 p.m.

Heat speeds up this wear. A battery that is warm for long periods ages faster than one kept cool. Warmth can come from direct sunlight, a hot room, demanding games or video, or a thick case that traps the heat. The same battery kept cooler can last noticeably longer.

Three habits can slow this down:

1. Keep the phone out of direct sun and off warm surfaces, such as a car dashboard.
2. Take off a thick case while charging, and avoid charging overnight under a pillow.
3. Keep the battery between about 20% and 80% charge where you can, rather than running it flat or keeping it full all the time.
----- end of t10 text F -----


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

----- t11 text A (167 words) -----
Title: Polyx-Oil still tacky after 4 days on oak table top (11 °C garage)

Project: 180 x 90 cm dining table top, oak, glued up from 5 boards. Sanded 80/120/180/240.

Finish: Osmo Polyx-Oil 3032 satin, two coats applied with a brush, 24 hours apart. On coat 2 I did not wipe off the excess because I ran out of rags.

Conditions: unheated garage at 11 °C, window shut. The tin says dry in 8-10 hours at 23 °C.

What happened: coat 1 felt dry the next morning. Coat 2 is still tacky after 4 days and fingerprints stay. Yesterday I wiped one corner with mineral spirits, and it now looks a bit dull there.

Deadline: needed by the 29th.

I would rather not buy another tin, so the options I see are waiting, moving the table indoors, or stripping it and starting over.

Question: given the thick second coat and the cold garage, which option is most likely to give a hard, dry finish by the 29th?
----- end of t11 text A -----

----- t11 text B (164 words) -----
Title: Osmo Polyx-Oil 3032 still tacky after 4 days on oak, what now?

Oak dining table top, 180 x 90 cm, glued up from five boards. Sanded 80/120/180/240 (was 240 too fine?).

Finish: Osmo Polyx-Oil 3032 satin, two coats 24 hours apart, applied with a brush. I did not wipe off the excess on coat 2 because I ran out of rags.

Conditions: unheated garage at 11 °C, window shut. The tin says dry in 8 to 10 hours at 23 °C.

What happened: coat 1 felt dry the next morning. Coat 2 is still tacky on day 4 and fingerprints stay. I wiped one corner with mineral spirits yesterday and it now looks a bit dull there.

I need it finished by the 29th. Options as I see them: wait, move it indoors, or strip it and start over.

Question: given the cold and the unwiped second coat, which of these options is most likely to get it cured and hard in time?
----- end of t11 text B -----

----- t11 text C (185 words) -----
Title: Osmo Polyx-Oil on oak table top still tacky after 4 days, unheated garage

Oak dining table top, 180 x 90 cm, glued up from five boards. I sanded to 80, 120, 180 and then 240 grit (I have read that 240 may be too fine, so I am asking about that too). I applied Osmo Polyx-Oil 3032 satin with a brush, two coats 24 hours apart. For coat two I did not wipe off the excess, because I had run out of rags.

Conditions: unheated garage at 11 °C, window shut. Coat one felt dry the next morning. Coat two is still tacky after four days, and fingerprints stay in it. The tin says dry in 8 to 10 hours at 23 °C. Yesterday I wiped a corner with mineral spirits, and it now looks dull there.

I need the table usable by the 29th. Options I have considered: wait longer, move the table indoors, or strip it and start again. I would rather not buy another tin.

Can it still cure if I move it indoors, or do I have to strip it?
----- end of t11 text C -----

----- t11 text D (186 words) -----
Title: Osmo Polyx-Oil on oak still tacky after 4 days in a cold garage

I'm finishing a dining table top (oak, 180 x 90 cm, glued up from 5 boards) and the finish will not cure.

Prep: sanded 80/120/180/240.
Finish: Osmo Polyx-Oil 3032 satin, two coats applied with a brush, 24 hours apart. I did not wipe off the excess on coat 2 because I ran out of rags.
Conditions: unheated garage, 11 °C, window shut. The tin says dry in 8-10 hours at 23 °C.
Result: coat 1 felt dry the next morning. Coat 2 is still tacky after 4 days, and fingerprints stay. Yesterday I wiped one corner with mineral spirits, and it now looks a bit dull there.

The table has to be finished by the 29th for a dinner, so I'm weighing three options: wait, move it indoors to warm up, or strip it and start over. I would rather not buy another tin.

Question: Given the thick unwiped second coat and the cold, is moving it indoors to warm up likely to cure it, or will I have to strip it?
----- end of t11 text D -----

----- t11 text E (147 words) -----
Title: Osmo oil on oak table still sticky after 4 days

Oak dining table top, 180 x 90 cm, glued up from five boards. Sanded with 80, 120, 180 and 240 grit (I read somewhere that 240 may be too fine). Finish: Osmo Polyx-Oil 3032 satin, two coats, 24 hours apart, applied with a brush. I did not wipe off the excess from coat 2, because I had run out of rags.

Conditions: unheated garage at 11 °C, window shut. Coat 1 was dry the next morning. Coat 2 is still tacky after four days, and fingerprints stay in it. The tin says dry in 8 to 10 hours at 23 °C.

Yesterday I wiped one corner with mineral spirits, and it looks a bit dull there now.

Will it cure if I move the table indoors, or do I need to strip it and start over?
----- end of t11 text E -----

----- t11 text F (149 words) -----
Title: Osmo Polyx-Oil 3032 on oak still tacky after 4 days (cold garage)

I am finishing an oak dining table top, 180 x 90 cm, glued up from 5 boards. I sanded 80/120/180/240 (was 240 too fine?).

Finish: Osmo Polyx-Oil 3032 satin, 2 coats applied by brush, 24 hours apart. On coat 2 I did not wipe off the excess because I ran out of rags.

Conditions: unheated garage, about 11 °C, window shut. The tin says dry in 8-10 hours at 23 °C.

What happened: coat 1 felt dry the next morning. Coat 2 is still tacky after 4 days and fingerprints stay. Yesterday I wiped one corner with mineral spirits and it looks a bit dull there now.

I need it ready for a dinner for 12 on the 29th. Options I see: wait, move it indoors, or strip it and start over. Which would you pick?
----- end of t11 text F -----


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

----- t12 text A (124 words) -----
Dear members,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come and have your say.

From 1 April, the annual membership fee rises from £35 to £40, the first increase in six years.

Priya Raman joins us as our new head coach and takes her first sessions in May.

To order new club kit for the summer, get your order to Jo, our kit secretary, by 28 February at the latest; the supplier will not accept late orders.

We need six volunteers for marshalling and refreshments at the summer tournament on Sunday 12 July. If you can spare a few hours, please speak to any committee member.

Best wishes,
The Committee
----- end of t12 text A -----

----- t12 text B (134 words) -----
Dear members and friends of Hollins Harriers,

Our Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come along and have your say.

The annual membership fee will rise from £35 to £40 from 1 April, the first increase in six years.

Priya Raman joins us as our new head coach and takes her first sessions in May.

If you want new club kit for the summer, Jo, our kit secretary, must receive your order by 28 February, as the supplier will not accept late orders.

We also need six volunteers to help with marshalling and refreshments at our summer tournament on Sunday 12 July. Please speak to any committee member if you can help.

With best wishes for the season,

The Committee
----- end of t12 text B -----

----- t12 text C (126 words) -----
Dear members and friends of Hollins Harriers,

Please come along to the Annual General Meeting on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. It is your chance to have your say.

The annual membership fee will rise from £35 to £40 from 1 April, the first increase in six years.

Priya Raman will be joining us as our new head coach, taking her first sessions in May.

Kit orders must reach Jo, our kit secretary, by 28 February, as the supplier will not accept late orders.

We need six volunteers for our summer tournament on Sunday 12 July, to help with marshalling and refreshments. Please speak to any committee member if you can help.

With best wishes,

The Committee
----- end of t12 text C -----

----- t12 text D (101 words) -----
Dear members,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come and have your say.

The annual membership fee rises from £35 to £40 on 1 April, the first increase in six years.

Priya Raman joins us as head coach and takes her first sessions in May.

Kit orders must reach Jo, our kit secretary, by 28 February; the supplier accepts no late orders.

We need six volunteers for marshalling and refreshments at our summer tournament on Sunday 12 July. Please speak to any committee member.

The Committee
----- end of t12 text D -----

----- t12 text E (124 words) -----
Dear members,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come and have your say.

The annual membership fee rises from £35 to £40 on 1 April, the first increase in six years.

Priya Raman joins us as our new head coach and takes her first sessions in May.

If you want new club kit for the summer, your order must reach Jo, our kit secretary, by 28 February; the supplier will not accept late orders.

Finally, our summer tournament is on Sunday 12 July and we need six volunteers for marshalling and refreshments. If you can spare a few hours, please speak to any committee member.

Best wishes,
The Committee
----- end of t12 text E -----

----- t12 text F (122 words) -----
Dear members,

The Annual General Meeting is on Friday 20 March at 7.30 p.m. in the main room at Hollins Community Hall. Please come and have your say.

The annual membership fee rises from £35 to £40 from 1 April, the first increase in six years.

Priya Raman joins us as our new head coach and takes her first sessions in May.

To order new club kit for the summer, get your order to Jo, our kit secretary, by 28 February at the latest; the supplier will not accept late orders.

We need six volunteers for marshalling and refreshments at our summer tournament on Sunday 12 July. If you can spare a few hours, please speak to any committee member.

The Committee
----- end of t12 text F -----
