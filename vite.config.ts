import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const repo = "fusion-starter-69a-auth";

export default defineConfig({
  plugins: [react()],

  // GitHub Pages: wajib subpath repo
  base: `/${repo}/`,

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },

  build: {
    outDir: "dist/spa",
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
