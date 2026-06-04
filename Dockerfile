# Omena Codex — production image (Bun + Vite SSR)
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build 2>&1 | tee build.log || { echo "Build command failed!"; cat build.log; exit 1; }
RUN if [ ! -d /app/.output ]; then echo "ERROR: .output directory not found after build"; echo "=== Directory listing ==="; ls -lah /app; echo "=== Full tree ==="; find /app -maxdepth 2 -type d; cat build.log; exit 1; fi
RUN echo "=== .output directory structure ===" && find /app/.output -type f | head -20

FROM oven/bun:1.3-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null 2>&1 || exit 1
CMD ["bun", ".output/server/index.mjs"]
