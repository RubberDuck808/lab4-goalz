import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getAllZones, createZone, updateZone, deleteZone } from '../../../services/zoneService'
import { getAllBoundaries, createBoundary, updateBoundary, deleteBoundary } from '../../../services/boundaryService'
import { fetchOsmZones } from '../../../services/osmImportService'
import { snapClosingSegment, isInsideRing, nearestPointOnRing, SNAP_TOLERANCE_METERS } from './boundarySnap'
import { APICall } from '../../../hooks/useAPI'

function buildStyle(zone, selected = false) {
  const isBoundary = zone._isBoundary === true
  return {
    color: selected ? '#facc15' : (zone.color ?? '#33A661'),
    weight: selected ? 3 : (isBoundary ? 3 : 2),
    fillOpacity: isBoundary ? 0 : (selected ? 0.25 : 0.15),
    fillColor: zone.color ?? '#33A661',
  }
}

function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1'
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661'
  if (cp.elementTypeId === 2) return '#3B82F6'
  return '#ef4444'
}

function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

function extractLatLng(pointLike, fallbackLat, fallbackLng) {
  if (typeof fallbackLat === 'number' && typeof fallbackLng === 'number')
    return { latitude: fallbackLat, longitude: fallbackLng }
  if (pointLike?.type === 'Point' && Array.isArray(pointLike.coordinates) && pointLike.coordinates.length >= 2)
    return { latitude: pointLike.coordinates[1], longitude: pointLike.coordinates[0] }
  if (typeof pointLike?.y === 'number' && typeof pointLike?.x === 'number')
    return { latitude: pointLike.y, longitude: pointLike.x }
  if (typeof pointLike?.latitude === 'number' && typeof pointLike?.longitude === 'number')
    return { latitude: pointLike.latitude, longitude: pointLike.longitude }
  return null
}

function normalizeOverviewToCheckpoints(data) {
  const sensors = Array.isArray(data?.sensors) ? data.sensors : []
  const elements = Array.isArray(data?.element) ? data.element : []
  return [
    ...sensors.map((s) => {
      const c = extractLatLng(s?.geo, s?.latitude, s?.longitude)
      return c ? { id: `sensor-${s.id}`, type: 'sensor', referenceId: s.id, zoneId: null, latitude: c.latitude, longitude: c.longitude, name: s.sensorName ?? `Sensor ${s.id}` } : null
    }).filter(Boolean),
    ...elements.map((e) => {
      const c = extractLatLng(e?.geom, e?.latitude, e?.longitude)
      return c ? { id: `element-${e.id}`, type: 'element', referenceId: e.id, zoneId: null, latitude: c.latitude, longitude: c.longitude, elementTypeId: e.elementTypeId, isGreen: e.isGreen, name: e.elementName ?? `Element ${e.id}` } : null
    }).filter(Boolean),
  ]
}

function geojsonToEditableLayer(geometry) {
  if (!geometry) return null
  const flip = (coords) => coords.map(([lng, lat]) => [lat, lng])
  switch (geometry.type) {
    case 'Polygon':      return L.polygon(geometry.coordinates.map(flip))
    case 'MultiPolygon': return L.polygon(geometry.coordinates.map((p) => flip(p[0])))
    case 'LineString':   return L.polyline(flip(geometry.coordinates))
    default: return null
  }
}

const inputCls = 'w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/30'
const btnPrimary = 'bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'
const btnBlue = 'bg-game-blue border-b-[3px] border-game-blue-border text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'
const btnSecondary = 'bg-surface border border-border text-text-primary text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-border transition'
const btnDanger = 'bg-game-red border-b-[3px] border-game-red-dark text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'

