import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), commonjs()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:50001",
        changeOrigin: true,
        secure: false,
      },
      "/hubs": {
        target: "https://localhost:50001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./src/components"),
      contexts: path.resolve(__dirname, "./src/contexts"),
      utils: path.resolve(__dirname, "./src/utils"),
      services: path.resolve(__dirname, "./src/services"),
      constants: path.resolve(__dirname, "./src/constants"),
      locales: path.resolve(__dirname, "./src/locales"),
      assets: path.resolve(__dirname, "./src/assets"),
      providers: path.resolve(__dirname, "./src/providers"),
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
});
