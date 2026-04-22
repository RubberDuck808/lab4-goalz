import { useState } from 'react'

const ZONE_TYPES = [
  { value: 'boundary', label: 'Boundary' },
  { value: 'area', label: 'Area' },
  { value: 'path', label: 'Trail / Path' },
]

const DEFAULT_COLORS = {
  boundary: '#1A5C2E',
  area: '#2D7D46',
  path: '#8B6914',
}

export default function ZoneCreationModal({ onSave, onCancel, saving, error }) {
  const [name, setName] = useState('')
  const [zoneType, setZoneType] = useState('area')
  const [color, setColor] = useState(DEFAULT_COLORS.area)

  const handleZoneTypeChange = (e) => {
    const t = e.target.value
    setZoneType(t)
    setColor(DEFAULT_COLORS[t] ?? '#33A661')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), zoneType, color })
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-gray-900 rounded-xl p-5 w-72 shadow-xl border border-gray-700">
      <h2 className="text-white font-bold text-lg mb-4">New Zone</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Zone name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-green-500"
          required
          autoFocus
        />
        <select
          value={zoneType}
          onChange={handleZoneTypeChange}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none"
        >
          {ZONE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <label className="text-gray-400 text-sm">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <span className="text-gray-500 text-xs font-mono">{color}</span>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Zone'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg py-2 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
