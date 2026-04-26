# Test Coverage — Traceability Matrix

Maps every user story (US EP 1.1 – EP 3.3) to the test files and scenarios
that exercise it. Three test layers:

| Symbol | Layer | Tooling | Location |
|--------|-------|---------|----------|
| **U** | Unit | MSTest + Moq | `backend/Goalz/Goalz.Test/Unit/` |
| **I** | Integration (BDD) | Cucumber / REST Assured | `tests/integration/` |
| **E** | E2E | Cypress | `frontend/dashboard/cypress/` |

---

## Epic 1 — Navigation & Exploration

### US EP 1.1 — Achievement Metric (account creation, login, friends)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| New player signs up with valid credentials | **I** | `ep1/navigation_exploration.feature:19` | 201 + JWT token + username |
| Returning player logs in successfully | **I** | `ep1/navigation_exploration.feature:26` | 200 + JWT token |
| Login fails with incorrect password | **I** | `ep1/navigation_exploration.feature:33` | 401 |
| Login fails for unknown email | **I** | `ep1/navigation_exploration.feature:39` | 401 |
| Signup fails when email is already registered | **I** | `ep1/navigation_exploration.feature:44` | 409 |
| Signup fails when username is already taken | **I** | `ep1/navigation_exploration.feature:50` | 409 |
| `LoginAsync` — valid credentials return token | **U** | `UserServiceTests.cs` | JWT non-null |
| `LoginAsync` — user not found | **U** | `UserServiceTests.cs` | null returned |
| `LoginAsync` — wrong password | **U** | `UserServiceTests.cs` | null returned |
| `SignUpAsync` — password is hashed before persist | **U** | `UserServiceTests.cs` | BCrypt.Verify |
| `SignUpAsync` — role defaults to Player | **U** | `UserServiceTests.cs` | role == "Player" |
| `CheckAuth` valid / wrong password / not found | **U** | `AuthServiceTests.cs` | all 4 paths |
| `CreateStaffUserAsync` — admin creates user | **U** | `AuthServiceTests.cs` | role == "Staff" |
| `CreateStaffUserAsync` — non-admin rejected | **U** | `AuthServiceTests.cs` | error returned |
| Dashboard login with valid credentials | **I** | `ep1/navigation_exploration.feature:222` | 200 + email + role |
| Dashboard login with wrong password | **I** | `ep1/navigation_exploration.feature:229` | 404 |
| Admin creates staff account | **I** | `ep1/navigation_exploration.feature:235` | 201 |
| Non-admin cannot create staff account | **I** | `ep1/navigation_exploration.feature:241` | 401 |
| Creating staff account fails for duplicate email | **I** | `ep1/navigation_exploration.feature:246` | 409 |
| Dashboard login → redirects to /overview | **E** | `cypress/e2e/login.cy.ts` | `cy.url` includes /overview |
| Invalid credentials → error message shown | **E** | `cypress/e2e/login.cy.ts` | error div visible |
| Empty fields → validation error | **E** | `cypress/e2e/login.cy.ts` | error div visible |
| Admin sees Create Staff User form | **E** | `cypress/e2e/settings.cy.ts` | form visible |
| Non-admin sees restricted message | **E** | `cypress/e2e/settings.cy.ts` | message visible |
| Create staff → success message | **E** | `cypress/e2e/settings.cy.ts` | success text |
| Create staff → duplicate email error | **E** | `cypress/e2e/settings.cy.ts` | error text |
| Player searches for another user | **I** | `ep1/navigation_exploration.feature:57` | 200 + user found |
| Search < 2 chars returns empty | **I** | `ep1/navigation_exploration.feature:65` | 200 + array |
| Player views public connections | **I** | `ep1/navigation_exploration.feature:72` | 200 + array |
| Player sends friend request | **I** | `ep1/navigation_exploration.feature:78` | 204 |
| Self friend request rejected | **I** | `ep1/navigation_exploration.feature:84` | 400 |
| Duplicate friend request returns conflict | **I** | `ep1/navigation_exploration.feature:90` | 409 |
| Player accepts friend request | **I** | `ep1/navigation_exploration.feature:97` | 204 |
| Accept non-existent request returns 404 | **I** | `ep1/navigation_exploration.feature:104` | 404 |
| Player declines friend request | **I** | `ep1/navigation_exploration.feature:111` | 204 |
| Player views incoming requests | **I** | `ep1/navigation_exploration.feature:118` | 200 + array |
| Player removes connection | **I** | `ep1/navigation_exploration.feature:127` | 204 |
| Remove non-existent connection returns 404 | **I** | `ep1/navigation_exploration.feature:137` | 404 |
| `SendRequest` — cannot self-add | **U** | `FriendshipServiceTests.cs` | error == "cannot_self_add" |
| `SendRequest` — user not found | **U** | `FriendshipServiceTests.cs` | error == "user_not_found" |
| `SendRequest` — already friends | **U** | `FriendshipServiceTests.cs` | error == "already_friends" |
| `SendRequest` — duplicate request | **U** | `FriendshipServiceTests.cs` | error == "request_exists" |
| `AcceptRequest` — success + FK IDs | **U** | `FriendshipServiceTests.cs` | status updated |
| `DeclineRequest` — removes pending | **U** | `FriendshipServiceTests.cs` | request removed |
| `RemoveConnection` — removes friendship | **U** | `FriendshipServiceTests.cs` | deleted |

