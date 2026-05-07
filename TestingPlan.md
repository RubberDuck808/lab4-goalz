# Testing Plan — Goalz

**Date:** 2026-05-03
**Project:** Goalz — Interactive Sustainability Game

---

## 1. Test Goals

- Validate that core user flows (party setup, camera, game map, checkpoints) work end-to-end without critical errors.
- Identify usability issues across the mobile app, web app, and staff dashboard.
- Assess visual consistency (fonts, colours, layout) and navigation clarity.
- Surface missing features or interactions that block a complete user experience.

---

## 2. Participants

| Participant | Role | Areas Tested |
|---|---|---|
| Carmen Simon | Internal reviewer | Mobile app (party flow, camera, map, roles), dashboard (element creation, sensor setup) |
| Lukas Povilaitis | Developer / reviewer | Dashboard (elements, charts, map), mobile app (auth, game map) |

---

## 3. Methods Used

- **Exploratory testing** — participants worked through the app without a fixed script, noting issues as encountered.
- **Task-based walkthrough** — key flows tested: creating a party, joining as a role, completing checkpoints, and managing elements in the dashboard.
- **Checklist review** — findings logged as a prioritised checklist (severity indicated by number of `!` marks).
- **Cross-device review** — mobile app reviewed for UI consistency and responsiveness.

---

## 4. Key Findings

Issues are grouped by area. Priority is indicated: **!!!** = critical, **!!** = high, **!** = normal.

### 4.1 Mobile App — Party & Role Flow

| Priority | Finding |
|---|---|
| !!! | Incorrect colours used in Party Setup screen |
| !!! | Back button should be removed from the camera page |
| !!! | Party Mode screen does not navigate back to Choose Mode |
| !!! | Starting a party throws an error: *"waiting for role"* — role assignment is broken |
| !! | Fonts are inconsistent across screens |
| ! | Role design needs visual polish |
| ! | Party Code: tapping the copy icon in the top-right corner does not copy the code to clipboard |

### 4.2 Mobile App — Game & Map

| Priority | Finding |
|---|---|
| ! | Finished all checkpoints screen is missing |
| ! | Map frontend is incomplete |
| ! | Game Map needs to be implemented |
| ! | Add Loggy feature (interaction logging / messages) |

### 4.3 Dashboard — Element & Sensor Management

| Priority | Finding |
|---|---|
| !!! | Longitude and latitude input labels are switched in element creation (verify for sensors too) |
| !! | No explanation provided on how to enter longitude/latitude or configure sensors |
| !! | No explanation provided on how to create elements |
| ! | Edit element form inputs are missing placeholder text |
| ! | Better naming needed for the Overview / Arboretum Map navigation items |
| ! | Element charts are broken and need to be fixed |
| ! | Add a pin-selection tool for choosing a point on the map |
| ! | Arboretum map overview section needs implementation |

### 4.4 Authentication

| Priority | Finding |
|---|---|
| ! | No logout option is available for users |

---

## 5. Reflections

### 5.1 Usability Issues

The most impactful usability problems centre on navigation and feedback. Users have no clear path back to the mode-selection screen from Party Mode, and the camera page presents a back button that leads to a dead end. The "waiting for role" error on party start is a show-stopper for the core game loop. On the dashboard, swapped longitude/latitude labels will cause incorrect data entry and are a data-integrity risk.

Font and colour inconsistencies reduce perceived quality and may indicate missing global style tokens or theming that has not been applied uniformly.

### 5.2 Quality Goals

| Goal | Status |
|---|---|
| Core party flow works end-to-end | Not met — role assignment error blocks play |
| Map and checkpoint features functional | Partial — frontend incomplete |
| Dashboard allows correct element/sensor creation | Not met — lat/lng labels swapped, no guidance |
| Visual consistency across screens | Not met — font and colour issues present |
| Clipboard and interactive UI elements behave correctly | Not met — copy icon non-functional |

