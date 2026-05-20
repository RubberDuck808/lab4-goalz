# Dashboard — Architecture & Feature Overview

The staff dashboard is a React + Vite SPA that manages the arboretum: elements (trees, plants), IoT sensors, spatial zones/boundaries, and player-submitted element approvals. It communicates with the ASP.NET Core API at `/api/dashboard/*` using JWT auth.

---

## Directory Layout

```
frontend/dashboard/src/
├── App.jsx                  — router root, ProtectedRoute wrapper
├── main.jsx                 — entry point, BrowserRouter
├── App.css                  — Tailwind v4 @theme tokens (game palette, surface, border)
├── pages/
│   ├── Login.jsx            — email/password login form
│   └── Overview.jsx         — authenticated shell (sidebar + content switcher)
├── components/
│   ├── navbar/
│   │   ├── Navbar.jsx       — sidebar nav with hamburger mobile menu
│   │   └── Navitem.jsx      — individual nav item
│   ├── Loading/
│   │   └── Loading.jsx      — overlay spinner (OrbitProgress)
│   └── dashboard/
│       ├── MapDashboard.jsx  — persistent map + tabbed left panel
│       ├── overview/
│       │   ├── OverviewPanel.jsx   — stats, charts, sensor readings
│       │   ├── Map.jsx             — Leaflet map (clustering, coord pick, flyTo)
│       │   ├── MapLegend.jsx       — legend item
│       │   ├── ManageElement.jsx   — add element form wrapper
│       │   ├── ElementDetails.jsx  — view/edit/delete element
│       │   ├── Chart.jsx           — chart type router
│       │   └── charts/             — AreaChart, BarChart, LineChart, PieChart
│       ├── elements/
│       │   └── ElementsPanel.jsx   — element list with approval flow
│       ├── sensors/
│       │   └── SensorsPanel.jsx    — sensor CRUD + BLE link
│       ├── map/
│       │   ├── ArboretumMap.jsx    — full-screen zone/boundary editor
│       │   ├── LayerSidebar.jsx
│       │   ├── ZoneCreationModal.jsx
│       │   └── boundarySnap.js     — snap-to-boundary geometry helpers
│       ├── ble/
│       │   └── BLEScanner.jsx      — Bluetooth sensor monitor
│       ├── reports/
│       ├── import/
│       └── settings/
├── hooks/
│   ├── useOverviewData.jsx  — fetches elements + sensors; returns { data, loading, error }
│   └── useAPI.jsx           — HTTP helper (adds Bearer token header)
└── services/
    ├── authService.jsx      — login, logout, token storage, JWT decode
    ├── overviewService.jsx  — all element/sensor/checkpoint CRUD + approval
    ├── boundaryService.jsx  — boundary CRUD
    ├── zoneService.jsx      — zone CRUD
    └── osmImportService.js  — OpenStreetMap boundary import
```

---

## Routing & Authentication

### Routes (`App.jsx`)

| Path | Component | Guard |
|---|---|---|
| `/` | `Login` | none |
| `/overview` | `Overview` | `ProtectedRoute` |

`ProtectedRoute` reads `authService.getToken()`. If no token exists it redirects to `/`.

### Auth flow (`authService.jsx`)

1. User submits email + password on the Login page.
2. `authService.authenticate(email, password)` POSTs to `/auth/login`.
3. The returned JWT is stored in `localStorage`.
4. `authService.getUser()` decodes the JWT payload to read `email`, `name`, and `role`.
5. All API calls attach `Authorization: Bearer <token>` via `useAPI.jsx`.
6. `authService.logout()` clears localStorage and navigates back to `/`.

---

## Application Shell (`Overview.jsx`)

`Overview` is the root authenticated view. It holds:

- **Left**: `<Navbar>` sidebar
- **Right**: a content region whose contents are driven by `selectedItem` state

### Content switching

