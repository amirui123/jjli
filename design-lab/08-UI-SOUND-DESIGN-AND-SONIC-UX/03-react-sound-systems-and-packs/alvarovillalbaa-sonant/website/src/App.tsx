import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Headphones,
  Volume2,
  VolumeX,
  Menu,
  X,
} from "lucide-react";
import { createSoundSystem, localPreferences, type ThemeName } from "@alvarovillalbaa/sonant";
import { SoundProvider, useSound } from "@alvarovillalbaa/sonant/react";
import { Catalog } from "./Catalog";
import { Create } from "./Create";
import { Examples } from "./Examples";
import { Devtools } from "./Devtools";
import { Docs } from "./Docs";
import { External, Install, Logo, REPO } from "./ui";

function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return route;
}
export function App() {
  const [theme, setTheme] = useState<ThemeName>("studio");
  const system = useMemo(
    () =>
      createSoundSystem({
        theme,
        storage: localPreferences("sonant:website"),
        preferences: { enabled: false },
        requireVisibleEquivalent: true,
      }),
    [theme],
  );
  const disposals = useRef(new Map<typeof system, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    clearTimeout(disposals.current.get(system));
    return () => {
      system.stopAll();
      disposals.current.set(
        system,
        setTimeout(() => {
          void system.destroy();
          disposals.current.delete(system);
        }, 0),
      );
    };
  }, [system]);
  return (
    <SoundProvider system={system}>
      <Shell theme={theme} setTheme={setTheme} />
    </SoundProvider>
  );
}
function Shell({ theme, setTheme }: { theme: ThemeName; setTheme: (theme: ThemeName) => void }) {
  const route = useRoute();
  const sound = useSound();
  const [mobile, setMobile] = useState(false);
  const links = [
    ["Sounds", "/"],
    ["Examples", "/examples"],
    ["Documentation", "/docs"],
    ["Devtools", "/devtools"],
  ];
  useEffect(() => {
    setMobile(false);
    sound.stopAll();
  }, [route]);
  useEffect(() => {
    document.title = `Sonant — ${route === "/" ? "Sound for interfaces" : route.startsWith("/docs") ? "Documentation" : route === "/create" ? "Create your kit" : route === "/examples" ? "Interaction examples" : "Devtools"}`;
  }, [route]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav className={mobile ? "main-nav open" : "main-nav"} aria-label="Main navigation">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={`#${href}`}
                aria-current={
                  (href === "/" ? route === "/" : route.startsWith(href)) ? "page" : undefined
                }
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className={`sound-control ${sound.preferences.enabled ? "on" : ""}`}
              aria-pressed={sound.preferences.enabled}
              onClick={() => {
                const enabled = !sound.preferences.enabled;
                sound.setPreferences({ enabled });
                if (enabled) void sound.emit("action.select");
              }}
            >
              {sound.preferences.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>Sound {sound.preferences.enabled ? "on" : "off"}</span>
            </button>
            <External href={REPO} className="github-link">
              <Github size={18} />
              <span className="sr-only">GitHub</span>
            </External>
            <a className="button primary small" href="#/create">
              Create your kit
              <ArrowUpRight size={14} />
            </a>
            <button
              className="mobile-menu"
              aria-label={mobile ? "Close menu" : "Open menu"}
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {route === "/" ? (
          <>
            <Hero />
            <Catalog theme={theme} setTheme={setTheme} />
            <Principles />
            <section className="bottom-cta">
              <div>
                <span className="eyebrow">YOUR INTERFACE, WITH FEELING</span>
                <h2>Make the small moments matter.</h2>
              </div>
              <a className="button primary" href="#/create">
                Build your sound kit
                <ArrowRight size={17} />
              </a>
            </section>
          </>
        ) : route === "/create" ? (
          <Create theme={theme} setTheme={setTheme} />
        ) : route === "/examples" ? (
          <Examples />
        ) : route === "/devtools" ? (
          <Devtools />
        ) : route.startsWith("/docs") ? (
          <Docs route={route} />
        ) : (
          <section className="page-intro">
            <span className="eyebrow">404 · A QUIET CORNER</span>
            <h1>Nothing playing here.</h1>
            <a href="#/" className="button primary">
              Back to the sounds
              <ArrowRight size={16} />
            </a>
          </section>
        )}
      </main>
      <footer className="footer">
        <Logo />
        <p>A little sound. A lot more feeling.</p>
        <div>
          <span>Original sounds · MIT licensed</span>
          <External href={REPO}>Source code</External>
          <a href="#/docs/ai">
            Add with AI
            <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      <div className="audio-announcement sr-only" role="status">
        {sound.trace.at(-1)
          ? `${sound.trace.at(-1)!.event}: ${sound.trace.at(-1)!.decision}${sound.trace.at(-1)!.reason ? `, ${sound.trace.at(-1)!.reason}` : ""}`
          : ""}
      </div>
    </>
  );
}
function Hero() {
  return (
    <section className="hero">
      <div className="hero-label">
        <span className="status-dot" />
        <span>OPEN SOURCE. OPEN EARS.</span>
        <span className="version">
          v0.1.0
          <ArrowUpRight size={11} />
        </span>
      </div>
      <h1>
        A little sound.
        <br />A lot more <span>feeling.</span>
      </h1>
      <p>
        Thoughtful sounds for the interfaces you build.
        <br className="desktop-break" /> Composable, customizable, and completely yours.
      </p>
      <div className="hero-actions">
        <a className="button primary" href="#/create">
          Start building
          <ArrowRight size={17} />
        </a>
        <a className="button text" href="#/docs">
          Read the docs
          <ArrowUpRight size={16} />
        </a>
      </div>
      <Install />
      <div className="hero-meta">
        <span>
          <span className="tiny-react">✳</span> React & Next.js
        </span>
        <i />
        <span>Zero runtime dependencies</span>
        <i />
        <span>Yours to customize</span>
      </div>
      <div className="hero-decoration" aria-hidden="true">
        {Array.from({ length: 33 }, (_, i) => (
          <span
            key={i}
            style={{ height: `${8 + Math.sin(i * 0.51) ** 2 * Math.sin(i * 0.14) ** 2 * 120}px` }}
          />
        ))}
      </div>
    </section>
  );
}
function Principles() {
  return (
    <section className="principles">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A SOUND FOUNDATION</span>
          <h2>Small details. Considered defaults.</h2>
        </div>
        <a href="#/docs/policy">
          Meet the runtime
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="principle-grid">
        <article>
          <span className="principle-number">01 / OWN IT</span>
          <h3>Your sound. Your source.</h3>
          <p>
            Copy components and recipes into your app. Change the character without rewriting the
            interaction.
          </p>
          <code>emit("state.success")</code>
        </article>
        <article>
          <span className="principle-number">02 / KEEP IT QUIET</span>
          <h3>Feedback, with restraint.</h3>
          <p>
            Quiet profiles, cooldowns, voice limits, and explicit preferences keep a busy interface
            from becoming a noisy one.
          </p>
          <code>profile: "balanced"</code>
        </article>
        <article>
          <span className="principle-number">03 / KNOW WHY</span>
          <h3>Every cue, accounted for.</h3>
          <p>
            Inspect what played, what was suppressed, and why. Export a local trace without sending
            it to a server.
          </p>
          <a href="#/devtools">
            Open Devtools
            <ArrowUpRight size={14} />
          </a>
        </article>
      </div>
      <p className="listening-note">
        <Headphones size={15} /> Best experienced at a comfortable volume. Sound always complements
        visible feedback.
      </p>
    </section>
  );
}
