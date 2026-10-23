/**
 * Config dedicated to the single-file build.
 *
 * The normal build splits pages/chunks for the network; here everything has to
 * live in one document, so dynamic imports are inlined, CSS is emitted once and
 * every asset is inlined instead of referenced by URL.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist-single",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        /* classic script: inline <script type="module"> is fine in browsers, but a
           plain IIFE also runs from file:// and inside jsdom for verification */
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "app.js",
        chunkFileNames: "app-[name].js",
        assetFileNames: "app.[ext]",
      },
    },
  },
});
