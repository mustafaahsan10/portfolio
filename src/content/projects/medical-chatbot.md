---
title: "Thymus Alpha, an AI Medical Learning Assistant"
summary: "A study assistant for medical students that answers from a curated corpus, writes practice questions, and finds the diagram or the video, depending on how someone wants to learn."
tech: ["Python", "FastAPI", "OpenAI (GPT-4o-mini)", "Qdrant", "Next.js", "React"]
outcome: "Used by 5,000+ medical students, combining grounded answers, auto-generated quizzes and multimodal retrieval in one flow."
label: "Client work, AxonBuild"
featured: true
order: 5
screenshots:
  - src: "/projects/medical-chatbot/01-home.jpg"
    alt: "Home screen, where you pick a topic or ask your own question"
  - src: "/projects/medical-chatbot/02-answer.jpg"
    alt: "A grounded answer: tuberculosis symptoms explained from the source corpus"
  - src: "/projects/medical-chatbot/03-mcq.jpg"
    alt: "An auto-generated multiple choice question with the correct answer and explanation"
  - src: "/projects/medical-chatbot/04-diagram.jpg"
    alt: "Diagram retrieval, with a relevance score and an explanation on request"
  - src: "/projects/medical-chatbot/05-videos.jpg"
    alt: "Answer grading, plus relevant videos surfaced in English and Urdu"
---

Medical students do not study one way. The same person wants a written explanation on
Monday, wants to be tested on Tuesday, and on Wednesday just wants to see the diagram.
Most study tools pick one of those and make you go elsewhere for the rest.

Thymus Alpha does all of them from one chat box, and every answer is grounded in a curated
medical corpus rather than whatever the model happens to remember. The backend is
**FastAPI**, handling routing, retrieval and the quiz, diagram and video services, with a
**Next.js** and **React** front end for the chat itself.

<dl class="facts">
<div><dt>reach</dt><dd>Used by 5,000+ medical students</dd></div>
<div><dt>modes</dt><dd>Explanation, practice questions, diagrams, bilingual video</dd></div>
<div><dt>grounding</dt><dd>A curated corpus, not the model's own recall</dd></div>
<div><dt>my scope</dt><dd>The ingestion pipeline that grounds every answer</dd></div>
</dl>

## Working out how someone wants to learn

**Every message goes through an intent router before anything else happens, so the system
can tell "explain this to me" from "test me on this".**

I put a GPT-4o-mini classifier in front of everything, sorting each message into
explanation, quiz, diagram or video, behind a confidence gate so an ambiguous message does not get forced down the wrong path. It then
works out which medical topic is being asked about, either from the message itself or from
the conversation up to that point, which matters because students rarely repeat the topic
once they have started on it.

Getting that routing right is what makes the whole thing feel like one tool instead of four
bolted together.

## Grounding every answer in the corpus

**I designed the ingestion pipeline that the answers are built on: chunking, metadata
tagging and embedding into Qdrant.**

This is the part that decides whether the rest works. A study assistant that invents a
plausible sounding mechanism is worse than no study assistant, because a student has no way
to catch it and will revise from it. So I built retrieval to run over material that was
deliberately prepared rather than scraped, and I tagged it on the way in so answers come
back tied to their source.

The same index does more than text. Diagrams are retrieved by vector search over the figures
themselves and come back with a relevance score and an explanation on request, and topic
videos are surfaced in both English and Urdu, which is what a lot of these students are
actually learning in.

## Practice questions that stay useful

**The assistant writes five option multiple choice questions with explanations, and
de-duplicates them against what it has already asked.**

Without that check a quiz generator converges. Ask it about the same topic three times and
you get the same three questions with the wording shuffled, which is the point where a
student stops using it. I track what has already been asked and steer away from it, which keeps
practice worth coming back to, which for a study tool is the only metric that really counts.
