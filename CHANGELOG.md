# Goalz - Changelog

## Table of Contents

1. [#48 Element types fetched from API](#48-element-types-fetched-from-api--2026-04-28)
2. [#48 ImageUploadScreen — element type dropdown + species form + API](#48-imageuploadscreen-element-type-dropdown--species-form--api--2026-04-27)
3. [#48 UserPhoto](#48-userphoto--2026-04-27)
4. [#48 ImageUploadScreen](#48-imageuploadscreen--2026-04-27)
5. [#48 Camera Page Placeholder](#48-camera-page-placeholder--2026-04-27)
6. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)

---

## [#48] Element types fetched from API — 2026-04-28
### Added
- `Controllers/Game/ElementController.cs` — new game controller at `/api/game/elements`; `GET /api/game/elements/types` is public (`[AllowAnonymous]`), `POST /api/game/elements` requires JWT; reuses existing `IElementRepository` and `IElementService`

### Changed
- `services/api/api.js` — `getElementTypes()` fetches `/api/game/elements/types`; `submitElement()` posts to `/api/game/elements`; both previously pointed at `/api/dashboard/` routes
- `pages/ImageUploadScreen.jsx` — removed hardcoded `ELEMENT_TYPES` constant; replaced with `useEffect` that calls `getElementTypes()` on mount and stores results in `elementTypes` state; dropdown renders from live API data
- `agent_docs/api_endpoints.md` — documented `GET /api/game/elements/types` and `POST /api/game/elements`

### Rationale
- Dashboard routes (`/api/dashboard/elements`) are for the staff web app; mobile players submit through `/api/game/` which applies JWT auth to the write endpoint
- No new service or repository needed — `IElementService.CreateAsync` and `IElementRepository.GetAllElementTypesAsync` already exist and are injected directly

> Issue closed after 0 min

---

## [#48] ImageUploadScreen — element type dropdown + species form + API — 2026-04-27
### Changed
- Top input replaced with an expandable toggle dropdown showing three options: **Tree**, **Shrub**, **Bush**; selected value is highlighted in blue, dropdown collapses on pick
- Bottom input converted to a free-text species name form (`TextInput` + CLEAR button); pressing return on the keyboard also triggers upload
- UPLOAD button calls `submitElement` → `POST /api/dashboard/elements` with `elementName`, `elementType`, `latitude`, `longitude`, `imageUrl`, `isGreen: true`; shows `ActivityIndicator` while in flight and an error message on failure; navigates to Home on success
- Upload button is disabled (light blue) until all three required fields are filled: image, element type, and species name
- GPS string parsed into `latitude`/`longitude` before submission

### Added
- `submitElement` helper in `services/api/api.js` — follows the same fetch/authHeaders/success-status pattern as the rest of the API service

### Rationale
- Dropdown restricted to tree/shrub/bush because those are the three `ElementType` values in scope for this feature; the backend resolves the string to a `ElementType` row (or creates one), so no enum migration is needed
- `isGreen` hardcoded to `true` — all user-submitted plants qualify; can be made configurable later
- CLEAR button chosen over ADD to match the form pattern: the user types a single species and submits with UPLOAD rather than building a list

> Issue closed after 0 min

---

## [#48] UserPhoto — 2026-04-27
### Added
- `frontend/mobile/pages/UserPhoto.jsx` — `UserPhoto` (default export) implementing Figma node 234-2087
- Full-bleed image preview (`flex: 1`) showing `route.params.imageUri`; grey fallback when absent
- "UPLOAD" button (green `#58cc02`, bottom border `#5da700`) → navigates to `ImageUpload` passing `imageUri` + `gps`
- "RETRY" button (red `#ff4b4b`, bottom border `#90461f`) → navigates back to `Camera`
- `PageHeader` ("UPLOAD" title, no back button) and `BottomNavBar` reused from existing components
- Registered as `UserPhoto` screen in `App.js`

### Rationale
- Bottom border on buttons replicates the Figma shadow/depth treatment used throughout the app's game buttons
- No back button in header matches the Figma design — navigation is handled exclusively by UPLOAD / RETRY

> Issue closed after 0 min

---

## [#48] ImageUploadScreen — 2026-04-27
### Added
- `frontend/mobile/pages/ImageUploadScreen.jsx` — `ImageUploadScreenPage` (default export) implementing Figma node 198-1812
- Centered image preview (210×294, grey border `#c1c1c1`) — `imageUri` passed via route params; falls back to a grey placeholder
- GPS text below the image from `route.params.gps`
- Two labeled input rows ("What did you take a picture of?" / "What species is it?"), each with a styled `TextInput` (grey bg/border, chevron indicator) and a grey ADD button that activates once text is entered
- Blue UPLOAD button (`#1cb0f6`) that disables (lightens) when no image is present
- `PageHeader` (back + "INPUT" title) and `BottomNavBar` reused from existing components
- Registered as `ImageUpload` screen in `App.js`

### Rationale
- Named export kept as `ImageUploadScreenPage` per spec; file uses `export default` so it imports cleanly without braces
- ADD buttons are stateless placeholders — tag accumulation logic can be wired when the upload API is implemented
- Disabled Upload state signals clearly that a camera capture is required before submission

> Issue closed after 0 min

---

## [#48] Camera Page Placeholder — 2026-04-27
### Added
- `frontend/mobile/pages/Camera.jsx` — `CameraPage` component implementing the Figma wireframe (node 234-2085)
- Full-screen dark viewfinder (`#141414`) with rule-of-thirds grid overlay (two horizontal + two vertical hairlines)
- Top bar (`#0d0d0d`) with safe-area-aware padding and "← Back" navigation button
- Blue sensor tag pill (`#1cb0f6`) with green status dot and "SENSOR ON · Live data" label, positioned below the top bar
- Sensor data strip (`#1f1f1f`) showing live Temp / Humidity / AQI values in `#b2e5bf` text, passed via route params with sensible defaults
- Bottom controls bar (`#0d0d0d`) with shutter button (76 px outer ring + 59 px white inner circle)
- `CameraPage` registered as `Camera` screen in `App.js`

### Rationale
- Used placeholder dark `View` instead of `expo-camera` because the package is not listed as a dependency and the branch is scoped to a UI placeholder
- Safe area insets applied via `useSafeAreaInsets` so the top bar and bottom bar adapt to notch/home-indicator devices without a hard-coded pixel offset
- Route params (`temp`, `humidity`, `aqi`) default to the Figma sample values so the screen renders standalone during development

> Issue closed after 0 min
1. [#55 SonarQube CI Stage](#55-sonarqube-ci-stage--2026-04-28)
2. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)
3. [Auth redirect & PartyId migration fix](#auth-redirect--partyid-migration-fix--2026-04-27)
4. [Game setup configuration](#game-setup-configuration--2026-04-27)
5. [Separate Boundary from Zone](#separate-boundary-from-zone--2026-04-27)
6. [Link Zone to Boundary](#link-zone-to-boundary--2026-04-27)
7. [Remove ZoneType](#remove-zonetype--2026-04-27)
8. [Address PR #47 review comments](#address-pr-47-review-comments--2026-04-28)

---

## [#55] SonarQube CI Stage — 2026-04-28 00:00
### Added
- New `sonarqube` stage in `.gitlab-ci.yml` (runs after `test`)
- `sonarqube:analysis` job using `sonarsource/sonar-scanner-cli:latest` image
- Passes `SONAR_HOST_URL` and `SONAR_TOKEN` from GitLab CI variables
- Excludes `node_modules`, `bin`, `obj`, and `Migrations` from analysis
- `GIT_DEPTH: "0"` for full blame/history; `.sonar/cache` cached per job
- `allow_failure: true` so a SonarQube outage never blocks the pipeline
- Restricted to `dev` and `main` branches only

### Rationale
- SonarQube server is only reachable from within the school's GitLab runner, so the job is intentionally not runnable locally
- `allow_failure: true` prevents a down or misconfigured Sonar instance from blocking merges
- Migrations and generated bin/obj directories are excluded to avoid noise in the quality report

> Issue closed after 0 min

---

## Address PR #47 review comments — 2026-04-28 14:00
### Changed
- `Game/BoundaryController`: inject `IBoundaryService` instead of `IBoundaryRepository` — controllers must not bypass the service layer
- `Game/ZoneController`: inject `IZoneService` instead of `IZoneRepository` — same reason; `boundaryId` filter applied after `GetAllAsync()`
- `VisitCheckpointRequest` moved from nested class inside `PartyController` to its own file ([`VisitCheckpointRequest.cs`](backend/Goalz/Goalz.API/Controllers/Game/VisitCheckpointRequest.cs))
- Split multi-class DTO files into one class per file: `BoundaryDto`, `CreateBoundaryDto`, `UpdateBoundaryDto`, `ZoneDto`, `CreateZoneDto`, `UpdateZoneDto`, `GameStateResponse`, `MemberRoleDto`
- `PartyModePage.jsx`: `{error && <Text>}` shorthand instead of ternary-with-null

### Rationale
- Reviewer flagged direct repository injection in controllers — the service layer enforces business rules and must not be skipped
- One class per file is a standard C# convention the reviewer expected; the original bundling was a draft shortcut

> Issue closed after 5 min

---

## Remove ZoneType — 2026-04-27
### Removed
- `Zone.ZoneType` property — the field was vestigial after boundaries moved to their own table; all remaining zones are play areas
- `ValidZoneTypes` array and `invalid_zone_type` validation in `ZoneService` and `Dashboard/ZoneController`
- `ZoneType` from `ZoneDto` / `CreateZoneDto` / `UpdateZoneDto`
- `z.ZoneType` from `Game/ZoneController` response projection
- `ZONE_TYPES` constant and all `zone.zoneType` references in `ArboretumMap.jsx` — boundary detection now uses `zone._isBoundary` flag; the "Zone" badge in the edit panel is hardcoded
- Migration `DropZoneType`: `ALTER TABLE "Zones" DROP COLUMN "ZoneType"`
- Snapshot updated: Section entity removed, Boundary entity added, Zone entity updated (BoundaryId added, ZoneType removed, Party BoundaryZoneId → BoundaryId)

### Rationale
- With boundaries in a separate table, `ZoneType` only had two remaining values (`area`, `path`) that were never used to differentiate behaviour; keeping it added noise to every DTO, query, and UI component

> Issue closed after 30 min

---

## Link Zone to Boundary — 2026-04-27
### Added
- `Zone.BoundaryId` (nullable FK → `Boundaries`): zones are now explicitly linked to a boundary in the DB
- Migration `AddZoneBoundaryId`: adds `BoundaryId` column + index + FK with `ON DELETE SET NULL` to `Zones`
- `ZoneDto` / `CreateZoneDto` / `UpdateZoneDto`: include `BoundaryId`
- `ZoneService`: maps and saves `BoundaryId` in create/update/read
- `GET /api/game/zones?boundaryId=X`: optional filter returns only zones belonging to that boundary
- `GameSetupPage.jsx`: zone count slider is scoped to `zonesInBoundary` (zones whose `boundaryId` matches the selected boundary); shows a hint when no zones are linked yet
- `ArboretumMap.jsx`: when a boundary is selected and the user starts drawing a zone, the new zone is automatically linked to that boundary (`createBoundaryIdRef`)

### Rationale
- A pure spatial lookup (containment query) is non-deterministic when zones overlap; an explicit FK makes the relationship queryable, auditable, and join-friendly

> Issue closed after 20 min

---

## Separate Boundary from Zone — 2026-04-27
### Changed
- **`Boundary` entity** (new): `Id`, `Name`, `Color`, `Geometry` — own table `Boundaries` with GiST index
- **`Zone` entity**: `ZoneType` now only accepts `"area"` or `"path"`; boundary zones no longer exist in this table
- **`Section` entity**: deleted (was unused)
- **`Party.BoundaryZoneId`** renamed to `Party.BoundaryId` (FK now points at `Boundaries`, not `Zones`)
- **Migration `SeparateBoundaryFromZone`**: creates `Boundaries`, copies existing boundary zones there, migrates `BoundaryZoneId` → `BoundaryId` on `Parties`, drops `Sections` table
- **`IBoundaryRepository` / `BoundaryRepository`**: standard CRUD over `Boundaries` table
- **`IBoundaryService` / `BoundaryService`**: CRUD + `GeneratePreviewAsync` (preview generation moved here from `ZoneService`)
- **`IZoneService` / `ZoneService`**: removed `GenerateZonePreviewAsync`; `ValidZoneTypes` is now `{ "area", "path" }`
- **`ICheckpointService.AssignZonesForNewZoneAsync`**: removed `zoneType` parameter; simplified logic (assign if ZoneId is null — no boundary-zone special case needed)
- **`ZoneRepository.FindContainingZoneAsync`**: removed boundary-priority ordering (all zones are now play areas)
- **`GET /api/dashboard/boundaries`** (new): list, create, update, delete, generate-preview
- **`GET /api/game/boundaries`** (new): returns `{ id, name, color }` list for mobile setup screen
- **`Dashboard/ZoneController`**: removed `generate-preview` endpoint; updated error message to reflect `area`/`path` only
- **`boundaryService.jsx`** (new): dashboard API client for boundaries
- **`ArboretumMap.jsx`**: loads boundaries and zones separately; routes create/edit/delete to the right service based on `_isBoundary` flag; generate-preview now calls `/boundaries/{id}/generate-preview`
- **`partyApi.js`**: added `getBoundaries()` calling `GET /api/game/boundaries`
- **`GameSetupPage.jsx`**: fetches boundaries and zones in separate calls; boundary picker uses `boundaryId` state
- **`GameContext.jsx`**: polling destructures `boundaryId` (was `boundaryZoneId`)

### Rationale
- A boundary is fundamentally different from a play zone — it defines the outer perimeter, not a scoreable area. Mixing them in one table required filtering by `zoneType` everywhere and caused the misleading `Party.BoundaryZoneId → Zones` FK
- Keeping `ZoneType` on Zone (area/path) preserves the trail/area distinction for dashboard map styling without introducing a third entity

> Issue closed after 90 min

---

## [#30] Lobby Feature — 2026-04-24 14:00
### Added
- `Task<List<string>> GetLobbyMembers(long partyId)` to `IPartyRepository` and `IPartyService`
- Implementation in `PartyRepository`: queries `PartyGroups` by `partyId`, flattens through `PartyMembers`, returns `User.Username`
- Delegation in `PartyService` to `_partyRepository.GetLobbyMembers(partyId)`
- `LobbyResponse` DTO (`PartyId`, `PartyName`, `Members`, `Code`, `IsReady`) in `Goalz.Application/DTOs/`
- `ILobbyService` interface with `JoinLobby(partyId, username)` in `Goalz.Application/Interfaces/`
- `LobbyService` in `Goalz.Application/Services/`: validates party + user exist, fetches current members, builds `LobbyResponse`
- `LobbyController` at `GET /api/game/party/{partyId}/lobby` — `[Authorize]`, delegates to `ILobbyService`
- `PartyHub` (SignalR) in `Goalz.API/Hubs/`: `JoinLobbyRoom`, `SendMemberJoined`, `StartGame`
- `AddSignalR()` + `MapHub<PartyHub>("/hubs/party")` registered in `Program.cs`
- `AllowCredentials()` added to CORS policy (required for SignalR WebSocket handshake)

### Rationale
- `List<string>` usernames keeps the lobby response lightweight — no need to expose full user objects
- SignalR groups keyed on `partyId.ToString()` so each party gets an isolated broadcast channel
- `IsReady` defaults to `false` — owner ready-state is not yet persisted in the Party entity; field is reserved for a future migration

> Issue closed after 0 min

---

## Game setup configuration — 2026-04-27
### Added
- **`Party` entity fields**: `CreatedAt`, `GroupSize` (int?), `BoundaryZoneId` (long?), `ZoneCount` (int?), `CheckpointsPerZone` (int?)
- **Migrations**: `AddPartyCreatedAt`, `AddPartyGameConfig` applied to DB
- **`GET /api/game/zones`** (`ZoneController`): returns all zones with `id`, `name`, `zoneType` — used by setup screen to populate boundary picker
- **`PartyRequest` / `GameStateResponse` DTOs**: extended with the 4 config fields
- **`PartyService.StartGame`**: assigns Explorer role to all members when `GroupSize` is null; alternates Scout/Trailblazer otherwise
- **`PartyService.GetGameState`**: returns config fields in response so clients know game parameters
- **`GameSetupPage.jsx`**: shared setup screen (party + single-player) with custom PanResponder draggable slider, ± stepper, boundary zone chips, groups toggle, group size control; calls `/api/game/zones` on mount
- **`GameContext`**: added `gameConfig` state + `setGameConfig` — populated from `GameSetupPage` (solo) and from polling `GetGameState` (party)
- **`partyApi.js`**: added `getZones()`, updated `createParty(name, config)` to forward config fields
- **`YourRolePage`**: handles Explorer role — shows single "Explorer" card when `gameConfig.groupSize` is null in single-player
- **Navigation wiring**: `RouteModePage` Single → `GameSetup` (singlePlayer: true); `PartyModePage` Create party → `GameSetup` (singlePlayer: false); `App.js` registers `GameSetup` screen

### Changed
- `RouteModePage` Single button previously navigated directly to `YourRole`; now goes to `GameSetup` first

### Rationale
- Single shared setup screen avoids duplicating slider/stepper logic between solo and party flows
- Custom PanResponder slider keeps the dep tree lean (no new libraries)
- Explorer role covers the no-groups case so `YourRolePage` doesn't need a separate code path

> Issue closed after 120 min

---

## Auth redirect & PartyId migration fix — 2026-04-27 00:00
### Fixed
- **JWT handler mismatch**: ASP.NET Core 9 JwtBearer defaults to `JsonWebTokenHandler`; `JwtService` generates tokens with `JwtSecurityTokenHandler`. Added `options.UseSecurityTokenValidators = true` to `AddJwtBearer` in `Program.cs` — backend now validates tokens correctly, eliminating the 401s that triggered the auto-logout redirect on Profile and Party pages.
- **`PartyId` column missing from `PartyMembers`**: `PartyMember.PartyId` was added to the entity before the `AlterCheckpointRedesign` migration was generated. That migration captured the new model state in its designer file but omitted the `AddColumn` SQL. No migration was ever generated to add the column. Manually wrote `20260427000001_AddPartyMemberPartyId` migration and applied it — `ALTER TABLE "PartyMembers" ADD "PartyId" bigint NOT NULL DEFAULT 0` now runs successfully.

### Rationale
- `UseSecurityTokenValidators = true` is the minimal targeted fix that makes the existing `JwtService` token format work with the v9 JwtBearer middleware. Replacing `JwtSecurityTokenHandler` with `JsonWebTokenHandler` in `JwtService` would be the forward-looking approach but requires more testing.
- The manual migration was necessary because EF compares the entity model to the snapshot (not the DB) to decide what to generate — since the snapshot already included `PartyId`, `dotnet ef migrations add` produced nothing.

> Issue closed after 60 min

---