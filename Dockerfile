# Kitufu Residences — Production Dockerfile for Railway
FROM node:20-slim AS builder
WORKDIR /app
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
