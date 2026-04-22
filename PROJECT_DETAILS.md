# Goalz — Project Details

The comprehensive reference for everything in the Goalz repository: vision, architecture, every entity, every endpoint, every service, every migration, every config key, and every known legacy artifact.

If you're new, start with the [README](README.md) and the [game flow spec](docs/game_flow.md). Come back here when you need depth.

---

## Table of Contents

1. [Vision and Product](#1-vision-and-product)
2. [Gameplay Summary](#2-gameplay-summary)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Repository Layout](#4-repository-layout)
5. [Backend — Solution Overview](#5-backend--solution-overview)
6. [Backend — Domain Model](#6-backend--domain-model)
7. [Backend — Data Layer (AppDbContext, Repositories, Migrations)](#7-backend--data-layer)
8. [Backend — Application Layer (Services & DTOs)](#8-backend--application-layer)
9. [Backend — API Layer (Controllers, Program.cs, Auth)](#9-backend--api-layer)
10. [Complete API Endpoint Reference](#10-complete-api-endpoint-reference)
11. [Frontend — Mobile (Loggin)](#11-frontend--mobile-loggin)
12. [Frontend — Dashboard](#12-frontend--dashboard)
13. [Database, Docker, and Environment](#13-database-docker-and-environment)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Tooling and Scripts](#15-tooling-and-scripts)
16. [Development Workflow](#16-development-workflow)
17. [Architecture Decision Records](#17-architecture-decision-records)
18. [Known Issues, Orphan Code, and Tech Debt](#18-known-issues-orphan-code-and-tech-debt)
19. [Glossary](#19-glossary)

---

## 1. Vision and Product

Goalz is a sustainability platform developed under the **Office of Sustainability** program as a collaboration between Humber College (university-level) and local high schools. The core product is **Loggin**, an outdoor, location-aware group game played at the **Humber Arboretum** in Toronto (bounding box `43.715,-79.625` to `43.740,-79.595`).

The platform has three audiences:

| Audience | Surface | How they interact |
|---|---|---|
| **Players** (students, classes, public) | Loggin mobile app | Join a party, scan sensors, photograph nature elements, answer quiz questions |
| **Staff / Admins** | Web dashboard | Draw and manage arboretum zones, monitor sensors and elements, generate reports, import datasets |
| **IoT sensors** | Embedded firmware | Push environmental readings to the backend (planned — C++ on ESP32) |

**Design goals** (from the ADRs and game flow spec):

- Work well on **poor-signal outdoor conditions** (light payloads, offline tolerant where possible)
- Support **class-sized groups** (10–30 players split into sub-groups)
- Use **AI image verification** for photo challenges to avoid manual grading
- Persist game data so a **global leaderboard** spans weeks / months / all-time

---

## 2. Gameplay Summary

The full spec lives at [docs/game_flow.md](docs/game_flow.md). Short version:

1. **Arrive + authenticate.** Everyone logs in to Loggin.
2. **Create / join a party.** One user creates; others join with a code or invite link. The creator becomes **Party Owner**.
3. **Auto-group and assign roles.** The system splits the party into groups and assigns each player a role:
   - **Scout** — finds physical sensors and collects ephemeral hint fragments (each hint displays briefly then disappears — they must be memorized).
   - **Trailblazer** — photographs predefined nature elements at specific coordinates. An AI verifier checks each photo.
4. **Section loop.** All groups follow the same route, one section at a time.
   - Scouts find all sensors in the section.
   - Trailblazers photograph all assigned elements.
   - When Trailblazers finish, a **box** appears on the map (shown locked if Scouts aren't done yet).
5. **Quiz at the box.** When the group arrives and both tasks are complete, a multi-choice quiz appears, drawn from the hint fragments. Points depend on correctness, speed, and **streaks**.
6. **Box opens, next section.** Repeat until the session ends (all sections done, time up, or Owner force-stops).
7. **End screen.** Leaderboard, winning group announced, **nuts** (gamified points) distributed proportionally to all groups.

Player-level features that persist across sessions: **profile + avatar**, **friends**, **global leaderboard** (weekly / monthly / all-time), and **badges**.

**Mascot:** Loggy the squirrel. The narrative framing ("Loggy lost his nuts; help him get them back") motivates the scavenger-hunt mechanics.

### Actors in the game

| Actor | Scope |
|---|---|
| Party Owner | Creates a party, manages groups, can force-stop the session |
| Party Participant | Any user who joins a party |
| Scout | In-game role, scans sensors for hints |
| Trailblazer | In-game role, photographs preset nature elements |

All users are equal at the **account** level — Owner is just the creator of the current party.

---

## 3. High-Level Architecture

C4 Level 1 and Level 2 diagrams (in Mermaid) are at [docs/diagrams/c4_models.md](docs/diagrams/c4_models.md). In prose:

```
                      ┌──────────────┐
                      │  Loggin App  │  React Native (Expo)
                      │   (mobile)   │
                      └──────┬───────┘
                             │ HTTPS JSON + Bearer JWT
                             ▼
┌──────────────┐      ┌───────────────────────────────┐       ┌────────────┐
│  Dashboard   │─────▶│   Goalz.API (ASP.NET Core 9)  │──────▶│  MinIO     │
│  (Vite SPA)  │      │  /api/game/*   /api/dashboard │       │ (images)   │
└──────────────┘      └──────────────┬────────────────┘       └────────────┘
                                     │ EF Core 9 + Npgsql
                                     ▼
                           ┌─────────────────────┐
                           │  PostgreSQL + PostGIS│  (local Docker / Supabase)
                           └─────────────────────┘
                                     ▲
                                     │ (planned) MQTT/HTTP
                            ┌────────┴────────┐
                            │  ESP32 sensors  │  (C++, Arduino)
                            └─────────────────┘
```

Key points:

- **Two route trees** in the API: `api/game/*` (JWT-authenticated, used by mobile) and `api/dashboard/*` (used by the staff dashboard, not currently enforcing auth).
- **PostGIS** handles zone polygons, sensor coordinates, and element coordinates. `NetTopologySuite` is the .NET binding; `GeoJsonConverterFactory` serializes geometries as GeoJSON on the wire.
- **Session storage** on mobile uses AsyncStorage under keys `loggin_user` and `loggin_token` — the typo `loggin` is deliberate and must not be changed (breaks existing installs).
- **MinIO** is provisioned but **not actively wired into the codebase yet** — it exists as infrastructure for the photo-verification flow, which is pending.
- **AI image verification** is part of the design but not implemented in this repo; the backend currently exposes no AI endpoint.

---

## 4. Repository Layout

```
lab4-goalz/
├── backend/Goalz/                      # ASP.NET Core 9 solution
│   ├── Goalz.API.sln
│   ├── Goalz.API/                        # Controllers, Program.cs, middleware
│   ├── Goalz.Application/                # Services / DTOs / interfaces (ASM: Goalz.Core)
│   ├── Goalz.Domain/                     # Entities, enums, generic IRepository<T>
│   ├── Goalz.Data/                       # Active AppDbContext, repos, migrations
│   ├── Goalz.Infrastructure/             # Legacy DbContext + migrations (dormant)
│   ├── Goalz.Core/                       # Orphan folder — do not add files
│   └── postman/                          # Postman collection for auth tests
│
├── frontend/
│   ├── mobile/                         # Loggin — Expo React Native (primary)
│   │   ├── App.js, index.js
│   │   ├── app.json, babel/metro/tailwind configs
│   │   ├── components/                   # 8 reusable components
│   │   ├── pages/                        # 11 screens
│   │   ├── services/api.js, session.js   # HTTP client + AsyncStorage
│   │   └── .env.example
│   └── dashboard/                      # Staff admin — React + Vite
│       ├── Dockerfile, nginx.conf, vite.config.js
│       ├── index.html                    # Loads Leaflet + Turf + leaflet-image via CDN
│       ├── src/
│       │   ├── main.jsx, App.jsx
│       │   ├── pages/Login.jsx, Overview.jsx
│       │   ├── components/
│       │   │   ├── navbar/
│       │   │   └── dashboard/
│       │   │       ├── overview/             # Map, charts, element details
│       │   │       ├── map/ArboretumMap.jsx  # Zone drawing/editing (the big one)
│       │   │       ├── import/
│       │   │       └── reports/
│       │   ├── services/                      # auth, overview, zone, OSM import
│       │   └── hooks/useAPI.jsx
│       └── eslint.config.js
│
├── database/
│   ├── README.md                       # Migration + secrets guide (legacy — references `GoalzDbContext` which no longer exists under that name)
│   └── schema/
│       ├── current_schema.sql            # Reference dump of the active schema
│       └── loggin_schema_draft.sql       # Original design
│
├── docs/
│   ├── adr/                            # 8 ADRs (0001 … 0008)
│   ├── diagrams/c4_models.md           # Mermaid C4 diagrams
│   ├── game_flow.md                    # Full gameplay spec
│   ├── branch_conventions.md
│   └── commit_conventions.md
│
├── agent_docs/                         # Task-focused guides for AI assistants
│   ├── project_architecture.md
│   ├── adding_a_feature.md
│   ├── api_and_auth.md
│   ├── api_endpoints.md
│   ├── domain_model.md
│   ├── docker_and_env.md
│   ├── gitlab_workflow.md
│   └── arboretum_map.md
│
├── tools/seed-zones/                   # Node script: OSM → /api/dashboard/zones
│   ├── index.js, package.json
│
├── postman/collections/Loggin - Game Auth/   # 5 requests: login/signup + error cases
├── .postman/resources.yaml                   # Postman cloud workspace mapping
│
├── docker-compose.yml                  # postgres, minio, backend, app*, dashboard
├── docker-compose.override.yml         # Dev overrides: volume mounts + watch/dev servers
├── .env / .env.example                 # Secrets (.env is gitignored)
├── .gitlab-ci.yml                      # install → build (frontend + backend)
├── .gitignore
├── package.json                        # Root-level tailwind + expo hints
├── CLAUDE.md                           # Claude Code operational notes
├── README.md                           # Start here
└── PROJECT_DETAILS.md                  # ⭐ This file
```

* `frontend/app/` (a web-React game app) was removed. The `docker-compose.yml` still has an `app:` service pointing at it — those lines are dead and can be deleted.
* There is no `hardware/` folder in this repo. IoT firmware is planned (see [ADR 003](docs/adr/0003_use_cpp_arduino_esp32.md)) but not yet committed.

---

## 5. Backend — Solution Overview

Solution: `backend/Goalz/Goalz.API.sln`. Target framework: **net9.0**. Five C# projects live under `backend/Goalz/`, but only four are active.

| Project folder | Assembly name | Role at runtime |
|---|---|---|
| `Goalz.API/` | `Goalz.API` | Controllers, middleware, DI wiring, `Program.cs`, `JwtService` |
| `Goalz.Application/` | **`Goalz.Core`** (csproj name, note the mismatch) | Services, interfaces, DTOs — namespace `Goalz.Core.*` |
| `Goalz.Domain/` | `Goalz.Domain` | Entities, enums, `IRepository<T>` — no logic |
| `Goalz.Data/` | `Goalz.Data` | Active `AppDbContext`, repositories, EF migrations |
| `Goalz.Infrastructure/` | `Goalz.Infrastructure` | **Legacy — not referenced by Goalz.API, do not modify** |

**Orphan:** `Goalz.Core/` (folder sibling to `Goalz.Application/`) contains merge-conflict artifacts — `Goalz.Core/Services/AuthService.cs` has unresolved `<<<<<<<` markers. It is not wired into the API. Treat as dead code.

### Dependency direction

```
Goalz.API
 ├─ Goalz.Application  (→ Goalz.Domain)
 └─ Goalz.Data         (→ Goalz.Application → Goalz.Domain)

Goalz.Infrastructure   (→ Goalz.Domain)     ← dormant
```

### NuGet packages (per project)

**Goalz.API** (`net9.0`):

- `Microsoft.AspNetCore.Authentication.JwtBearer` 9.0.4
- `Microsoft.EntityFrameworkCore` 9.0.14 + `Microsoft.EntityFrameworkCore.Design` 9.0.4
- `Microsoft.IdentityModel.Tokens` 8.17.0
- `NetTopologySuite.IO.GeoJSON4STJ` 4.0.0
- `Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite` 9.0.4
- `Swashbuckle.AspNetCore` 6.6.2

**Goalz.Application** (assembly `Goalz.Core`):

- `BCrypt.Net-Next` 4.1.0
- `Microsoft.AspNetCore.Http.Features` 5.0.17

**Goalz.Domain**: `NetTopologySuite` 2.6.0

**Goalz.Data**: `Microsoft.EntityFrameworkCore` 9.0.14, `EF.Design` 9.0.14, `NetTopologySuite` 2.6.0, `Npgsql.EntityFrameworkCore.PostgreSQL` 9.0.4

**Goalz.Infrastructure** (dormant): EF Core 9.0.4 + Npgsql 9.0.4

### Namespace convention

Despite living in `Goalz.Application/`, all files there use the `Goalz.Core.*` namespace:

- Interfaces → `Goalz.Core.Interfaces`
- DTOs → `Goalz.Core.DTOs`
- Services → `Goalz.Core.Services`

This mirrors the csproj name (`Goalz.Core.csproj`). It is a historical artifact but consistently applied — keep the convention when adding files.

---

## 6. Backend — Domain Model

Entities live in `backend/Goalz/Goalz.Domain/Entities/`. Enums live in `Goalz.Domain/`. All PK fields are `long Id`. Navigation collections default to `[]`.

### Entities registered as DbSets (active)

Exactly five entities are registered in `Goalz.Data/Storage/AppDbContext.cs` and have migrations:

#### `User`
```csharp
long Id
string Username                        // unique in practice, not enforced at DB level
string Name
string Email
string PasswordHash                    // BCrypt hash via BCrypt.Net-Next
Role Role = Role.Player                // stored as string (HasConversion)
DateTime CreatedAt = DateTime.UtcNow
ICollection<PartyMember> PartyMembers
ICollection<Friendship> SentFriendships
ICollection<Friendship> ReceivedFriendships
```

#### `Friendship`
```csharp
long Id
long RequesterId
User Requester                         // FK, Cascade delete
long AddresseeId
User Addressee                         // FK, Cascade delete
FriendshipStatus Status = Pending      // stored as string
DateTime CreatedAt = DateTime.UtcNow
DateTime? UpdatedAt
```
Unique index on `(RequesterId, AddresseeId)` — a directional pair can exist only once.

#### `Sensor`
```csharp
long Id
long Temp
long Humidity
Point Geo                              // NetTopologySuite / PostGIS geometry
// long InformationId                  // commented out — not active
// Information Information             // commented out
```

#### `Element`
```csharp
long Id
long ElementName                       // note: long, not string (likely an ID into a lookup table)
long ElementType
Point Geom                             // NetTopologySuite / PostGIS geometry
string ImageUrl
bool IsGreen
```

#### `Zone`
```csharp
long Id
string Name
string ZoneType                        // "boundary" | "area" | "path" (soft enum)
string Color = "#33A661"
Geometry Boundary                      // PostGIS — Polygon, MultiPolygon, or LineString
```

### Entities defined but NOT in the active DbContext

These exist in `Goalz.Domain/Entities/` but there's **no `DbSet` and no migration** in `Goalz.Data`. To use them, add a `DbSet<T>` to `AppDbContext` and create a migration first.

- `Quiz` — `Id`, `Questions`, `Parties`
- `Question` — `Id`, `QuizId`, `QuestionTxt`, `Quiz`, `Answers`
- `Answer` — `Id`, `QuestionId`, `AnswerTxt`, `IsCorrect`, navigation collections
- `Party` — `Id`, `QuizId`, `Name`, `Code` (long), `Quiz`, `PartyGroups`
- `PartyGroup` — `Id`, `PartyId`, `Name`, `Party`, `PartyMembers`, `PartyGroupAnswers`
- `PartyMember` — `Id`, `PartyGroupId`, `UserId`, navigations
- `PartyGroupAnswer` — `Id`, `PartyGroupId`, `AnswerId`, `ReceivedPoints`, navigations
- `Information` — `Id`, `InfoTxt` (long), `NewColumn` (long), `Sensors` — fully orphaned, not even referenced by other entities

The legacy `Goalz.Infrastructure/Data/AppDbContext.cs` **does** register Quiz/Question/Answer/Party/etc., but that context is dormant.

### Enums

Both are stored as **strings** in the DB (explicitly configured in `OnModelCreating` — when adding new enum properties, remember `.HasConversion<string>()`):

```csharp
enum Role             { Player, Staff, Admin }
enum FriendshipStatus { Pending, Accepted }
```

### Password hashing

`BCrypt.Net-Next`. Hashing: `BCrypt.HashPassword(password)`. Verification: `BCrypt.Verify(password, hash)`.

### PostGIS specifics

- `Sensor.Geo`, `Element.Geom`: `NetTopologySuite.Geometries.Point`.
- `Zone.Boundary`: `NetTopologySuite.Geometries.Geometry` (polymorphic — Polygon, MultiPolygon, LineString).
- EF is configured with `UseNetTopologySuite()` in `Program.cs`.
- `modelBuilder.HasPostgresExtension("postgis")` is declared in `AppDbContext.OnModelCreating`.
- Wire-format is GeoJSON: `GeoJsonConverterFactory` is registered in the JSON serializer options.

---

## 7. Backend — Data Layer

### Active `AppDbContext`

File: `Goalz.Data/Storage/AppDbContext.cs`. **This is the one used at runtime.** The one in `Goalz.Infrastructure/Data/` is legacy.

DbSets:

```csharp
DbSet<User>       Users
DbSet<Friendship> Friendships
DbSet<Sensor>     Sensors
DbSet<Element>    Elements
DbSet<Zone>       Zones
```

`OnModelCreating` responsibilities:

- Enable PostGIS: `modelBuilder.HasPostgresExtension("postgis");`
- `User.Role` → string conversion.
- `Friendship.Status` → string conversion.
- `Friendship → User` relationships: two nav properties (`Requester`, `Addressee`) with distinct FKs (`RequesterId`, `AddresseeId`) and **Cascade** delete on both.
- Unique index on `Friendships.(RequesterId, AddresseeId)`.

### Repositories

All repositories live in `Goalz.Data/Repositories/` and implement interfaces in `Goalz.Application/Interfaces/` (namespace `Goalz.Core.Interfaces`). All are registered `Scoped` in `Program.cs`.

| Interface | Implementation | Key methods |
|---|---|---|
| `IAuthRepository` | `AuthRepository` | `GetUserByEmail(email)` |
| `IUserRepository` | `UserRepository` | `GetByIdAsync`, `GetByEmailAsync`, `GetByUsernameAsync`, `SearchByUsernameAsync(query, excludeUsername, limit=10)`, `ExistsByEmailAsync`, `ExistsByUsernameAsync`, `AddAsync`, `SaveChangesAsync` |
| `IFriendshipRepository` | `FriendshipRepository` | `AddAsync`, `GetByUsersAsync(req, addr)` (directional), `GetBetweenUsersAsync(a, b)` (bidirectional), `GetAcceptedAsync(userId)`, `GetPendingReceivedAsync(userId)`, `ExistsAsync(req, addr)`, `DeleteAsync` (sync), `SaveChangesAsync` |
| `IOverviewRepository` | `OverviewRepository` (file: `OverviewRepositorycs.cs` — typo) | `GetAllSensorsAsync`, `GetAllElementsAsync` |
| `IZoneRepository` | `ZoneRepository` | `GetAllAsync`, `GetByIdAsync`, `AddAsync`, `DeleteAsync`, `SaveChangesAsync` |

> Searches (`SearchByUsernameAsync`) are case-insensitive LIKE queries and always exclude the caller.

### Migrations — active chain (`Goalz.Data/Migrations/`)

Applied in order:

1. **`20260415105321_InitialCreate`** — Effectively a placeholder. The tables already existed from the legacy Infrastructure migrations; this one carries no schema changes on `Up()`.
2. **`20260415105504_AddUserCreatedAt`** — Adds `Users.CreatedAt` (`timestamptz NOT NULL`).
3. **`20260415111426_AddFriendships`** — Creates `Friendships` with PK, both User FKs (Cascade), `Status text`, `CreatedAt timestamptz`, `UpdatedAt timestamptz null`, indexes `IX_Friendships_AddresseeId` and `IX_Friendships_RequesterId_AddresseeId` (unique).
4. **`20260420112432_AddZones`** — Creates `Zones` with `Id`, `Name`, `ZoneType`, `Color`, `Boundary` (PostGIS `geometry`, NOT NULL).

### Migrations — legacy chain (`Goalz.Infrastructure/Migrations/`)

Not executed at runtime — the active API never sees this chain. It evolved the `Users` table historically:

1. `20260410201823_InitialCreate` — Creates `Quizzes`, `Users`, `Parties`, `Questions`, `PartyGroups`, `Answers`, `PartyMembers`, `PartyGroupAnswers`. Users initially had a plain `Password` column.
2. `20260410210420_AddUserRole` — Adds `Role int` default 0.
3. `20260410210740_AddUsernameEmailAndRoleAsString` — Converts `Role` to string, adds `Email` and `Username`.
4. `20260410213652_RenamePasswordToPasswordHash` — Renames `Password` → `PasswordHash`.

**Do not add migrations to the Infrastructure project.** Target `Goalz.Data` instead.

### Running EF commands

Always use `--configuration Release` so the build output doesn't collide with a running API process. Always stop the running API before building or migrating (the DLLs lock). See [CLAUDE.md](CLAUDE.md) for the exact recipe.

```bash
cd backend/Goalz

dotnet ef migrations add <Name> \
  --project Goalz.Data --startup-project Goalz.API --configuration Release

dotnet ef database update \
  --project Goalz.Data --startup-project Goalz.API --configuration Release
```

---

## 8. Backend — Application Layer

All services, DTOs, and interfaces live in `Goalz.Application/` but use `Goalz.Core.*` namespaces. All services register `Scoped` except `IJwtService` which is `Singleton`.

### Services

| Interface | Implementation | Responsibility |
|---|---|---|
| `IAuthService` | `AuthService` | Dashboard login: `CheckAuth(email, password)` → `LoginRequest?` |
| `IUserService` | `UserService` | Game login + signup: `LoginAsync`, `SignUpAsync` (returns `(GameSignUpResponse?, string? Error)`) |
| `IJwtService` | `JwtService` (lives in `Goalz.API/Services/`) | `Generate(username, role)` → JWT |
| `IFriendshipService` | `FriendshipService` | Connections, requests, send/accept/decline/remove. Error tuple pattern: `(bool Success, string? Error)` |
| `IOverviewService` | `OverviewService` | `GetDashboardData()` → `ElementsDTO { sensors, element }` |
| `IZoneService` | `ZoneService` | CRUD for zones. Error codes via tuple return |
| `IDatasetService` | `DatasetService` | `ReadCSV(IFormFile)` — semicolon-delimited, first row as headers |

### Error-handling pattern

Services that can fail for multiple reasons return `(bool Success, string? Error)`. Controllers `switch` on the error string to pick an HTTP status code. Canonical example is `FriendshipController.cs`:

```csharp
var (ok, error) = await _svc.SendRequestAsync(me, targetUsername);
if (!ok) return error switch
{
    "cannot_self_add"  => BadRequest("..."),
    "user_not_found"   => NotFound("..."),
    "already_friends"  => Conflict("..."),
    "request_exists"   => Conflict("..."),
    _                  => BadRequest("Something went wrong.")
};
return NoContent();
```

Known error codes:

| Service method | Error codes |
|---|---|
| `UserService.SignUpAsync` | `email_taken`, `username_taken` |
| `FriendshipService.SendRequestAsync` | `cannot_self_add`, `user_not_found`, `already_friends`, `request_exists` |
| `FriendshipService.AcceptRequestAsync` | `request_not_found`, `not_pending` |
| `FriendshipService.DeclineRequestAsync` | `request_not_found` |
| `FriendshipService.RemoveConnectionAsync` | `user_not_found`, `not_friends` |
| `ZoneService.CreateAsync` | `invalid_name`, `invalid_geometry` |
| `ZoneService.UpdateAsync` | `not_found`, `invalid_name` |

### DTOs

All in `Goalz.Application/DTOs/`, namespace `Goalz.Core.DTOs`.

**Auth:**
- `LoginRequest { Email, Name, Password }` — used by Dashboard auth (note: `Name` is unused for login logic).
- `GameLoginRequest { Email, Password }`
- `GameLoginResponse { Token, Username, Name, Email, CreatedAt }`
- `GameSignUpRequest { Username, Name, Email, Password }`
- `GameSignUpResponse { Token, Username, Name, Email }`

**Friendships:**
- `FriendDto { FriendshipId, Username }`
- `FriendRequestDto { RequesterUsername, AddresseeUsername }`
- `UserSearchDto { Username }`
- `PartnerUsernameDto { Username }`

**Dataset import:**
- `DatasetPreview { ColumnNames: List<string>, values: List<List<string>> }`

**Zones:**
- `ZoneDto { Id, Name, ZoneType, Color, Boundary }`
- `CreateZoneDto { Name, ZoneType, Color = "#33A661", Boundary }`
- `UpdateZoneDto { Name, ZoneType, Color = "#33A661", Boundary? }` — `Boundary` is nullable to allow patching metadata without re-sending geometry.

**Overview:**
- `ElementsDTO { sensors: List<Sensor>, element: List<Element> }` (lowercase property names — this is the wire shape)

### `JwtService` details

Lives at `backend/Goalz/Goalz.API/Services/JwtService.cs`. Registered as **Singleton** (stateless, safe to share).

- **Signing**: `HmacSha256` with a `SymmetricSecurityKey` derived from UTF-8 bytes of `Configuration["Jwt:Secret"]`.
- **Minimum secret length**: 32 chars. Startup throws `InvalidOperationException` if missing or too short.
- **Claims**: `sub` = username, custom `role` claim. Implicit `iat`/`exp`.
- **Expiry**: 30 days.
- **Token validation** (in `Program.cs`): `ValidateIssuer = false`, `ValidateAudience = false`, `ValidateLifetime = true`, `ClockSkew = TimeSpan.Zero`, `NameClaimType = JwtRegisteredClaimNames.Sub`, `RoleClaimType = "role"`. `JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear()` is called so the raw `sub` claim is preserved.

### How to read the current user in a controller

Because `NameClaimType = Sub`, this works:

```csharp
string username = User.Identity!.Name!;   // returns the "sub" claim = username
```

**Do not** use `User.FindFirst(ClaimTypes.NameIdentifier)` — the default inbound map is cleared, it will be null. See `FriendshipController.cs`'s `CurrentUsername` property for the canonical pattern.

---

## 9. Backend — API Layer

All controllers live under `backend/Goalz/Goalz.API/Controllers/`, split into two subfolders:

- `Controllers/Dashboard/` — staff/admin endpoints
- `Controllers/Game/` — player endpoints (JWT required)

### Route conventions

- **Game** controllers hardcode their full route: `[Route("api/game/friends")]`.
- **Dashboard** controllers use the `[controller]` token: `[Route("api/dashboard/[controller]")]` (e.g. `OverviewController` → `/api/dashboard/overview`).

### `Program.cs` — everything wired at startup

Configuration / services:

1. `AddDbContext<AppDbContext>` with `UseNpgsql(conn, o => o.UseNetTopologySuite())`.
2. **CORS policy `"AllowFrontend"`**: allows origins `http://localhost:5173`, `:5174`, `:5175`, `:8081`; any header; any method.
3. **JWT Bearer authentication** with the validation options listed above.
4. `DefaultInboundClaimTypeMap.Clear()` before `AddAuthentication`.
5. Startup validation: throw if `Jwt:Secret` missing or `< 32` chars.
6. DI registrations (all `Scoped` unless noted):
   - `IJwtService → JwtService` (**Singleton**)
   - `IAuthService → AuthService`, `IAuthRepository → AuthRepository`
   - `IUserService → UserService`, `IUserRepository → UserRepository`
   - `IFriendshipService → FriendshipService`, `IFriendshipRepository → FriendshipRepository`
   - `IOverviewService → OverviewService`, `IOverviewRepository → OverviewRepository`
   - `IZoneService → ZoneService`, `IZoneRepository → ZoneRepository`
   - `IDatasetService → DatasetService`
7. **Rate limiter policy `"auth"`**: fixed window, 1 min, 10 permits, 0 queue, rejection status 429. Applied with `[EnableRateLimiting("auth")]` on the game auth controller.
8. **JSON options** on controllers: `PropertyNamingPolicy = camelCase`, `JsonConverters += GeoJsonConverterFactory`, `NumberHandling = AllowNamedFloatingPointLiterals`.
9. Swashbuckle / EndpointsApiExplorer / SwaggerGen.

Middleware pipeline:

```
CORS → Swagger (dev only) → ExceptionHandler (prod only) → HTTPS redirect
→ CORS (again, on the pipeline) → RateLimiter → Authentication → Authorization → MapControllers
```

### Authentication summary

| Area | Scheme | Enforcement |
|---|---|---|
| `/api/game/auth/*` | No auth (public) | Rate-limited 10/min per IP |
| `/api/game/friends/*` | JWT Bearer (`[Authorize]` on controller) | Except `connections/{username}` which is `[AllowAnonymous]` |
| `/api/dashboard/*` | **None enforced currently** | `ZoneController` is explicitly `[AllowAnonymous]`; other controllers have no `[Authorize]` attribute. Dashboard login returns the DTO echoed back, not a JWT. |

---

## 10. Complete API Endpoint Reference

Full details (request/response shapes, error codes) are in [agent_docs/api_endpoints.md](agent_docs/api_endpoints.md). This is the consolidated list.

### Game (`/api/game/*`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/game/auth/login` | — · rate-limited | Email/password → `{ token, username, name, email, createdAt }` |
| POST | `/api/game/auth/signup` | — · rate-limited | Register → `{ token, username, name, email }` |
| GET | `/api/game/friends/search?q=...` | JWT | Search users (min 2 chars, excludes caller) |
| GET | `/api/game/friends/connections/{username}` | — | Public: accepted friendships for any user |
| GET | `/api/game/friends/requests` | JWT | Incoming pending requests for the caller |
| POST | `/api/game/friends/request` | JWT | Body `{ username }` — send a request |
| PUT | `/api/game/friends/accept` | JWT | Body `{ username }` (requester) — accept |
| DELETE | `/api/game/friends/decline` | JWT | Body `{ username }` (requester) — decline |
| DELETE | `/api/game/friends/connection` | JWT | Body `{ username }` — remove existing friend |

### Dashboard (`/api/dashboard/*`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/dashboard/auth/login` | — | Echoes `LoginRequest` back (no JWT issued) |
| GET | `/api/dashboard/overview` | — | `{ sensors: [], element: [] }` — all sensors and elements with PostGIS points |
| POST | `/api/dashboard/importdataset` | — | Multipart form upload; returns `[{ columnNames, values }]` |
| GET | `/api/dashboard/zones` | — | List of zones |
| POST | `/api/dashboard/zones` | — | Create zone (body includes GeoJSON geometry) |
| PUT | `/api/dashboard/zones/{id}` | — | Update zone (boundary optional) |
| DELETE | `/api/dashboard/zones/{id}` | — | Delete zone |

### Known quirks

- Dashboard `AuthController.Login` returns the `LoginRequest` DTO directly on 200, not a token. The dashboard stores a JWT under localStorage key `jwtToken` but the backend isn't actually issuing one here — existing dashboard code assumes one. This is **incomplete** auth plumbing.
- `AllowAnonymous` on `ZoneController` is deliberate for now — lock it down before production.
- `POST /api/dashboard/importdataset` expects CSV files with **semicolon** (`;`) delimiter.

---

## 11. Frontend — Mobile (Loggin)

**Path:** `frontend/mobile/`. This is the **primary player UI**.

### Stack

- **Expo** 54 · **React Native** 0.81 · **React** 19
- **React Navigation 7** (native-stack)
- **NativeWind 4** + **Tailwind CSS 3** for styling (RN-compatible Tailwind)
- **AsyncStorage** for session
- **react-native-ble-plx** — Bluetooth LE scanning (intended for checkpoint/sensor detection)
- **react-native-svg** + `react-native-svg-transformer` — imports `.svg` as React components
- **react-native-web** — web-target support via `npm run web`

### Build tooling

- `metro.config.js` — Metro bundler config; sets up the SVG transformer and blocks NativeWind's bundled React/React Native to avoid duplicate-hook issues.
- `babel.config.js` — `babel-preset-expo` with `jsxImportSource: "nativewind"`.
- `tailwind.config.js` — scans `./app/**`, `./components/**`, `./pages/**`.
- `app.json` — Expo app config: name `Loggin`, slug `loggin`, bundle `com.goalz.loggin`, portrait orientation, Bluetooth permissions for both iOS and Android, New Architecture enabled.

### Folder layout

```
mobile/
├── App.js              # NavigationContainer + Native Stack (11 screens)
├── index.js            # registerRootComponent(App)
├── global.css          # @tailwind directives
├── components/
│   ├── BottomNavBar.jsx     # Goals / Home / Profile tabs
│   ├── FriendsTab.jsx       # Connections + requests list, API-backed
│   ├── GameButtons.jsx      # Styled buttons (variants: task/accept/decline/party, sizes: default/half/square)
│   ├── Logo.jsx             # "Loggin" branding
│   ├── PageHeader.jsx       # Title + optional back button
│   ├── PlayerSearch.jsx     # Debounced (400 ms) user search with dropdown + send-request
│   ├── StatisticsCard.jsx   # Checkpoints / pictures-taken stat blocks
│   └── TextInput.jsx        # Styled TextInput wrapper
├── pages/
│   ├── Login.jsx · SignUp.jsx
│   ├── HomePage.jsx          # Hub — "Start Route" CTA
│   ├── ProfilePage.jsx       # Own or other user's profile (param: username, incomingRequest)
│   ├── RouteModePage.jsx     # Single vs Party mode choice
│   ├── PartyModePage.jsx     # Create/join party entry
│   ├── CreatePartyPage.jsx · PartyLobbyPage.jsx · PartyOwnerPage.jsx
│   ├── YourRolePage.jsx      # Scout/Trailblazer reveal card
│   └── SettingsPage.jsx      # Logout
├── services/
│   ├── api.js          # fetch wrapper; reads EXPO_PUBLIC_API_BASE_URL; attaches Bearer from AsyncStorage
│   └── session.js      # AsyncStorage helpers: storeUser, getUser, getToken, clearUser
└── assets/             # SVG icons, fonts, UserAvatar_*.png
```

### API client (`services/api.js`)

- **Base URL**: `process.env.EXPO_PUBLIC_API_BASE_URL`. The `.env.example` shows `http://10.205.201.89:5049` — this must be a LAN IP reachable from the phone.
- **Bearer token**: read from AsyncStorage key `loggin_token` on every request.
- **Exposed calls**: login, signup, friend search, connections, requests, send/accept/decline/remove friend.

### Session (`services/session.js`)

- Keys: `loggin_user` (JSON profile), `loggin_token` (JWT string). Typo `loggin` is intentional — do not rename.
- Exposes: `storeUser`, `getUser`, `getToken`, `clearUser`.

### Environment

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | API base. Expo only exposes vars prefixed `EXPO_PUBLIC_` to client code. |

`.env` is gitignored. Copy from `.env.example` before running.

### State management

Local `useState` only. No Redux, no Context. Session persisted through AsyncStorage.

### No Dockerfile

Mobile is not containerized — it's distributed via Expo builds / dev QR codes.

---

## 12. Frontend — Dashboard

**Path:** `frontend/dashboard/`. Staff-facing SPA for monitoring and zone management.

### Stack

- **React** 19 · **Vite** 8 · **React Router** 7
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin)
- **Leaflet 1.9** + **Leaflet-Draw**, **leaflet-path-drag**, **leaflet-image**, **Turf.js** — *all loaded via CDN in `index.html`*, not npm. The Leaflet npm package is `leaflet` in `dependencies`, but actual usage always goes through `window.L` (see below).
- **Font Awesome** + **Inter** — via CDN

### Critical rule: single Leaflet instance

`index.html` loads Leaflet via CDN, setting `window.L`. **Every file that uses Leaflet must do:**

```js
const L = window.L
```

Do **not** `import * as L from 'leaflet'` or import Leaflet CSS — that creates a second instance, and `L.Control.Draw` / `L.Draw.Event` will be undefined. See [agent_docs/arboretum_map.md](agent_docs/arboretum_map.md) for the full rationale.

### Folder layout

```
dashboard/
├── index.html                     # CDN loads: Leaflet, Leaflet-Draw, leaflet-path-drag, Turf, leaflet-image, FA, Inter
├── vite.config.js · tailwind.config.js · eslint.config.js
├── Dockerfile · nginx.conf        # Multi-stage: node 22-alpine → nginx:alpine
├── src/
│   ├── main.jsx · App.jsx
│   ├── App.css · index.css        # Custom Leaflet zoom control styling
│   ├── pages/
│   │   ├── Login.jsx              # Email/password, calls authService.authenticate
│   │   └── Overview.jsx           # Sidebar + content switcher: Overview/Map/Reports/Import/Settings
│   ├── components/
│   │   ├── navbar/                # Navbar.jsx, Navitem.jsx
│   │   └── dashboard/
│   │       ├── DashboardNavBar.jsx
│   │       ├── overview/          # DashboardOverview, Map, MapLegend, ElementDetails (+ NatureElement/Sensor), ManageElement, Chart, charts/*
│   │       ├── map/               # ArboretumMap.jsx (~1000 lines), ZoneCreationModal.jsx
│   │       ├── import/import.jsx  # Drag-drop CSV upload + preview
│   │       └── reports/           # reports.jsx, CheckBox.jsx
│   ├── services/
│   │   ├── authService.jsx        # authenticate(email, password) — POST /login, stores JWT
│   │   ├── overviewService.jsx    # getAllElements, updateElement
│   │   ├── zoneService.jsx        # CRUD over /api/dashboard/zones
│   │   ├── osmImportService.js    # Overpass API → zone DTOs
│   │   └── importDatasetService.jsx
│   ├── hooks/useAPI.jsx           # Generic APICall(type, endpoint, value, token) — Bearer from localStorage.jwtToken
│   └── assets/
└── public/
```

### Routes (`App.jsx`)

| Path | Component |
|---|---|
| `/` | `Login` |
| `/overview` | `Overview` (hub) |

`Overview.jsx` internally renders one of: DashboardOverview, ArboretumMap, Reports, Import, Settings — based on sidebar selection.

### Services & API base URL

All services hit `https://localhost:7286/api/dashboard` — **hardcoded**. There is no environment variable. This is the old HTTPS dev port; to point the dashboard at the Dockerized backend (`http://localhost:8080`), change the base URL in `src/services/*` directly.

Bearer token for authenticated calls is stored in `localStorage["jwtToken"]`.

### Arboretum map — the big component

`src/components/dashboard/map/ArboretumMap.jsx` is the centerpiece (see [agent_docs/arboretum_map.md](agent_docs/arboretum_map.md)). Features:

- Draw polygon or polyline zones over Humber Arboretum.
- Edit zone metadata (name, type, color) and/or re-edit vertices with `L.EditToolbar.Edit`.
- Select → highlight yellow, delete with confirmation.
- **Zone types**: `boundary` (outline only, 3 px, `#1A5C2E`), `area` (15% fill, 2 px, `#2D7D46`), `path` (outline, 2 px, `#8B6914`). Styles are computed in `buildStyle(zone, selected)`.
- **Performance**: `preferCanvas: true` renders polygons on a single canvas; tile layer uses `updateWhenZooming:false` / `updateWhenIdle:true`.
- **Tooltips suppressed**: Leaflet-Draw's cursor tooltips are blanked in favor of a side panel.
- **Stale-closure workaround**: handlers registered once in `useEffect` use a ref pattern (`handleZoneClickRef.current = …`) to always read current React state.
- **OSM import**: `osmImportService.fetchOsmZones()` queries Overpass for `bbox=43.715,-79.625,43.740,-79.595`, converts OSM features to `area`/`path`/`boundary` zones, deduplicates by name, then POSTs one by one. The UI trigger was removed from the header — the function exists, just wire a button back if needed.
- **Cancellation order**: Esc cancels vertex editing → then drawing → then deselects zone.

### Styling

Tailwind v4 via the `@tailwindcss/vite` plugin. No `tailwind.config.js` `content` glob is strictly needed in v4, but the file still sets a custom `primary: '#1E40AF'`. Color palette leans on greens (`#33A661`, `#2D7D46`, `#1A5C2E`) for arboretum theming.

### Build + Docker

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` adds SPA routing (`try_files $uri $uri/ /index.html`). The dev override swaps this for `npm run dev -- --host 0.0.0.0 --port 80` on port 3001.

---

## 13. Database, Docker, and Environment

### Database

- **Engine**: PostgreSQL 16 + PostGIS.
- **Local**: runs in the Docker `postgres` service on port 5432.
- **Production**: **Supabase** (see [ADR 005](docs/adr/0005_use_postgresql_supabase.md)). Use the **Session Pooler** connection string (supports IPv4). Direct connections are IPv6-only and fail on many networks.
- **Connection string formats**:

  Local:
  ```
  Host=localhost;Port=5432;Database=goalz;Username=goalz;Password=...;SSL Mode=Disable
  ```
  Supabase:
  ```
  Host=<pooler-host>;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=...;SSL Mode=Require;Trust Server Certificate=true
  ```

- **Secrets**:
  - Local dev → `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."`.
  - Docker → `.env` file (`ConnectionStrings__DefaultConnection`).
  - Production → injected by host (Azure).

- **Reference dumps** in `database/schema/`: `current_schema.sql` (active) and `loggin_schema_draft.sql` (original design).

> The older `database/README.md` mentions `GoalzDbContext.cs` and a `Goalz.API/Data/` folder. Both names are outdated — the active context is `AppDbContext` in `Goalz.Data/Storage/`. The general workflow it describes is still correct.

### Docker Compose — base (`docker-compose.yml`)

| Service | Image | Ports | Depends on | Notes |
|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | — | Named volume `postgres_data`, healthcheck via `pg_isready` |
| `minio` | `minio/minio:latest` | 9000, 9001 | — | Named volume `minio_data`, healthcheck `mc ready local` |
| `backend` | Built from `backend/Goalz/Goalz.API/Dockerfile` | 8080 | postgres (healthy), minio (healthy) | Reads `.env` for Postgres, MinIO, JWT |
| `app` | Built from `frontend/app/Dockerfile` | 3000 | — | **Dead service** — `frontend/app/` was deleted. Prune or ignore. |
| `dashboard` | Built from `frontend/dashboard/Dockerfile` | 3001:80 | — | Nginx SPA |

Backend env wiring:

```yaml
ASPNETCORE_ENVIRONMENT: ${ASPNETCORE_ENVIRONMENT:-Development}
ASPNETCORE_URLS: http://+:8080
ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}"
Minio__Endpoint: minio:9000
Minio__AccessKey: ${MINIO_ROOT_USER}
Minio__SecretKey: ${MINIO_ROOT_PASSWORD}
Jwt__Secret: ${JWT_SECRET}
```

Note the `__` pattern: ASP.NET's nested config `Jwt:Secret` → env var `Jwt__Secret`.

### Docker Compose — dev override (`docker-compose.override.yml`)

Automatically merged by `docker compose up`. Enables hot reload:

- `backend`: uses the `build` stage, volume-mounts `./backend/Goalz:/src`, runs `dotnet watch run --no-launch-profile`.
- `app`: volume-mounts source + anonymous `node_modules` volume, runs `npm run dev -- --host 0.0.0.0 --port 80`. (Inactive now that the app folder is gone.)
- `dashboard`: same as `app` but for the dashboard folder.

### Environment variables

`.env.example` template:

```bash
# PostgreSQL (local substitute for Supabase)
POSTGRES_DB=goalz
POSTGRES_USER=goalz
POSTGRES_PASSWORD=changeme

# Supabase (overrides DB creds above when set)
ConnectionStrings__DefaultConnection="change"

# MinIO object storage
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
JWT_SECRET=changeme-use-a-long-random-string-in-production
```

Mobile app: `frontend/mobile/.env` with `EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP>:5049`. **Expo only exposes variables prefixed `EXPO_PUBLIC_`** to client-side code.

Root-level `package.json` declares `expo`, `tailwindcss`, `@tailwindcss/postcss`, and `postcss` — a hoist that supports shared tooling, not an app entry point.

---

## 14. CI/CD Pipeline

File: `.gitlab-ci.yml`. Stages: `install` → `build`. Variables: `NODE_VERSION=20`, `DOTNET_VERSION=9.0`.

| Job | Stage | Image | Script | Cache / deps |
|---|---|---|---|---|
| `frontend:install` | install | `node:20` | `npm ci` in `frontend/app` and `frontend/dashboard` | Caches both `node_modules/` |
| `frontend:build` | build | `node:20` | `npm ci` + `npm run build` in both apps | Depends on `frontend:install` |
| `backend:build` | build | `mcr.microsoft.com/dotnet/sdk:9.0` | `dotnet restore` + `dotnet build --no-restore --configuration Release` | — |

> The pipeline still references `frontend/app`. Once you remove that service, either delete the references or rename `frontend:install` to scope it to `mobile` + `dashboard`.

Neither deployment nor tests are currently automated in CI. Hosting target is Azure (see [ADR 007](docs/adr/0007_host_on_azure.md)).

---

## 15. Tooling and Scripts

### `tools/seed-zones/`

Node script that seeds the Humber Arboretum's real geography into the dashboard.

- **Deps**: `node-fetch` ^3.3.2.
- **Entry**: `index.js` (~212 lines).
- **Flow**:
  1. Queries the **Overpass API** (`https://overpass-api.de/api/interpreter`) for relations / ways / named features within `bbox=43.715,-79.625,43.740,-79.595`.
  2. Converts OSM nodes/ways/relations into GeoJSON LineStrings and Polygons.
  3. Classifies each feature into a zone type (`path`, `area`, or `boundary`) and picks a color (`#8B6914`, `#2D7D46`, `#1A5C2E`).
  4. Deduplicates by zone name.
  5. Logs in via `POST /api/game/auth/login` to obtain a JWT, then `POST /api/dashboard/zones` for each zone.
- **Usage**: `node index.js --url <api> --email <staff-email> --password <pw> [--dry-run]`.
- **Notes**: supports self-signed HTTPS for local dev; prints a preview in `--dry-run`.

### Postman

- **`.postman/resources.yaml`** — Postman cloud workspace descriptor; maps local collections to workspace IDs.
- **`postman/collections/Loggin - Game Auth/`** — 5 game-auth test requests:
  - Login (happy path)
  - Login with wrong password
  - Sign Up (happy path)
  - Sign Up — duplicate email
  - Sign Up — duplicate username
- Other folders (`environments/`, `flows/`, `globals/`, `mocks/`, `specs/`) are placeholders.

### `.claude/` — Claude Code configuration

Holds launch configs for preview environments (dev servers for backend + dashboard + mobile) and a local permissions allowlist for read-only operations. Not required for humans.

---

## 16. Development Workflow

### Branching

```
main        ← production
  └── dev   ← integration (all work merges here first)
        ├── feat/<short-description>
        ├── feat/<issue-number>-<description>     (when tied to an issue)
        ├── fix/<short-description>
        ├── docs/…  · refactor/…  · test/…  · chore/…  · ci/…
```

- Branches are lowercase kebab-case, no spaces / underscores.
- **Always branch from `dev`.** Only `hotfix/*` branches off `main` (and merges back into both).
- Delete branches after merge. Full rules: [docs/branch_conventions.md](docs/branch_conventions.md).

### Commits (Conventional Commits)

```
<type>(<scope>): <imperative summary>

<optional body explaining why>

Closes #<id>   ← on the last commit of an issue
Refs #<id>     ← on intermediate commits
BREAKING CHANGE: <details>   ← when applicable
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`. Scopes commonly used: `backend`, `frontend`, `iot`, `db`, `auth`, `ci`, `docs`, `storage`. Full spec: [docs/commit_conventions.md](docs/commit_conventions.md).

### GitLab issues

Work is tracked on the GitLab issue board. Always:

1. `glab issue list` before starting — pick an issue.
2. Include the issue ID in every commit referencing it.
3. Use `Closes #N` on the final commit; `Refs #N` on intermediates.

Useful filters:

```bash
glab issue list --label "Doing"
glab issue list --label "Dashboard"
glab issue list --label "MobileApp"
glab issue list --label "Todo"   # etc.
```

Full guide: [agent_docs/gitlab_workflow.md](agent_docs/gitlab_workflow.md).

### Adding a backend feature (checklist)

From [agent_docs/adding_a_feature.md](agent_docs/adding_a_feature.md):

1. **Entity** → `Goalz.Domain/Entities/`. `long Id`. Nav collections default `= []`.
2. **DbSet** → `Goalz.Data/Storage/AppDbContext.cs`. Enum props **must** `.HasConversion<string>()`. Configure indexes / FK delete behavior here.
3. **Migration** → `dotnet ef migrations add <Name> --project Goalz.Data --startup-project Goalz.API --configuration Release`.
4. **Repository interface** → `Goalz.Application/Interfaces/IXxxRepository.cs`, namespace `Goalz.Core.Interfaces`.
5. **Repository impl** → `Goalz.Data/Repositories/XxxRepository.cs`. Inject `AppDbContext`.
6. **Service interface** → `Goalz.Application/Interfaces/IXxxService.cs`.
7. **Service impl** → `Goalz.Application/Services/XxxService.cs`, namespace `Goalz.Core.Services`.
8. **DI** → both services registered `Scoped` in `Program.cs`.
9. **Controller** → `Goalz.API/Controllers/Game/` or `Dashboard/`. Follow the route conventions.
10. **DTOs** → `Goalz.Application/DTOs/`, namespace `Goalz.Core.DTOs`.

Service failure pattern: return `(bool Success, string? Error)`; controllers `switch` on the error string.

---

## 17. Architecture Decision Records

All eight ADRs live in [docs/adr/](docs/adr/). Each is short (status / context / decision / consequences). Summary:

| ADR | Decision | Key trade-off |
|---|---|---|
| [001](docs/adr/0001_use_aspnet_core.md) | **ASP.NET Core 9** for the backend | High performance, strong typing, Azure integration · C# ecosystem required |
| [002](docs/adr/0002_use_gitlab.md) | **GitLab** for VCS, issues, CI/CD | Single source of truth + built-in pipelines · team onboarding overhead |
| [003](docs/adr/0003_use_cpp_arduino_esp32.md) | **C++ / Arduino / ESP32** for IoT firmware | Low power, direct hardware · firmware debugging is painful |
| [004](docs/adr/0004_use_react_javascript.md) | **React.js** for the frontend SPAs | Huge ecosystem, component reuse · JS ecosystem churn |
| [005](docs/adr/0005_use_postgresql_supabase.md) | **PostgreSQL** via **Supabase** in prod | Spatial data, realtime, managed auth · vendor lock-in |
| [006](docs/adr/0006_use_minio_object_storage.md) | **MinIO** S3-compatible object storage | Keeps DB lean, portable · extra service to operate |
| [007](docs/adr/0007_host_on_azure.md) | Host on **Microsoft Azure** | Native .NET + SLA + monitoring · cloud costs + learning curve |
| [008](docs/adr/0008_use_mermaid_auto_diagrams.md) | **Mermaid** for architecture diagrams | Renders natively in GitLab · manual upkeep until CI auto-gen lands |

---

## 18. Known Issues, Orphan Code, and Tech Debt

Treat this section as a to-clean-up list.

### Backend

- **Duplicate `AppDbContext`**. `Goalz.Data/Storage/AppDbContext.cs` is active. `Goalz.Infrastructure/Data/AppDbContext.cs` is dormant but still compilable. Also ships a separate migration history. Decide between: (a) delete Infrastructure entirely, or (b) formally freeze it with a README.
- **`Goalz.Application` csproj named `Goalz.Core`**. Cosmetic but confusing. Either rename the csproj or rename the folder.
- **`Goalz.Core/` orphan folder**. `Services/AuthService.cs` still has `<<<<<<<` merge conflict markers. Not referenced. Delete.
- **Dashboard auth incomplete**. `POST /api/dashboard/auth/login` echoes the DTO rather than issuing a JWT. The dashboard already stores `localStorage["jwtToken"]` — wire this end-to-end.
- **Dashboard controllers lack `[Authorize]`**. `ZoneController` is explicitly `[AllowAnonymous]`; others have no attribute. Anyone on the network can call them. Lock down before production.
- **Unused entities**. `Quiz`, `Question`, `Answer`, `Party`, `PartyGroup`, `PartyMember`, `PartyGroupAnswer`, `Information` have no `DbSet` in the active context — no API surface. They need a migration before they're usable.
- **`Information`** is fully orphaned — commented out of `Sensor`, no FK elsewhere.
- **`Element.ElementName` and `ElementType` are `long`**, not strings — probably should be FK IDs into lookup tables, but no such tables exist.
- **Repository file typo**: `OverviewRepositorycs.cs` (extra `cs` before `.cs`). Cosmetic.
- **MinIO unused in code**. `Minio__Endpoint`/`AccessKey`/`SecretKey` are read into config, but no `IMinioClient` is wired up.

### Frontend

- **`frontend/app/` removed**. The `docker-compose.yml` `app:` service and the `.gitlab-ci.yml` steps still reference it. Prune.
- **Dashboard API base URL is hardcoded** to `https://localhost:7286/api/dashboard`. Should become an env var (`VITE_API_BASE_URL` or similar). Currently the dashboard can't talk to the Dockerized backend on 8080 without code edits.
- **No environment variable file for dashboard** (`.env.example` missing).
- **Two Leaflet instances trap**. Any new file importing `leaflet` from npm (rather than `const L = window.L`) will break `L.Control.Draw`. See [agent_docs/arboretum_map.md](agent_docs/arboretum_map.md).
- **Empty directories** in `dashboard/src/`: `api/`, `constants/`, `context/`, `routes/`, `styles/`, `utils/` all exist but are empty.

### Docs

- `database/README.md` references `GoalzDbContext` and `Goalz.API/Data/`. The real names are `AppDbContext` in `Goalz.Data/Storage/`. Update.
- `README.md` (pre-rewrite) listed `frontend/app/` and `hardware/` — neither exists. This rewrite corrects that.

### Gameplay / backend gap

Despite the elaborate [game_flow.md](docs/game_flow.md) spec, **no party / quiz / scoring endpoints exist** in the active API. The only player-facing APIs are auth and friendships. Sensor scanning, checkpoint detection, photo verification, party creation, quiz flow, scoring, and leaderboards all still need to be built.

---

## 19. Glossary

| Term | Meaning |
|---|---|
| **Loggin** | The player-facing mobile app. The typo (`loggin`, not `login`) is intentional and the product name. |
| **Loggy** | The squirrel mascot whose lost nuts motivate gameplay. |
| **Party** | A gameplay session created by one user (the Owner). Has a code for joining. |
| **Party Owner / Participant** | Per-session roles (creator vs joiner). All accounts are equal otherwise. |
| **Scout / Trailblazer** | In-game roles auto-assigned per section. Scouts scan sensors; Trailblazers photograph elements. |
| **Section** | One slice of the arboretum; the atomic unit of gameplay. All groups run the same sections in order. |
| **Nuts** | In-game currency / points. Loggy distributes his stash to all groups at session end. |
| **Arboretum** | **Humber Arboretum** in Toronto — the physical play space. Bounding box `43.715,-79.625` to `43.740,-79.595`. |
| **Zone** | A named polygon / polyline on the dashboard map. Types: `boundary`, `area`, `path`. |
| **Element** | A predefined nature element (tree, plant, rock) that Trailblazers photograph. Has a geo point and an `IsGreen` flag. |
| **Sensor** | A physical IoT node placed in the arboretum. Reports temp + humidity + location. |
| **Scout hint** | An ephemeral hint fragment shown briefly when a Scout scans a sensor. Must be memorized. |
| **Box** | The in-game target a group unlocks at the end of a section. Appears on the map once Trailblazers finish; opens when the quiz is solved. |
| **PostGIS** | PostgreSQL extension for geospatial data types and queries. Used for zones, sensors, elements. |
| **Dashboard** | The React + Vite web app for staff/admins. |
| **Overpass API** | The OSM query API used by the zone-seed tool and the dashboard's OSM import feature. |
| **Active DbContext** | `Goalz.Data/Storage/AppDbContext.cs` — the only one the runtime API touches. |

---

## See also

- [README.md](README.md) — entry point and quick start
- [CLAUDE.md](CLAUDE.md) — operational notes and gotchas
- [docs/game_flow.md](docs/game_flow.md) — the full gameplay design
- [docs/diagrams/c4_models.md](docs/diagrams/c4_models.md) — C4 diagrams (Mermaid)
- [agent_docs/](agent_docs/) — task-focused developer guides
