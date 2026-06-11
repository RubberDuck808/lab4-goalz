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

## Game — Map (`/api/game/map/`)

No auth required.

### GET `/api/game/map/zones`
**Auth:** — | **File:** `Controllers/Game/MapController.cs`

```
200 OK:  [{ id: long, name: string, color: string, boundaryId: long?, boundary: GeoJSON geometry }]
```

---

### GET `/api/game/map/boundaries`
**Auth:** — | **File:** `Controllers/Game/MapController.cs`

```
200 OK:  [{ id: long, name: string, color: string, boundary: GeoJSON geometry }]
```

---

### GET `/api/game/map/checkpoints`
**Auth:** — | **File:** `Controllers/Game/MapController.cs`

```
200 OK:  [{ id: long, type: string, referenceId: long?, zoneId: long?, latitude: float, longitude: float, elementTypeId: int?, isGreen: bool?, name: string }]
```

`type` is `"sensor"` or `"element"`. For sensors, `referenceId` is the sensor ID.

---

## Game — Sensors (`/api/game/sensors/`)

### GET `/api/game/sensors/{id}/data`
**Auth:** — | **File:** `Controllers/Game/SensorDataController.cs`

```
Route:   id: long (sensor ID)
200 OK:  [{ id: long, light: long, humidity: long, temp: double, timestamp: datetime }]
```

Returns all readings for a sensor, ordered newest-first.

---

## Game — Quiz (`/api/game/quiz/`)

Controller has `[Authorize]` — both endpoints require JWT.

### GET `/api/game/quiz/question`
**Auth:** JWT | **File:** `Controllers/Game/QuizController.cs`

```
200 OK:  { id: long, text: string, answers: [{ id: long, text: string }] }
404:     No questions in DB
```

Answers are shuffled randomly on each call. `isCorrect` is **not** included — use `POST /answer` to verify.

---

### POST `/api/game/quiz/answer`
**Auth:** JWT | **File:** `Controllers/Game/QuizController.cs`

```
Body:    { questionId: long, answerId: long }
200 OK:  { correct: bool, points: int }
404:     Question/answer not found
```

Server-side answer verification. Returns 100 points for a correct answer, 0 for incorrect.

---

## Game — Party (`/api/game/party/`)

Controller has `[Authorize]` and rate limiting ("party" policy).

### POST `/api/game/party/create`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Body:    { name: string, groupSize?: int, boundaryId?: long, zoneCount?: int, checkpointsPerZone?: int, allowedRoles?: string[] }
200 OK:  { id: long, name: string, code: long, members: [] }
```

---

### POST `/api/game/party/join`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Body:    { code: long }
200 OK:  { id: long, name: string, code: long, members: [string, ...] }
404:     Not Found
```

---

### GET `/api/game/party/{id}/lobby`
**Auth:** JWT | **File:** `Controllers/Game/LobbyController.cs`

```
Route:   id: long
200 OK:  { partyId: long, partyName: string, members: [string, ...], code: long, isReady: bool }
```

---

### POST `/api/game/party/{id}/start`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Route:   id: long
200 OK:  (no body)
```

Sets status to `"InGame"` and assigns roles to all members.

---

### GET `/api/game/party/{id}/state`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Route:   id: long
200 OK:  { status: string, members: [{ username: string, role: string }], visitedCheckpointIds: long[],
           groupSize?: int, boundaryId?: long, zoneCount?: int, checkpointsPerZone?: int, allowedRoles: string[] }
```

Polled every 3 s by the mobile client during party games.

---

### POST `/api/game/party/{id}/visit`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Route:   id: long
Body:    { checkpointId: long }
200 OK:  (no body)
```

Records a single checkpoint visit. **Not called by the mobile client** — it batches visits and submits them at game end via `/complete`.

---

### POST `/api/game/party/{id}/complete`
**Auth:** JWT | **File:** `Controllers/Game/PartyController.cs`

```
Route:   id: long
Body:    { checkpointIds: long[], quizScore: int }
200 OK:  (no body)
```

Marks party `"Completed"`, batch-inserts visited checkpoints, updates `UserStatistics` and `PartyMember.Score` for the submitting player.

---

## Game — Leaderboard (`/api/game/leaderboard`)

### GET `/api/game/leaderboard`
**Auth:** — | **File:** `Controllers/Game/LeaderboardController.cs`

```
200 OK:  [{ rank: int, username: string, totalPoints: long, avatarId: int? }]
```

Top 50 players ordered by `totalPoints` descending.

---

## Game — Elements (`/api/game/elements/`)

Controller has `[Authorize]` — all endpoints require JWT except `types`.

### GET `/api/game/elements/types`
**Auth:** — | **File:** `Controllers/Game/ElementController.cs`

```
200 OK:  [{ id: int, name: string }, ...]
```

---

### POST `/api/game/elements`
**Auth:** JWT | **File:** `Controllers/Game/ElementController.cs`

```
Body:    { elementName: string, elementType: string, latitude: float, longitude: float, imageUrl: string, isGreen: bool }
201:     Created — element object
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
| GET | `/api/game/map/zones` | — | All zones with GeoJSON boundary |
| GET | `/api/game/map/boundaries` | — | All boundaries with GeoJSON boundary |
| GET | `/api/game/map/checkpoints` | — | All checkpoints (sensor + element) |
| GET | `/api/game/sensors/{id}/data` | — | Sensor readings for a sensor |
| GET | `/api/game/quiz/question` | JWT | Random quiz question (no isCorrect) |
| POST | `/api/game/quiz/answer` | JWT | Submit answer → server returns correct + points |
| POST | `/api/game/party/create` | JWT | Create party |
| POST | `/api/game/party/join` | JWT | Join party by code |
| GET | `/api/game/party/{id}/lobby` | JWT | Lobby state |
| POST | `/api/game/party/{id}/start` | JWT | Start game, assign roles |
| GET | `/api/game/party/{id}/state` | JWT | Polled game state |
| POST | `/api/game/party/{id}/visit` | JWT | Record single checkpoint visit (unused by client) |
| POST | `/api/game/party/{id}/complete` | JWT | End game, batch-submit checkpoints + score |
| GET | `/api/game/leaderboard` | — | Top 50 players by total points |
| GET | `/api/game/friends/search` | JWT | Search users by username |
| GET | `/api/game/friends/connections/{username}` | — | Get user's friend list |
| GET | `/api/game/friends/requests` | JWT | Get incoming friend requests |
| POST | `/api/game/friends/request` | JWT | Send friend request |
| PUT | `/api/game/friends/accept` | JWT | Accept friend request |
| DELETE | `/api/game/friends/decline` | JWT | Decline friend request |
| DELETE | `/api/game/friends/connection` | JWT | Remove friend |
| GET | `/api/game/elements/types` | — | List element types |
| POST | `/api/game/elements` | JWT | Submit a new element |

`—` = public, `RL` = rate limited (10/min), `JWT` = Bearer token required
