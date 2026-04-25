FROM node:20-bookworm-slim AS builder
WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_N8N_ENV
ARG VITE_N8N_MODE
ARG VITE_N8N_PROD_URL
ARG VITE_N8N_DEV_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_N8N_ENV=$VITE_N8N_ENV
ENV VITE_N8N_MODE=$VITE_N8N_MODE
ENV VITE_N8N_PROD_URL=$VITE_N8N_PROD_URL
ENV VITE_N8N_DEV_URL=$VITE_N8N_DEV_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "server/index.js"]