```
selectedItem === "Map"            → <MapDashboard />
selectedItem === "Reports"        → <Reports />
selectedItem === "Import dataset" → <ImportData />
selectedItem === "Sensor Monitor" → <BLEScanner bleSelectedSensorId={...} />
selectedItem === "Settings"       → <Settings />
default                           → <MapDashboard />
```

`setBleSelectedSensorId` is threaded down from `Overview` into `MapDashboard` → `SensorsPanel` so that clicking the BLE button on a sensor card can preselect that sensor in `BLEScanner` when the user is taken to the Sensor Monitor tab.

---

## Navbar

`Navbar.jsx` is a fixed sidebar on desktop (hidden off-screen on mobile, revealed by hamburger button). It renders five `Navitem` components:

| Label | Icon | Destination |
|---|---|---|
| Map | fa-map | MapDashboard |
| Reports | fa-file-export | Reports |
| Import dataset | fa-upload | Import |
| Sensor Monitor | fa-bluetooth | BLEScanner |
| Settings | fa-cog | Settings |

A logout button at the bottom calls `authService.logout()` and redirects to `/`.

`Navitem` applies a blue left-accent bar (`border-l-4 border-game-blue`) and a white tint background to the active item.

---

## MapDashboard — Persistent Map Container

`MapDashboard.jsx` is the most complex component. It renders a **persistent Leaflet map** on the right while only swapping the left panel between tabs.

### Why persistent?

Mounting/unmounting the Leaflet map on every tab switch causes a flash as the map re-initialises tiles and markers. By keeping `Map.jsx` always mounted (outside the tab conditional) and only unmounting it when the user switches to the *Zones* tab (which has its own incompatible CDN Leaflet instance), the map never reloads during the Overview/Elements/Sensors transitions.

### Tabs

| Tab | Left panel | Map visible |
|---|---|---|
| Overview | OverviewPanel | yes |
| Elements | ElementsPanel | yes |
| Sensors | SensorsPanel | yes |
| Zones | ArboretumMap (full-screen) | no — ArboretumMap owns its own map |

### State owned by MapDashboard

| State | Type | Purpose |
|---|---|---|
| `activeTab` | string | Which tab is active |
| `checkpoints` | array | All map markers (elements + sensors combined) |
| `coordPickEnabled` | boolean | Whether the map is in "click to pick coords" mode |
| `pickedCoords` | `{ lat, lng }` | Last coordinates picked from the map |
| `flyTo` | `{ lat, lng }` | Triggers camera animation in the map |
| `clickHandlerRef` | ref | Function registered by the active panel to receive map marker clicks |

### Coordinate-picking flow

1. A panel calls `onEnableCoordPick()` (e.g. when the Add form opens).
2. MapDashboard sets `coordPickEnabled = true`, passes `onCoordsPick` to the map.
3. The map switches cursor to crosshair; any click fires `handleCoordsPick({ lat, lng })`.
4. `pickedCoords` is passed down to the active panel via props.
5. The panel reads `pickedCoords`, fills its form fields, then calls `onCoordsConsumed()` to clear it.
6. When the form closes the panel calls `onDisableCoordPick()`.

### Map click → panel handler pattern

