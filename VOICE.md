# VOICE.md — the editorial law for StatsCapybara prose

**The goal in one line:** pages that read like one good lecturer wrote them over months — same person, different days — not one process in one pass.

This file is the standard for every sentence of prose on the site: lesson bodies, FAQ answers, guides, posters, tool-page copy, meta descriptions, and the injected strings in `checks.js` / `software.js` / `snippets.js`. The measuring stick is **`tools/prose-lint.js`**; its `PATTERNS` table mirrors the hard rules below — **if you change a hard rule here, change the table there in the same commit** (both files say so in comments). Voice is editorial judgment, not build health, so the linter is deliberately *not* part of `tools/audit.js`.

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
