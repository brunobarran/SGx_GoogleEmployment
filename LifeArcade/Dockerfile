# =============================================================================
# STAGE 1: Builder - Build the application
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and configuration
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.js ./
COPY installation.html ./

# Build production bundle
RUN npm run build

# =============================================================================
# STAGE 2: Production - Minimal runtime image
# =============================================================================
FROM node:22-alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files for production dependencies only
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose preview server port
EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4173/installation.html || exit 1

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
