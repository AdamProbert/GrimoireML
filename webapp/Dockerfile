# Dev-only Dockerfile for Next.js (hot reload + fast iterative builds)
# Usage:
#   docker compose build frontend
#   docker compose up frontend
# Recommended compose service snippet:
#   frontend:
#     build: { context: ./webapp }
#     volumes:
#       - ./webapp:/app
#       - /app/node_modules
#     environment:
#       NEXT_PUBLIC_API_BASE: http://backend:8000
#     command: npm run dev

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}
WORKDIR /app
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    WATCHPACK_POLLING=true

# Copy only dependency manifests first (better cache utilization)
COPY package*.json ./

# Install (dev + prod) dependencies with an npm cache mount
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
    else \
    npm install --no-audit --no-fund; \
    fi

# Copy rest of source (will be overridden by bind mount in compose; harmless fallback)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
