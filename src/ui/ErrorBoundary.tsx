import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { navigate } from "../lib/router";

interface State {
  error: Error | null;
}

/**
 * Last line of defence: a broken studio must never blank the whole platform.
 * The boundary keeps the shell (top bar, dock) alive and offers a real retry.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // keep the console useful in production debugging
    console.error("[rtl-motion-lab] page crashed:", error);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-400/10 text-rose-300">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-hasti text-[26px] leading-tight text-white">این بخش بالا نیامد</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
          یک خطای غیرمنتظره رخ داد؛ بقیه پلتفرم سالم است. می‌توانی دوباره تلاش کنی یا به خانه برگردی.
        </p>
        <p
          dir="ltr"
          className="mt-3 max-w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-black/40 px-2.5 py-1.5 font-mono text-[10px] text-zinc-600"
        >
          {error.message || String(error)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-3.5 py-2 text-[12px] font-bold text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            تلاش دوباره
          </button>
          <button
            type="button"
            onClick={() => {
              this.reset();
              navigate("/");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 px-3.5 py-2 text-[12px] text-zinc-300"
          >
            <Home className="h-3.5 w-3.5" />
            بازگشت به خانه
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
