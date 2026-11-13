# Image frontend untuk service fe di deploy/compose.yaml repo BE. Hanya .next/standalone yang dibawa ke image akhir.
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next.config.ts membaca BE_API_URL saat build (izin domain gambar), dan NEXT_PUBLIC_* ditanam ke bundle browser.
# Mengganti salah satunya berarti build ulang image.
ARG BE_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=127.0.0.1
COPY --from=build /app/public ./public
# Pemilik node supaya cache optimizer gambar di .next/cache bisa ditulis.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
