# The static site, as Coolify builds it. Directus must be reachable at build time:
# `nuxt generate` reads the content from it and the CV PDFs are printed from the generated pages.

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
# headless Chromium for scripts/cv-pdf.mjs, with its system libraries
RUN npx playwright install --with-deps chromium

COPY . .
ARG NUXT_PUBLIC_DIRECTUS_URL
ARG NUXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NUXT_PUBLIC_SITE_URL
# A content change rebuilds the same commit: without this the generate layer would come from
# Docker's cache, with the old content. The random string (public in Directus) changes on every
# build, so only the layers above stay cached.
ADD ${NUXT_PUBLIC_DIRECTUS_URL}/utils/random/string?length=32 /tmp/cache-bust
RUN npm run generate

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
