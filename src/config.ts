// ─────────────────────────────────────────────────────────────
// SITE CONFIG — edit this file to make the whole site yours.
// Everything a recruiter sees flows from here + the project
// markdown files in src/content/projects/.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Mustafa Ahsan",
  role: "Software Engineer",
  focus: "Generative AI",
  tagline:
    "I turn large language models into products people actually use, from retrieval and agents to the interfaces that make them click.",

  // Shown publicly on the contact CTA and in the command palette.
  email: "mustafaahsan2002@gmail.com",

  resumeUrl: "/resume.pdf",

  socials: {
    github: "https://github.com/mustafaahsan10",
    linkedin: "https://www.linkedin.com/in/mustafa-ahsan-b494721b2/",
  },

  // Web3Forms access key (safe to be public — it only allows submitting to
  // your form). Delivers contact-form messages to your email.
  web3formsKey: "408fd8a5-4635-4b3e-bbda-f8b2c2dd2ac2",
};

// Anchor nav (single-page sections)
export const nav = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// Grouped so recruiters can keyword-scan quickly.
export const skills: { group: string; items: string[] }[] = [
  {
    group: "Gen AI / LLMs",
    items: ["RAG", "AI Agents", "Deep agents", "LangChain", "LangGraph", "OpenAI & Anthropic APIs", "Azure OpenAI", "Token streaming", "Fine-tuning (vision/multimodal)"],
  },
  {
    group: "Retrieval & Data",
    items: ["pgvector", "Qdrant", "Hybrid search", "Re-ranking", "RBAC-aware retrieval", "PostgreSQL", "SQL"],
  },
  {
    group: "Evaluation & Ops",
    items: ["Client UAT", "Production tracing", "Langfuse", "Prompt/response caching", "Model routing & benchmarking"],
  },
  {
    group: "Languages",
    items: ["Python", "TypeScript", "JavaScript"],
  },
  {
    group: "Frameworks",
    items: ["FastAPI", "Node.js", "React", "Next.js", "Astro"],
  },
  {
    group: "Automation & Cloud",
    items: ["n8n", "OpenWebUI", "Docker", "Terraform", "Azure", "Microsoft Graph / Entra ID", "GCP", "Cloudflare", "Git"],
  },
];
