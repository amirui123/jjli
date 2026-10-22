import React, { Suspense, lazy, useEffect } from "react";
import { AppShell } from "./shell/AppShell";
import { AppSettingsProvider } from "./lib/store";
import { useRouter } from "./lib/router";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FontStudio = lazy(() => import("./pages/FontStudio"));
const MotionStudio = lazy(() => import("./pages/MotionStudio"));
const ComponentsStudio = lazy(() => import("./pages/ComponentsStudio"));
const SoundStudio = lazy(() => import("./pages/SoundStudio"));
const SkillsStudio = lazy(() => import("./pages/SkillsStudio"));
const EnginesStudio = lazy(() => import("./pages/EnginesStudio"));
const AiStudio = lazy(() => import("./pages/AiStudio"));

const PageLoader: React.FC = () => (
  <div className="space-y-4 py-10">
    <div className="h-4 w-40 animate-pulse rounded bg-white/[0.05]" />
    <div className="h-8 w-72 animate-pulse rounded bg-white/[0.05]" />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      <div className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
    </div>
  </div>
);

const PAGE_TITLES: Record<string, string> = {
  home: "آزمایشگاه موشن فارسی — پلتفرم موشن، فونت و کامپوننت RTL",
  dashboard: "داشبورد | آزمایشگاه موشن فارسی",
  fonts: "استودیو فونت | آزمایشگاه موشن فارسی",
  motion: "استودیو موشن | آزمایشگاه موشن فارسی",
  components: "استودیو کامپوننت | آزمایشگاه موشن فارسی",
  sounds: "استودیو صدا | آزمایشگاه موشن فارسی",
  skills: "استودیو مهارت | آزمایشگاه موشن فارسی",
  engines: "استودیو موتور | آزمایشگاه موشن فارسی",
  ai: "استودیو هوش مصنوعی | آزمایشگاه موشن فارسی",
};

function Router() {
  const { route } = useRouter();

  useEffect(() => {
    document.title = PAGE_TITLES[route] ?? PAGE_TITLES.home;
    try {
      localStorage.setItem("rtmlab.v1.last-route", route);
    } catch {
      /* ignore */
    }
  }, [route]);

  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        {route === "home" && <Landing />}
        {route === "dashboard" && <Dashboard />}
        {route === "fonts" && <FontStudio />}
        {route === "motion" && <MotionStudio />}
        {route === "components" && <ComponentsStudio />}
        {route === "sounds" && <SoundStudio />}
        {route === "skills" && <SkillsStudio />}
        {route === "engines" && <EnginesStudio />}
        {route === "ai" && <AiStudio />}
      </Suspense>
    </AppShell>
  );
}

export function App() {
  return (
    <AppSettingsProvider>
      <Router />
    </AppSettingsProvider>
  );
}

export default App;
