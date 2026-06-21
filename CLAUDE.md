# Goalz — Claude Code Notes

## Project Overview

Goalz is an interactive sustainability game. Players explore an arboretum, collect IoT sensor data, answer quiz questions, and earn points. The platform has a mobile app (primary), a web app, and a staff admin dashboard. Backend is ASP.NET Core 9 + PostgreSQL + PostGIS. Work is tracked on GitLab issues — always check the board with `glab issue list` before starting a task.

## Agent Docs

Before starting work, read the files below that are relevant to your task:

| File | Read when… |
|---|---|
| [agent_docs/project_architecture.md](agent_docs/project_architecture.md) | Exploring the codebase, understanding the layer structure, or working on the frontend |
| [agent_docs/adding_a_feature.md](agent_docs/adding_a_feature.md) | Adding any new entity, service, repository, or controller |
| [agent_docs/api_and_auth.md](agent_docs/api_and_auth.md) | Working on API endpoints, authentication, or JWT |
| [agent_docs/domain_model.md](agent_docs/domain_model.md) | Working with entities, DbSets, or EF configuration |
| [agent_docs/docker_and_env.md](agent_docs/docker_and_env.md) | Running the full stack locally or configuring environment variables |
| [agent_docs/api_endpoints.md](agent_docs/api_endpoints.md) | Looking up any existing endpoint — routes, request/response shapes, auth requirements |
| [agent_docs/gitlab_workflow.md](agent_docs/gitlab_workflow.md) | Starting any new task — check the board first; reference issues in commits |
| [agent_docs/arboretum_map.md](agent_docs/arboretum_map.md) | Working on the map page — zone drawing, editing, OSM import, Leaflet setup |
| [agent_docs/realtime_signalr.md](agent_docs/realtime_signalr.md) | Working on party real-time updates — SignalR hub, events, connection lifecycle, adding new events |
| [agent_docs/ml_pipeline.md](agent_docs/ml_pipeline.md) | Working on the AI image analysis pipeline — ML service, training, backend integration, dashboard UX |

## Stopping the API

The API locks DLLs while running, which blocks builds and migrations. Always stop it before running `dotnet build` or `dotnet ef`.

```bash
# Find the PID
tasklist | findstr dotnet

# Kill it (must use cmd, not bash)
cmd /c "taskkill /F /PID <PID>"
```

If the build still fails with MSB3027 file-lock errors after killing, the bin directory may have stale locks. Clear it:
```bash
cmd /c "rmdir /S /Q backend\Goalz\Goalz.API\bin\Debug\net9.0"
```

## Running EF Migrations

Always use `--configuration Release` — the Debug output directory conflicts with the running API process.

```bash
cd backend/Goalz

# Add a migration
dotnet ef migrations add <Name> --project Goalz.Data --startup-project Goalz.API --configuration Release

# Apply to database
dotnet ef database update --project Goalz.Data --startup-project Goalz.API --configuration Release
```

## Starting the API

```bash
cd backend/Goalz
dotnet run --project Goalz.API
```

## Dual DbContext Warning

There are **two** `AppDbContext` implementations:

| Context | Location | Used? |
|---|---|---|
| `Goalz.Data.Storage.AppDbContext` | `Goalz.Data/Storage/` | **Active** — registered in `Program.cs` |
| `Goalz.Infrastructure.Data.AppDbContext` | `Goalz.Infrastructure/Data/` | **Unused at runtime** |

All new entities, DbSet registrations, and migrations must target `Goalz.Data` only.

## Namespace Convention

Despite living in the `Goalz.Application/` project folder, all files there use `Goalz.Core.*` namespaces:
- Interfaces → `Goalz.Core.Interfaces`
- DTOs → `Goalz.Core.DTOs`
- Services → `Goalz.Core.Services`

## Migration History

`Goalz.Data/Migrations/` is the active migration chain (32+ migrations and growing — don't hand-list them here; run `dotnet ef migrations list --project Goalz.Data --startup-project Goalz.API` or `ls backend/Goalz/Goalz.Data/Migrations/*.cs` for the current chain). For the resulting schema, see [`docs/db_schema.sql`](docs/db_schema.sql) (regenerate with the command in `PROJECT_DETAILS.md` §6/§7 — API must be stopped first).

The first migration, `InitialCreate`, has an empty `Up()` — the schema already existed from the legacy `Goalz.Infrastructure/Migrations/` chain, which is older, separate, and dormant — do not add to it.

## Changelog
After every change, you must automatically add an entry 
to CHANGELOG.md. Format:
```
## Table of Contents

1. [Title](#link-to-title)

## [#ISSUE] Title — DATE and TIME (when issue was started)
### [#SUB-ISSUE] Title — DATE and TIME (when issue was started) Changed/Added/Removed
- What was done

### Rationale
- Why was this solution chosen
- Which alternatives were rejected and why

> Issue closed after (floor((current_time - start_time) / 60)) min

---
```
Ask for the issue number if not provided.
