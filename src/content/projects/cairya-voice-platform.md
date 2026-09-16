---
title: "Cairya — Voice Conversational-AI Platform"
summary: "A multi-tenant voice AI companion for VR and web. I built the hybrid-search retrieval engine, the document ingestion pipeline, and the admin application behind it."
label: "Client work — AxonBuild"
tech: ["Python", "FastAPI", "Qdrant", "Whoosh", "Hybrid search", "Next.js", "React"]
outcome: "A retrieval engine and knowledge-management layer that let each tenant bring their own corpus to a shared voice platform."
featured: false
order: 5
---

Cairya is a voice-driven AI companion running on VR and web. It was built by a team; my scope
was the retrieval side and the tooling around it.

## Voice changes the retrieval problem

Text chat forgives a slow or verbose answer — you skim it. Voice doesn't. A spoken response
that takes too long to start feels broken, and one that rambles is unlistenable. Retrieval has
to return the *right* passage quickly, not a set of plausible candidates for the model to sift.

That pushed the design toward precision over recall, which is the opposite of what a lot of
RAG tuning optimises for.

## Hybrid search over hierarchical embeddings

Pure vector search is good at meaning and bad at specifics — product names, model numbers,
exact terminology. Keyword search is the reverse.

The engine combines both: **Qdrant** for dense vector retrieval, **Whoosh** for keyword
matching, over hierarchical embeddings that preserve some of a document's structure rather
than flattening it into equal-sized fragments. Results are ranked from both signals, so a
query naming something exactly finds it, and a query describing something vaguely still works.

## Multi-tenant ingestion

Being multi-tenant is where most of the actual engineering went.

Each tenant brings their own documents, and those documents must never bleed into another
tenant's retrieval. The ingestion pipeline handles parsing, chunking, and embedding per tenant
with isolation maintained through the whole path — from upload to the vectors that come back
at query time.

## The admin application

A retrieval system nobody can inspect is a retrieval system nobody trusts. I built the
**Next.js** admin application that gives tenants a way to manage their own knowledge base:
upload and organise documents, control access by role, and see usage.

That last part matters more than it looks. When a tenant asks *why did it answer that?*, the
answer has to be findable by them, not by an engineer reading logs.
