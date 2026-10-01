# VOICE.md — the editorial law for StatsCapybara prose

**The goal in one line:** pages that read like one good lecturer wrote them over months — same person, different days — not one process in one pass.

This file is the standard for every sentence of prose on the site: lesson bodies, FAQ answers, guides, posters, tool-page copy, meta descriptions, and the injected strings in `checks.js` / `software.js` / `snippets.js`. The measuring stick is **`tools/prose-lint.js`**; its `PATTERNS` table mirrors the hard rules below — **if you change a hard rule here, change the table there in the same commit** (both files say so in comments). Voice is editorial judgment, not build health, so the linter is deliberately *not* part of `tools/audit.js`. Since P106 the script's `MANNER` table also mirrors the round-three catalog at the end of this file, under the same rule.

**The injected strings are measured too, since P39 run 13** (they used to be a prose surface nothing checked, and three consecutive refresh runs caught a British spelling in one only by reading the diff back). `prose-lint` scans four shared JS surfaces and enforces them at two levels: `checks.js` and `software.js` are ordinary site prose that happens to live in a `.js` file, so **every budget-0 rule applies**; the `#` comments in `snippets.js` and the `QUIPS` in `site.js` are held only to **rule 12 (British spellings)**, because a code comment is an annotation rather than paragraph prose and quips are exempt brand voice — but spelling is neither voice nor judgment. Other hits on those two surfaces are reported and not gated. Inspect one with `node tools/prose-lint.js --page assets/js/software.js`. **Their em-dashes went unbudgeted until P73** on the reasoning that rule 1 is per *page* and none of these are pages; what that actually bought was ~1,070 unmeasured em-dashes, more than the whole page corpus carried. Rule 13 gives each surface an absolute budget instead.

**Every page's own inline `<script>` is scanned too, since P39 run 14** — a fifth surface of **12,637 string literals**, larger than the other four combined. A lesson's interactive prints verdicts, chart labels, log lines and interpretation sentences straight to the reader, and `quiz.html`'s 208-question bank lives there as well; none of it reaches the page-prose scanner, which strips `<script>` before counting a word. Run 14's own defect was a cleaning-log line reading `standardise_group()` beneath a checkbox labeled "Standardize categories". Enforcement is **rule 12 only** (a chart axis label is not paragraph prose); everything else is reported. Inspect it with `node tools/prose-lint.js --page inline-scripts`. Two properties of this surface are load-bearing and should survive any edit: the spelling scan reads **every** literal while the prose-like filter gates only the *other* patterns, and it matches on **letter boundaries rather than `\b`** — `\bstandardise\b` does not fire inside `standardise_group`, because `_` is a word character.

**And `glossary-data.js` is scanned since P39 run 25** — 273 definitions in the site's own voice, which until then no linter read at all, since the page scanner sees only the empty shell `glossary.html` renders into. Run 25 typed a British spelling into a new entry and caught it by eye; on its first run the surface found `unlabelled` in the k-means definition. Rule 12 governs its prose patterns — a dictionary entry is not paragraph prose — but since P73 its em-dashes are budgeted under rule 13 like every other injected surface.

Background: the site's first draft was written by one AI in one style in two weeks. The prose is accurate and warm, but its constructions repeat with machine regularity — a median of 24 em-dashes per lesson, ~80 FAQ answers opening with a verdict word, a "Here's the twist" in every third lesson. A reader who spots the pattern discounts everything else, statistics included. These rules exist to add *variance*, not to sand the personality off.

**Round two (P73, 15 Aug 2026).** Phase 10 closed on its own numbers: every banned construction reads 0 today and every page passed its budget. The site still read AI-made, and the re-measurement showed why. The budgets had been set where the corpus could reach rather than where a human editor lands, so pages migrated to the cap and stayed there (lesson median 6, six pages at exactly 10, short tool pages at 18–34 per 1,000 words). Five prose surfaces had no dash budget at all, and between them carried ~1,070 more. The shape tells, bold-lead bullet lists and the rule-of-three cadence, were named in the soft rules and measured by nothing. So the rules below tightened, the injected surfaces got budgets, and three shape metrics now get reported without being gated. `--strict` failed by design from P73 until **P77 finished the paydown on 17 Aug 2026**, since when it has been green and a failure means a regression rather than a phase in progress; `tools/audit.js` remains the commit gate throughout.

