# Contributing to StatsCapybara

The site is free to use and openly licensed (see
[`LICENSE`](LICENSE) for the code and
[`LICENSE-CONTENT.md`](LICENSE-CONTENT.md) for the content). You do not need
permission to use it, adapt it, or teach from it. What follows is for people
who want to help improve it, or who want to reuse it and would like to know
how it fits together.

## Reporting an error

**This is the most valuable thing you can do.** The site makes quantitative
claims on every page, and a wrong number teaches a wrong thing. Two routes,
both fine:

- **Open an issue** here on GitHub, using the *Report an error* template.
- **Email** the address behind the "Spotted a mistake? Tell me" link in the
  footer of every page. No GitHub account needed — most students do not have
  one, which is why that link exists.

Please say which page, quote the sentence or name the readout, and if you
can, say what you believe the right answer is and where you checked it. A
published table, G\*Power, R, or a textbook page reference all count.

## The one non-negotiable

**Statistics must be correct.** Every quantitative claim on the site — in
prose, in a FAQ answer, in a worked solution, in a widget readout — is
verified against a published source before it ships. If you propose a change
that touches a number, say how you verified it.

`node tools/math-check.js` runs 1,087 assertions over the statistical
routines, each citing the source it is checked against and carrying a
tolerance set to that source's rounding precision. If it ever disagrees with
the site, the site is what gets fixed.

## Running it locally

There is no build step, no framework, no bundler and no npm dependencies.
Node is the only thing you need on your PATH.

```bash
node tools/serve.js 8097     # then open http://localhost:8097/
node tools/audit.js          # site health check — must pass before any commit
node tools/math-check.js     # statistical regression gate
```

`tools/audit.js` is the pre-commit gate. It exits non-zero on any error and
cross-checks the whole site against its single sources of truth: per-lesson
coverage, structured data, internal links and their fragments, metadata
hygiene, and the consistency of every published APA statistic with the
*p*-value printed beside it.

## Reusing the material

Take it. CC BY 4.0 asks only that you credit the source and say if you
changed something; the exact wording is in
[`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

Two things worth knowing if you are adapting rather than linking:

- **`assets/js/curriculum.js` is the single source of truth** for courses and
  lessons. The homepage grid, every sidebar and the prev/next links are all
  generated from it.
- **The practice datasets are reproducible.** Eight of the nine are simulated
  by `tools/make-datasets.py` from a committed master seed; rerunning it
  regenerates byte-identical CSVs, so the worked-solution numbers stay true.

## What is likely to be declined

- A build step, a framework, a bundler, or an npm dependency. The site is
  plain HTML, CSS and JS on purpose: it stays fast, it stays archivable, and
  it will still run in a decade.
- Advertising, tracking beyond the anonymous page counts documented in
  [`privacy.html`](privacy.html), or anything requiring an account.
- A number that has not been verified against a published source.
