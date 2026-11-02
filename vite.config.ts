import fs from "node:fs";
import path from "node:path";
import { isPathInside, resolvePathWithin } from "./scripts/lib/path-security.mjs";
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
        const rawUrl = (req.url || "/").split("?")[0];
        let decodedUrl: string;
        try {
          decodedUrl = decodeURIComponent(rawUrl);
        } catch {
          res.statusCode = 400;
          res.end("Bad request");
          return;
        }
        const route = decodedUrl.indexOf("/design-lab/");
        if (route === -1) return next();
        const relative = decodedUrl.slice(route + 1);
        const root = path.resolve(process.cwd(), "design-lab");
        const candidate = resolvePathWithin(process.cwd(), relative);
        if (!candidate || !isPathInside(root, candidate)) return next();
        try {
          const realRoot = fs.realpathSync(root);
          const realFile = fs.realpathSync(candidate);
          if (!isPathInside(realRoot, realFile)) return next();
          const stat = fs.statSync(realFile);
          if (!stat.isFile()) return next();
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.statusCode = 200;
          res.end(fs.readFileSync(realFile));
        } catch {
          next();
        }
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
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: ["localhost", "127.0.0.1"],
    cors: false,
    watch: {
      ignored: ["**/design-lab/**"],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: ["localhost", "127.0.0.1"],
  },
});
