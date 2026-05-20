import { useState } from 'react'
import { createZone, updateZone, deleteZone } from '../../../services/zoneService'
import { createBoundary, updateBoundary, deleteBoundary } from '../../../services/boundaryService'

function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

function getGeometryCentroid(boundary) {
  if (!boundary) return null;
  let coords = [];
  if (boundary.type === 'Polygon') {
    coords = boundary.coordinates[0];
  } else if (boundary.type === 'MultiPolygon') {
    coords = boundary.coordinates[0]?.[0] || [];
  }
  if (!coords || coords.length === 0) return null;
  
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;
  for (const [lng, lat] of coords) {
    if (typeof lat === 'number' && typeof lng === 'number') {
      sumLat += lat;
      sumLng += lng;
      count++;
    }
  }
  if (count === 0) return null;
  return { lat: sumLat / count, lng: sumLng / count };
}

const inputCls = 'w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/30'
const btnPrimary   = 'bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'
const btnBlue      = 'bg-game-blue border-b-[3px] border-game-blue-border text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'
const btnSecondary = 'bg-surface border border-border text-text-primary text-sm font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-border transition'
const btnDanger    = 'bg-game-red border-b-[3px] border-game-red-dark text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition'

export default function ZonesPanel({
  // zone data (from MapDashboard)
  zones = [],           // includes both boundaries (._isBoundary) and zones
  checkpoints = [],
  zoneCount = 0,
  // selection state (from MapDashboard)
  selectedZone = null,
  onSelectZone,
  // draw state (from MapDashboard)
  drawing = false,
  vertexCount = 0,
  pendingGeometry = null,
  editingVertices = false,
  editPendingGeometry = null,
  onStartDraw,          // fn(mode: 'boundary'|'zone'|'section')
  onCancelDraw,         // fn
  onZonesChanged,       // fn(): re-fetch zones in MapDashboard
  onGeneratedZonesChange, // fn(geometries[])
  mapFlyTo,             // fn({ lat, lng })
}) {
  const [createName, setCreateName]   = useState('')
  const [createColor, setCreateColor] = useState('#2D7D46')
  const [createMode, setCreateMode]   = useState(null)
  const [saving, setSaving]           = useState(false)

  const [editName, setEditName]               = useState('')
  const [editColor, setEditColor]             = useState('#2D7D46')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [updating, setUpdating]               = useState(false)
  const [deleting, setDeleting]               = useState(false)

  const [genCount, setGenCount]     = useState(4)
  const [generatedZones, setGeneratedZones] = useState([])
  const [generating, setGenerating] = useState(false)
  const [savingGen, setSavingGen]   = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const [toasts, setToasts] = useState([])
  function addToast(message, type = 'success') {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  function clearGeneratedZones() {
    setGeneratedZones([])
    onGeneratedZonesChange?.([])
  }

  // ── start draw ─────────────────────────────────────────────────────────
  function handleStartDraw(mode) {
    clearGeneratedZones()
    setCreateMode(mode)
    setCreateColor(mode === 'boundary' ? '#1A5C2E' : '#2D7D46')
    onSelectZone?.(null)
    onStartDraw?.(mode)
  }

  function handleCancelCreate() {
    setCreateMode(null)
    setCreateName('')
    onCancelDraw?.()
  }

  // ── save new zone/boundary ─────────────────────────────────────────────
  async function handleSaveCreate(e) {
    e.preventDefault()
    if (!createName.trim() || !pendingGeometry) return
    setSaving(true)
    try {
      if (createMode === 'boundary') {
        await createBoundary({ name: createName.trim(), color: createColor, boundary: pendingGeometry })
      } else {
        const boundaryId = (createMode === 'section' && selectedZone?._isBoundary) ? selectedZone.id : null
        await createZone({ name: createName.trim(), color: createColor, boundaryId, boundary: pendingGeometry })
      }
      addToast(`"${createName.trim()}" saved`)
      setCreateName(''); setCreateMode(null)
      onCancelDraw?.()
      onZonesChanged?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── select zone ────────────────────────────────────────────────────────
  function handleSelectZone(zone) {
    clearGeneratedZones()
    setEditName(zone.name)
    setEditColor(zone.color ?? '#2D7D46')
    setConfirmingDelete(false)
    onSelectZone?.(zone)
    if (zone?.boundary) {
      const centroid = getGeometryCentroid(zone.boundary)
      if (centroid) {
        mapFlyTo?.(centroid)
      }
    }
  }

  function handleDeselect() {
    setConfirmingDelete(false)
    clearGeneratedZones()
    onSelectZone?.(null)
    onCancelDraw?.()
  }

  // ── save edit ──────────────────────────────────────────────────────────
  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editName.trim() || !selectedZone) return
    setUpdating(true)
    try {
      if (selectedZone._isBoundary) {
        await updateBoundary(selectedZone.id, { name: editName.trim(), color: editColor, boundary: editPendingGeometry ?? undefined })
      } else {
        await updateZone(selectedZone.id, { name: editName.trim(), color: editColor, boundaryId: selectedZone.boundaryId ?? undefined, boundary: editPendingGeometry ?? undefined })
      }
      addToast(`"${editName.trim()}" saved`)
      onSelectZone?.(null)
      onZonesChanged?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  // ── delete ─────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!selectedZone) return
    setDeleting(true); setConfirmingDelete(false)
    const name = selectedZone.name
    try {
      if (selectedZone._isBoundary) await deleteBoundary(selectedZone.id)
      else await deleteZone(selectedZone.id)
      addToast(`"${name}" deleted`)
      onSelectZone?.(null)
      onZonesChanged?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }


  // ── AI zone generation ─────────────────────────────────────────────────
  async function handleGeneratePreview() {
    if (!selectedZone?._isBoundary) return
    setGenerating(true)
    try {
      const res = await fetch(`${getApiBase()}/api/dashboard/boundaries/${selectedZone.id}/generate-preview?count=${genCount}`)
      if (!res.ok) throw new Error('Generation failed')
      const geometries = await res.json()
      const list = Array.isArray(geometries) ? geometries : []
      setGeneratedZones(list)
      onGeneratedZonesChange?.(list)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveGenerated() {
    if (!generatedZones.length || !selectedZone) return
    setSavingGen(true)
    const count = generatedZones.length
    try {
      for (let i = 0; i < count; i++) {
        await createZone({ name: `${selectedZone.name} Zone ${i + 1}`, color: '#2D7D46', boundaryId: selectedZone.id, boundary: generatedZones[i] })
      }
      addToast(`${count} zone${count !== 1 ? 's' : ''} saved`)
      clearGeneratedZones()
      onZonesChanged?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSavingGen(false)
    }
  }



  const zoneCheckpoints = selectedZone ? checkpoints.filter(cp => cp.zoneId === selectedZone.id) : []
  const searchResults   = searchQuery.trim()
    ? checkpoints.filter(cp => cp.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : []

  const boundaries = zones.filter(z => z._isBoundary)
  const childZones = selectedZone ? zones.filter(z => !z._isBoundary && z.boundaryId === selectedZone.id) : []

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toasts */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${t.type === 'error' ? 'bg-game-red' : 'bg-game-green'}`}>
            <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} text-xs`} />
            {t.message}
          </div>
        ))}
      </div>

      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border bg-white shrink-0">
        <h2 className="text-sm font-bold text-text-primary">Zone Manager</h2>
        <p className="text-xs text-text-secondary">{zoneCount} zone{zoneCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto pb-8">

        {/* Drawing status */}
        {(drawing || pendingGeometry) && (
          <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {createMode === 'boundary' ? 'New Boundary' : 'New Zone'}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {pendingGeometry
                    ? 'Shape ready — name it and save.'
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
                  <input
                    type="text"
                    placeholder={createMode === 'boundary' ? 'e.g. Humber Arboretum' : 'e.g. North Meadow'}
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    autoFocus required
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Color</p>
                    <div className="flex items-center gap-2">
                      <input type="color" value={createColor} onChange={e => setCreateColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0" />
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
                <span className="text-[10px] font-bold text-gray-500 bg-surface border border-border px-2 py-0.5 rounded-full">Boundary</span>
              </div>
              <button onClick={handleDeselect} title="Deselect (Esc)" className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface transition cursor-pointer">
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            {editingVertices ? (
              <p className="text-xs text-text-secondary">
                <i className="fa-solid fa-circle-info mr-1.5 text-game-blue" />
                Use the map overlay buttons to finish editing.
              </p>
            ) : (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Name</p>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border" />
                    <span className="text-xs text-text-secondary font-mono">{editColor}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartDraw?.('__vertex_edit__')}
                    className="flex items-center gap-1.5 text-xs font-bold text-game-blue border border-game-blue/30 bg-game-blue-soft px-3 py-1.5 rounded-xl hover:opacity-80 transition cursor-pointer ml-auto"
                  >
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

            {/* Draw zone section inside this boundary */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Add Zones</p>
              <button onClick={() => handleStartDraw('section')} className={btnBlue + ' w-full'}>
                <i className="fa-solid fa-draw-polygon mr-1.5 text-xs" />Draw Zone Section
              </button>
            </div>

            {/* AI generate zones */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Auto-Generate Zones</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={1} max={20} value={genCount}
                  onChange={e => setGenCount(Number(e.target.value))}
                  className="w-16 border border-border rounded-xl px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-game-blue/30"
                />
                <span className="text-xs text-text-secondary flex-1">zones to generate</span>
                <button onClick={handleGeneratePreview} disabled={generating} className={btnBlue}>
                  {generating ? 'Generating…' : 'Preview'}
                </button>
              </div>
              {generatedZones.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-text-secondary">{generatedZones.length} zones previewed on map</p>
                  <div className="flex gap-2">
                    <button onClick={handleSaveGenerated} disabled={savingGen} className={btnPrimary + ' flex-1'}>
                      {savingGen ? 'Saving…' : `Save ${generatedZones.length} zones`}
                    </button>
                    <button onClick={clearGeneratedZones} className={btnSecondary}>Discard</button>
                  </div>
                </div>
              )}
            </div>

            {/* Zones inside this boundary */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                Zones inside Boundary
                {childZones.length > 0 && (
                  <span className="ml-1.5 bg-surface border border-border px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">{childZones.length}</span>
                )}
              </p>
              {childZones.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No zones defined in this boundary.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {childZones.map(cz => (
                    <button
                      key={cz.id}
                      type="button"
                      onClick={() => handleSelectZone(cz)}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:bg-surface text-left text-xs transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cz.color }} />
                        <span className="font-bold text-text-primary truncate">{cz.name}</span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-text-secondary text-[10px]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Zone checkpoints */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                Sensors &amp; Elements
                {zoneCheckpoints.length > 0 && (
                  <span className="ml-1.5 bg-surface border border-border px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">{zoneCheckpoints.length}</span>
                )}
              </p>
              {zoneCheckpoints.length === 0
                ? <p className="text-xs text-text-secondary italic">None assigned to this zone.</p>
                : zoneCheckpoints.map(cp => (
                  <p key={cp.id} className="text-xs text-text-primary truncate">{cp.name || `#${cp.referenceId}`}</p>
                ))
              }
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
              <p className="text-xs text-text-secondary">
                <i className="fa-solid fa-circle-info mr-1.5 text-game-blue" />
                Use the map overlay buttons to finish editing.
              </p>
            ) : (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Name</p>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className={inputCls} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border" />
                    <span className="text-xs text-text-secondary font-mono">{editColor}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartDraw?.('__vertex_edit__')}
                    className="flex items-center gap-1.5 text-xs font-bold text-game-blue border border-game-blue/30 bg-game-blue-soft px-3 py-1.5 rounded-xl hover:opacity-80 transition cursor-pointer ml-auto"
                  >
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

            {/* Checkpoints in zone */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                Sensors &amp; Elements
                {zoneCheckpoints.length > 0 && (
                  <span className="ml-1.5 bg-surface border border-border px-1.5 py-0.5 rounded-full font-medium normal-case tracking-normal">{zoneCheckpoints.length}</span>
                )}
              </p>
              {zoneCheckpoints.length === 0
                ? <p className="text-xs text-text-secondary italic">None assigned to this zone.</p>
                : zoneCheckpoints.slice(0, 5).map(cp => (
                  <p key={cp.id} className="text-xs text-text-primary truncate">{cp.name || `#${cp.referenceId}`}</p>
                ))
              }
              {zoneCheckpoints.length > 5 && (
                <p className="text-xs text-text-secondary">+{zoneCheckpoints.length - 5} more</p>
              )}
            </div>
          </div>
        )}

        {/* Default state: action buttons */}
        {!drawing && !pendingGeometry && !selectedZone && (
          <div className="flex flex-col gap-3">
            <button onClick={() => handleStartDraw('boundary')} className={btnPrimary + ' w-full'}>
              <i className="fa-solid fa-plus mr-1.5 text-xs" />New Boundary
            </button>

            {/* List all Boundaries */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Boundaries</p>
              {boundaries.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No boundaries created yet.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {boundaries.map(b => (
                    <button key={b.id} onClick={() => handleSelectZone(b)} className="flex items-center gap-2 py-2 px-2.5 rounded-xl hover:bg-surface text-left w-full transition cursor-pointer border border-border bg-white shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="text-sm font-bold text-text-primary flex-1 truncate">{b.name}</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-text-secondary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        {checkpoints.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Search</p>
            <input
              type="text"
              placeholder="Search sensors & elements…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={inputCls}
            />
            {searchQuery.trim() && (
              <div className="flex flex-col gap-1">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-text-secondary px-1 italic">No results.</p>
                ) : searchResults.map(cp => {
                  const zone = zones.find(z => z.id === cp.zoneId)
                  return (
                    <button key={cp.id} type="button"
                      onClick={() => { if (cp.latitude != null) mapFlyTo?.({ lat: cp.latitude, lng: cp.longitude }); if (zone) handleSelectZone(zone) }}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-surface text-left w-full transition cursor-pointer">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: cp.type === 'sensor' ? '#6366f1' : cp.elementTypeId === 1 ? '#059669' : cp.elementTypeId === 2 ? '#3b82f6' : '#f59e0b' }} />
                      <span className="text-sm text-text-primary flex-1 truncate">{cp.name || `#${cp.referenceId}`}</span>
                      <span className="text-[10px] text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded-full capitalize shrink-0">{cp.type}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
          {[
            { color: '#1A5C2E', label: 'Boundary' },
            { color: '#2D7D46', label: 'Zone' },
            { color: '#6366f1', label: 'Sensor' },
            { color: '#059669', label: 'Tree' },
            { color: '#3b82f6', label: 'Shrub' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-text-secondary">{t.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
