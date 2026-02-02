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
        // Let the plugin handle the precache automatically
        globPatterns: ["**/*.{js,css,ico,png,svg,webmanifest,woff2,map}"],
      
        // Very important: fallback only for actual page navigations
        navigateFallback: "/index.html",
      
        // Never, ever fallback for built assets or SW files
        navigateFallbackDenylist: [
          /^\/assets\//,
          /^\/favicon\//,
          /^\/api\//,
          /^\/_vercel\//,
          /\/sw\.js$/,
          /\/workbox-.*\.js$/,
          /\/manifest\.webmanifest$/,
          /\/[^/?]+\.[^/]+$/, // any file with an extension
        ],
      
        cleanupOutdatedCaches: true,
      },
      
      

      // Optional safety valve if dev behaves weird with Vike:
      devOptions: { enabled: false },
    }),
  ],
});