export default function ArboretumMap() {
  const mapRef             = useRef(null)
  const mapInstance        = useRef(null)
  const drawnItemsRef      = useRef(null)
  const drawHandlerRef     = useRef(null)
  const editHandlerRef     = useRef(null)
  const zoneLayers         = useRef(new Map())
  const boundaryRingRef    = useRef([])
  const drawingRef         = useRef(false)
  const checkpointClusterRef = useRef(null)
  const generatedLayersRef   = useRef([])
  const locationMarkerRef    = useRef(null)

  const [layerVisibility, setLayerVisibility] = useState({ boundary: true, zones: true, checkpoints: true })
  const layerVisibilityRef = useRef(layerVisibility)
  layerVisibilityRef.current = layerVisibility

  const [zones, setZones]           = useState([])
  const [zoneCount, setZoneCount]   = useState(0)
  const [loadError, setLoadError]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [drawing, setDrawing]       = useState(false)
  const [vertexCount, setVertexCount] = useState(0)
  const [checkpoints, setCheckpoints] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [genCount, setGenCount]             = useState(4)
  const [generatedZones, setGeneratedZones] = useState([])
  const [generating, setGenerating]         = useState(false)
  const [savingGen, setSavingGen]           = useState(false)

  const [pendingGeometry, setPendingGeometry] = useState(null)
  const [createName, setCreateName]   = useState('')
  const [createMode, setCreateMode]   = useState(null)
  const [createColor, setCreateColor] = useState('#2D7D46')
  const [saving, setSaving]           = useState(false)
  const createBoundaryIdRef           = useRef(null)

  const [selectedZone, setSelectedZone]               = useState(null)
  const [editName, setEditName]                       = useState('')
  const [editColor, setEditColor]                     = useState('#2D7D46')
  const [editPendingGeometry, setEditPendingGeometry] = useState(null)
  const [editingVertices, setEditingVertices]         = useState(false)
  const [updating, setUpdating]                       = useState(false)
  const [deleting, setDeleting]                       = useState(false)
  const [confirmingDelete, setConfirmingDelete]       = useState(false)
  const [importing, setImporting]                     = useState(false)

  const [locating, setLocating]           = useState(false)
  const [locationActive, setLocationActive] = useState(false)

  const [toasts, setToasts] = useState([])
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const loadCheckpoints = useCallback(async () => {
    const token = sessionStorage.getItem("token") ?? ""
    try {
      const res = await APICall("GET", "/checkpoints", null, token)
      if (res?.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) { setCheckpoints(data); return }
      }
    } catch (_) {}
    try {
      const res = await APICall("GET", "/overview", null, token)
      if (!res?.ok) throw new Error()
      setCheckpoints(normalizeOverviewToCheckpoints(await res.json()))
    } catch (_) { setCheckpoints([]) }
  }, [])

  function addZoneLayer(map, zone, onClick) {
    const isBoundary = zone._isBoundary === true
    const pane = isBoundary ? 'boundaryPane' : 'zonePane'
    const layer = L.geoJSON(zone.boundary, {
      style: () => buildStyle(zone),
      pane,
      renderer: map._canvasRenderer || (mapInstance.current ? mapInstance.current._canvasRenderer : null),
    })
    layer.bindTooltip(zone.name, { permanent: false, direction: 'center' })
    layer.on('click', (e) => { L.DomEvent.stopPropagation(e); onClick(zone) })
    layer.on('mouseover', () => { if (!zoneLayers.current.get(zone.id)?.selected) layer.setStyle({ weight: 3, fillOpacity: isBoundary ? 0 : 0.25 }) })
    layer.on('mouseout',  () => { if (!zoneLayers.current.get(zone.id)?.selected) layer.setStyle(buildStyle(zone)) })
    const visible = isBoundary ? layerVisibilityRef.current.boundary : layerVisibilityRef.current.zones
    if (visible) layer.addTo(map)
    zoneLayers.current.set(zone.id, { layer, zone, selected: false })
    return layer
  }

  function extractBoundaryRing(zone) {
    const g = zone?.boundary
    if (!g) return null
    const ringCoords = g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0]?.[0] : null
    if (!ringCoords) return null
    const closed = ringCoords.length > 1 && ringCoords[0][0] === ringCoords[ringCoords.length - 1][0] && ringCoords[0][1] === ringCoords[ringCoords.length - 1][1]
    return (closed ? ringCoords.slice(0, -1) : ringCoords).map(([lng, lat]) => ({ lat, lng }))
  }

  function reloadZones(map, onClickFn) {
    return Promise.all([getAllBoundaries(), getAllZones()]).then(([boundaryList, zoneList]) => {
      zoneLayers.current.forEach(({ layer }) => map.removeLayer(layer))
      zoneLayers.current.clear()
      const taggedBoundaries = boundaryList.map((b) => ({ ...b, _isBoundary: true }))
      taggedBoundaries.forEach((b) => addZoneLayer(map, b, onClickFn))
      zoneList.forEach((z) => addZoneLayer(map, z, onClickFn))
      boundaryRingRef.current = taggedBoundaries.map(extractBoundaryRing).filter(Boolean)
      const all = [...taggedBoundaries, ...zoneList]
      setZoneCount(all.length)
      setZones(all)
      return all
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
    setPendingGeometry(null); setDrawing(false); setVertexCount(0)
    setSelectedZone(zone); setEditName(zone.name); setEditColor(zone.color)
    setEditPendingGeometry(null); setConfirmingDelete(false); setSearchQuery('')
    const e = zoneLayers.current.get(zone.id)
    if (e) { e.selected = true; e.layer.setStyle(buildStyle(zone, true)) }
  }

  const tryLoadZones = useCallback((map) => {
    setLoadError(null); setLoading(true)
    reloadZones(map, (zone) => handleZoneClickRef.current(zone))
      .then((zoneList) => {
        if (zoneList.length > 0) {
          const all = []
          map.eachLayer((l) => { if (l.getBounds) all.push(l) })
          if (all.length) { try { map.fitBounds(L.featureGroup(all).getBounds(), { padding: [40, 40] }) } catch (_) {} }
        }
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
    editHandlerRef.current.disable(); editHandlerRef.current = null
    drawnItemsRef.current?.clearLayers(); setEditingVertices(false)
    return geom
  }

  // Map init
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    if (mapRef.current._leaflet_id) delete mapRef.current._leaflet_id

    const map = L.map(mapRef.current, { attributionControl: false, zoomControl: false, zoomSnap: 0.5, preferCanvas: true }).setView([43.7270, -79.6099], 15)
    map._canvasRenderer = L.canvas({ padding: 0.5 })
    map.createPane('zonePane').style.zIndex = '390'
    map.createPane('boundaryPane').style.zIndex = '410'

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19, updateWhenZooming: false, updateWhenIdle: true, keepBuffer: 1,
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

    const cpCluster = L.markerClusterGroup({ showCoverageOnHover: false, spiderfyOnMaxZoom: true, zoomToBoundsOnClick: true, disableClusteringAtZoom: 18, maxClusterRadius: 40 })
    map.addLayer(cpCluster)
    checkpointClusterRef.current = cpCluster

    drawHandlerRef.current = new L.Draw.Polygon(map, { allowIntersection: true, showArea: true, shapeOptions: { color: '#1CB0F6', weight: 2, fillOpacity: 0.2 } })

    map.on(L.Draw.Event.CREATED, (e) => {
      const drawnLatLngs = e.layer.getLatLngs()[0]
      const isSection = drawingRef.current === 'section'
      const rings = boundaryRingRef.current
      const firstPt = drawnLatLngs[0] ? { lat: drawnLatLngs[0].lat, lng: drawnLatLngs[0].lng } : null
      const matchedRing = (isSection && firstPt) ? (rings.find((r) => isInsideRing(firstPt, r)) ?? null) : null
      const finalRing = matchedRing ? snapClosingSegment(drawnLatLngs, matchedRing) : drawnLatLngs
      const snapped = L.polygon(finalRing, { color: '#1CB0F6', weight: 2, fillOpacity: 0.2 })
      drawnItems.addLayer(snapped)
      const coords = finalRing.map((p) => [p.lng, p.lat])
      coords.push([finalRing[0].lng, finalRing[0].lat])
      setPendingGeometry({ type: 'Polygon', coordinates: [coords] })
      setDrawing(false); setVertexCount(0)
    })
    map.on(L.Draw.Event.DRAWSTOP,   () => { setDrawing(false); drawingRef.current = false; setVertexCount(0) })
    map.on(L.Draw.Event.DRAWVERTEX, () => {
      if (drawingRef.current === 'section') {
        const rings = boundaryRingRef.current
        const markers = drawHandlerRef.current?._markers
        if (rings.length && markers?.length) {
          const last = markers[markers.length - 1]
          const ll = last.getLatLng()
          const pt = { lat: ll.lat, lng: ll.lng }
          let bestDist = Infinity, bestPt = null
          for (const ring of rings) { const near = nearestPointOnRing(ring, pt); if (near.dist < bestDist) { bestDist = near.dist; bestPt = near.projected } }
          if (bestDist <= SNAP_TOLERANCE_METERS) last.setLatLng(L.latLng(bestPt.lat, bestPt.lng))
        }
      }
      setVertexCount((n) => n + 1)
    })

    const container = map.getContainer()
    const blockOutsideClick = (domEvent) => {
      if (drawingRef.current !== 'section' || !boundaryRingRef.current.length) return
      const ll = map.mouseEventToLatLng(domEvent)
      if (!boundaryRingRef.current.some((ring) => isInsideRing({ lat: ll.lat, lng: ll.lng }, ring))) {
        domEvent.stopPropagation(); domEvent.preventDefault()
      }
    }
    container.addEventListener('mousedown', blockOutsideClick, true)
    container.addEventListener('touchstart', blockOutsideClick, { capture: true, passive: false })

    map.on('click', () => {
      setSelectedZone((prev) => {
        if (prev) { const e = zoneLayers.current.get(prev.id); if (e) { e.selected = false; e.layer.setStyle(buildStyle(prev)) } }
        return null
      })
    })

    mapInstance.current = map
    tryLoadZones(map)

    return () => {
      container.removeEventListener('mousedown', blockOutsideClick, true)
      container.removeEventListener('touchstart', blockOutsideClick, { capture: true })
      generatedLayersRef.current.forEach(l => l.remove()); generatedLayersRef.current = []
      checkpointClusterRef.current?.clearLayers(); checkpointClusterRef.current = null
      if (locationMarkerRef.current) { map.removeLayer(locationMarkerRef.current); locationMarkerRef.current = null }
      map.remove(); mapInstance.current = null; zoneLayers.current.clear()
    }
  }, [])

  useEffect(() => {
    const map = mapInstance.current; if (!map) return
    zoneLayers.current.forEach(({ layer, zone }) => {
      const show = zone._isBoundary ? layerVisibility.boundary : layerVisibility.zones
      if (show && !map.hasLayer(layer)) layer.addTo(map)
      else if (!show && map.hasLayer(layer)) map.removeLayer(layer)
    })
  }, [layerVisibility])

  useEffect(() => { loadCheckpoints() }, [loadCheckpoints])

  useEffect(() => {
    const cluster = checkpointClusterRef.current; if (!cluster) return
    cluster.clearLayers()
    if (!layerVisibility.checkpoints) return
    checkpoints.forEach((cp) => {
      if (cp.latitude == null || cp.longitude == null) return
      const color = checkpointColor(cp)
      const icon = L.divIcon({ html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`, className: '', iconSize: [14, 14], iconAnchor: [7, 7] })
      L.marker([cp.latitude, cp.longitude], { icon }).addTo(cluster)
    })
  }, [checkpoints, layerVisibility.checkpoints])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (editingVertices) { stopVertexEdit(false) }
      else if (drawing) { drawHandlerRef.current?.disable(); drawnItemsRef.current?.clearLayers(); setPendingGeometry(null); setEditPendingGeometry(null); setDrawing(false); setVertexCount(0) }
      else if (selectedZone) { const entry = zoneLayers.current.get(selectedZone.id); if (entry) { entry.selected = false; entry.layer.setStyle(buildStyle(selectedZone)) }; setSelectedZone(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawing, selectedZone, editingVertices])

  // Create
  const handleStartDraw = (mode) => {
    createBoundaryIdRef.current = (mode !== 'boundary' && selectedZone?._isBoundary) ? selectedZone.id : null
    if (selectedZone) { const e = zoneLayers.current.get(selectedZone.id); if (e) { e.selected = false; e.layer.setStyle(buildStyle(selectedZone)) }; setSelectedZone(null) }
    setPendingGeometry(null); setCreateMode(mode); setCreateColor(mode === 'boundary' ? '#1A5C2E' : '#2D7D46')
    drawnItemsRef.current?.clearLayers(); drawHandlerRef.current.enable()
    mapInstance.current?.dragging.enable(); setDrawing(true); drawingRef.current = mode; setVertexCount(0)
  }

  const handleCancelCreate = () => {
    drawHandlerRef.current?.disable(); drawnItemsRef.current?.clearLayers()
    setPendingGeometry(null); setCreateMode(null); setDrawing(false); drawingRef.current = false; setVertexCount(0)
  }

  const handleSaveCreate = async (e) => {
    e.preventDefault()
    if (!createName.trim() || !pendingGeometry) return
    setSaving(true)
    try {
      if (createMode === 'boundary') await createBoundary({ name: createName.trim(), color: createColor, boundary: pendingGeometry })
      else await createZone({ name: createName.trim(), color: createColor, boundaryId: createBoundaryIdRef.current, boundary: pendingGeometry })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setCreateName(''); setCreateMode(null); setCreateColor('#2D7D46'); setPendingGeometry(null); drawnItemsRef.current?.clearLayers()
      addToast(`"${createName.trim()}" saved`); await loadCheckpoints()
    } catch (err) { addToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  // Edit
  const handleDeselect = () => {
    stopVertexEdit(false)
    if (selectedZone) { const e = zoneLayers.current.get(selectedZone.id); if (e) { e.selected = false; e.layer.setStyle(buildStyle(selectedZone)) } }
    setSelectedZone(null); setEditPendingGeometry(null); setConfirmingDelete(false)
    clearGeneratedZones(); drawHandlerRef.current?.disable(); drawnItemsRef.current?.clearLayers(); setDrawing(false); setVertexCount(0)
  }

  const handleEditVertices = () => {
    const layer = geojsonToEditableLayer(selectedZone?.boundary); if (!layer) return
    drawnItemsRef.current?.clearLayers(); drawnItemsRef.current?.addLayer(layer); setEditPendingGeometry(null)
    editHandlerRef.current = new L.EditToolbar.Edit(mapInstance.current, { featureGroup: drawnItemsRef.current })
    editHandlerRef.current.enable(); mapInstance.current?.dragging.enable(); setEditingVertices(true)
  }

  const handleDoneEditingVertices = () => { const geom = stopVertexEdit(true); if (geom) setEditPendingGeometry(geom) }
  const handleCancelEditingVertices = () => { stopVertexEdit(false); setEditPendingGeometry(null) }

  const handleSaveEdit = async (e) => {
    e.preventDefault(); if (!editName.trim() || !selectedZone) return
    setUpdating(true)
    try {
      if (selectedZone._isBoundary) await updateBoundary(selectedZone.id, { name: editName.trim(), color: editColor, boundary: editPendingGeometry ?? undefined })
      else await updateZone(selectedZone.id, { name: editName.trim(), color: editColor, boundaryId: selectedZone.boundaryId ?? undefined, boundary: editPendingGeometry ?? undefined })
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      addToast(`"${editName.trim()}" saved`); setSelectedZone(null); setEditPendingGeometry(null); drawnItemsRef.current?.clearLayers()
    } catch (err) { addToast(err.message, 'error') }
    finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if (!selectedZone) return
    setDeleting(true); setConfirmingDelete(false)
    const name = selectedZone.name
    try {
      if (selectedZone._isBoundary) await deleteBoundary(selectedZone.id); else await deleteZone(selectedZone.id)
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      setSelectedZone(null); drawnItemsRef.current?.clearLayers()
      addToast(`"${name}" deleted`); await loadCheckpoints()
    } catch (err) { addToast(err.message, 'error') }
    finally { setDeleting(false) }
  }

  // Generated zones
  function clearGeneratedZones() {
    generatedLayersRef.current.forEach(l => mapInstance.current?.removeLayer(l))
    generatedLayersRef.current = []; setGeneratedZones([])
  }

  const handleGeneratePreview = async () => {
    if (!selectedZone?._isBoundary) return; setGenerating(true)
    try {
      const token = sessionStorage.getItem("token") ?? ""
      const res = await APICall("GET", `/boundaries/${selectedZone.id}/generate-preview?count=${genCount}`, null, token)
      if (!res?.ok) throw new Error('Generation failed')
      const geometries = await res.json()
      setGeneratedZones(Array.isArray(geometries) ? geometries : [])
    } catch (err) { addToast(err.message, 'error') }
    finally { setGenerating(false) }
  }

  const handleSaveGenerated = async () => {
    if (!generatedZones.length || !selectedZone) return; setSavingGen(true)
    const count = generatedZones.length
    try {
      for (let i = 0; i < count; i++) await createZone({ name: `${selectedZone.name} Zone ${i + 1}`, color: '#2D7D46', boundaryId: selectedZone.id, boundary: generatedZones[i] })
      clearGeneratedZones(); await reloadZones(mapInstance.current, zone => handleZoneClickRef.current(zone))
      addToast(`${count} zone${count !== 1 ? 's' : ''} saved`); await loadCheckpoints()
    } catch (err) { addToast(err.message, 'error') }
    finally { setSavingGen(false) }
  }

  useEffect(() => {
    const map = mapInstance.current; if (!map) return
    generatedLayersRef.current.forEach(l => map.removeLayer(l)); generatedLayersRef.current = []
    generatedZones.forEach(geom => {
      const layer = L.geoJSON(geom, { style: () => ({ color: '#facc15', weight: 2, dashArray: '6 4', fillColor: '#facc15', fillOpacity: 0.12 }) })
      layer.addTo(map); generatedLayersRef.current.push(layer)
    })
  }, [generatedZones])

  const handleLocate = () => {
    if (locationActive) {
      if (locationMarkerRef.current) {
        mapInstance.current?.removeLayer(locationMarkerRef.current)
        locationMarkerRef.current = null
      }
      setLocationActive(false)
      return
    }
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords
        const map = mapInstance.current
        if (!map) { setLocating(false); return }
        if (locationMarkerRef.current) map.removeLayer(locationMarkerRef.current)
        const icon = L.divIcon({
          html: `<div style="position:relative;width:20px;height:20px">
            <div style="position:absolute;inset:0;border-radius:50%;background:#1CB0F6;opacity:0.35;animation:locate-pulse 1.5s ease-out infinite"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:#1CB0F6;border:2.5px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.2)"></div>
          </div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        locationMarkerRef.current = L.marker([latitude, longitude], { icon, zIndexOffset: 2000 }).addTo(map)
        map.flyTo([latitude, longitude], 18, { duration: 1.5 })
        setLocationActive(true)
        setLocating(false)
      },
      () => {
        addToast('Could not get your location. Please allow location access.', 'error')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleImportFromOsm = async () => {
    setImporting(true)
    try {
      const osmZones = await fetchOsmZones(); let failed = 0
      for (const z of osmZones) { try { await createZone({ name: z.name, color: z.color, boundary: z.geometry }) } catch (_) { failed++ } }
      await reloadZones(mapInstance.current, (zone) => handleZoneClickRef.current(zone))
      if (failed > 0) addToast(`Imported ${osmZones.length - failed}/${osmZones.length} zones — ${failed} failed.`, 'error')
      else addToast(`Imported ${osmZones.length} zones successfully.`)
    } catch (err) { addToast(err.message, 'error') }
    finally { setImporting(false) }
  }

  const zoneCheckpoints = useMemo(
    () => selectedZone ? checkpoints.filter((cp) => cp.zoneId === selectedZone.id) : [],
    [checkpoints, selectedZone]
  )
  const searchResults = useMemo(
    () => searchQuery.trim() ? checkpoints.filter((cp) => cp.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())) : [],
    [checkpoints, searchQuery]
  )

  return (
    <div className='flex h-full w-full overflow-hidden'>
      <style>{`@keyframes locate-pulse { 0% { transform:scale(1);opacity:0.35; } 100% { transform:scale(3.5);opacity:0; } }`}</style>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${t.type === 'error' ? 'bg-game-red' : 'bg-game-green'}`}>
            <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} text-xs`} />
            {t.message}
          </div>
        ))}
      </div>

      {/* Left control panel */}
      <div className="w-[380px] shrink-0 bg-surface border-r border-border overflow-y-auto flex flex-col pb-8">

        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Zone Manager</h2>
            <p className="text-xs text-text-secondary">
              {loading ? 'Loading…' : loadError ? 'Error loading zones' : `${zoneCount} zone${zoneCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Layer toggles */}
            {[
              { key: 'boundary',    label: 'Bounds',   color: 'bg-gray-700'  },
              { key: 'zones',       label: 'Zones',    color: 'bg-game-green' },
              { key: 'checkpoints', label: 'Points',   color: 'bg-indigo-500' },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setLayerVisibility(v => ({ ...v, [key]: !v[key] }))}
                className={`px-2 py-1 rounded-full text-[10px] font-bold border transition ${
                  layerVisibility[key] ? `${color} text-white border-transparent` : 'bg-white text-text-secondary border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">

          {/* Drawing status */}
          {(drawing || pendingGeometry) && (
            <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {createMode === 'boundary' ? 'New Boundary' : 'New Zone'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {pendingGeometry ? 'Shape ready — name it and save.'
                      : vertexCount === 0 ? 'Click on the map to place the first point.'
                      : vertexCount === 1 ? 'Click to add more points.'
                      : `${vertexCount} points — double-click to close.`}
                  </p>
                </div>
                <button onClick={handleCancelCreate} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary transition cursor-pointer">
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>

              {pendingGeometry && (
                <form onSubmit={handleSaveCreate} className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">{createMode === 'boundary' ? 'Boundary name' : 'Zone name'}</p>
                    <input type="text" placeholder={createMode === 'boundary' ? 'e.g. Humber Arboretum' : 'e.g. North Meadow'} value={createName} onChange={(e) => setCreateName(e.target.value)} autoFocus required className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Color</p>
                      <div className="flex items-center gap-2">
                        <input type="color" value={createColor} onChange={(e) => setCreateColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0" />
                        <span className="text-xs text-text-secondary font-mono">{createColor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className={btnPrimary + ' flex-1'}>
                      {saving ? 'Saving…' : createMode === 'boundary' ? 'Save Boundary' : 'Save Zone'}
                    </button>
                    <button type="button" onClick={handleCancelCreate} className={btnSecondary + ' flex-1'}>Discard</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Boundary selected */}
          {!drawing && !pendingGeometry && selectedZone?._isBoundary && (
            <div className="rounded-xl border border-game-blue/30 bg-white ring-1 ring-game-blue/20 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedZone.color }} />
                  <p className="text-sm font-bold text-text-primary">{selectedZone.name}</p>
                  <span className="text-[10px] font-bold text-game-blue bg-game-blue-soft px-2 py-0.5 rounded-full">Boundary</span>
                </div>
                <button onClick={handleDeselect} title="Deselect (Esc)" className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface transition cursor-pointer">
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>

              {editingVertices ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-text-secondary">
                    <i className="fa-solid fa-circle-info mr-1.5 text-game-blue" />
                    Drag handles to move points. Click a point to delete it.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleDoneEditingVertices} className={btnPrimary + ' flex-1'}>Done</button>
                    <button onClick={handleCancelEditingVertices} className={btnSecondary + ' flex-1'}>Cancel</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Name</p>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border" />
                      <span className="text-xs text-text-secondary font-mono">{editColor}</span>
                    </div>
                    <button type="button" onClick={handleEditVertices} className="flex items-center gap-1.5 text-xs font-bold text-game-blue border border-game-blue/30 bg-game-blue-soft px-3 py-1.5 rounded-xl hover:opacity-80 transition cursor-pointer ml-auto">
                      <i className="fa-solid fa-pen text-[10px]" /> Edit points
                    </button>
                  </div>
                  {editPendingGeometry && (
                    <p className="text-xs text-game-green flex items-center gap-1">
                      <i className="fa-solid fa-check" /> New shape ready to save
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={updating || deleting} className={btnPrimary + ' flex-1'}>
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                    {confirmingDelete ? (
                      <div className="flex gap-1.5 flex-1">
                        <button type="button" onClick={handleDelete} disabled={deleting} className={btnDanger + ' flex-1'}>
                          {deleting ? '…' : 'Confirm'}
                        </button>
                        <button type="button" onClick={() => setConfirmingDelete(false)} className={btnSecondary}>
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmingDelete(true)} disabled={deleting || updating}
                        className="flex items-center gap-1.5 text-game-red border border-game-red/20 bg-red-50 text-sm font-bold px-3 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:bg-red-100 transition">
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Zones within boundary */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {(() => {
                  const boundaryZones = zones.filter(z => !z._isBoundary && z.boundaryId === selectedZone.id)
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                          Zones {boundaryZones.length > 0 && <span className="ml-1 bg-surface border border-border px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">{boundaryZones.length}</span>}
                        </p>
                        <button type="button" onClick={() => handleStartDraw('section')}
                          className="flex items-center gap-1 text-xs font-bold text-game-blue bg-game-blue-soft border border-game-blue/20 px-2.5 py-1 rounded-lg hover:opacity-80 transition cursor-pointer">
                          <i className="fa-solid fa-plus text-[10px]" /> Add Zone
                        </button>
                      </div>
                      {boundaryZones.length === 0 ? (
                        <p className="text-xs text-text-secondary italic">No zones yet.</p>
                      ) : (
                        <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                          {boundaryZones.map((zone) => (
                            <button key={zone.id} type="button" onClick={() => handleZoneClickRef.current(zone)}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface text-left w-full transition cursor-pointer">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                              <span className="text-sm text-text-primary flex-1 truncate">{zone.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Generate zones */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Auto-generate Zones</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="number" min="1" max="20" value={genCount} onChange={(e) => setGenCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="w-16 border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
                  <span className="text-xs text-text-secondary">zones</span>
                  <button type="button" onClick={handleGeneratePreview} disabled={generating}
                    className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl border border-border bg-white text-text-primary hover:bg-surface disabled:opacity-50 transition cursor-pointer">
                    <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                    {generating ? 'Generating…' : 'Preview'}
                  </button>
                  {generatedZones.length > 0 && (
                    <>
                      <button type="button" onClick={clearGeneratedZones} className="text-xs text-text-secondary hover:text-text-primary cursor-pointer">Clear</button>
                      <button type="button" onClick={handleSaveGenerated} disabled={savingGen} className={btnPrimary}>
                        {savingGen ? 'Saving…' : `Save ${generatedZones.length}`}
                      </button>
                    </>
                  )}
                </div>
                {generatedZones.length > 0 && (
                  <p className="text-xs text-game-amber flex items-center gap-1">
                    <i className="fa-solid fa-eye" /> {generatedZones.length} preview zones on map — save to keep.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Zone selected */}
          {!drawing && !pendingGeometry && selectedZone && !selectedZone._isBoundary && (
            <div className="rounded-xl border border-game-blue/30 bg-white ring-1 ring-game-blue/20 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedZone.color }} />
                  <p className="text-sm font-bold text-text-primary">{selectedZone.name}</p>
                  <span className="text-[10px] font-bold text-game-green bg-[#d1fae5] px-2 py-0.5 rounded-full">Zone</span>
                </div>
                <button onClick={handleDeselect} title="Deselect (Esc)" className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface transition cursor-pointer">
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>

              {editingVertices ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-text-secondary">
                    <i className="fa-solid fa-circle-info mr-1.5 text-game-blue" />
                    Drag handles to move points. Click a point to delete it.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleDoneEditingVertices} className={btnPrimary + ' flex-1'}>Done</button>
                    <button onClick={handleCancelEditingVertices} className={btnSecondary + ' flex-1'}>Cancel</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Name</p>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className={inputCls} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border" />
                      <span className="text-xs text-text-secondary font-mono">{editColor}</span>
                    </div>
                    <button type="button" onClick={handleEditVertices} className="flex items-center gap-1.5 text-xs font-bold text-game-blue border border-game-blue/30 bg-game-blue-soft px-3 py-1.5 rounded-xl hover:opacity-80 transition cursor-pointer ml-auto">
                      <i className="fa-solid fa-pen text-[10px]" /> Edit points
                    </button>
                  </div>
                  {editPendingGeometry && (
                    <p className="text-xs text-game-green flex items-center gap-1">
                      <i className="fa-solid fa-check" /> New shape ready to save
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={updating || deleting} className={btnPrimary + ' flex-1'}>
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                    {confirmingDelete ? (
                      <div className="flex gap-1.5 flex-1">
                        <button type="button" onClick={handleDelete} disabled={deleting} className={btnDanger + ' flex-1'}>
                          {deleting ? '…' : 'Confirm'}
                        </button>
                        <button type="button" onClick={() => setConfirmingDelete(false)} className={btnSecondary}>
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmingDelete(true)} disabled={deleting || updating}
                        className="flex items-center gap-1.5 text-game-red border border-game-red/20 bg-red-50 text-sm font-bold px-3 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:bg-red-100 transition">
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Sensors & Elements */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Sensors &amp; Elements
                  {zoneCheckpoints.length > 0 && <span className="ml-1.5 bg-surface border border-border px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">{zoneCheckpoints.length}</span>}
                </p>
                {zoneCheckpoints.length === 0 ? (
                  <p className="text-xs text-text-secondary italic">None assigned to this zone.</p>
                ) : (
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                    {zoneCheckpoints.map((cp) => (
                      <div key={cp.id} className="flex items-center gap-2 py-1 px-2 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm" style={{ backgroundColor: checkpointColor(cp) }} />
                        <span className="text-sm text-text-primary flex-1 truncate">{cp.name || `#${cp.referenceId}`}</span>
                        <span className="text-[10px] text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded-full capitalize shrink-0">{cp.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nothing selected — default state */}
          {!drawing && !pendingGeometry && !selectedZone && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-secondary">Click a boundary on the map to edit it or manage its zones.</p>

              <div className="flex gap-2">
                <button onClick={() => handleStartDraw('boundary')} className={btnBlue + ' flex-1 flex items-center justify-center gap-2'}>
                  <i className="fa-solid fa-border-all text-xs" /> Draw Boundary
                </button>
                <button onClick={handleImportFromOsm} disabled={importing} className={btnSecondary + ' flex-1 flex items-center justify-center gap-2'}>
                  <i className="fa-brands fa-openstreetmap text-xs" /> {importing ? 'Importing…' : 'Import OSM'}
                </button>
              </div>

              {/* Search */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Find sensor / element</p>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                  <input type="text" placeholder="Search by name…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-border rounded-xl pl-8 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
                </div>
                {searchQuery.trim() && (
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-text-secondary px-1 italic">No results.</p>
                    ) : searchResults.map((cp) => {
                      const zone = zones.find((z) => z.id === cp.zoneId)
                      return (
                        <button key={cp.id} type="button"
                          onClick={() => { if (cp.latitude != null) mapInstance.current?.flyTo([cp.latitude, cp.longitude], 18); if (zone) handleZoneClickRef.current(zone) }}
                          className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-surface text-left w-full transition cursor-pointer">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm" style={{ backgroundColor: checkpointColor(cp) }} />
                          <span className="text-sm text-text-primary flex-1 truncate">{cp.name || `#${cp.referenceId}`}</span>
                          <span className="text-[10px] text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded-full capitalize shrink-0">{cp.type}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {[
              { color: '#1A5C2E', label: 'Boundary' },
              { color: '#2D7D46', label: 'Zone', opacity: 0.7 },
              { color: '#6366f1', label: 'Sensor' },
              { color: '#33A661', label: 'Tree' },
              { color: '#3B82F6', label: 'Shrub' },
              { color: '#ef4444', label: 'Other' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.color, opacity: t.opacity ?? 1 }} />
                <span className="text-xs text-text-secondary">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapRef} className="h-full w-full" />

        {/* My Location button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          title={locationActive ? 'Hide my location' : 'Show my location'}
          className={`absolute bottom-[88px] right-3 z-[1000] w-9 h-9 flex items-center justify-center rounded-xl shadow-md border transition ${
            locationActive ? 'bg-game-blue text-white border-game-blue' : 'bg-white text-text-secondary border-border hover:bg-surface'
          } ${locating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <i className={`fa-solid ${locating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'} text-sm`} />
        </button>

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="bg-white rounded-xl border border-border p-6 text-center max-w-sm shadow-lg">
              <i className="fa-solid fa-triangle-exclamation text-game-amber text-2xl mb-3" />
              <p className="text-sm font-bold text-text-primary mb-1">Failed to load zones</p>
              <p className="text-xs text-text-secondary mb-4">{loadError}</p>
              <button onClick={() => tryLoadZones(mapInstance.current)} className={btnBlue}>Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
