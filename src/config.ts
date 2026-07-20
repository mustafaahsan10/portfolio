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
    "I turn large language models into products people actually use — from retrieval and agents to the interfaces that make them click.",

  // TODO: confirm the email you want publicly shown on the contact CTA.
  // This will be visible on your live site.
  email: "mustafaahsan2002@gmail.com",

  // TODO: drop your CV at public/resume.pdf (then this link works).
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
    items: ["RAG", "AI Agents", "Prompt engineering", "Fine-tuning (vision/multimodal)", "LangChain", "LangGraph", "OpenAI & Anthropic APIs"],
  },
  {
    group: "Vector & Databases",
    items: ["pgvector", "Qdrant", "PostgreSQL", "SQL"],
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
    items: ["n8n", "Docker", "Terraform", "Azure", "GCP", "Cloudflare", "Git"],
  },
];
