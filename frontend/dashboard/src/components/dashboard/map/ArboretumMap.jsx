import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getAllZones, createZone, updateZone, deleteZone } from '../../../services/zoneService'
import { fetchOsmZones } from '../../../services/osmImportService'
import { snapClosingSegment, isInsideRing, nearestPointOnRing, SNAP_TOLERANCE_METERS } from './boundarySnap'
import LayerSidebar from './LayerSidebar'


const ZONE_TYPES = [
  { value: 'boundary', label: 'Boundary',     color: '#1A5C2E' },
  { value: 'area',     label: 'Area',         color: '#2D7D46' },
  { value: 'path',     label: 'Trail / Path', color: '#8B6914' },
]

function buildStyle(zone, selected = false) {
  const noFill = zone.zoneType === 'path' || zone.zoneType === 'boundary'
  return {
    color: selected ? '#facc15' : (zone.color ?? '#33A661'),
    weight: selected ? 3 : (zone.zoneType === 'boundary' ? 3 : 2),
    fillOpacity: noFill ? 0 : (selected ? 0.25 : 0.15),
    fillColor: zone.color ?? '#33A661',
  }
}

// Convert a GeoJSON geometry to an editable Leaflet layer
function geojsonToEditableLayer(geometry) {
  if (!geometry) return null
  const flip = (coords) => coords.map(([lng, lat]) => [lat, lng])
  switch (geometry.type) {
    case 'Polygon':
      return L.polygon(geometry.coordinates.map(flip))
    case 'MultiPolygon':
      return L.polygon(geometry.coordinates.map((poly) => flip(poly[0])))
    case 'LineString':
      return L.polyline(flip(geometry.coordinates))
    default:
      return null
  }
}

