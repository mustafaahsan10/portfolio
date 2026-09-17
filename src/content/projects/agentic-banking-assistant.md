---
title: "Agentic Banking Assistant"
summary: "Every bank has a chatbot that answers questions. This one carries out the transaction, and it was the first in its market to actually move money instead of explaining how."
label: "Client work, delivered via ZainTECH"
tech: ["Python", "FastAPI + SSE", "LangGraph", "Azure OpenAI (GPT-4.1)", "PostgreSQL + pgvector", "Cohere Rerank", "Redis", "Langfuse"]
role: "Built end to end: architecture, the payment agents, retrieval, output guardrails and production tracing."
outcome: "Live bank-wide to all retail customers and serving 100+ a day, as the first fully agentic banking experience in its market."
featured: true
order: 1
---

Every bank has a chatbot. They answer questions about branch hours and card fees, and if
you ask one to send money it gives you a link to the app.

This one sends the money.

I think that is why nobody in the market had built it yet. When an assistant answers a
question wrong, someone is annoyed. When it carries out a transfer wrong, a customer's
money has gone to the wrong person and nobody can take it back. Those are not the same
problem, and the second one decided almost every choice I made.

<dl class="facts">
<div><dt>status</dt><dd>Live bank-wide, serving 100+ customers a day</dd></div>
<div><dt>built</dt><dd>Roughly four months, starting from nothing</dd></div>
<div><dt>languages</dt><dd>Arabic and English, switchable mid-conversation</dd></div>
<div><dt>my scope</dt><dd>Architecture through production</dd></div>
</dl>

## What it does

Customers ask about products and policies and get an answer taken from the bank's own
documentation. They can also move money four different ways: to a mobile number, to an
account at another bank, to another customer inside the bank, or between their own
accounts. All of it works in Arabic and English, and people switch between the two
mid-sentence without warning.

There was nothing here before. No older chatbot to extend, no phone menu to replace. The
bank went from having no assistant at all to one that can move customer money, in about
four months.

## The rule I built everything around

**The model works out what someone wants. It never authorizes anything.** Every step with
real consequences runs in ordinary code that the model can trigger but cannot talk its way
past.

Take *send 50 to Ahmed*. It sounds like an instruction. It is really four open questions,
and I only trusted the model to ask them.

<div class="scenario">
<p class="cap">resolved explicitly before anything executes</p>
<div class="body">
<ol>
<li><strong>Which Ahmed?</strong> A saved recipient, or a name matching nobody.</li>
<li><strong>From which account?</strong> The customer may hold several.</li>
<li><strong>Over which rail?</strong> Four routes, four sets of validation rules.</li>
<li><strong>Did they mean it?</strong> Nothing runs without an explicit yes.</li>
</ol>
</div>
</div>

I built each of the four transfer types as its own **LangGraph** agent, running on **Azure
OpenAI**'s GPT-4.1, instead of handing one agent every tool with a long prompt explaining
when to use which. A prompt that tries to cover all four
covers none of them properly, and I did not want a bug in one payment route to be able to
reach another.

I also stopped treating what the customer says as evidence. Account numbers get tokenised
by the backend and echoed back by the app, so before the server accepts a selection it
reloads what each payment agent was actually waiting on and checks that the chosen account
was in the list it offered. If it was not, the system treats it as a typo and shows the
list again. Returning an error there would just end the conversation, and the customer is
halfway through sending money.

```mermaid
flowchart TD
    U["Customer turn"] --> G["Deterministic pre-checks"]
    G -->|"turn already decided"| S["Streaming output gates"]
    G -->|"needs interpretation"| R["LLM intent router"]
    R -->|"informational"| K["Retrieval agent"]
    R -->|"money movement"| P["Payment agents"]
    K -->|"grounded answer"| S
    P -->|"confirmed action"| S
    S --> OUT["Token stream to customer"]
```

## Earning the right to go live

**A bank does not approve something like this because the demo went well.** Most of those
four months went on showing that it fails safely, over and over, on demand. That meant
security review and repeated rounds of testing with the client, and every round turned up a
category of failure I had to close before we could move on.

All of it came down to one question. What does it do when somebody pushes on it? Here is
the behaviour I ended up guaranteeing, next to what each case did before I guarded it.

<div class="tablewrap">
<table>
<thead><tr><th>input</th><th>without guards</th><th>what ships</th></tr></thead>
<tbody>
<tr>
  <td>send 50 to Ahmed</td>
  <td class="naive">Picks one of three saved recipients and carries on</td>
  <td>Asks which one. Nothing runs without an explicit yes.</td>
</tr>
<tr>
  <td>selects an account never offered</td>
  <td class="naive">Taken at face value and acted on</td>
  <td>Server checks it against the list it actually offered, shows the list again, counts the retry.</td>
</tr>
<tr>
  <td>okay thanks stop</td>
  <td class="naive">Ends the chat in Arabic, answers <em>"How can I assist you further?"</em> in English</td>
  <td>Matched against a list of closing phrases, identically in both languages, before routing.</td>
</tr>
<tr>
  <td>stop the sms alerts</td>
  <td class="naive">A search for the word "stop" hangs up on a customer asking for help</td>
  <td>Not a closing phrase. Handled as an ordinary request.</td>
</tr>
<tr>
  <td>cards as a rust script</td>
  <td class="naive">Returns a working Rust program printing real card fees</td>
  <td>Caught on the way out, before it reaches the screen.</td>
</tr>
</tbody>
</table>
</div>

**Two things make that behaviour possible, and neither one is a prompt.**

The first is that answers get checked while they are being written rather than after. Three
gates sit on the text as it streams out, each holding back only the characters that could
still turn into something the assistant should not send. Checking a finished answer is
pointless, because the customer has already read it. This is what stops the assistant
writing code, or formatting, or anything else that is factually correct and still wrong for
a bank to put in front of someone.

The second is a terminology layer. It is an Islamic bank, so it offers financing and never
lending, and a model translating into English will reach for "loan" every time. The rule
rewrites it, with two exceptions I left in on purpose. One is a product name the board
approved. The other is the phrase for the thing the Sharia board actually prohibits, where
swapping in "financing" would suggest the bank offers it.

Both run on every response, in both languages, and releases are gated on 458 regression
tests plus a set of adversarial probes that run against every guardrail.

## Fast enough that nobody doubts it worked

**Answers appear word by word as they are written.** The service is **FastAPI**, streaming
over SSE, because if someone is waiting to hear that their money moved then a screen sitting
still reads as a failed transfer.

The embedding model produces vectors too large for **pgvector** to index, so every search
reads the whole **PostgreSQL** table. Search is the expensive part here and it only gets worse as the
document set grows, which is why I spent most of the effort on not searching. A location
shortcut, a greeting matcher, a direct match against common questions, then a per-session
**Redis** cache, and only after all that the full pipeline. When it does search, I left the
similarity thresholds deliberately loose and let a **Cohere** reranker sort out precision
afterwards.

## Knowing when it didn't work

**Every turn where the assistant gave no real answer is tagged in Langfuse with a reason.**
Retrieval found nothing, which is a content gap. Or it found something and the model still
declined, which is a precision problem. Or routing decided the question was not about
banking at all, which tells the bank what its customers keep asking for that it does not
offer.

One number would say the assistant failed six percent of the time. Three numbers say which
team should go and fix it.

The quality judge returns "unknown" when it errors, rather than "answered", so the figure
comes out as an undercount instead of a clean bill of health. I would rather the number
looked slightly worse than it really is than the other way round.
