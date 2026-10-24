import { useMemo, useState } from "react";
import {
  libraries,
  categories,
  categoryLabel,
  formatCount,
  formatBytes,
  topByStars,
  topByDownloads,
} from "../data.js";
import { Measure } from "../App.jsx";

/* ── one library, as a row of measured fields ──────────────────── */

function Row({ lib }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(lib.description || lib.npm || lib.repo);

  return (
    <>
      <tr
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`group cursor-pointer border-b border-lo align-top transition-colors ${
          open ? "bg-wash" : "hover:bg-wash"
        }`}
      >
        <td className="py-3 pr-4 pl-4 sm:pl-5">
          <div className="flex items-baseline gap-2">
            {hasDetail ? (
              <span
                className={`text-[10px] text-mid transition-colors ${
                  open ? "text-signal" : "group-hover:text-ink-soft"
                }`}
                aria-hidden
              >
                {open ? "−" : "+"}
              </span>
            ) : null}
            <span className="font-medium tracking-[-0.01em]">{lib.name}</span>
          </div>
          {lib.archived ? (
            <span className="mt-1 inline-block text-[10px] text-ink-soft">archived</span>
          ) : null}
        </td>

        <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft">
          {lib.npm || "—"}
        </td>

        <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft tabular">
          {lib.version || "—"}
        </td>

        <td className="py-3 pr-4 text-right font-mono text-[12px] tabular">
          {formatCount(lib.stars)}
        </td>

        <td className="py-3 pr-4 text-right font-mono text-[12px] text-ink-soft tabular">
          {formatCount(lib.dl)}
        </td>

        <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft">
          {lib.license || "—"}
        </td>

        <td className="py-3 pr-4 text-right font-mono text-[12px] text-ink-soft tabular">
          {formatBytes(lib.unpacked)}
        </td>

        <td className="py-3 pr-4 text-[12px] text-ink-soft sm:pr-5">
          {categoryLabel(lib.category)}
        </td>
      </tr>

      {open ? (
        <tr className="border-b border-lo bg-wash">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <p className="max-w-[68ch] text-[13px] leading-relaxed text-ink/85">
                {lib.description || "No description published."}
              </p>
              <div className="flex flex-col items-start gap-1.5 text-[12px] sm:items-end">
                {lib.repo ? (
                  <a
                    href={`https://github.com/${lib.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal hover:underline"
                  >
                    {lib.repo}
                  </a>
                ) : null}
                {lib.homepage ? (
                  <a
                    href={lib.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft hover:text-ink"
                  >
                    {lib.homepage.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
                {lib.tags?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1 sm:justify-end">
                    {lib.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-[2px] bg-plate px-1.5 py-0.5 font-mono text-[10px] text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

/* ── the table, one variant per data shape ─────────────────────── */

/* The npm variant carries versions, downloads and sizes. The GitHub
   variant does not — showing empty columns for 168 rows would make the
   page look broken rather than honest, so each shape gets its own
   table with only the fields it actually has. */
function NpmTable({ rows }) {
  return (
    <table className="w-full min-w-[760px] border-collapse">
      <thead>
        <tr className="border-b border-ink">
          <th className="label py-2 pr-4 pl-4 text-left font-normal sm:pl-5">Library</th>
          <th className="label py-2 pr-4 text-left font-normal">Package</th>
          <th className="label py-2 pr-4 text-left font-normal">Version</th>
          <th className="label py-2 pr-4 text-right font-normal">Stars</th>
          <th className="label py-2 pr-4 text-right font-normal">DL/wk</th>
          <th className="label py-2 pr-4 text-left font-normal">License</th>
          <th className="label py-2 pr-4 text-right font-normal">Size</th>
          <th className="label py-2 pr-4 text-left font-normal sm:pr-5">Category</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <Row key={l.repo || l.name} lib={l} />
        ))}
      </tbody>
    </table>
  );
}

function RepoTable({ rows }) {
  return (
    <table className="w-full min-w-[680px] border-collapse">
      <thead>
        <tr className="border-b border-ink">
          <th className="label py-2 pr-4 pl-4 text-left font-normal sm:pl-5">Repository</th>
          <th className="label py-2 pr-4 text-left font-normal">Owner</th>
          <th className="label py-2 pr-4 text-right font-normal">Stars</th>
          <th className="label py-2 pr-4 text-left font-normal">License</th>
          <th className="label py-2 pr-4 text-left font-normal">Last push</th>
          <th className="label py-2 pr-4 text-left font-normal sm:pr-5">Category</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((l) => (
          <tr
            key={l.repo || l.name}
            className="group border-b border-lo align-top transition-colors hover:bg-wash"
          >
            <td className="py-3 pr-4 pl-4 sm:pl-5">
              <a
                href={`https://github.com/${l.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium tracking-[-0.01em] hover:text-signal"
              >
                {l.name}
              </a>
              {l.archived ? (
                <span className="mt-1 block text-[10px] text-ink-soft">archived</span>
              ) : null}
            </td>
            <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft">
              {l.repo?.split("/")[0]}
            </td>
            <td className="py-3 pr-4 text-right font-mono text-[12px] tabular">
              {formatCount(l.stars)}
            </td>
            <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft">
              {l.license || "—"}
            </td>
            <td className="py-3 pr-4 font-mono text-[12px] text-ink-soft tabular">
              {l.pushed || "—"}
            </td>
            <td className="py-3 pr-4 text-[12px] text-ink-soft sm:pr-5">
              {categoryLabel(l.category)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── the view ──────────────────────────────────────────────────── */

export default function LibrariesView({ theme, children }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("stars");
  const [shape, setShape] = useState("npm");

  const all = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return libraries.filter((l) => {
      if (cat && l.category !== cat) return false;
      if (!needle) return true;
      return (
        l.name?.toLowerCase().includes(needle) ||
        l.npm?.toLowerCase().includes(needle) ||
        l.repo?.toLowerCase().includes(needle) ||
        l.description?.toLowerCase().includes(needle) ||
        l.tags?.join(" ").toLowerCase().includes(needle)
      );
    });
  }, [q, cat]);

  const npmRows = useMemo(
    () =>
      all
        .filter((l) => l.npm)
        .sort((a, b) =>
          sort === "dl"
            ? (b.dl || 0) - (a.dl || 0)
            : sort === "name"
              ? (a.name || "").localeCompare(b.name || "")
              : sort === "pushed"
                ? String(b.pushed || "").localeCompare(String(a.pushed || ""))
                : (b.stars || 0) - (a.stars || 0),
        ),
    [all, sort],
  );

  const repoRows = useMemo(
    () =>
      all
        .filter((l) => !l.npm)
        .sort((a, b) =>
          sort === "dl"
            ? (b.dl || 0) - (a.dl || 0)
            : sort === "name"
              ? (a.name || "").localeCompare(b.name || "")
              : sort === "pushed"
                ? String(b.pushed || "").localeCompare(String(a.pushed || ""))
                : (b.stars || 0) - (a.stars || 0),
        ),
    [all, sort],
  );

  const rows = shape === "npm" ? npmRows : repoRows;

  return (
    <>
      {/* ── hero: the figure and the claim, side by side ────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* On a phone the figure comes first: the artifact leads, the
              copy explains it. On a wide screen they sit side by side. */}
          <div className="order-1 lg:order-2">
            {children}
            <div className="mt-4 border-l-2 border-signal pl-4">
              <p className="text-[13px] leading-relaxed text-ink/85">
                The anchor library, running. It is the same package this page
                documents — 33 isometric line figures that answer the pointer,
                zero dependencies, MIT.
              </p>
              <a
                href="https://github.com/lucasmarkes/hairline"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-mono text-[12px] text-signal hover:underline"
              >
                lucasmarkes/hairline
              </a>
            </div>
          </div>

          <div className="stagger order-2 lg:order-1">
            <h1 className="display-xl max-w-[15ch] text-[clamp(2.75rem,7vw,5.5rem)]">
              The front-end ecosystem, measured.
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-ink/85">
              Every animation library, agent skill and design tool — with
              live stars, versions, licenses and weekly downloads pulled from
              the npm registry and the GitHub API. Nothing here is remembered.
              Nothing here is a guess.
            </p>
            <div className="mt-9 grid grid-cols-3 items-start gap-x-4 gap-y-6 sm:gap-x-6">
              <Measure value={libraries.length} label="libraries cataloged" />
              <Measure
                value={formatCount(
                  libraries.reduce((s, l) => s + (l.stars || 0), 0),
                )}
                unit="★"
                label="stars counted"
              />
              <Measure
                value={formatCount(
                  libraries.reduce((s, l) => s + (l.dl || 0), 0),
                )}
                unit="/wk"
                label="downloads"
              />
            </div>

            {/* the pipeline, in one line. The page is the pipeline's
                output, and saying so is more useful than another stat. */}
            <p className="mt-10 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
              The catalog is generated, not written. A scraper resolves each
              package to its canonical repository, checks that the repo is not
              a fork or an impersonator, then pulls stars, versions, licenses
              and weekly downloads from the npm registry and the GitHub API.
              Re-run it and the numbers move.
            </p>
          </div>

        </div>
      </section>

      {/* ── two columns of facts, not a card grid ─────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-10 border-t border-lo pt-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="display text-[22px]">Most starred</h2>
            <p className="mt-1.5 text-[13px] text-ink-soft">
              The names with the most attention.
            </p>
            <ol className="mt-5">
              {topByStars.map((l, i) => (
                <li
                  key={l.repo || l.name}
                  className="flex items-baseline gap-4 border-b border-lo py-2.5 last:border-0"
                >
                  <span className="w-5 shrink-0 font-mono text-[11px] text-ink-soft">
                    {i + 1}
                  </span>
                  <a
                    href={`https://github.com/${l.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-[14px] hover:underline"
                  >
                    {l.name}
                  </a>
                  <span className="shrink-0 font-mono text-[12px] tabular text-ink">
                    {formatCount(l.stars)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="display text-[22px]">Most installed</h2>
            <p className="mt-1.5 text-[13px] text-ink-soft">
              The names that ship every week.
            </p>
            <ol className="mt-5">
              {topByDownloads.map((l, i) => (
                <li
                  key={l.repo || l.name}
                  className="flex items-baseline gap-4 border-b border-lo py-2.5 last:border-0"
                >
                  <span className="w-5 shrink-0 font-mono text-[11px] text-ink-soft">
                    {i + 1}
                  </span>
                  <a
                    href={`https://github.com/${l.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-[14px] hover:underline"
                  >
                    {l.name}
                  </a>
                  <span className="shrink-0 font-mono text-[12px] tabular text-ink">
                    {formatCount(l.dl)}/wk
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── the table ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="display text-[clamp(1.75rem,3vw,2.5rem)]">Everything</h2>
            <p className="mt-2 text-[13px] text-ink-soft tabular">
              {rows.length} shown
              {shape === "npm" ? " · published on npm" : " · GitHub only"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name, package, tag…"
              aria-label="Filter libraries"
              className="w-[230px] rounded-[3px] border border-lo bg-plate px-3 py-2 text-[13px] text-ink placeholder:text-edge transition-colors focus:border-edge focus:outline-none"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label="Filter by category"
              className="rounded-[3px] border border-lo bg-plate px-3 py-2 text-[13px] text-ink transition-colors focus:border-edge focus:outline-none"
            >
              <option value="">all categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort"
              className="rounded-[3px] border border-lo bg-plate px-3 py-2 text-[13px] text-ink transition-colors focus:border-edge focus:outline-none"
            >
              <option value="stars">sort: stars</option>
              <option value="dl">sort: downloads</option>
              <option value="pushed">sort: recently pushed</option>
              <option value="name">sort: name</option>
            </select>
          </div>
        </div>

        {/* the split: npm packages and GitHub-only repos are different
            shapes of thing, and they get different tables */}
        <div className="mt-6 flex gap-6 border-b border-lo">
          {[
            ["npm", "npm packages", npmRows.length],
            ["github", "GitHub only", repoRows.length],
          ].map(([id, label, n]) => (
            <button
              key={id}
              onClick={() => setShape(id)}
              aria-current={shape === id}
              className={`-mb-px border-b-2 pb-2.5 text-[13px] transition-colors ${
                shape === id
                  ? "border-signal text-ink"
                  : "border-transparent text-edge hover:text-ink"
              }`}
            >
              {label}{" "}
              <span className="font-mono text-[11px] text-ink-soft tabular">{n}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          {shape === "npm" ? (
            <NpmTable rows={npmRows} />
          ) : (
            <RepoTable rows={repoRows} />
          )}
        </div>
      </section>
    </>
  );
}
