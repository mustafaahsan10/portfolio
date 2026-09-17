---
title: "Cairya, a Voice Conversational-AI Platform"
summary: "A multi-tenant voice AI companion for VR and web. I built the hybrid search retrieval engine, the ingestion pipeline, and the admin application tenants use to run their own knowledge base."
label: "Client work, AxonBuild"
tech: ["Python", "FastAPI", "Qdrant", "Whoosh", "Hybrid search", "Next.js", "React"]
outcome: "A retrieval engine and knowledge management layer that let every tenant bring their own corpus to a shared voice platform without any of it bleeding across."
featured: false
order: 6
---

Cairya is a voice driven AI companion that runs on VR headsets and on the web. It was built
by a team. My part was the retrieval engine underneath it and the tooling around that.

Voice is what made the retrieval interesting. Text chat forgives a slow or long winded
answer because you can skim it. Voice does not. A spoken reply that takes too long to start
feels broken, and one that rambles is unlistenable.

<dl class="facts">
<div><dt>platform</dt><dd>Voice companion on VR and web, multi-tenant</dd></div>
<div><dt>my scope</dt><dd>Retrieval engine, ingestion pipeline, admin application</dd></div>
<div><dt>the constraint</dt><dd>Spoken answers, so precision matters more than recall</dd></div>
</dl>

## Tuning for precision instead of recall

**I built the retrieval to return the right passage rather than a set of plausible ones for
the model to sift through.**

Most RAG tuning optimises the other way. Cast wide, retrieve generously, let a large context
window and a capable model sort it out. That works fine when someone is reading, because the
cost of a slightly bloated answer is a few seconds of skimming.

Spoken out loud, that same answer is the whole experience. Every extra candidate is more
context to process before the first word comes out, and anything vague that survives into
the answer gets read to the user in full. So the engine is tuned the other way round, and
the bar for including a passage is higher than it would be for a chat interface.

## Hybrid search over hierarchical embeddings

**The engine runs dense vector search and keyword search together, because each one fails
where the other works.**

Vector search is good at meaning and bad at specifics. Product names, model numbers and
exact terminology are precisely the things it blurs. Keyword search is the reverse: perfect
on an exact string, useless when somebody describes a thing without naming it.

The engine is a **FastAPI** service running **Qdrant** for the dense side and **Whoosh** for
keyword matching, over hierarchical
embeddings that keep some of a document's structure instead of flattening it into
equal sized fragments. Results are ranked from both signals, so a query that names something
exactly finds it, and a query that only describes it still lands.

## Keeping tenants apart

**Isolation runs through the entire path, from upload to the vectors that come back at query
time.**

Every tenant brings their own documents to a shared platform, and none of it can ever appear
in another tenant's results. That constraint shaped the ingestion pipeline more than parsing
or chunking did, because it is not enough to filter at the end. The separation has to hold at
every stage, or you are relying on the last step to catch a mistake made three steps earlier.

## An admin application they can actually use

**I built the admin app in Next.js and React so tenants can manage their own knowledge
base, control access by role, and see what people are asking.**

A retrieval system nobody can inspect is a retrieval system nobody trusts. When a tenant asks
why it answered something a particular way, that has to be a question they can answer
themselves by looking, not a support ticket that ends with an engineer reading logs. Giving
them that visibility is what let each tenant run their own corpus without us in the middle.
