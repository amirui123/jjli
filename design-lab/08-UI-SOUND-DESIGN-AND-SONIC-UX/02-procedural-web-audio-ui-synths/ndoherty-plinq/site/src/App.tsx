import { useState, useEffect } from "react";
import { pop } from "plinq";
import { TextMorph } from "torph/react";
import { PresetButtons } from "./PresetButtons";
import { Playground } from "./Playground";
import { version } from "../../package.json";

const PKG_MANAGERS = [
  { id: "npm", command: "npm i plinq" },
  { id: "pnpm", command: "pnpm add plinq" },
  { id: "yarn", command: "yarn add plinq" },
  { id: "bun", command: "bun add plinq" },
] as const;

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("plinq-theme");
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.background = dark ? "#09090b" : "#fafafa";
    localStorage.setItem("plinq-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

export function App() {
  const [dark, toggleDark] = useDarkMode();
  const [pkgManager, setPkgManager] = useState<(typeof PKG_MANAGERS)[number]["id"]>("npm");
  const [installCopied, setInstallCopied] = useState(false);

  const currentCommand = PKG_MANAGERS.find((p) => p.id === pkgManager)!.command;

  const copyInstall = () => {
    navigator.clipboard.writeText(currentCommand);
    setInstallCopied(true);
    setTimeout(() => setInstallCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Header */}
      <main className="max-w-[760px] mx-auto px-3 sm:px-6">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16">
          <div className="flex items-start justify-between">
            <div className="flex-flex-col">
              <h1 className="text-5xl sm:text-6xl font-medium tracking-tight mb-5">
                plinq
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-md text-balance leading-relaxed">
                Dependency-free library for creating programmatic UI sounds
              </p>
            </div>

            <button
              onClick={toggleDark}
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" />
                  <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M13.2 9.2A5.5 5.5 0 1 1 6.8 2.8a4.4 4.4 0 0 0 6.4 6.4z" />
                </svg>
              )}
            </button>
          </div>


          {/* Install command */}
          <div className="mb-8 w-full">
            <div className="flex gap-4 mb-3">
              {PKG_MANAGERS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPkgManager(pm.id)}
                  className={`font-mono text-sm cursor-pointer transition-colors ${pkgManager === pm.id
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-500 dark:hover:text-zinc-300"
                    }`}
                >
                  {pm.id}
                </button>
              ))}
            </div>
            <div className="flex items-baseline bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3">
              <code className="font-mono text-[13px] flex-1 flex items-baseline gap-2">
                <span className="text-zinc-400 select-none">$</span>
                <TextMorph>{currentCommand}</TextMorph>
              </code>
              <button
                onClick={copyInstall}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer ml-4"
              >
                <TextMorph>{installCopied ? "Copied" : "Copy"}</TextMorph>
              </button>
            </div>
          </div>

          {/* Code examples */}
          <div className="w-full flex flex-col gap-8">
            <div>
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Presets</h2>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <pre className="px-4 py-4 font-mono text-[13px] leading-relaxed overflow-x-auto">
                  <span className="text-zinc-400 dark:text-zinc-500">import</span>
                  {" { pop } "}
                  <span className="text-zinc-400 dark:text-zinc-500">from</span>{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">'plinq'</span>
                  {"\n\n"}
                  pop()
                </pre>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Custom sounds</h2>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <pre className="px-4 py-4 font-mono text-[13px] leading-relaxed overflow-x-auto">
                  <span className="text-zinc-400 dark:text-zinc-500">import</span>
                  {" { play } "}
                  <span className="text-zinc-400 dark:text-zinc-500">from</span>{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">'plinq'</span>
                  {"\n\n"}
                  {"play({\n"}
                  {"  layers: [{\n"}
                  {"    source: { type: "}
                  <span className="text-emerald-600 dark:text-emerald-400">'oscillator'</span>
                  {", waveform: "}
                  <span className="text-emerald-600 dark:text-emerald-400">'sine'</span>
                  {", frequency: 880 },\n"}
                  {"    envelope: { attack: 0.01, decay: 0.3 },\n"}
                  {"    gain: 0.4\n"}
                  {"  }]\n"}{"})"}</pre>
              </div>
            </div>
          </div>

        </section>

        {/* Sounds */}
        <section className="pb-16">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Sounds</h2>

          <PresetButtons />
        </section>

        {/* Playground */}
        <section className="pb-16">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Playground</h2>
          <Playground />
        </section>

        {/* Playground */}
        <section className="pb-16">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Acknowledgements</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-10 text-balance leading-relaxed">
            Huge inspiration from{" "}
            <a href="https://www.userinterface.wiki/sounds-on-the-web" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Sounds on the Web
            </a>{" "}
            and{" "}
            <a href="https://www.userinterface.wiki/generating-sounds-with-ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Generating Sounds with AI
            </a>{" "}
            by{" "}
            <a href="https://x.com/raphaelsalaja" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Raphael Salaja
            </a>.
          </p>
        </section>
      </main>

      <footer className="py-8 text-center text-[13px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-3">
        <span>v{version}</span>
        <span>·</span>
        <a
          href="https://github.com/ndoherty-xyz/plinq"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
