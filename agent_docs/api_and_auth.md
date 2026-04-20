# API & Authentication

## Route Organization

All routes use one of two prefixes:

- `api/game/*` — player-facing (mobile/web). Auth via JWT Bearer.
- `api/dashboard/*` — staff/admin. Separate session-based auth (no JWT).

**Game controllers** hardcode their full route: `[Route("api/game/friends")]`

**Dashboard controllers** use the `[controller]` token: `[Route("api/dashboard/[controller]")]`
(e.g. `OverviewController` → `/api/dashboard/overview`)

## JWT — Getting the Current User

`Program.cs` clears ASP.NET's default inbound claim map (`JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear()`) and sets `NameClaimType = JwtRegisteredClaimNames.Sub`.

```csharp
// In any [Authorize] controller — this is the correct pattern:
string username = User.Identity!.Name!;  // reads the "sub" claim

// DO NOT use this — the default mapping is disabled, this will be null:
// User.FindFirst(ClaimTypes.NameIdentifier)
```

The `sub` claim contains the **username** (not a numeric ID). See `FriendshipController.cs:22` for the `CurrentUsername` property pattern.

## JWT Config

- Secret: `Jwt:Secret` in config → env var `Jwt__Secret` in Docker
- Minimum 32 characters — startup throws `InvalidOperationException` if missing (see `Program.cs:37-38`)
- Token expiry: 30 days
- `IJwtService` is registered as **Singleton** — keep it that way (it holds no state)

## Rate Limiting

Auth endpoints are rate-limited to 10 requests/minute per IP:
- `POST /api/game/auth/login`
- `POST /api/game/auth/signup`

The policy name is `"auth"`. Apply it with `[EnableRateLimiting("auth")]`.

## Dashboard Auth

Dashboard login (`POST /api/dashboard/auth/login`) takes `LoginRequest { Email, Password }` and returns the same DTO — it does **not** issue a JWT. The dashboard controllers currently have **no `[Authorize]` attribute** — enforcement is incomplete.
