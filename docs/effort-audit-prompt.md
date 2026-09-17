# Effort audit prompt

Run this in a client repo when you need to remember where the time actually went,
before writing or revising a case study. It ranks subsystems by evidence of
effort from git history rather than by how well-commented they are.

Paste the block below into Claude Code inside the repo.

---

````markdown
I am writing a case study about this project and I do not remember all of it. I
need you to work out, from this repository's history, where the real engineering
effort actually went.

This is NOT a code review and NOT a case study. It is an archaeology exercise.
Do not write prose about the system. Do not suggest improvements.

## The bias you must correct for

Code comments, defensive blocks and recent commits cluster around things that
recently surprised someone. That is not the same as the work that was hardest or
took longest. The genuinely difficult parts of a system are usually invisible,
because code that works does not explain what it cost to get right. A late
guardrail patch with a vivid comment will look far more important than three
weeks of design that now just quietly works.

So rank by history and churn, not by how interesting the code reads.

## What to measure

Work these out with real commands and report the actual numbers.

**1. Build timeline.** Reconstruct what got built when.
- `git log --reverse --date=short --format='%ad %s'` for the full sequence
- Commits per month: `git log --date=format:'%Y-%m' --format='%ad' | sort | uniq -c`
- For each top-level source directory: first commit date, last commit date,
  number of commits touching it, total lines added and deleted
  (`git log --numstat` aggregated per path)

**2. Sustained effort.** A module touched across many commits spanning months is
where difficulty lived. A module with three commits in one week was easy, or was
added late. Report the top 15 paths by number of distinct commits, and separately
by the span of time between first and last change.

**3. Churn and rewrites.** Files repeatedly rewritten mark hard problems. Report
the paths with the highest ratio of lines changed to current file size, and any
file whose content substantially changed more than twice.

**4. Abandoned approaches.** Find directions that were tried and dropped:
- deleted files (`git log --diff-filter=D --name-only`)
- reverts and rewrites (`git log --grep='revert\|rewrite\|redo\|again\|instead\|replace' -i`)
- code still present in the tree that nothing imports

**5. Struggle signals in commit messages.** Search the log for messages
suggesting repeated attempts: "finally", "actually", "properly", "take 2",
"third", "still", "fix fix", or several consecutive commits touching the same
file on the same day. Quote the interesting ones with dates.

**6. Where the tests are.** Test volume per subsystem, as a ratio to
implementation size. Heavily tested areas are usually the areas someone was
afraid of. Note when the tests were written relative to the code: tests added
long after suggest something broke in a way that needed pinning down.

**7. Integration surface.** List every external system this talks to (APIs,
identity providers, databases, message brokers, model providers) and how much
code and history sits at each boundary. Integration work is routinely the most
time-consuming and least visible part of a delivery.

## What to give me

**A. A month-by-month narrative** of what appeared when, naming actual features
and modules, detailed enough that I can recognise what I was doing at the time.

**B. A ranked list of subsystems by evidence of effort**, most to least, each with
the numbers behind it (commits, time span, churn, tests). Say plainly which of
these look like sustained hard work and which look like late additions or
one-afternoon jobs.

**C. The three or four areas that consumed the most effort**, with your reasoning.
For each, describe in two or three sentences what the actual engineering problem
was, based on what the code does now and what it went through to get there.

**D. What you found that was tried and abandoned**, with dates.

**E. Questions to jog my memory.** This is the most useful part. Ask me specific,
concrete questions about the things that look hard in the history but whose
reasons are not recoverable from the code. Reference real dates, files and commit
messages, for example: "you rewrote the session handling three times between
March and May, and the last version is much simpler than the first. What was
going wrong?" Ask ten to fifteen of these.

## Rules

- **Read only.** Change nothing. Write no files unless I ask.
- **Redact as you go.** I will paste your output into another conversation, so it
  must contain no client name, no employer name, no colleague names, no
  hostnames, URLs, endpoint paths, tenant or subscription IDs, registry or
  namespace names, repo or org names, and no internal ticket prefixes. Refer to
  the client generically. Keep source paths and module names, since those are
  what make the analysis checkable.
- If a measurement is not available (shallow clone, squashed history, a repo that
  started with one big import commit), say so plainly rather than guessing. That
  is useful information by itself.

Start with the timeline.
````
