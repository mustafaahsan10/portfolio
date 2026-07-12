import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  accessKey: string;
}

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none";

export default function ContactForm({ accessKey }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", accessKey);
    formData.append("subject", "New message from your portfolio");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong — please email me directly.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please email me directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-accent/40 bg-accent/5 p-6">
        <p className="font-mono text-sm text-accent">// message sent</p>
        <p className="mt-2 text-fg">
          Thanks — your message is on its way. I'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* honeypot — hidden from humans, catches bots */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-muted">name</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputCls}
            placeholder="Jane Recruiter"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-muted">email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            placeholder="jane@company.com"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs text-muted">message</span>
        <textarea
          name="message"
          required
          rows={5}
          className={inputCls}
          placeholder="Hi Mustafa — we're hiring a…"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-accent px-5 py-2 font-mono text-sm font-medium text-[#04141a] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
        {status === "error" && (
          <p className="font-mono text-xs text-red-400">{errorMsg}</p>
        )}
      </div>
    </form>
  );
}
