# Goalz — Claude Code Notes

## Project Overview

Goalz is an interactive sustainability game. Players explore an arboretum, collect IoT sensor data, answer quiz questions, and earn points. The platform has a mobile app (primary), a web app, and a staff admin dashboard. Backend is ASP.NET Core 9 + PostgreSQL + PostGIS.

## Agent Docs

Before starting work, read the files below that are relevant to your task:

| File | Read when… |
|---|---|
| [agent_docs/project_architecture.md](agent_docs/project_architecture.md) | Exploring the codebase, understanding the layer structure, or working on the frontend |
| [agent_docs/adding_a_feature.md](agent_docs/adding_a_feature.md) | Adding any new entity, service, repository, or controller |
| [agent_docs/api_and_auth.md](agent_docs/api_and_auth.md) | Working on API endpoints, authentication, or JWT |
| [agent_docs/domain_model.md](agent_docs/domain_model.md) | Working with entities, DbSets, or EF configuration |
| [agent_docs/docker_and_env.md](agent_docs/docker_and_env.md) | Running the full stack locally or configuring environment variables |

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

`Goalz.Data/Migrations/` is the active migration chain:
1. `InitialCreate` — empty Up() (schema already existed from Infrastructure migrations)
2. `AddUserCreatedAt` — adds `CreatedAt` to Users
3. `AddFriendships` — creates `Friendships` table with both User FKs and unique index on `(RequesterId, AddresseeId)`

`Goalz.Infrastructure/Migrations/` is an older, separate chain — do not add to it.

