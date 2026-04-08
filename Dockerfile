# ============================================================
# News Card Generator Pro — Multi-stage Dockerfile
# Stages:
#   base          → shared Node 20 + pnpm layer
#   build-api     → compiles api-server (TypeScript)
#   build-gen     → compiles news-card-generator (Vite/React)
#   build-pro     → compiles news-card-pro (Vite/React)
#   api           → production API image (Node + Chromium)
#   frontend-gen  → nginx serving the free generator
#   frontend-pro  → nginx serving the pro dashboard
# ============================================================

# ---- shared base (node + pnpm + workspace deps) ----
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/db/package.json                          ./lib/db/
COPY lib/api-zod/package.json                     ./lib/api-zod/
COPY lib/api-spec/package.json                    ./lib/api-spec/
COPY lib/api-client-react/package.json            ./lib/api-client-react/
COPY artifacts/api-server/package.json            ./artifacts/api-server/
COPY artifacts/news-card-generator/package.json   ./artifacts/news-card-generator/
COPY artifacts/news-card-pro/package.json         ./artifacts/news-card-pro/

# Install ALL deps (dev included) for build stages
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# ---- build: API server ----
FROM base AS build-api
RUN pnpm --filter @workspace/api-server run build

# ---- build: free generator frontend ----
FROM base AS build-gen
# PORT is required by vite.config.ts validation; BASE_PATH sets the base URL
ENV PORT=3000
ENV BASE_PATH=/
ENV NODE_ENV=production
RUN pnpm --filter @workspace/news-card-generator run build

# ---- build: pro dashboard frontend ----
FROM base AS build-pro
ENV PORT=3001
ENV BASE_PATH=/pro/
ENV NODE_ENV=production
RUN pnpm --filter @workspace/news-card-pro run build

# ============================================================
# PRODUCTION IMAGE: API (Node + Chromium)
# ============================================================
FROM node:20-alpine AS api

# Install Chromium and Arabic font support
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  font-noto-arabic

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Workspace manifests for prod install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/db/package.json              ./lib/db/
COPY lib/api-zod/package.json         ./lib/api-zod/
COPY lib/api-spec/package.json        ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/news-card-generator/package.json ./artifacts/news-card-generator/
COPY artifacts/news-card-pro/package.json       ./artifacts/news-card-pro/

# Prod-only deps
RUN pnpm install --frozen-lockfile --prod

# Copy compiled API output
COPY --from=build-api /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build-api /app/artifacts/api-server/src/fonts ./artifacts/api-server/src/fonts
COPY lib/ ./lib/

# uploads dir (mounted as volume at runtime)
RUN mkdir -p artifacts/api-server/uploads

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]

# ============================================================
# PRODUCTION IMAGE: Free Generator (nginx)
# ============================================================
FROM nginx:alpine AS frontend-gen

COPY nginx/generator.conf /etc/nginx/conf.d/default.conf
COPY --from=build-gen /app/artifacts/news-card-generator/dist/public /usr/share/nginx/html/public

EXPOSE 80

# ============================================================
# PRODUCTION IMAGE: Pro Dashboard (nginx)
# ============================================================
FROM nginx:alpine AS frontend-pro

COPY nginx/pro.conf /etc/nginx/conf.d/default.conf
# Copy built assets into /public/pro/ so nginx root+location resolves correctly:
# root = /usr/share/nginx/html/public, location = /pro/ → files at /public/pro/
COPY --from=build-pro /app/artifacts/news-card-pro/dist/public /usr/share/nginx/html/public/pro

EXPOSE 80
