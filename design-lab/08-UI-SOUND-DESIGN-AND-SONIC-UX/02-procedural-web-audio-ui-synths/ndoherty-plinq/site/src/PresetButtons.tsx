import { useState } from "react";
import {
  click,
  pop,
  toggle,
  tick,
  drop,
  success,
  error,
  warning,
  woosh,
} from "plinq";

const presets = [
  { name: "Click", fn: click },
  { name: "Pop", fn: pop },
  { name: "Toggle", fn: toggle },
  { name: "Tick", fn: tick },
  { name: "Drop", fn: drop },
  { name: "Success", fn: success },
  { name: "Error", fn: error },
  { name: "Warning", fn: warning },
  { name: "Woosh", fn: woosh },
] as const;

export function PresetButtons() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {presets.map(({ name, fn }) => (
        <button
          key={name}
          onClick={() => {
            fn();
            setActive(name);
            setTimeout(() => setActive(null), 200);
          }}
          className={`
            text-sm px-4 py-3 rounded-lg border cursor-pointer
            transition-all duration-100 active:scale-[0.97]
            ${active === name
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            }
          `}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
