# Kitufu Residences — Production Dockerfile for Railway
# LESSON from HANDOFF_LOG: delete package-lock.json before npm install
# to avoid conflicts with --legacy-peer-deps (causes vite: not found)

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# CRITICAL: delete lock file for clean install with --legacy-peer-deps
RUN rm -f package-lock.json && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json* ./
RUN rm -f package-lock.json && npm install --legacy-peer-deps --omit=dev
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