---

## HARD RULES (lintable budgets — `prose-lint.js --strict` enforces these)

> **Budgets are ceilings, not targets.** Phase 10 met every one of them and the site still read AI-made, because a corpus told "≤ 10" migrates to 10 and parks there: on 15 Aug 2026 six pages sat at exactly the cap and the lesson median was 6. The linter now prints the median and an at-the-cap count beside every budget for exactly this reason. Aim at the median, not the ceiling. A page with one em-dash has not underspent its allowance.

1. **Em-dashes: ≤ 4 per page of prose, AND ≤ 8 per 1,000 words of that page** (lesson body, guide, tool page, course landing page or hub; the FAQ block is budgeted separately by rule 2). Both clauses gate; a page's effective ceiling is the smaller. The rate clause exists because the flat cap alone is a rich allowance on a short page: `descriptives.html` carried 10 em-dashes in 291 words, and ≤ 4 there would still be triple a human technical editor's rate. The allowance is floored, with a minimum of 1, so a very short page is never gated to zero. The em-dash is fine; the *frequency* is the tell.
2. **Em-dashes in FAQ answers: ≤ 1 across a lesson's three answers combined.** Three answers averaging one dash each is the reflex this rule was written against, so the trio gets one between them.
3. **The contrast punch: zero.** "isn't just X — it's Y", "wasn't X — it was Y", and the "it's not about X — it's Y" cousins. Say the true thing directly; you don't need the pivot.
4. **The "Here's the …" setup: zero.** "Here's the thing / why / how / twist / catch / intuition" — all of it. If the next sentence is worth reading, it doesn't need a drumroll.
5. **"The point is": zero.** If the point needs announcing, the paragraph buried it — fix the paragraph.
6. **"That's the whole point / lesson / job": zero.**
7. **FAQ answers must not open with "No — " or "Yes — ".** State the actual fact first ("Age in years is ratio data…"), then qualify. A bare "No." as a complete first sentence is fine occasionally — it's the verdict-plus-dash reflex that's banned.
8. **"Think of it as": ≤ 3 sitewide.** One analogy move, rationed.
9. **"quietly" as an intensifier: zero.** ("quietly does the heavy lifting", "quietly assumes…") The lint counts *every* "quietly", so reword literal uses too — "silently", "without warning", or just cut it.
10. **"Notice how / Notice that": ≤ 1 per page.** Pointing at your own chart once is teaching; three times is a tour guide.
11. **Meta descriptions built on "…and watch…": ≤ 15% of pages.** It was a good formula; forty copies of it is a fingerprint.
12. **British spellings: zero.** The site is American English throughout (`behavior`, `color`, `center`, `analyze`, `standardize`, `modeling`, `artifact`, `gray`). **Since P39 run 16 this is matched by shape, not by memory.** Five refresh runs each found another survivor that the previous hand-written inventory did not contain — run 14's `capitalisation`, run 16's `editorialise`, `parenthesised` and `unlabelled` — because the inventory had the polarity backwards: the words that legitimately end in `-ise`/`-our` are a small **closed** class (surprise, exercise, four, hour), while the words that should end in `-ize`/`-or` are **open**, since any author can coin *editorialize*. So `prose-lint.js` now matches those two classes **generatively** and allow-lists their exceptions (`ISE_OK` / `OUR_OK`, plus the `-aise`/`-oise`/`-uise`/`-wise` families and ordinary prefixes, so *raising*, *listwise* and *unsupervised* pass), and keeps an inventory only for `-re`, doubled consonants, the `-ce` nouns and one-offs, which genuinely cannot be generalized. Inventory entries of 6+ characters also match as a **suffix**, so `unlabelled`, `kilometres` and `epicentre` are caught without listing every prefix. On the run that introduced it, the generative half found **ten** British spellings across nine files that seven runs of inventory-keeping had missed. Two forms stay deliberately allowed and must stay allowed: **`analyses`**, which is also the American plural of *analysis* (a substring sweep once turned it into "analyzes" seven times), and **`enrolled`/`enrolling`/`programmed`/`analogue`**, which are already correct American forms. `-iser`/`-isers` is deliberately not matched: *Kaiser*, *adviser*, *miser* and *riser* are all legitimate. Code literals are out of scope by construction — the linter reads rendered prose, so `color = "grey"` inside a ggplot snippet is left alone.

