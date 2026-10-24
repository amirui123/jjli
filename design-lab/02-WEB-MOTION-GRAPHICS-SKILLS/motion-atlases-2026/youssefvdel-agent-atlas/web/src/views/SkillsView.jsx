import { useMemo, useState } from "react";
import { skills, tree, stats, DOMAIN_LABELS } from "../data.js";

/* ── the tree, as an indented outline ──────────────────────────── */

function Branch({ domain, subdomains, query }) {
  const [open, setOpen] = useState(true);
  const count = useMemo(
    () =>
      Object.values(subdomains)
        .flatMap((caps) => Object.values(caps))
        .flat().length,
    [subdomains],
  );

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-baseline gap-3 py-2 text-left"
        aria-expanded={open}
      >
        <span
          className={`text-[10px] text-mid transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          ▸
        </span>
        <span className="display text-[17px] tracking-[-0.02em] group-hover:text-signal">
          {DOMAIN_LABELS[domain] || domain}
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-soft tabular">
          {count}
        </span>
      </button>

      {open ? (
        <div className="ml-[7px] border-l border-lo pl-5">
          {Object.entries(subdomains).map(([sub, caps]) => (
            <div key={sub} className="py-1.5">
              <p className="label">{sub.replace(/-/g, " ")}</p>
              <ul className="mt-1.5 space-y-1">
                {Object.entries(caps).flatMap(([cap, names]) =>
                  names.map((name) => {
                    const s = skills.find((x) => x.name === name);
                    if (!s) return null;
                    const desc = (s.description || "").split(".")[0];
                    return (
                      <li key={name} className="group/skill py-0.5">
                        <details className="group/d">
                          <summary className="flex cursor-pointer list-none items-baseline gap-2 py-1 marker:hidden hover:bg-wash">
                            {/* a disclosure triangle, not a plus: this is a
                                tree, and a "+" reads as "add" */}
                            <span
                              className="text-[9px] text-mid transition-transform duration-200 group-open/d:rotate-90"
                              aria-hidden
                            >
                              ▸
                            </span>
                            <span className="text-[14px] tracking-[-0.01em]">
                              {name}
                            </span>
                            <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-soft tabular">
                              {s.code} code · {s.files} {s.files === 1 ? "file" : "files"}
                            </span>
                          </summary>
                          <p className="ml-[17px] max-w-[62ch] pb-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                            {desc}.{" "}
                            <span className="font-mono text-[11px]">
                              {s.path}
                            </span>
                          </p>
                        </details>
                      </li>
                    );
                  }),
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SkillsView() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tree;
    const out = {};
    for (const [domain, subs] of Object.entries(tree)) {
      const kept = {};
      for (const [sub, caps] of Object.entries(subs)) {
        const keptCaps = {};
        for (const [cap, names] of Object.entries(caps)) {
          const keep = names.filter((n) => {
            const s = skills.find((x) => x.name === n);
            return (
              s &&
              (s.name.toLowerCase().includes(needle) ||
                (s.description || "").toLowerCase().includes(needle) ||
                s.capability.toLowerCase().includes(needle) ||
                s.subdomain.toLowerCase().includes(needle))
            );
          });
          if (keep.length) keptCaps[cap] = keep;
        }
        if (Object.keys(keptCaps).length) kept[sub] = keptCaps;
      }
      if (Object.keys(kept).length) out[domain] = kept;
    }
    return out;
  }, [q]);

  const shown = useMemo(
    () =>
      Object.values(filtered)
        .flatMap((s) => Object.values(s))
        .flatMap((c) => Object.values(c))
        .flat().length,
    [filtered],
  );

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pt-12 pb-14 sm:px-8 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="stagger lg:sticky lg:top-24 lg:self-start">
            <h1 className="display-xl max-w-[14ch] text-[clamp(2.5rem,6vw,4.75rem)]">
              Every skill on this machine, filed.
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-ink/80">
              {stats.total} agent skills, parsed from their own frontmatter and
              placed by a deterministic rule. {stats.total_code_blocks.toLocaleString()}{" "}
              code blocks and {stats.total_linked_files} supporting files, indexed
              by what they actually do.
            </p>

            <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 sm:max-w-[420px]">
              {[
                [stats.domains, "domains"],
                [stats.total_code_blocks.toLocaleString(), "code blocks"],
                [stats.total_linked_files, "linked files"],
                [`${stats.spec_clean}/${stats.total}`, "spec clean"],
              ].map(([v, k]) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="label">{k}</dt>
                  <dd className="display text-[28px] leading-none tabular">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-3">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find a skill…"
                aria-label="Filter skills"
                className="min-w-0 flex-1 rounded-[3px] border border-lo bg-plate px-3 py-2 text-[13px] text-ink placeholder:text-edge transition-colors focus:border-edge focus:outline-none"
              />
              <span className="font-mono text-[12px] text-ink-soft tabular">
                {shown} shown
              </span>
            </div>

            <div>
              {Object.keys(filtered).length ? (
                Object.entries(filtered).map(([domain, subs]) => (
                  <Branch key={domain} domain={domain} subdomains={subs} query={q} />
                ))
              ) : (
                <p className="py-8 text-[13px] text-ink-soft">
                  No skill matches that. Try{" "}
                  <code className="font-mono">animation</code>,{" "}
                  <code className="font-mono">design</code> or{" "}
                  <code className="font-mono">review</code>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
