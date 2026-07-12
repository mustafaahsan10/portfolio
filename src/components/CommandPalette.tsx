import { Command } from "cmdk";
import { useEffect, useState } from "react";

interface ProjectRef {
  title: string;
  slug: string;
}

interface Props {
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  projects: ProjectRef[];
}

export default function CommandPalette({
  email,
  github,
  linkedin,
  resumeUrl,
  projects,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:open", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("cmdk:open", onOpen);
    };
  }, []);

  function goHash(hash: string) {
    setOpen(false);
    // ensure we're on the home page for anchor navigation
    if (location.pathname !== "/") location.href = `/${hash}`;
    else location.hash = hash;
  }
  function navigate(url: string) {
    setOpen(false);
    window.location.href = url;
  }
  function copyEmail() {
    setOpen(false);
    navigator.clipboard?.writeText(email);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        label="Command menu"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Type a command or search…"
          className="w-full border-b border-border bg-transparent px-4 py-3 font-mono text-sm text-fg placeholder:text-muted/60 focus:outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center font-mono text-xs text-muted">
            No results.
          </Command.Empty>

          <Command.Group heading="Navigate">
            <Command.Item onSelect={() => goHash("#ask")}>
              Ask the AI assistant
            </Command.Item>
            <Command.Item onSelect={() => goHash("#projects")}>Projects</Command.Item>
            <Command.Item onSelect={() => goHash("#about")}>About</Command.Item>
            <Command.Item onSelect={() => goHash("#skills")}>Skills</Command.Item>
            <Command.Item onSelect={() => goHash("#contact")}>Contact</Command.Item>
          </Command.Group>

          <Command.Group heading="Projects">
            {projects.map((p) => (
              <Command.Item
                key={p.slug}
                value={`project ${p.title}`}
                onSelect={() => navigate(`/projects/${p.slug}/`)}
              >
                {p.title}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Links & actions">
            <Command.Item onSelect={copyEmail}>Copy email address</Command.Item>
            <Command.Item value="github" onSelect={() => navigate(github)}>
              GitHub
            </Command.Item>
            <Command.Item value="linkedin" onSelect={() => navigate(linkedin)}>
              LinkedIn
            </Command.Item>
            <Command.Item value="resume cv" onSelect={() => navigate(resumeUrl)}>
              Résumé (PDF)
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
