---
title: "Enterprise Knowledge Assistant"
summary: "Retrieval over 10,000+ messy legacy documents spanning Zain's operating companies — with access control resolved per user at query time and a graph layer linking related passages across files."
label: "Client work — Zain, delivered via ZainTECH"
tech: ["Python", "RAG", "pgvector", "Neo4j", "Microsoft Graph / Entra ID", "OpenWebUI", "Multilingual retrieval"]
outcome: "Made a decade of scattered SharePoint content searchable across operating companies, with customer-care lookups answering at p95 under 5 seconds."
featured: true
order: 2
---

Zain operates across multiple countries — Saudi Arabia, Sudan, Kuwait, Bahrain and others —
and each operating company had accumulated its own SharePoint estate over years. Policies,
product documentation, internal procedures, commercial terms. Somewhere north of ten thousand
documents.

Nobody could find anything, and the reasons why turned out to be more interesting than the
retrieval itself.

## The hard part wasn't the model

Enterprise RAG demos are easy because demo corpora are clean. This corpus was not.

Documents had been written by different teams, in different years, to different templates,
in more than one language. The same concept appeared under different names in different
operating companies. Structure was inconsistent enough that naive chunking produced fragments
that were locally coherent and globally useless.

Three problems dominated, and none of them were about choosing a model.

## Access control that survives retrieval

The first is the one most RAG systems quietly get wrong.

If you embed an entire document estate into one vector store and let anyone query it, you
have built a very efficient way to leak internal documents. Retrieval doesn't respect
permissions unless you make it.

So access is resolved **at query time, per user, from their Microsoft Entra group membership**.
Before retrieval returns anything, the system knows who is asking and what they're cleared to
see — and content outside that boundary is never a candidate, not filtered out afterwards.

This matters more than it sounds. Post-filtering means the model may have already seen the
content. Resolving permissions before retrieval means the material never enters the context
window at all.

## Questions that span documents

The second problem: the most valuable questions crossed document boundaries.

*How does this policy differ between Kuwait and Bahrain?* Vector search over independent
chunks handles that badly — it returns passages that are individually relevant and gives you
no way to relate them.

So chunk relationships are modelled in **Neo4j**. Related passages across separate documents
are linked, which lets the system assemble a comparison rather than a list: this is what
Bahrain's document says, this is Kuwait's equivalent clause, here is where they diverge.

This is the part I'd point to as most transferable. Flat vector search is a solved commodity.
Structure *between* chunks is where retrieval quality actually lives.

## Answers aren't always prose

Enterprise users don't want a paragraph. They want the number in a spreadsheet, or a chart,
or a document they can forward.

So the assistant generates **PDF, Word, and Excel deliverables** in-chat, renders charts
inline, and exposes tool calls that run calculations and filtering over spreadsheet data.
Asking a question and receiving a populated workbook is a different product from asking a
question and receiving a description of one.

The whole thing is delivered through a customised **OpenWebUI** front end, which meant
building on a familiar chat surface rather than teaching an organisation a new tool.

## The customer-care path

Care agents are a distinct user with a distinct constraint: they're on a call with a customer
waiting.

They got their own retrieval flow for package, deal, and plan questions, tuned for speed —
**p95 under five seconds**. It replaced the previous approach, which was an agent searching
internal documentation manually while the customer held.

## What I owned

The agent and retrieval layer: ingestion, chunking strategy, the graph model, the
permission-resolution path, and the tool-calling surface. Platform and integration work sat
with wider teams at ZainTECH.
