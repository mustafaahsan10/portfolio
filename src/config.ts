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
    "I build LLM-powered products — from retrieval pipelines and agents to the React front-ends that make them usable.",

  // TODO: confirm the email you want publicly shown on the contact CTA.
  // This will be visible on your live site.
  email: "mustafaahsan2002@gmail.com",

  // TODO: drop your CV at public/resume.pdf (then this link works).
  resumeUrl: "/resume.pdf",

  socials: {
    github: "https://github.com/mustafaahsan10",
    // TODO: your LinkedIn profile URL
    linkedin: "https://www.linkedin.com/in/your-handle",
  },

  // TODO: get a free access key at https://web3forms.com (enter your email,
  // paste the key here). Until then the contact form falls back to email.
  web3formsKey: "YOUR_WEB3FORMS_ACCESS_KEY",
};

// Anchor nav (single-page sections)
export const nav = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

// TODO: tweak these to match your real stack. Grouped so recruiters
// can keyword-scan quickly.
export const skills: { group: string; items: string[] }[] = [
  {
    group: "Gen AI / LLMs",
    items: ["RAG", "Agents", "OpenAI & Anthropic APIs", "LangChain", "Vector DBs", "Prompt engineering", "Fine-tuning"],
  },
  {
    group: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    group: "Frameworks",
    items: ["React", "Next.js", "FastAPI", "Node.js", "Astro"],
  },
  {
    group: "Tools & Cloud",
    items: ["Docker", "Git", "Postgres", "AWS", "Cloudflare"],
  },
];
