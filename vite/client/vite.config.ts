import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";
import { VitePWA } from "vite-plugin-pwa";

import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/app/",
  plugins: [
    react(),
    commonjs(),
    VitePWA({
      registerType: "autoUpdate",
      base: "/app/",
      manifest: {
        short_name: "TourGo",
        name: "TourGo",
        description:
          "Administra tu hotel, gestiona reservas y ofrece una experiencia única a tus huéspedes con TourGo.",
        scope: "/app/",
        start_url: "/app/",
        orientation: "portrait",
        display: "standalone",
        theme_color: "#344767",
        background_color: "#ffffff",
        icons: [
          {
            src: "/app/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "/app/logo192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any",
          },
          {
            src: "/app/logo512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any",
          },
          {
            src: "/app/apple-touch-icon.png",
            type: "image/png",
            sizes: "180x180",
          },
        ],
      },
    }),
  ],
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
      types: path.resolve(__dirname, "./src/types"),
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
});
