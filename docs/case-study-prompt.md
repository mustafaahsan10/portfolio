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
3. **Assume I built this system.** I architected and wrote these projects from
   scratch. Do not infer my contribution from commit counts — shared repos,
   pairing, squashed history and infra commits all distort that badly, and a
   case study that hedges my ownership based on `git log` will be wrong. Write
   it as my work. If you find a clearly separable component that someone else
   owned end to end, raise it with me in the investigation phase rather than
   hedging in the prose.
4. **Read-only.** Do not modify, refactor, or delete anything in this repo.
   Write exactly one new file: `CASE-STUDY.md` at the repo root.

## Investigation phase (do this first, and show me what you find)

Work through the repo and report on:

- **Architecture** — services/modules and their boundaries, what calls what,
  where state lives, where the trust boundaries are. Trace at least one complete
  request end to end.
- **The stack, as actually used** — read the dependency manifests and the code.
  Real library versions, real model IDs, real datastores. Not aspirational.
- **The hard problems.** Look at retry logic, fallbacks, timeouts, guardrails,
  validation layers, error paths, defensive comments and unusually careful
  functions. But treat what you find as *candidates only*, and understand the
  bias: code comments and recent commits cluster around things that recently
  surprised someone, which is not the same as the work that was hardest or took
  longest. The genuinely difficult parts of a system are usually invisible,
  because working code does not explain what it cost to get right. A late
  guardrail patch with a vivid comment will look more important than three weeks
  of design that now just works.
  So do not rank these yourself. List what you found, then **ask me directly
  which parts actually took the longest, which I would talk about in an
  interview, and what was hard in a way the code does not show**. Weight the case
  study by my answer, not by comment density.
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

**Frame it as a whole project, not a tour of interesting bugs.** A reader should
finish knowing what the system is, what it does, how it is put together, and
what it took to make it work in production — in that order. Specific failures
and fixes are *evidence inside* that story, never the skeleton of it. If a
section could be retitled "that time we hit a weird bug", it is at the wrong
altitude.

- **Open by establishing the system and its central constraint.** One or two
  short paragraphs: what it does, who uses it, and the one thing about the
  problem that makes it hard. Concrete, not a definition.
- **Then say what it actually does** — the real capability surface. Scope, scale,
  languages, the kinds of request it handles. A reader should be able to picture
  using it.
- **Then the architecture** — the shape of the system and why it has that shape.
  This is where the diagram goes.
- **Then 2-4 `##` sections on the engineering that made it production-grade** —
  the areas where the hard work went. Each section covers an *area of the system*
  (retrieval, safety, access control, performance), not a single incident. Inside
  a section, use a concrete failure and its fix as evidence that the area was
  genuinely hard — one per section, a few sentences, then move on.
- **Close on what it took to ship and how correctness was established** — testing,
  evaluation, tracing, what happens when it is wrong.
- Prose paragraphs, not bullet lists. Written engineer-to-engineer.
- `**bold**` for key technical terms on first mention; *italics* for example user
  inputs. Specific and quantitative wherever the repo supports it.
- No marketing language. No "leveraged", "cutting-edge", "seamlessly", "robust".
- Target 600-900 words.

### Section shape: open on the build, end on the win

Every `##` section follows the same arc, and this matters more than it sounds.

- **Open with what I built**, in the first sentence, as the bolded lead. Not with
  what went wrong. A section that opens on the problem tends to spend itself
  there and treat the solution as an afterthought.
- **The middle** carries the problem, the mechanism, and crucially *why the fix
  works*. Describing what I built without explaining why it solves the problem
  leaves the reader with a list of components.
- **End on what the work achieved.** Never end a section on a mistake, a failed
  experiment, or a piece of infrastructure trivia. Endings carry weight and get
  remembered. A failed experiment can appear mid-paragraph as a tuning aside, but
  it is not the last thing a reader should see.
- Never append a technology name to the end of a section just to get it
  mentioned. Work it into an earlier sentence instead.

### Voice: it must not read as machine-written

This matters as much as the content. Specific rules, all of them non-negotiable:

- **No em dashes or en dashes anywhere.** Not one. Use a comma, a full stop, a
  colon, brackets, or rewrite the sentence. This is the single clearest tell.
- **Write in the first person.** I built these systems, so say so: "I built each
  transfer type as its own agent", "I left the thresholds loose on purpose",
  "the one that worried me more". Agentless prose ("what shipped is...", "the
  design leans on...") describes a system that apparently assembled itself, reads
  as machine-written, and quietly robs me of the credit.
- **Include real opinions and preferences**, not only facts. "I would rather the
  number looked worse than it is." Machines state; people prefer things.
- **Do not land a neat aphorism at the end of every section.** One or two across
  the whole piece is good. Five in a row is a pattern, and patterns read as
  generated.
- **Vary sentence length for real.** Some long and slightly rambling, some very
  short. Suspiciously balanced prose is a tell. Let some sentences just state a
  thing with no rhetorical shape at all.
- **Avoid the "it is not X, it is Y" construction.** It is seductive and I
  overuse it. Once per piece at most.
- **Plain language first, jargon second.** "Vectors too large for pgvector to
  index, so every search reads the whole table" beats "embeddings exceeding the
  indexable dimensionality ceiling". A non-technical reader should follow the
  argument; the precise terms still appear, they just are not carrying it.
- Contractions are fine. Write the way an engineer talks.

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
