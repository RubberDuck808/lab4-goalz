import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { snapClosingSegment, isInsideRing, nearestPointOnRing, SNAP_TOLERANCE_METERS } from '../map/boundarySnap'
import DashboardChatbot from '../chatbot/DashboardChatbot'

// ── tile providers ─────────────────────────────────────────────────────────
const TILE_PROVIDERS = {
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 22,
      maxNativeZoom: 20
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 22,
      maxNativeZoom: 19
    }
  }
}

// ── styling helpers ────────────────────────────────────────────────────────
function checkpointColor(cp, elementTypes = []) {
  if (cp.type === 'sensor') return '#6366f1' // bg-indigo-500
  const typeObj = elementTypes.find(t => (t.id ?? t.Id) === cp.elementTypeId)
  const name = typeObj?.name ?? typeObj?.Name ?? ''
  switch (name) {
    case 'Tree':          return '#059669' // bg-emerald-600
    case 'Shrub':         return '#3b82f6' // bg-blue-500
    case 'Grass/lawn':    return '#34d399' // bg-emerald-400
    case 'Mulch':         return '#b45309' // bg-amber-700
    case 'Garden bed':    return '#ec4899' // bg-pink-500
    case 'Ground cover':  return '#84cc16' // bg-lime-500
    case 'Green roof':    return '#06b6d4' // bg-cyan-500
    case 'Water body':    return '#1d4ed8' // bg-blue-700
    default:              return '#10b981' // bg-game-green
  }
}

function checkpointIcon(cp, elementTypes = []) {
  if (cp.type === 'sensor') return 'fa-wifi'
  const typeObj = elementTypes.find(t => (t.id ?? t.Id) === cp.elementTypeId)
  const name = typeObj?.name ?? typeObj?.Name ?? ''
  switch (name) {
    case 'Tree':          return 'fa-seedling'
    case 'Shrub':         return 'fa-leaf'
    case 'Grass/lawn':    return 'fa-clover'
    case 'Mulch':         return 'fa-trowel'
    case 'Garden bed':    return 'fa-spa'
    case 'Ground cover':  return 'fa-leaf'
    case 'Green roof':    return 'fa-building'
    case 'Water body':    return 'fa-water'
    default:              return 'fa-seedling'
  }
}

function buildZoneStyle(zone, selected = false) {
  const isBoundary = zone._isBoundary === true
  return {
    color: selected ? '#facc15' : (zone.color ?? '#33A661'),
    weight: selected ? 3 : (isBoundary ? 3 : 2),
    fillOpacity: isBoundary ? 0 : (selected ? 0.25 : 0.15),
    fillColor: zone.color ?? '#33A661',
  }
}

function extractBoundaryRing(zone) {
  const g = zone?.boundary
  if (!g) return null
  const ringCoords =
    g.type === 'Polygon' ? g.coordinates[0]
    : g.type === 'MultiPolygon' ? g.coordinates[0]?.[0]
    : null
  if (!ringCoords) return null
  const closed =
    ringCoords.length > 1 &&
    ringCoords[0][0] === ringCoords[ringCoords.length - 1][0] &&
    ringCoords[0][1] === ringCoords[ringCoords.length - 1][1]
  return (closed ? ringCoords.slice(0, -1) : ringCoords).map(([lng, lat]) => ({ lat, lng }))
}

function geojsonToEditableLayer(geometry) {
  if (!geometry) return null
  const flip = coords => coords.map(([lng, lat]) => [lat, lng])
  switch (geometry.type) {
    case 'Polygon':      return L.polygon(geometry.coordinates.map(flip))
    case 'MultiPolygon': return L.polygon(geometry.coordinates.map(p => flip(p[0])))
    case 'LineString':   return L.polyline(flip(geometry.coordinates))
    default: return null
  }
}

// ── component ──────────────────────────────────────────────────────────────
const NativeMap = globalThis.Map // save built-in before the component shadows it