Each panel needs to respond to marker clicks (e.g. click an element marker → open that element's detail view). Because panels are React components with their own state, a simple callback prop would go stale. The pattern used is:

```js
// In each panel:
const clickRef = useRef();
clickRef.current = (cp) => { /* closure over fresh state */ };

useEffect(() => {
  setClickHandler((cp) => clickRef.current(cp));
  return () => setClickHandler(null);
}, [setClickHandler]);
```

`MapDashboard` stores the registered function in `clickHandlerRef.current` and calls it whenever `handleCheckpointClick(cp)` fires from the map. This avoids stale closures without requiring `useCallback` on every state variable.

### Checkpoints — all tabs see all markers

MapDashboard fetches all checkpoints once and passes the same array to `Map` regardless of which tab is active. The left panel content changes on tab switch, but the map markers never change or re-render.

---

## Leaflet Map (`Map.jsx`)

The persistent map component built with the npm `leaflet` package.

### Tiles

CartoDB Voyager (`basemaps.cartocdn.com`) with `maxZoom: 20`.

### Marker clustering

`L.markerClusterGroup` with:
- `disableClusteringAtZoom: 18` — markers shown individually when zoomed in
- `maxClusterRadius: 50`
- `spiderfyOnMaxZoom: true`

### Marker colors

| Condition | Color |
|---|---|
| `cp.type === 'sensor'` | Indigo `#6366f1` |
| Tree / isGreen | Green `#33A661` |
| `elementTypeId === 2` (Shrub) | Blue `#3b82f6` |
| Other | Red `#ef4444` |

### Incremental marker diffing

To avoid the flash of `clearLayers()`, markers are managed in a plain object ref (`markersMapRef = useRef({})`). On every `checkpoints` change:

1. Keys in the ref that are no longer in the new list → `removeLayer` + delete key.
2. Keys already in the ref → skip (no re-render, marker stays on map).
3. New keys → create marker → `clusterGroup.addLayer` → store in ref.

This means switching tabs never touches a single marker.

### Coordinate picking

When `onCoordsPick` prop is non-null the map cursor becomes a crosshair. Any map `click` event calls `onCoordsPick({ lat, lng })`. The picked location is shown with a red pin (`fa-location-dot` FontAwesome icon inside a `L.divIcon`).

### flyTo

When the `flyTo` prop changes, `map.flyTo([lat, lng], 18, { animate: true, duration: 1 })` is called.

---

## Overview Panel (`OverviewPanel.jsx`)

### Views

| View | Content |
|---|---|
| `stats` (default) | Stat cards + CTA button + Recharts charts + sensor reading list |
| `add` | Full-panel `ManageElement` form with Back button |
| `detail` | Full-panel `ElementDetails` for the selected element |

### Stat cards

| Card | Metric |
|---|---|
| Elements | `elements.length` |
| Sensors | `sensors.length` |
| Green % | `(elements with isGreen).length / elements.length * 100` |
| Canopy % | `(elements with elementTypeId === 1).length / elements.length * 100` |

### Charts (Recharts)

| Chart | Type | Data |
|---|---|---|
| Green vs Non-Green | Pie | `{ name, value }` with green/non-green split |
| Element Types | Bar | Count per `elementType.name` |
| Sensor Readings | Bar (grouped) | Per sensor: temp, humidity, light |
| Canopy Coverage | Pie | Tree count vs everything else |

### Sensor readings list

Below the charts, each sensor shows its latest reading as four color-coded chips:

| Chip | Color |
|---|---|
| Temp | Game red |
| Humidity | Game blue |
| Light | Game amber |
| Soil moisture | Game green (with status label: Dry / Optimal / Moist / Saturated) |

### Map interaction

Clicking an element marker on the map calls the registered `clickHandlerRef`. OverviewPanel responds by looking up that element in `elements[]` and switching to `view = 'detail'`.

---

## Elements Panel (`ElementsPanel.jsx`)

### Data fetched on mount

- `getAllElements()` → all approved + pending
- `getPendingElements()` → pending only (subset, shown in Pending tab)
- `getElementTypes()` → type list for the filter dropdown

### Three tabs

#### All
Shows every element. Pending elements show Approve + Reject + a "Pending" badge. Approved elements show Edit + Delete.

#### Pending
Shows only pending submissions. Features:
- Select-all checkbox
- Per-row: submitter name, date, "View on map" button (calls `onFlyTo`)
- Approve / Reject per row
- **Bulk bar** — appears when ≥1 row is selected; Approve all / Reject all buttons

#### Approved
Shows only approved elements. Edit opens `ElementDetails` inline; Delete removes the element after confirmation.

### Approval flow

```
Player submits element in mobile app
        ↓
Element enters "pending" state (stored in DB)
        ↓
Staff sees it in the Pending tab
        ↓
Approve → PUT /elements/{id}/approve  → element becomes visible on the map
Reject  → PUT /elements/{id}/reject   → submission deleted
```

### Coord pick & map click

- Opening the Add panel enables coord pick; map clicks fill lat/lng fields.
- Clicking an approved element marker opens its `ElementDetails` form.
- Clicking a pending marker does nothing (it must be reviewed in the list).

---

## Sensors Panel (`SensorsPanel.jsx`)

Manages IoT sensor records. Data comes from `getAllElements()` (sensors are nested inside the overview response).

### Add sensor

An inline form at the top of the panel (toggled by the Add Sensor button). Fields:
- Sensor name
- Latitude + Longitude (type manually or click the map)

Saves via `createSensor()`.

### Per-sensor card

Each card shows:
- Name, ID
- Latitude + Longitude
- Latest readings: temp (°C), humidity (%), light (lux), soil moisture (%)
- **Edit** — turns name + coordinates into inputs; map click updates coords
- **Delete** — confirm then `deleteSensor()`
- **BLE button** — sets `bleSelectedSensorId` to this sensor's id and navigates to the Sensor Monitor tab

### Coord pick

Both the Add form and the Edit form listen for `pickedCoords` from MapDashboard. When coords arrive they're routed to whichever form is currently open.

---

## ArboretumMap (`map/ArboretumMap.jsx`)

Full-screen zone and boundary drawing interface shown only on the Zones tab. Uses CDN Leaflet (`window.L`) with Leaflet.Draw — a separate instance from the npm `leaflet` used in `Map.jsx`.

### Layers

| Layer | Style |
|---|---|
| Boundaries | Dark green, weight 3, no fill |
| Zones | Green fill (opacity 0.15), weight 2 |
| Checkpoints cluster | Same colours as Map.jsx |

### Drawing

1. Click the polygon tool (via Leaflet.Draw control).
2. Click vertices on the map; vertices snap to boundary edges (`boundarySnap.js`).
3. Close the polygon → `ZoneCreationModal` prompts for name and colour.
4. Save → POST `/boundaries` or `/zones`.

### Editing

Click a polygon to select it → inline edit form (name, colour). Vertices can be dragged or clicked to delete.

### Zone generation

For a selected boundary:
1. Enter desired zone count → POST `/boundaries/{id}/generate-preview`.
2. Preview polygons appear as dashed yellow outlines.
3. "Save Generated" → creates all at once.

### OSM import

Fetches boundary geometries from OpenStreetMap via `osmImportService` and creates them in the database.

---

## BLE Sensor Monitor (`BLEScanner.jsx`)

Real-time Bluetooth Low Energy scanner for the physical IoT sensors placed in the arboretum.

- Uses the Web Bluetooth API in the browser.
- Can optionally preselect a sensor (sensor id passed from `SensorsPanel` via `setBleSelectedSensorId`).
- Displays live readings from the connected BLE device.

---

## Data Flow Summary

```
Browser
  └─ App.jsx (React Router)
       └─ Overview.jsx  (selectedItem state)
            ├─ Navbar  ──────────────────── sets selectedItem
            └─ MapDashboard  (checkpoints, coordPick, flyTo, clickHandler)
                 ├─ OverviewPanel  ←── useOverviewData → getAllElements()
                 ├─ ElementsPanel  ←── getAllElements() + getPendingElements() + getElementTypes()
                 ├─ SensorsPanel   ←── getAllElements() (sensors nested in response)
                 └─ Map.jsx        ←── checkpoints from getCheckpoints()
                                        markers diffed incrementally
                                        coord pick fires onCoordsPick()
                                        marker click fires clickHandlerRef.current()
```

All service calls use `useAPI.jsx` which reads the JWT from `localStorage` and attaches it as a Bearer token.

---

## Design System

Colors are defined as CSS custom properties in `App.css` under Tailwind's `@theme`:

| Token | Hex | Used for |
|---|---|---|
| `game-blue` | `#1CB0F6` | Primary action buttons, active tab, sensor icon |
| `game-blue-soft` | `#DDF4FF` | Icon backgrounds, chip backgrounds |
| `game-blue-border` | `#1899D6` | 3D button bottom border |
| `game-green` | `#58CC02` | Approve, Add Element/Sensor buttons |
| `game-green-border` | `#5DA700` | 3D button bottom border |
| `game-amber` | `#FFC107` | Pending state indicators |
| `game-amber-soft` | `#FFF3D4` | Pending badge background |
| `game-red` | `#FF4B4B` | Reject, Delete buttons |
| `game-red-dark` | `#CC2525` | 3D button bottom border |
| `surface` | `#f4f4f5` | Stat card and panel backgrounds |
| `border` | `#e4e4e7` | Card and input borders |
| `text-primary` | `#27272a` | Body text |
| `text-secondary` | `#71717a` | Labels, secondary text |

---

---

# What You See — Page-by-Page UI Reference

---

## Login Page (`/`)

**Layout:** Full-screen split — green branding panel left (hidden on mobile), white login form right.

### Left panel (desktop only)
- Dark green (`primary-green`) background
- Large leaf icon in a round green circle
- Heading: **"Arboretum"** (white, 4xl bold) / **"Dasboard"** (light-green, 4xl bold)
- Italic caption: *"Humber College Office of Sustainability"*

### Right panel
- White background, centered vertically
- Heading: **"Welcome back!"**
- Subtitle: *"Sign in to the Office of Sustainability Portal"*
- **Email** input — placeholder `Sustainability@humber.ca`
- **Password** input — placeholder `••••••••`
- Red error text (shown on bad credentials)
- **Sign In** button — full-width, green
- **"Forgot your password?"** link — green underline

> Full-screen loading spinner overlays everything while the auth request is in-flight.

---

## Authenticated Shell (`/overview`)

**Layout:** Full-height flex row — fixed sidebar left, scrollable content right.

The sidebar is always visible on desktop. On mobile it is hidden until the hamburger button (top-left, dark square) is tapped — a dark overlay then covers the content area and the drawer slides in.

---

## Sidebar (Navbar)

**Header strip (70 px, black):**
- Round green icon → white leaf icon inside
- **"Humber"** (white bold) / **"Sustainability"** (light-green italic) / **"Arboretum dashboard"** (10px italic)
- × close button on mobile only

**Nav items (top-down):**

| # | Label | Icon |
|---|---|---|
| 1 | Map | `fa-map` |
| 2 | Reports | `fa-file-export` |
| 3 | Import dataset | `fa-upload` |
| 4 | Sensor Monitor | `fa-bluetooth` |
| 5 | Settings | `fa-cog` |

Active item: blue left-accent bar (`border-l-4 border-game-blue`) + subtle white tint background.
Inactive item: muted grey text, white hover.

**Footer (pinned bottom):**
- **Log Out** button — grey text, exit-bracket icon, hover turns white

---

## Map Page

This is the default view. It renders `MapDashboard`, which is a two-column layout:
- **Left column (400 px)** — tabbed panel
- **Right column (flex-1)** — persistent Leaflet map

### Tab bar (70 px header strip, white)

Left side: current tab title + subtitle *"Office of Sustainability · Arboretum"* (desktop only).
Right side: four pill buttons — **Overview**, **Elements**, **Sensors**, **Zones**.
Active tab gets a soft blue pill (`bg-game-blue-soft text-game-blue` with a faint blue border).

---

### Overview Tab (left panel)

#### Stat cards — 2×2 grid
Each card: `bg-surface rounded-xl border border-border p-4`, round colored icon on the left.

| Card | Icon bg | Icon | Metric |
|---|---|---|---|
| Elements | blue-soft | `fa-leaf` blue | Total element count |
| Sensors | blue-soft | `fa-wifi` blue | Total sensor count |
| Green | amber-soft | `fa-seedling` amber | % of elements flagged green |
| Canopy | green tint | `fa-tree` game-green | % of elements that are trees |

#### Add Element button
Full-width, 3D green — `bg-game-green border-b-[3px] border-game-green-border`, text **"+ Add Element"**.

#### Charts (each in a white card with a colored top border)
1. **Green vs Non-Green** — pie chart
2. **Element Types** — bar chart (count per type)
3. **Sensor Readings** — grouped bar chart (temp/humidity/light per sensor)
4. **Canopy Coverage** — pie chart

#### Sensors · latest readings
One card per sensor:
- Round `bg-game-blue-soft` icon + sensor name + ID + last-reading timestamp
- 2×2 chip grid per sensor:
  - **Temp** — red bg / red value
  - **Humidity** — blue-soft bg / blue value
  - **Light** — amber-soft bg / amber value
  - **Soil** — green tint bg / green value + status label (Dry / Optimal / Moist / Saturated)

#### View states
| State | Triggered by | Shows |
|---|---|---|
| `stats` | default | everything above |
| `add` | clicking "Add Element" | Back button + ManageElement form |
| `detail` | clicking a map element marker | Back button + ElementDetails form |

---

### Add Element form (`ManageElement` / `NatureElement`)

Slides in as a full-panel replacement when "Add Element" is clicked.

**Header strip (green, 40 px):** leaf icon + **"Add Element"**

**Form fields:**
- **Element image** — click-to-upload preview square (gray placeholder before upload)
- **Element name** — text input
- **Element type** — `<select>` populated from `/elements/types`
- **Latitude** + **Longitude** — two side-by-side inputs; auto-filled when you click the map (map cursor switches to crosshair)
- **isGreen** checkbox
- **Save** button (green) + **Cancel** button (grey)

---

### Element Detail form (`ElementDetails`)

Shown when clicking an approved element marker on the map.

**Image area (120 px):** current image (click to replace in edit mode) or grey placeholder. Overlay text *"Click to change image"* in edit mode.

**Two-column field grid:**
- Left: Name, Element type dropdown, isGreen checkbox
- Right: Latitude, Longitude

**Button row:**
- View mode: **Edit** (green) + **Delete** (red)
- Edit mode: **Save** (green) + **Cancel** (grey)
- Buttons show *"Saving…"* / *"Deleting…"* during async calls.

---

### Elements Tab (left panel)

#### Stat cards — 1×3 grid
| Card | Icon bg | Metric |
|---|---|---|
| Total | blue-soft | All elements |
| Pending | amber-soft | Submissions awaiting review |
| Approved | green tint | Approved count |

#### Toolbar (below stats)
- **Tab switcher:** All · Pending (n) · Approved — active tab is game-blue pill
- **Search** input — full-text name filter
- **Add** button — 3D green, `fa-plus`
- **Type filter** — `<select>` dropdown below toolbar

#### All tab
List of `rounded-xl border border-border bg-white p-4` cards.
Each card: thumbnail image + name + type + coordinates.
- **Pending element actions:** Approve (3D green) · Reject (3D red) · *Pending* amber badge
- **Approved element actions:** Edit (3D blue) · Delete (3D red)

#### Pending tab
- **Select all** checkbox above list
- Same card structure + submitter name, date, **"View on map"** link (blue, flies map camera there)
- **Bulk action bar** (amber-soft bg) — appears when ≥1 selected: *n selected* · Approve all (green) · Reject all (red) · Clear

#### Approved tab
Same cards — Edit (3D blue) + Delete (3D red). Selected card gets a blue-soft highlight ring.

#### Add / Edit panel
Replaces the list with a Back button + the same `ManageElement` or `ElementDetails` form described above.

---

### Sensors Tab (left panel)

#### Header strip (white, border-bottom)
- **"All Sensors"** heading + *"n sensors registered"* subtitle
- **Add Sensor** button — 3D blue (`bg-game-blue border-b-[3px] border-game-blue-border`)

#### Add Sensor form (inline, shown below header when toggled)
White card with a blue header strip **"New Sensor"**.
Fields: **Sensor name**, **Latitude**, **Longitude** (side-by-side).
Hint: *"Click on the map to fill coordinates."*
Buttons: **Save** (3D green) · **Cancel** (surface/border)

#### Sensor cards
Each sensor renders a `rounded-xl border border-border bg-white p-4` card.

**Name row:**
- Round `bg-game-blue-soft` icon → `fa-wifi` blue
- Sensor name (bold sm) + *"ID #n"*
- **Action buttons** (right-aligned):
  - **BLE** button (blue-soft bg, bluetooth icon) — opens Sensor Monitor tab pre-selecting this sensor
  - **Edit** (3D blue)
  - **Del** (3D red)

**Coordinates row:**
- Latitude + Longitude values (plain text in view mode, inputs in edit mode)
- In edit mode: blue italic hint *"Click on the map to update coordinates."*

**Reading chips — 4-column grid:**
| Chip | Background | Value colour |
|---|---|---|
| Temp | red-50 | game-red |
| Hum | game-blue-soft | game-blue |
| Light | game-amber-soft | amber (#CC8B00) |
| Soil | green tint | game-green |

Edit mode: name and coordinate fields become inputs; card gets a blue border ring.

---

### Zones Tab

Replaces the two-column layout with a **full-screen zone editor** (`ArboretumMap`).

#### Header (70 px, white)
- **"Arboretum Map"** + *"Office of Sustainability · Now updated"*
- Zone count badge (green text on grey bg) or loading spinner

#### Map area + Layer sidebar (side by side)
- **Leaflet map** (460 px tall) — boundaries (dark green outlines), zones (green fill), clustered element/sensor markers
- **Layer sidebar** — toggle visibility of: Boundaries, Zones, Checkpoints

#### Control panel (below map)
Changes based on selection state:

**Nothing selected (default):**
- Title **"Zone Manager"**
- Instruction text
- **Draw Boundary** button (white, bordered)
- Search input — filters elements/sensors by name; results show colour dot + name + type badge + zone name

**Drawing in progress:**
- Instruction text (updates with vertex count)
- **Cancel** button (top-right ×)
- When geometry is complete: Name input + colour picker + **Discard** / **Save** buttons

**Boundary selected:**
- Colour dot + boundary name + *"Boundary"* badge
- **Deselect** × button
- Editable fields: Name, colour picker
- **Edit points** button, **Delete** (with confirm/cancel toggle), **Save Changes**
- *Zones within this boundary* — scrollable list of zone colour dots + names
- **Add Zone** button
- *Generate Zones* section — number input (1–20) + **Preview** button → shows dashed yellow preview polygons → **Save N Zones** + **Clear**

**Zone selected:**
- Same edit form as boundary
- *Sensors & Elements* section — scrollable list of checkpoints in this zone (colour dot + name + type badge)

#### Map legend (bottom strip)
Colour dot + label for: Boundary · Section · Sensor · Tree/Green · Shrub · Other element

---

## Sensor Monitor Page

Opened from the sidebar or via the BLE button on any sensor card.

**Layout:** Full-height flex column, scrollable.

### Connect card (white, rounded, shadow)
- **Left:** Status icon circle
  - Idle/Connecting: indigo bg + `fa-wifi`
  - Connected: green bg + `fa-wifi`
- **Status text:**
  - Idle: *"No sensor connected"* + instruction subtitle
  - Connecting: *"Connecting…"* spinner
  - Connected: device name + green *"Connected"* badge + *"Live — receiving readings every ~1 s"*
- **Right:** Connect / Disconnect button
  - Idle: blue **Connect Sensor** button
  - Connecting: blue button with spinner
  - Connected: grey **Disconnect** button
  - Auto-save indicator (red pulse dot + *"Recording · n saved"*)
  - Live indicator (green pulse dot + *"Live"*)

### Onboarding steps (idle only)
Three cards in a grid (numbered 1–2–3, indigo circles):
1. *"Open Bluetooth"* — `fa-bluetooth`
2. *"View live data"* — `fa-chart-line`
3. *"Log readings"* — `fa-floppy-disk`

> Banner shown when Web Bluetooth is unavailable: amber warning box saying to use Chrome.

### Log Reading panel (connected only)
- **Auto-log toggle** (grey = off, red = on)
- **Sensor selector** — dropdown (existing sensors) or manual ID text input
- Auto-log off: **Save Reading** (green) button
- Auto-log on: red spinner indicator + **Stop** button

### Current Readings grid (connected only)
5-column (md), 2-column (mobile) grid of `ReadingCard` components:

| Card | Icon | Value |
|---|---|---|
| Temperature | thermometer | °C value |
| Humidity | droplet | % value |
| Light | sun | lux value |
| Soil Moisture | seedling | % value |
| Soil Health | status icon | Dry / Optimal / Moist / Saturated badge |

Grey skeleton placeholders shown before first reading arrives.

### Reading History chart (connected only)
- Title + subtitle about optimal soil range (25–70%)
- Toggle buttons to show/hide each line (Temp / Humidity / Light / Soil)
- Recharts `LineChart` — last 60 readings, dashed reference lines for soil bounds
- Loading skeleton if no data yet

---

## Reports Page

**Layout:** Flex column, full height.

**Header:** **"Generate Reports"** (via `DashboardNavBar`)

### Time range section
- **From** date input
- **To** date input

### Report content section
Four checkbox groups in a 1–2–4 column grid:

| Group 1 | Group 2 | Group 3 | Group 4 |
|---|---|---|---|
| Trees | Sensor data | Green vs non-green | Line charts |
| Bushes | Light | Native vs non-native | Bar charts |
| Water | Temperature | Biodiversity | Pie charts |
| Species | Humidity | Net zero-goal indicator | Arboretum map |

### Report type section
Three checkboxes in a row: **CSV** · **PDF** · **Plain text**

### Generate button
Right-aligned, green — **"Generate Report"**.

---

## Import Dataset Page

**Header:** **"Import Dataset"**

### Download template
Green **"Download template file"** button with `fa-download` icon.

### Upload area (clickable card)
- Green square with large `fa-upload` icon (white)
- **"Upload Dataset"** heading
- Shows selected file count or default prompt text
- *"Accepted file type: CSV"* hint

Hidden `<input type="file" accept=".csv" multiple />` behind the card.

### Preview section (after file selected)
- **"Imported Data Preview"** heading
- `PreviewTable` component — scrollable horizontal table of the CSV contents

### Import button (after file selected)
Right-aligned green **"Import dataset"** button.

> Full-screen loading overlay while upload is in progress.

---

## Settings Page

**Layout:** `p-8` padding, flex column, max-width 2xl.

Title: **"Settings"** + subtitle *"Manage your dashboard preferences and users."*

### Non-admin view
Lock icon card with message: *"Only admins can manage user accounts."*

### Admin view — Create Staff User card
Border, rounded-xl, `p-6`.
- **Full Name** input
- **Email** input
- **Password** input
- Error text (red) / Success text (green)
- **Create Staff User** button (green, disabled during load)

### Admin view — User Management card
Border, rounded-xl, `p-6`.

Table with columns: **Name · Email · Role · Actions**

Per row:
- Name (bold) + Email (grey)
- **Role badge:** Admin = purple pill · Staff = blue pill
- **"Make Staff"** or **"Make Admin"** button (grey border)
- **"Delete"** button (red border/text)
- Buttons disabled for the currently logged-in user
- Show *"…"* while action is in-flight

Buttons follow a 3D style: `bg-{color} border-b-[3px] border-{color}-border rounded-xl` which echoes the game's `GameButton` component.
