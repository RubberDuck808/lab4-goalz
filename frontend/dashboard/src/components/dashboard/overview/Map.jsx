import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MapLegend from './MapLegend'

export default function Map({ showExtent, setShowExtent, closeModal, elements, setSelectedElement }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  const handleMarkerClick = (element) => {
    console.log("Clicked element:", element);
    setSelectedElement(element);
  };

  useEffect(() => {
    if (!mapRef.current) return

    const center = [43.7260, -79.6099]
    const map = L.map(mapRef.current, {
      attributionControl: false,
    }).setView(center, 15)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    const lockBounds = L.latLngBounds([
      [43.7275, -79.6030],
      [43.7295, -79.6000],
    ])

    // map.locate({ setView: true, maxZoom: 18 })
    map.setMinZoom(0)

    // Move zoom control to bottom left
    map.zoomControl.setPosition('bottomleft')

    setMapInstance(map);

    return () => {
      // clearInterval(intervalId)
      // map.off('locationfound', updateLocation)
      // map.off('locationerror')
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapInstance || !elements) return;

    // Clear previous markers
    markers.forEach(marker => mapInstance.removeLayer(marker));

    const newMarkers = elements.map(element => {
      const { geom, elementType, isGreen } = element;
      const [lng, lat] = geom.coordinates;

      let fillColor = 'red';
      if (elementType === 1 || isGreen) fillColor = 'green';
      else if (elementType === 2) fillColor = 'blue';

      const marker = L.circleMarker([lng, lat], {
        color: 'white',
        weight: 2,
        fillColor,
        fillOpacity: 0.8,
        radius: 8
      }).addTo(mapInstance);

      marker.on('click', () => handleMarkerClick(element));

      return marker;
    });

    setMarkers(newMarkers);
  }, [mapInstance, elements]);

  return (
  <div className="h-full w-full overflow-hidden flex flex-col">
    <div className="h-full w-full rounded-t-lg overflow-hidden relative">
      <button 
        className='absolute top-4 left-4 w-9 h-9 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none focus:ring-2 focus:ring-[#33A661] z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer'
        onClick={() => setShowExtent(true)}
        >
        <i className="fa-solid fa-plus"></i>
      </button>
      {
        showExtent && (
          <button 
            className='absolute top-4 right-4 w-10 h-10 bg-[#33A661] text-white border-none rounded-lg shadow-md hover:bg-[#2a8c52] focus:outline-none focus:ring-2 focus:ring-[#33A661] z-10 transition-all duration-200 font-bold flex items-center justify-center text-md cursor-pointer'
            onClick={() =>  closeModal()}
          >
            <i className="fa-solid fa-maximize"></i>
          </button>
        )
      }
      <div className='absolute bottom-2 right-2 z-10 text-gray-500 text-xs flex items-center gap-1'>
        <i className="fa-regular fa-copyright"></i>
        OpenStreetMap
      </div>
      <div ref={mapRef} id="map" className="h-full w-full rounded-t-lg overflow-hidden z-0" />
    </div>
    <div className='bg-light-green p-4 w-full rounded-b-lg flex items-center gap-5'>
      <MapLegend text="Tree" color="bg-primary-green" />
      <MapLegend text="Water" color="bg-blue-500" />
      <MapLegend text="Sensor" color="bg-red-500" />
    </div>
  </div>)
  
}
