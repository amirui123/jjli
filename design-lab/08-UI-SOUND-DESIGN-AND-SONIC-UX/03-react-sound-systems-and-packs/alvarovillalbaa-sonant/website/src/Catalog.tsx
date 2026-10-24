import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Code2,
  Headphones,
  Play,
  Search,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import {
  catalog,
  categories,
  createTheme,
  encodeWav,
  renderPCM,
  type SoundEvent,
  type ThemeName,
} from "@alvarovillalbaa/sonant";
import { useSound } from "@alvarovillalbaa/sonant/react";
import { Code, CopyButton, Waveform, download } from "./ui";

export function Catalog({
  theme,
  setTheme,
}: {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}) {
  const sound = useSound();
  const [category, setCategory] = useState("All sounds");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SoundEvent>("state.success");
  const [playing, setPlaying] = useState<string | null>(null);
  const [message, setMessage] = useState("Choose a cue. Hear the difference.");
  const [codeMode, setCodeMode] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const filtered = catalog.filter(
    ([event, label, group]) =>
      (category === "All sounds" || group === category) &&
      `${event} ${label}`.toLowerCase().includes(query.toLowerCase()),
  );
  const cue = catalog.find(([event]) => event === selected)!;
  const currentTheme = useMemo(() => createTheme(theme), [theme]);
  const recipe = currentTheme[selected];
  const usage = `void sound.emit("${selected}", {\n  visibleEquivalent: true,\n});`;
  const preview = async (event: SoundEvent) => {
    setSelected(event);
    const handle = await sound.emit(event, {
      source: "SoundCatalog",
      surface: "playground",
      visibleEquivalent: true,
    });
    setMessage(
      handle.decision === "played"
        ? `Playing ${catalog.find(([id]) => id === event)![1].toLowerCase()}.`
        : `Sound ${handle.reason === "muted" ? "is off. Enable sound in the header to listen." : `was ${handle.decision}: ${handle.reason}.`}`,
    );
    clearTimeout(timer.current);
    setPlaying(handle.decision === "played" ? event : null);
    timer.current = setTimeout(() => setPlaying(null), 650);
  };
  return (
    <section className="catalog-section" id="sounds">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE SOUND LIBRARY</span>
          <h2>
            A sound for every small moment<span className="accent-dot">.</span>
          </h2>
          <p>Press play. Find your character. Make it your own.</p>
        </div>
        <span className="catalog-count">
          32 cues<span>/</span>3 characters
        </span>
      </div>
      <div className="studio">
        <div className="studio-toolbar">
          <div className="studio-title">
            <span className="status-dot" />
            SOUND EXPLORER<span className="beta-badge">LIVE</span>
          </div>
          <div className="studio-theme">
            <SlidersHorizontal size={14} />
            <label htmlFor="catalog-theme">Character</label>
            <div className="select-wrap">
              <select
                id="catalog-theme"
                aria-label="Sound character"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
              >
                <option value="studio">Studio</option>
                <option value="soft">Soft</option>
                <option value="arcade">Arcade</option>
              </select>
              <ChevronDown size={12} />
            </div>
          </div>
        </div>
        <div className="studio-body">
          <aside className="catalog-sidebar">
            <span className="sidebar-label">COLLECTION</span>
            <div className="category-list">
              {["All sounds", ...categories].map((group) => (
                <button
                  key={group}
                  className={category === group ? "active" : ""}
                  aria-pressed={category === group}
                  onClick={() => setCategory(group)}
                >
                  <span>{group}</span>
                  <span>
                    {group === "All sounds"
                      ? catalog.length
                      : catalog.filter((c) => c[2] === group).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="sidebar-note">
              <Headphones size={19} />
              <p>
                Made for interfaces.
                <br />
                Easy on the ears.
              </p>
              <a href="#/docs/accessibility">
                Sound, thoughtfully
                <ArrowUpRight size={12} />
              </a>
            </div>
          </aside>
          <div className="catalog-main">
            <div className="catalog-search">
              <Search size={15} />
              <input
                aria-label="Search sounds"
                placeholder="Find your sound…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span>{filtered.length} SOUNDS</span>
            </div>
            <div className="sound-grid">
              {filtered.map(([event, label, group], index) => (
                <button
                  key={event}
                  className={`sound-card ${selected === event ? "selected" : ""} ${playing === event ? "is-playing" : ""}`}
                  onClick={() => void preview(event)}
                  aria-label={`Preview ${label}`}
                  aria-pressed={selected === event}
                >
                  <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="card-play">
                    <Play size={12} fill="currentColor" />
                  </span>
                  <Waveform event={event} theme={theme} playing={playing === event} />
                  <span className="sound-card-bottom">
                    <span>
                      <strong>{label}</strong>
                      <small>{group}</small>
                    </span>
                    <span className="sound-duration">
                      {Math.round(currentTheme[event].duration * 1000)}ms
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty-state">
                <Search size={25} />
                <h3>No sounds found.</h3>
                <p>Try a semantic event, like success or select.</p>
                <button
                  className="button secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("All sounds");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <aside className="cue-inspector">
            <div className="inspector-label">
              <span>NOW SELECTED</span>
              <span className="tag">{cue[2]}</span>
            </div>
            <div className="inspector-wave">
              <Waveform event={selected} theme={theme} playing={playing === selected} large />
              <button
                aria-label={`Play selected ${cue[1]}`}
                className="round-play"
                onClick={() => void preview(selected)}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
            <h3>
              {cue[1]}
              <span className="accent-dot">.</span>
            </h3>
            <code className="event-name">{selected}</code>
            <p>{cue[3]}</p>
            <div className="inspector-specs">
              <div>
                <span>CHARACTER</span>
                <strong>{theme}</strong>
              </div>
              <div>
                <span>DURATION</span>
                <strong>{Math.round(recipe.duration * 1000)} ms</strong>
              </div>
              <div>
                <span>SOURCE</span>
                <strong>Synthesized</strong>
              </div>
            </div>
            <div className="usage-tabs">
              <button aria-pressed={!codeMode} onClick={() => setCodeMode(false)}>
                Usage
              </button>
              <button aria-pressed={codeMode} onClick={() => setCodeMode(true)}>
                Recipe
              </button>
              <Code2 size={13} />
            </div>
            <pre className="mini-code" tabIndex={0} role="region" aria-label="Selected sound code">
              <code>{codeMode ? JSON.stringify(recipe, null, 2) : usage}</code>
            </pre>
            <div className="inspector-actions">
              <CopyButton
                value={codeMode ? JSON.stringify(recipe, null, 2) : usage}
                label={codeMode ? "Copy recipe" : "Copy code"}
              />
              <button
                className="icon-button"
                aria-label={`Download ${cue[1]} WAV`}
                onClick={() => {
                  const wav = encodeWav(renderPCM(recipe));
                  download(`${selected}-${theme}.wav`, wav.buffer as ArrayBuffer, "audio/wav");
                }}
              >
                <ArrowDownToLine size={16} />
              </button>
            </div>
            <a className="inspector-link" href="#/create">
              Make this character yours
              <ArrowRight size={14} />
            </a>
          </aside>
        </div>
        <div className="studio-status">
          <span role="status">
            <span className={sound.preferences.enabled ? "status-dot" : "status-dot muted"} />
            {message}
          </span>
          <label>
            <Volume2 size={14} />
            <span className="sr-only">Preview volume</span>
            <input
              aria-label="Preview volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sound.preferences.volume}
              onChange={(e) => sound.setPreferences({ volume: Number(e.target.value) })}
            />
            <span>{Math.round(sound.preferences.volume * 100)}%</span>
          </label>
        </div>
      </div>
      <div className="catalog-footnote">
        <span>Original, deterministic synthesis. No audio files to fetch. No tracking.</span>
        <a href="#/examples">
          Hear them in context
          <ArrowUpRight size={14} />
        </a>
      </div>
      <div className="quick-start">
        <div>
          <span className="eyebrow">SMALL API. BIG FEELING.</span>
          <h2>
            Say what happened.
            <br />
            We’ll give it character.
          </h2>
          <p>
            Describe the interaction, not the waveform. Swap your entire sound character without
            changing a line of product code.
          </p>
          <a className="button text" href="#/docs">
            Explore the API
            <ArrowRight size={15} />
          </a>
        </div>
        <Code>{`"use client";\n\nimport { useSound } from "@alvarovillalbaa/sonant/react";\n\nexport function SaveButton() {\n  const sound = useSound();\n\n  return (\n    <button onClick={() => {\n      // After your save completes:\n      void sound.emit("state.success", {\n        visibleEquivalent: true,\n      });\n    }}>\n      Saved — play confirmation\n    </button>\n  );\n}`}</Code>
      </div>
    </section>
  );
}
