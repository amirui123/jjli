// Data access. The generated JSON is the source of truth; this module
// shapes it into the few views the interface needs.

import atlas from "../public/atlas.json";

export const CATEGORY_LABELS = {
  "animation-core": "Animation core",
  "scroll-and-reveal": "Scroll & reveal",
  "page-transitions": "Page transitions",
  "carousel-and-ui": "Carousel & UI",
  "gesture-and-drag": "Gesture & drag",
  "text-and-svg": "Text & SVG",
  "data-and-visualization": "Data & visualization",
  "creative-and-3d": "Creative & 3D",
  "lottie-and-rive": "Lottie & Rive",
  "code-to-video": "Code → video",
  "creative-craft": "Creative craft",
  "design-skills": "AI design skills",
  "ux-craft-2026": "High-craft web 2026",
  "tiktok-pushed": "Pushed on TikTok",
};

export const DOMAIN_LABELS = {
  agents: "Agents & orchestration",
  comms: "Communication",
  creative: "Creative & design",
  engineering: "Engineering",
  media: "Media",
  productivity: "Productivity",
  research: "Research",
};

export const skills = atlas.skills;
export const libraries = atlas.libraries;
export const docs = atlas.docs;
export const stats = atlas.stats;
export const tree = atlas.tree;

export const categories = [...new Set(libraries.map((l) => l.category))].sort(
  (a, b) =>
    (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b),
);

export const domains = Object.keys(tree).sort(
  (a, b) => (DOMAIN_LABELS[a] || a).localeCompare(DOMAIN_LABELS[b] || b),
);

/** Libraries that npm backs: they have a package, a version and downloads. */
export const npmLibraries = libraries.filter((l) => l.npm && l.version);

/** The busiest libraries — the ones people actually reach for. */
export const topByStars = libraries
  .filter((l) => l.stars)
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 10);

export const topByDownloads = libraries
  .filter((l) => l.dl)
  .sort((a, b) => b.dl - a.dl)
  .slice(0, 10);

export const totalStars = libraries.reduce((s, l) => s + (l.stars || 0), 0);
export const totalDownloads = libraries.reduce((s, l) => s + (l.dl || 0), 0);

export function formatCount(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatBytes(n) {
  if (!n) return "—";
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

/** The read-out style label hairline uses under a figure. */
export function categoryLabel(c) {
  return CATEGORY_LABELS[c] || c || "—";
}
