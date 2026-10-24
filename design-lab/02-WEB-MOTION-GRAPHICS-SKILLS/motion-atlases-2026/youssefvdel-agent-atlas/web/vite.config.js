import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  build: {
    outDir: "../site",
    emptyOutDir: false,
    assetsDir: "app",
  },
  server: {
    port: 5173,
    host: true,
  },
});
