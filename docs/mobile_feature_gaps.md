# Mobile App — Feature Gap Analysis

Audit of `frontend/mobile` against the implemented game flow and expected product scope.
Screens reviewed: all 23 registered routes. Components reviewed: all in `components/`.

---

## Table of Contents

1. [Badges / Achievements](#1-badges--achievements)
2. [Photo Upload UX](#2-photo-upload-ux)
3. [Game History & Replays](#3-game-history--replays)
4. [Onboarding / Tutorial](#4-onboarding--tutorial)
5. [Offline & Low-Connectivity Handling](#5-offline--low-connectivity-handling)
6. [Push Notifications](#6-push-notifications)
7. [Dark Mode / Theme Support](#7-dark-mode--theme-support)
8. [Social Sharing](#8-social-sharing)
9. [Map Enhancements](#9-map-enhancements)
10. [Account Security](#10-account-security)
11. [Accessibility](#11-accessibility)
12. [Admin / Staff Features](#12-admin--staff-features)
14. [Partially Wired (UI Exists, Logic Missing)](#partially-wired-ui-exists-logic-missing)

---

## 1. Badges / Achievements

**Status:** Implemented — 4 badges, computed client-side from stats.

`frontend/mobile/utils/badges.js` defines `BADGES` (`first_steps`, `trail_blazer`, `nut_hoarder`, `party_animal`) and `computeBadges(stats)`, which checks `GET /api/game/users/stats`'s `badges` array (backed by `BadgeService.cs` + `UserBadge` entity). `ProfilePage.jsx` uses `computeBadges` to render earned state.

**Still missing:**
- More badge criteria beyond the 4 existing ones (e.g. all roles used, perfect quiz score, zone-count milestones)
- Unlock animation when a badge is earned
- Notification of new badge after game completion

---

## 2. Photo Upload UX

**Status:** Core flow works; several UX gaps remain.

`ImageUploadScreen.jsx` uploads to Supabase and submits element metadata. The flow is functional but raw.

**Missing:**
- **Image crop / rotate** before upload — users cannot adjust framing after the camera captures
- **Species autocomplete** — free-text field with no suggestions; typos produce inconsistent data
- **Geolocation preview** — GPS coordinates are shown as a raw string (`lat,lon`), not a map pin
- **Upload retry** — if Supabase upload fails mid-way there is no retry without restarting the whole flow; error is displayed but state is reset
- **Progress indicator** — the two-step upload (Supabase → API) shows text labels but no progress bar

---

## 3. Game History & Replays

**Status:** Not started.

After `completeGame()` the receipt screen shows a summary for that session only. Once the user navigates to Home, the data is gone.

**Missing:**
- Past games list on Profile (date, score, zones visited, role played)
- Detailed game replay: which checkpoints were visited, quiz results per zone
- Personal best tracking (highest score, fastest completion)
- `StatisticsCard` on Profile currently calls `getUserStats()` but the data shape has no historical breakdown

---

## 4. Onboarding / Tutorial

**Status:** Not started.

First-time users land directly on Login with no context about what Goalz is or how the game works.

**Missing:**
- Welcome / intro carousel (shown once on first login)
- In-map overlay explaining the Visit button, proximity radius, and zone colours
- Role explanation screen before or during `YourRolePage` (Scout = sensors, Trailblazer = elements, Explorer = both)
- Help button accessible from the Map HUD

---

## 5. Offline & Low-Connectivity Handling

**Status:** Not started.

Every operation (map tiles, zone data, checkpoint data, quiz questions, element upload) requires a live network connection. There is no queuing, caching, or graceful degradation.

**Missing:**
- Cache zone and checkpoint data after first load so the map is usable without a connection
- Queue element uploads when offline; submit when connectivity returns
- Show a connectivity banner when the device goes offline mid-game
- Map tile caching (the app uses live CartoDB tiles with no offline fallback)
- SignalR reconnection already exists but there is no user-visible status

---

## 6. Push Notifications

**Status:** Not started.

There is no notification infrastructure in the app.

**Missing:**
- Friend request received notification
- Party invite notification ("Oscar invited you to join Party XYZ")
- Game started notification (for players in lobby on a different screen)
- Badge unlocked notification
- Expo Notifications (`expo-notifications`) is not in `package.json`

---

## 7. Dark Mode / Theme Support

**Status:** Not started.

`SettingsPage.jsx` has a font-size section (via `AccessibilityContext`) but no theme toggle. All colours are hardcoded in `StyleSheet.create` blocks.

**Missing:**
- System-level dark mode detection (`useColorScheme`)
- Dark theme colour tokens
- Theme context / provider
- Theme toggle in Settings

---

## 8. Social Sharing

**Status:** Partially implemented (party code only).

`PartyOwnerPage.jsx` uses the native Share API to share the party code. There is no other sharing surface.

**Missing:**
- Share game result to social media / clipboard after completion (score card image or deep link)
- Share profile link
- Invite-a-friend deep link (friend request pre-filled from a share URL)

---

## 9. Map Enhancements

**Status:** Core game map works; several useful features absent.

**Missing:**
- **Route preview** — no line drawn between zones or to the next checkpoint; players navigate by eye
- **Compass / heading indicator** — map does not rotate with device heading
- **Checkpoint detail preview** — tapping a checkpoint marker shows nothing; could preview name, type, distance
- **Zone completion animation** — zone colour change is instant; a brief animated fill would be more satisfying
- **"You are here" accuracy ring** — `showsUserLocation` is on but accuracy radius is not shown
- **Browse mode interaction** — in non-game mode, zones are visible but tapping them does nothing; could show zone name and checkpoint count

---

## 10. Account Security

**Status:** Basic auth + in-app password change/profile update implemented; no secondary security measures.

`POST /api/game/users/change-password` (`UsersController.cs`) and `EditProfilePage.jsx` let a logged-in user change their password or update their profile. What's still missing is everything that doesn't assume the user is already logged in:

**Missing:**
- **Forgot password / reset via email** — Login screen has no reset path (the existing change-password flow requires the current password, so it doesn't help a locked-out user)
- **Email verification** — accounts are created without verifying ownership of the email
- **Session timeout** — JWT is stored but there is no expiry check or forced re-login after a period of inactivity
- **Biometric / PIN unlock** — no option to protect the app with Face ID / fingerprint

---

## 11. Accessibility

**Status:** Font scaling exists; other axes not covered.

`AccessibilityContext` provides `FONT_SCALES` options surfaced in Settings. Beyond that:

**Missing:**
- Screen reader (`accessibilityLabel`) annotations on interactive elements (most map controls, quiz buttons, action button have no labels)
- Colour-blind-safe palette — zone and checkpoint colours are not tested against WCAG contrast ratios
- Haptic feedback on checkpoint arrival / quiz answer selection
- Reduced-motion option (flash animations, countdown timer animation)

---

## 12. Admin / Staff Features

**Status:** Out of scope for mobile; mentioned for completeness.

The project README references a staff admin dashboard. The mobile app is player-facing only; no admin controls are exposed in this client.

---

## Partially Wired (UI Exists, Logic Missing)

| Location | What exists | What is missing |
|---|---|---|
| `StatisticsCard.jsx` | Component renders stats card | Historical breakdown (per-game detail) |
| `SettingsPage.jsx` — Text Size | Radio options render and persist | Full coverage — only `AppText` uses scale; most `StyleSheet` font sizes are fixed |
| `MapPage.jsx` — Browse mode | Zones visible on map | Tap-to-inspect interaction |
| `AllCheckpointsCompletePage.jsx` — Quiz bonus | Shows `0` if no quiz score | Correct when played normally, but a zero-score run looks like a bug |

---

*Generated: 2026-05-16 — based on codebase state at branch `feature/pending-element-submission`. §1 and §10 corrected 2026-06-22 against `feature/image-analysis-cv` (badges and password-change/profile-update were implemented since the original audit). Other sections not re-verified beyond that pass.*
