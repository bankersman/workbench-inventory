# syntax=docker/dockerfile:1

FROM node:24-bookworm AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-bookworm AS prod_deps

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules

RUN npm prune --omit=dev

FROM node:24-bookworm AS native_libs

WORKDIR /app

COPY --from=prod_deps /app/node_modules ./node_modules
COPY scripts/collect-distroless-libs.sh /collect-distroless-libs.sh

RUN chmod +x /collect-distroless-libs.sh \
  && /collect-distroless-libs.sh /sysroot \
    /app/node_modules/canvas/build/Release/canvas.node \
    /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runtime

WORKDIR /opt/inventory

COPY --from=native_libs /sysroot /

COPY --from=build /app/dist ./dist
COPY --from=prod_deps /app/node_modules ./node_modules
COPY --from=prod_deps /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/opt/inventory/data/inventory.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||'3000')+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["dist/main.js"]
