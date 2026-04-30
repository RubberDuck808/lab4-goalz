# Goalz - Changelog

## Table of Contents

1. [Dashboard: Rename nav items — Overview → Arboretum Map Overview, Arboretum Map → Game Map](#dashboard-rename-nav-items--2026-04-29)
2. [Dashboard: Log Out button in navbar](#dashboard-log-out-button-in-navbar--2026-04-29)
2. [Mobile: Party UX improvements, sensor modal, camera checkpoint](#mobile-party-ux-improvements-sensor-modal-camera-checkpoint--2026-04-29)
1. [Game setup: boundary-aware sliders & closest zone start](#game-setup-boundary-aware-sliders--closest-zone-start--2026-04-30)
2. [Fix: Dashboard map — zones filtered by boundary](#fix-dashboard-map--zones-filtered-by-boundary--2026-04-30)
3. [Fix: Party role assignment & game completion](#fix-party-role-assignment--game-completion--2026-04-30)
3. [Mobile: Party UX improvements, sensor modal, camera checkpoint](#mobile-party-ux-improvements-sensor-modal-camera-checkpoint--2026-04-29)
2. [Mobile: Profile, Navigation, Leaderboard, Edit Profile, Settings Accessibility](#mobile-profile-navigation-leaderboard-edit-profile-settings-accessibility--2026-04-29)
2. [Security: Remove hardcoded secrets from appsettings.json](#security-remove-hardcoded-secrets-from-appsettingsjson--2026-04-28)
2. [#55 SonarQube CI Stage](#55-sonarqube-ci-stage--2026-04-28)
3. [#48 Element types fetched from API](#48-element-types-fetched-from-api--2026-04-28)
4. [#48 ImageUploadScreen — element type dropdown + species form + API](#48-imageuploadscreen-element-type-dropdown--species-form--api--2026-04-27)
5. [#48 UserPhoto](#48-userphoto--2026-04-27)
6. [#48 ImageUploadScreen](#48-imageuploadscreen--2026-04-27)
7. [#48 Camera Page Placeholder](#48-camera-page-placeholder--2026-04-27)
8. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)
9. [Auth redirect & PartyId migration fix](#auth-redirect--partyid-migration-fix--2026-04-27)
10. [Game setup configuration](#game-setup-configuration--2026-04-27)
11. [Separate Boundary from Zone](#separate-boundary-from-zone--2026-04-27)
12. [Link Zone to Boundary](#link-zone-to-boundary--2026-04-27)
13. [Remove ZoneType](#remove-zonetype--2026-04-27)
14. [Address PR #47 review comments](#address-pr-47-review-comments--2026-04-28)
1. [Dashboard JWT Login](#dashboard-jwt-login--2026-04-28)
2. [Admin User Management](#56admin-user-management--2026-04-28)
3. [#55 SonarQube CI Stage](#55-sonarqube-ci-stage--2026-04-28)
4. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)

---

## Dashboard: Rename nav items — 2026-04-29 14:10

### Changed
- Nav item "Overview" → "Arboretum Map Overview" (Navbar.jsx, Overview.jsx initial state + switch case)
- Nav item "Arboretum Map" → "Game Map" (Navbar.jsx, Overview.jsx switch case)
- Page title in DashboardOverview: "Alboretum Overview" → "Arboretum Map Overview"

### Rationale
- Label updates to better reflect the content shown in each section

> Issue closed after 0 min

---

## Dashboard: Log Out button in navbar — 2026-04-29 14:00

### Added
- Log Out button pinned to the bottom-left of the dashboard sidebar (`Navbar.jsx`)
- Clicking it calls `authService.logout()` (clears `token` and `user` from localStorage) then redirects to `/` via `useNavigate`

### Rationale
- `authService.logout()` already existed but had no UI trigger; adding it to the navbar is the most accessible location since the nav is always visible
- Used `absolute bottom-0` positioning inside the `relative` nav so the button stays at the bottom regardless of content height
## Game setup: boundary-aware sliders & closest zone start — 2026-04-30

### Changed
- `GameSetupPage`: fetches checkpoints alongside zones and boundaries on mount.
  Computes `maxCpPerZone` as the minimum checkpoint count across all zones in the
  selected boundary (the bottleneck zone sets the ceiling). The
  "Checkpoints per zone" slider and stepper now use this dynamic max instead of
  the hardcoded `10`. A hint label appears when the boundary caps the value.
- `GameSetupPage`: `zoneCount` and `cpPerZone` are both clamped via `useEffect`
  whenever the derived ceilings shrink — switching to a boundary with fewer
  zones or checkpoints automatically reduces the values rather than leaving them
  in an invalid state.
- `MapPage`: initial zone is now the one whose centroid is closest to the
  player's current GPS position. `Location.getCurrentPositionAsync` (Balanced
  accuracy) is called once when zones and checkpoints first load. If the
  permission is denied or the call fails, the first zone in the list is used as
  a fallback.

### Added
- `partyApi.js`: `getCheckpoints()` — fetches `/api/dashboard/checkpoints`
  (public endpoint) for use in the setup page.

### Rationale
- Hardcoding `max={10}` for checkpoints-per-zone lets staff configure values
  that can never be satisfied (e.g. a zone with only 2 checkpoints, configured
  for 5). Deriving the max from real data prevents silent misconfigurations.
- Starting on a random zone forces players to travel to it unnecessarily.
  Closest-zone start reduces the gap between the role reveal and the first
  checkpoint interaction.

> Issue closed after 0 min

---

## Fix: Dashboard map — zones filtered by boundary — 2026-04-30

### Fixed
- `ArboretumMap.jsx` — "Zones" list under a selected boundary now filters by
  `z.boundaryId === selectedZone.id` instead of showing every non-boundary zone
  in the database. Count badge, empty-state message, and the zone buttons all
  respect the boundary association correctly.
- `ArboretumMap.jsx` — `handleSaveEdit` now includes `boundaryId` in the
  `updateZone` payload. Previously, editing a zone's name or color sent
  `boundaryId: null`, which caused `ZoneService.UpdateAsync` to silently clear
  `zone.BoundaryId` in the database — breaking the boundary link on every edit.

### Rationale
- The `zones` state array holds all zones from all boundaries. The panel filter
  was using `!z._isBoundary` (type check only) rather than combining it with an
  id equality check, so it always showed the full set. The backend `ZoneDto`
  already included `BoundaryId` — nothing needed changing server-side, only the
  client-side predicate.
- `UpdateZoneDto.BoundaryId` is nullable and defaults to `null`. The service
  unconditionally assigns it (`zone.BoundaryId = dto.BoundaryId`), so omitting
  it from the PUT body is destructive. The fix adds `boundaryId:
  selectedZone.boundaryId` to preserve the existing link.

> Issue closed after 0 min

---

## Fix: Party role assignment & game completion — 2026-04-30

### Changed
- `GameContext`: polling now uses a `usernameRef` so the role lookup always reads
  the latest username even when the interval closure was created before
  `username` resolved from SecureStore. Dependency array simplified to
  `[partyId]` only — no longer restarts the interval on every username change.
- `GameContext`: exposes `triggerPoll()` so pages can request an immediate state
  refresh without waiting for the 3-second interval.
- `PartyOwnerPage`: calls `triggerPoll()` immediately after `startGame` so the
  host's role is in context before navigation fires.
- `YourRolePage`: calls `triggerPoll()` on mount if `role` is still null
  (non-host players who land on the page before the interval fires); shows an
  `ActivityIndicator` alongside the "WAITING FOR ROLE..." message.
- `MapPage`: when all zones are completed, navigates to the new
  `AllCheckpointsComplete` screen instead of silently resetting state. Uses a
  ref guard so the navigation fires exactly once.
- `App.js`: registers `AllCheckpointsComplete` in the navigator.

### Added
- `AllCheckpointsCompletePage`: shown when every zone checkpoint has been
  visited. Displays a trophy, congratulations copy, and a "Finish Game" button
  that resets game context and navigates home.

### Rationale
- **Role race condition**: the old `useEffect([partyId, username])` restarted
  the poll on every username change, but the closure inside `setInterval` still
  captured the snapshot at effect-start time. When `username` was null at that
  moment (async SecureStore not yet resolved), `role` was never extracted and
  the page was stuck on "WAITING FOR ROLE…" indefinitely. A `useRef` mirrors the
  latest username without triggering effect restarts, fixing the stale-closure
  problem. `triggerPoll` was added as a lightweight escape hatch for the
  remaining window between navigation and the next interval tick.
- **Game completion**: there was no end state — finishing all checkpoints only
  showed a brief flash toast. The new screen gives clear feedback and a clean
  exit path.

> Issue closed after 0 min

---

## Mobile: Party UX improvements, sensor modal, camera checkpoint — 2026-04-29

### Changed
- `GameSetupPage` party name field now uses the shared `AppTextInput` component instead of a raw `TextInput`
- Party buttons (Start, End Party, Leave Party) now have explicit `alignItems: 'center'` wrappers so they are centred regardless of parent flex layout
- `PartyOwnerPage` End Party button now triggers the same confirmation dialog as the header back button
- `ElementModal` updated to show "Photo Checkpoint" prompt with a "Take Photo" primary action and "Dismiss" link instead of just a close button

### Added
- **Back-press confirmation in party screens**: pressing hardware back or the header back button in `PartyOwnerPage` shows an Alert "Cancel Party?" (owner) and in `PartyLobbyPage` shows "Leave Party?" — navigating away only on confirmation; hardware back intercepted via `useFocusEffect` + `BackHandler`
- **`SensorModal`** (`pages/map/SensorModal.jsx`) — inline `Modal` overlay on the map that shows "Sensor Detected!" prompt, loads sensor readings on demand, and displays temp/humidity/light cards; replaces the `navigation.navigate('SensorData')` call so the map stays visible in the background
- **Backend auto-reduce group size**: `PartyService.StartGame` reduces `GroupSize` to `members.count` if fewer players joined than configured (falls back to `null`/Explorer for fewer than 2 players), preventing mis-assigned roles when a party is undersized

### Rationale
- Sensor data as a modal keeps the player oriented on the map — navigating away to a blank page breaks spatial context
- Confirmation on back-press prevents accidental party abandonment
- Group-size auto-reduce ensures every player always has a valid Scout/Trailblazer/Explorer role even with low attendance

> Issue closed after 0 min

---

## Mobile: Profile, Navigation, Leaderboard, Edit Profile, Settings Accessibility — 2026-04-29 00:00

### Fixed
- `BottomNavBar` called `navigation.popTo()` which does not exist in React Navigation v6 — replaced with `navigation.navigate()` to prevent runtime crashes
- `ProfilePage` showed `—` for own username because it read only the `viewedUsername` route param — now falls back to `user?.username` from session

### Added
- **`UserRow` component** (`components/UserRow.jsx`) — shared row for displaying a user with optional rank, score, badge, and tap handler; replaces inline user rows in `FriendsTab`, `PartyOwnerPage`, and `PartyLobbyPage`
- **`LeaderboardPage`** (`pages/LeaderboardPage.jsx`) — ranked list of users by total game points; highlights the current user; wired to the Award icon in `BottomNavBar`
- **`EditProfilePage`** (`pages/EditProfilePage.jsx`) — form to update username and email, plus a separate section to change password with current-password verification; wired to the "Edit Profile" button on `ProfilePage`
- **`AccessibilityContext`** (`context/AccessibilityContext.jsx`) — persisted font-scale (Default / Large / Extra Large) and color-mode (None / High Contrast) settings; wraps the entire app
- **`SettingsPage`** expanded with font-size selector and high-contrast toggle above the existing logout button
- **Backend** `PUT /api/game/users/profile` — updates username and/or email (validates uniqueness, JWT-required)
- **Backend** `POST /api/game/users/change-password` — verifies current password, applies new hash (JWT-required)
- **Backend** `GET /api/game/leaderboard` — returns top-50 users ranked by sum of `ReceivedPoints` across all `PartyGroupAnswers` (public)
- `PartyGroupAnswers` DbSet registered in `AppDbContext` for EF navigation in the leaderboard query
- `updateStoredUser()` added to `session.js` to patch the local user cache after profile edits
- API functions `updateProfile()`, `changePassword()`, `getLeaderboard()` added to `api.js`

### Rationale
- `navigate()` is the correct React Navigation v6 API for going to a named screen; `popTo()` does not exist
- A shared `UserRow` component eliminates duplicated layout code across friends, party, and leaderboard views
- Leaderboard aggregates points through `User → PartyMember → PartyGroup → PartyGroupAnswer` — no new schema changes needed
- `AccessibilityProvider` wraps the outermost shell so font-scale and color-mode are available to every screen

> Issue closed after 0 min

---

## Dashboard JWT Login — 2026-04-28 00:00
### Changed
- `DashboardLoginResponse` now includes a `Token` field
- `AuthService.CheckAuth` injects `IJwtService` and generates a JWT (using `email` as the `sub` claim and `role`) on successful login
- `authService.jsx` stores the token in `localStorage` under `"token"` key on login and removes it on logout
- `authService.getToken()` helper added to retrieve the stored token

### Rationale
- Reuses the existing `IJwtService` singleton — no new infrastructure needed
- Token stored in localStorage to match how the game app manages session state, making it available for future `[Authorize]` enforcement on dashboard endpoints

> Issue closed after 0 min

---

## Admin User Management — 2026-04-28 00:00
### Added
- `GET /api/dashboard/auth/users?adminEmail=` — returns all Staff and Admin users as `StaffUserDto[]`
- `PUT /api/dashboard/auth/users/{id}/role` — changes a user's role between Staff and Admin (admin-only)
- `DELETE /api/dashboard/auth/users/{id}?adminEmail=` — deletes a user; self-deletion is blocked (admin-only)
- `StaffUserDto` (`Id`, `Name`, `Email`, `Role`) and `ChangeRoleRequest` (`AdminEmail`, `NewRole`) DTOs
- `GetAllStaffAndAdminAsync`, `GetByIdAsync`, `DeleteUserAsync`, `SaveChangesAsync` on `IAuthRepository` / `AuthRepository`
- `GetStaffUsersAsync`, `ChangeUserRoleAsync`, `DeleteUserAsync` on `IAuthService` / `AuthService`
- `userManagementService.jsx` — frontend service for list, role-change, and delete API calls
- **Settings page** now shows a "User Management" table (admin only): lists all Staff/Admin users with role badge, "Make Admin/Staff" toggle button, and "Delete" button; own account row is disabled to prevent self-lockout; list refreshes automatically after create/role-change/delete

### Rationale
- Follows the existing `adminEmail` in request pattern used by `CreateStaffUserAsync` — no new auth mechanism needed
- Self-deletion guard added server-side (and buttons disabled client-side) to prevent accidental admin lockout
- Friendship cascade-delete (`OnDelete(DeleteBehavior.Cascade)`) already handles FK cleanup when a user is removed

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

## Security: Remove hardcoded secrets from appsettings.json — 2026-04-28 13:45
### Changed
- `appsettings.json`: replaced real Supabase connection string and JWT secret with empty strings
- Created `appsettings.Development.json.example` as a safe template for local dev setup

### Rationale
- SonarCloud flagged the Supabase password and JWT secret as hardcoded credentials (Blocker + Medium severity)
- Production values are injected via Cloud Run environment variables (`ConnectionStrings__DefaultConnection`, `Jwt__Secret`)
- Local dev values go in `appsettings.Development.json` which is already gitignored
- Placeholder `.example` file gives developers the expected structure without exposing real values

> **Action required:** rotate the Supabase database password and generate a new JWT secret — the old values are in git history

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

## [#48] Picture Upload Flow — 2026-04-27 – 2026-04-28

### Added

**Screens (Figma → code)**
- `pages/Camera.jsx` — dark viewfinder placeholder (Figma node 234-2085): rule-of-thirds grid, top bar with ← Back, blue sensor tag pill, sensor data strip, shutter button; safe-area-aware layout via `useSafeAreaInsets`
- `pages/Camera.web.jsx` — web-specific override; live webcam feed via `expo-camera` `CameraView` (`getUserMedia`), permission prompt, shutter calls `takePictureAsync()` and passes URI to `UserPhoto`; Metro serves this automatically on web instead of `Camera.jsx`
- `pages/UserPhoto.jsx` — full-bleed photo review (Figma node 234-2087): NEXT button (green) → `ImageUpload`, RETRY button (red) → `Camera`; beech-tree placeholder image when no real URI is passed
- `pages/ImageUploadScreen.jsx` — metadata input form (Figma node 198-1812)
- `pages/MapPage.web.jsx` — web stub replacing `react-native-maps` (native-only) so the web bundler doesn't crash

**Hooks & services**
- `src/hooks/usePhotoGallery.ts` — rewritten from Capacitor to Expo: requests camera permission, calls `ImagePicker.launchCameraAsync()`, returns URI or `null`
- `services/api/api.js` — `submitElement()`: `POST /api/dashboard/elements`

**Navigation**
- `App.js` — registered `Camera`, `UserPhoto`, `ImageUpload` screens

### Fixed

**Backend**
- `Program.cs` — removed duplicate `app.UseCors()` call
- `appsettings.json` — extended `Jwt:Secret` to meet 32-char minimum

### Rationale
- `Camera.web.jsx` / `MapPage.web.jsx` use Metro's platform-extension resolution so native and web builds each get the right implementation without conditional imports

> Issue closed after 0 min

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
