import { useEffect, useRef, useState } from "react";
import { terrain, phosphor, riffle } from "@lucasmarkes/hairline";

/**
 * The hero. hairline's own Terrain figure answers the pointer: eighty-one
 * pillars on a plinth that rise around it.
 *
 * The point is not decoration. The atlas is a *measurement* of the front-end
 * ecosystem, and the figure is the one thing on the page that is itself
 * measured — the same library, live, in the page that documents it.
 */

const FIGURES = [
  { id: "terrain", make: terrain, label: "Eighty-one pillars rise around the pointer" },
  { id: "phosphor", make: phosphor, label: "A dot matrix that fades like phosphor where you paint" },
  { id: "riffle", make: riffle, label: "Eight cards; the one under the pointer stands up" },
];

export default function HeroFigure({ intensity = 0.55, theme = "auto" }) {
  const host = useRef(null);
  const fig = useRef(null);
  const [read, setRead] = useState("rest");
  const [which, setWhich] = useState(0);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const { make } = FIGURES[which];
    fig.current = make(el, {
      intensity,
      theme,
      play: true,
      onRead: (t) => setRead(t),
    });
    return () => {
      fig.current?.destroy();
      fig.current = null;
    };
  }, [which, theme]);

  useEffect(() => {
    fig.current?.update({ intensity });
  }, [intensity]);

  return (
    <figure className="relative">
      <div
        ref={host}
        data-hairline=""
        className="w-full"
        style={{ aspectRatio: "5 / 4" }}
        role="img"
        aria-label={FIGURES[which].label}
      />

      {/* the read-out: a name in a few characters, outside the drawing */}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-lo pt-3">
        <div className="flex items-baseline gap-3">
          <span className="label">reads</span>
          <p className="readout truncate">{read}</p>
          <span className="label">· {FIGURES[which].name}</span>
        </div>
        <div
          className="flex gap-1"
          role="group"
          aria-label="Choose a figure"
        >
          {FIGURES.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setWhich(i)}
              aria-pressed={i === which}
              title={f.label}
              className={`h-1.5 w-6 transition-colors duration-300 ${
                i === which ? "bg-ink" : "bg-mid hover:bg-edge"
              }`}
            >
              <span className="sr-only">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}
