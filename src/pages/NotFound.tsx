import React from "react";
import { Compass, Home } from "lucide-react";
import { navigate, ROUTES } from "../lib/router";
import { Panel } from "../ui/kit";

export const NotFound: React.FC = () => (
  <div className="mx-auto max-w-3xl py-10">
    <Panel className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Compass className="h-6 w-6 text-[color:var(--accent)]" />
      </div>
      <h1 className="mt-4 font-hasti text-[42px] leading-tight text-white">گم شدی؟</h1>
      <p className="mt-1 text-[12.5px] text-zinc-500">
        این مسیر وجود ندارد. یکی از استودیوها را انتخاب کن.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(r.path)}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-2 text-[11px] text-zinc-300 transition-colors hover:border-[color:var(--accent)]/40 hover:text-white"
          >
            {r.labelFa}
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate("/")}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-3 py-1.5 text-[11.5px] text-[color:var(--accent)]"
      >
        <Home className="h-3.5 w-3.5" />
        بازگشت به خانه
      </button>
    </Panel>
  </div>
);

export default NotFound;
