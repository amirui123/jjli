import React from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Gauge,
  Layers,
  Sparkles,
  Type,
  Waves,
} from "lucide-react";
import { navigate } from "../lib/router";

const TOOLS = [
  {
    title: "پیدا کردن فونت فارسی",
    description: "متن خودت را با فونت‌های مختلف ببین و فونت دلخواهت را بگیر.",
    helpfulFor: "متن و نوشته",
    path: "/studio/fonts",
    icon: Type,
    color: "#E8B33A",
  },
  {
    title: "ساخت ظاهر صفحه",
    description: "از نمونه‌ها و اجزای آماده برای چیدن صفحه‌ی سایتت استفاده کن.",
    helpfulFor: "طراحی سایت",
    path: "/studio/components",
    icon: Layers,
    color: "#34D399",
  },
  {
    title: "ساخت حرکت و انیمیشن",
    description: "یک حرکت را انتخاب کن، سرعتش را عوض کن و نتیجه را ببین.",
    helpfulFor: "حرکت و جلوه",
    path: "/studio/motion",
    icon: Gauge,
    color: "#38BDF8",
  },
  {
    title: "راهنمای طراحی",
    description: "برای رنگ، چیدمان و نوشتن متن، راهنما و نمونه پیدا کن.",
    helpfulFor: "ایده و یادگیری",
    path: "/studio/skills",
    icon: BookOpen,
    color: "#A78BFA",
  },
  {
    title: "ساخت صدا",
    description: "افکت صوتی بساز، گوش بده و اگر خواستی ذخیره‌اش کن.",
    helpfulFor: "صدا و افکت",
    path: "/studio/sounds",
    icon: Waves,
    color: "#FB7185",
  },
  {
    title: "ساخت جلوه‌ی تصویری",
    description: "رنگ، نور و جلوه‌های تصویری را در صفحه امتحان کن.",
    helpfulFor: "رنگ و تصویر",
    path: "/studio/engines",
    icon: Sparkles,
    color: "#22D3EE",
  },
  {
    title: "کمک‌یار هوشمند",
    description: "برای شروع ایده بگیر و متن‌های اولیه را آماده کن.",
    helpfulFor: "ایده‌پردازی",
    path: "/studio/ai",
    icon: Brain,
    color: "#E879F9",
  },
];

export const Dashboard: React.FC = () => (
  <div className="mx-auto max-w-5xl pb-16 pt-5 sm:pb-20 sm:pt-10">
    <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#090B12]/90 px-5 py-7 sm:px-9 sm:py-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-16 -top-24 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(var(--accent-glow),0.14)" }}
      />
      <button
        type="button"
        onClick={() => navigate("/")}
        className="relative inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4 rotate-180" />
        برگشت به شروع
      </button>
      <p className="relative mt-4 text-[13px] font-medium text-[color:var(--accent)]">همه‌چیز یک‌جا</p>
      <h1 className="relative mt-1 font-hasti text-[clamp(30px,6vw,46px)] leading-[1.5] text-white">
        کدام ابزار به کارت می‌آید؟
      </h1>
      <p className="relative mt-2 max-w-2xl text-[15px] leading-8 text-zinc-300">
        لازم نیست اسم ابزارها را بلد باشی. کاری را که می‌خواهی انجام بدهی پیدا کن و از همان‌جا شروع کن.
      </p>
    </header>

    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.path}
            type="button"
            onClick={() => navigate(tool.path)}
            className="group flex min-h-[210px] flex-col rounded-2xl border border-white/[0.09] bg-[#090B12]/90 p-5 text-start transition-colors hover:border-white/20 hover:bg-[#10131C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] sm:p-6"
          >
            <span className="flex w-fit items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tool.color }} />
              {tool.helpfulFor}
            </span>
            <span
              className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ color: tool.color, backgroundColor: `${tool.color}17` }}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="mt-4 text-[16px] font-bold leading-7 text-white">{tool.title}</span>
            <span className="mt-1 text-[13px] leading-7 text-zinc-400">{tool.description}</span>
            <span className="mt-auto inline-flex min-h-10 items-end gap-2 pt-4 text-[13px] font-bold text-[color:var(--accent)]">
              باز کردن
              <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </span>
          </button>
        );
      })}
    </div>

    <p className="mt-6 text-center text-[13px] leading-7 text-zinc-500">
      همه‌ی ابزارها همین‌جا در مرورگر باز می‌شوند؛ برای امتحان‌کردنشان لازم نیست چیزی نصب کنی.
    </p>
  </div>
);

export default Dashboard;
