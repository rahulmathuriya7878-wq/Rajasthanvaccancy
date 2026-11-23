# syntax=docker/dockerfile:1
# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install

COPY . .
RUN --mount=type=cache,target=/app/.next/cache npm run build:next

# Stage 2: Production runner for Google Cloud Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
