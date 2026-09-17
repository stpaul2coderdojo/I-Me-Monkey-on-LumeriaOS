# syntax=docker/dockerfile:1
# Multi-stage production build for I-Me-Monkey DAO (React + Vite + Express Backend)

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for compilation)
RUN npm ci

# Copy full application source
COPY . .

# Build client-side assets and bundle backend server into dist/server.cjs
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only to minimize image size and attack surface
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy pre-compiled distribution assets and configuration from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/metadata.json ./metadata.json

# Cloud container port
EXPOSE 3000

# Run container as non-root user for security
USER node

# Health check using the Express backend healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Production entrypoint
CMD ["node", "dist/server.cjs"]
