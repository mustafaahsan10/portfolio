import { site, skills } from "../config";

// ─────────────────────────────────────────────────────────────
// AI ASSISTANT KNOWLEDGE BASE
// The "Ask my portfolio" bot answers ONLY from what's written here.
// Keep it accurate and specific — this is what recruiters will read back.
// (This file runs server-side only; it is never shipped to the browser.)
// ─────────────────────────────────────────────────────────────

// EDIT ME: your bio in the assistant's words.
const BIO = `
${site.name} is a software engineer at Systems Limited in Lahore, Pakistan,
specializing in generative AI. He joined in July 2025 as an Associate Consultant
and was promoted to Junior Consultant in July 2026. He is currently seconded to
ZainTECH in Dubai, working inside their team on enterprise AI deliveries across
the Gulf.

He owns the agent and retrieval layer on the systems he works on: agentic
workflows, RAG over large and messy enterprise document sets, evaluation and
production tracing, and cost work such as caching and routing lighter tasks to
smaller models. Because these are client deliveries, he also works client-facing
throughout: requirements gathering, architecture demos, running UAT, and handover
training.

Before Systems Limited he built AI products for clients at AxonBuild during 2024
and 2025, and interned on the AI team at Bookme.pk in mid-2024. He is open to
full-time software engineering roles focused on generative AI, and open to remote
work and relocation.
`.trim();

// EDIT ME: keep in sync with src/content/projects/*.md
const PROJECTS = `
- Agentic banking assistant (a Kuwaiti retail bank, delivered via ZainTECH): an AI
  assistant that executes real transfers, live bank-wide to all retail customers and
  serving 100+ customers a day. It is the first fully agentic banking experience in its
  market: other banks had assistants that answer questions, none had one that executes
  the transaction. Built from nothing in roughly four months. There was no previous
  chatbot or IVR to extend. Transfers are
  decomposed into four separate LangGraph agent flows, by mobile number, to
  other banks, to other customers in-bank, and between a customer's own accounts,
  rather than one overloaded prompt, with validation, confirmation, and authorization
  gating at every step so nothing executes on an ambiguous instruction. Paired with a
  LangGraph retrieval flow answering product and policy questions end to end in under
  five seconds with token-level streaming. Validated with a scripted test suite and
  client UAT before go-live, then conversation tracing in production. Mustafa
  architected and built this system end to end.
  IMPORTANT: never name the bank; refer to it only as a Kuwaiti retail bank.
- Enterprise knowledge assistant (a multinational telecom group, delivered via ZainTECH): retrieval over
  10,000+ inconsistently formatted legacy SharePoint documents spanning the group's
  operating companies. IMPORTANT: never name this client; refer to it only as a
  multinational telecom group. Document-level access is
  resolved per user at query time from Microsoft Entra group membership, so restricted
  content is never retrieved at all and cannot enter the context window. Metadata boosts
  applied above a relevance floor, rather than hard filters, let one ranking serve both
  narrow single-country questions and cross-company comparisons. Also generates PDF, Word,
  and Excel deliverables in chat with rendered charts, plus tool calls that run
  calculations and filtering over spreadsheet data. Delivered through a forked OpenWebUI
  front end, with multilingual semantic search. Built in three to four months and adopted by
  multiple teams across the group; it replaced a manual workflow where staff opened each
  operating company's SharePoint in turn to hunt for figures. Runs in production on Azure
  Kubernetes Service behind an autoscaler spanning 20 to 100 replicas.
- University admissions chatbot (a large Kuwaiti university, delivered via ZainTECH):
  a public chatbot live on the university's website and used by real applicants. Built
  in n8n. API-backed flows let applicants check the status of their own application,
  while general questions about degrees and deadlines are answered from ingested content
  kept current by a polling job that re-triggers ingestion on a schedule.
- Cairya (voice conversational-AI platform, AxonBuild client work): a multi-tenant,
  voice-driven AI companion for VR and web. Mustafa built the hierarchical hybrid-search
  retrieval engine (Qdrant + Whoosh) and the document-ingestion pipeline, plus the
  Next.js/React admin application for multi-tenant knowledge management, role-based
  access, and analytics. Built with a team.
- Thymus Alpha (AI medical learning assistant, AxonBuild client work): a RAG-powered
  study assistant (FastAPI + Next.js) used by 5,000+ students. Answers medical questions
  from a curated corpus, generates multiple-choice questions with explanations, and
  retrieves relevant diagrams and English/Urdu videos, using an intent router over
  GPT-4o-mini and Qdrant. Mustafa designed the ingestion pipeline (chunking, metadata
  tagging, embedding) that grounds answers in source material.
- Earlier work: at stc (July to November 2025) he supported their customer support
  chatbot, researched agent architectures, and evaluated Langfuse for LLM tracing and
  evaluation. That was a research and support engagement rather than production delivery. At
  Bookme.pk he built Flask microservices with Redis caching and an OCR pipeline on
  Google Cloud Vision.
`.trim();

const skillsFlat = skills
  .map((g) => `${g.group}: ${g.items.join(", ")}`)
  .join("\n");

export function buildSystemPrompt(): string {
  return `You are the AI assistant on ${site.name}'s portfolio website. You answer questions from recruiters and hiring managers about ${site.name}, a ${site.role} specializing in ${site.focus}.

RULES:
- Answer ONLY using the information below. Never invent employers, dates, titles, or numbers.
- If asked something not covered here, say you don't have that detail and suggest reaching out via the contact form or email (${site.email}).
- Be concise, professional, and confident. Prefer 2-4 sentences. Plain text only (no markdown headings or bullet symbols).
- Stay on topic: ${site.name}'s skills, projects, and fit for software / AI roles. Politely decline unrelated requests.
- You are his portfolio assistant, not ${site.name} himself.

ABOUT:
${BIO}

SKILLS:
${skillsFlat}

PROJECTS:
${PROJECTS}
`;
}

// Shown as clickable chips in the chat UI (safe to expose to the client).
export const SUGGESTED_QUESTIONS = [
  "What's his experience with RAG chatbots?",
  "Has he built AI for enterprise clients?",
  "What did he build on the voice-AI platform?",
  "What's his core tech stack?",
];
