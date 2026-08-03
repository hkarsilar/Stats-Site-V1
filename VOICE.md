# VOICE.md — the editorial law for StatsCapybara prose

**The goal in one line:** pages that read like one good lecturer wrote them over months — same person, different days — not one process in one pass.

This file is the standard for every sentence of prose on the site: lesson bodies, FAQ answers, guides, posters, tool-page copy, meta descriptions, and the injected strings in `checks.js` / `software.js` / `snippets.js`. The measuring stick is **`tools/prose-lint.js`**; its `PATTERNS` table mirrors the hard rules below — **if you change a hard rule here, change the table there in the same commit** (both files say so in comments). Voice is editorial judgment, not build health, so the linter is deliberately *not* part of `tools/audit.js`.

**The injected strings are measured too, since P39 run 13** (they used to be a prose surface nothing checked, and three consecutive refresh runs caught a British spelling in one only by reading the diff back). `prose-lint` scans four shared JS surfaces and enforces them at two levels: `checks.js` and `software.js` are ordinary site prose that happens to live in a `.js` file, so **every budget-0 rule applies**; the `#` comments in `snippets.js` and the `QUIPS` in `site.js` are held only to **rule 12 (British spellings)**, because a code comment is an annotation rather than paragraph prose and quips are exempt brand voice — but spelling is neither voice nor judgment. Other hits on those two surfaces are reported and not gated. Inspect one with `node tools/prose-lint.js --page assets/js/software.js`. Em-dashes there are reported without a budget: rule 1 is per *page*, and none of these are pages.

**Every page's own inline `<script>` is scanned too, since P39 run 14** — a fifth surface of **12,637 string literals**, larger than the other four combined. A lesson's interactive prints verdicts, chart labels, log lines and interpretation sentences straight to the reader, and `quiz.html`'s 208-question bank lives there as well; none of it reaches the page-prose scanner, which strips `<script>` before counting a word. Run 14's own defect was a cleaning-log line reading `standardise_group()` beneath a checkbox labeled "Standardize categories". Enforcement is **rule 12 only** (a chart axis label is not paragraph prose); everything else is reported. Inspect it with `node tools/prose-lint.js --page inline-scripts`. Two properties of this surface are load-bearing and should survive any edit: the spelling scan reads **every** literal while the prose-like filter gates only the *other* patterns, and it matches on **letter boundaries rather than `\b`** — `\bstandardise\b` does not fire inside `standardise_group`, because `_` is a word character.

**And `glossary-data.js` is scanned since P39 run 25** — 273 definitions in the site's own voice, which until then no linter read at all, since the page scanner sees only the empty shell `glossary.html` renders into. Run 25 typed a British spelling into a new entry and caught it by eye; on its first run the surface found `unlabelled` in the k-means definition. Rule 12 only: a dictionary entry is not paragraph prose, so its dash rate is reported without a budget.

Background: the site's first draft was written by one AI in one style in two weeks. The prose is accurate and warm, but its constructions repeat with machine regularity — a median of 24 em-dashes per lesson, ~80 FAQ answers opening with a verdict word, a "Here's the twist" in every third lesson. A reader who spots the pattern discounts everything else, statistics included. These rules exist to add *variance*, not to sand the personality off.

---

## HARD RULES (lintable budgets — `prose-lint.js --strict` enforces these)

1. **Em-dashes: ≤ 10 per page of prose** (lesson body, guide, or tool page — the FAQ block is budgeted separately). A human editor uses a handful per page; the em-dash is fine, the *frequency* is the tell.
2. **Em-dashes in FAQ answers: ≤ 1 per answer on average** (lint: ≤ 3 across a lesson's three answers).
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

## SOFT RULES (judgment — no linter, but they're the actual work)

- **Vary sentence length within a paragraph.** Let a plain declarative sentence exist without a twist. Two short sentences in a row are allowed. So is one long one.
- **Not every list needs exactly three items.** Two is fine. Four is fine. The rule-of-three cadence is one of the strongest machine tells on the site.
- **Not every contrast needs a dash.** Commas, parentheses, a new sentence, or actual restructuring all work. Pick differently each time.
- **Openers within a course must not share a template.** Open some lessons with a definition, some with a concrete scenario, some with a number, some with a student's actual question. Read a course's opening paragraphs consecutively as the check.
- **The three FAQ answers on one page should not all open the same way.**
- **Prefer deleting a flourish to replacing it.** Word count should go DOWN in an editing pass. The shortest fix for a keynote sentence is usually no sentence.

## ANTI-RULES (overcorrection is also a tell)

- **Don't swap every em-dash for a semicolon.** A semicolon plague is worse than the disease. Most cut dashes should become commas, periods, or nothing.
- **Don't strip the warmth or the capybara personality.** The site is calm and kind on purpose. De-templating is not de-humanizing.
- **Quips are exempt brand voice.** The sidebar capybara one-liners in `site.js`'s `QUIPS` play by their own rules — leave their style alone.
- **The injected emoji block headers ("🧠 Do you want to check your understanding?", "🖱️ Run it in SPSS / JASP", "📝 Write it up (APA 7)") are site chrome, not prose.** Leave them.
- **Never touch the substance.** No verified number, statistical claim, formula, code block, element id/class/anchor, link target, or interactive changes in a voice pass. If a factual sentence gets rewritten, the fact survives with identical meaning.

## The read-aloud test

Before shipping a page, read one paragraph aloud. If it sounds like a keynote — building to a reveal, punching every contrast, announcing its own point — flatten it until it sounds like a person explaining something they know well to someone they like.
