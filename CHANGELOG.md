# Goalz - Changelog

## Table of Contents

1. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)
2. [#50 Test Suite — Step 2: C# Unit Tests](#50-test-suite--2026-04-26)

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

## [#50] Test Suite — 2026-04-26 (ongoing)
### [#52] Step 2: C# Unit Tests — 2026-04-26 Added
- Added `Moq 4.20.72` to `Goalz.Test/Goalz.Test.csproj`
- Created `Goalz.Test/Unit/` directory with 8 MSTest test classes, one per service:
  - `UserServiceTests.cs` — 8 tests: `LoginAsync` (valid creds, user not found, wrong password, empty password), `SignUpAsync` (new user with token, email taken, username taken, password is hashed before persist, role defaults to Player)
  - `AuthServiceTests.cs` — 9 tests: `CheckAuth` (valid, user not found, wrong password, empty password, admin role in response), `CreateStaffUserAsync` (admin creates user, staff requester rejected, admin email not found, email already taken, password hashed, role set to Staff)
  - `PartyServiceTests.cs` — 9 tests: `CreateParty` (returns response, creates 4 groups named Team A–D, calls SaveChanges twice), `GetParty` (found, not found throws), `JoinParty` (valid, invalid code, user not found, group not found, member created with correct IDs)
  - `FriendshipServiceTests.cs` — 18 tests: all 6 methods; all error codes (`cannot_self_add`, `user_not_found`, `already_friends`, `request_exists`, `request_not_found`, `not_pending`, `not_friends`) individually asserted; correct FK IDs verified via `Callback`
  - `ZoneServiceTests.cs` — 14 tests: `GetAllAsync` (populated, empty, boundary pass-through), `CreateAsync` (valid, empty name, invalid type, all 3 valid types via `[DataRow]`, null boundary), `UpdateAsync` (valid, not found, empty name, invalid type, new boundary replaces, null boundary keeps existing), `DeleteAsync` (found, not found)
  - `SensorServiceTests.cs` — 8 tests: `CreateAsync` (returns repo result, coordinates correct, SRID=4326, name preserved), `UpdateAsync` (updates fields, not found, SRID preserved), `DeleteAsync` (success, not found, correct ID passed)
  - `ElementServiceTests.cs` — 10 tests: `CreateAsync` (existing type reused, new type created, coordinates correct, null ImageUrl → empty string, provided ImageUrl preserved), `UpdateAsync` (updates all fields, not found, missing type is created), `DeleteAsync` (success, not found, correct ID)
  - `OverviewServiceTests.cs` — 5 tests: `GetDashboardData` (populated, empty, sensor repo called once, element repo called once, data pass-through via `Assert.AreSame`)
- All tests are isolated — no database access; all dependencies mocked with `Moq`
- Naming convention: `MethodName_StateUnderTest_ExpectedBehavior`

### Rationale
- MSTest chosen to stay consistent with the existing `Goalz.Test` project (which already uses `MSTest 3.6.4`)
- `Moq` added as the only new dependency — no new test project needed, tests live in `Goalz.Test/Unit/` alongside the existing integration-style tests
- `Callback<T>` used to capture arguments passed to mocked repository methods, allowing assertion on the exact object the service builds — this verifies business logic (hashing, SRID, FK mapping) without needing a real database

> Issue in progress — Step 2 of 6 complete

---