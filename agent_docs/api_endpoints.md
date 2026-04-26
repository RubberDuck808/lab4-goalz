# API Endpoints

All endpoints are served by `backend/Goalz/Goalz.API`. See `api_and_auth.md` for route conventions and auth details.

**Auth legend:** `—` = public, `JWT` = Bearer token required, `[anon]` = explicitly public on an otherwise-authorized controller

---

## Dashboard (`/api/dashboard/`)

### POST `/api/dashboard/auth/login`
**Auth:** — | **File:** `Controllers/Dashboard/AuthController.cs`

```
Body:    { email: string, name: string, password: string }
200 OK:  { email: string, name: string, password: string }   (LoginRequest echoed back)
404:     Not Found
```

> Note: `name` field is present in `LoginRequest` but unused for login logic. Returns the DTO object, not a JWT.

---

### GET `/api/dashboard/overview`
**Auth:** — | **File:** `Controllers/Dashboard/OverviewController.cs`

```
200 OK:  { sensors: Sensor[], element: Element[] }
```

Sensors include PostGIS `geo` point. Elements include PostGIS `geom` point, `imageUrl`, `isGreen`.

---

### GET `/api/dashboard/zones`
**Auth:** — | **File:** `Controllers/Dashboard/ZoneController.cs`

```
200 OK:  [{ id: long, name: string, zoneType: string, color: string, boundary: GeoJSON geometry }]
```

---

### POST `/api/dashboard/zones`
**Auth:** — | **File:** `Controllers/Dashboard/ZoneController.cs`

```
Body:    { name: string, zoneType: string, color: string, boundary: GeoJSON geometry }
204:     No Content
400:     "Zone name is required." | "A valid GeoJSON geometry is required."
```

---

### PUT `/api/dashboard/zones/{id}`
**Auth:** — | **File:** `Controllers/Dashboard/ZoneController.cs`

```
Route:   id: long
Body:    { name: string, zoneType: string, color: string, boundary?: GeoJSON geometry }
204:     No Content
400:     "Zone name is required."
404:     Not Found
```

`boundary` is optional — omit to keep the existing geometry.

---

### DELETE `/api/dashboard/zones/{id}`
**Auth:** — | **File:** `Controllers/Dashboard/ZoneController.cs`

```
Route:   id: long
204:     No Content
404:     Not Found
```

---

### POST `/api/dashboard/importdataset`
**Auth:** — | **File:** `Controllers/Dashboard/ImportDatasetController.cs`

```
Body:    multipart/form-data — List<IFormFile> files
200 OK:  [{ columnNames: string[], values: string[][] }, ...]
400:     Bad Request
```

---

## Game — Auth (`/api/game/auth/`)

Both endpoints are rate-limited: **10 requests/min per IP**.

### POST `/api/game/auth/login`
**Auth:** — (rate limited) | **File:** `Controllers/Game/AuthController.cs`

```
Body:    { email: string, password: string }
200 OK:  { token: string, username: string, name: string, email: string, createdAt: datetime }
401:     Unauthorized
```

---

### POST `/api/game/auth/signup`
**Auth:** — (rate limited) | **File:** `Controllers/Game/AuthController.cs`

```
Body:    { username: string, name: string, email: string, password: string }
201 OK:  { token: string, username: string, name: string, email: string }
409:     Conflict (email or username already taken)
```

---

## Game — Friendships (`/api/game/friends/`)

Controller has `[Authorize]` — all endpoints require JWT except `connections/{username}`.

### GET `/api/game/friends/search?q={query}`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
Query:   q: string (min 2 chars, else returns empty array)
200 OK:  [{ username: string }, ...]
```

Excludes the calling user from results.

---

### GET `/api/game/friends/connections/{username}`
**Auth:** [anon] | **File:** `Controllers/Game/FriendshipController.cs`

```
Route:   username: string
200 OK:  [{ friendshipId: long, username: string }, ...]
```

Returns accepted (confirmed) friendships for the given user. Public — no token needed.

---

### GET `/api/game/friends/requests`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
200 OK:  [{ requesterUsername: string, addresseeUsername: string }, ...]
```

Returns **incoming** pending friend requests for the calling user.

---

### POST `/api/game/friends/request`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
Body:    { username: string }   ← target user to send request to
204:     No Content
400:     "cannot_self_add" — tried to add yourself
404:     "user_not_found"
409:     "already_friends" | "request_exists"
```

---

### PUT `/api/game/friends/accept`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
Body:    { username: string }   ← requester's username
204:     No Content
404:     "request_not_found"
409:     "not_pending" — request exists but isn't in Pending state
```

---

### DELETE `/api/game/friends/decline`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
Body:    { username: string }   ← requester's username
204:     No Content
404:     "request_not_found"
```

---

### DELETE `/api/game/friends/connection`
**Auth:** JWT | **File:** `Controllers/Game/FriendshipController.cs`

```
Body:    { username: string }   ← friend's username
204:     No Content
404:     "user_not_found" | "not_friends"
```

---

## Quick Reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/dashboard/auth/login` | — | Dashboard login |
| GET | `/api/dashboard/overview` | — | Sensor + element map data |
| POST | `/api/dashboard/importdataset` | — | Upload dataset files |
| GET | `/api/dashboard/zones` | — | List all zones |
| POST | `/api/dashboard/zones` | — | Create zone |
| PUT | `/api/dashboard/zones/{id}` | — | Update zone name/type/color/boundary |
| DELETE | `/api/dashboard/zones/{id}` | — | Delete zone |
| POST | `/api/game/auth/login` | — RL | Player login → JWT |
| POST | `/api/game/auth/signup` | — RL | Player registration → JWT |
| GET | `/api/game/friends/search` | JWT | Search users by username |
| GET | `/api/game/friends/connections/{username}` | — | Get user's friend list |
| GET | `/api/game/friends/requests` | JWT | Get incoming friend requests |
| POST | `/api/game/friends/request` | JWT | Send friend request |
| PUT | `/api/game/friends/accept` | JWT | Accept friend request |
| DELETE | `/api/game/friends/decline` | JWT | Decline friend request |
| DELETE | `/api/game/friends/connection` | JWT | Remove friend |

`—` = public, `RL` = rate limited (10/min), `JWT` = Bearer token required
