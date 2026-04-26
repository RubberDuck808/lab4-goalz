const LAYERS = [
  { key: 'checkpoints', label: 'Points',      icon: 'fa-location-dot', color: '#6366f1' },
  { key: 'zones',       label: 'Zones',       icon: 'fa-draw-polygon', color: '#2D7D46' },
  { key: 'boundary',    label: 'Boundary',    icon: 'fa-border-all',   color: '#1A5C2E' },
]

export default function LayerSidebar({ visibility, onToggle }) {
  return (
    <div className="flex flex-col justify-end h-full shrink-0">
      <div className="bg-white border border-gray-300 shadow rounded-xl overflow-hidden flex flex-col">
        {LAYERS.map((l, i) => {
          const on = !!visibility[l.key]
          return (
            <div key={l.key} className="flex flex-col">
              {i > 0 && <div className="h-px bg-gray-200 mx-3" />}
              <button
                type="button"
                onClick={() => onToggle(l.key)}
                title={`${on ? 'Hide' : 'Show'} ${l.label}`}
                className="flex items-center gap-2.5 px-3 py-2.5 transition-colors cursor-pointer hover:bg-gray-50 w-full text-left"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 transition-colors"
                  style={{ backgroundColor: on ? l.color : '#c4c4c4' }}
                >
                  <i className={`fa-solid ${l.icon}`} />
                </span>
                <span className={`font text-sm font-medium whitespace-nowrap transition-colors ${on ? 'text-gray-800' : 'text-gray-400'}`}>
                  {l.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
