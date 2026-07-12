---
title: "RAG Knowledge Assistant"
summary: "A retrieval-augmented chat assistant over private docs, with inline citations and streaming answers."
tech: ["Python", "FastAPI", "OpenAI", "pgvector", "React"]
role: "Sole engineer — architecture, retrieval pipeline, and UI"
outcome: "Cut internal document lookup time by ~70% in a pilot with 40 users."
demoUrl: "https://example.com"
githubUrl: "https://github.com/mustafaahsan10"
youtubeId: ""
featured: true
order: 1
---

<!-- EDIT ME: this is placeholder copy. Replace with your real project. -->

## Problem

Teams were losing hours hunting through scattered internal documentation. Search
returned links, not answers, and nobody trusted the results without a source.

## Approach

I built a retrieval-augmented generation pipeline: documents are chunked and
embedded into a `pgvector` store, a FastAPI service handles hybrid retrieval and
re-ranking, and an LLM generates streamed answers with inline citations back to
the source passages. The React front-end renders the stream token-by-token and
lets users click any citation to jump to the source.

## Outcome

In a 40-user pilot, median time-to-answer dropped ~70%, and trust improved
because every answer was traceable to a source.
