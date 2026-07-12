import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  suggestions: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AskAI({ suggestions }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function reveal(full: string) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMessages((m) => [...m, { role: "assistant", content: full }]);
      return;
    }
    const words = full.split(" ");
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    let acc = "";
    for (let i = 0; i < words.length; i++) {
      acc += (i ? " " : "") + words[i];
      const current = acc;
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: "assistant", content: current };
        return copy;
      });
      await sleep(16);
    }
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setError("");
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      await reveal(data.answer as string);
    } catch {
      setError(
        "The assistant is unavailable right now — please use the contact form below.",
      );
    } finally {
      setLoading(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        <span className="font-mono text-sm text-muted">
          ask-my-portfolio <span className="text-accent">·</span> AI assistant
        </span>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex max-h-96 min-h-56 flex-col gap-4 overflow-y-auto px-4 py-5"
      >
        {empty && (
          <div className="text-sm leading-relaxed text-muted">
            Ask me anything about Mustafa's experience, projects, or fit for a
            role — I answer from his real background.
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="text-sm leading-relaxed">
            <span
              className={`mr-2 font-mono text-xs ${
                m.role === "user" ? "text-muted" : "text-accent"
              }`}
            >
              {m.role === "user" ? "you:" : "ai:"}
            </span>
            <span className={m.role === "user" ? "text-fg" : "text-fg"}>
              {m.content}
              {m.role === "assistant" && loading && i === messages.length - 1 && (
                <span className="cursor">▊</span>
              )}
            </span>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="font-mono text-xs text-muted">
            <span className="text-accent">ai:</span> thinking<span className="cursor">…</span>
          </div>
        )}

        {error && <div className="font-mono text-xs text-red-400">{error}</div>}
      </div>

      {/* suggestions */}
      {empty && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <span className="pl-1 font-mono text-sm text-accent" aria-hidden="true">
          &gt;
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about my experience…"
          maxLength={1000}
          aria-label="Ask the portfolio assistant a question"
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg placeholder:text-muted/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#04141a] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          send
        </button>
      </form>
    </div>
  );
}
