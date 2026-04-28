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