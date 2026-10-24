import { docs } from "../data.js";

const GROUPS = ["Start here", "Libraries", "Ecosystem", "This machine", "Index"];

export default function DocsView() {
  const byGroup = GROUPS.map((g) => [g, docs.filter((d) => d.group === g)]).filter(
    ([, list]) => list.length,
  );

  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-12 pb-20 sm:px-8 sm:pt-20">
      <div className="stagger max-w-[58ch]">
        <h1 className="display-xl text-[clamp(2.5rem,6vw,4.75rem)]">
          The reading.
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-ink/80">
          {docs.length} documents, every claim in them checked against a live
          source. Start with the one-page stack, then go deep on whatever you
          are building.
        </p>
      </div>

      <div className="mt-14 space-y-14">
        {byGroup.map(([group, list]) => (
          <div key={group}>
            <h2 className="display text-[22px]">{group}</h2>
            <div className="mt-5 border-t border-lo">
              {list.map((d) => (
                <a
                  key={d.path}
                  href={`./${d.path}`}
                  className="group grid gap-x-6 gap-y-1 border-b border-lo py-4 transition-colors hover:bg-wash sm:grid-cols-[1fr_auto] sm:px-2"
                >
                  <div>
                    <h3 className="text-[16px] font-medium tracking-[-0.01em] group-hover:text-signal">
                      {d.title}
                    </h3>
                    <p className="mt-1 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                      {d.blurb}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3 sm:justify-end">
                    <span className="font-mono text-[11px] text-ink-soft tabular">
                      {d.kb} KB
                    </span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {d.path}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
