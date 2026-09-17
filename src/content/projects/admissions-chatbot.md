---
title: "University Admissions Chatbot"
summary: "A public chatbot on a Kuwaiti university's website where applicants check their own application status and get answers about degrees and deadlines that are actually current."
label: "Client work — delivered via ZainTECH"
tech: ["n8n", "REST APIs", "RAG", "Scheduled ingestion"]
outcome: "Live on the university's public website and used by real applicants, with content that stays current without anyone updating it by hand."
featured: true
order: 4
---

Applying to university generates a specific kind of anxiety, and most of it resolves into two
questions: *what's happening with my application*, and *when is the deadline for this thing*.

Both were answered by an admissions office fielding the same queries over and over.

## Two different problems in one interface

From the outside this looks like one chatbot. Underneath it's two systems that fail in
completely different ways.

**Personal questions** — *has my application been reviewed?* — need live data about one
specific person. There's no corpus to retrieve from; the answer exists in the university's
systems and changes without warning. This runs through **API-backed flows** that fetch the
applicant's own record at the moment they ask.

**General questions** — *when do applications close for this programme?* — are the same for
everyone, and come from published content. That's retrieval.

Building them as one thing would have meant an assistant that either hallucinated application
statuses or gave stale deadlines. Splitting them meant each could be wrong in only its own way.

## The staleness problem

The second failure mode is the one that quietly ruins chatbots like this.

Ingest a university's programme pages once and you have a system that is accurate on launch
day and increasingly wrong afterwards. Dates move. Programmes change. Requirements get
amended. Nobody notices until an applicant acts on something that stopped being true two
months ago — and for admissions deadlines, that's a real consequence for a real person.

So ingestion runs on a **polling job** that re-reads source content on a schedule and refreshes
what the assistant retrieves from. Nobody at the university maintains the chatbot's knowledge
by hand, because a process that depends on someone remembering to update it is a process that
will eventually be forgotten.

## Why n8n

The whole thing is built in **n8n** rather than as a bespoke service, which was the right
call for the shape of this problem.

Most of the work here is orchestration: call an API, branch on the result, fetch content,
re-ingest on a schedule, route a message down one path or another. That's what n8n is good at,
and it leaves the client with something their own team can inspect and extend without needing
the engineer who built it.

The trade-off is less control than hand-written code. For a system whose complexity lives in
the wiring rather than the algorithms, that trade was worth making.
