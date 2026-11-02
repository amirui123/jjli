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
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { navigate } from "../lib/router";
import { writePersisted } from "../lib/store";
import { faNum } from "../lib/format";

const START_CHOICES = [
  {
    title: "برای نوشته‌ام فونت پیدا کنم",
    description: "فونت‌های فارسی را ببین، متن خودت را امتحان کن و اگر خواستی دانلودش کن.",
    action: "دیدن فونت‌ها",
    path: "/studio/fonts",
    icon: Type,
    color: "#E8B33A",
    sample: "یک متن دلخواه بنویس",
  },
  {
    title: "ظاهر صفحه‌ام را بهتر کنم",
    description: "از اجزای آماده و نمونه‌های قابل‌تغییر برای ساخت صفحه استفاده کن.",
    action: "دیدن اجزای آماده",
    path: "/studio/components",
    icon: Layers,
    color: "#34D399",
    sample: "از یک نمونه شروع کن",
  },
  {
    title: "به صفحه‌ام حرکت اضافه کنم",
    description: "حرکت‌های آماده را ببین، تنظیمشان کن و نتیجه را همان‌جا تماشا کن.",
    action: "ساخت حرکت",
    path: "/studio/motion",
    icon: Gauge,
    color: "#38BDF8",
    sample: "ببین، تنظیم کن، استفاده کن",
  },
];

const MORE_TOOLS = [
  {
    title: "راهنما و نمونه‌ها",
    description: "ایده و راهنمای طراحی را پیدا کن.",
    path: "/studio/skills",
    icon: BookOpen,
    color: "#A78BFA",
  },
  {
    title: "ساخت صدا",
    description: "صدای کوتاه بساز و فایلش را بگیر.",
    path: "/studio/sounds",
    icon: Waves,
    color: "#FB7185",
  },
  {
    title: "جلوه‌های تصویری",
    description: "رنگ، نور و جلوه‌های متحرک را امتحان کن.",
    path: "/studio/engines",
    icon: Sparkles,
    color: "#22D3EE",
  },
  {
    title: "کمک‌یار هوشمند",
    description: "برای ایده و نوشتن طرح از ابزارهای هوشمند کمک بگیر.",
    path: "/studio/ai",
    icon: Brain,
    color: "#E879F9",
  },
];

export const Landing: React.FC = () => (
  <div className="mx-auto max-w-6xl pb-16 pt-5 sm:pb-20 sm:pt-10">
    <section
      aria-labelledby="welcome-title"
      className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#090B12]/90 px-5 py-8 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.9)] sm:rounded-[36px] sm:px-10 sm:py-11 lg:px-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-20 -top-32 -z-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(var(--accent-glow),0.16)" }}
      />
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] text-zinc-300">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-[color:var(--accent)]" />
          <span>ابزارهای ساده برای ساختن با زبان فارسی</span>
        </div>
        <h1
          id="welcome-title"
          className="mt-5 font-hasti text-[clamp(32px,7vw,56px)] leading-[1.45] text-white"
        >
          امروز می‌خواهی چه کار کنی؟
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-8 text-zinc-300 sm:text-[17px]">
          یک گزینه را انتخاب کن؛ ابزار مناسب را باز می‌کنیم. لازم نیست اسم ابزارهای تخصصی را بدانی.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {START_CHOICES.map((choice) => {
          const Icon = choice.icon;
          return (
            <article
              key={choice.path}
              className="group flex min-h-[220px] flex-col rounded-2xl border border-white/10 bg-[#0D1018]/90 p-5 transition-colors hover:border-white/20 hover:bg-[#11151F] sm:min-h-[242px] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={{
                    color: choice.color,
                    backgroundColor: `${choice.color}14`,
                    borderColor: `${choice.color}35`,
                  }}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-[12px] text-zinc-500">{choice.sample}</span>
              </div>
              <h2 className="mt-5 text-[17px] font-bold leading-7 text-white sm:text-[18px]">
                {choice.title}
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-zinc-400">{choice.description}</p>
              <button
                type="button"
                onClick={() => navigate(choice.path)}
                className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 text-[14px] font-bold text-[color:var(--accent)] outline-none transition-colors hover:text-white focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                <span>{choice.action}</span>
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>
    </section>

    <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
          <Type aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[14px] font-bold text-zinc-100">می‌خواهی یک فونت را همین حالا امتحان کنی؟</h2>
          <p className="mt-1 text-[13px] leading-6 text-zinc-400">با یک نمونه شروع کن؛ بعداً می‌توانی هر فونت دیگری را هم ببینی.</p>
        </div>
      </div>
      <button
        type="button"
        data-font-id="hasti"
        onClick={() => {
          writePersisted("studio-fonts", { fontId: "hasti" });
          navigate("/studio/fonts");
        }}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200/20 bg-amber-200/10 px-4 text-[13px] font-bold text-amber-100 transition-colors hover:bg-amber-200/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        <span>امتحان فونت هستی</span>
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      </button>
    </section>

    <section aria-labelledby="how-title" className="mt-12 sm:mt-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-[color:var(--accent)]">شروع راحت</p>
          <h2 id="how-title" className="mt-1 text-[22px] font-bold text-white sm:text-[26px]">
            سه قدم ساده
          </h2>
        </div>
        <p className="max-w-lg text-[14px] leading-7 text-zinc-400">
          بیشتر ابزارها همین‌جا در مرورگر کار می‌کنند؛ چیزی نصب نمی‌کنی.
        </p>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { n: "۱", title: "کاری را انتخاب کن", text: "از کارت‌های بالا یا فهرست ابزارها شروع کن." },
          { n: "۲", title: "همان‌جا امتحانش کن", text: "نتیجه را ببین و تنظیمات ساده را تغییر بده." },
          { n: "۳", title: "استفاده‌اش کن", text: "اگر خروجی آماده بود، آن را کپی یا دانلود کن." },
        ].map((step) => (
          <li key={step.n} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[14px] font-bold text-[color:var(--accent)]">
              {step.n}
            </span>
            <div>
              <h3 className="text-[14px] font-bold text-zinc-100">{step.title}</h3>
              <p className="mt-1 text-[13px] leading-6 text-zinc-400">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section aria-labelledby="more-tools-title" className="mt-12 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[color:var(--accent)]">هر وقت خواستی</p>
          <h2 id="more-tools-title" className="mt-1 text-[22px] font-bold text-white sm:text-[26px]">
            ابزارهای دیگر
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-[14px] font-bold text-zinc-200 transition-colors hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        >
          <span>دیدن همه ابزارها</span>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MORE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.path}
              type="button"
              onClick={() => navigate(tool.path)}
              className="flex min-h-[116px] items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#0A0C13]/85 p-4 text-start transition-colors hover:border-white/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ color: tool.color, backgroundColor: `${tool.color}17` }}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-[14px] font-bold text-zinc-100">{tool.title}</span>
                <span className="mt-1 block text-[12px] leading-6 text-zinc-400">{tool.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>

    <aside className="mt-10 flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 text-[13px] text-zinc-400 sm:flex-row sm:items-center sm:justify-center sm:gap-5 sm:py-3">
      <span>ساخته‌شده برای فارسی و راست‌به‌چپ</span>
      <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-zinc-600 sm:block" />
      <span>{faNum(TOOLKIT_STATS.fonts)} فونت فارسی برای امتحان‌کردن</span>
      <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-zinc-600 sm:block" />
      <span>بدون نیاز به نصب</span>
    </aside>

    <div className="sr-only" aria-live="polite">
      آماده‌ی شروع
    </div>
  </div>
);

export default Landing;