---

### US EP 1.2 — Route Navigation (party management, lobby)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Party owner creates a new party | **I** | `ep1/navigation_exploration.feature:148` | 200 + code 100000–999999 |
| Player retrieves party details by ID | **I** | `ep1/navigation_exploration.feature:154` | 200 + name + code |
| Player joins seeded party (code 654321) | **I** | `ep1/navigation_exploration.feature:163` | 200 + id |
| Joining with invalid code returns 404 | **I** | `ep1/navigation_exploration.feature:169` | 404 |
| Joining without auth returns 401 | **I** | `ep1/navigation_exploration.feature:175` | 401 |
| Player views live lobby (WIP) | **I** | `ep1/navigation_exploration.feature:180` | 200 |
| `CreateParty` — returns response | **U** | `PartyServiceTests.cs` | non-null response |
| `CreateParty` — creates exactly 4 groups | **U** | `PartyServiceTests.cs` | groups == Team A–D |
| `CreateParty` — calls SaveChanges twice | **U** | `PartyServiceTests.cs` | Times(2) |
| `GetParty` — found / not found | **U** | `PartyServiceTests.cs` | null vs throws |
| `JoinParty` — valid / invalid code / no user / no group | **U** | `PartyServiceTests.cs` | all paths |
| Dashboard nav — all 5 items visible | **E** | `cypress/e2e/navigation.cy.ts` | all nav items |
| Clicking "Arboretum Map" shows map section | **E** | `cypress/e2e/navigation.cy.ts` | map title |
| Staff creates zone | **I** | `ep1/navigation_exploration.feature:250` | 204 |
| Staff retrieves all zones | **I** | `ep1/navigation_exploration.feature:255` | 200 + array |
| Staff updates zone | **I** | `ep1/navigation_exploration.feature:261` | 204 |
| Staff deletes zone | **I** | `ep1/navigation_exploration.feature:268` | 204 |
| Zone creation with invalid type returns 400 | **I** | `ep1/navigation_exploration.feature:274` | 400 |
| Zone creation with blank name returns 400 | **I** | `ep1/navigation_exploration.feature:279` | 400 |
| `ZoneService.CreateAsync` — valid / invalid type / empty name | **U** | `ZoneServiceTests.cs` | all paths |
| `ZoneService.UpdateAsync` — boundary replace vs keep | **U** | `ZoneServiceTests.cs` | boundary logic |
| `ZoneService.DeleteAsync` — found / not found | **U** | `ZoneServiceTests.cs` | both paths |

---

### US EP 1.3 — Landscape Photo Capture (nature elements as trailblazer targets)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Staff retrieves all element types | **I** | `ep1/navigation_exploration.feature:190` | 200 + array |
| Staff creates a nature element | **I** | `ep1/navigation_exploration.feature:196` | 201 + sensor ID |
| Staff updates a trailblazer element | **I** | `ep1/navigation_exploration.feature:202` | 204 |
| Staff deletes a trailblazer element | **I** | `ep1/navigation_exploration.feature:208` | 204 |
| Deleting non-existent element returns 404 | **I** | `ep1/navigation_exploration.feature:214` | 404 |
| `ElementService.CreateAsync` — existing type reused | **U** | `ElementServiceTests.cs` | no new type insert |
| `ElementService.CreateAsync` — new type created | **U** | `ElementServiceTests.cs` | new type inserted |
| `ElementService.CreateAsync` — null ImageUrl → empty | **U** | `ElementServiceTests.cs` | empty string |
| `ElementService.UpdateAsync` — updates all fields | **U** | `ElementServiceTests.cs` | all fields set |
| `ElementService.DeleteAsync` — found / not found | **U** | `ElementServiceTests.cs` | both paths |

---

## Epic 2 — Gamification & Competition

### US EP 2.1 — Handling Pressure (quiz under time pressure)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Player answers quiz question within time limit (WIP) | **I** | `ep2/gamification_competition.feature:38` | 200 + points |

> Endpoint not yet implemented (`POST /api/game/quiz/answer`). Tagged `@WIP`.

---

### US EP 2.2 — Educational Experience (hint fragments)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Quiz section displays hint-linked questions (WIP) | **I** | `ep2/gamification_competition.feature:46` | 200 + hints |

> Endpoint not yet implemented (`GET /api/game/quiz/{sectionId}`). Tagged `@WIP`.

---

### US EP 2.3 — Points for Data Collection (scout sensor contribution)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Scout collects sensor hint fragment (WIP) | **I** | `ep2/gamification_competition.feature:54` | 200 + progress |

> Endpoint not yet implemented (`POST /api/game/sensor/{id}/collect`). Tagged `@WIP`.

---

