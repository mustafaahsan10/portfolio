---
title: "Customer Care Answer Assistant"
summary: "A retrieval assistant for call centre agents, where a good chunk of the knowledge base is out of date and quoting a withdrawn offer to a paying customer is worse than saying nothing at all."
label: "Client work, delivered via ZainTECH"
tech: ["Python", "FastAPI", "LangGraph", "PostgreSQL + pgvector", "Cohere Rerank", "Azure OpenAI", "Redis + Celery", "Langfuse", "Kubernetes (AKS)"]
role: "Built end to end: retrieval pipeline, the agent, caching, ingestion and observability."
outcome: "Running in production for frontline support staff, answering from roughly 1,700 knowledge base items with withdrawn content handled explicitly rather than hidden."
featured: true
order: 3
---

An agent has a customer on the line and needs to know what a bundle costs. The knowledge
base has the answer. Three rows below it, in the same table, sit four bundles that were
withdrawn last quarter. In the source document they are struck through. Everywhere else
they look exactly like the live ones.

Quoting one of those to a paying customer is a worse outcome than the assistant saying it
does not know. That is the constraint the whole thing is built around, and most of the
decisions I made only make sense in light of it.

<dl class="facts">
<div><dt>status</dt><dd>In production with frontline support staff</dd></div>
<div><dt>corpus</dt><dd>~1,700 knowledge base items</dd></div>
<div><dt>the problem</dt><dd>Much of it describes offers that no longer exist</dd></div>
<div><dt>my scope</dt><dd>All application code, retrieval through observability</dd></div>
</dl>

## What it does

**An agent types a question mid-call and gets an answer drawn from the operator's own
knowledge base, fast enough to use while somebody is waiting on the phone.**

It runs as a **FastAPI** service over a **LangGraph** flow, with **PostgreSQL** and
**pgvector** holding the documents, a **Cohere** reranker, and **Azure OpenAI** generating
the answers. **Redis** and **Celery** handle caching and ingestion, and everything is
traced in **Langfuse** and runs on **Kubernetes**.

## The knowledge base lies about itself

The obvious way to handle withdrawn offers is to tell the model about them in the prompt.
I tried that first and it does not hold.

Ingestion preserves the strikethrough formatting, so a dead row arrives marked as dead. But
give the model a table with eight withdrawn rows and two live ones and it reads the whole
thing as dead, then refuses to answer from the two good rows. Making the instruction firmer
just puts my wording in a fight with the visual weight of the content, and the content wins.

So I took the judgement away from the model. When the context is assembled, a mixed chunk
gets split into two labelled blocks, dead rows under one heading and live rows under
another, with the table header copied into both so each half still makes sense on its own.
Discontinued product codes get wrapped inline at every single occurrence, so the model
cannot quote one without the warning sitting right next to it.

Withdrawn documents are kept out of search altogether, because otherwise they crowd out
live content. That created a new problem, which is that an agent sometimes asks about an
item *by name* without knowing it has been withdrawn. So there is a separate in memory
index that matches the question against withdrawn titles and adds an acknowledgement to the
context. It never adds the document itself.

## Not trusting my own query rewriting

Agents type short, thin queries. *Roaming.* *Data plans.* Rewriting those into something
fuller is the standard move, and it introduces a quiet failure: the rewrite varies from run
to run, and a bad one builds a candidate pool that simply does not contain the right
document. I watched a question about handling a non subscriber caller produce a pool that
had dropped the customer handling policy and kept a lexically similar page about call
logging.

The fix is not a better rewrite. It is refusing to depend on one. Three searches run
independently: one over the rewritten query, one keyword search, and one over the raw query
exactly as the agent typed it. They are fused before a single rerank.

The raw arm pulls fifty candidates. I tried a hundred and it got worse, because the extra
weak chunks shifted the reranker's scoring and pushed genuinely relevant documents out of
the window. More recall bought less precision, which was not what I expected.

## Caching answers without answering the opposite question

Every agent works from the same knowledge base, so one good answer is worth reusing across
the team. Match an incoming question to an earlier one and replay the stored answer.

The trap is that embedding similarity cannot tell an opposite from a paraphrase.

<div class="tablewrap">
<table>
<thead><tr><th>incoming question</th><th>closest cached question</th><th>reused?</th></tr></thead>
<tbody>
<tr><td>how do I activate roaming</td><td class="naive">how do I set up roaming</td><td>Yes. Same intent, different wording.</td></tr>
<tr><td>how do I activate roaming</td><td class="naive">how do I deactivate roaming</td><td>No. Opposite verb pair, rejected outright.</td></tr>
<tr><td>how do I unblock a number</td><td class="naive">how do I block a number</td><td>No. Same rejection, opposite direction.</td></tr>
</tbody>
</table>
</div>

Those middle two questions embed extremely close together and need opposite answers.
Raising the similarity threshold until they separate destroys the recall that made caching
worth doing, and a token overlap check does not help either, because the two share almost
every word that matters.

So the gate is three separate conditions rather than one tuned number. Cosine similarity at
0.85, token overlap at 0.5, and an explicit list of opposite action verbs: activate and
deactivate, subscribe and unsubscribe, block and unblock. If one question uses a verb and
the other uses its inverse, the match is rejected no matter how similar it looks. Only the
first two are tunable. The third is a hard veto.

The cache lives in Postgres rather than a separate cache server, because the vectors, the
index and the stored answers all sit in a database the system already runs, which makes a
lookup one indexed query. Ingestion invalidates entries by flipping a flag instead of
deleting them, so I keep the hit rate history.

## Spending latency where it changes the answer

Reasoning is not uniformly worth what it costs. Answer generation keeps it, because it is
what separates two documents that look alike. An earlier attempt to save a second or two by
turning it down regressed quality outright and started surfacing withdrawn plans on an
unrelated billing complaint. Every other call in the system, query analysis, rewriting,
fact extraction, runs a cheaper model at minimal effort, because those produce a few
hundred tokens of JSON where reasoning buys nothing.

Traces showed that generation time was dominated by reading the prompt rather than writing
the answer, so I cut the primary context from fifteen chunks to ten and let the fan out and
the reranker absorb the risk.

Judging that needed a number the tracing library does not give you. A model's own time to
first token leaves out analysis and retrieval, which is most of the wait. So the API layer
records time to first token as the agent experiences it, measured from the moment the
request opens to the first token reaching their screen. That is the number that matters
when somebody is holding a phone.
