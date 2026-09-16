# Case-study extraction prompt

Paste the block below into a Claude Code session running **inside a client
project repo**. It investigates the codebase, pauses for your corrections, then
writes a `CASE-STUDY.md` matching the schema in `src/content.config.ts`.

Afterwards: copy the file into `src/content/projects/`, strip the OPEN QUESTIONS
and REDACTION NOTES sections, and set `order` / `featured`.

---

````markdown
You are helping me write a technical case study about this codebase for my
engineering portfolio. You have access to this repo; you do NOT have access to
my portfolio site. Your job is to extract the truth from this codebase and
shape it into a publishable case study.

## Absolute rules

1. **Confidentiality.** This is client work. NEVER include: the client's name or
   any identifying detail, internal URLs, hostnames, endpoint paths, repo names,
   account/tenant IDs, employee names, credentials, API keys, or any real
   customer data. Refer to the client generically (e.g. "a retail bank in the
   Gulf", "a large public university"). If you are unsure whether something is
   identifying, leave it out and list it in the REDACTION NOTES section.
2. **No invented facts.** Every number, model name, latency figure, and
   architectural claim must come from something you actually read in this repo.
   If you cannot verify it, put it in the OPEN QUESTIONS section as a question
   for me — do not guess, and do not write a plausible-sounding placeholder.
3. **Scope my contribution honestly.** Run `git log --author="<my name or email>"`
   and compare against the full history. Work out which parts I actually wrote
   versus what teammates built. The case study must not imply I built things I
   didn't. If this was a team delivery, say so plainly.
4. **Read-only.** Do not modify, refactor, or delete anything in this repo.
   Write exactly one new file: `CASE-STUDY.md` at the repo root.

## Investigation phase (do this first, and show me what you find)

Work through the repo and report on:

- **Architecture** — services/modules and their boundaries, what calls what,
  where state lives, where the trust boundaries are. Trace at least one complete
  request end to end.
- **The stack, as actually used** — read the dependency manifests and the code.
  Real library versions, real model IDs, real datastores. Not aspirational.
- **The hard problems** — hunt for these deliberately. Look at: retry logic,
  fallbacks, timeouts, guardrails, validation layers, error paths, anything with
  a defensive comment, TODO/FIXME/HACK, and unusually long or careful functions.
  Code that looks over-engineered usually marks a real failure someone hit.
- **Concrete parameters** — chunk sizes, `top_k`, temperature, batch sizes,
  timeouts, cache TTLs, rate limits, index/collection configs, token budgets.
  These are what make a case study credible. Cite them with file paths.
- **What was tried and abandoned** — search git history for reverted approaches,
  deleted modules, and commits that rewrote a subsystem. The failed first attempt
  is usually the most interesting part of the story.
- **Evaluation and correctness** — test suites, eval scripts, golden datasets,
  tracing/observability setup, anything that answered "does this actually work".
- **Scale signals** — anything indicating real usage: pagination defaults,
  connection pool sizes, migration files, seed data volumes, infra configs.

Report your findings to me and WAIT for my corrections before writing the case
study. I will tell you what's wrong, what's confidential, and what context you
can't see from the code.

## Then write `CASE-STUDY.md` in exactly this format

```
---
title: "<Descriptive name, no client name>"
summary: "<One sentence. What it does and the single most interesting constraint. Max ~30 words.>"
label: "Client work"
tech: ["<6-8 items, specific, real>"]
role: "<my actual scope, one line — omit if I was sole author>"
outcome: "<One sentence: the result. Only verifiable claims.>"
featured: true
order: 999
---

<body — see below>
```

### Body style — match this closely

- **Open with a concrete tension, not a definition.** Not "X is a system that...".
  Instead: the specific thing that makes this problem hard. One or two short
  paragraphs.
- **3-6 `##` sections.** Each one covers a real engineering decision.
- **For each major decision, explain why the obvious approach fails first**, then
  what was built instead. The reasoning matters more than the description.
- **Prose paragraphs, not bullet lists.** This reads like an engineer explaining
  something to another engineer, not a résumé. Bullets only for genuine
  enumerations.
- Use `**bold**` for key technical terms and product names on first mention.
  Use *italics* for example user inputs.
- Be specific and quantitative wherever the repo supports it.
- No marketing language. No "leveraged", "cutting-edge", "seamlessly", "robust".
- Target 500-900 words.

### Architecture diagram

Include **one** Mermaid diagram in the body, placed after the section that
introduces the system's shape. Requirements:

- Use ```mermaid fenced blocks. `flowchart LR` or `TD`, or `sequenceDiagram` if
  the story is about a request flow over time.
- **Show the real mechanism**, not a generic boxes-and-arrows stack diagram. The
  diagram should make one specific thing click that prose can't convey — a
  routing decision, a fan-out, a gating sequence, where access control is
  enforced.
- 6-12 nodes. If it needs more, you're drawing the whole system instead of the
  interesting part.
- Label the edges with what actually flows across them.
- No client-identifying names in any node label.
- No styling/color directives — the site themes it (dark background, light text).

Add a second diagram only if there are genuinely two separate stories worth
drawing.

## Finally, append these two sections at the bottom of the file

```
---
## OPEN QUESTIONS (delete before publishing)
- <Anything you couldn't verify from the code and need me to confirm —
  especially user numbers, latency figures, and business outcomes.>

## REDACTION NOTES (delete before publishing)
- <Anything you deliberately left out or genericized, and why.>
```

Start with the investigation phase now.
````
