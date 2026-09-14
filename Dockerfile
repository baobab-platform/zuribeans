FROM node:26.8-alpine3.24 AS dependencies
WORKDIR /app
# Next.js documents libc6-compat as needed on Alpine for some native dependencies.
RUN apk add --no-cache libc6-compat
RUN npm install --global corepack@latest && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
ARG MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLED_MARKETS=zuribeans_ug,zuribeans_za
ARG NEXT_PUBLIC_DEFAULT_MARKET=zuribeans_za
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ENABLED_MARKETS=$NEXT_PUBLIC_ENABLED_MARKETS
ENV NEXT_PUBLIC_DEFAULT_MARKET=$NEXT_PUBLIC_DEFAULT_MARKET
RUN pnpm build

FROM node:26.8-alpine3.24 AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# Pick up patched apk packages (e.g. openssl) released after this base image was built.
RUN apk upgrade --no-cache
# The standalone server only ever runs `node server.js` and never needs npm/npx/corepack;
# drop them (and their bundled tar/ip-address/brace-expansion) to shrink the CVE surface
# Trivy scans in the runtime image.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
RUN addgroup --system --gid 10001 nextjs && \
    adduser --system --uid 10001 --ingroup nextjs nextjs
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