export default function ArboretumMap() {
  const mapRef          = useRef(null)
  const mapInstance     = useRef(null)
  const drawnItemsRef   = useRef(null)
  const drawHandlerRef  = useRef(null)
  const editHandlerRef  = useRef(null)
  const zoneLayers      = useRef(new Map())
  const boundaryRingRef = useRef([]) // array of [{lat,lng}] rings — one per boundary zone
  const drawingRef       = useRef(false)

  const [layerVisibility, setLayerVisibility] = useState({
    boundary: true, zones: true,
  })
  const layerVisibilityRef = useRef(layerVisibility)
  layerVisibilityRef.current = layerVisibility

  const [zoneCount,   setZoneCount]   = useState(0)
  const [loadError,   setLoadError]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [drawing,     setDrawing]     = useState(false)
  const [vertexCount, setVertexCount] = useState(0)

  // create form
  const [pendingGeometry, setPendingGeometry] = useState(null)
  const [createName,  setCreateName]  = useState('')
  const [createMode,  setCreateMode]  = useState(null) // 'section' | 'boundary'
  const [createColor, setCreateColor] = useState('#2D7D46')
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState(null)

  // edit form
  const [selectedZone,       setSelectedZone]       = useState(null)
  const [editName,           setEditName]           = useState('')
  const [editColor,          setEditColor]          = useState('#2D7D46')
  const [editPendingGeometry,setEditPendingGeometry]= useState(null)
  const [editingVertices,    setEditingVertices]    = useState(false) // vertex-drag mode
  const [updating,           setUpdating]           = useState(false)
  const [deleting,           setDeleting]           = useState(false)
  const [editError,          setEditError]          = useState(null)

  const [importing,    setImporting]    = useState(false)
  const [importError,  setImportError]  = useState(null)

  // ── Layer helpers ─────────────────────────────────────────────────────────────

  function addZoneLayer(map, zone, onClick) {
    const layer = L.geoJSON(zone.boundary, { style: () => buildStyle(zone) })
    layer.bindTooltip(zone.name, { permanent: false, direction: 'center' })
    layer.on('click', (e) => { L.DomEvent.stopPropagation(e); onClick(zone) })
    layer.on('mouseover', () => {
      if (!zoneLayers.current.get(zone.id)?.selected)
        layer.setStyle({ weight: 3, fillOpacity: zone.zoneType === 'path' ? 0 : 0.25 })
    })
    layer.on('mouseout', () => {
      if (!zoneLayers.current.get(zone.id)?.selected)
        layer.setStyle(buildStyle(zone))
    })
    const visible = zone.zoneType === 'boundary'
      ? layerVisibilityRef.current.boundary
      : layerVisibilityRef.current.zones
    if (visible) layer.addTo(map)
    zoneLayers.current.set(zone.id, { layer, zone, selected: false })
    return layer
  }

  function extractBoundaryRing(zone) {
    const g = zone?.boundary
    if (!g) return null
    const ringCoords = g.type === 'Polygon'
      ? g.coordinates[0]
      : g.type === 'MultiPolygon'
        ? g.coordinates[0]?.[0]
        : null
    if (!ringCoords) return null
    // Strip trailing duplicate-of-first if present.
    const closed = ringCoords.length > 1 &&
      ringCoords[0][0] === ringCoords[ringCoords.length - 1][0] &&
      ringCoords[0][1] === ringCoords[ringCoords.length - 1][1]
    const coords = closed ? ringCoords.slice(0, -1) : ringCoords
    return coords.map(([lng, lat]) => ({ lat, lng }))
  }

  function reloadZones(map, onClickFn) {
    return getAllZones().then((zones) => {
      zoneLayers.current.forEach(({ layer }) => map.removeLayer(layer))
      zoneLayers.current.clear()
      zones.forEach((zone) => addZoneLayer(map, zone, onClickFn))
      boundaryRingRef.current = zones
        .filter((z) => z.zoneType === 'boundary')
        .map(extractBoundaryRing)
        .filter(Boolean)
      setZoneCount(zones.length)
      return zones
    })
  }

  const handleZoneClickRef = useRef(null)
  handleZoneClickRef.current = (zone) => {
    const prev = selectedZone
    if (prev) {
      const e = zoneLayers.current.get(prev.id)
      if (e) { e.selected = false; e.layer.setStyle(buildStyle(prev)) }
    }
    // cancel any active operations
    stopVertexEdit(false)
    drawHandlerRef.current?.disable()
    drawnItemsRef.current?.clearLayers()
    setPendingGeometry(null)
    setDrawing(false)
    setVertexCount(0)

    setSelectedZone(zone)
    setEditName(zone.name)
    setEditColor(zone.color)
    setEditPendingGeometry(null)
    setEditError(null)

    const e = zoneLayers.current.get(zone.id)
    if (e) { e.selected = true; e.layer.setStyle(buildStyle(zone, true)) }
  }

  const tryLoadZones = useCallback((map) => {
    setLoadError(null)
    setLoading(true)
    reloadZones(map, (zone) => handleZoneClickRef.current(zone))
      .then((zones) => {
        if (zones.length > 0) {
          const all = []
          map.eachLayer((l) => { if (l.getBounds) all.push(l) })
          if (all.length) {
            try { map.fitBounds(L.featureGroup(all).getBounds(), { padding: [40, 40] }) } catch (_) {}
          }
        }
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Vertex edit helpers ───────────────────────────────────────────────────────

  function stopVertexEdit(save) {
    if (!editHandlerRef.current) return null
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
    setEditingVertices(false)
    return geom
  }

  // ── Map init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    // React StrictMode mounts twice in dev — clear any stale Leaflet stamp
    if (mapRef.current._leaflet_id) {
      delete mapRef.current._leaflet_id
    }

    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
      zoomSnap: 0.5,
    }).setView([43.7270, -79.6099], 15)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 1,
    }).addTo(map)

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    // Suppress all Leaflet-Draw cursor tooltips
    const t = L.drawLocal.draw.handlers
    t.polygon.tooltip = { start: '', cont: '', end: '' }
    t.polyline.tooltip = { start: '', cont: '', end: '' }
    L.drawLocal.edit.handlers.edit.tooltip = { text: '', subtext: '' }
    L.drawLocal.edit.handlers.remove.tooltip = { text: '' }

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)
    drawnItemsRef.current = drawnItems

    drawHandlerRef.current = new L.Draw.Polygon(map, {
      allowIntersection: false,
      showArea: true,
      shapeOptions: { color: '#33A661', weight: 2, fillOpacity: 0.2 },
    })

    map.on(L.Draw.Event.CREATED, (e) => {
      const drawnLatLngs = e.layer.getLatLngs()[0]
      const isSection = drawingRef.current === 'section'
      const rings = boundaryRingRef.current
      // Snap to whichever boundary ring contains the first drawn vertex.
      const firstPt = drawnLatLngs[0] ? { lat: drawnLatLngs[0].lat, lng: drawnLatLngs[0].lng } : null
      const matchedRing = (isSection && firstPt)
        ? (rings.find((r) => isInsideRing(firstPt, r)) ?? null)
        : null
      const finalRing = matchedRing
        ? snapClosingSegment(drawnLatLngs, matchedRing)
        : drawnLatLngs
      const snapped = L.polygon(finalRing, { color: '#33A661', weight: 2, fillOpacity: 0.2 })
      drawnItems.addLayer(snapped)
      const coords = finalRing.map((p) => [p.lng, p.lat])
      coords.push([finalRing[0].lng, finalRing[0].lat])
      const geom = { type: 'Polygon', coordinates: [coords] }
      setPendingGeometry(geom)
      setDrawing(false)
      setVertexCount(0)
    })
    map.on(L.Draw.Event.DRAWSTOP,   () => { setDrawing(false); drawingRef.current = false; setVertexCount(0) })
    map.on(L.Draw.Event.DRAWVERTEX, () => {
      // Snap placed vertex to nearest boundary ring point if within tolerance.
      if (drawingRef.current === 'section') {
        const rings = boundaryRingRef.current
        const handler = drawHandlerRef.current
        const markers = handler?._markers
        if (rings.length && markers?.length) {
          const last = markers[markers.length - 1]
          const ll = last.getLatLng()
          const pt = { lat: ll.lat, lng: ll.lng }
          let bestDist = Infinity, bestPt = null
          for (const ring of rings) {
            const near = nearestPointOnRing(ring, pt)
            if (near.dist < bestDist) { bestDist = near.dist; bestPt = near.projected }
          }
          if (bestDist <= SNAP_TOLERANCE_METERS) {
            last.setLatLng(L.latLng(bestPt.lat, bestPt.lng))
            handler._poly?.setLatLngs(markers.map((m) => m.getLatLng()))
          }
        }
      }
      setVertexCount((n) => n + 1)
    })

    // Block any click outside the boundary before Leaflet-Draw processes it.
    // Only active when drawing a section (not a boundary, which defines the ring itself).
    // Runs in capture phase so it fires before every Leaflet listener.
    const container = map.getContainer()
    const blockOutsideClick = (domEvent) => {
      const rings = boundaryRingRef.current
      if (drawingRef.current !== 'section' || !rings.length) return
      const ll = map.mouseEventToLatLng(domEvent)
      const pt = { lat: ll.lat, lng: ll.lng }
      if (!rings.some((ring) => isInsideRing(pt, ring))) {
        domEvent.stopPropagation()
        domEvent.preventDefault()
      }
    }
    container.addEventListener('mousedown', blockOutsideClick, true)
    container.addEventListener('touchstart', blockOutsideClick, { capture: true, passive: false })

    map.on('click', () => {
      setSelectedZone((prev) => {
        if (prev) {
          const e = zoneLayers.current.get(prev.id)
          if (e) { e.selected = false; e.layer.setStyle(buildStyle(prev)) }
        }
        return null
      })
    })

    mapInstance.current = map
    tryLoadZones(map)

    return () => {
      container.removeEventListener('mousedown', blockOutsideClick, true)
      container.removeEventListener('touchstart', blockOutsideClick, { capture: true })
      map.remove()
      mapInstance.current = null
      zoneLayers.current.clear()
    }
  }, [])

  // Apply layer visibility toggles to the map
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    zoneLayers.current.forEach(({ layer, zone }) => {
      const show = zone.zoneType === 'boundary' ? layerVisibility.boundary : layerVisibility.zones
      if (show && !map.hasLayer(layer)) layer.addTo(map)
      else if (!show && map.hasLayer(layer)) map.removeLayer(layer)
    })
  }, [layerVisibility])

  const handleToggleLayer = (key) =>
    setLayerVisibility((v) => ({ ...v, [key]: !v[key] }))

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (editingVertices) {
        stopVertexEdit(false)
      } else if (drawing) {
        drawHandlerRef.current?.disable()
        drawnItemsRef.current?.clearLayers()
        setPendingGeometry(null)
        setEditPendingGeometry(null)
        setDrawing(false)
        setVertexCount(0)
      } else if (selectedZone) {
        const entry = zoneLayers.current.get(selectedZone.id)
        if (entry) { entry.selected = false; entry.layer.setStyle(buildStyle(selectedZone)) }
        setSelectedZone(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawing, selectedZone, editingVertices])

  // ── Create ────────────────────────────────────────────────────────────────────

  const handleStartDraw = (mode) => {
    if (selectedZone) {
      const e = zoneLayers.current.get(selectedZone.id)
      if (e) { e.selected = false; e.layer.setStyle(buildStyle(selectedZone)) }
      setSelectedZone(null)
    }
    const defaultColor = mode === 'boundary' ? '#1A5C2E' : '#2D7D46'
    setPendingGeometry(null)
    setSaveError(null)
    setCreateMode(mode)
    setCreateColor(defaultColor)
    drawnItemsRef.current?.clearLayers()
    drawHandlerRef.current.enable()
    mapInstance.current?.dragging.enable()
    setDrawing(true)
    drawingRef.current = mode
    setVertexCount(0)
  }

  const handleCancelCreate = () => {
    drawHandlerRef.current?.disable()
    drawnItemsRef.current?.clearLayers()
    setPendingGeometry(null)
    setSaveError(null)
    setCreateMode(null)
    setDrawing(false)
    drawingRef.current = false
    setVertexCount(0)
  }

  const handleSaveCreate = async (e) => {
    e.preventDefault()
    if (!createName.trim() || !pendingGeometry) return
    const zoneType = createMode === 'boundary' ? 'boundary' : 'area'
    setSaving(true); setSaveError(null)
    try {
      await createZone({ name: createName.trim(), zoneType, color: createColor, boundary: pendingGeometry })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setCreateName(''); setCreateMode(null); setCreateColor('#2D7D46')
      setPendingGeometry(null)
      drawnItemsRef.current?.clearLayers()
    } catch (err) { setSaveError(err.message) }
    finally { setSaving(false) }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────────

  const handleDeselect = () => {
    stopVertexEdit(false)
    if (selectedZone) {
      const e = zoneLayers.current.get(selectedZone.id)
      if (e) { e.selected = false; e.layer.setStyle(buildStyle(selectedZone)) }
    }
    setSelectedZone(null)
    setEditPendingGeometry(null)
    setEditError(null)
    drawHandlerRef.current?.disable()
    drawnItemsRef.current?.clearLayers()
    setDrawing(false)
    setVertexCount(0)
  }

  // Load existing polygon into drawnItems with vertex handles
  const handleEditVertices = () => {
    const geom = selectedZone?.boundary
    const layer = geojsonToEditableLayer(geom)
    if (!layer) return

    drawnItemsRef.current?.clearLayers()
    drawnItemsRef.current?.addLayer(layer)
    setEditPendingGeometry(null)

    editHandlerRef.current = new L.EditToolbar.Edit(mapInstance.current, {
      featureGroup: drawnItemsRef.current,
    })
    editHandlerRef.current.enable()
    mapInstance.current?.dragging.enable()
    setEditingVertices(true)
  }

  const handleDoneEditingVertices = () => {
    const geom = stopVertexEdit(true)
    if (geom) setEditPendingGeometry(geom)
  }

  const handleCancelEditingVertices = () => {
    stopVertexEdit(false)
    setEditPendingGeometry(null)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim() || !selectedZone) return
    setUpdating(true); setEditError(null)
    try {
      await updateZone(selectedZone.id, {
        name: editName.trim(), zoneType: selectedZone.zoneType, color: editColor,
        boundary: editPendingGeometry ?? undefined,
      })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setSelectedZone(null); setEditPendingGeometry(null)
      drawnItemsRef.current?.clearLayers()
    } catch (err) { setEditError(err.message) }
    finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if (!selectedZone || !window.confirm(`Delete zone "${selectedZone.name}"?`)) return
    setDeleting(true); setEditError(null)
    try {
      await deleteZone(selectedZone.id)
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setSelectedZone(null); drawnItemsRef.current?.clearLayers()
    } catch (err) { setEditError(err.message) }
    finally { setDeleting(false) }
  }

  // ── OSM / export ──────────────────────────────────────────────────────────────

  const handleImportFromOsm = async () => {
    setImporting(true); setImportError(null)
    try {
      const osmZones = await fetchOsmZones()
      let failed = 0
      for (const z of osmZones) {
        try { await createZone({ name: z.name, zoneType: z.zoneType, color: z.color, boundary: z.geometry }) }
        catch (_) { failed++ }
      }
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      if (failed > 0) setImportError(`Imported ${osmZones.length - failed}/${osmZones.length} zones — ${failed} failed.`)
    } catch (err) { setImportError(err.message) }
    finally { setImporting(false) }
  }

  const handleExport = () => {
    if (!mapInstance.current || !window.leafletImage) return
    window.leafletImage(mapInstance.current, (err, canvas) => {
      if (err) return
      const link = document.createElement('a')
      link.download = 'arboretum-map.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const panelMode = selectedZone ? 'edit' : 'create'

  return (
    <div className='flex flex-col h-full w-full'>
      {/* Header - Styled like DashboardNavBar */}
      <div className='h-[70px] bg-white w-full border-b border-gray-300 shadow flex items-center justify-between px-[20px] shrink-0'>
        <div>
          <h1 className='font font-bold text-xl'>Arboretum Map</h1>
          <p className='font text-gray-500 font-extralight text-sm'>Office of Sustainability · Now updated</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin text-xs" /> Loading…
            </span>
          )}
          {!loading && !loadError && (
            <span className="text-xs bg-gray-100 text-secondary-green border border-gray-300 px-2.5 py-1 rounded-lg font-medium">
              {zoneCount} zone{zoneCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="p-[20px] flex flex-col gap-5 h-full overflow-y-auto w-full">
        {importError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation" /> {importError}
          </div>
        )}

        {/* Map + layer sidebar */}
        <div className="flex gap-3 shrink-0" style={{ height: '460px' }}>
          <div className="rounded-xl overflow-hidden relative shadow border border-gray-300 flex-1">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          <LayerSidebar visibility={layerVisibility} onToggle={handleToggleLayer} />
        </div>


        {/* Panel */}
        <div className="bg-white rounded-xl border border-gray-300 shadow p-5 shrink-0 flex flex-col gap-2">

          {/* Edit mode */}
          {panelMode === 'edit' && (
            <>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selectedZone.color }} />
                    <h2 className="font text-gray-900 font-semibold">{selectedZone.name}</h2>
                    <span className="font text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      {ZONE_TYPES.find(t => t.value === selectedZone.zoneType)?.label ?? selectedZone.zoneType}
                    </span>
                  </div>
                  <p className="font text-gray-500 text-sm">
                    {editingVertices
                      ? 'Drag a white handle to move a point. Click a point to delete it. Press Done when finished.'
                      : drawing
                      ? vertexCount === 0 ? 'Click on the map to place the first point.'
                        : vertexCount === 1 ? 'Click to add more points.'
                        : `${vertexCount} points placed — double-click to close the shape.`
                      : editPendingGeometry
                      ? 'New boundary ready — save to apply.'
                      : 'Edit details, adjust vertices, or redraw the boundary.'}
                  </p>
                </div>
                <button onClick={handleDeselect} title="Deselect (Esc)"
                  className="text-gray-400 hover:text-gray-700 text-sm p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-4 cursor-pointer">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              {/* Vertex-editing controls */}
              {editingVertices ? (
                <div className="flex items-center gap-3">
                  <p className="font text-gray-600 text-sm flex-1">
                    <i className="fa-solid fa-circle-info mr-1.5" />
                    Drag any white handle to move a point. Click a point to delete it.
                  </p>
                  <button onClick={handleCancelEditingVertices}
                    className="font bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleDoneEditingVertices}
                    className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="font bg-white text-gray-900 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-secondary-green w-52" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 bg-transparent p-0" />
                      <span className="font text-gray-500 text-xs font-mono">{editColor}</span>
                    </div>
                  </div>

                  {/* Boundary actions */}
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Boundary</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleEditVertices} disabled={drawing}
                        className="font flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors disabled:opacity-50 cursor-pointer">
                        <i className="fa-solid fa-pen text-xs" /> Edit points
                      </button>
                    </div>
                  </div>

                  {editPendingGeometry && (
                    <span className="font text-xs text-secondary-green flex items-center gap-1 self-end pb-2">
                      <i className="fa-solid fa-check" /> New boundary ready
                    </span>
                  )}

                  <div className="flex items-end gap-2 ml-auto">
                    {editError && <p className="font text-red-500 text-xs max-w-xs">{editError}</p>}
                    <button type="button" onClick={handleDelete} disabled={deleting || updating}
                      className="font flex items-center gap-1.5 text-red-600 hover:text-red-700 px-3 py-1.5 rounded text-sm border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
                      <i className="fa-solid fa-trash text-xs" />
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                    <button type="submit" disabled={updating || deleting}
                      className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Create mode */}
          {panelMode === 'create' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font text-gray-900 font-semibold">
                    {drawing || pendingGeometry
                      ? createMode === 'boundary' ? 'New Boundary' : 'New Section'
                      : 'Create'}
                  </h2>
                  <p className="font text-gray-500 text-sm mt-0.5">
                    {pendingGeometry ? 'Shape ready — name it and save.'
                      : drawing
                        ? vertexCount === 0 ? 'Click on the map to place the first point.'
                        : vertexCount === 1 ? 'Click to add more points.'
                        : `${vertexCount} points placed — double-click to close the shape.`
                      : 'Click a zone to edit it, or create a new one below.'}
                  </p>
                </div>
                {(drawing || pendingGeometry) && (
                  <button onClick={handleCancelCreate}
                    className="font flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                    <i className="fa-solid fa-xmark text-xs" /> Cancel
                  </button>
                )}
              </div>

              {!drawing && !pendingGeometry && (
                <div className="flex gap-2">
                  <button onClick={() => handleStartDraw('section')}
                    className="font flex items-center gap-2 bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold transition-colors cursor-pointer">
                    <i className="fa-solid fa-draw-polygon text-xs" /> Draw Section
                  </button>
                  <button onClick={() => handleStartDraw('boundary')}
                    className="font flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm border border-gray-300 font-bold transition-colors cursor-pointer">
                    <i className="fa-solid fa-border-all text-xs" /> Draw Boundary
                  </button>
                </div>
              )}

              {pendingGeometry && (
                <form onSubmit={handleSaveCreate} className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">
                      {createMode === 'boundary' ? 'Boundary name' : 'Section name'}
                    </label>
                    <input type="text"
                      placeholder={createMode === 'boundary' ? 'e.g. Humber Arboretum' : 'e.g. North Meadow'}
                      value={createName} onChange={(e) => setCreateName(e.target.value)} autoFocus required
                      className="font bg-white text-gray-900 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-secondary-green w-52" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={createColor} onChange={(e) => setCreateColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 bg-transparent p-0" />
                      <span className="font text-gray-500 text-xs font-mono">{createColor}</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 ml-auto">
                    {saveError && <p className="font text-red-500 text-xs max-w-xs">{saveError}</p>}
                    <button type="button" onClick={handleCancelCreate}
                      className="font bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                      Discard
                    </button>
                    <button type="submit" disabled={saving}
                      className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                      {saving ? 'Saving…' : createMode === 'boundary' ? 'Save Boundary' : 'Save Section'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Legend */}
          <div className="flex gap-6 text-sm mt-2 pt-4 border-t border-gray-200 shrink-0">
            {[{ value: 'boundary', label: 'Boundary', color: '#1A5C2E' }, { value: 'area', label: 'Section', color: '#2D7D46' }].map((t) => (
              <div key={t.value} className="flex items-center gap-2">
                <span className="w-4 h-3 rounded-sm inline-block" style={{ backgroundColor: t.color, opacity: t.value === 'area' ? 0.6 : 1 }} />
                <span className="font text-gray-600 text-xs">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
