# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for Next.js (App Router) production build

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies stage (restore layer caching)
FROM base AS deps
# Copy manifest & optional package-lock (pattern won't fail if lock missing)
COPY package*.json ./
# Install ALL deps (dev + prod) needed for build; prefer npm ci when lock present
RUN if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund ; \
    else \
    npm install --no-audit --no-fund ; \
    fi

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build (generates .next)
RUN npm run build
# Prune dev dependencies for lean runtime (keep only prod deps)
RUN npm prune --omit=dev

# Production runtime image
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy only necessary build artifacts
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health >/dev/null 2>&1 || exit 1

# Use Next.js built-in server
CMD ["npm", "run", "start"]
