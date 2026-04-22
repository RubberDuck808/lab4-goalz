# Arboretum Map — Zone Management

The map page (`/map`) lets staff draw, edit, and delete zone boundaries over the Humber Arboretum. All zone data is stored in PostGIS via the backend Zone API.

GitLab issue: [#32](https://git.technikum-wien.at/global-acting-in-it/goalz/lab4-goalz/-/issues/32)

---

## Files

| File | Role |
|---|---|
| `frontend/dashboard/src/components/dashboard/map/ArboretumMap.jsx` | Map page component — all drawing, editing, and CRUD logic |
| `frontend/dashboard/src/services/zoneService.jsx` | API calls: `getAllZones`, `createZone`, `updateZone`, `deleteZone` |
| `frontend/dashboard/src/services/osmImportService.js` | Fetches zone shapes from the Overpass API and converts them to zone DTOs |
| `frontend/dashboard/index.html` | Loads Leaflet, Leaflet-Draw, and leaflet-image via CDN |
| `backend/Goalz/Goalz.API/Controllers/Dashboard/ZoneController.cs` | REST endpoints: `GET/POST /api/dashboard/zones`, `PUT/DELETE /api/dashboard/zones/{id}` |
| `backend/Goalz/Goalz.Application/Services/ZoneService.cs` | Business logic: name validation, boundary patching |
| `backend/Goalz/Goalz.Data/Repositories/ZoneRepository.cs` | EF Core queries against the `Zones` table |

---

## Critical: Single Leaflet Instance

`index.html` loads Leaflet via CDN, which sets `window.L`. Leaflet-Draw and leaflet-image attach to this CDN copy.

**Every file that uses Leaflet must do:**
```js
const L = window.L
```

**Never do:**
```js
import * as L from 'leaflet'        // creates a second instance
import 'leaflet/dist/leaflet.css'   // also wrong — breaks Draw
```

If `L.Control.Draw` or `L.Draw.Event` is undefined, a file has imported from npm instead of using `window.L`.

---

## Zone Types

| `zoneType` | Fill | Stroke weight | Default color |
|---|---|---|---|
| `boundary` | None (outline only) | 3px | `#1A5C2E` |
| `area` | 15% opacity | 2px | `#2D7D46` |
| `path` | None (outline only) | 2px | `#8B6914` |

`buildStyle(zone, selected)` in `ArboretumMap.jsx` controls this. When `selected = true`, stroke turns yellow (`#facc15`).

---

## Performance

The map is initialised with `preferCanvas: true`, which renders all zone polygons on a single `<canvas>` element instead of individual SVG nodes. This significantly reduces DOM size when many zones are loaded.

Tile layer uses `updateWhenZooming: false` and `updateWhenIdle: true` so tiles only fetch when the user stops panning/zooming, not continuously during the gesture.

---

## Cursor Tooltips Suppressed

Leaflet-Draw shows cursor-following tooltip text by default ("Click to start drawing", "Click cancel to undo changes", etc.). These are cleared in the map `useEffect` so no text appears near the cursor:

```js
const t = L.drawLocal.draw.handlers
t.polygon.tooltip = { start: '', cont: '', end: '' }
t.polyline.tooltip = { start: '', cont: '', end: '' }
L.drawLocal.edit.handlers.edit.tooltip = { text: '', subtext: '' }
L.drawLocal.edit.handlers.remove.tooltip = { text: '' }
```

All guidance text is shown in the panel below the map instead.

---

## Drawing a New Zone

1. Click **Draw Zone** in the panel → calls `handleStartDraw()`.
2. `L.Draw.Polygon` is enabled manually (no toolbar). `map.dragging.enable()` is called immediately after to restore panning.
3. `drawHandlerRef._editMode = false` marks this as a create operation.
4. On `L.Draw.Event.CREATED`, the GeoJSON geometry is stored in `pendingGeometry` state.
5. The panel description updates live with vertex count guidance.
6. On submit, `createZone(dto)` is called, then zones reload.

---

## Editing an Existing Zone

Click any zone on the map → it becomes `selectedZone` (highlighted yellow). The panel switches to edit mode:

- **Name / Type / Color** form fields — saved via `PUT /api/dashboard/zones/{id}`
- **Edit points** — loads the existing polygon into `drawnItems` as an `L.EditToolbar.Edit` instance. White vertex handles appear; drag to adjust. Click **Done** to extract updated geometry into `editPendingGeometry`, then **Save Changes** to persist.
- **Delete** — `window.confirm` then `DELETE /api/dashboard/zones/{id}`.

Redraw-from-scratch was removed — to replace a boundary, use **Edit points** (for small tweaks) or **Delete** + draw a new zone.

Press **Esc** to cancel the active operation (vertex editing → drawing → deselect zone), in that priority order.

---

## Boundary-Aware Drawing

When a zone with `zoneType === 'boundary'` exists, new-zone drawing becomes constrained to it:

- **Out-of-bounds clicks are blocked.** `L.Draw.Event.DRAWVERTEX` reads the just-placed vertex; if `isInsideRing` returns false, `drawHandlerRef.current.deleteLastVertex()` immediately removes it.
- **Closing arc snaps to the boundary curve.** On `L.Draw.Event.CREATED`, if both the first and last drawn vertex are within `SNAP_TOLERANCE_METERS` (default 15m) of the boundary ring, `snapClosingSegment` (from `boundarySnap.js`) projects both onto the ring, picks the **shorter arc** between them, and splices the arc's vertices between them. The resulting polygon follows the curved boundary instead of closing with a straight chord.
- When no boundary zone exists (e.g. empty DB), both validations are skipped — drawing behaves normally.

All snap/in-out helpers live in `frontend/dashboard/src/components/dashboard/map/boundarySnap.js` and are pure — no Leaflet dependency, just `{lat, lng}` objects.

---

## Layer Sidebar

`LayerSidebar.jsx` renders four toggle pills absolutely-positioned on the left of the map, stacked bottom-to-top to match z-order:

1. **Boundary** — the single `zoneType: 'boundary'` zone
2. **Zones** — all `area` / `path` zones
3. **Sensors** — placeholder circle markers (blue) — `PLACEHOLDER_SENSORS` in `ArboretumMap.jsx`
4. **Elements** — placeholder circle markers (orange) — `PLACEHOLDER_ELEMENTS` in `ArboretumMap.jsx`

Visibility state lives in `layerVisibility` on `ArboretumMap.jsx`. A `useEffect` watches it and adds/removes the relevant Leaflet layers from the map. `layerVisibilityRef` mirrors the state so `addZoneLayer` (called during reload) can respect the current toggle without re-running.

Sensors and Elements are placeholders only. Replace `PLACEHOLDER_SENSORS` / `PLACEHOLDER_ELEMENTS` with calls to the backend (`/api/dashboard/overview` returns both) when wiring real data.

---

## Stale Closure Pattern

Map event handlers (registered once in `useEffect`) need access to current React state. Because they close over the initial state, a ref is used:

```js
const handleZoneClickRef = useRef(null)
handleZoneClickRef.current = (zone) => { /* always has current state */ }

// Inside useEffect:
layer.on('click', (e) => handleZoneClickRef.current(zone))
```

Any new map-level event listener that needs React state should follow this pattern.

---

## OSM Import

`fetchOsmZones()` in `osmImportService.js` posts an Overpass QL query for the Humber Arboretum bounding box (`43.715,-79.625,43.740,-79.595`) and converts results:

- `way` with closed geometry + no highway tag → `area` (Polygon)
- `way` with `highway=path|footway` or open geometry → `path` (LineString)
- `relation` → `boundary` (MultiPolygon, outer members only)

Results are deduplicated by name before being posted to the backend one by one. To change the area, update `BBOX` in `osmImportService.js`.

The `handleImportFromOsm` and `handleExport` functions exist in `ArboretumMap.jsx` but currently have no UI buttons — they were removed from the header. Wire them back up if a trigger is needed.

---

## Adding a New Zone Type

1. Add an entry to `ZONE_TYPES` in `ArboretumMap.jsx`.
2. Update `buildStyle()` if the new type needs different fill/stroke rules.
3. Add the value to the `ZoneType` enum in the backend domain model and run a migration if the column is constrained.
