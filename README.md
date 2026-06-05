# Omena Codex

A production-ready, mobile-first operator console for AI engineering agents.
Built with **TanStack Start**, **React 19**, **Vite 7**, **Tailwind v4**, and **Bun**.
Fully self-hostable — clone, configure, deploy.

> Screens: Tasks · Chat · Terminal · Files · Settings (5-tab mobile shell, PWA-ready, offline-safe)

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Quick start (clone & run)](#quick-start)
5. [Environment variables](#environment-variables)
6. [Plugging in real APIs](#plugging-in-real-apis)
7. [Production build](#production-build)
8. [Docker](#docker)
9. [Deployment targets](#deployment-targets)
10. [Backend contract (REST + WS)](#backend-contract)
11. [State management](#state-management)
12. [Mock fallback (dev mode)](#mock-fallback)
13. [PWA / offline](#pwa--offline)
14. [Testing & CI](#testing--ci)
15. [Troubleshooting](#troubleshooting)
16. [License](#license)

---

## Features

- 5-tab mobile shell with safe-area / notch handling (iOS + Android)
- Tasks list + 7-tab task detail (Overview, Reasoning, Logs, Files, Changes, Tests, Approvals)
- ChatGPT-style chat with model selector, attachments, voice button
- Live terminal with WebSocket / SSE streaming + exponential-backoff reconnect
- File explorer + in-browser code editor (save via API)
- Settings: agents, providers, model routing, permissions
- Zustand store for workspace / agent / model context (persisted)
- PWA: manifest, service worker, offline banner, cached app shell
- Vitest integration tests (api + stream)
- GitHub Actions CI (lint → test → docker build)
- Multi-stage Bun Dockerfile + docker-compose

## Tech stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start v1 (file-based routing, SSR-capable) |
| UI | React 19 + Tailwind v4 + shadcn/ui |
| State | Zustand (persisted) + TanStack Query |
| Runtime | Bun (Node 20+ also supported) |
| Build | Vite 7 |
| Testing | Vitest |
| PWA | vite-plugin-pwa (Workbox) |
| Container | Multi-stage Dockerfile (Bun slim) |

## Project structure

```
.
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
├── .env.example
├── vite.config.ts
├── vitest.config.ts
├── package.json
├── public/
│   ├── manifest.webmanifest
│   └── icons/
└── src/
    ├── routes/                # File-based routes
    │   ├── __root.tsx
    │   ├── index.tsx          # redirects to /tasks
    │   ├── tasks.tsx
    │   ├── tasks.$id.tsx
    │   ├── chat.tsx
    │   ├── terminal.tsx
    │   ├── files.tsx
    │   ├── files.$.tsx
    │   ├── settings.tsx
    │   └── api/               # Server routes (HTTP endpoints)
    ├── components/
    │   ├── layout/            # AppShell, TopHeader, BottomTabs
    │   ├── OfflineBanner.tsx
    │   └── ui/                # shadcn primitives
    ├── lib/
    │   ├── api.ts             # HTTP client + mock fallback
    │   ├── stream.ts          # WS/SSE harness w/ reconnect
    │   ├── store.ts           # Zustand: workspace/agent/model
    │   ├── mock-data.ts       # Seeded fallback data
    │   ├── pwa.ts             # Guarded SW registration
    │   └── __tests__/
    ├── styles.css             # Design tokens (oklch)
    ├── router.tsx
    └── start.ts
```

## Quick start

Requirements: **Bun ≥ 1.1** (or **Node ≥ 20** + npm/pnpm).

```bash
git clone <your-repo-url> omena-codex
cd omena-codex
bun install
cp .env.example .env            # leave blank to run in mock mode
bun dev                         # http://localhost:5173
```

Mock mode runs the full UI with seeded data — no backend required.

## Environment variables

Copy `.env.example` → `.env`. Only `VITE_*` vars are bundled into the frontend.

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | client | Real REST API base. Empty → mock mode. |
| `VITE_WS_URL` | client | WebSocket URL for terminal log stream. |
| `OPENAI_API_KEY` | server | Provider key (never exposed to frontend) |
| `ANTHROPIC_API_KEY` | server | |
| `GOOGLE_GENERATIVE_AI_API_KEY` | server | |
| `DEEPSEEK_API_KEY` | server | |
| `XAI_API_KEY` | server | |
| `MISTRAL_API_KEY` | server | |
| `CUSTOM_MODEL_BASE_URL` | server | Self-hosted / OpenAI-compatible endpoint |
| `CUSTOM_MODEL_API_KEY` | server | |

> `VITE_*` values are **baked into the bundle at build time** — set them before `bun run build`, not at runtime.

## Plugging in real APIs

The only place you wire a backend is `src/lib/api.ts`. It reads `VITE_API_BASE_URL` once:

```ts
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = !BASE;
```

When `VITE_API_BASE_URL` is set, every function (`getTasks`, `sendChatMessage`, `getFiles`, …) hits HTTP instead of returning seeded mocks. Same for `VITE_WS_URL` in `src/lib/stream.ts`.

**To disable mocks in production:** set both env vars to non-empty values before building. No code change needed.

## Production build

```bash
export VITE_API_BASE_URL="https://api.your-domain.com"
export VITE_WS_URL="wss://api.your-domain.com/ws"

bun run build          # → dist/
bun run preview        # smoke-test locally on :3000
```

Output is a standard Node/Bun server: `dist/server/index.mjs`.

## Docker

```bash
# Build with baked-in URLs
docker build -t omena-codex \
  --build-arg VITE_API_BASE_URL=https://api.your-domain.com \
  --build-arg VITE_WS_URL=wss://api.your-domain.com/ws .

docker run -p 3000:3000 omena-codex
```

Or use compose (reads `.env`):

```bash
docker compose up -d --build
```

## Deployment targets

| Target | How |
|---|---|
| **VPS** | `docker compose up -d` behind nginx/Caddy with TLS |
| **Cloudflare Workers** | `bunx wrangler deploy` — `vite.config.ts` already targets workerd |
| **Fly.io / Render / Railway** | Point at the included `Dockerfile` |
| **Vercel / Netlify** | Import repo, set `VITE_*` in project env, build cmd: `bun run build` |
| **Kubernetes** | Use the Docker image; mount env from a ConfigMap/Secret |

Routes work on hard refresh (TanStack handles SPA fallback — no `_redirects` or `vercel.json` needed).

## Backend contract

Implement these endpoints to replace the mocks. Types live in `src/lib/mock-data.ts`.

### REST

| Method | Path | Returns |
|---|---|---|
| GET | `/tasks` | `Task[]` |
| GET | `/tasks/:id` | `Task` |
| POST | `/tasks` | `Task` (body: `{title, prompt, agent}`) |
| GET | `/tasks/:id/diffs` | `{staged, unstaged, taskId}` |
| GET | `/tasks/:id/tests` | `TestsResult` |
| GET | `/chat/messages` | `ChatMessage[]` |
| POST | `/chat/messages` | `ChatMessage` (assistant reply) |
| GET | `/terminal/logs` | `TerminalLine[]` |
| POST | `/commands/:id/approve` | `{ok: true}` |
| POST | `/commands/:id/reject` | `{ok: true}` |
| GET | `/files` | `FileNode` (tree) |
| GET | `/files/:path/content` | raw text |
| PUT | `/files/:path/content` | `{ok: true}` |
| GET | `/providers` | `Provider[]` |
| PATCH | `/providers/:id` | updated provider |
| GET | `/models` | `ModelOption[]` |
| POST | `/models/:id/activate` | `{ok: true}` |
| GET | `/agents` | `Agent[]` |
| PATCH | `/agents/:id` | updated agent |
| GET | `/workspaces` | `Workspace[]` |
| POST | `/workspaces/:id/activate` | `{ok: true}` |
| GET | `/notifications` | `Notification[]` |

### WebSocket

`VITE_WS_URL` should emit newline-delimited or per-message JSON matching:

```ts
interface TerminalLine {
  id: string;
  stream: "stdout" | "stderr";
  text: string;
  ts: string;        // ISO 8601
}
```

The client auto-reconnects with exponential backoff.

## State management

`src/lib/store.ts` (Zustand, persisted to `localStorage`):

```ts
const { workspaceId, agentId, modelId,
        setWorkspace, setAgent, setModel } = useApp();
```

Read it anywhere — the top header, chat composer, and task creation all source context from this single store.

## Mock fallback

Located in `src/lib/mock-data.ts`. Used automatically when `VITE_API_BASE_URL` is empty. To disable in production, simply set the env var at build time.

## PWA / offline

- Manifest: `public/manifest.webmanifest`
- Icons: `public/icons/`
- Service worker registration: `src/lib/pwa.ts` (auto-disabled in dev + Lovable preview)
- Offline banner: `src/components/OfflineBanner.tsx`
- Cached: app shell + last-fetched task/chat/file data

Service worker registers **only in production builds on your own domain**.

## Testing & CI

```bash
bun test           # vitest run (api + stream tests)
bun test:watch
bun lint
```

`.github/workflows/ci.yml` runs lint → test → docker build on every push.

## Troubleshooting

| Symptom | Fix |
|---|---|
| UI still shows seeded data after deploy | `VITE_API_BASE_URL` was empty at build time. Rebuild with the env set. |
| Terminal shows mock log lines | Set `VITE_WS_URL` and rebuild. |
| 404 on hard refresh | Confirm your host serves the TanStack server output, not just `dist/`. |
| CORS errors | Allow your frontend origin from the backend. WS needs the same. |
| Service worker serving stale UI | Visit `/?sw=off` once to unregister, then hard-reload. |
| iOS notch overlap | Already handled via `env(safe-area-inset-*)` in `AppShell`, `TopHeader`, `BottomTabs`. |

## License

MIT. Own it, fork it, ship it.
