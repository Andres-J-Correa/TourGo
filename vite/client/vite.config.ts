import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:50001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      services: path.resolve(__dirname, "./src/services"),
    },
  },
});
