# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1

# Build stage
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies
COPY --link package.json package.json
COPY --link package-lock.json package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files
COPY --link src/ src/
COPY --link public/ public/
COPY --link tsconfig.app.json tsconfig.app.json
COPY --link postcss.config.js postcss.config.js
COPY --link tailwind.config.js tailwind.config.js
COPY --link index.html index.html
COPY --link components.json components.json

# Build the app
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Remove dev dependencies and install only production dependencies
RUN rm -rf node_modules && npm ci --production

# Production stage
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy built app and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/components.json ./components.json
COPY --from=builder /app/index.html ./index.html

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
USER appuser

CMD ["npm", "start"]
