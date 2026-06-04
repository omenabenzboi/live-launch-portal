// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, componentTagger,
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error loggers, sandbox detection.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  build: {
    outDir: ".output",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // we register from a guarded wrapper
      filename: "sw.js",
      devOptions: { enabled: false },
      workbox: {
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//, /^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "html-cache", networkTimeoutSeconds: 4 },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(js|css|woff2?)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "asset-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\/(api|files|tasks|chat)\//.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: "Omena Codex",
        short_name: "Omena",
        description: "Mobile-first operator console for AI engineering workflows.",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
