---
title: "Customer Care Answer Assistant"
summary: "A retrieval assistant for call centre agents, where a good chunk of the knowledge base is out of date and quoting a withdrawn offer to a paying customer is worse than saying nothing at all."
label: "Client work, delivered via ZainTECH"
tech: ["Python", "FastAPI", "LangGraph", "PostgreSQL + pgvector", "Cohere Rerank", "Azure OpenAI", "Redis + Celery", "Langfuse", "Kubernetes (AKS)"]
role: "Built end to end: retrieval pipeline, the agent, caching, ingestion and observability."
outcome: "In production with frontline agents after two months of work, replacing the manual SharePoint search they used to do while a customer waited on the line."
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

Before this existed, the agent searched SharePoint by hand, mid-call, while the customer
waited. That is the thing worth holding on to. Everything here is happening inside a pause
in a live conversation, which is why speed and correctness pull against each other so hard
in this system, and why I could not simply make it more careful until it was right.

<dl class="facts">
<div><dt>status</dt><dd>In production with frontline agents</dd></div>
<div><dt>built</dt><dd>Two months</dd></div>
<div><dt>corpus</dt><dd>~1,700 knowledge base items</dd></div>
<div><dt>replaced</dt><dd>Searching SharePoint by hand, mid-call</dd></div>
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

Agents type short, thin queries. *Roaming.* *Data plans.* The standard move is to rewrite
those into something fuller before searching, and most of the time it works. The problem is
the times it does not. A rewrite comes out of a model, so it varies between runs, and a bad
one builds a candidate pool that simply does not contain the right document. No amount of
good reranking rescues that, because the document was never in the pool to rank.

**So I stopped letting any single phrasing of the question decide what gets considered.**
Three searches run at the same time, independently of each other. One uses the rewritten
query. One is a keyword search over the exact terms the agent typed. One is a plain
similarity search over the raw query, untouched. Each returns its own ranked list, and I
merge all three into a single pool before anything gets scored.

What makes that work is that a document only has to be found by one of them. If the rewrite
drifts, the raw query still finds it. If the agent used internal wording that appears
nowhere else, the keyword arm catches it. If they typed something too thin to match anything
literally, the rewrite is what carries it. Three different ways of being wrong, and they are
not wrong about the same things.

Merging before the rerank rather than after is the other half of it. The reranker then
scores every candidate against the original question on one scale, so a document rescued by
the raw arm competes on equal terms instead of arriving with a score that means something
different from everyone else's.

One tuning detail caught me out along the way. The raw arm pulls fifty candidates, and I
tried a hundred expecting better coverage. It was worse: the extra weak chunks shifted the
distribution the reranker was scoring across and pushed genuinely relevant documents out of
the final window. Fifty is what shipped.

What all of this bought is that no single component decides what an answer can be drawn
from any more. A rewrite that drifts is now one arm having an off day, rather than a wrong
answer read out to a customer.

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
when somebody is holding a phone, and it is the only one I trusted when deciding what the
system could afford to do.
