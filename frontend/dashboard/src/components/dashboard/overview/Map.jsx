import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import MapLegend from './MapLegend'

function checkpointColor(cp) {
  if (cp.type === 'sensor') return '#6366f1'
  if (cp.elementTypeId === 1 || cp.isGreen) return '#33A661'
  if (cp.elementTypeId === 2) return '#3b82f6'
  return '#ef4444'
}

export default function Map({
  showExtent,
  setShowExtent,
  closeModal,
  checkpoints,
  onCheckpointClick,
  onCoordsPick,
  pickedCoords,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const onCoordsPickRef = useRef(onCoordsPick)
  const onCheckpointClickRef = useRef(onCheckpointClick)
  const pickedMarkerRef = useRef(null)

  useEffect(() => { onCoordsPickRef.current = onCoordsPick }, [onCoordsPick])
  useEffect(() => { onCheckpointClickRef.current = onCheckpointClick }, [onCheckpointClick])

  useEffect(() => {
    if (!mapRef.current) return

    const container = mapRef.current

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    if (container._leaflet_id) {
      container._leaflet_id = null
      delete container._leaflet_id
    }

    const map = L.map(container, {
      attributionControl: false,
    }).setView([43.7260, -79.6099], 15)

    mapInstanceRef.current = map

    map.on('click', (e) => {
      if (onCoordsPickRef.current) {
        onCoordsPickRef.current({
          lat: +e.latlng.lat.toFixed(6),
          lng: +e.latlng.lng.toFixed(6),
        })
      }
    })

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
    const map = mapInstanceRef.current
    if (!map) return
    map.getContainer().style.cursor = onCoordsPick ? 'crosshair' : ''
  }, [onCoordsPick])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current)
      pickedMarkerRef.current = null
    }

    if (pickedCoords) {
      pickedMarkerRef.current = L.circleMarker([pickedCoords.lat, pickedCoords.lng], {
        radius: 10,
        fillColor: '#33A661',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 0.9,
      }).addTo(map)
    }
  }, [pickedCoords])

  useEffect(() => {
    if (!clusterGroupRef.current || !checkpoints) return

    const clusterGroup = clusterGroupRef.current
    clusterGroup.clearLayers()

    const markers = checkpoints.map((cp) => {
      const color = checkpointColor(cp)

      const icon = L.divIcon({
        html: `
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
          "></div>
        `,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = L.marker([cp.latitude, cp.longitude], { icon })
      marker.on('click', () => onCheckpointClickRef.current?.(cp))
      return marker
    })

    markers.forEach((m) => clusterGroup.addLayer(m))
  }, [checkpoints])

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
            <i className="fa-solid fa-maximize" />
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
        <MapLegend text="Tree / Green" color="bg-primary-green" />
        <MapLegend text="Shrub" color="bg-blue-500" />
        <MapLegend text="Other element" color="bg-red-500" />
        <MapLegend text="Sensor" color="bg-indigo-500" />
      </div>
    </div>
  )
}
