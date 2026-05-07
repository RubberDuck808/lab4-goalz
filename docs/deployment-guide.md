# Goalz — Deployment Guide

This guide covers local development setup and production deployment to Google Cloud Run. Read [docs/diagrams/c4_models.md](diagrams/c4_models.md) for a high-level architecture overview.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker Desktop | ≥ 4.x | Run the full stack locally |
| Node.js | ≥ 20 | Dashboard and mobile frontends |
| .NET SDK | 9.0 | Backend (only needed without Docker) |
| dotnet-ef | latest | Database migrations |
| Expo CLI | latest | Mobile app (optional) |

Install the EF CLI tool:
```bash
dotnet tool install -g dotnet-ef
```

---

## Services & Ports

| Service | Local Port | Notes |
|---|---|---|
| Backend API | 8080 | Swagger UI at `/swagger` |
| Dashboard | 3001 (Docker) / 5173 (Vite dev) | |
| Web app | 3000 (Docker) | |
| Mobile | device / emulator | Expo Metro on 8081 |
| PostgreSQL | 5432 | |
| MinIO API | 9000 | S3-compatible object storage |
| MinIO Console | 9001 | Web UI for browsing buckets |

---

## Local Development Setup

### 1. Environment Variables

Copy the root `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

```env
# PostgreSQL
POSTGRES_DB=goalz
POSTGRES_USER=goalz
POSTGRES_PASSWORD=<strong-password>

# Supabase (production connection string — leave blank for local Docker Postgres)
ConnectionStrings__DefaultConnection=""

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<strong-password>

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
JWT_SECRET=<random-string-at-least-32-characters>
```

> `JWT_SECRET` must be **at least 32 characters**. Authentication will fail silently with a shorter value.

---

### 2. Full Stack with Docker

Start all services (database, object storage, backend, web app, dashboard):
```bash
docker compose up
```

Start only the backend services (useful when running frontends locally):
```bash
docker compose up postgres minio backend
```

Verify the backend is running:
```
http://localhost:8080/swagger
```

The override file (`docker-compose.override.yml`) is merged automatically in development and enables hot-reload for all services via volume mounts.

---

### 3. Dashboard (without Docker)

```bash
cd frontend/dashboard
cp .env.example .env    # contains VITE_API_BASE_URL=http://localhost:5059
npm install
npm run dev             # http://localhost:5173
```

Adjust `VITE_API_BASE_URL` in `.env` if your backend runs on a different port.

---

### 4. Mobile App

```bash
cd frontend/mobile
cp .env.example .env
npm install
npm start               # shows Expo QR code
```

**Important:** `EXPO_PUBLIC_API_BASE_URL` must be your machine's **LAN IP address**, not `localhost`. The mobile device (physical or emulator) cannot reach `localhost` on your development machine.

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080   # use your actual LAN IP
GOOGLE_MAPS_API_KEY=                                # optional: enables Google Maps tiles
EXPO_PUBLIC_SUPABASE_URL=https://zfjyhczfxktgsxsulzlg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>  # required for photo uploads
```

All env vars consumed by client-side Expo code must be prefixed `EXPO_PUBLIC_`. Variables without this prefix are not injected into the bundle.

Scan the QR code with **Expo Go** (iOS/Android) to run on a physical device, or press `a` / `i` for Android/iOS emulator.

---

### 5. Backend Without Docker (optional)

Use `dotnet user-secrets` to configure secrets locally instead of environment variables:

```bash
cd backend/Goalz

dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=goalz;Username=goalz;Password=<your-password>" \
  --project Goalz.API

dotnet user-secrets set "Jwt:Secret" "<random-string-at-least-32-chars>" \
  --project Goalz.API

dotnet run --project Goalz.API
```

> Stop any running Docker backend container first to avoid port conflicts on 8080.

---

## Database Migrations

> **Always stop the running API before adding or applying migrations.** The API locks DLLs while running and will cause `MSB3027` file-lock errors.

### Stop the API

```bash
# Find the process
tasklist | findstr dotnet

# Kill it (run in cmd, not bash)
cmd /c "taskkill /F /PID <PID>"
```

If the build still fails after killing the process, clear the stale bin output:
```bash
cmd /c "rmdir /S /Q backend\Goalz\Goalz.API\bin\Debug\net9.0"
```

### Add a Migration

Always use `--configuration Release` to avoid DLL lock conflicts with the Debug output directory.

```bash
cd backend/Goalz

dotnet ef migrations add <MigrationName> \
  --project Goalz.Data \
  --startup-project Goalz.API \
  --configuration Release
```

### Apply Migrations

```bash
dotnet ef database update \
  --project Goalz.Data \
  --startup-project Goalz.API \
  --configuration Release
```

### Active Migration Chain

Migrations live in `Goalz.Data/Migrations/`. **Do not add migrations to `Goalz.Infrastructure/Migrations/`** — that is a legacy chain that is not used at runtime.

Current migrations in order:
1. `InitialCreate` — empty Up() (schema pre-existed)
2. `AddUserCreatedAt` — adds `CreatedAt` to Users
3. `AddFriendships` — creates `Friendships` table

---

## Environment Variable Reference

