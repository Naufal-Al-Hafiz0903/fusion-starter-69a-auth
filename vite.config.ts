import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

const REPO = "fusion-starter-69a-auth";

export default defineConfig(({ command }) => ({
  // GitHub Pages pakai subpath /<repo>/
  base: process.env.VITE_BASE ?? (command === "build" ? `/${REPO}/` : "/"),

  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },

  build: {
    outDir: "dist/spa",
    emptyOutDir: true,
    assetsDir: "assets", // penting: pastikan asset berada di /assets
  },

  plugins: [
    react(),
    ...(command === "serve" ? [expressPlugin()] : []), // hanya dev
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(viteServer) {
      const mod = await import("./server");
      const app = mod.createServer();
      viteServer.middlewares.use(app);
    },
  };
}
