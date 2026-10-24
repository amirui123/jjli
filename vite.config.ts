import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function serveDesignLabRaw() {
  return {
    name: "serve-design-lab-raw",
    configureServer(server: {
      middlewares: {
        use: (
          fn: (
            req: { url?: string },
            res: {
              setHeader: (k: string, v: string) => void;
              statusCode: number;
              end: (body?: string | Buffer) => void;
            },
            next: () => void
          ) => void
        ) => void;
      };
    }) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = (req.url || "").split("?")[0];
        const idx = rawUrl.indexOf("/design-lab/");
        if (idx === -1) return next();
        let rel = "";
        try {
          rel = decodeURIComponent(rawUrl.slice(idx + 1));
        } catch {
          return next();
        }
        const full = path.resolve(process.cwd(), rel);
        if (!full.startsWith(path.resolve(process.cwd(), "design-lab"))) {
          return next();
        }
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "public, max-age=3600");
          res.statusCode = 200;
          res.end(fs.readFileSync(full));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  /* GitHub Pages serves project sites from /<repo>/, so the base is injectable.
     Vercel and local dev keep "/" — nothing else changes. */
  base: process.env.VITE_BASE || "/",
  plugins: [serveDesignLabRaw(), react(), tailwindcss()],
  optimizeDeps: {
    entries: ["index.html"],
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("src/data/designLabManifest")) {
            return "data-design-lab";
          }
          if (id.includes("src/data/skillsManifest")) {
            return "data-skills";
          }
          if (id.includes("src/data/registryFiles") || id.includes("src/data/registriesManifest")) {
            return "data-registries";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    cors: true,
    watch: {
      ignored: ["**/design-lab/**"],
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
});
