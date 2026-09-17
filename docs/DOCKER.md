# Docker & Container Deployment Guide

This document outlines the containerization strategy, multi-stage build structure, and deployment procedures for **I-Me-Monkey DAO**.

---

## 1. Multi-Stage Dockerfile Architecture

The application uses a 2-stage build in `Dockerfile` to produce an ultra-lean, security-hardened production image:

```
[STAGE 1: builder (node:22-alpine)]
 ├── Install all npm dependencies (including devDependencies: vite, esbuild, typescript)
 ├── Compile client via `npm run build` -> dist/ (HTML, JS, CSS)
 └── Bundle server.ts with esbuild -> dist/server.cjs

                                     │
                    Artifact Copy    ▼

[STAGE 2: runner (node:22-alpine)]
 ├── Set NODE_ENV=production, PORT=3000
 ├── Install production dependencies only (`npm ci --omit=dev`)
 ├── Copy pre-built dist/ and metadata.json from builder stage
 ├── Switch user from root to non-root `USER node`
 └── Start service via `CMD ["node", "dist/server.cjs"]`
```

---

## 2. Local Container Operations

### Building the Image
```bash
docker build -t i-me-monkey-dao:latest .
```

### Running Standalone
```bash
docker run -d \
  --name i-me-monkey-dao-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  i-me-monkey-dao:latest
```

### Inspecting Container Health
```bash
# Check status and healthcheck output
docker inspect --format='{{json .State.Health}}' i-me-monkey-dao-app
```

---

## 3. Docker Compose Configuration

The root `docker-compose.yml` provides a declarative runtime environment:

```yaml
version: '3.8'

services:
  i-me-monkey-dao:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: i-me-monkey-dao
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY:-}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Run compose with:
```bash
docker compose up -d --build
```

---

## 4. Deploying to Google Cloud Run

Google Cloud Run is the recommended platform for hosting the I-Me-Monkey DAO container due to its serverless scaling, built-in TLS, and integration with Vertex AI.

### Step 1: Authenticate with Google Cloud
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Build and Push Image to Google Artifact Registry
```bash
# Create repository in Artifact Registry
gcloud artifacts repositories create dao-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="I-Me-Monkey DAO Docker repository"

# Build image using Cloud Build
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/dao-repo/i-me-monkey-dao:v1 .
```

### Step 3: Deploy Service to Cloud Run
```bash
gcloud run deploy i-me-monkey-dao \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/dao-repo/i-me-monkey-dao:v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 5. Security & Hardening Checklist

- [x] **Non-Root Execution**: Container drops root privileges and executes as unprivileged user `node` (UID 1000).
- [x] **No Dev Dependencies in Runtime**: Dev dependencies (TypeScript, Vite, Esbuild) are strictly isolated to the builder stage.
- [x] **Minimal Attack Surface**: Uses Alpine Linux as the base image.
- [x] **Automated Health Check**: Periodic HTTP checks against `/api/health`.
- [x] **Secret Isolation**: Secrets like `GEMINI_API_KEY` are read strictly from runtime environment variables, never baked into Docker layers.
