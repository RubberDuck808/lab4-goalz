import { useEffect, useRef, useState } from 'react'
import MapLegend from './MapLegend'

export default function Map({
  showExtent,
  setShowExtent,
  closeModal,
  elements,
  sensors,
  setSelectedElement,
  selectedElement,
  setSelectedSensor,
  selectedSensor,
  onCoordsPick,
  pickedCoords,
}) {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const elementMarkersRef = useRef([])
  const sensorMarkersRef = useRef([])
  const selectedMarkerRef = useRef(null) // { marker, originalStyle, type }
  const pickedMarkerRef = useRef(null)
  const onCoordPickRef = useRef(onCoordsPick)
  onCoordPickRef.current = onCoordsPick

  const L = window.L

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current, { attributionControl: false }).setView([43.7260, -79.6099], 15)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    map.setMinZoom(0)
    map.zoomControl.setPosition('bottomleft')

    map.on('click', (e) => {
      if (onCoordPickRef.current) {
        onCoordPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    })

    setMapInstance(map)

    return () => { map.remove() }
  }, [])

  // Reset highlight when parent clears selection
  useEffect(() => {
    const sel = selectedMarkerRef.current
    if (!sel) return
    if (!selectedElement && sel.type === 'element') {
      sel.marker.setStyle(sel.originalStyle)
      selectedMarkerRef.current = null
    }
    if (!selectedSensor && sel.type === 'sensor') {
      sel.marker.setStyle(sel.originalStyle)
      selectedMarkerRef.current = null
    }
  }, [selectedElement, selectedSensor])

  // Element markers
  useEffect(() => {
    if (!mapInstance || !elements) return

    elementMarkersRef.current.forEach((m) => mapInstance.removeLayer(m))
    elementMarkersRef.current = []
    if (selectedMarkerRef.current?.type === 'element') selectedMarkerRef.current = null

    const newMarkers = elements.map((element) => {
      const { geom, elementType, isGreen } = element
      const [lng, lat] = geom.coordinates  // GeoJSON: [longitude, latitude]

      let fillColor = 'red'
      if (elementType === 1 || isGreen) fillColor = 'green'
      else if (elementType === 2) fillColor = 'blue'

      const originalStyle = { color: 'white', weight: 2, fillColor, fillOpacity: 0.8, radius: 8 }
      const marker = L.circleMarker([lat, lng], { ...originalStyle }).addTo(mapInstance)  // Leaflet: [lat, lng]

      marker.on('click', () => {
        // Reset previous selection
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.marker.setStyle(selectedMarkerRef.current.originalStyle)
        }
        // Highlight this marker
        marker.setStyle({ color: '#facc15', fillColor: '#facc15', weight: 3, radius: 10, fillOpacity: 0.9 })
        selectedMarkerRef.current = { marker, originalStyle, type: 'element' }
        setSelectedElement(element)
      })

      return marker
    })

    elementMarkersRef.current = newMarkers
  }, [mapInstance, elements])

  // Sensor markers
  useEffect(() => {
    if (!mapInstance || !sensors) return

    sensorMarkersRef.current.forEach((m) => mapInstance.removeLayer(m))
    sensorMarkersRef.current = []
    if (selectedMarkerRef.current?.type === 'sensor') selectedMarkerRef.current = null

    const newMarkers = sensors
      .map((sensor) => {
        const coords = sensor.geo?.coordinates
        if (!coords) return null
        const [lng, lat] = coords  // GeoJSON: [longitude, latitude]

        const originalStyle = { color: 'white', weight: 2, fillColor: '#6366f1', fillOpacity: 0.8, radius: 8 }
        const marker = L.circleMarker([lat, lng], { ...originalStyle }).addTo(mapInstance)  // Leaflet: [lat, lng]

        marker.on('click', () => {
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.marker.setStyle(selectedMarkerRef.current.originalStyle)
          }
          marker.setStyle({ color: '#facc15', fillColor: '#facc15', weight: 3, radius: 10, fillOpacity: 0.9 })
          selectedMarkerRef.current = { marker, originalStyle, type: 'sensor' }
          if (setSelectedSensor) setSelectedSensor(sensor)
        })

        return marker
      })
      .filter(Boolean)

    sensorMarkersRef.current = newMarkers
  }, [mapInstance, sensors])

  // Crosshair cursor when in coordinate-pick mode
  useEffect(() => {
    if (!mapInstance) return
    mapInstance.getContainer().style.cursor = onCoordsPick ? 'crosshair' : ''
  }, [mapInstance, onCoordsPick])

  // Preview marker for the coordinate picked in add mode
  useEffect(() => {
    if (!mapInstance) return
    if (pickedMarkerRef.current) {
      mapInstance.removeLayer(pickedMarkerRef.current)
      pickedMarkerRef.current = null
    }
    if (!pickedCoords) return
    const marker = L.circleMarker([pickedCoords.lat, pickedCoords.lng], {
      color: '#facc15',
      fillColor: '#facc15',
      fillOpacity: 0.9,
      weight: 3,
      radius: 10,
    }).addTo(mapInstance)
    marker.bindTooltip('New location', { permanent: false, direction: 'top' })
    pickedMarkerRef.current = marker
  }, [mapInstance, pickedCoords])

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="h-full w-full rounded-t-lg overflow-hidden relative">
        <button
          className='absolute top-4 left-4 w-9 h-9 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer'
          onClick={() => setShowExtent(true)}
        >
          <i className="fa-solid fa-plus" />
        </button>
        {showExtent && (
          <button
            className='absolute top-4 right-4 w-10 h-10 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer'
            onClick={() => closeModal()}
          >
            <i className="fa-solid fa-maximize" />
          </button>
        )}
        {onCoordsPick && (
          <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-10 pointer-events-none'>
            Click on the map to set coordinates
          </div>
        )}
        <div className='absolute bottom-2 right-2 z-10 text-gray-500 text-xs flex items-center gap-1'>
          <i className="fa-regular fa-copyright" />
          OpenStreetMap
        </div>
        <div ref={mapRef} id="map" className="h-full w-full rounded-t-lg overflow-hidden z-0" />
      </div>
      <div className='bg-light-green p-4 w-full rounded-b-lg flex items-center gap-5'>
        <MapLegend text="Tree / Green" color="bg-primary-green" />
        <MapLegend text="Water" color="bg-blue-500" />
        <MapLegend text="Other" color="bg-red-500" />
        <MapLegend text="Sensor" color="bg-[#6366f1]" />
      </div>
    </div>
  )
}
