# Goalz - Changelog

## Table of Contents

1. [Dashboard JWT Login](#dashboard-jwt-login--2026-04-28)
2. [Admin User Management](#56admin-user-management--2026-04-28)
3. [#55 SonarQube CI Stage](#55-sonarqube-ci-stage--2026-04-28)
4. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)

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