### US EP 2.4 — Leaderboard (dashboard overview)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Dashboard overview returns sensors and elements | **I** | `ep2/gamification_competition.feature:28` | 200 + lists |
| `OverviewService.GetDashboardData` — populated data | **U** | `OverviewServiceTests.cs` | non-null lists |
| `OverviewService.GetDashboardData` — each repo called once | **U** | `OverviewServiceTests.cs` | Times(1) |
| Overview page renders all four chart titles | **E** | `cypress/e2e/overview.cy.ts` | 4 chart titles |
| Overview page shows correct element count | **E** | `cypress/e2e/overview.cy.ts` | "15 Elements" |
| Overview page shows correct sensor count | **E** | `cypress/e2e/overview.cy.ts` | "4 Sensors" |
| Overview page shows green percentage | **E** | `cypress/e2e/overview.cy.ts` | "67% Green" |
| Overview page shows canopy percentage | **E** | `cypress/e2e/overview.cy.ts` | "20% Canopy" |

---

### US EP 2.5 — Team Competition (party with groups)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Creating a party generates four groups | **I** | `ep2/gamification_competition.feature:36` | 200 + 4 groups |
| `CreateParty` — 4 groups named Team A–D | **U** | `PartyServiceTests.cs` | exact group names |

---

### US EP 2.6 — Team Leaderboard (session scores)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Team leaderboard after session ends (WIP) | **I** | `ep2/gamification_competition.feature:62` | 200 + array |

> Endpoint not yet implemented (`GET /api/game/party/{id}/leaderboard`). Tagged `@WIP`.

---

### US EP 2.7 — Points from Multiple Activities (quiz + speed)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Group score reflects correctness + speed (WIP) | **I** | `ep2/gamification_competition.feature:70` | points |
| Streak bonus applied for consecutive correct answers (WIP) | **I** | `ep2/gamification_competition.feature:77` | multiplier |

> Endpoints not yet implemented. Tagged `@WIP`.

---

## Epic 3 — Sensor Integration

### US EP 3.1 — Automatic Sensor Data Collection

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Scout interacts with sensor — hint recorded (WIP) | **I** | `ep3/sensor_integration.feature:56` | hint + progress |

> Endpoint not yet implemented (`POST /api/game/session/sensor/{id}/interact`). Tagged `@WIP`.

---

### US EP 3.2 — Sensor Detection (proximity query)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| App retrieves sensors within radius (WIP) | **I** | `ep3/sensor_integration.feature:64` | filtered list |

> Endpoint not yet implemented (`GET /api/game/sensors/nearby`). Tagged `@WIP`.

---

### US EP 3.3 — Sensor Data Upload (sensor CRUD + dataset import)

| Scenario | Layer | File | Key assertion |
|----------|-------|------|---------------|
| Staff creates a sensor | **I** | `ep3/sensor_integration.feature:20` | 201 + ID + name |
| Staff updates a sensor | **I** | `ep3/sensor_integration.feature:27` | 204 |
| Staff deletes a sensor | **I** | `ep3/sensor_integration.feature:33` | 204 |
| Delete non-existent sensor returns 404 | **I** | `ep3/sensor_integration.feature:39` | 404 |
| Staff stores structured dataset | **I** | `ep3/sensor_integration.feature:45` | 200 + confirmed |
| Staff stores raw CSV payload | **I** | `ep3/sensor_integration.feature:52` | 200 + confirmed |
| `SensorService.CreateAsync` — coordinates + SRID | **U** | `SensorServiceTests.cs` | X/Y, SRID=4326 |
| `SensorService.UpdateAsync` — fields updated / SRID preserved | **U** | `SensorServiceTests.cs` | all fields |
| `SensorService.DeleteAsync` — found / not found | **U** | `SensorServiceTests.cs` | both paths |

---

## Coverage Summary

| User Story | Unit | Integration | E2E | Overall |
|------------|:----:|:-----------:|:---:|:-------:|
| US EP 1.1 — Achievement Metric | ✅ | ✅ | ✅ | **Full** |
| US EP 1.2 — Route Navigation | ✅ | ✅ | ✅ | **Full** |
| US EP 1.3 — Landscape Photo Capture | ✅ | ✅ | — | **Unit + API** |
| US EP 2.1 — Handling Pressure | — | ⏳ WIP | — | **Pending** |
| US EP 2.2 — Educational Experience | — | ⏳ WIP | — | **Pending** |
| US EP 2.3 — Points for Data Collection | — | ⏳ WIP | — | **Pending** |
| US EP 2.4 — Leaderboard | ✅ | ✅ | ✅ | **Full** |
| US EP 2.5 — Team Competition | ✅ | ✅ | — | **Unit + API** |
| US EP 2.6 — Team Leaderboard | — | ⏳ WIP | — | **Pending** |
| US EP 2.7 — Points from Multiple Activities | — | ⏳ WIP | — | **Pending** |
| US EP 3.1 — Automatic Sensor Data Collection | — | ⏳ WIP | — | **Pending** |
| US EP 3.2 — Sensor Detection | — | ⏳ WIP | — | **Pending** |
| US EP 3.3 — Sensor Data Upload | ✅ | ✅ | — | **Unit + API** |

**⏳ WIP** = scenario exists in feature file and will pass once the backend endpoint is implemented.
