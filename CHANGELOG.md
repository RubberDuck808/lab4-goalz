# Goalz - Changelog

## Table of Contents

1. [#48 Picture Upload Flow](#48-picture-upload-flow--2026-04-27--2026-04-28)
2. [#30 GetLobbyMembers](#30-getlobbymembers--2026-04-24)

---

## [#48] Picture Upload Flow — 2026-04-27 – 2026-04-28

### Added

**Screens (Figma → code)**
- `pages/Camera.jsx` — dark viewfinder placeholder (Figma node 234-2085): rule-of-thirds grid, top bar with ← Back, blue sensor tag pill, sensor data strip, shutter button; safe-area-aware layout via `useSafeAreaInsets`
- `pages/Camera.web.jsx` — web-specific override; live webcam feed via `expo-camera` `CameraView` (`getUserMedia`), permission prompt, shutter calls `takePictureAsync()` and passes URI to `UserPhoto`; Metro serves this automatically on web instead of `Camera.jsx`
- `pages/UserPhoto.jsx` — full-bleed photo review (Figma node 234-2087): NEXT button (green) → `ImageUpload`, RETRY button (red) → `Camera`; beech-tree placeholder image when no real URI is passed
- `pages/ImageUploadScreen.jsx` — metadata input form (Figma node 198-1812):
  - Centered image preview (210×294) with placeholder fallback
  - Element type dropdown (Tree / Shrub / Bush) rendered as an absolutely positioned overlay so it floats above the form without shifting the Upload button
  - Free-text species name input + CLEAR button
  - UPLOAD button active only when all three are present (image, type, species); shows `ActivityIndicator` during submission and an error message on failure
  - Navigates to `Map` on success
- `pages/MapPage.web.jsx` — web stub replacing `react-native-maps` (native-only) so the web bundler doesn't crash

**Hooks & services**
- `src/hooks/usePhotoGallery.ts` — rewritten from Capacitor to Expo: requests camera permission, calls `ImagePicker.launchCameraAsync()`, returns URI or `null`
- `src/hooks/Tab2.tsx` — converted from Ionic React to React Native; floating action button calls `takePhoto()` then navigates to `Camera`
- `services/api/api.js` — `submitElement()`: `POST /api/dashboard/elements` with `{ elementName, elementType, latitude, longitude, imageUrl, isGreen }`

**Navigation**
- `App.js` — registered `Camera`, `UserPhoto`, `ImageUpload` screens

### Fixed

**Backend**
- `Program.cs` — removed duplicate `app.UseCors()` call; moved remaining call before `UseHttpsRedirection` so CORS preflight responses are not swallowed by the 307 redirect
- `appsettings.json` — extended `Jwt:Secret` from 27 to 34 characters (`JwtService` enforces a 32-char minimum; the too-short secret caused a 500 on every login)

**Frontend**
- `.env` — corrected `EXPO_PUBLIC_API_BASE_URL` from `172.20.10.2:8081` (Expo bundler IP) to `http://localhost:5049` (actual API port from `launchSettings.json`)

### Rationale
- `Camera.web.jsx` / `MapPage.web.jsx` use Metro's platform-extension resolution so native and web builds each get the right implementation without conditional imports
- Dropdown uses `position: absolute` so expanding it does not affect the scroll-flow height and the Upload button stays visible
- `isGreen` hardcoded to `true` — all user-submitted plants qualify; can be made configurable later
- Placeholder image passed through the full `Camera → UserPhoto → ImageUpload` chain so the upload button can be activated and the flow tested end-to-end without a real camera

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
