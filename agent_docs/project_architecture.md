# Project Architecture

## Backend — Solution Structure

Five folders under `backend/Goalz/`, but only four are active:

| Folder | Assembly | Role |
|---|---|---|
| `Goalz.API/` | `Goalz.API` | Controllers, middleware, DI wiring (`Program.cs`) |
| `Goalz.Application/` | `Goalz.Core` | Services, interfaces, DTOs — uses `Goalz.Core.*` namespace despite folder name |
| `Goalz.Domain/` | `Goalz.Domain` | Entities and enums only — no logic |
| `Goalz.Data/` | `Goalz.Data` | Repositories, active `AppDbContext`, EF migrations |
| `Goalz.Infrastructure/` | `Goalz.Infrastructure` | **Legacy — not referenced at runtime, do not modify** |

**Orphan trap:** There is also a `Goalz.Core/` folder at the solution root (separate from `Goalz.Application/`). It contains merge-conflict artifacts — `Goalz.Core/Services/AuthService.cs` has unresolved `<<<<<<<` markers. It is **not** wired into `Program.cs`. Do not add files to it.

**Dependency direction:** `API → Application (Goalz.Core) → Domain`. `Data` also references `Domain`.

**Key files:**
- DI wiring & middleware: `backend/Goalz/Goalz.API/Program.cs`
- Active DbContext: `backend/Goalz/Goalz.Data/Storage/AppDbContext.cs`
- Entities: `backend/Goalz/Goalz.Domain/Entities/`

## Frontend — Three Apps

| App | Path | Stack | Dev port | Purpose |
|---|---|---|---|---|
| Mobile | `frontend/mobile/` | Expo React Native | device/emulator | Primary game UI for players |
| Web app | `frontend/app/` | React + Vite | 3000 | Player web interface |
| Dashboard | `frontend/dashboard/` | React + Vite + Leaflet | 3001 | Staff/admin UI with maps |

**Mobile specifics:**
- Env vars must be prefixed `EXPO_PUBLIC_` to be accessible in client code
- API base URL in `frontend/mobile/.env` (gitignored) — copy from `.env.example`: `EXPO_PUBLIC_API_BASE_URL=http://localhost:5049`
- Session stored in AsyncStorage — keys `loggin_user` and `loggin_token` (typo is intentional; changing it would break existing installs)
- All API calls go through `frontend/mobile/services/api.js`; session helpers in `frontend/mobile/services/session.js`

**Web app & dashboard:** API URL is typically hardcoded or set at build time; no `.env.example` is checked in for these.
