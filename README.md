# Omena Codex

Mobile-first operator console for AI engineering workflows. Built with TanStack Start, React 19, Tailwind v4, Zustand, and TanStack Query.

## Quick start

```bash
bun install
cp .env.example .env   # fill in VITE_API_BASE_URL / VITE_WS_URL if you have a backend
bun run dev
```

With no backend env vars set, the app boots fully against seeded mock data so every screen works out of the box.

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the Vite/TanStack Start dev server |
| `bun run build` | Production build (outputs `.output/`) |
| `bun run preview` | Preview the production build locally |
| `bun run test` | Run Vitest unit + streaming-harness tests |
| `bun run lint` | ESLint |

## Production deployment

### One-command Docker

```bash
docker build -t omena-codex .
docker run --rm -p 3000:3000 --env-file .env omena-codex
```

Or with compose:

```bash
docker compose up -d --build
```

The image is multi-stage (Bun → build → slim runner), exposes port 3000, and ships a `HEALTHCHECK`. Configure your reverse proxy (Caddy/Traefik/Nginx) to terminate TLS and forward to `:3000`.

### CI / CD

`.github/workflows/ci.yml` runs `lint → test → build` on every PR and builds the Docker image on `main`. Add registry push steps (e.g. GHCR/ECR) once you pick a host.

## Environment

Public, build-time:

- `VITE_API_BASE_URL` — REST base, e.g. `https://api.example.com`. Empty = mock mode.
- `VITE_WS_URL` — WebSocket endpoint for terminal logs. Empty falls back to SSE at `${VITE_API_BASE_URL}/terminal/stream`, or to deterministic mock streaming.

Server-only secrets (never exposed to the browser; read inside server functions only): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `DEEPSEEK_API_KEY`, `XAI_API_KEY`, `MISTRAL_API_KEY`, `CUSTOM_MODEL_BASE_URL`, `CUSTOM_MODEL_API_KEY`.

## Streaming harness

`src/lib/stream.ts` exposes `openLogStream({ onLine, onState })`:

- Prefers WebSocket when `VITE_WS_URL` is set, with exponential-backoff auto-reconnect.
- Falls back to SSE when only `VITE_API_BASE_URL` is set.
- Reports lifecycle to the UI: `connecting | open | reconnecting | error | closed`.
- Tests covering reconnect-on-failure live in `src/lib/__tests__/stream.test.ts`.

## PWA & offline

- `vite-plugin-pwa` generates `/sw.js` with a NetworkFirst strategy for navigations and `/api/*`, and CacheFirst for hashed JS/CSS/fonts.
- Service worker registration is guarded (`src/lib/pwa.ts`): never registers in dev, iframes, Lovable previews, or when `?sw=off` is on the URL.
- An `OfflineBanner` surfaces in chat/files/tasks/terminal when `navigator.onLine` is false; queries continue to render from cache.

## Self-hosting checklist

1. Provision a host (Fly.io, Railway, a VPS, etc.).
2. Set DNS → reverse proxy → container port `3000`.
3. Add env vars from `.env.example`.
4. Pull and run the image (or `docker compose up -d`).
5. Point `VITE_API_BASE_URL` / `VITE_WS_URL` at your hosted backend.
