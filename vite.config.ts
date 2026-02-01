import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const repo = "fusion-starter-69a-auth";

export default defineConfig({
  plugins: [react()],

  // 🔥 PENTING: ini kunci GitHub Pages
  base: `/${repo}/`,

  build: {
    outDir: "dist/spa",
    emptyOutDir: true
  }
});
