# Kitufu Residences — Bulletproof Dockerfile for Railway
# Fixes applied: no lock file conflicts, global legacy-peer-deps, explicit npx paths

# ── STAGE 1: Builder ──
FROM node:20-slim AS builder
WORKDIR /app

# Set global npm config BEFORE any install
RUN npm config set legacy-peer-deps true

# Copy ONLY package.json (no lock file = no conflicts)
COPY package.json ./

# Install ALL dependencies (including dev — needed for vite, esbuild, tsc)
RUN npm install

# Copy source and build
COPY . .
RUN npx vite build && npx esbuild api/boot.ts --platform=node --bundle --format=esm --outdir=dist --banner:js="import { createRequire } from 'module';const require = createRequire(import.meta.url);"

# ── STAGE 2: Production ──
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm config set legacy-peer-deps true

COPY package.json ./
RUN npm install --omit=dev

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./dist/public

# Database + config (for drizzle-kit in Railway Shell)
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.server.json ./

# CLI tools (CRITICAL: drizzle-kit, tsx need these at runtime)
COPY --from=builder /app/node_modules ./node_modules

# Static assets
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