13. **Em-dashes on the injected surfaces (P73).** Rule 1 is per page and these are not pages, so each gets an absolute budget, gated in `--strict` from now on: **`checks.js` ≤ 50** (203 on 15 Aug 2026), **`software.js` ≤ 15** (66), **`glossary-data.js` ≤ 30** (127), **the inline-`<script>` string literals ≤ 130** (521), **`snippets.js` comments ≤ 5** (5, already there). These are the strings a student actually reads: a check's "why", an SPSS tip, a glossary definition, a lesson interactive's verdict line. Leaving them unbudgeted hid more em-dashes than the entire page corpus carried. **P77 paid all five down on 17 Aug 2026 and they now sit at 37 / 12 / 22 / 80 / 5**, under every ceiling rather than parked on one — which is the reading rule for this table: the numbers in brackets are where the corpus started, not where it should return to. **`QUIPS` are exempt**, permanently: the anti-rule below makes the capybara one-liners brand voice, so their count is reported and never gated. Rule numbers 1–12 are cited by number in `CLAUDE.md` and in `prose-lint.js`, which is why this is 13 rather than an insertion.

## MEASURED, NOT GATED (report-only metrics: read them, don't optimize them)

`prose-lint.js` reports three things it deliberately does not enforce. Each is a judgment call where a threshold would just teach the next session to write around the number, which is `faq-audit.js`'s standing precedent.

- **Bold-lead bullets** (`<li><strong>Term:</strong> explanation`). **447 across lessons and guides on 15 Aug 2026**, on 81 of 102 pages. It is the shape a generated corpus reaches for whenever it has three related things to say, and no budget can see it: a page built entirely out of them passes every hard rule. Not gated, because the shape is genuinely right sometimes — a rundown of named things reads better bolded. The soft rule is the real instruction: **where every list on a page is a bold-lead list, recast some as plain sentences, fold some into prose, and keep the ones a reader would actually scan.** `node tools/prose-lint.js --bold` is the worklist. (The Phase 16 addendum's hand count of 403 came from an ad-hoc scan whose definition was not recorded; the linter's definition — an `<li>` whose first element is a `<strong>` — is stated in the script and returns 447. Future comparisons use that one.)
- **Cross-page duplicate passages**, an 8-word run of prose appearing on two different pages. **49 on 15 Aug 2026**, and most are honest: a cheat poster mirrors `which-test.html`'s decision tree on purpose, and a page naming another page's title matches its title. A handful are real repeats worth varying (`power.html` and `stats-3/power-analysis-for-complex-designs` share "halving the effect you're chasing roughly quadruples the sample you need"). `node tools/prose-lint.js --duplicates`.
- **Semicolons and ellipses per page**, the overcorrection watch. See the anti-rules.

## WHAT NOT TO BUILD (P73, measured before deciding)

**No generic "AI word" inventory.** The obvious next checker is a list of words that supposedly mark machine prose. This corpus was measured against one on 15 Aug 2026 and it does not apply: **delve 0, "worth noting" 0, "keep in mind" 0, "at its core" 0, crucial 7, journey 4** — and the two words such a list flags hardest are ordinary statistics vocabulary here: **leverage (54×)**, as in high-leverage points, and **robust (42×)**, as in robust standard errors. A word list would fire on the site's subject matter and stay silent on its actual tells.

This is rule 12's polarity lesson generalized, and it is the standing instruction for any future checker: **measure a candidate against this corpus, in context, before writing a rule about it, and prefer a shape rule to a word list.** Every check that has earned its place here keys on shape or on frequency (dash rate, sentence templates, bold-lead lists, repeated shingles); every hand-kept inventory this repo has tried has failed on the word nobody thought to list.

