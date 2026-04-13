# Database

The project uses **PostgreSQL** managed via **Entity Framework Core (EF Core)** with the Npgsql provider. In production the database is hosted on **Supabase** (managed PostgreSQL). In local development it runs in a Docker container.

The data access layer uses the **Repository Pattern** — all database interaction goes through `IRepository<T>` interfaces, keeping business logic decoupled from EF Core. Switching to a different PostgreSQL host (or even a different database engine) only requires a connection string change or swapping the EF provider package.

---

## Structure

```
db/
  schema/               # Reference SQL — original draft schema
  seeds/                # Seed data scripts (future)

backend/Goalz/Goalz.API/
  Data/
    GoalzDbContext.cs   # EF Core DbContext — registers all tables and relationships
  Entities/             # C# entity classes (source of truth for the schema)
  Interfaces/
    IRepository.cs      # Generic repository interface
  Repositories/
    Repository.cs       # Base EF Core implementation of IRepository<T>
  Migrations/           # Auto-generated EF migration files (committed to git)
```

---

## Entities

| Entity | Table | Description |
|---|---|---|
| `Quiz` | `Quizzes` | A quiz assigned to a party |
| `Question` | `Questions` | A question belonging to a quiz |
| `Answer` | `Answers` | An answer option for a question |
| `Party` | `Parties` | A group of players in a game session |
| `PartyGroup` | `PartyGroups` | A sub-group within a party |
| `PartyMember` | `PartyMembers` | A user assigned to a party group |
| `User` | `Users` | A player |
| `PartyGroupAnswer` | `PartyGroupAnswers` | An answer submitted by a party group |

---

## Local Development Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [dotnet-ef CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) — install once globally:

```bash
dotnet tool install --global dotnet-ef
```

### 1. Start the local database

```bash
docker compose up -d postgres
```

### 2. Configure your connection string

Use `dotnet user-secrets` to store credentials locally (never committed to git):

```bash
cd backend/Goalz/Goalz.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=goalz;Username=goalz;Password=YOUR-PASSWORD;SSL Mode=Disable"
```

Replace `YOUR-PASSWORD` with the value of `POSTGRES_PASSWORD` from your `.env` file.

### 3. Apply migrations

```bash
dotnet ef database update
```

This creates all tables in the local PostgreSQL database.

---

## Supabase (Production) Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → Session pooler** and copy the .NET connection string
3. Set it as a user secret:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<pooler-host>;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=YOUR-PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

> **Why Session pooler?** Direct connection uses IPv6 only. Session pooler supports IPv4, which works on most networks.

4. Apply migrations:

```bash
dotnet ef database update
```

---

## Making Schema Changes

The **entity classes in `Entities/` are the source of truth** — never edit the database directly.

1. Modify the relevant entity class (e.g., add a field to `User.cs`)
2. Generate a new migration:

```bash
cd backend/Goalz/Goalz.API
dotnet ef migrations add <MigrationName>
```

3. Apply it:

```bash
dotnet ef database update
```

4. Commit the generated migration files in `Migrations/`.

To generate a full SQL script of the current schema at any point:

```bash
dotnet ef dbcontext script
```

---

## Secrets Management

| Environment | How secrets are stored |
|---|---|
| Local dev | `dotnet user-secrets` (OS user profile, never in repo) |
| Docker | Environment variables via `.env` file (git-ignored) |
| Production | Environment variables injected by the host |

The `.env` file is git-ignored. See `.env.example` for the required variables.
