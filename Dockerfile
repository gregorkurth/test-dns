# syntax=docker/dockerfile:1

# Stage 1: Build MkDocs documentation (OBJ-27)
FROM python:3.12-alpine AS docs-builder
WORKDIR /docs
RUN pip install --no-cache-dir mkdocs==1.6.1
COPY mkdocs.yml .
COPY docs/ docs/
RUN mkdocs build --strict --site-dir /docs/site

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY scripts/ ./scripts/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Embed the MkDocs static site so Next.js serves it under /docs/
COPY --from=docs-builder /docs/site ./public/docs
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