## SOFT RULES (judgment — no linter, but they're the actual work)

- **Vary sentence length within a paragraph.** Let a plain declarative sentence exist without a twist. Two short sentences in a row are allowed. So is one long one.
- **Not every list needs exactly three items.** Two is fine. Four is fine. The rule-of-three cadence is one of the strongest machine tells on the site.
- **Not every list needs to be a list, and not every item needs a bolded head.** `<li><strong>Term:</strong> explanation` three times in a row is a table pretending to be prose. Some of those items are sentences; some belong in the paragraph above them. See the bold-lead metric above.
- **Not every contrast needs a dash.** Commas, parentheses, a new sentence, or actual restructuring all work. Pick differently each time.
- **Openers within a course must not share a template.** Open some lessons with a definition, some with a concrete scenario, some with a number, some with a student's actual question. Read a course's opening paragraphs consecutively as the check.
- **The three FAQ answers on one page should not all open the same way.**
- **Prefer deleting a flourish to replacing it.** Word count should go DOWN in an editing pass. The shortest fix for a keynote sentence is usually no sentence.

## ANTI-RULES (overcorrection is also a tell)

- **Don't swap every em-dash for a semicolon.** A semicolon plague is worse than the disease. Most cut dashes should become commas, periods, or nothing. **Since P73 this is measured rather than trusted:** the report prints per-page semicolon and ellipsis counts with no budget attached, so a paydown pass can be checked for having actually removed the tell instead of relocating it. The 15 Aug 2026 baseline is **549 semicolons** (lesson median 3) and **33 ellipses** (lesson median 0) across 136 pages. A pass that cuts 200 em-dashes and adds 200 semicolons has done nothing, and now it says so.
- **Don't strip the warmth or the capybara personality.** The site is calm and kind on purpose. De-templating is not de-humanizing.
- **Quips are exempt brand voice.** The sidebar capybara one-liners in `site.js`'s `QUIPS` play by their own rules — leave their style alone.
- **The injected emoji block headers ("🧠 Do you want to check your understanding?", "🖱️ Run it in SPSS / JASP", "📝 Write it up (APA 7)") are site chrome, not prose.** Leave them.
- **Never touch the substance.** No verified number, statistical claim, formula, code block, element id/class/anchor, link target, or interactive changes in a voice pass. If a factual sentence gets rewritten, the fact survives with identical meaning.

## The read-aloud test

Before shipping a page, read one paragraph aloud. If it sounds like a keynote — building to a reveal, punching every contrast, announcing its own point — flatten it until it sounds like a person explaining something they know well to someone they like.

---

## Round three (P106): the Opus 5 voice

Phases 10 and 16 removed the older tells, and the hard rules above are still green. The site still reads as machine-written, because most of it was written by Claude Opus 5, and that model has habits the hard rules do not measure. This section describes those habits. Phase 20 (P107–P121) removes them. Every session in that phase copies this section, so it is written in the voice it asks for.

### What mannered prose is

Anthropic's prompting guide for Claude Fable 5.1 names the problem. Mannered prose "substitutes metaphor and flourish for direct statement", as in "a dial worth turning" written where "a parameter worth varying" was meant. The guide's fix is one line, and it is the instruction for this whole round: "Please remove all mannered prose."

On this site the problem is rarely a famous word. "Load-bearing" appears once and "delve" never. It is a handful of moves repeated across a hundred lessons: an evaluative adjective where a fact belongs, a sentence that announces a point before making it, a comment added to the end of a sentence, a number described as an object that sits somewhere or a test described as a person who wants something, and sentences that run past 35 words.

### The catalog

`node tools/prose-lint.js --manner` counts entries 1, 2, 3, 6 and 7, and the word "nobody" from entry 4, using the `MANNER` table in the script. That table mirrors this catalog. If you change an entry here, change the table in the same commit, and the other way round. Entry 10 is measured as sentence length. The other entries have no shape a regular expression can find, so they are judgment.

