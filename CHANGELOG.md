# Goalz - Changelog

## Table of Contents

1. [Leaderboard redesign — hero pattern, podium, filters, time-based backend](#leaderboard-redesign--hero-pattern-podium-filters--2026-05-17)
1. [Fix: PicturesTaken stat never incremented](#fix-picturestaken-stat-never-incremented--2026-05-16)
1. [Browse mode removal + photo task fix](#browse-mode-removal--photo-task-fix--2026-05-16)
1. [Security & Flow Audit — full mobile + backend hardening](#security--flow-audit--2026-05-15)
1. [Fix: User 2 stuck in infinite role screen after game start](#fix-user-2-stuck-in-infinite-role-screen--2026-05-13)
1. [Feat: SignalR real-time push — replace 3s REST polling](#feat-signalr-real-time-push--2026-05-13)
1. [Fix: Mobile/backend flow audit — multi-zone, redundancy, over-requesting](#fix-mobilebackend-flow-audit--2026-05-13)
---

## Leaderboard redesign — hero pattern, podium, filters — 2026-05-17

### Changed
- `LeaderboardPage.jsx`: Full rewrite. Replaced flat white page with blue hero → white card overlap (matching Home/Profile). Added animated podium visual in hero (2nd left, 1st centre/gold ring, 3rd right with bar platforms). Rankings list shows all entries with top-3 cream tint and a heavier divider between rank 3 and 4. "you" pill badge on the current user's row.
- Filter chips added: **All time**, **This month**, **This week** (each fetches from backend with `?period`), **Friends** (client-side filter using `getConnections`).
- `api.js` `getLeaderboard`: Now accepts optional `period` argument and appends `?period=` to the URL.

### Added (backend)
- `UserPointsLog` entity (`Goalz.Domain`) — logs every point-earning event with `UserId`, `PointsEarned`, `EarnedAt`.
- `UserPointsLogs` DbSet + EF config in `AppDbContext` (FK cascade + composite index on `UserId, EarnedAt`).
- Migration `AddUserPointsLog` applied.
- `UserRepository.AddGameStatsAsync` and `PartyRepository` party-complete block both insert a `UserPointsLog` row whenever points are awarded.
- `GetLeaderboardAsync(string? period)`: for `"week"` / `"month"` sums from `UserPointsLogs` filtered by `EarnedAt`; for `null` uses `UserStatistics.TotalPoints` as before.
- `IUserRepository`, `IUserService`, `UserService`, `LeaderboardController` all updated to thread `period` through the stack.

### Rationale
- The plain-white page with `PageHeader` was visually out of place; all other top-level pages use the hero pattern.
- Cumulative `TotalPoints` has no timestamp, so time-based filters required a new event-log table rather than schema changes to `UserStatistics`.
- Friends filter is intentionally client-side: the connections API is fast and avoids a custom join endpoint.

> Issue closed after 0 min

---

## Fix: PicturesTaken stat never incremented — 2026-05-16

### Fixed
- `ElementService.cs`: Injected `IUserService` and added call to `IncrementPicturesTakenAsync(request.SubmittedBy)` after a new element is persisted. The duplicate-update path (nearby pending element found) does not increment — the user was credited on first submission. Admin/seeded elements with no `SubmittedBy` are also skipped.

### Rationale
- The DB column, DTO, repository method, and service interface all existed; only the call site was missing.
- Placed in `ElementService` rather than the controller to keep stat tracking inside the service layer and out of HTTP concerns.

> Issue closed after 5 min

---

## Browse mode removal + photo task fix — 2026-05-16

### Changed
- `MapPage.jsx`: Removed all browse-mode (`fromGame=false`) code paths — dead code, nothing in the app navigated there without `fromGame: true`. Removed `boundaries` state, `getBoundaries()` call, `boundaryDistanceMeters` import, `useIsFocused` import, browse-mode map-fitting effect, browse-mode zone/checkpoint rendering, and all `fromGame &&` / `fromGame ?` conditionals throughout the component.
- `ZoneLayer.jsx`: Removed `fromGame` prop — status is now always `active | done | locked` derived from `completedZoneIds` and `activeZone`.
- `MapPage.jsx` (photo task fix): Removed `isFocused` gate from `pendingPhotoCompletion` effect — context update and navigation focus event arrive in separate React batches causing a timing race; `pendingPhotoCpRef.current` alone is a sufficient guard.
- `GameContext.jsx`: Removed `chatMessages`, `sendChatMessage`, and `connectionRef` — party chat was decided out of scope.
- `PartyHub.cs`: Removed `SendMessage` hub method — party chat out of scope.
- `components/ChatOverlay.jsx`: Deleted — party chat out of scope.
- `docs/mobile_feature_gaps.md`: Removed "In-Game Party Communication" section; renumbered remaining sections.

### Rationale
- Browse mode had no navigation entry point; keeping it added dead complexity and a second code path through every conditional in MapPage.
- The photo task bug was a timing race between React context updates and React Navigation focus events — removing the isFocused gate resolves it cleanly without adding synchronisation complexity.
- Party chat was descoped per product decision.

> Issue closed after 0 min

---

## Security & Flow Audit — 2026-05-15

### Security
- `PartyController.cs`: Added `[Authorize]` to `GetParty` — was fully public, leaking party codes and member lists
- `FriendshipController.cs`: Removed `[AllowAnonymous]` from `GetConnections` — was exposing full friend graphs without auth
- `PartyService.cs` + `PartyController.cs`: Added party-membership check to `StartGame`, `VisitCheckpoint`, and `CompleteGame` — any authenticated user could previously manipulate any party
- `JwtService.cs` + `Program.cs` + `appsettings.json`: Enabled JWT issuer and audience validation (`goalz-api` / `goalz-mobile`) — validation was disabled, allowing tokens from other systems to be accepted

### Flow Breaks (Backend)
- `Goalz.Application/Exceptions/NotFoundException.cs` (new): Introduced `NotFoundException`; updated `PartyService` to throw it instead of raw `Exception`
- `Program.cs`: Global exception handler now maps `NotFoundException` → 404 in all environments (previously only caught 500s in production, Swagger showed raw errors in dev)
- `PartyRepository.cs` + `IPartyRepository.cs`: Added `TryStartGameAsync` using `ExecuteUpdateAsync WHERE Status='Lobby'` — prevents two concurrent requests from both advancing the party to `InGame`
- `PartyRepository.cs`: `VisitCheckpointAsync` now uses `INSERT … ON CONFLICT DO NOTHING` — eliminates the TOCTOU race between `AnyAsync` + `AddAsync`
- `PartyRepository.cs`: `CompleteGameAsync` wrapped in `BeginTransactionAsync` / `CommitAsync` — partial saves (checkpoint rows saved, stats not) are now rolled back atomically
- `QuizController.cs`: Materialise answers list before `.OrderBy(_ => Random.Shared.Next())` — shuffle now runs in memory, not inside an EF LINQ provider where ordering is non-deterministic

### Flow Breaks (Mobile)
- `MapPage.jsx`: Data fetch wrapped in `try/catch`; `loadError` state added; render now shows a "Failed to load" message with a Retry button instead of a blank map on API failure
- `App.js`: Added `ErrorBoundary` class component wrapping the entire navigator — a single page crash no longer kills the whole app
- `QuizPage.jsx`: Added `submitting` state; Submit button disabled while request is in-flight — prevents double-submission
- `signalr.js`: `accessTokenFactory` now checks JWT expiry before returning the token; clears session and redirects to Login if expired

### State Bugs (Mobile)
- `QuizPage.jsx`: Added `useFocusEffect` to reset `selectedAnswer` to null on screen focus — previous answer was retained if user navigated back into the quiz screen

### Rationale
- The party IDOR and missing-auth issues were the highest-risk findings — any user could start, manipulate, or complete another party's game without being a member
- The `NotFoundException` global handler stops raw `Exception` throws from surfacing as opaque 500s, which confused the mobile app into generic retry loops
- Atomic DB operations (`ExecuteUpdateAsync`, `ON CONFLICT DO NOTHING`, transactions) prevent subtle score/state corruption under concurrent play

> Issue closed after 75 min

---

## Fix: User 2 stuck in infinite role screen — 2026-05-13

### Changed
- `Program.cs`: Added `.AddJsonProtocol(camelCase)` to `AddSignalR()` — SignalR's `JsonHubProtocol` was serialising with PascalCase defaults, so `GameStarted` arrived as `{ "Status": "InGame", "Members": [...] }` while `applyServerState` destructured camelCase keys; both `status` and `members` were `undefined`, silently no-oping every hub push for non-owner players
- `context/GameContext.jsx`: Added `lastServerMembersRef` to cache the most recently received member list; added `useEffect([username, role])` that applies the role from cache the moment `getUser()` resolves — fixes the race condition where `usernameRef.current` is still `null` when the `GameStarted` hub event fires

### Rationale
- The party owner was unaffected because `handleStart()` calls `triggerPoll()` immediately after `startGame()`, hitting the REST endpoint (which correctly returns camelCase via `AddControllers().AddJsonOptions()`) — no dependency on the SignalR push
- The 30-second REST fallback eventually fixed user 2 (~30 s delay), making the bug look "infinite" during testing
- The `lastServerMembersRef` approach avoids an extra network round-trip and resolves the role within milliseconds of username loading (typically < 100 ms after mount)

> Issue closed after 30 min

---

## Feat: SignalR real-time push — 2026-05-13

### Changed
- `Program.cs`: Added `OnMessageReceived` JWT handler so SignalR WebSocket handshakes can authenticate via `?access_token=` query parameter (WebSockets cannot send HTTP headers)
- `Hubs/PartyHub.cs`: Added `[Authorize]`, replaced stub client-invocation methods with `JoinPartyRoom` / `LeavePartyRoom` group management; server-side push is now via `IHubContext`
- `Controllers/Game/PartyController.cs`: Injected `IHubContext<PartyHub>`; `JoinParty`, `StartGame`, `VisitCheckpoint`, and `CompleteGame` now push the updated `GameStateResponse` (or completion notice) to the party's SignalR group after each mutation
- `services/signalr.js` (new): Hub connection builder — JWT token factory, automatic reconnect, warning-level logging
- `context/GameContext.jsx`: Replaced 3-second `setInterval` poll with a SignalR hub connection; `MemberJoined`, `GameStarted`, `CheckpointVisited` events call a shared `applyServerState()` function; 30-second fallback poll retained for reconnection resilience; connection is torn down and `LeavePartyRoom` invoked on unmount
- `package.json`: Added `@microsoft/signalr` (10 packages, Expo SDK 54 WebSocket compatible)

### Rationale
- At 10k users / 20-player parties the old 3-second poll produced ~3,300 DB round-trips per second — SignalR pushes state only on actual changes, eliminating ~95% of that load
- The hub was already scaffolded (`AddSignalR`, `/hubs/party` mapped) but never connected end-to-end; this wires it up fully
- Full `GameStateResponse` is pushed on each event so the client update path is identical to the former poll — no new client state shape to maintain
- 30-second fallback poll ensures eventual consistency if the WebSocket drops on flaky mobile networks

> Issue closed after 0 min

---

## Fix: Mobile/backend flow audit — 2026-05-13

### Changed
- `GameContext.jsx`: Party `completeGame()` guard no longer skips the API call when `pendingVisits` is empty — a party game with 0 checkpoint visits now correctly marks the party as "Completed"
- `QuizController.cs`: Removed `isCorrect` from `GET /api/game/quiz/question` response — answer correctness is no longer visible in the network response
- `QuizController.cs`: Added `POST /api/game/quiz/answer` — server-side answer verification returns `{ correct, points }`; quiz score is now server-validated instead of client-calculated
- `QuizPage.jsx`: Updated to call `POST /api/game/quiz/answer` on submit instead of reading `isCorrect` locally
- `partyApi.js`: Added `submitQuizAnswer()`; updated `getZones()` → `/api/game/map/zones` and `getBoundaries()` → `/api/game/map/boundaries` (full geometry, replaces minimal endpoints)
- `MapPage.jsx`: Replaced three raw `apiFetch()` calls with the exported `getZones()`, `getBoundaries()`, `getCheckpoints()` helpers; removed unused `apiFetch` import
- `MapPage.jsx`: `zoneCount` cap now sorts zones by proximity to the player before slicing, so the nearest N zones are selected instead of the first N by DB order
- `PartyRepository.cs`: `CompleteGameAsync` now writes `PartyMember.Score` for the completing player (`checkpoints * 10 + quizScore`)
- `ZoneController.cs` (game): Deleted — `GET /api/game/zones` was redundant with `GET /api/game/map/zones`
- `BoundaryController.cs` (game): Deleted — `GET /api/game/boundaries` was redundant with `GET /api/game/map/boundaries`
- `agent_docs/api_endpoints.md`: Added full documentation for map, sensor, quiz, party, and leaderboard endpoints; updated quick reference table

### Rationale
- Party completion guard bug would leave parties in "InGame" forever if a player bailed immediately after the host started
- Exposing `isCorrect` allowed any player to cheat by reading the quiz question network response; server-side validation closes that hole
- `MapPage` was bypassing the established API helper layer, making the code inconsistent and harder to maintain
- Zone cap by DB order meant players could be assigned zones on the opposite side of the arboretum when a cap was configured
- `PartyMember.Score` was an entity field that had existed but was never written — leaderboard per-party scores were always 0
- Consolidating to the `/map/` endpoints removes two redundant controllers and one confusing endpoint split

> Issue closed after 0 min

---

1. [Feature: UserStatistics table + completion receipt](#feature-userstatistics-table--completion-receipt--2026-05-11)
1. [Fix: quiz timing, real questions, solo stats](#fix-quiz-timing-real-questions-solo-stats--2026-05-10)
1. [Mobile: Performance & security hardening](#mobile-performance--security-hardening--2026-05-10)
1. [Feature: Pending element submission & admin approval flow](#feature-pending-element-submission--admin-approval-flow--2026-05-07)
2. [Mobile: Camera flow — iOS/Android hardening](#mobile-camera-flow--iosandroid-hardening--2026-05-07)
2. [Mobile: Fix camera task — camera opens and full photo flow works](#mobile-fix-camera-task--2026-05-07)
2. [Seed: Chania Old Town elements and sensors](#seed-chania-old-town-elements-and-sensors--2026-05-07)
3. [Docs: End-user guide and deployment guide](#docs-end-user-guide-and-deployment-guide--2026-05-03)
2. [Mobile: Supabase photo upload + SonarQube gitignore](#mobile-supabase-photo-upload--sonarqube-gitignore--2026-04-30)
3. [Dashboard: Rename nav items — Overview → Arboretum Map Overview, Arboretum Map → Game Map](#dashboard-rename-nav-items--2026-04-29)
4. [Dashboard: Log Out button in navbar](#dashboard-log-out-button-in-navbar--2026-04-29)
5. [Game setup: boundary-aware sliders & closest zone start](#game-setup-boundary-aware-sliders--closest-zone-start--2026-04-30)
6. [Fix: Dashboard map — zones filtered by boundary](#fix-dashboard-map--zones-filtered-by-boundary--2026-04-30)
7. [Fix: Party role assignment & game completion](#fix-party-role-assignment--game-completion--2026-04-30)
8. [Mobile: Party UX improvements, sensor modal, camera checkpoint](#mobile-party-ux-improvements-sensor-modal-camera-checkpoint--2026-04-29)
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

## Feature: UserStatistics table + completion receipt — 2026-05-11 09:00

### Added
- **`UserStatistics` entity** — dedicated table (1-to-1 with User) tracking `CheckpointsVisited`, `PicturesTaken`, `PartiesJoined`, `GamesPlayed`, `TotalPoints`. Migration `AddUserStatistics` creates the table; `SoloScore` removed from Users.
- **`GET /api/game/users/stats`** — returns own stats; **`GET /api/game/users/stats/{username}`** — returns any user's stats (for viewing other profiles).
- **Completion receipt screen** — `AllCheckpointsCompletePage` now shows a restaurant-bill breakdown: checkpoints × 10 pts, quiz bonus, total. Styled as a torn receipt card.
- **Real stats on Profile** — `ProfilePage` fetches `getUserStats` on focus; `StatisticsCard` now renders all 5 fields in a 2-column grid with a full-width "Total points" accent row.

### Changed
- `PartyRepository.CompleteGameAsync` now upserts `UserStatistics` instead of writing to `PartyMember.Score`.
- `PartyService.JoinParty` increments `PartiesJoined` when a new member joins a party.
- `UserRepository.GetLeaderboardAsync` reads `UserStatistics.TotalPoints` directly — no more multi-table sum.
- Removed `SoloScore` from `User` entity; `UserService.AddSoloScoreAsync` replaced by `AddGameStatsAsync`.

### Rationale
- Single source of truth for user stats instead of scattered columns and runtime aggregation.
- Leaderboard query is now a simple join + single column read rather than a cross-table sum.

> Issue closed after 60 min

---

## Fix: quiz timing, real questions, solo stats — 2026-05-10 20:30

### Fixed
- **Timing bug**: `AllCheckpointsComplete` was showing before the quiz screen because `useEffect` on `postQuizZoneId` fired synchronously when the state was set. Replaced with `useFocusEffect` + a ref so zone advancement only runs when `MapPage` regains focus after the quiz — never before. `QuizResultPage` still handles the all-zones-done case directly (navigates to `AllCheckpointsComplete` without returning to map).

### Added
- **Real quiz questions**: `Quizzes`, `Questions`, `Answers` tables created via migration `20260510202138_AddQuizQuestionAnswer`. Seeded 10 sustainability questions (4 answers each, 1 correct). `GET /api/game/quiz/question` returns a random question with shuffled answers.
- **`QuizPage`** now fetches a real question from the API on mount; shows a loading spinner while fetching; Submit button disabled until an answer is selected; countdown pauses until question loads.
- **Solo player stats**: `User.SoloScore` column added (`20260510202730_AddUserSoloScore`). `POST /api/game/users/solo/complete` awards `checkpointCount × 10 + quizScore` to the user's `SoloScore`. Leaderboard now sums `SoloScore` alongside party-based points. `GameContext.completeGame` calls the solo endpoint when `partyId` is null.

### Rationale
- `useFocusEffect` fires on screen focus events (navigation stack changes), not on React state changes, making it the correct hook for "do X after returning from another screen."
- Seed data embedded in the migration so the tables are usable immediately after `dotnet ef database update` — no separate seed command needed.
- `SoloScore` column is simpler than creating a solo party record; the leaderboard already sums multiple score sources so adding one more column is low-friction.

> Issue closed after 120 min

---

## Mobile + Backend: Player avatars — 2026-05-10 13:00

### Added
- `User.AvatarId` (int, default 1) — migration `20260510101043_AddUserAvatarId` adds the column; existing rows default to 0, which the client maps to avatar 1.
- `frontend/mobile/utils/avatars.js` — `AVATAR_MAP` (1–7) and `getAvatar(avatarId)` helper; `avatarId` outside the valid range falls back to avatar 1.

### Changed
- `GameLoginResponse`, `GameSignUpResponse` — include `AvatarId` so the session is populated on login/signup.
- `UpdateProfileRequest` — accepts optional `AvatarId` (1–7); values outside range are ignored by the service.
- `UpdateProfileResponse` — returns updated `AvatarId`.
- `FriendDto` — includes `AvatarId` from the friend's user record.
- `LeaderboardEntryDto` — includes `AvatarId`.
- `UserService` — `UpdateProfileAsync` validates and saves `AvatarId`; `LoginAsync` / `SignUpAsync` populate `AvatarId` in responses.
- `FriendshipService` — `GetConnectionsAsync` / `GetRequestsAsync` project `AvatarId` into `FriendDto`.
- `UserRepository.GetLeaderboardAsync` — projects `AvatarId` into `LeaderboardEntryDto`.
- `session.js` `storeUser()` — persists `avatarId` to SecureStore alongside username/email.
- `api.js` `updateProfile()` — forwards `avatarId` to the profile endpoint.
- `UserRow.jsx` — accepts `avatarId` prop; replaces placeholder `<View>` with `<Image source={getAvatar(avatarId)}>`.
- `FriendsTab.jsx` — passes `avatarId` to `UserRow` and `onViewProfile`.
- `ProfilePage.jsx` — shows own avatar from session or viewed user's avatar from route param; `openProfile` forwards `avatarId` as nav param.
- `EditProfilePage.jsx` — loads current `avatarId` from session; renders avatar picker grid (7 options, selected highlighted in blue); saves `avatarId` on profile update.
- `LeaderboardPage.jsx` — passes `avatarId` to each `UserRow`.

### Rationale
- Storing an integer ID (not a URL or binary) is the correct pattern for predefined avatar sets — images are bundled in the app binary, no storage or CDN needed.
- `AvatarId` lives on `User` (not a separate table) because it's a single, always-present profile attribute with no metadata of its own.
- The `getAvatar` fallback to avatar 1 handles both `null` / `undefined` and the legacy `0` default from the migration, keeping the display safe across all existing and new accounts.

> Issue closed after 45 min

---

## Mobile + Backend: Game map API endpoints — 2026-05-10 13:00

### Added
- `Goalz.API/Controllers/Game/MapController.cs` — new controller at `/api/game/map` with three read-only endpoints: `GET /api/game/map/zones`, `GET /api/game/map/boundaries`, `GET /api/game/map/checkpoints`. Returns full `ZoneDto` / `BoundaryDto` / `CheckpointDto` (including geometry) using the existing services — no new repositories or migrations.

### Changed
- `frontend/mobile/pages/MapPage.jsx` — replaced three `/api/dashboard/*` fetch calls with `/api/game/map/*` equivalents. Mobile map rendering no longer depends on the staff dashboard API.
- `frontend/mobile/services/api/partyApi.js` `getCheckpoints()` — migrated from raw `fetch('/api/dashboard/checkpoints')` to `apiFetch('/api/game/map/checkpoints')` with auth headers; consistent with the rest of the party API.

### Rationale
- MapPage was borrowing dashboard endpoints (intended for the staff web app) because the game API lacked geometry-bearing responses. The new `/api/game/map/*` endpoints are the correct mobile-facing surface: authenticated players get map data through the game API, staff manage it through the dashboard API.
- `getCheckpoints()` was the only remaining raw `fetch()` without auth headers or 401 handling in the party API layer.

> Issue closed after 30 min

---

## Mobile: Performance & security hardening — 2026-05-10 13:00

### Changed
- **P1 — GameContext polling** (`context/GameContext.jsx`): interval now skips ticks when the app is in the background (`AppState.currentState !== 'active'`); immediately re-polls on foreground resume via `AppState.addEventListener`. Eliminates wasted requests while the phone screen is off or another app is in focus.
- **P4 — FriendsTab staleness** (`components/FriendsTab.jsx`): added a 30-second stale window via `lastFetchedAt` ref — repeated focus events within the window skip the fetch, preventing duplicate API calls on tab-switch.
- **S4 — MapPage fetch wrapper** (`pages/MapPage.jsx`): replaced three raw `fetch()` calls to `/api/dashboard/*` with `apiFetch()` so 401 responses trigger auto-logout consistently.
- **S3 — Auth guard** (`App.js`): token check on mount (blank screen while SecureStore reads); `onReady` guard resets navigation to Login if no token present and the current route is not Login/SignUp.
- **S2 — iOS ATS** (`app.config.js`): replaced `NSAllowsArbitraryLoads: true` with a localhost-only exception — production HTTPS traffic is now enforced on iOS.
- **S5 — Debug log** (`pages/QuizPage.jsx`): removed unused `onPress={() => console.log('pressed')}` prop.
- **S6 — Unmount cleanup** (`pages/LeaderboardPage.jsx`, `pages/ProfilePage.jsx`, `pages/EditProfilePage.jsx`): added `cancelled` flag to all three `useEffect` data-fetch blocks to prevent stale state updates after unmount.

### Rationale
- Polling without AppState check wastes battery and generates unnecessary backend load when the phone is backgrounded.
- Raw `fetch()` in MapPage silently bypassed the 401 auto-logout path, making it inconsistent with the rest of the codebase and leaving unauthenticated users in a broken state.
- `NSAllowsArbitraryLoads: true` disables Apple ATS globally — any HTTP connection on public WiFi is open to MITM interception.
- FriendsTab was re-fetching on every focus event with no debounce; 30 s staleness window eliminates redundant calls during normal navigation.

> Issue closed after 60 min

---

## Feature: Pending element submission & admin approval flow — 2026-05-07 13:00

### Added
- `Element.cs` — `IsApproved`, `SubmittedBy`, `CreatedAt` properties; migration `AddElementApprovalFields` backfills existing rows with `IsApproved = true` and `CreatedAt = now()`
- `IElementRepository` / `ElementRepository` — `GetAllApprovedAsync`, `GetPendingAsync`, `FindNearbyPendingAsync` (PostGIS `ST_DWithin` 5 m deduplication), `ApproveAsync`, `RejectAsync`
- `IElementService` / `ElementService` — `GetPendingAsync`, `ApproveAsync`, `RejectAsync`; `CreateAsync` now includes deduplication logic (updates existing pending row's `ImageUrl` instead of inserting a duplicate within 5 m with the same type+name); `ICheckpointService` dependency removed — element creation no longer auto-creates checkpoints
- `Game/ElementController` — `POST /api/game/elements` now forces `IsApproved = false` and stamps `SubmittedBy` from the JWT `sub` claim
- `Dashboard/ElementController` — `POST /api/dashboard/elements` forces `IsApproved = true`; new endpoints `GET /elements/pending`, `PUT /elements/{id}/approve`, `PUT /elements/{id}/reject`
- `CheckpointService` — changed orphan-element walk from `GetAllAsync()` to `GetAllApprovedAsync()` so pending elements never appear as map checkpoints
- `MapPage.jsx` — element checkpoints now complete on proximity tap (no photo modal); floating 📷 camera button added for Trailblazer/Explorer roles during game; `ElementModal`, `pendingCpRef`, `elementModal` state, and `useFocusEffect` checkpoint-deferral logic removed
- `ImageUploadScreen.jsx` — success navigation no longer sends `cpCompleted` param (checkpoint completion is no longer tied to photo upload)
- `overviewService.jsx` — `getPendingElements`, `approveElement`, `rejectElement` service methods
- `PendingElements.jsx` — new dashboard page: table of pending submissions with photo thumbnail, name, type, submitter, date, GPS; Approve (green) and Reject (red, with confirm dialog) actions
- `Navbar.jsx` / `Overview.jsx` — "Pending Elements" nav item and route wired up

### Removed
- `ElementModal.jsx` — deleted; element checkpoints no longer require a photo to complete

### Rationale
- Decoupling photo submission from checkpoint completion removes friction for players who don't have time to photograph; volunteers can still contribute element data via the floating camera button
- Admin approval gate ensures only validated element photos appear on the live map
- 5 m deduplication prevents multiple rows from the same physical object when a user retries a submission

> Issue closed after 180 min

---

## Mobile: Camera flow — iOS/Android hardening — 2026-05-07 13:00

### Fixed
- `app.config.js` — added `expo-camera` and `expo-image-picker` config plugins; without these, `NSCameraUsageDescription` was absent from iOS `Info.plist` (crash on camera launch, App Store rejection) and `android.permission.CAMERA` was absent from `AndroidManifest.xml` (permission always denied on Android 13+); also added `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` to `ios.infoPlist` and `android.permission.CAMERA` to `android.permissions`
- `usePhotoGallery.ts` — now calls `getCameraPermissionsAsync()` before requesting; if status is `denied` shows an `Alert` with "Open Settings" deep-link (`Linking.openSettings()`) so the user has a clear path to fix it; returns a typed `TakePhotoResult` (`success | cancelled | denied`) instead of `string | null`
- `Camera.jsx` — handles the new typed result so `denied` and `cancelled` are distinguished; adds a `didRun` ref guard to prevent the camera from re-launching if the component remounts
- `Camera.web.jsx` — added `catch` block to `handleShutter` so a failed `takePictureAsync` shows an in-UI error banner instead of an unhandled crash; uncommented the back button so users can exit the camera without taking a photo
- `ImageUploadScreen.jsx` — moved the success `Alert` to after both the Supabase upload and `submitElement` succeed; previously it fired before the API call, giving a false confirmation when the submission failed
- `supabase.js` — MIME type is now detected from the URI extension (supports HEIC, HEIF, PNG, JPEG) so iOS HEIC uploads are no longer sent with a mismatched `image/jpeg` content type; filename now includes a random 7-char suffix (`photo-{timestamp}-{random}.{ext}`) to prevent concurrent uploads from overwriting each other
- `UserPhoto.jsx`, `ImageUploadScreen.jsx` — replaced hardcoded external Brave CDN URL used as fallback image with a local `require('../assets/icon.png')` to remove the network dependency in the failure state

### Rationale
- Config plugins are the only supported way for managed Expo to inject native permissions — manual `infoPlist` entries alone are insufficient without the plugin registrations
- Returning a typed result from `usePhotoGallery` avoids encoding two different failure modes in a single `null`, making call sites able to give accurate user feedback
- HEIC is the default capture format on iPhone 12+ with HEVC enabled; sending it as `image/jpeg` corrupts the upload
- `Date.now()` filenames with upsert enabled are a silent data-loss bug in multi-user sessions

> Issue closed after 30 min

---

## Mobile: Fix camera task — 2026-05-07

### Fixed
- `usePhotoGallery.ts` — replaced deprecated `ImagePicker.MediaTypeOptions.Images` (removed in expo-image-picker v17) with `mediaTypes: ['images']`; this was silently preventing the camera from opening
- `ElementModal.jsx` — changed `animationType` from `"fade"` to `"none"` to prevent the modal's dismiss animation from blocking `launchCameraAsync` on iOS
- `MapPage.jsx` — passes checkpoint GPS coordinates (`gps: \`${cp.latitude},${cp.longitude}\``) when navigating to the Camera screen so the uploaded element is saved with correct location instead of 0,0

### Rationale
- `MediaTypeOptions` was the root cause — undefined at runtime in expo-image-picker v17, causing `launchCameraAsync` to reject silently
- The modal animation fix prevents a race condition where iOS refuses to present the camera picker while a modal is still mid-dismiss
- GPS was wired through the Camera → UserPhoto → ImageUpload params chain but never populated from MapPage

> Issue closed after 10 min

---

## Seed: Chania Old Town elements and sensors — 2026-05-07 17:00

### Added
- `tools/seed-chania/index.js` — Node.js CLI script that seeds 22 elements (Tree, Monument, Fountain, Garden types) and 8 sensors geocoded to Chania Old Town / Venetian Harbour, Crete
- `tools/seed-chania/package.json` — module manifest with `node-fetch` dependency
- Supports `--url <base>` and `--dry-run` flags; mirrors the `tools/seed-zones` pattern

### Rationale
- The game needed realistic Mediterranean seed data for demo/test purposes
- Coordinates are SRID 4326 WGS84 points, matching `Point(longitude, latitude)` used by the existing Element and Sensor services
- Dry-run mode lets you preview the full data set without hitting the API

> Issue closed after 15 min

---

## Docs: End-user guide and deployment guide — 2026-05-03

### Added
- `docs/user-guide.md` — end-user guide covering both player (Loggin mobile app, all 8 game phases, scoring, badges, leaderboard) and staff (dashboard login, zone management, layer toggles) audiences
- `docs/deployment-guide.md` — deployment guide covering local Docker setup, environment variable reference, database migrations, and production GCP Cloud Run deployment

### Rationale
- No human-facing documentation existed; operators and new players had to piece together setup from README, agent_docs, and PROJECT_DETAILS.md
- Centralising this in `docs/` keeps it alongside existing ADRs and the game flow spec

> Issue closed after 0 min

---

## Mobile: Supabase photo upload + SonarQube gitignore — 2026-04-30

### Added
- `frontend/mobile/services/supabase.js` — uploads captured photos to the private Supabase Storage bucket `Photo` via the REST API; generates a 1-year signed URL after upload and returns it as the accessible `imageUrl`
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` added to `.env.example`
- Success `Alert` shown after photo upload completes ("Photo uploaded!")
- In-button step label ("Uploading photo…" / "Saving element…") shown while submitting

### Changed
- `ImageUploadScreen.jsx` now uploads to Supabase first, then passes the signed URL to `submitElement` instead of the local file URI

### Added
- `backend/Goalz/.sonarqube/` added to `.gitignore`

### Rationale
- Local file URIs (`file:///...`) stored in the database are inaccessible to other users or clients — a signed URL from Supabase Storage provides authenticated, shareable access
- Signed URLs with a 1-year expiry avoid the overhead of re-generating URLs on every view while keeping the bucket private
- Direct fetch/FormData is used instead of the Supabase JS SDK to avoid adding a new package dependency

> Issue closed after 0 min

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

> Issue closed after 0 min

---

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
