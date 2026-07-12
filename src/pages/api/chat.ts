import type { APIRoute } from "astro";
// Astro 6+ removed Astro.locals.runtime.env — bindings come from here now.
import { env } from "cloudflare:workers";
import { buildSystemPrompt } from "../../data/assistant";

// On-demand (server) route — everything else stays static.
export const prerender = false;

// Current Workers AI text model (fast + cheap on the free tier). For higher
// answer quality you can swap to "@cf/meta/llama-3.3-70b-instruct-fp8-fast".
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const MAX_MESSAGE_LEN = 1000;
const MAX_HISTORY = 8;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // Cloudflare Workers AI binding (from cloudflare:workers env).
  const ai = (env as any)?.AI;
  if (!ai) {
    return json(
      { error: "The assistant isn't available in this environment." },
      503,
    );
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const message = String(body.message ?? "").trim();
  if (!message) return json({ error: "Please enter a question." }, 400);
  if (message.length > MAX_MESSAGE_LEN) {
    return json({ error: "That message is too long." }, 400);
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? (body.history as ChatMessage[])
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LEN) }))
    : [];

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await ai.run(MODEL, { messages, max_tokens: 512 });
    const answer =
      typeof result?.response === "string" && result.response.trim()
        ? result.response.trim()
        : "Sorry — I couldn't generate an answer to that. Try rephrasing, or reach out via the contact form.";
    return json({ answer });
  } catch (err) {
    console.error("Workers AI error:", err);
    return json(
      { error: "The assistant is temporarily unavailable. Please try the contact form." },
      502,
    );
  }
};
