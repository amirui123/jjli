import { useEffect, useState } from "react";
import HeroFigure from "./components/HeroFigure.jsx";
import SkillsView from "./views/SkillsView.jsx";
import LibrariesView from "./views/LibrariesView.jsx";
import DocsView from "./views/DocsView.jsx";
import { stats, libraries, docs, totalStars, totalDownloads, formatCount } from "./data.js";

/* ── theme ─────────────────────────────────────────────────────── */

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("atlas-theme") || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("atlas-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

/* ── the number strip ──────────────────────────────────────────── */

function Measure({ value, unit, label }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1 overflow-hidden">
        <span className="display text-[clamp(1.75rem,4vw,3.25rem)] leading-none tabular">
          {value}
        </span>
        {unit ? (
          <span className="text-[13px] leading-none text-ink-soft">{unit}</span>
        ) : null}
      </div>
      <span className="label">{label}</span>
    </div>
  );
}

/* ── views ─────────────────────────────────────────────────────── */

const VIEWS = [
  { id: "libraries", label: "Libraries" },
  { id: "skills", label: "Skills" },
  { id: "docs", label: "Reading" },
];

export default function App() {
  const [theme, setTheme] = useTheme();
  const [view, setView] = useState("libraries");

  return (
    <div className="min-h-screen bg-plate text-ink">
      {/* ── masthead: wordmark, three links, one action ───────────── */}
      <header className="sticky top-0 z-50 border-b border-lo bg-plate/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 sm:px-8">
          <a
            href="#top"
            className="display text-[15px] tracking-[-0.03em] shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            agent<span className="text-signal">·</span>atlas
          </a>

          <nav className="flex items-center gap-1" aria-label="Sections">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                aria-current={view === v.id}
                className={`relative px-2 py-1.5 text-[13px] transition-colors duration-200 sm:px-3 ${
                  view === v.id ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {v.label}
                {view === v.id ? (
                  <span className="absolute inset-x-1 -bottom-[13px] h-[2px] bg-signal sm:inset-x-2" />
                ) : null}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="https://github.com/youssefvdel/agent-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-[13px] text-ink-soft transition-colors hover:text-ink md:inline"
            >
              Source
            </a>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-lo text-[11px] text-ink-soft transition-colors hover:border-edge hover:text-ink"
            >
              {theme === "dark" ? "◐" : "◑"}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {view === "libraries" && (
          <LibrariesView theme={theme}>
            <HeroFigure theme={theme} />
          </LibrariesView>
        )}
        {view === "skills" && <SkillsView />}
        {view === "docs" && <DocsView />}
      </main>

      {/* ── footer: the name at full width ───────────────────────── */}
      <footer className="mt-28 border-t border-lo">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <p className="display text-[clamp(2.5rem,9vw,7rem)] leading-[0.82]">
              agent·atlas
            </p>
            <div className="flex gap-10 text-[13px] text-ink-soft">
              <div className="flex flex-col gap-1.5">
                <span className="label">Measured</span>
                <span className="text-ink tabular">{formatCount(totalStars)} stars</span>
                <span className="text-ink tabular">
                  {formatCount(totalDownloads)} downloads/week
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="label">Catalogd</span>
                <span className="text-ink tabular">{libraries.length} libraries</span>
                <span className="text-ink tabular">{docs.length} documents</span>
              </div>
            </div>
          </div>
          <p className="mt-10 max-w-[60ch] text-[13px] leading-relaxed text-ink-soft">
            Every number here came from a live API response — the npm registry
            and the GitHub API — not from a model&apos;s memory. The pipeline
            that produces it is in the repository, and it runs again on demand.
          </p>
        </div>
      </footer>
    </div>
  );
}

export { Measure };