### Root `.env` (Docker Compose)

| Variable | Required | Default | Used by |
|---|---|---|---|
| `POSTGRES_DB` | No | `goalz` | `postgres` container |
| `POSTGRES_USER` | No | `goalz` | `postgres` container |
| `POSTGRES_PASSWORD` | Yes | — | `postgres` container |
| `ConnectionStrings__DefaultConnection` | Yes (prod) | — | Backend API (Supabase in prod) |
| `MINIO_ROOT_USER` | No | `minioadmin` | `minio` container |
| `MINIO_ROOT_PASSWORD` | Yes | — | `minio` container |
| `ASPNETCORE_ENVIRONMENT` | No | `Development` | Backend API |
| `JWT_SECRET` | Yes | — | Backend API (≥ 32 chars) |

### `frontend/dashboard/.env`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:5059` | Backend URL for dashboard API calls |

### `frontend/mobile/.env`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | `http://localhost:8080` | Must be LAN IP on physical devices |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | _(pre-filled)_ | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon/public API key |
| `GOOGLE_MAPS_API_KEY` | No | — | Enables Google Maps tiles in the app |

### ASP.NET Core Key Mapping

ASP.NET Core uses `__` as the hierarchy separator for environment variables:

| `appsettings.json` key | Environment variable |
|---|---|
| `Jwt:Secret` | `Jwt__Secret` |
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` |
| `Minio:Endpoint` | `Minio__Endpoint` |
| `Minio:AccessKey` | `Minio__AccessKey` |
| `Minio:SecretKey` | `Minio__SecretKey` |
| `AllowedOrigins` | `AllowedOrigins` |

---

## Production Deployment (GCP Cloud Run)

### Overview

| Component | Service |
|---|---|
| Backend API | Cloud Run (`goalz-api`) |
| Dashboard | Cloud Run (`goalz-dashboard`) |
| Database | Supabase (managed PostgreSQL) |
| Object Storage | MinIO (or S3-compatible) |
| Container Registry | Google Container Registry (GCR) |
| Region | `europe-west1` |
| GCP Project | `goalz-loggin` |

### CI/CD Pipeline (GitLab)

The `.gitlab-ci.yml` defines five stages that run automatically on push:

```
install → build → test → sonarqube → deploy
```

| Stage | Job | What it does |
|---|---|---|
| install | `frontend:install` | `npm ci` for dashboard |
| build | `frontend:build` | `npm run build` for dashboard |
| build | `backend:build` | `dotnet build -c Release` |
| test | `backend:test` | XPlat code coverage |
| sonarqube | `sonarqube:analysis` | SonarCloud analysis (main/dev branches only) |
| deploy | `backend:deploy` | Cloud Build → deploy to `goalz-api` Cloud Run service |
| deploy | `dashboard:deploy` | Cloud Build → deploy to `goalz-dashboard` Cloud Run service |

### Manual Deploy

If you need to deploy manually without GitLab CI:

**Backend:**
```bash
cd backend/Goalz
gcloud builds submit --config cloudbuild.yaml .
gcloud run deploy goalz-api \
  --image gcr.io/goalz-loggin/goalz-api \
  --region europe-west1 \
  --project goalz-loggin
```

**Dashboard:**
```bash
cd frontend/dashboard
gcloud builds submit --config cloudbuild.yaml .
gcloud run deploy goalz-dashboard \
  --image gcr.io/goalz-loggin/goalz-dashboard \
  --region europe-west1 \
  --project goalz-loggin
```

### Production Environment Variables

Inject these into the Cloud Run service configuration (or via Secret Manager):

| Variable | Notes |
|---|---|
| `ConnectionStrings__DefaultConnection` | Supabase connection string |
| `Jwt__Secret` | ≥ 32 chars, randomly generated |
| `Minio__Endpoint` | MinIO host:port |
| `Minio__AccessKey` | MinIO access key |
| `Minio__SecretKey` | MinIO secret key |
| `AllowedOrigins` | Comma-separated CORS origins |
| `ASPNETCORE_ENVIRONMENT` | Set to `Production` |

### CORS (AllowedOrigins)

The following origins are pre-configured in `appsettings.json`:

```
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:8081
https://goalz-dashboard-237169763190.europe-west1.run.app
https://www.loggin-dashboard.com
```

Add any new origins to `AllowedOrigins` via environment variable (comma-separated, no spaces).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Mobile app can't reach the API | `localhost` is unreachable from the device | Set `EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP (e.g. `http://192.168.x.x:8080`) |
| `MSB3027` file-lock error on build | API is running and holding the DLL | Kill the `dotnet` process: `cmd /c "taskkill /F /PID <PID>"` |
| Migration fails with error | Debug output directory is locked | Use `--configuration Release` on all `dotnet ef` commands |
| JWT validation fails (401 on all routes) | Secret too short | `JWT_SECRET` must be ≥ 32 characters |
| `L.Control.Draw is undefined` (dashboard) | Leaflet imported from npm instead of CDN | Use `const L = window.L` — never `import * as L from 'leaflet'` |
| Container exits immediately on startup | Missing required env vars | Check `ConnectionStrings__DefaultConnection` and `Jwt__Secret` are set |
