FROM node:20-alpine AS base

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/news-card-generator/package.json ./artifacts/news-card-generator/
COPY artifacts/news-card-pro/package.json ./artifacts/news-card-pro/

RUN pnpm install --frozen-lockfile

COPY . .

FROM base AS builder-generator
WORKDIR /app
RUN pnpm --filter @workspace/news-card-generator run build

FROM base AS builder-pro
WORKDIR /app
RUN pnpm --filter @workspace/news-card-pro run build

FROM base AS builder-api
WORKDIR /app
RUN pnpm --filter @workspace/api-server run build

FROM node:20-alpine AS production
RUN npm install -g pnpm@10

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

WORKDIR /app

COPY --from=builder-api /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder-api /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=builder-generator /app/artifacts/news-card-generator/dist ./artifacts/news-card-generator/dist
COPY --from=builder-pro /app/artifacts/news-card-pro/dist ./artifacts/news-card-pro/dist

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/ ./lib/

RUN pnpm install --prod --frozen-lockfile

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.js"]
