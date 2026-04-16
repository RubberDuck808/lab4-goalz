# Goalz — Office of Sustainability Platform

> This project is developed as part of a university–high school collaboration under the Office of Sustainability program.

## Overview

Goalz is a sustainability platform built around **Loggin** — an interactive mobile game where players explore the arboretum, collect sensor data, photograph nature elements, and answer quiz questions to earn points. The platform also includes an **admin dashboard** for staff to monitor activity and manage the game.

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## Project Structure

```
lab4-goalz/
├── backend/
│   └── Goalz/
│       ├── Goalz.API/            # Web API entry point — controllers, routing
│       ├── Goalz.Application/    # Business logic — services, DTOs
│       ├── Goalz.Domain/         # Core entities and interfaces
│       └── Goalz.Infrastructure/ # Database, repositories, migrations
├── frontend/
│   ├── app/                      # Loggin — player-facing mobile web app (React)
│   └── dashboard/                # Arboretum Dashboard — staff admin panel (React)
├── hardware/                     # IoT firmware (C++/Arduino/ESP32)
├── database/
│   ├── schema/                   # Reference SQL schema
│   └── seeds/                    # Seed data scripts
└── docs/
    ├── adr/                      # Architecture Decision Records
    ├── diagrams/                 # C4 architecture diagrams
    ├── branch_conventions.md
    ├── commit_conventions.md
    └── game_flow.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 9 (C#) — Clean Architecture |
| Frontend | React 19 (JavaScript) + Vite + Tailwind CSS |
| IoT Firmware | C++ (Arduino / ESP32) |
| Database | PostgreSQL via Supabase |
| Object Storage | MinIO |
| Hosting | Microsoft Azure |
| Version Control & CI/CD | GitLab |

> For the rationale behind each technology choice, see [`docs/adr/`](docs/adr/).

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- [Node.js >= 22](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [dotnet-ef CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) — install once globally:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lab4-goalz

# Copy environment file and fill in values
cp .env.example .env
```

### Running Locally with Docker

```bash
# Start all services (database, backend, both frontends)
docker compose up

# Or start individual services
docker compose up -d postgres     # database only
docker compose up backend         # backend only
```

| Service | URL |
|---|---|
| Backend API + Swagger | http://localhost:8080/swagger |
| Loggin app | http://localhost:3000 |
| Dashboard | http://localhost:3001 |
| MinIO console | http://localhost:9001 |

### Running the Backend Locally (without Docker)

```bash
cd backend/Goalz/Goalz.API

# Set your database connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=goalz;Username=goalz;Password=changeme"

# Apply database migrations
dotnet ef migrations add <MigrationName> --context GoalzDbContext --startup-project .
dotnet ef database update --context GoalzDbContext --startup-project .

# Run the API
dotnet run
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Local PostgreSQL database name |
| `POSTGRES_USER` | Local PostgreSQL username |
| `POSTGRES_PASSWORD` | Local PostgreSQL password |
| `MINIO_ROOT_USER` | MinIO admin username |
| `MINIO_ROOT_PASSWORD` | MinIO admin password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ConnectionStrings__DefaultConnection` | Full PostgreSQL connection string (overrides backend config) |

> For local development, database credentials are managed via `dotnet user-secrets`. See [`database/README.md`](database/README.md) for full setup instructions.

---

## Contributing

We follow the **Conventional Commits** specification for commit messages and a structured branch naming convention.

- Commit conventions: [`docs/commit_conventions.md`](docs/commit_conventions.md)
- Branch conventions: [`docs/branch_conventions.md`](docs/branch_conventions.md)

### Branch Flow

```
main        ← stable, production-ready
  └── dev   ← integration branch, all features merge here
        └── feat/your-feature
        └── fix/your-bug-fix
```

Always branch from `dev`. Open a merge request back into `dev` when your work is ready.

---

## Documentation

| Document | Description |
|---|---|
| [`docs/game_flow.md`](docs/game_flow.md) | Full Loggin game flow — phases, roles, scoring |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records — all major technology decisions |
| [`docs/diagrams/c4_models.md`](docs/diagrams/c4_models.md) | C4 architecture diagrams |
| [`docs/branch_conventions.md`](docs/branch_conventions.md) | Branch naming rules and lifecycle |
| [`docs/commit_conventions.md`](docs/commit_conventions.md) | Commit message format and examples |
| [`database/README.md`](database/README.md) | Database setup, migrations, and secrets management |
| [`backend/Goalz/Goalz.Domain/README.md`](backend/Goalz/Goalz.Domain/README.md) | Domain layer — entities and interfaces |
| [`backend/Goalz/Goalz.Application/README.md`](backend/Goalz/Goalz.Application/README.md) | Application layer — business logic |
| [`backend/Goalz/Goalz.Infrastructure/README.md`](backend/Goalz/Goalz.Infrastructure/README.md) | Infrastructure layer — database and repositories |
| [`backend/Goalz/Goalz.API/README.md`](backend/Goalz/Goalz.API/README.md) | API layer — controllers and startup |
