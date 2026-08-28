# Kitufu Residences — Production Dockerfile for Railway
FROM node:20-slim AS builder
WORKDIR /app

# Vite bakes VITE_* vars into the bundle at BUILD time.
# Railway only forwards service variables into docker build when declared as ARG.
ARG VITE_KIMI_AUTH_URL
ARG VITE_APP_ID
ENV VITE_KIMI_AUTH_URL=$VITE_KIMI_AUTH_URL
ENV VITE_APP_ID=$VITE_APP_ID

RUN npm config set legacy-peer-deps true
COPY package.json ./
RUN rm -f package-lock.json && npm install
COPY . .
RUN npx vite build && npx esbuild api/boot.ts --platform=node --bundle --format=esm --outdir=dist --banner:js="import { createRequire } from 'module';const require = createRequire(import.meta.url);"

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN npm config set legacy-peer-deps true
COPY package.json ./
RUN rm -f package-lock.json && npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./dist/public
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.server.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]

# Cache bust 2026-08-06-v2

# Cache bust 2026-08-06-v3-features

# Cache bust v6 1786020253

# Cache bust v7 mobile-fixes 1786022235

# Cache bust v8 vite-env-args 1786024000
