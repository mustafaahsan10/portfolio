---
title: "Thymus Alpha — AI Medical Learning Assistant"
summary: "A RAG-powered study assistant that answers medical questions from a trusted corpus, generates MCQs with explanations, and surfaces relevant diagrams and English/Urdu videos."
tech: ["Python", "FastAPI", "OpenAI (GPT-4o-mini)", "Qdrant", "Next.js", "React"]
outcome: "An end-to-end medical study assistant that combines grounded Q&A, auto-generated quizzes, and multimodal (diagram + bilingual video) retrieval in one flow."
featured: true
order: 2
screenshots:
  - src: "/projects/medical-chatbot/01-home.jpg"
    alt: "Home screen — pick a topic or ask your own question"
  - src: "/projects/medical-chatbot/02-answer.jpg"
    alt: "Grounded answer: tuberculosis symptoms explained from the source corpus"
  - src: "/projects/medical-chatbot/03-mcq.jpg"
    alt: "Auto-generated multiple-choice question with the correct answer and explanation"
  - src: "/projects/medical-chatbot/04-diagram.jpg"
    alt: "Diagram retrieval with a relevance score and an on-demand explanation"
  - src: "/projects/medical-chatbot/05-videos.jpg"
    alt: "Answer grading plus relevant videos surfaced in English and Urdu"
---

Thymus Alpha is an AI study assistant for medical students. Instead of a plain
chatbot, it grounds every answer in a curated medical corpus and adapts to *how*
someone wants to learn — read, test themselves, see a diagram, or watch a video.

## How it works

A GPT-4o-mini **intent router** classifies each message (explanation, quiz,
diagram, or video) behind a confidence gate, then resolves the medical topic from
the query or the conversation so far.

- **Grounded answers** — retrieval-augmented generation over a **Qdrant** vector
  store returns source-backed explanations, not generic AI guesses.
- **Auto-generated MCQs** — five-option questions with explanations, de-duplicated
  against previous questions so practice stays fresh.
- **Diagram retrieval** — vector search over figures returns the most relevant
  diagram with a relevance score and an on-demand explanation.
- **Bilingual video search** — surfaces topic videos in both English and Urdu.

## Stack

A **FastAPI** backend handles intent routing, RAG, and the MCQ / diagram / video
services; a **Next.js + React** front-end delivers the chat experience. The
corpus spans five conditions — tuberculosis, colorectal cancer, Turner syndrome,
lumbar disc herniation, and trigeminal neuralgia.
