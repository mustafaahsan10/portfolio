---
title: "Agentic Banking Assistant"
summary: "An AI assistant that moves real money for a Kuwaiti retail bank — four distinct payment flows, each built as its own agent, with confirmation gates at every step."
label: "Client work — delivered via ZainTECH"
tech: ["Python", "LangChain", "LangGraph", "Deep agents", "RAG", "Token streaming", "Azure OpenAI"]
outcome: "Live bank-wide to all retail customers, and launched as the first fully agentic banking experience in its market."
featured: true
order: 1
---

Most banking chatbots answer questions. This one executes transactions — which changes
almost everything about how you build it.

I worked on this as a core engineer on the delivery team, owning the agent layer. The client
is a Kuwaiti retail bank; the system is live to their full retail customer base.

## The problem

A customer types *"send 50 to Ahmed."* Before anything happens, the system has to work out
which Ahmed, from which of the customer's accounts, over which payment rail, and whether the
customer actually meant to do it. Get any of that wrong and you haven't produced a bad answer
— you've moved someone's money to the wrong place.

That constraint drove every design decision that followed.

## Why one agent wasn't enough

The obvious approach is a single capable agent with a set of transfer tools and a long prompt
explaining when to use each. We didn't do that.

Transfers in this bank fall into four genuinely different categories:

- **By mobile number** — resolve a phone number to a beneficiary
- **To another bank** — interbank rails, different validation, different limits
- **To another customer within the bank** — internal, faster, different checks
- **Between the customer's own accounts** — no beneficiary resolution at all

These look similar in a chat window and are not similar underneath. A single prompt holding
all four sets of rules degrades in a specific way: it gets *mostly* right, and "mostly" is
not a word you want anywhere near a payments system.

So each flow is a **separate deep-agent flow built on LangChain**, with its own state, its
own validation rules, and its own failure modes. Routing happens up front; once you're in a
flow, that flow's rules are the only rules that apply.

The cost is more surface area to maintain. The benefit is that each flow is small enough to
reason about, test in isolation, and change without disturbing the others.

## Designing for refusal

The interesting engineering here isn't making it work — it's making it refuse.

Every step is gated. The system confirms it has resolved the right beneficiary, the right
source account, and the right amount before it does anything irreversible, and it will stop
and ask rather than proceed on a guess. Ambiguity is treated as a stop condition, not
something to resolve with the model's best judgement.

The principle throughout: **a payment assistant that guesses is worse than no payment
assistant at all.** A customer who has to rephrase is mildly annoyed. A customer whose money
went to the wrong person is a serious incident.

## Knowing whether it worked

Ahead of go-live, the flows were validated through a scripted test suite covering the paths
and edge cases we could enumerate, followed by user acceptance testing with the bank's own
team — the people who would be accountable for the thing once it was live.

Enumerating cases in advance only takes you so far with a conversational interface. Real users
phrase things nobody on the project would think to type. So the system is instrumented with
conversation tracing in production, which is where the genuinely unexpected inputs turn up.

## Answering questions too

Alongside the transactional flows, the assistant handles product and policy questions through
a separate **LangGraph** retrieval flow — rates, account types, card rules, the things
customers phone the call centre about.

This path is optimised for a different thing than the payment flows. It answers end to end in
**under five seconds** using token-level streaming, so text appears as it's generated rather
than after a pause. In a chat interface, perceived latency is most of the experience.

## What I'd do differently

The validation story is honest but incomplete. We had scripted tests and UAT before launch and
tracing afterwards, but no automated regression suite running against a fixed set of cases on
every prompt change. On a system that moves money, that's the piece I'd build first if I were
starting again.
