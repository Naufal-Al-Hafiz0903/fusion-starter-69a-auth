import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
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
  },
  plugins: [react(), expressPlugin()],
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
    apply: "serve", // hanya jalan saat dev (vite serve)
    async configureServer(viteServer) {
      // IMPORTANT: lazy import supaya Netlify build (SPA) tidak kebaca file server
      const mod = await import("./server");
      const app = mod.createServer();

      // pasang Express sebagai middleware ke Vite dev server
      viteServer.middlewares.use(app);
    },
  };
}