Every pattern was measured before it was listed. For each one, a seeded random sample of its hits was read in context, and the pattern stayed only if at least two thirds of the sample was the habit and not ordinary statistical English. The comment beside each pattern in the script records its sample. Three candidates failed and are judgment only: ", not Y." and "rather than" (about half their hits carry a contrast the sentence needs, such as "two coins have four outcomes, not three"), and "a reader" (18 of 20 hits mean the reader of the student's paper, the one use this file keeps). On 1 Oct 2026 the linter counted 1,794 catalog hits in 342,810 words, 5.2 per 1,000.

| # | Habit | Example from the site | Plain version |
|---|---|---|---|
| 1 | Stock evaluatives: honest/honestly, genuine/genuinely, earns its place or keep, "the real X", and worth + -ing used as a signpost ("worth knowing", "worth pausing on") | "When the carryover is severe enough, the honest fix is a between-subjects design." (stats-2/repeated-measures-anova) | "When the carryover is severe enough, use a between-subjects design." |
| 2 | Pseudo-cleft reveals: "X is what makes Y", "that's exactly what…", "is the one thing that…" | "That is what buys the precision: the between-group variation is removed from the sampling error rather than left in it." (FAQ, stats-1/producing-data-and-sampling-design) | "Stratifying improves precision because it removes the between-group variation from the sampling error." |
| 3 | Trailing commentary: a sentence that ends ", which is why…", ", which is exactly…", ", which is the check that…" | "The curve is steep at the top, which is why the last stretch of collinearity does so much more damage than the first." (stats-2/multicollinearity-and-variable-selection) | "The curve is steep at the top. Raising R²ⱼ from .90 to .99 takes the VIF from 10 to 100, while raising it from 0 to .50 takes it only from 1 to 2." |
| 4 | Slogan closers: a last line that restates the paragraph as something quotable. The linter counts "nobody", the word many of them turn on ("a study nobody ran") | "…so a clustering is never proof that groups exist. Clusters are hypotheses, not facts." (ml/clustering-kmeans) | Delete the second sentence. The first one already says it. |
| 5 | Negative-parallel tails: ", not Y." and "rather than Y" where the contrast is decoration | "The theorem is generous, not unconditional. It asks that the population have a finite variance…" (stats-1/central-limit-theorem) | "The theorem has one condition: the population must have a finite variance." |
| 6 | Physical metaphors for statistics: values that sit or land, problems that hand you things, designs that buy or pay, numbers that carry a claim | "The three condition means sit at 41, 50 and 59 against a grand mean of 50" (stats-2/repeated-measures-anova) | "The three condition means are 41, 50 and 59, and the grand mean is 50" |
| 7 | Personified tests and software: a test that cares, a formula that rewards, software that wants | "The formula rewards length, so you can always crank α up by padding the scale" (methods/reliability-and-validity) | "α rises with the number of items, so you can always push it up by adding more of them" |
| 8 | Labels before definitions: a coined name used before the student knows what it refers to | "tight studies (small standard errors, from the usual n law) dominate" (stats-3/meta-analysis) | "studies with small standard errors, which are usually the large ones, dominate" |
| 9 | Orbit-then-reveal: the paragraph's point held back to its last sentence | "Most parametric tests care about how far apart values are. Rank-based tests only care about order… Its ability to distort the result evaporates. That robustness to outliers and skew is the whole appeal." (stats-2/non-parametric-alternatives) | Open with the point: "Rank-based tests resist outliers and skew because they use only the order of the values. Replace [2, 5, 9, 400] with their ranks [1, 2, 3, 4] and the 400 becomes simply the largest value, so it can no longer distort the result." |
| 10 | Over-long sentences: 35 words or more, several clauses, one idea per clause | "Before any of that can happen the studies have to be on one scale, which usually means converting each result to a common effect size first; the effect-size converter handles the arithmetic when a literature reports a mix of d, r and odds ratios." (44 words, stats-3/meta-analysis) | "First, the studies have to be on one scale. That usually means converting each result to a common effect size. If a literature reports a mix of d, r and odds ratios, the effect-size converter does the arithmetic." |
| 11 | "A reader" where the site means "you" | "And the ordinary least squares estimate beside the two-stage one, so a reader can see how far apart they are and in which direction." (guides/reading-a-causal-paper, where the student is the one reading) | "…so you can see how far apart they are and in which direction." |
| 12 | Narrating the site: how a page or widget was built or checked, which the student does not need | "All three live on the tables page, generated by counting rank orders rather than copied out of a book, next to a lookup drill…" (stats-2/non-parametric-alternatives) | "All three are on the tables page, next to a lookup drill…" |

Two exceptions to entry 1. "Honestly significant difference" is Tukey's HSD, a technical term, and the linter skips it. In the Ethics course honesty is often the subject ("an honest mistake", or an honest design set against a deceptive one), so the linter counts only the evaluative frame "the honest X is" there. Keep the uses that are about honesty.

### Exemplars

Real sentences from the site with a plain version of each. Every rewrite keeps the fact of the original. The first ten come from the Phase 20 addendum in ROADMAP.md; the last four were added in P106.

| Before | After |
|---|---|
| "Red tiles are the lies your data just told you." (stats-2/post-hoc-tests, viz) | "Each red tile is a false positive." |
| "Six comparisons is what you pay for arriving at the data with no question. Most studies arrive with one or two." (stats-2/post-hoc-tests) | "Four groups give six possible pairs, but most studies are designed to answer one or two specific questions." |
| "This is the practical dividend the omnibus table pays. A comparison between two groups of four is tested on 12 degrees of freedom rather than 6, because MS_E was estimated from all sixteen seedlings." (stats-2/post-hoc-tests) | "Because MS_E comes from all sixteen seedlings, a comparison between two groups of four gets 12 degrees of freedom. Its own two groups would give only 6." |
| "…halving the two-tailed p to .00004 is honest arithmetic." (stats-2/post-hoc-tests) | "…so you may halve the two-tailed p to get .00004." |
| "The typography is APA's and the substance is everyone's." (FAQ, writing/reporting-statistics-apa) | "APA sets the formatting. What you must report is the same under any style guide." |
| "Centering it on the cutoff is what makes the treatment indicator's coefficient read as the jump at the threshold rather than a gap somewhere nobody stands." (glossary, Running variable) | "Center it at the cutoff so that the treatment coefficient is the jump at the threshold. Uncentered, with separate slopes on each side, that coefficient is the gap at a score of zero, which may be far from any real data." |
| "Of all the causal designs, this is the one whose output looks least like an achievement. A policy arrived in some places and not others…" (stats-3/difference-in-differences) | Delete the first sentence. The paragraph starts at "A policy arrived in some places and not others…" |
| "Add all four together and you get 70.6, the treated group after, which is the check that the model has spent every number on something." (stats-3/difference-in-differences) | "Add all four and you get 70.6, the treated group's mean after the switch. So the four coefficients reproduce all four cell means." |
| "One link is a semester of students." (teachers.html) | "Put one lesson link in your syllabus and every student can use it." |
| "You can, and the answer is usually humbling." (FAQ, stats-1/correlation) | "You can, but two correlations usually have to be far apart before the test finds a difference." |
| "Nobody picks β. It falls out of three things at once: how big the real effect is, how variable the measurement is, and how much data you gathered." (stats-1/hypothesis-testing-logic) | "You do not set β directly. It depends on three things: how big the real effect is, how variable the measurement is, and how much data you gathered." |
| "Adjusted R² charges rent for every predictor, so it only rises when a variable earns its keep." (stats-2/multiple-regression) | "Adjusted R² subtracts a penalty for each predictor, so adding a predictor raises it only if that predictor's t is larger than 1 in absolute value." |
| "The interval around that 67% is honest arithmetic on a number that is 27 points from the truth." (stats-1/producing-data-and-sampling-design) | "The interval around that 67% is computed correctly, but the 67% itself is 27 points from the truth." |
| "Tiny effects are genuinely hard to detect." (stats-3/effect-size-and-power) | "Tiny effects are hard to detect." |

Two moves do most of the work. The sixth and twelfth rows show the more important one: the metaphor ("somewhere nobody stands", "earns its keep") was hiding a real fact, and the rewrite states the fact. The seventh and last rows show the more common one: delete the flourish and keep the sentence that was already there.

A bad rewrite of the fourth row looks like one of these:

- Relocation: "…halving the two-tailed p to .00004 is fair arithmetic." The habit is still there.
- Overcorrection: "Halve it. .00004. Done." Fragments are a tic too.
- Reformatting: the paragraph turned into three bullets with bold lead-ins. That is the next model's habit.

### Three anti-rules for this round

Do not move a tic into a synonym. Swapping honest for fair, sits for lies, "is what makes" for "is how", genuinely for truly, or "rather than" for "instead of" leaves the habit in place, because the habit is the sentence and not the word. If the sentence needed the word, keep it. If it did not, cut it. The `--manner` report has a relocation-watch line that counts these synonyms, so a pass that only swaps words shows up there.

Do not add bold lead-ins or new bullet lists. The bold lead-in bullet is Opus 5.5's own measured habit, and the sessions that run Phase 20 may be Opus 5.5. A paragraph rebuilt as three bolded bullets has traded one habit for another, and `--bold` should not go up.

Do not overcorrect. No sentence fragments for effect, no slang or forced casualness ("basically", "super", "pretty much"), and no exclamation marks. The site stays calm and warm, and the capybara and the quips stay as they are.

### Sentence length (soft rule)

A lesson's mean should end at 18 words per sentence or less. A sentence over about 35 words gets split unless it is a list or a formula. Keep the lengths varied, because a page made only of short sentences is its own tic.

`--manner` counts a word as any token that holds a letter or a digit, and a sentence as a run of text that ends in . ! ? or : and holds at least two real words, so headings, labels, table cells and formula steps drop out. Measured that way on 1 Oct 2026, the plainer older lessons average 12 to 15 words per sentence (types-of-data 11.9, variables-and-operationalization 13.5, data-cleaning-workflow 14.4). The densest lessons average 22 to 24 (difference-in-differences 23.7, quasi-experiments 23.6, cross-validation-and-overfitting 23.0, psychometric-functions 22.9, meta-analysis 22.2), and the Phase 17–19 pages the addendum named measure 19.7 to 23.7 (one-way-anova 19.7, multiple-regression 20.6, repeated-measures-anova 21.1, factor-analysis-pca 21.3, difference-in-differences 23.7). The lesson median is 18.0, and 51 of the 105 lessons are above 18. FAQ answers average 23.1 words per sentence, more than any other surface. The Phase 20 addendum's scratch figures were higher (14–16 and 23–32) because that script split the flattened page text only at full stops, so headings, labels and table cells ran into the next sentence and symbols such as "=" counted as words. Re-running that method reproduces them (types-of-data 14.3, teachers.html 34.8). Use the linter's figures from now on.

### Who the site talks to

The site talks to the student, as "you". Write "so you can see how far apart they are", not "so a reader can see". "A reader" is right only when it means the reader of the student's paper, as in "the effect size tells the reader how big the difference is" in a lesson on writing results.

### The planning docs

ROADMAP.md and PROMPTS.md are internal notes, much of them written in the voice this round removes. They are never a style model for site prose.

### Commands

```bash
node tools/prose-lint.js --manner                    # sitewide summary, lesson medians, worst 30
node tools/prose-lint.js --manner --page <path>      # every hit on one page and its own surfaces, plus its long sentences
node tools/prose-lint.js --manner --all              # one row per page, for before/after tables
node tools/prose-lint.js --manner --sample <id>      # a seeded sample of one pattern's hits, to re-measure it
```

`--page` takes a page path (`stats-1/central-limit-theorem`, `problems.html`) or a surface (`tools/faq_data.py`, `assets/js/checks.js`, `assets/js/software.js`, `assets/js/glossary-data.js`, `assets/js/snippets.js`, `inline-scripts`). For a lesson it also shows the lesson's FAQ answers, checks, software entry, snippet comments, the glossary entries that link back to it, and the prose its inline script prints. Nothing in `--manner` gates `--strict`.
