# Kitufu Residences — Production Dockerfile for Railway
# LESSONS FROM HANDOFF_LOG applied:
# - Multi-stage build (builder compiles, production runs)
# - Copy db/ + drizzle.config.ts for schema management at runtime
# - Copy node_modules for CLI tools (drizzle-kit, tsx) in Railway Shell
# - --legacy-peer-deps prevents dependency conflicts
# - No shell globs in COPY (Docker doesn't support them)

# ── STAGE 1: Build everything ──
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ── STAGE 2: Production runtime ──
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production deps (no devDeps — smaller image)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev

# Built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./dist/public

# Database files (CRITICAL for drizzle-kit push in Railway Shell)
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./

# Config files for runtime TypeScript/CLI tools
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.server.json ./
# CLI tools must be available at runtime (Railway Shell is NOT a build env)
COPY --from=builder /app/node_modules ./node_modules

# Static assets
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
