# syntax=docker/dockerfile:1

############################
# Stage 1: build
############################
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# openssl must be present so Prisma detects the same engine target (openssl-3.0.x)
# that the runtime stage uses — otherwise the generated query engine won't load.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# pnpm is the project's package manager (pnpm-lock.yaml)
RUN npm install -g pnpm@10

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build: prisma generate (client) + nest build
COPY . .
RUN pnpm run build

############################
# Stage 2: runtime
############################
FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# System libraries required by pdf2pic (GraphicsMagick + Ghostscript + poppler).
# Remove this block if the upload module's PDF features are not used.
RUN apt-get update && apt-get install -y --no-install-recommends \
        graphicsmagick \
        ghostscript \
        poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# node_modules carries the Prisma CLI + generated client, so the boot-time
# `npx prisma migrate deploy` in src/main.ts runs offline.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# schema + migrations are needed at runtime for `migrate deploy`
COPY --from=builder /app/lib/prisma/prisma ./lib/prisma/prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3030

CMD ["node", "dist/src/main.js"]
