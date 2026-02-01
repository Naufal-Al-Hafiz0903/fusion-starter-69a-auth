import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

const repo = "fusion-starter-69a-auth";

export default defineConfig({
  plugins: [react()],

  // GitHub Pages ada di /<repo>/
  base: `/${repo}/`,

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./client", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },

  build: {
    outDir: "dist/spa",
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
