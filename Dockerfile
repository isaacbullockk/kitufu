# Kitufu Residences — Multi-stage Dockerfile for Railway
# - Builder stage compiles everything
# - Production stage copies db/ + node_modules for CLI tools at runtime

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/public ./dist/public
COPY --from=builder /app/db ./db
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.server.json* ./ 2>/dev/null || true
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
