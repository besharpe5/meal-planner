import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    vike(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon/favicon.svg",
        "favicon/favicon-96x96.png",
        "favicon/favicon.ico",
        "favicon/apple-touch-icon.png",
        "favicon/web-app-manifest-192x192.png",
        "favicon/web-app-manifest-512x512.png",
      ],
      manifest: {
        name: "mealplanned",
        short_name: "mealplanned",
        theme_color: "#7F9B82",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Make sure HTML is precached (fixes "non-precached-url :: index.html")
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],

        // SPA navigation fallback
        navigateFallback: "/index.html",

        // Don't use the fallback for API calls or file requests
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/_vercel\//,
          /\/[^/?]+\.[^/]+$/, // any path containing a "file.ext"
        ],
      },

      // Optional safety valve if dev behaves weird with Vike:
      devOptions: { enabled: false },
    }),
  ],
});
