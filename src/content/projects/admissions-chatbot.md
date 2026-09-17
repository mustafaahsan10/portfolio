---
title: "University Admissions Chatbot"
summary: "A public chatbot on a Kuwaiti university's website where applicants check the status of their own application and get answers about deadlines that are actually still true."
label: "Client work, delivered via ZainTECH"
tech: ["n8n", "REST APIs", "RAG", "Scheduled ingestion"]
outcome: "Live on the university's public website and used by real applicants, with content that stays current without anybody at the university maintaining it."
featured: true
order: 4
---

Applying to university produces a very specific kind of anxiety, and almost all of it comes
down to two questions. *What is happening with my application?* And *when is the deadline
for this thing?*

Before this, both of them were answered by an admissions office fielding the same handful of
queries over and over, by email and phone, all through the season.

<dl class="facts">
<div><dt>status</dt><dd>Live on the public website, used by real applicants</dd></div>
<div><dt>built in</dt><dd>n8n, as orchestration rather than a bespoke service</dd></div>
<div><dt>the catch</dt><dd>Two systems that fail in completely different ways</dd></div>
<div><dt>my scope</dt><dd>Built end to end</dd></div>
</dl>

## Two systems behind one chat box

**I built this as two separate paths that happen to share a text box, because the two kinds
of question have nothing in common except where they get typed.**

*Has my application been reviewed?* needs live data about one specific person. There is no
corpus to search. The answer lives in the university's own systems and changes without
warning, so that path calls their APIs and fetches the applicant's record at the moment they
ask.

*When do applications close for this programme?* is the same answer for everybody and comes
from published content, so that path is ordinary RAG over the university's own pages.

Building them as one thing would have given me an assistant that either invents application
statuses or quotes stale deadlines, and probably both. Keeping them apart means each path
can only be wrong in its own way, and each one is fixable without touching the other.

## Content that does not go stale

**The knowledge base refreshes itself on a schedule, so nobody at the university has to
remember to update the chatbot.**

This is the failure mode that quietly ruins chatbots like this one. Ingest a university's
programme pages once and you have something accurate on launch day and slowly wrong
afterwards. Dates move. Programmes change. Entry requirements get amended. Nobody notices
until an applicant acts on something that stopped being true two months ago, and for an
admissions deadline that has a real consequence for a real person.

So ingestion runs on a polling job that re-reads the source content on a schedule and
refreshes what the assistant answers from. Any process that depends on somebody remembering
to maintain it is a process that will eventually be forgotten, especially outside admissions
season when nobody is thinking about the chatbot at all.

## Why n8n was the right call here

**I built the whole thing in n8n rather than as a bespoke service, and I would make the same
choice again for this shape of problem.**

Almost all of the work is orchestration. Call an API, branch on what comes back, fetch
content, re-ingest on a schedule, send a message down one path or the other. That is exactly
what n8n is for, and it meant I could hand over something the university's own team can open
up, read, and extend without needing me.

The trade is less control than hand written code, which would matter a great deal on a
system whose difficulty lived in its algorithms. Here the difficulty lives in the wiring, so
the client got a system they can actually own.
