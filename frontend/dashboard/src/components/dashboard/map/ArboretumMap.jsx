import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
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

function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#ff24da'
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661'
  if (cp.elementTypeId === 2) return '#3B82F6'
  return '#ef4444'
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
  const mapRef              = useRef(null)
  const mapInstance         = useRef(null)
  const drawnItemsRef       = useRef(null)
  const drawHandlerRef      = useRef(null)
  const editHandlerRef      = useRef(null)
  const zoneLayers          = useRef(new Map())
  const boundaryRingRef     = useRef([])
  const drawingRef          = useRef(false)
  const checkpointClusterRef  = useRef(null)
  const generatedLayersRef    = useRef([])

  const [layerVisibility, setLayerVisibility] = useState({
    boundary: true, zones: true, checkpoints: true,
  })
  const layerVisibilityRef = useRef(layerVisibility)
  layerVisibilityRef.current = layerVisibility

  const [zones,       setZones]       = useState([])
  const [zoneCount,   setZoneCount]   = useState(0)
  const [loadError,   setLoadError]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [drawing,     setDrawing]     = useState(false)
  const [vertexCount, setVertexCount] = useState(0)

  const [checkpoints,  setCheckpoints]  = useState([])
  const [searchQuery,  setSearchQuery]  = useState('')

  const [genCount,        setGenCount]      = useState(4)
  const [generatedZones,  setGeneratedZones] = useState([])
  const [generating,      setGenerating]   = useState(false)
  const [savingGen,       setSavingGen]    = useState(false)

  // create form
  const [pendingGeometry, setPendingGeometry] = useState(null)
  const [createName,  setCreateName]  = useState('')
  const [createMode,  setCreateMode]  = useState(null)
  const [createColor, setCreateColor] = useState('#2D7D46')
  const [saving,      setSaving]      = useState(false)

  // edit form
  const [selectedZone,        setSelectedZone]        = useState(null)
  const [editName,            setEditName]            = useState('')
  const [editColor,           setEditColor]           = useState('#2D7D46')
  const [editPendingGeometry, setEditPendingGeometry] = useState(null)
  const [editingVertices,     setEditingVertices]     = useState(false)
  const [updating,            setUpdating]            = useState(false)
  const [deleting,            setDeleting]            = useState(false)
  const [confirmingDelete,    setConfirmingDelete]    = useState(false)

  const [importing,   setImporting]   = useState(false)

  // toast notifications
  const [toasts, setToasts] = useState([])
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  // ── Layer helpers ─────────────────────────────────────────────────────────────

  function addZoneLayer(map, zone, onClick) {
    const pane = zone.zoneType === 'boundary' ? 'boundaryPane' : 'zonePane'
    const layer = L.geoJSON(zone.boundary, { style: () => buildStyle(zone), pane })
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
    const closed = ringCoords.length > 1 &&
      ringCoords[0][0] === ringCoords[ringCoords.length - 1][0] &&
      ringCoords[0][1] === ringCoords[ringCoords.length - 1][1]
    const coords = closed ? ringCoords.slice(0, -1) : ringCoords
    return coords.map(([lng, lat]) => ({ lat, lng }))
  }

  function reloadZones(map, onClickFn) {
    return getAllZones().then((zoneList) => {
      zoneLayers.current.forEach(({ layer }) => map.removeLayer(layer))
      zoneLayers.current.clear()
      zoneList.forEach((zone) => addZoneLayer(map, zone, onClickFn))
      boundaryRingRef.current = zoneList
        .filter((z) => z.zoneType === 'boundary')
        .map(extractBoundaryRing)
        .filter(Boolean)
      setZoneCount(zoneList.length)
      setZones(zoneList)
      return zoneList
    })
  }

  const handleZoneClickRef = useRef(null)
  handleZoneClickRef.current = (zone) => {
    const prev = selectedZone
    if (prev) {
      const e = zoneLayers.current.get(prev.id)
      if (e) { e.selected = false; e.layer.setStyle(buildStyle(prev)) }
    }
    stopVertexEdit(false)
    clearGeneratedZones()
    drawHandlerRef.current?.disable()
    drawnItemsRef.current?.clearLayers()
    setPendingGeometry(null)
    setDrawing(false)
    setVertexCount(0)

    setSelectedZone(zone)
    setEditName(zone.name)
    setEditColor(zone.color)
    setEditPendingGeometry(null)
    setConfirmingDelete(false)
    setSearchQuery('')

    const e = zoneLayers.current.get(zone.id)
    if (e) { e.selected = true; e.layer.setStyle(buildStyle(zone, true)) }
  }

  const tryLoadZones = useCallback((map) => {
    setLoadError(null)
    setLoading(true)
    reloadZones(map, (zone) => handleZoneClickRef.current(zone))
      .then((zoneList) => {
        if (zoneList.length > 0) {
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

    if (mapRef.current._leaflet_id) {
      delete mapRef.current._leaflet_id
    }

    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: false,
      zoomSnap: 0.5,
    }).setView([43.7270, -79.6099], 15)

    map.createPane('zonePane').style.zIndex = '390'
    map.createPane('boundaryPane').style.zIndex = '410'

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 1,
    }).addTo(map)

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    const t = L.drawLocal.draw.handlers
    t.polygon.tooltip = { start: '', cont: '', end: '' }
    t.polyline.tooltip = { start: '', cont: '', end: '' }
    L.drawLocal.edit.handlers.edit.tooltip = { text: '', subtext: '' }
    L.drawLocal.edit.handlers.remove.tooltip = { text: '' }

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)
    drawnItemsRef.current = drawnItems

    // Checkpoint cluster layer
    const cpCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 40,
    })
    map.addLayer(cpCluster)
    checkpointClusterRef.current = cpCluster

    drawHandlerRef.current = new L.Draw.Polygon(map, {
      allowIntersection: true,
      showArea: true,
      shapeOptions: { color: '#33A661', weight: 2, fillOpacity: 0.2 },
    })

    map.on(L.Draw.Event.CREATED, (e) => {
      const drawnLatLngs = e.layer.getLatLngs()[0]
      const isSection = drawingRef.current === 'section'
      const rings = boundaryRingRef.current
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
          }
        }
      }
      setVertexCount((n) => n + 1)
    })

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
      generatedLayersRef.current.forEach(l => l.remove())
      generatedLayersRef.current = []
      checkpointClusterRef.current?.clearLayers()
      checkpointClusterRef.current = null
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

  // ── Checkpoint fetch ──────────────────────────────────────────────────────────

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL
    if (!base) return
    fetch(`${base}/api/dashboard/checkpoints`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCheckpoints(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // ── Render checkpoint markers ─────────────────────────────────────────────────

  useEffect(() => {
    const cluster = checkpointClusterRef.current
    if (!cluster) return
    cluster.clearLayers()
    if (!layerVisibility.checkpoints) return
    checkpoints.forEach((cp) => {
      if (cp.latitude == null || cp.longitude == null) return
      const color = checkpointColor(cp)
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([cp.latitude, cp.longitude], { icon }).addTo(cluster)
    })
  }, [checkpoints, layerVisibility.checkpoints])

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
    setCreateMode(null)
    setDrawing(false)
    drawingRef.current = false
    setVertexCount(0)
  }

  const handleSaveCreate = async (e) => {
    e.preventDefault()
    if (!createName.trim() || !pendingGeometry) return
    const zoneType = createMode === 'boundary' ? 'boundary' : 'area'
    setSaving(true)
    try {
      await createZone({ name: createName.trim(), zoneType, color: createColor, boundary: pendingGeometry })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setCreateName(''); setCreateMode(null); setCreateColor('#2D7D46')
      setPendingGeometry(null)
      drawnItemsRef.current?.clearLayers()
      addToast(`"${createName.trim()}" saved`)
      const base = import.meta.env.VITE_API_BASE_URL
      if (base) fetch(`${base}/api/dashboard/checkpoints`).then(r => r.ok ? r.json() : []).then(d => setCheckpoints(Array.isArray(d) ? d : [])).catch(() => {})
    } catch (err) { addToast(err.message, 'error') }
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
    setConfirmingDelete(false)
    clearGeneratedZones()
    drawHandlerRef.current?.disable()
    drawnItemsRef.current?.clearLayers()
    setDrawing(false)
    setVertexCount(0)
  }

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
    setUpdating(true)
    try {
      await updateZone(selectedZone.id, {
        name: editName.trim(), zoneType: selectedZone.zoneType, color: editColor,
        boundary: editPendingGeometry ?? undefined,
      })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      addToast(`"${editName.trim()}" saved`)
      setSelectedZone(null); setEditPendingGeometry(null)
      drawnItemsRef.current?.clearLayers()
    } catch (err) { addToast(err.message, 'error') }
    finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if (!selectedZone) return
    setDeleting(true); setConfirmingDelete(false)
    const name = selectedZone.name
    try {
      await deleteZone(selectedZone.id)
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setSelectedZone(null); drawnItemsRef.current?.clearLayers()
      addToast(`"${name}" deleted`)
      const base = import.meta.env.VITE_API_BASE_URL
      if (base) fetch(`${base}/api/dashboard/checkpoints`).then(r => r.ok ? r.json() : []).then(d => setCheckpoints(Array.isArray(d) ? d : [])).catch(() => {})
    } catch (err) { addToast(err.message, 'error') }
    finally { setDeleting(false) }
  }

  // ── OSM / export ──────────────────────────────────────────────────────────────

  // ── Generated zone preview ────────────────────────────────────────────────────

  function clearGeneratedZones() {
    generatedLayersRef.current.forEach(l => mapInstance.current?.removeLayer(l))
    generatedLayersRef.current = []
    setGeneratedZones([])
  }

  const handleGeneratePreview = async () => {
    if (!selectedZone) return
    setGenerating(true)
    try {
      const base = import.meta.env.VITE_API_BASE_URL
      const res = await fetch(`${base}/api/dashboard/zones/${selectedZone.id}/generate-preview?count=${genCount}`)
      if (!res.ok) throw new Error('Generation failed')
      const geometries = await res.json()
      setGeneratedZones(Array.isArray(geometries) ? geometries : [])
    } catch (err) { addToast(err.message, 'error') }
    finally { setGenerating(false) }
  }

  const handleSaveGenerated = async () => {
    if (!generatedZones.length || !selectedZone) return
    setSavingGen(true)
    const count = generatedZones.length
    try {
      for (let i = 0; i < count; i++) {
        await createZone({ name: `${selectedZone.name} Zone ${i + 1}`, zoneType: 'area', color: '#2D7D46', boundary: generatedZones[i] })
      }
      clearGeneratedZones()
      await reloadZones(mapInstance.current, zone => handleZoneClickRef.current(zone))
      addToast(`${count} zone${count !== 1 ? 's' : ''} saved`)
      const base = import.meta.env.VITE_API_BASE_URL
      if (base) fetch(`${base}/api/dashboard/checkpoints`).then(r => r.ok ? r.json() : []).then(d => setCheckpoints(Array.isArray(d) ? d : [])).catch(() => {})
    } catch (err) { addToast(err.message, 'error') }
    finally { setSavingGen(false) }
  }

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    generatedLayersRef.current.forEach(l => map.removeLayer(l))
    generatedLayersRef.current = []
    generatedZones.forEach(geom => {
      const layer = L.geoJSON(geom, {
        style: () => ({ color: '#facc15', weight: 2, dashArray: '6 4', fillColor: '#facc15', fillOpacity: 0.12 })
      })
      layer.addTo(map)
      generatedLayersRef.current.push(layer)
    })
  }, [generatedZones])

  const handleImportFromOsm = async () => {
    setImporting(true)
    try {
      const osmZones = await fetchOsmZones()
      let failed = 0
      for (const z of osmZones) {
        try { await createZone({ name: z.name, zoneType: z.zoneType, color: z.color, boundary: z.geometry }) }
        catch (_) { failed++ }
      }
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      if (failed > 0) addToast(`Imported ${osmZones.length - failed}/${osmZones.length} zones — ${failed} failed.`, 'error')
      else addToast(`Imported ${osmZones.length} zones successfully.`)
    } catch (err) { addToast(err.message, 'error') }
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

  // ── Derived ───────────────────────────────────────────────────────────────────

  const panelMode = selectedZone ? 'edit' : 'create'

  const zoneCheckpoints = selectedZone
    ? checkpoints.filter((cp) => cp.zoneId === selectedZone.id)
    : []

  const searchResults = searchQuery.trim()
    ? checkpoints.filter((cp) =>
        cp.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : []

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-col h-full w-full'>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${t.type === 'error' ? 'bg-red-500' : 'bg-secondary-green'}`}>
            <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} text-xs`} />
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
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

        {/* Map + layer sidebar */}
        <div className="flex gap-3 shrink-0" style={{ height: '460px' }}>
          <div className="rounded-xl overflow-hidden relative shadow border border-gray-300 flex-1">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          <LayerSidebar visibility={layerVisibility} onToggle={handleToggleLayer} />
        </div>

        {/* Panel */}
        <div className="bg-white rounded-xl border border-gray-300 shadow p-5 shrink-0 flex flex-col gap-2">

          {/* ── Draw / pending ── */}
          {(drawing || pendingGeometry) && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font text-gray-900 font-semibold">
                    {createMode === 'boundary' ? 'New Boundary' : 'New Zone'}
                  </h2>
                  <p className="font text-gray-500 text-sm mt-0.5">
                    {pendingGeometry ? 'Shape ready — name it and save.'
                      : vertexCount === 0 ? 'Click on the map to place the first point.'
                      : vertexCount === 1 ? 'Click to add more points.'
                      : `${vertexCount} points placed — double-click to close the shape.`}
                  </p>
                </div>
                <button onClick={handleCancelCreate}
                  className="font flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                  <i className="fa-solid fa-xmark text-xs" /> Cancel
                </button>
              </div>
              {pendingGeometry && (
                <form onSubmit={handleSaveCreate} className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">
                      {createMode === 'boundary' ? 'Boundary name' : 'Zone name'}
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
                    <button type="button" onClick={handleCancelCreate}
                      className="font bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                      Discard
                    </button>
                    <button type="submit" disabled={saving}
                      className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                      {saving ? 'Saving…' : createMode === 'boundary' ? 'Save Boundary' : 'Save Zone'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Boundary selected ── */}
          {!drawing && !pendingGeometry && selectedZone?.zoneType === 'boundary' && (
            <>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selectedZone.color }} />
                    <h2 className="font text-gray-900 font-semibold">{selectedZone.name}</h2>
                    <span className="font text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Boundary</span>
                  </div>
                  <p className="font text-gray-500 text-sm">
                    {editingVertices ? 'Drag handles to move points. Click a point to delete it.'
                      : editPendingGeometry ? 'New shape ready — save to apply.'
                      : 'Edit this boundary or manage its zones.'}
                  </p>
                </div>
                <button onClick={handleDeselect} title="Deselect (Esc)"
                  className="text-gray-400 hover:text-gray-700 text-sm p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-4 cursor-pointer">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

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
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Points</label>
                    <button type="button" onClick={handleEditVertices}
                      className="font flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                      <i className="fa-solid fa-pen text-xs" /> Edit points
                    </button>
                  </div>
                  {editPendingGeometry && (
                    <span className="font text-xs text-secondary-green flex items-center gap-1 self-end pb-2">
                      <i className="fa-solid fa-check" /> New shape ready
                    </span>
                  )}
                  <div className="flex items-end gap-2 ml-auto">
                    {confirmingDelete ? (
                      <>
                        <span className="font text-sm text-gray-700">Delete "{selectedZone.name}"?</span>
                        <button type="button" onClick={() => setConfirmingDelete(false)}
                          className="font bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                          Cancel
                        </button>
                        <button type="button" onClick={handleDelete} disabled={deleting}
                          className="font flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer">
                          <i className="fa-solid fa-trash text-xs" />
                          {deleting ? 'Deleting…' : 'Confirm Delete'}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmingDelete(true)} disabled={deleting || updating}
                        className="font flex items-center gap-1.5 text-red-600 hover:text-red-700 px-3 py-1.5 rounded text-sm border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
                        <i className="fa-solid fa-trash text-xs" />
                        Delete
                      </button>
                    )}
                    <button type="submit" disabled={updating || deleting}
                      className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Zones within this boundary */}
              <div className="pt-3 border-t border-gray-200 mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    Zones
                    {zones.filter(z => z.zoneType !== 'boundary').length > 0 && (
                      <span className="ml-1.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">
                        {zones.filter(z => z.zoneType !== 'boundary').length}
                      </span>
                    )}
                  </p>
                  <button type="button" onClick={() => handleStartDraw('section')}
                    className="font flex items-center gap-1.5 bg-secondary-green hover:bg-[#286f3e] text-white px-3 py-1 rounded text-sm font-bold transition-colors cursor-pointer">
                    <i className="fa-solid fa-plus text-xs" /> Add Zone
                  </button>
                </div>
                {zones.filter(z => z.zoneType !== 'boundary').length === 0 ? (
                  <p className="font text-gray-400 text-sm">No zones yet — click Add Zone to draw one.</p>
                ) : (
                  <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto pr-1">
                    {zones.filter(z => z.zoneType !== 'boundary').map((zone) => (
                      <button key={zone.id} type="button"
                        onClick={() => handleZoneClickRef.current(zone)}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 text-left w-full transition-colors cursor-pointer">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                        <span className="font text-gray-800 text-sm flex-1 truncate">{zone.name}</span>
                        <span className="font text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 capitalize">{zone.zoneType}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Zones */}
              <div className="pt-3 border-t border-gray-200 mt-1 flex flex-col gap-2">
                <p className="font text-gray-500 text-xs font-semibold uppercase tracking-wide">Generate Zones</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number" min="1" max="20" value={genCount}
                    onChange={(e) => setGenCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="font bg-white text-gray-900 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-secondary-green w-20"
                  />
                  <span className="font text-gray-500 text-sm">zones</span>
                  <button type="button" onClick={handleGeneratePreview} disabled={generating}
                    className="font flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors disabled:opacity-50 cursor-pointer">
                    <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    {generating ? 'Generating…' : 'Preview'}
                  </button>
                  {generatedZones.length > 0 && (
                    <>
                      <button type="button" onClick={clearGeneratedZones}
                        className="font text-gray-400 hover:text-gray-600 px-2 py-1.5 text-sm transition-colors cursor-pointer">
                        Clear
                      </button>
                      <button type="button" onClick={handleSaveGenerated} disabled={savingGen}
                        className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                        {savingGen ? 'Saving…' : `Save ${generatedZones.length} Zones`}
                      </button>
                    </>
                  )}
                </div>
                {generatedZones.length > 0 && (
                  <p className="font text-xs text-amber-600 flex items-center gap-1">
                    <i className="fa-solid fa-eye" />
                    {generatedZones.length} preview zones shown on map — save to keep them.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── Zone selected ── */}
          {!drawing && !pendingGeometry && selectedZone && selectedZone.zoneType !== 'boundary' && (
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
                    {editingVertices ? 'Drag handles to move points. Click a point to delete it.'
                      : editPendingGeometry ? 'New shape ready — save to apply.'
                      : 'Edit this zone or view its sensors and elements.'}
                  </p>
                </div>
                <button onClick={handleDeselect} title="Deselect (Esc)"
                  className="text-gray-400 hover:text-gray-700 text-sm p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-4 cursor-pointer">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

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
                  <div className="flex flex-col gap-1">
                    <label className="font text-gray-500 text-sm">Points</label>
                    <button type="button" onClick={handleEditVertices}
                      className="font flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                      <i className="fa-solid fa-pen text-xs" /> Edit points
                    </button>
                  </div>
                  {editPendingGeometry && (
                    <span className="font text-xs text-secondary-green flex items-center gap-1 self-end pb-2">
                      <i className="fa-solid fa-check" /> New shape ready
                    </span>
                  )}
                  <div className="flex items-end gap-2 ml-auto">
                    {confirmingDelete ? (
                      <>
                        <span className="font text-sm text-gray-700">Delete "{selectedZone.name}"?</span>
                        <button type="button" onClick={() => setConfirmingDelete(false)}
                          className="font bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm border border-gray-300 transition-colors cursor-pointer">
                          Cancel
                        </button>
                        <button type="button" onClick={handleDelete} disabled={deleting}
                          className="font flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer">
                          <i className="fa-solid fa-trash text-xs" />
                          {deleting ? 'Deleting…' : 'Confirm Delete'}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmingDelete(true)} disabled={deleting || updating}
                        className="font flex items-center gap-1.5 text-red-600 hover:text-red-700 px-3 py-1.5 rounded text-sm border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
                        <i className="fa-solid fa-trash text-xs" />
                        Delete
                      </button>
                    )}
                    <button type="submit" disabled={updating || deleting}
                      className="font bg-secondary-green hover:bg-[#286f3e] text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer">
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sensors & Elements in this zone */}
              <div className="pt-3 border-t border-gray-200 mt-1">
                <p className="font text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Sensors &amp; Elements
                  {zoneCheckpoints.length > 0 && (
                    <span className="ml-1.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">
                      {zoneCheckpoints.length}
                    </span>
                  )}
                </p>
                {zoneCheckpoints.length === 0 ? (
                  <p className="font text-gray-400 text-sm">None assigned to this zone.</p>
                ) : (
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                    {zoneCheckpoints.map((cp) => (
                      <div key={cp.id} className="flex items-center gap-2 py-0.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm"
                          style={{ backgroundColor: checkpointColor(cp) }} />
                        <span className="font text-gray-800 text-sm flex-1 truncate">{cp.name || `#${cp.referenceId}`}</span>
                        <span className="font text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 capitalize">{cp.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Nothing selected ── */}
          {!drawing && !pendingGeometry && !selectedZone && (
            <>
              <div className="mb-1">
                <h2 className="font text-gray-900 font-semibold">Zone Manager</h2>
                <p className="font text-gray-500 text-sm mt-0.5">Click a boundary on the map to edit it or manage its zones.</p>
              </div>
              <button onClick={() => handleStartDraw('boundary')}
                className="font flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm border border-gray-300 font-bold transition-colors cursor-pointer w-fit">
                <i className="fa-solid fa-border-all text-xs" /> Draw Boundary
              </button>
              <div className="pt-3 border-t border-gray-200 mt-1">
                <p className="font text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Find sensor / element</p>
                <input type="text" placeholder="Search by name…" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font bg-white text-gray-900 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-secondary-green w-full" />
                {searchQuery.trim() && (
                  <div className="mt-2 flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="font text-gray-400 text-sm px-1">No results.</p>
                    ) : searchResults.map((cp) => {
                      const zone = zones.find((z) => z.id === cp.zoneId)
                      return (
                        <button key={cp.id} type="button"
                          onClick={() => {
                            if (cp.latitude != null && cp.longitude != null)
                              mapInstance.current?.flyTo([cp.latitude, cp.longitude], 18)
                            if (zone) handleZoneClickRef.current(zone)
                          }}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-left w-full transition-colors cursor-pointer">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: checkpointColor(cp) }} />
                          <span className="font text-gray-800 text-sm flex-1 truncate">{cp.name || `#${cp.referenceId}`}</span>
                          <span className="font text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize shrink-0">{cp.type}</span>
                          <span className="font text-xs text-gray-500 shrink-0">
                            {zone
                              ? <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: zone.color }} />{zone.name}</span>
                              : <span className="text-gray-400">No zone</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2 pt-4 border-t border-gray-200 shrink-0">
            {[
              { color: '#1A5C2E', label: 'Boundary' },
              { color: '#2D7D46', label: 'Section',  opacity: 0.6 },
              { color: '#6366f1', label: 'Sensor' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full inline-block border border-white shadow-sm"
                  style={{ backgroundColor: t.color, opacity: t.opacity ?? 1 }} />
                <span className="font text-gray-600 text-xs">{t.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                {['#33A661', '#3B82F6', '#ef4444'].map((c) => (
                  <span key={c} className="w-3.5 h-3.5 rounded-full inline-block border border-white shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span className="font text-gray-600 text-xs">Element</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
