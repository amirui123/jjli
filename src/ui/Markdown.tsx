import React, { useMemo } from "react";
import { cn } from "./kit";

/**
 * Small, dependency-free markdown renderer for SKILL.md / DESIGN.md documents.
 * Handles headings, lists, fenced code, inline code, bold, links and quotes.
 */
export const Markdown: React.FC<{ source: string; className?: string }> = ({
  source,
  className,
}) => {
  const blocks = useMemo(() => parse(source), [source]);
  return (
    <div className={cn("markdown-body space-y-2.5 text-[12px] leading-[1.9] text-zinc-300", className)} dir="rtl">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h1":
            return (
              <h1 key={i} className="mt-1 border-b border-white/[0.07] pb-2 text-[17px] font-bold text-white">
                {b.text}
              </h1>
            );
          case "h2":
            return (
              <h2 key={i} className="mt-4 text-[14px] font-bold text-zinc-100">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-3 text-[12.5px] font-semibold text-zinc-200">
                {b.text}
              </h3>
            );
          case "code":
            return (
              <pre
                key={i}
                dir="ltr"
                className="overflow-x-auto rounded-lg border border-white/[0.07] bg-black/50 p-2.5 text-start font-mono text-[10.5px] leading-relaxed text-zinc-300"
              >
                <code>{b.text}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-s-2 border-[color:var(--accent)]/50 bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-zinc-400">
                {b.text}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--accent)]/70" />
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="font-mono text-[10px] text-zinc-600">{j + 1}.</span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="text-zinc-400">
                {inline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
};

type Block =
  | { type: "h1" | "h2" | "h3" | "code" | "quote" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parse(source: string): Block[] {
  const lines = source.split("\n");
  const out: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push({ type: "code", text: (lang ? `// ${lang}\n` : "") + buf.join("\n") });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      out.push({ type: "h1", text: trimmed.slice(2) });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      out.push({ type: "h2", text: trimmed.slice(3) });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
      out.push({ type: "h3", text: trimmed.replace(/^#+\s/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("> ")) {
      out.push({ type: "quote", text: trimmed.slice(2) });
      i++;
      continue;
    }
    if (trimmed === "---" || trimmed === "***") {
      out.push({ type: "p", text: "—" });
      i++;
      continue;
    }

    if (/^[-*+]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s/, ""));
        i++;
      }
      out.push({ type: "ul", items });
      continue;
    }

    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s/, ""));
        i++;
      }
      out.push({ type: "ol", items });
      continue;
    }

    out.push({ type: "p", text: trimmed });
    i++;
  }

  return out;
}

function inline(text: string): React.ReactNode {
  // bold, inline code, links
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} dir="ltr" className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[10.5px] text-teal-200">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const url = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <a key={key++} href={url} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] underline underline-offset-2">
          {label}
        </a>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
