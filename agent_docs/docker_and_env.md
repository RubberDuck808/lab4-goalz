# Docker & Environment Setup

## Running the Full Stack

```bash
# One-time: copy and fill the root env file
cp .env.example .env
# Edit: set POSTGRES_PASSWORD, JWT_SECRET (min 32 chars), and any other required values

# Start all services
docker compose up
```

## Service Ports

| Service | Port |
|---|---|
| Backend API | 8080 |
| Web app | 3000 |
| Dashboard | 3001 |
| PostgreSQL | 5432 |
| MinIO API | 9000 |
| MinIO Console | 9001 |

## Environment Variable Conventions

**ASP.NET nested config → env var:** Use double underscore `__` as the separator.

Examples:
- `Jwt:Secret` → `Jwt__Secret`
- `ConnectionStrings:DefaultConnection` → `ConnectionStrings__DefaultConnection`
- `Minio:Endpoint` → `Minio__Endpoint`

When adding new `appsettings.json` config keys that need to work in Docker, pass them via environment in `docker-compose.yml` using this `__` convention.

**Frontend (mobile):** Expo env vars must be prefixed `EXPO_PUBLIC_` — see `agent_docs/project_architecture.md`.

## Local Backend (without Docker)

The backend reads `ConnectionStrings:DefaultConnection` from `appsettings.json` or user secrets. To configure locally:

```bash
cd backend/Goalz
dotnet user-secrets set "Jwt:Secret" "your-secret-here-min-32-chars"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=goalz;Username=goalz;Password=yourpassword"
```