const DashboardMap = forwardRef(function DashboardMap({
  // coord pick
  closeModal,
  onCoordsPick,
  pickedCoords,
  // checkpoint markers
  checkpoints,
  elementTypes = [],
  showDetailedElements = false,
  onCheckpointClick,
  // programmatic navigation
  flyTo,
  userLocation,
  // zone polygons
  zones = [],
  showZones = false,
  selectedZone = null,
  onZoneClick,
  // draw mode
  drawConfig = null,       // { active, mode: 'boundary'|'zone'|'section' }
  onDrawCreated,           // fn(geojsonGeometry)
  onVertexCountChange,     // fn(n)
  // vertex edit mode
  editVerticesConfig = null, // { active, zone }
  onVerticesSaved,         // fn(geom | null)
  // preview polygons (dashed yellow, read-only)
  previewZones = [],
}, ref) {
  const mapRef             = useRef(null)
  const mapInstanceRef     = useRef(null)
  const tileLayerRef       = useRef(null)
  const [mapType, setMapType] = useState('streets')
  const [locating, setLocating]             = useState(false)
  const [locationActive, setLocationActive] = useState(false)
  const internalLocationRef                 = useRef(null)
  // checkpoint cluster
  const clusterGroupRef    = useRef(null)
  const hasFitRef          = useRef(false)
  // callback refs (stable identity)
  const onCoordsPickRef        = useRef(onCoordsPick)
  const onCheckpointClickRef   = useRef(onCheckpointClick)
  const onZoneClickRef         = useRef(onZoneClick)
  const onDrawCreatedRef       = useRef(onDrawCreated)
  const onVertexCountChangeRef = useRef(onVertexCountChange)
  const onVerticesSavedRef     = useRef(onVerticesSaved)
  // markers
  const pickedMarkerRef        = useRef(null)
  const userLocationMarkerRef  = useRef(null)
  // zone layers
  const zoneLayersRef    = useRef(new NativeMap())
  const selectedZoneRef  = useRef(selectedZone)
  const previewLayersRef = useRef([])
  // draw / edit
  const drawnItemsRef    = useRef(null)
  const drawHandlerRef   = useRef(null)
  const editHandlerRef   = useRef(null)
  const boundaryRingRef  = useRef([])
  const drawConfigRef    = useRef(drawConfig)
  const drawVertexCount  = useRef(0)

  // keep refs in sync
  useEffect(() => { onCoordsPickRef.current = onCoordsPick },               [onCoordsPick])
  useEffect(() => { onCheckpointClickRef.current = onCheckpointClick },     [onCheckpointClick])
  useEffect(() => { onZoneClickRef.current = onZoneClick },                 [onZoneClick])
  useEffect(() => { onDrawCreatedRef.current = onDrawCreated },             [onDrawCreated])
  useEffect(() => { onVertexCountChangeRef.current = onVertexCountChange }, [onVertexCountChange])
  useEffect(() => { onVerticesSavedRef.current = onVerticesSaved },         [onVerticesSaved])
  useEffect(() => { drawConfigRef.current = drawConfig },                   [drawConfig])

  // ── imperative handle ──────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    clearDrawnPreview() {
      drawnItemsRef.current?.clearLayers()
    },
  }))

  // ── vertex edit handlers (defined before effects) ──────────────────────
  function stopVertexEdit(save) {
    if (!editHandlerRef.current) { onVerticesSavedRef.current?.(null); return }
    let geom = null
    if (save) {
      editHandlerRef.current.save()
      const layers = drawnItemsRef.current?.getLayers() ?? []
      if (layers.length > 0) geom = layers[0].toGeoJSON().geometry
    } else {
      editHandlerRef.current.revertLayers()
    }
    editHandlerRef.current.disable()
    editHandlerRef.current = null
    drawnItemsRef.current?.clearLayers()
    onVerticesSavedRef.current?.(geom)
  }

  // ── flyTo effect ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !flyTo) return
    map.flyTo([flyTo.lat, flyTo.lng], 18, { animate: true, duration: 1 })
  }, [flyTo])

  // ── cursor effect ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.getContainer().style.cursor = onCoordsPick ? 'crosshair' : ''
  }, [onCoordsPick])

  // ── map init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return

    const container = mapRef.current
    if (container._leaflet_id) { container._leaflet_id = null; delete container._leaflet_id }

    const map = L.map(container, { attributionControl: false, zoomSnap: 0.5, maxZoom: 22 }).setView([43.7260, -79.6099], 15)
    mapInstanceRef.current = map

    // panes for zone polygons
    map.createPane('zonePane').style.zIndex = '390'
    map.createPane('boundaryPane').style.zIndex = '410'

    const provider = TILE_PROVIDERS['streets']
    const baseLayer = L.tileLayer(provider.url, provider.options).addTo(map)
    tileLayerRef.current = baseLayer

    map.setMinZoom(0)
    map.zoomControl.setPosition('bottomleft')

    // checkpoint cluster
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 50,
    })
    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup

    // drawn items layer (draw + vertex edit)
    const drawnItems = new L.FeatureGroup().addTo(map)
    drawnItemsRef.current = drawnItems

    // silence leaflet-draw tooltips
    try {
      const t = L.drawLocal.draw.handlers
      t.polygon.tooltip = { start: '', cont: '', end: '' }
      t.polyline.tooltip = { start: '', cont: '', end: '' }
      L.drawLocal.edit.handlers.edit.tooltip = { text: '', subtext: '' }
      L.drawLocal.edit.handlers.remove.tooltip = { text: '' }
    } catch (_) {}

    // draw events
    map.on(L.Draw.Event.CREATED, (e) => {
      const drawnLatLngs = e.layer.getLatLngs()[0]
      const mode = drawConfigRef.current?.mode
      const isSection = mode === 'section'
      const activeBoundary = selectedZoneRef.current
      const ring = (isSection && activeBoundary?._isBoundary) ? extractBoundaryRing(activeBoundary) : null
      const finalRing = ring ? snapClosingSegment(drawnLatLngs, ring) : drawnLatLngs
      const snapped = L.polygon(finalRing, { color: '#1CB0F6', weight: 2, fillOpacity: 0.2 })
      drawnItems.addLayer(snapped)
      const coords = finalRing.map(p => [p.lng, p.lat])
      coords.push([finalRing[0].lng, finalRing[0].lat])
      drawVertexCount.current = 0
      onDrawCreatedRef.current?.({ type: 'Polygon', coordinates: [coords] })
      onVertexCountChangeRef.current?.(0)
    })

    map.on(L.Draw.Event.DRAWSTOP, () => {
      drawVertexCount.current = 0
      onVertexCountChangeRef.current?.(0)
    })

    map.on(L.Draw.Event.DRAWVERTEX, () => {
      const mode = drawConfigRef.current?.mode
      const activeBoundary = selectedZoneRef.current
      const ring = (mode === 'section' && activeBoundary?._isBoundary) ? extractBoundaryRing(activeBoundary) : null
      if (ring) {
        const markers = drawHandlerRef.current?._markers
        if (markers?.length) {
          const last = markers[markers.length - 1]
          const ll = last.getLatLng()
          const pt = { lat: ll.lat, lng: ll.lng }
          const near = nearestPointOnRing(ring, pt)
          if (near.dist <= SNAP_TOLERANCE_METERS) {
            last.setLatLng(L.latLng(near.projected.lat, near.projected.lng))
          }
        }
      }
      drawVertexCount.current += 1
      onVertexCountChangeRef.current?.(drawVertexCount.current)
    })

    // block drawing outside boundary ring in 'section' mode
    const blockOutsideClick = (domEvent) => {
      if (drawConfigRef.current?.mode !== 'section') return
      const activeBoundary = selectedZoneRef.current
      const ring = (activeBoundary?._isBoundary) ? extractBoundaryRing(activeBoundary) : null
      if (!ring) return
      const ll = map.mouseEventToLatLng(domEvent)
      if (!isInsideRing({ lat: ll.lat, lng: ll.lng }, ring)) {
        domEvent.stopPropagation(); domEvent.preventDefault()
      }
    }
    container.addEventListener('mousedown', blockOutsideClick, true)
    container.addEventListener('touchstart', blockOutsideClick, { capture: true, passive: false })

    // map click → coord pick OR zone deselect
    map.on('click', (e) => {
      if (onCoordsPickRef.current) {
        onCoordsPickRef.current({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) })
        return
      }
      onZoneClickRef.current?.(null)
    })

    return () => {
      container.removeEventListener('mousedown', blockOutsideClick, true)
      container.removeEventListener('touchstart', blockOutsideClick, { capture: true })
      hasFitRef.current = false
      clusterGroupRef.current?.clearLayers()
      clusterGroupRef.current = null
      zoneLayersRef.current.clear()
      if (internalLocationRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(internalLocationRef.current)
        internalLocationRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (container._leaflet_id) { container._leaflet_id = null; delete container._leaflet_id }
    }
  }, [])

  // ── mapType tile switcher effect ───────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const provider = TILE_PROVIDERS[mapType]
    const layer = L.tileLayer(provider.url, provider.options).addTo(map)
    tileLayerRef.current = layer
  }, [mapType])

  // ── checkpoints effect ─────────────────────────────────────────────────
  useEffect(() => {
    if (!clusterGroupRef.current || !checkpoints) return

    const clusterGroup = clusterGroupRef.current
    clusterGroup.clearLayers()

    for (const cp of checkpoints) {
      const color = checkpointColor(cp, elementTypes)
      const iconClass = checkpointIcon(cp, elementTypes)
      const borderStyle = cp.isPending
        ? 'border: 2.5px dashed #eab308; box-shadow: 0 0 0 3.5px rgba(234, 179, 8, 0.45);'
        : 'border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);'
      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};${borderStyle}display:flex;align-items:center;justify-content:center;color:white;"><i class="fa-solid ${iconClass}" style="font-size:10px;"></i></div>`,
        className: '', iconSize: [24, 24], iconAnchor: [12, 12],
      })
      const marker = L.marker([cp.latitude, cp.longitude], { icon })
      marker.on('click', () => onCheckpointClickRef.current?.(cp))
      clusterGroup.addLayer(marker)
    }

    if (!hasFitRef.current && checkpoints.length >= 2) {
      try {
        const latlngs = checkpoints.map(cp => [cp.latitude, cp.longitude]);
        const bounds = L.latLngBounds(latlngs);
        if (bounds.isValid()) {
          mapInstanceRef.current?.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
          hasFitRef.current = true;
        }
      } catch (err) {
        console.error("Map.jsx: Error fitting bounds:", err);
      }
    }
  }, [checkpoints, elementTypes, showDetailedElements])

  // ── picked coords effect ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (pickedMarkerRef.current) { map.removeLayer(pickedMarkerRef.current); pickedMarkerRef.current = null }
    if (!pickedCoords) return
    const pinIcon = L.divIcon({
      html: `<i class="fa-solid fa-location-dot" style="font-size:32px;color:#ff5722;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4));"></i>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 32],
    })
    pickedMarkerRef.current = L.marker([pickedCoords.lat, pickedCoords.lng], { icon: pinIcon }).addTo(map)
  }, [pickedCoords])

  // ── user location effect ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (userLocationMarkerRef.current) { map.removeLayer(userLocationMarkerRef.current); userLocationMarkerRef.current = null }
    if (!userLocation) return
    const icon = L.divIcon({
      html: `<style>@keyframes ul-pulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(3);opacity:0}}.ul-ring{animation:ul-pulse 1.5s ease-out infinite}</style><div style="position:relative;width:20px;height:20px;"><div class="ul-ring" style="position:absolute;inset:-2px;border-radius:50%;background:#2563eb;"></div><div style="position:absolute;inset:2px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div></div>`,
      className: '', iconSize: [20, 20], iconAnchor: [10, 10],
    })
    userLocationMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip('You are here', { permanent: false, direction: 'top', offset: [0, -10] })
  }, [userLocation])

  // ── zone layers effect ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // tear down existing layers
    zoneLayersRef.current.forEach(({ layer }) => { try { map.removeLayer(layer) } catch (_) {} })
    zoneLayersRef.current.clear()

    if (!showZones || !zones.length) {
      boundaryRingRef.current = []
      return
    }

    // update snap rings
    boundaryRingRef.current = zones.filter(z => z._isBoundary).map(extractBoundaryRing).filter(Boolean)

    zones.forEach(zone => {
      if (!zone.boundary) return
      const isBoundary = zone._isBoundary === true
      const pane = isBoundary ? 'boundaryPane' : 'zonePane'
      const layer = L.geoJSON(zone.boundary, { style: () => buildZoneStyle(zone, false), pane })
      layer.bindTooltip(zone.name, { permanent: false, direction: 'center' })
      layer.on('click', e => { L.DomEvent.stopPropagation(e); onZoneClickRef.current?.(zone) })
      layer.on('mouseover', () => {
        if (zone.id !== selectedZoneRef.current?.id)
          layer.setStyle({ weight: 3, fillOpacity: isBoundary ? 0 : 0.25 })
      })
      layer.on('mouseout', () => {
        if (zone.id !== selectedZoneRef.current?.id)
          layer.setStyle(buildZoneStyle(zone, false))
      })
      layer.addTo(map)
      zoneLayersRef.current.set(zone.id, { layer, zone })
    })
  }, [zones, showZones])

  // ── zone selection styling ─────────────────────────────────────────────
  useEffect(() => {
    const prev = selectedZoneRef.current
    selectedZoneRef.current = selectedZone

    if (prev) {
      const entry = zoneLayersRef.current.get(prev.id)
      if (entry) entry.layer.setStyle(buildZoneStyle(prev, false))
    }
    if (selectedZone) {
      const entry = zoneLayersRef.current.get(selectedZone.id)
      if (entry) entry.layer.setStyle(buildZoneStyle(selectedZone, true))
    }
  }, [selectedZone])

  // ── draw config effect ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (drawHandlerRef.current) {
      drawHandlerRef.current.disable()
      drawHandlerRef.current = null
    }

    if (!drawConfig?.active) return

    drawVertexCount.current = 0
    const handler = new L.Draw.Polygon(map, {
      allowIntersection: true,
      showArea: false,
      shapeOptions: { color: '#1CB0F6', weight: 2, fillOpacity: 0.2 },
    })
    drawHandlerRef.current = handler
    handler.enable()
  }, [drawConfig])

  // ── vertex edit effect ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (!editVerticesConfig?.active || !editVerticesConfig?.zone) {
      if (editHandlerRef.current) {
        editHandlerRef.current.disable()
        editHandlerRef.current = null
      }
      return
    }

    const layer = geojsonToEditableLayer(editVerticesConfig.zone.boundary)
    if (!layer) return
    drawnItemsRef.current?.clearLayers()
    drawnItemsRef.current?.addLayer(layer)
    editHandlerRef.current = new L.EditToolbar.Edit(map, { featureGroup: drawnItemsRef.current })
    editHandlerRef.current.enable()
    map.dragging.enable()
  }, [editVerticesConfig])

  // ── preview zones (generated, dashed yellow) ───────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    previewLayersRef.current.forEach(l => { try { map.removeLayer(l) } catch (_) {} })
    previewLayersRef.current = []
    previewZones.forEach(geom => {
      const l = L.geoJSON(geom, { style: () => ({ color: '#facc15', weight: 2, dashArray: '6 4', fillColor: '#facc15', fillOpacity: 0.12 }) })
      l.addTo(map)
      previewLayersRef.current.push(l)
    })
  }, [previewZones])

  // ── my-location handler ────────────────────────────────────────────────
  function handleLocate() {
    const map = mapInstanceRef.current
    if (locationActive) {
      if (internalLocationRef.current) { map?.removeLayer(internalLocationRef.current); internalLocationRef.current = null }
      setLocationActive(false)
      return
    }
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!mapInstanceRef.current) { setLocating(false); return }
        if (internalLocationRef.current) mapInstanceRef.current.removeLayer(internalLocationRef.current)
        const icon = L.divIcon({
          html: `<style>@keyframes lp{0%{transform:scale(1);opacity:.4}100%{transform:scale(3.5);opacity:0}}.lp-ring{animation:lp 1.5s ease-out infinite}</style><div style="position:relative;width:20px;height:20px"><div class="lp-ring" style="position:absolute;inset:0;border-radius:50%;background:#2563eb"></div><div style="position:absolute;inset:4px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div></div>`,
          className: '', iconSize: [20, 20], iconAnchor: [10, 10],
        })
        internalLocationRef.current = L.marker([coords.latitude, coords.longitude], { icon, zIndexOffset: 2000 })
          .addTo(mapInstanceRef.current)
          .bindTooltip('You are here', { permanent: false, direction: 'top', offset: [0, -10] })
        mapInstanceRef.current.flyTo([coords.latitude, coords.longitude], 18, { duration: 1.5 })
        setLocationActive(true)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full relative overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />

      {/* Cancel coord pick */}
      {onCoordsPick && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 bg-white/90 backdrop-blur border border-indigo-500/25 rounded-xl px-4 py-2.5 shadow-lg max-w-[90%] md:max-w-md">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary leading-none">Coordinate Pick Mode</p>
            <p className="text-[10px] text-text-secondary leading-none mt-1">Click on the map to select location</p>
          </div>
          <button
            onClick={closeModal}
            className="bg-surface border border-border text-text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-border transition cursor-pointer shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Vertex edit overlay */}
      {editVerticesConfig?.active && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 shadow-lg">
          <span className="text-xs text-text-secondary mr-1">
            <i className="fa-solid fa-circle-info mr-1.5 text-game-blue" />
            Drag handles to move points. Click a point to delete it.
          </span>
          <button
            onClick={() => stopVertexEdit(true)}
            className="bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition cursor-pointer"
          >Done</button>
          <button
            onClick={() => stopVertexEdit(false)}
            className="bg-surface border border-border text-text-primary text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-border transition cursor-pointer"
          >Cancel</button>
        </div>
      )}
      {/* My Location button */}
      <button
        onClick={handleLocate}
        disabled={locating}
        title={locationActive ? 'Hide my location' : 'Show my location'}
        className={`absolute bottom-[72px] right-4 z-[500] w-9 h-9 flex items-center justify-center rounded-xl shadow-md border transition ${
          locationActive ? 'bg-game-blue text-white border-game-blue' : 'bg-white/85 backdrop-blur-md text-text-secondary border-border/80 hover:bg-surface'
        } ${locating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <i className={`fa-solid ${locating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'} text-sm`} />
      </button>

      <DashboardChatbot />


      {/* Map Type Switcher */}
      <div className="absolute bottom-4 right-4 z-[500] flex gap-1 bg-white/85 backdrop-blur-md border border-border/80 rounded-xl p-1 shadow-md">

        <button
          onClick={() => setMapType('streets')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
            mapType === 'streets'
              ? 'bg-game-green text-white shadow-sm'
              : 'text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
        >
          <i className="fa-solid fa-map text-[10px]" />
          Map
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
            mapType === 'satellite'
              ? 'bg-game-green text-white shadow-sm'
              : 'text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
        >
          <i className="fa-solid fa-globe text-[10px]" />
          Satellite
        </button>

      </div>
    </div>
  )
})

export default DashboardMap
