import { useEffect, useRef } from 'react'
import MapLegend from './MapLegend'

export default function Map({
  showExtent,
  setShowExtent,
  closeModal,
  elements,
  setSelectedElement,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const L = window.L

  const handleMarkerClick = (element) => {
    setSelectedElement(element)
  }

  useEffect(() => {
    if (!mapRef.current || !L) return

    const container = mapRef.current

    // Extra safety: destroy previous map if somehow still attached
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Important: clear Leaflet's internal DOM stamp
    if (container._leaflet_id) {
      container._leaflet_id = null
      delete container._leaflet_id
    }

    const center = [43.7260, -79.6099]

    const map = L.map(container, {
      attributionControl: false,
    }).setView(center, 15)

    mapInstanceRef.current = map

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map)

    map.setMinZoom(0)
    map.zoomControl.setPosition('bottomleft')

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 50,
    })

    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup

    return () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers()
        clusterGroupRef.current = null
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (container._leaflet_id) {
        container._leaflet_id = null
        delete container._leaflet_id
      }
    }
  }, [])

  useEffect(() => {
    if (!clusterGroupRef.current || !elements || !L) return

    const clusterGroup = clusterGroupRef.current
    clusterGroup.clearLayers()

    const newMarkers = elements.map((element) => {
      const { geom, elementType, isGreen } = element
      const [lng, lat] = geom.coordinates

      let fillColor = 'red'
      if (elementType === 1 || isGreen) fillColor = 'green'
      else if (elementType === 2) fillColor = 'blue'

      const icon = L.divIcon({
        html: `
          <div
            style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: ${fillColor};
              border: 2px solid white;
              box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
            "
          ></div>
        `,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      // Leaflet expects [lat, lng]
      const marker = L.marker([lat, lng], { icon })
      marker.on('click', () => handleMarkerClick(element))
      return marker
    })

    newMarkers.forEach((marker) => clusterGroup.addLayer(marker))
  }, [elements, L])

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="h-full w-full rounded-t-lg overflow-hidden relative">
        <button
          className="absolute top-4 left-4 w-9 h-9 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none focus:ring-2 focus:ring-[#33A661] z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer"
          onClick={() => setShowExtent(true)}
        >
          <i className="fa-solid fa-plus"></i>
        </button>

        {showExtent && (
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none focus:ring-2 focus:ring-[#33A661] z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer"
            onClick={() => closeModal()}
          >
            <i className="fa-solid fa-maximize"></i>
          </button>
        )}

        <div className="absolute bottom-2 right-2 z-10 text-gray-500 text-xs flex items-center gap-1">
          <i className="fa-regular fa-copyright"></i>
          OpenStreetMap
        </div>

        <div
          ref={mapRef}
          className="h-full w-full rounded-t-lg overflow-hidden z-0"
        />
      </div>

      <div className="bg-light-green p-4 w-full rounded-b-lg flex items-center gap-5">
        <MapLegend text="Tree" color="bg-primary-green" />
        <MapLegend text="Water" color="bg-blue-500" />
        <MapLegend text="Sensor" color="bg-red-500" />
      </div>
    </div>
  )
}