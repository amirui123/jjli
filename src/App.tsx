import React, { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { AppShell } from "./shell/AppShell";
import { AppSettingsProvider } from "./lib/store";
import { ROUTES, useRouter } from "./lib/router";
import { ToastProvider } from "./ui/Toast";
import { ErrorBoundary } from "./ui/ErrorBoundary";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FontStudio = lazy(() => import("./pages/FontStudio"));
const MotionStudio = lazy(() => import("./pages/MotionStudio"));
const ComponentsStudio = lazy(() => import("./pages/ComponentsStudio"));
const SoundStudio = lazy(() => import("./pages/SoundStudio"));
const SkillsStudio = lazy(() => import("./pages/SkillsStudio"));
const EnginesStudio = lazy(() => import("./pages/EnginesStudio"));
const AiStudio = lazy(() => import("./pages/AiStudio"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IntroHost = lazy(() => import("./components/IntroFilm"));

const PAGES: Record<string, React.LazyExoticComponent<React.FC>> = {
  home: Landing,
  dashboard: Dashboard,
  fonts: FontStudio,
  motion: MotionStudio,
  components: ComponentsStudio,
  sounds: SoundStudio,
  skills: SkillsStudio,
  engines: EnginesStudio,
  ai: AiStudio,
};

const TITLES: Record<string, string> = {
  home: "آزمایشگاه موشن فارسی — پلتفرم رایگان موشن، فونت و کامپوننت RTL",
  dashboard: "داشبورد",
  fonts: "استودیو فونت",
  motion: "استودیو موشن",
  components: "استودیو کامپوننت",
  sounds: "استودیو صدا",
  skills: "استودیو مهارت",
  engines: "آزمایشگاه شیدر",
  ai: "استودیو هوش مصنوعی",
};

const PageSkeleton: React.FC = () => (
  <div className="space-y-5 py-2" aria-busy="true" aria-live="polite">
    <div className="space-y-2">
      <div className="skeleton h-3 w-28 rounded-full" />
      <div className="skeleton h-7 w-64 rounded-lg" />
      <div className="skeleton h-3 w-full max-w-xl rounded-full" />
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="skeleton h-[420px] rounded-2xl" />
      <div className="skeleton h-[420px] rounded-2xl" />
    </div>
  </div>
);

const Router: React.FC = () => {
  const { route, path, meta } = useRouter();
  const known = path === "/" || ROUTES.some((r) => r.path === path.replace(/\/+$/, ""));
  const Page = known ? PAGES[meta.id] ?? NotFound : NotFound;

  useEffect(() => {
    document.title = `${known ? TITLES[meta.id] ?? "استودیو" : "صفحه پیدا نشد"} | آزمایشگاه موشن فارسی`;
  }, [meta.id, known]);

  return (
    <AppShell>
      <ErrorBoundary key={route}>
        <Suspense key={route} fallback={<PageSkeleton />}>
          <Page />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
};

export const App: React.FC = () => (
  <MotionConfig reducedMotion="user">
    <AppSettingsProvider>
      <ToastProvider>
        <Router />
        <Suspense fallback={null}>
          <IntroHost />
        </Suspense>
      </ToastProvider>
    </AppSettingsProvider>
  </MotionConfig>
);

export default App;
