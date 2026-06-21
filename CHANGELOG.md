# Goalz - Changelog

## Table of Contents

1. [#104 Docs: add LICENSE and CNN model explainer](#104-docs-add-license-and-cnn-model-explainer--2026-06-22)
1. [#104 Docs: second consolidation pass — ml_pipeline, game_flow, user-guide, dashboard_overview, deployment-guide](#104-docs-second-consolidation-pass--ml_pipeline-game_flow-user-guide-dashboard_overview-deployment-guide--2026-06-22)
1. [#104 Docs: domain model, API endpoints, migration history, architecture consolidation](#104-docs-domain-model-api-endpoints-migration-history-architecture-consolidation--2026-06-21)
1. [#104 Chore: ml/ notebook cleanup — sync with deployed NatureResNet9 pipeline](#104-chore-ml-notebook-cleanup--sync-with-deployed-natureresnet9-pipeline--2026-06-21)
1. [#104 Fix: quiz questions never loading (Party.QuizId never assigned)](#104-fix-quiz-questions-never-loading-partyquizid-never-assigned--2026-06-21)
1. [#104 Fix: map never centers on player + zone/task selection ignores role eligibility](#104-fix-map-never-centers-on-player--zonetask-selection-ignores-role-eligibility--2026-06-21)
1. [#104 Fix: Expo dependency mismatches blocking mobile dev server](#104-fix-expo-dependency-mismatches-blocking-mobile-dev-server--2026-06-21)
1. [Fix: chatbot visibility + Zones nav item](#fix-chatbot-visibility--zones-nav-item--2026-06-11)
1. [Feat: 9-class data preparation notebook complete — 45,000 balanced images](#feat-9-class-data-preparation-notebook-complete--45000-balanced-images--2026-06-10)
1. [Feat: 9-class data preparation notebook pushed to Kaggle](#feat-9-class-data-preparation-notebook-pushed-to-kaggle--2026-06-10)
1. [Feat: Custom multi-class ResNet from scratch — full pipeline](#feat-custom-multi-class-resnet-from-scratch--full-pipeline--2026-06-10)
1. [Feat: AI classification field, AnalysedAt timestamp, re-analysis guard](#feat-ai-classification-field-analysedat-timestamp-re-analysis-guard--2026-06-08)
1. [Fix: ML dashboard feedback — live polling, dedup, summary display, ElementManagement AI column](#fix-ml-dashboard-feedback--live-polling-dedup-summary-display-elementmanagement-ai-column--2026-06-05)
1. [Fix: element creation null ImageUrl crash + mobile map usability](#fix-element-creation-null-imageurl-crash--mobile-map-usability--2026-06-10)
1. [#105 Fix: dashboard responsive — z-index layering, GPS 3-state cycle, Zones button removal](#105-fix-dashboard-responsive--z-index-layering-gps-3-state-cycle-zones-button-removal--2026-06-05)
1. [Fix: SonarQube — Dockerfile root user, recursive COPY, JWT NOSONAR](#fix-sonarqube--dockerfile-root-user-recursive-copy-jwt-nosonar--2026-05-20)
1. [Fix: Block non-Supabase imageUrls in element components](#fix-block-non-supabase-imageurls-in-element-components--2026-05-20)
1. [Fix: CSP img-src missing CARTO and Esri tile domains](#fix-csp-img-src-missing-carto-and-esri-tile-domains--2026-05-20)
1. [Sweep 2: Security & Network Robustness](#sweep-2-security--network-robustness--2026-05-20)
1. [Sweep 1: Dashboard Performance Optimizations](#sweep-1-dashboard-performance-optimizations--2026-05-20)
1. [Feat: Show My Location button on arboretum map](#feat-show-my-location-button-on-arboretum-map--2026-05-20)
1. [Unified persistent map — single Leaflet instance across all tabs](#unified-persistent-map--single-leaflet-instance-across-all-tabs--2026-05-19)
1. [Fix: MR !66 review — MapController null checks, PartyController GetParty, ZoneController doc](#fix-mr-66-review--mapcollectornull-checks-partycontroller-getparty--2026-05-19)
1. [Leaderboard redesign — hero pattern, podium, filters, time-based backend](#leaderboard-redesign--hero-pattern-podium-filters--2026-05-17)
1. [Fix: PicturesTaken stat never incremented](#fix-picturestaken-stat-never-incremented--2026-05-16)
1. [Browse mode removal + photo task fix](#browse-mode-removal--photo-task-fix--2026-05-16)
1. [Security & Flow Audit — full mobile + backend hardening](#security--flow-audit--2026-05-15)
1. [Fix: User 2 stuck in infinite role screen after game start](#fix-user-2-stuck-in-infinite-role-screen--2026-05-13)
1. [Feat: SignalR real-time push — replace 3s REST polling](#feat-signalr-real-time-push--2026-05-13)
1. [Fix: Mobile/backend flow audit — multi-zone, redundancy, over-requesting](#fix-mobilebackend-flow-audit--2026-05-13)

---

## #104 Docs: add LICENSE and CNN model explainer — 2026-06-22

### Added
- **`LICENSE`** (MIT, copyright "Goalz contributors") — the repo had no actual LICENSE file; `README.md` previously said "not currently licensed for external distribution," which contradicted the decision to make this MIT. Updated the README's License section to match.
- **`docs/cnn_model_explained.md`** — a plain-language explainer of the NatureResNet9 CNN (what a CNN/ResNet is, why residual connections help, walking through this model's actual Stem→4 Stages→GAP→Classifier structure, how it was trained, how a confidence score becomes an approve/reject/review decision). Linked from `agent_docs/ml_pipeline.md` (as the conceptual companion to its technical reference) and from `README.md`'s documentation map.

### Fixed
- **`ml/test_inference.py`**: was broken against the currently-deployed model — resized images directly to 224×224 (skipping the `Resize(256)→CenterCrop(224)` the model needs), never transposed to channels-first, and read the ONNX output as a single scalar instead of the real 9-class array. Rewrote it to match `ml/serve/app.py`'s `preprocess_image` and `get_recommendation` exactly. Found and fixed while writing the Key Files table for `agent_docs/ml_pipeline.md` — documenting it as a working tool would have been a new inaccuracy otherwise.

### Rationale
- A LICENSE file (not just README prose) is what GitHub/GitLab and most readers actually check; MIT was chosen so other students/classes can freely build on this work.
- The CNN explainer was requested specifically because no existing doc explained the model conceptually for a non-ML-background reader — `agent_docs/ml_pipeline.md`'s architecture section (added the day before) is accurate but written for an AI coding agent, not a teacher or incoming student.

> Issue closed after 25 min

---

## #104 Docs: second consolidation pass — ml_pipeline, game_flow, user-guide, dashboard_overview, deployment-guide — 2026-06-22

### Changed
- **`agent_docs/ml_pipeline.md`**: was describing the **wrong model entirely** — EfficientNetB0 (binary, ~5.3M params, MBConv blocks, Dense+Sigmoid) throughout the overview, sequence diagram, confidence table, and architecture section. The deployed model has been NatureResNet9 (9-class ResNet, ~2.8M params) since before this session (commit `5242cca`). Rewrote the confidence-threshold table to match the real asymmetric `not_nature` gate (0.55 vs the 0.85 `AutoApprove` bar) and the architecture section to match `model.py`'s actual Stem→Stage1-4→GAP→Classifier structure. Fixed the Key Files table, which pointed at the `ml/notebooks/` files deleted in the prior session's cleanup.
- **`docs/mobile_feature_gaps.md`** §1 (Badges) and §10 (Account Security): both claimed features that are actually implemented (`BadgeService.cs` + `frontend/mobile/utils/badges.js` for badges; `UsersController.cs` change-password/profile endpoints for account security). Corrected both, including a duplicate of the badges claim in the "Partially Wired" table.
- **`docs/game_flow.md`**: documented only 2 roles (Scout/Trailblazer) — there are 3 (Explorer). Described quiz questions as "drawn from hint fragments collected by Scouts" with a speed/streak scoring multiplier — actual implementation serves a random question from the entire pool with flat 100/0 points, no streak system. Added implementation-status notes rather than deleting the design narrative, since the speed/streak/nut-distribution content reads as intentional future design vision, not a claim about current behavior.
- **`docs/user-guide.md`**: same role/quiz/scoring corrections as `game_flow.md` (this one is player-facing, so the gap is more consequential — it was setting real expectations for actual players). Also corrected a genuine inaccuracy: it claimed photos are "verified automatically by AI" before the box appears — in reality `MapPage.jsx`'s `completeCheckpoint()` fires unconditionally on photo upload; AI review is a separate, asynchronous staff-dashboard workflow, not a real-time gate. Replaced the illustrative badge list with the 4 actually-implemented badges, and removed the nut-distribution promise (unimplemented — appropriate to keep as design vision in `game_flow.md`, not as a promise to end users in a guide they'll actually read).
- **`docs/dashboard_overview.md`**: added the "Check with AI" element-review feature (`ElementsPanel.jsx`), which was missing entirely from the Elements Panel description and approval-flow diagram.
- **`docs/deployment-guide.md`**: removed the dead "Web app" Docker service reference (port 3000 — same dead service removed from `docker-compose.yml` in the prior consolidation pass) and added the missing ML service port (8001).

### Rationale
- Found via a second, more thorough audit (3 parallel Explore passes covering `docs/mobile_feature_gaps.md`, `docs/game_flow.md`, and a spot-check of `docs/dashboard_overview.md`/`design_system.md`/`user-guide.md`/`deployment-guide.md`) after the first consolidation pass — the first pass only checked docs directly tied to contradictions already found, not the full `docs/` directory.
- Distinguished "design vision not yet built" (kept, with a status note) from "actively misleading claim" (corrected or removed) rather than treating all staleness the same way — particularly for the player-facing user guide vs. the internal design spec.

> Issue closed after 60 min

---

## #104 Docs: domain model, API endpoints, migration history, architecture consolidation — 2026-06-21

### Changed
- **Generated `docs/db_schema.sql`** via `dotnet ef migrations script` — the actual DDL, now the single source of truth for the schema.
- **`agent_docs/domain_model.md`** and **`PROJECT_DETAILS.md` §6**: both independently claimed only 4-5 entities were registered DbSets (`User`, `Friendship`, `Sensor`, `Element`); there are actually 21. Replaced both hand-maintained entity lists with a short purpose summary that points at `docs/db_schema.sql` instead of re-describing columns that will inevitably drift again.
- **`CLAUDE.md` and `PROJECT_DETAILS.md` §7 "Migration History"**: both hand-listed only 3-4 migrations; there are 32. Replaced with a pointer to `dotnet ef migrations list` / the migrations folder, keeping only the one genuinely non-obvious fact (`InitialCreate` has an empty `Up()`).
- **`agent_docs/api_and_auth.md`**: corrected the claim that dashboard login "does not issue a JWT" and that dashboard controllers have "no `[Authorize]` attribute" — both are now false; `AuthService.CheckAuth` does issue a JWT, and most dashboard controllers carry `[Authorize]`.
- **`agent_docs/project_architecture.md`**: removed a documented `frontend/app/` web app (port 3000) that doesn't exist on disk, and fixed a stale `localhost:5049` API port example to `8080`.
- **`agent_docs/api_endpoints.md`**: added ~20 endpoints that existed in code but were entirely undocumented (`UsersController`, dashboard `ElementController`'s AI-review workflow, `BoundaryController`, `CheckpointController`, `SensorController`, `GenerateReportsController`, dashboard `PopUpController`, `PartyController.GetParty`), and corrected several `Auth: —` rows that should have read `JWT` now that those controllers carry `[Authorize]`.
- **`docker-compose.yml` / `docker-compose.override.yml`**: removed the dead `app` service pointing at the nonexistent `./frontend/app` — `README.md` already documented this as safe to prune.

### Rationale
- The recurring failure mode was the same fact (entity list, migration list, auth status) hand-copied into 2-3 places that then drifted independently. Fixed by making exactly one doc/generated-artifact the source of truth per fact, with everything else pointing at it instead of re-stating it.
- Chosen after an explicit audit (3 parallel Explore passes over `agent_docs/`, `PROJECT_DETAILS.md`, and the actual controller/entity code) surfaced concrete, verifiable contradictions rather than vague staleness — each fix above is backed by a file:line citation against current code.

> Issue closed after 75 min

---

## #104 Chore: ml/ notebook cleanup — sync with deployed NatureResNet9 pipeline — 2026-06-21

### Changed
- Safety-committed `ml/custom_model/` (NatureResNet9 training pipeline — dataset.py, model.py, train.py, evaluate.py, export.py, notebooks) and `ml/test_inference.py`, which had been sitting untracked with no git history.
- Deleted `ml/notebooks/` (the old 2-class EfficientNetB0 pipeline: `goalz_cv_pipeline.ipynb` + the `01_data_preparation`/`02_eda`/`03_training`/`04_evaluation` series) and the gitignored `ml/logs/` run artifacts from the same pipeline — both fully superseded by the NatureResNet9 model now deployed in `ml/serve/`.
- Pulled `rubberduck808/loggin-project-classifier` from Kaggle (same kernel ID as the old `goalz-cv-complete-pipeline` slug, renamed for the Loggin rebrand) and replaced the local 19-cell draft notebook with the real 25-cell version that produced the deployed model — the local copy was missing the onnxscript/onnxruntime install cells and the PyTorch-vs-ONNX-Runtime parity-check cell referenced in commit `5242cca`'s "parity diff 0.00000000".

### Rationale
- `ml/custom_model/` had zero git history despite being the active pipeline — any local-disk loss would have destroyed it. Committing it first made the subsequent deletion of the old pipeline safe to do without a "purge everything and re-pull from Kaggle" fallback.
- Verified cell-by-cell (not just by title) that the Kaggle kernel was a genuine content difference, not just a rename, before overwriting anything.

> Issue closed after 20 min

---

## #104 Fix: quiz questions never loading (Party.QuizId never assigned) — 2026-06-21

### Fixed
- `GET /api/game/quiz/question` and `POST /api/game/quiz/answer` (`QuizController.cs`) required the calling user to be in an active `Party` whose `QuizId` matched the question. Audited the entire backend and dashboard frontend: **nothing anywhere ever assigns `Party.QuizId`** — no admin UI, no default at creation. Solo play has no `Party` at all, so the endpoint always returned `403 Forbid` for everyone; `QuizPage.jsx` silently swallowed the error, leaving the screen stuck on "Loading question..." indefinitely.
- Removed the broken party/QuizId gating; both endpoints now serve/validate against the entire question pool directly.

### Rationale
- The party-quiz linkage was dead, unreachable machinery — no feature exists anywhere to assign distinct quizzes per party, so gating on it could never have worked for any game mode, not just solo.

> Issue closed after 15 min

---

## #104 Fix: map never centers on player + zone/task selection ignores role eligibility — 2026-06-21

### Fixed
- **Map never showed the player's actual location**: `MapPage.jsx` fetched GPS (`userLocation`) but never animated the camera toward it — only `fitToCoordinates` calls on zone boundaries existed. Added an auto-recenter effect that fires once `mapReady` + a GPS fix are both available, independent of zone/game data loading, plus a manual "locate" button as a fallback. `flyToZone` now also includes the current checkpoint and the player's live position in its fit, not just the zone outline.
- **Task HUD silently went blank**: zone/checkpoint selection (both the initial zone assignment and the post-quiz zone-advance flow) picked the nearest zone by distance alone, with no regard for whether that zone had any checkpoints eligible for the player's randomly-assigned role (`getCpsForZone` filters by role: Scout→sensor only, Trailblazer→non-sensor only). If the nearest zone had nothing for the assigned role, `targetCp` was set to `null` and stayed `null` forever — `MapHud.jsx` renders an empty placeholder when `targetCp` is null, and the action button is gated on it too. Solo play hit this often since the role is picked at random.
- Added `findZoneWithTasks`/`pickZoneWithTasks` to `mapHelpers.js`: walks zone candidates sorted by distance and returns the first with a real task for the role, auto-marking skipped zones as complete (since there's genuinely nothing to do there) instead of stalling. Used in both the initial-assignment effect and the zone-advance flow (`completeCheckpoint` + the post-quiz `useFocusEffect`), replacing the old role-blind `nearestLocked` helper (now removed — fully superseded).

### Rationale
- Centering on the player and selecting a role-eligible zone are both "the map shows nothing useful" symptoms with the same root pattern: code that picked a location/zone without checking it was actually relevant to what the player could see or do there.
- Auto-skipping role-ineligible zones (rather than erroring or stalling) matches the existing design intent already visible in `GameSetupPage.jsx`'s `roleWarnings`, which warns hosts about exactly this case at setup time but the runtime never handled it gracefully.

> Issue closed after 90 min

---

## #104 Fix: Expo dependency mismatches blocking mobile dev server — 2026-06-21

### Fixed
- `frontend/mobile`'s `expo`, `expo-font`, `expo-updates`, `expo-file-system` were patch-versions behind what the installed Expo SDK 54 expected; `npx expo install --fix` resolved them (`expo` → `~54.0.35`, `expo-font` → `~14.0.12`, `expo-updates` → `~29.0.18`), with a matching `overrides.expo-font` bump to avoid an `EOVERRIDE` conflict.
- Added `'expo-font'` to the `plugins` array in `app.config.js` — Expo couldn't auto-edit that file (it's a dynamic JS config) but now requires the plugin registered.
- Identified that the earlier confusing "expo@55", "typescript", and Metro-bundler prompts were unrelated to the real app — they came from a stale, orphaned `package.json`/`app.json`/`tsconfig.json` at the repo root (left over from before the app moved into `frontend/mobile/`), which `npx expo start` was accidentally being run against when launched from the repo root instead of `frontend/mobile/`.

### Rationale
- Fixed the real app's dependency versions rather than the dead root-level project, which was never the actual mobile app and shouldn't be developed against.

> Issue closed after 30 min

---

## Fix: chatbot visibility + Zones nav item — 2026-06-11

### Changed
- **Chatbot always visible**: Moved `DashboardChatbot` from `Map.jsx` (only rendered on the map view) to `Overview.jsx` as a `fixed` floating button at bottom-left. It is now visible on every dashboard page — Reports, Settings, Sensor Monitor, etc.
- **Zones accessible from sidebar**: Added a "Zones" nav item (`fa-draw-polygon` icon, `tab: "zones"`) to the MAP section in `Navbar.jsx`. `ZonesPanel` already existed and was fully functional but had no nav entry point.

### Rationale
- The chatbot button was rendered inside `Map.jsx`, so navigating away from the map unmounted it entirely; moving it to the top-level layout fixes this without any logic changes to the component.
- The Zones tab was wired up in `MapDashboard.jsx` but omitted from `NAV_SECTIONS`, making it unreachable via the sidebar.

> Issue closed after 0 min

---

## Fix: element creation null ImageUrl crash + mobile map usability — 2026-06-10

### Fixed
- **ImageUrl null DB crash**: `ElementService.CreateAsync` now uses `request.ImageUrl ?? string.Empty` — consistent with `UpdateAsync` — so dashboard elements created without an image no longer hit the `NOT NULL` constraint on the `Elements.ImageUrl` column (`PostgresException 23502`).
- **Mobile map height**: Map container in `DashboardOverview` raised from `h-[300px] sm:h-[375px]` to `h-[420px] sm:h-[460px]`, giving enough vertical space to see and accurately tap the map on a phone.
- **Touch-blocking controls overlay**: In `Map.jsx`, the "Map Type Switcher" div was nested inside an outer `absolute` div but also carried its own `absolute bottom-4 right-4 z-[500]` — both positioned relative to the map container, creating an invisible second overlay at `bottom: 16px` that intercepted taps over the map. Removed the redundant absolute positioning from the inner div so it flows naturally inside the outer flex column.

### Rationale
- Empty string is the established sentinel for "no image" (already used in `UpdateAsync`), avoiding a schema migration.
- The height increase is the minimum needed to make precise touch targeting practical on common phone viewports.
- The CSS fix eliminates an unintended tap-eating layer without changing any visible layout.

> Issue closed after 0 min

---

## [#105] Fix: dashboard responsive — z-index layering, GPS 3-state cycle, Zones button removal — 2026-06-05

### Fixed
- **Z-index layering**: Map wrapper in `MapDashboard.jsx` gains `relative z-0`, creating a CSS stacking context that scopes all Leaflet internal z-indexes (200–1000) so they no longer compete with page overlays.
- Bottom sheet raised from `z-10` to `z-[1100]`, sidebar overlay to `z-[1200]`, sidebar nav and mobile top bar to `z-[1300]` — sidebar and sheet both properly overlay the map.
- `isOpen`/`setIsOpen` sidebar state lifted from `Navbar.jsx` to `Overview.jsx` and wired to `MapDashboard` via `onCloseSidebar` prop; touching the bottom sheet drag handle now closes the sidebar simultaneously.

### Changed
- **GPS location button** (`Map.jsx`): replaced `locationActive` boolean with `locCycle` (0 = idle / 1 = at user / 2 = at arboretum) + `userCoordsRef`. Tap 1 → geolocation + fly to user zoom 18; Tap 2 → fly to arboretum `[43.7260, -79.6099]` zoom 15, marker kept; Tap 3 → fly back to stored user coords zoom 18 (cycle repeats). Button turns blue when active.
- **Zones nav button** removed from `NAV_SECTIONS` in `Navbar.jsx`. Underlying data fetching and `ZonesPanel` rendering are untouched.
- **Zones layer toggle pill** removed from `layerDefs` in `MapDashboard.jsx` (both the elements-tab branch and the default branch).

### Rationale
- Leaflet sets internal pane z-indexes up to 1000 in the root CSS stacking context; `relative z-0` on the map wrapper scopes them within a new context so any z-index above 0 on a sibling beats the entire map — cleanest fix with no impact on desktop layout.
- 3-state GPS cycle matches the spec: staff orient themselves (state 1), check the full arboretum (state 2), then return to their position (back to state 1) without re-requesting geolocation.
- Zones tab was requested for removal by the team; the data layer and panel are kept intact for potential reintroduction.

> Issue closed after 0 min

---


## Fix: SonarQube — Dockerfile recursive COPY, PRNG party code, root user, JWT NOSONAR — 2026-05-20

### Changed
- `backend/Goalz/Goalz.API/Dockerfile` — replaced `COPY . .` with five explicit `COPY <project>/ ./<project>/` statements (one per project folder), eliminating the recursive copy hotspot without relying solely on `.dockerignore`.
- `backend/Goalz/Goalz.Application/Utils/CodeGenerator.cs` — replaced `new Random().NextInt64()` with `RandomNumberGenerator.GetInt32()` from `System.Security.Cryptography`; party codes are now generated using a cryptographically secure PRNG.
- `backend/Goalz/.dockerignore` — added exclusions for `appsettings.*.json`, `*.user`, `.env*`, `user-secrets.json`, and `.sonarqube/` as a defence-in-depth layer alongside the explicit COPY statements.
- `backend/Goalz/Goalz.API/Dockerfile` — added `USER app` before `ENTRYPOINT`; the `mcr.microsoft.com/dotnet/aspnet:9.0` base image ships a built-in non-root `app` user (uid 1654).
- `backend/Goalz/Goalz.API/Services/JwtService.cs` — added `// NOSONAR` on the `SymmetricSecurityKey` line; S6781 is a false positive — the secret is injected via `IConfiguration` at runtime, never hardcoded.

### Rationale
- Explicit COPY paths are deterministic — only known source directories enter the build layer; no glob expansion can accidentally pull in secrets from the build host.
- `System.Random` is seeded from a predictable clock source; using it for party codes means an attacker who knows the approximate creation time could brute-force the seed and guess codes. `RandomNumberGenerator` uses OS entropy.
- Running containers as root grants unnecessary host privileges if the container is escaped.

> Issue closed after 5 min

---

## Fix: Block non-Supabase imageUrls in element components — 2026-05-20 15:10

### Changed
- `frontend/dashboard/src/components/dashboard/elements/ElementsPanel.jsx` — added `isAllowedImageUrl()` guard; elements with `imageUrl` from disallowed domains (e.g. `picsum.photos` test data) now render the placeholder icon instead of triggering a CSP violation.
- `frontend/dashboard/src/components/dashboard/elements/ElementManagement.jsx` — same `isAllowedImageUrl()` guard applied to its own `ImageCell` component.
- `frontend/dashboard/src/components/dashboard/overview/ElementDetails.jsx` — `displayImage` is now nulled out when `element.imageUrl` points to a non-Supabase domain, preventing the detail panel from also triggering a CSP block.

### Rationale
- A developer inserted test elements with `picsum.photos` placeholder URLs directly into the database; these don't pass the `img-src` CSP and caused console violations on the elements tab.
- The frontend now defensively validates `imageUrl` against the allowed domain list (Supabase, blob:, data:) rather than blindly trusting API responses; this protects against any future bad data.
- Adding `picsum.photos` to the CSP was rejected — it would permanently weaken the policy for a third-party random-image service with no business reason to be trusted.

> Issue closed after 3 min

---

## Fix: CSP img-src missing CARTO and Esri tile domains — 2026-05-20 15:00

### Changed
- `frontend/dashboard/index.html` — added `*.basemaps.cartocdn.com` and `server.arcgisonline.com` to the `img-src` CSP directive so CARTO voyager tiles (used in `Map.jsx` and `ArboretumMap.jsx`) and Esri satellite tiles (`Map.jsx`) are no longer blocked by the browser.

### Rationale
- The CSP added in the security hardening pass only whitelisted OpenStreetMap tile servers; the map components also load from CARTO and ArcGIS which were omitted, causing a console CSP violation and broken map tiles.
- Adding the two specific domains is the minimal fix; replacing the tile providers would require UI regressions with no security benefit.

> Issue closed after 1 min

---

## Sweep 2: Security & Network Robustness — 2026-05-20

### Audit
Ran two parallel deep-dives across the dashboard (React + Vite) and mobile (Expo + React Native) frontends. Produced 13 findings. Cross-referenced against the codebase — 2 were already fixed (route code-splitting and the BLE timer), leaving 11 valid items addressed below.

### Changed
- `frontend/dashboard/src/services/authService.jsx` (+ 10 other dashboard service/component files) — JWT token storage migrated from `localStorage` to `sessionStorage`, eliminating the XSS-persistent token theft window (11 files updated).
- `frontend/dashboard/src/hooks/useAPI.jsx` — all dashboard API calls wrapped with a 10 s `AbortController` timeout (`REQUEST_TIMEOUT_MS = 10_000`); timeout always cleared in `finally`.
- `frontend/mobile/services/api/api.js` — introduced `fetchWithTimeout` helper (10 s `AbortController`); replaced all 7 bare `fetch()` calls and threaded it through `apiFetch`.
- `frontend/dashboard/src/services/overviewService.jsx` — `getSensorHistory(id, limit = 500)` caps unbounded historical data fetches.
- `frontend/dashboard/src/components/dashboard/map/ArboretumMap.jsx` — `useMemo` added for `zoneCheckpoints` and `searchResults` to prevent expensive re-filter loops during coordinate updates or scrolling.
- `frontend/dashboard/src/components/dashboard/sensors/SensorManagement.jsx` — `filteredSensors` wrapped in `useMemo([search, sensors])`.
- `frontend/dashboard/src/components/dashboard/ble/BLEScanner.jsx` — `setReadingHistory` gated behind a 500 ms throttle (`lastHistoryUpdateRef`) so rapid BLE notifications don't trigger a chart re-render on every packet.
- `frontend/dashboard/index.html` — added strict `Content-Security-Policy` meta tag: `script-src` restricted to `'self'`, `cdn.jsdelivr.net`, Font Awesome; `img-src` limited to `'self'`, `data:`, `blob:`, OpenStreetMap, Supabase storage, CARTO, Esri (iterated after initial addition); `frame-ancestors 'none'` blocks clickjacking.
- `.gitignore` / `frontend/mobile/env` — unstaged and gitignored the mobile env file to prevent Supabase anon key, Google Maps API key, and local IP from leaking into the repository.

### Rationale
- `sessionStorage` is cleared on tab close; a stolen token cannot survive across sessions or be exfiltrated by a cross-tab XSS payload.
- `AbortController` prevents hung requests from silently blocking the UI when the backend is unreachable.
- `useMemo` avoids re-running `.filter()` on every unrelated render (e.g. map move events).
- BLE throttle caps chart re-renders at ≤2 per second regardless of sensor notification rate.
- CSP eliminates the most common XSS escalation paths by restricting inline scripts and external resource origins. Browser extension errors (`FrameDoesNotExistError`, `encrypt() without a session key`) visible in the console are from a password manager extension — not application code.

### Action required
> **Rotate the Supabase anon key and Google Maps API key** in your cloud consoles — both were previously tracked in git history and must be considered compromised.

> Issue closed after 0 min (no issue tracked)

---

## Sweep 1: Dashboard Performance Optimizations — 2026-05-20

### Changed

**Eliminated N+1 Queries**
- `backend/Goalz/Goalz.Data/Repositories/OverviewRepositorycs.cs` — refactored the dashboard data loader to fetch the latest readings for all sensors in a single projected DB round-trip, eliminating up to 50,000 correlated subqueries per page load.

**Backend Streaming**
- `backend/Goalz/Goalz.Application/Interfaces/ISensorDataRepository.cs` / `SensorDataRepository.cs` — `GetSensorsByTimeRangeAsync` changed from `Task<IEnumerable<SensorData>>` (full buffer) to `IAsyncEnumerable<SensorData>` streamed via `.AsAsyncEnumerable()`.
- `backend/Goalz/Goalz.Application/Services/GenerateReportService.cs` — updated to `await foreach` so CSV/JSON report rows stream sequentially without buffering.

**Double-Layer Caching**
- `backend/Goalz/Goalz.Application/Services/ZoneService.cs` / `BoundaryService.cs` — `IMemoryCache` injected; `GetAllAsync()` caches geometry for 60 s with sliding expiration; `Create`, `Update`, and `Delete` each call `_cache.Remove(key)` to invalidate on mutation.
- `backend/Goalz/Goalz.API/Program.cs` — registered `AddMemoryCache()`; `Goalz.Core.csproj` added `Microsoft.Extensions.Caching.Memory` package reference.
- `frontend/dashboard/src/services/overviewService.jsx` — module-level 60 s TTL cache wraps `getAllElements()`; all 7 mutation methods call `invalidateOverviewCache()`.

**List Virtualisation & Input Debouncing**
- `frontend/dashboard/src/components/dashboard/sensors/SensorManagement.jsx` — 250 ms debounced search, `filteredSensors` derived list, dynamic-height virtualised scroll container (only ~10 items rendered in the viewport at any time).
- `frontend/dashboard/src/components/dashboard/elements/ElementsPanel.jsx` — same virtualisation applied to the elements list; fixed a runtime `ReferenceError` on `containerRef` by properly declaring the scroll container reference and reset hooks.

**Leaflet Canvas Rendering**
- `frontend/dashboard/src/components/dashboard/map/ArboretumMap.jsx` — `L.canvas({ padding: 0.5 })` shared across all `L.geoJSON()` zone layers, collapsing per-zone SVG nodes into a single `<canvas>` element (O(n) → O(1) layout cost).

**Code Splitting**
- `frontend/dashboard/vite.config.js` — `manualChunks` splits `leaflet` (~250 kB) and `recharts` (~400 kB) into separately cached bundles.
- `frontend/dashboard/src/App.jsx` — `Overview` page lazy-loaded via `React.lazy` + `<Suspense>`, so Leaflet and Recharts are not parsed on the Login page.

### Rationale
- Target scale: 10,000 elements, 10,000 sensors, 1,000 game zones. The previous implementation issued up to 50k correlated subqueries per page load, buffered entire sensor datasets into memory before writing a single CSV byte, re-queried zone/boundary geometry on every request, re-fetched all records on every tab switch, rendered 1,000 SVG paths for zones, and shipped the full vendor bundle to the Login page.
- Streaming removes the memory spike entirely; the first CSV byte is written before all rows are read.
- `IMemoryCache` with 60 s TTL eliminates repeated geometry queries while still reflecting edits within a minute.
- DOM virtualisation keeps the rendered DOM constant regardless of list size.
- Code splitting cuts login-page parse time by ~650 kB.

> Issue closed after 0 min (no issue tracked)

---

## Feat: 9-class data preparation notebook complete — 45,000 balanced images — 2026-06-10

### Final state
- All 9 classes at exactly 5,000 images — perfectly balanced
- Train: 31,500 (3,500/class) | Val: 6,750 (750/class) | Test: 6,750 (750/class)
- Runtime: ~60 seconds on Kaggle CPU (no GPU needed)
- Kaggle kernel: `rubberduck808/goalz-9-class-data-preparation` (v13)

### Data sources per class
| Class | Source | Notes |
|---|---|---|
| not_nature | Places365 (292 urban/indoor categories) | Excludes all nature/landscape categories |
| tree | PlantNet-300K (liriodendron, metasequoia, nothofagus) + Places365 tree_farm | PlantNet lacks most Canadian tree genera; tree_farm fills to 5,000 |
| shrub | PlantNet-300K (lavandula, daphne, hypericum, and others) | 8,842 available — capped at 5,000 |
| grass_lawn | Places365 (lawn, golf_course, pasture, athletic_field) | PlantNet grass genera absent from dataset |
| mulch | Places365 (topiary_garden, zen_garden, courtyard) | Closest proxy — check QA grid for contamination |
| garden_bed | Places365 (botanical_garden, formal_garden, japanese_garden, vegetable_garden) | |
| ground_cover | PlantNet-300K (sedum, trifolium, fragaria, lamium, hypericum) | 56,964 available — capped at 5,000 |
| green_roof | Places365 (roof_garden, rooftop) | |
| water_body | Places365 (lake, river, pond, ocean, coast, waterfall, fishpond, creek, lagoon, etc.) | |

### Key engineering decisions
- **train.txt parsing instead of filesystem walking**: Places365 has 1.8M images; `rglob` hung for 7+ minutes on Kaggle's network FS. Parsing the 144MB text index takes ~12 seconds.
- **Targeted directory reads**: `collect_from_places365` only reads the directories of matched categories (1–10 dirs), not all 365.
- **Deployment context**: app is primarily Canadian — genus mapping updated to include Canadian arboretum species (vaccinium, rubus, amelanchier, syringa, etc.) even though PlantNet-300K didn't have them.

> Issue closed after 0 min

---

## Feat: 9-class data preparation notebook pushed to Kaggle — 2026-06-10

### Added
- **`ml/custom_model/notebooks/01_data_preparation.ipynb`** — Kaggle notebook that builds `train.csv`, `val.csv`, `test.csv` for the 9-class ResNet. Scans PlantNet-300K images, maps genera to classes (tree/shrub/grass_lawn/garden_bed/ground_cover) via a 130-genus lookup, then extracts `water_body` and `not_nature` buckets from Places365 using keyword matching on category names. Balances to 5,000 images per class, performs a stratified 70/15/15 split, and includes a class-balance bar chart + 5-image sample grid per class.
- **`ml/custom_model/notebooks/kernel-metadata.json`** — Kaggle kernel config; slug `rubberduck808/goalz-9-class-data-preparation`, GPU disabled (CPU-only scan), datasets: `noahbadoa/plantnet-300k-images` + `benjaminkz/places365`.

### Rationale
- `mulch` and `green_roof` have no automated public-dataset source; the notebook flags them as sparse and documents manual curation options (Unsplash/Flickr scrape → new Kaggle dataset).
- Reuses the two datasets already attached to the binary classifier notebook — no new dataset downloads needed.

> Issue closed after 0 min

---

## Feat: Custom multi-class ResNet from scratch — full pipeline — 2026-06-10

### Added
- **`ml/custom_model/environment.yml`** — PyTorch 2.4 + CUDA 12.1 conda environment. Includes `nvidia` and `pytorch` channels required for GPU PyTorch; `pytorch-cuda=12.1` line is mandatory (omitting it silently installs CPU-only).
- **`ml/custom_model/dataset.py`** — `NatureDataset` (PyTorch Dataset class), full transform pipelines (train + val), `make_dataloaders` factory. Includes bounded corrupt-image retry (MAX_RETRIES=5), `worker_init_fn` for independent per-worker augmentation seeds, and `pin_memory` CUDA guard.
- **`ml/custom_model/model.py`** — `ResidualBlock` and `NatureResNet`. 9 classes, 22 conv/linear layers, ~2.8M parameters. `inplace=False` in residual blocks (shortcut backward safety). Includes standalone sanity check (`python model.py`).
- **`ml/custom_model/train.py`** — Full two-phase training loop. Phase A: AdamW lr=1e-3, 20 epochs. Phase B: lr=1e-4, 10 epochs, fresh scheduler. AMP with `torch.amp` (not deprecated `torch.cuda.amp`), gradient clipping, `torch.compile`, cuDNN benchmark, TensorBoard, early stopping with counter reset between phases, explicit LR override after checkpoint load.
- **`ml/custom_model/evaluate.py`** — Per-class classification report, normalised 9×9 confusion matrix, AutoApprove precision metric, calibration plot (overconfidence check), per-class error analysis grids.
- **`ml/custom_model/export.py`** — ONNX export from `raw_model` (not compiled model), structural verification, numerically stable parity check (max diff < 1e-4).
- **`ml/custom_model/notebooks/00_verify_setup.ipynb`** — GPU check, import verification, architecture sanity check notebook.

### Changed
- **`ml/serve/app.py`** — Full rewrite: lifespan startup pattern (replaces deprecated `on_event`), `preprocess_image` with correct Resize(256)→CenterCrop(224)→[-1,1]→channels-first transpose, multi-class output (9-class softmax), asymmetric recommendation thresholds (not_nature gate at 0.55 vs AutoApprove at 0.85), `classification` field returned in response.
- **`ml/serve/requirements.txt`** — Removed `tensorflow-cpu` (~500 MB); added `pillow>=10.0` (Resampling API change).
- **`ml/.gitignore`** — Added `logs/`, `custom_model/checkpoints/`, `custom_model/__pycache__/`.
- **`IImageAnalysisService.cs`** — Added `string? Classification` to `ImageAnalysisResult` record.
- **`ImageAnalysisService.cs`** — Parses `classification` field from ML response with graceful fallback to null (backward compatible with old binary model).
- **`ElementService.cs`** — Sets `element.AiClassification = result.Classification` in `AnalyseAndActAsync`.

### Rationale
- Building from scratch rather than fine-tuning teaches the full ML pipeline: dataset loading, architecture design, training loop mechanics, evaluation, and ONNX export.
- Multi-class output (9 classes) replaces the binary gate, enabling identification of the specific element type — populating `AiClassification` in the database.
- Asymmetric thresholds reflect the asymmetric cost: a wrongly AutoApproved non-nature image bypasses all review; wrongly sending a nature image to review is a minor inconvenience.
- All critical review issues addressed: torch.compile/ONNX incompatibility (export from raw_model), preprocessing shape mismatch (transpose added), taxonomy-based PlantNet labelling (not random slicing), numerically stable softmax throughout.

> Issue closed after 0 min

---

## Feat: AI classification field, AnalysedAt timestamp, re-analysis guard — 2026-06-08

### Added
- **`Element.cs`**: Added `AiClassification` (`string?`) and `AnalysedAt` (`DateTime?`) properties. `AiClassification` will store the predicted class name (e.g. `"tree"`, `"water_body"`) once the multi-class model is deployed. `AnalysedAt` records when analysis last ran.
- **`PendingElementDto.cs`**: Exposed both new fields so the dashboard receives them.
- **Migration `AddAiClassificationAndAnalysedAt`**: Adds `AiClassification` (text, nullable) and `AnalysedAt` (timestamptz, nullable) columns to the `Elements` table.

### Changed
- **`ElementService.cs` — `AnalyseAndActAsync`**: Added pre-flight guard — if `element.AiResult` is already set and `force` is false, the background task returns immediately without calling the ML service, preventing unnecessary re-analysis. Sets `AnalysedAt = DateTime.UtcNow` on every completed analysis.
- **`ElementService.cs` — `TriggerAnalysisAsync` / `FireAnalysis`**: Both accept a `bool force = false` parameter that bypasses the pre-flight guard for explicit staff re-checks.
- **`IElementService.cs`**: Updated `TriggerAnalysisAsync` signature to include `force`.
- **`ElementController.cs`**: `POST /api/dashboard/elements/{id}/analyse` now accepts `?force=true` query param and passes it through.
- **`overviewService.jsx`**: `triggerAnalysis(id, force)` appends `?force=true` to the URL when force is true.
- **`ElementManagement.jsx`**: AI column now shows predicted classification (indigo tag, `fa-tag`) and "Checked X ago" timestamp when `analysedAt` is set. `handleAnalyse` clears both new fields on re-trigger. "Re-check" button passes `force=true`.
- **`PendingElements.jsx`**: Same classification and checked-time display additions. "Check with AI" becomes "Re-check" (gray) when already analysed and passes `force=true`.

### Rationale
- Without `AnalysedAt`, staff had no way to know if a result was fresh or stale (e.g. from a previous model version). The timestamp makes this explicit.
- Without the pre-flight guard, `AnalyseAndActAsync` would overwrite valid existing results on every retry-service run, wasting ML calls and potentially degrading results if model output is non-deterministic.
- `AiClassification` is wired end-to-end (DB → DTO → dashboard) now, ready to populate once the multi-class model is deployed — no backend changes needed at that point.

> Issue closed after 0 min

---

## Fix: ML dashboard feedback — live polling, dedup, summary display, ElementManagement AI column — 2026-06-05

### Changed
- **Backend** (`ElementService.cs`): Added `ConcurrentDictionary<long, byte> _inFlightIds` in-flight guard. `FireAnalysis` now returns early if the same element ID is already being processed, preventing duplicate ML calls from concurrent manual triggers and the retry service. The ID is removed in `AnalyseAndActAsync`'s `finally` block.
- **ElementsPanel.jsx**: Replaced instant-clear spinner with live polling. After triggering analysis, `handleAnalyse` keeps the element in `analysingIds` and starts a `setInterval` (2 s) that polls `getPendingElements` for up to 20 s. When a result arrives it updates `pendingItems` in-place; if the element disappears (auto-approved) it calls `fetchData`. Timeout after 20 s sets a `failedIds` entry and shows an "Analysis failed" badge.
- **ElementsPanel.jsx**: `aiSummary` is now displayed as italic text below the AI badge in pending element cards.
- **ElementsPanel.jsx**: "Check with AI" button changes to "Re-check" (gray) when a result already exists, reducing accidental re-triggering.
- **ElementManagement.jsx**: Added `analysingIds`, `failedIds` state and `handleAnalyse` (same polling logic). Pending table now includes an "AI" column showing the badge + summary, and a "Check with AI" / "Re-check" button in the Actions column — bringing this view to full parity with ElementsPanel.

### Rationale
- The original `handleAnalyse` cleared the spinner in `finally`, which ran the moment the 202 came back — so results never appeared without a manual refresh. Polling the `/pending` endpoint until `aiResult` is populated closes this gap without requiring a new WebSocket event.
- The in-flight dictionary prevents stacked ML calls when staff click the button repeatedly or when the 2-minute retry service fires simultaneously, reducing unnecessary load on the Cloud Run ML service.
- `ElementManagement.jsx` is a separate full-page staff view for the same pending queue; omitting AI there meant staff using that page had no visibility into AI recommendations at all.

> Issue closed after 30 min

---

## Feat: Show My Location button on arboretum map — 2026-05-20

### Added
- Location crosshairs button overlaid on the map (bottom-right, above zoom controls) in `ArboretumMap.jsx`.
- Clicking the button calls `navigator.geolocation.getCurrentPosition` with high accuracy, places a pulsing blue dot marker at the user's position, and flies the map to that location at zoom 18.
- A second click removes the marker and resets the active state.
- Shows a spinner while the browser is resolving the position.
- Shows an error toast if geolocation is denied or unsupported.
- CSS `@keyframes locate-pulse` injected via an inline `<style>` tag so the ring animates without requiring a separate stylesheet.

### Rationale
- Staff need to know their own position relative to the arboretum when deciding where to place a new sensor, especially outdoors away from a desk.
- Browser Geolocation API is already available with no additional dependencies.
- Using a toggle (active/inactive) lets staff dismiss the marker once they've orientated themselves.

> Issue closed after 0 min

---

## Unified persistent map — single Leaflet instance across all tabs — 2026-05-19

### Changed
- `Map.jsx` (renamed component to `DashboardMap` to avoid shadowing JS built-in): Added zone polygon layers (two Leaflet panes), leaflet-draw handler, vertex edit overlay, `previewZones` for dashed yellow AI-generated zone previews. Exposed `clearDrawnPreview()` via `forwardRef` + `useImperativeHandle`. Removed old `+` button and `MapLegend` bar.
- `MapDashboard.jsx`: Removed conditional `ArboretumMap` render branch — map is now always mounted. Added zones/boundaries fetch, full zone draw state machine, vertex edit state, `previewZones`. Added `Zones` pill to layer toggles (off by default, auto-enabled on Zones tab). `filteredCheckpoints` passes all checkpoints on Zones tab. Map receives zone props; `ZonesPanel` replaces the old full-screen zones view in the side panel.

### Added
- `src/components/dashboard/zones/ZonesPanel.jsx` (new): Zone management side panel extracted from ArboretumMap. Handles all zone/boundary CRUD (create, name, color, edit vertices, delete), AI zone generation preview, OSM import, and search. Drives draw and vertex-edit modes through callbacks to `MapDashboard`.

### Rationale
- Previously switching to the Zones tab remounted a completely separate Leaflet instance (`ArboretumMap`), losing the user's pan/zoom position and making zone polygons invisible on other tabs.
- Single map instance preserves position across all tabs and allows zone polygons to appear as a toggleable layer on Overview/Elements/Sensors tabs.
- Zones layer defaults to off; auto-enables when entering the Zones tab so the experience is contextual without requiring manual toggle.

> Issue closed after 90 min

---

## Fix: MR !66 review — MapController null checks, PartyController GetParty — 2026-05-19

### Changed
- `MapController.cs`: Added `if (zones/boundaries/checkpoints == null) return NotFound()` guard to each of the three GET endpoints (`/zones`, `/boundaries`, `/checkpoints`). Added XML doc comment clarifying the controller consolidates the deleted game-side `ZoneController` and `BoundaryController`.
- `IPartyService.cs`: Changed `GetParty` return type from `Task<PartyResponse>` to `Task<PartyResponse?>`.
- `PartyService.cs`: `GetParty` now returns `null` when the party is not found instead of throwing `NotFoundException`, consistent with `JoinParty`'s pattern.
- `PartyController.cs`: `GetParty` endpoint now checks `if (result == null) return NotFound("Party not found")` before returning `Ok`.

### Rationale
- Reviewer requested explicit null/NotFound guards on map endpoints and an explanation for the deleted `ZoneController` (consolidated into `MapController` in a prior commit).
- `PartyController.GetParty` had no visible error handling; reviewer asked for `if (id == null) return NotFound()`. Changed service to return null rather than throw so the null check is explicit in the controller, matching the style of `JoinParty`.
- ElementController lines 36-37 were already correct — no change needed.

> Issue closed after 0 min

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
1. [#64 PopUp database connection](#64-popup-database-connection--2026-05-11)
2. [Mobile: PopUp — speech bubble pointer Rectangle 18 & 19](#58-mobile-popup--speech-bubble-pointer-rectangle-18--19--2026-05-10)
2. [Mobile: PopUp component (mascot notification)](#58-mobile-popup-component-mascot-notification--2026-05-08)
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

## [#64] PopUp database connection — 2026-05-11

### Added
- `Goalz.Domain/Entities/PopUp.cs` — new entity with `Id` and `InfoText`
- `Goalz.Domain/Entities/Sensor.cs` — added `PopUpId` (FK) and `PopUp` navigation property (optional one-to-one)
- `Goalz.Data/Storage/AppDbContext.cs` — added `DbSet<PopUp>`, configured one-to-one `Sensor → PopUp` with `OnDelete(SetNull)`
- `Goalz.Application/Interfaces/IPopUpRepository.cs`, `IPopUpService.cs` — interfaces
- `Goalz.Data/Repositories/PopUpRepository.cs` — `GetBySensorIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`
- `Goalz.Application/Services/PopUpService.cs` — service wrapping repo, validates sensor exists and has no duplicate popup
- `Goalz.Application/DTOs/PopUpDto.cs`, `CreatePopUpRequest.cs`, `UpdatePopUpRequest.cs`
- `Goalz.API/Controllers/Game/PopUpController.cs` — `GET /api/game/sensors/{sensorId}/popup`
- `Goalz.API/Controllers/Dashboard/PopUpController.cs` — `POST/PUT/DELETE /api/dashboard/sensors/{sensorId}/popup`
- `Goalz.API/Program.cs` — DI registrations for `IPopUpRepository` and `IPopUpService`
- Migration `AddSensorPopUp` — creates `PopUps` table, adds `PopUpId` column and unique index on `Sensors`
- `frontend/mobile/services/api/api.js` — `getSensorPopUp(sensorId)` calling the new game endpoint
- `frontend/mobile/pages/MapPage.jsx` — fetches popup message on sensor modal close, passes it to `<PopUp>`

### Rationale
- `PopUp` is a separate entity (not a field on `Sensor`) so staff can manage messages independently via the dashboard
- FK lives on `Sensor` (one-to-one optional) so a sensor can exist without a popup message
- `OnDelete(SetNull)` means deleting a popup message leaves the sensor intact
- Migration was manually trimmed to remove an unrelated `PartyGroupAnswer → PartyGroupAnswers` rename that EF bundled in due to pre-existing schema drift

> Issue closed after 0 min

---

## [#58] Mobile: PopUp — speech bubble pointer Rectangle 18 & 19 — 2026-05-10

### Changed
- `frontend/mobile/pages/PopUp.jsx` — redesigned speech bubble area to match Figma node 1080-3925
  - **Mascot** scaled to Figma dimensions: `102.13 × 95.26` (was `402 × 282`)
  - **Rectangle 19** (`styles.rectangle19`) added as left-pointing speech bubble nib: `13.73 × 12.01`, `borderWidth: 2`, `borderColor: '#22CF64'`, `borderRadius: 11`, rotated 45°, overlaps Rectangle 18 by 8 pt via `marginRight: -8`
  - **Rectangle 18** (`styles.bubble`) adjusted to Figma spec: `backgroundColor: '#fff'` (was `#f4f4f5`), `borderRadius: 10` (was 11), `borderWidth: 2`, `borderColor: '#22CF64'`
  - Wrapper `bubbleOuter` (`flex: 1, flexDirection: 'row', alignItems: 'center'`) introduced to lay out Rectangle 19 and Rectangle 18 side-by-side

### Rationale
- Figma layer structure separates the green-bordered nib (Rectangle 19) from the white fill box (Rectangle 18) — mirroring this in React Native makes each layer independently adjustable
- Rectangle 19 uses a rotated, fully-rounded View instead of the CSS triangle trick because `borderRadius: 11` and `borderColor` must both be applied as per Figma spec; the overlap hides the right half, leaving only the left pointer visible

> Change completed after ~15 min

---

## [#58] Mobile: PopUp component (mascot notification) — 2026-05-08

### Added
- `frontend/mobile/pages/PopUp.jsx` — reusable modal overlay matching Figma wireframe (node 1059-3999): dark semi-transparent overlay, squirrel mascot on the left, speech bubble (white fill, green SVG border with left-pointing tail) on the right, green confirmation button at the bottom
- Props: `visible` (boolean), `message` (string), `onConfirm` (callback)

### Rationale
- Reused the SVG speech bubble path from the existing `QuizSpeechBubble.jsx` — same shape and green stroke, no new dependency
- `Modal transparent` + `statusBarTranslucent` for a native overlay look on both Android and iOS
- Figma asset URL used for the mascot image (expires after 7 days — replace with a local asset if needed)

> Change completed after ~5 min

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
