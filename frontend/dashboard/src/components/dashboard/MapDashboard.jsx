import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Map from './overview/Map';
import OverviewPanel from './overview/OverviewPanel';
import ElementsPanel from './elements/ElementsPanel';
import SensorsPanel from './sensors/SensorsPanel';
import ZonesPanel from './zones/ZonesPanel';
import Loading from '../Loading/Loading';
import { overviewService } from '../../services/overviewService';
import { getAllZones } from '../../services/zoneService';
import { getAllBoundaries } from '../../services/boundaryService';

const TAB_LABELS = {
  overview: 'Overview',
  elements: 'Elements',
  sensors:  'Sensors',
  zones:    'Zones',
};

function getLayerBg(key) {
  const lower = key.toLowerCase();
  if (lower.startsWith('sensor')) return 'bg-indigo-500';
  if (lower.startsWith('zone')) return 'bg-purple-500';
  if (lower.startsWith('tree')) return 'bg-emerald-600';
  if (lower.startsWith('shrub')) return 'bg-blue-500';
  if (lower.startsWith('grass')) return 'bg-emerald-400';
  if (lower.startsWith('mulch')) return 'bg-amber-700';
  if (lower.startsWith('garden')) return 'bg-pink-500';
  if (lower.startsWith('ground')) return 'bg-lime-500';
  if (lower.startsWith('green')) return 'bg-cyan-500';
  if (lower.startsWith('water')) return 'bg-blue-700';
  return 'bg-amber-500';
}
const INITIAL_LAYERS = new Set(['Sensors']); // Zones off by default

export default function MapDashboard({
  setSelectedItem,
  setBleSelectedSensorId,
  activeTab,
  setActiveTab,
  pendingCount,
  onPendingCountChanged,
}) {
  // ── checkpoint state ───────────────────────────────────────────────────
  const [checkpoints, setCheckpoints] = useState([]);
  const [elementTypes, setElementTypes] = useState([]);
  const hasLoadedTypesRef = useRef(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [coordPickEnabled, setCoordPickEnabled] = useState(false);
  const [pickedCoords, setPickedCoords]         = useState(null);
  const [flyTo, setFlyTo]                       = useState(null);
  const [activeElementLayers, setActiveElementLayers] = useState(new Set());
  const [activeGeneralLayers, setActiveGeneralLayers] = useState(new Set(['Elements', 'Sensors']));
  const clickHandlerRef = useRef(null);
  const mapRef = useRef(null); // imperative handle for clearDrawnPreview

  // ── zone state ─────────────────────────────────────────────────────────
  const [zones, setZones]             = useState([]);       // pure zones (no _isBoundary)
  const [boundaries, setBoundaries]   = useState([]);       // tagged with _isBoundary: true
  const [zonesLoading, setZonesLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // draw machine
  const [drawConfig, setDrawConfig]           = useState(null);   // { active, mode }
  const [pendingGeometry, setPendingGeometry] = useState(null);   // geojson after draw complete
  const [drawing, setDrawing]                 = useState(false);
  const [vertexCount, setVertexCount]         = useState(0);

  // vertex edit
  const [editVerticesConfig, setEditVerticesConfig]   = useState(null);
  const [editPendingGeometry, setEditPendingGeometry] = useState(null);
  const [editingVertices, setEditingVertices]         = useState(false);

  // generated zone previews (dashed yellow)
  const [previewZones, setPreviewZones] = useState([]);

  // ── data fetching ──────────────────────────────────────────────────────
  const fetchCheckpoints = useCallback(async () => {
    try {
      const [cps, types, pending] = await Promise.all([
        overviewService.getCheckpoints().catch(() => []),
        overviewService.getElementTypes().catch(() => []),
        overviewService.getPendingElements().catch(() => [])
      ]);
      console.log("MapDashboard: fetched checkpoints count:", cps?.length, "types count:", types?.length, "pending count:", pending?.length);
      
      const validCps = (Array.isArray(cps) ? cps : []).filter(cp => 
        cp && 
        typeof cp.latitude === 'number' && !isNaN(cp.latitude) && cp.latitude >= -90 && cp.latitude <= 90 &&
        typeof cp.longitude === 'number' && !isNaN(cp.longitude) && cp.longitude >= -180 && cp.longitude <= 180
      );

      const validPending = (Array.isArray(pending) ? pending : [])
        .filter(p =>
          p &&
          typeof p.latitude === 'number' && !isNaN(p.latitude) && p.latitude >= -90 && p.latitude <= 90 &&
          typeof p.longitude === 'number' && !isNaN(p.longitude) && p.longitude >= -180 && p.longitude <= 180
        )
        .map(p => ({
          ...p,
          isPending: true,
          type: 'element'
        }));

      const combined = [...validCps, ...validPending];
      console.log("MapDashboard: valid checkpoints count:", validCps.length, "valid pending count:", validPending.length);
      setCheckpoints(combined);
      const resolvedTypes = Array.isArray(types) ? types : [];
      setElementTypes(resolvedTypes);

      if (resolvedTypes.length > 0 && !hasLoadedTypesRef.current) {
        setActiveElementLayers(new Set(resolvedTypes.map(t => t.name ?? t.Name)));
        hasLoadedTypesRef.current = true;
      }
    } catch (err) {
      console.error("MapDashboard: Error fetching map data:", err);
      toast.error('Failed to load map data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchZones = useCallback(async () => {
    setZonesLoading(true);
    try {
      const [zoneList, boundaryList] = await Promise.all([getAllZones(), getAllBoundaries()]);
      setZones(Array.isArray(zoneList) ? zoneList : []);
      setBoundaries((Array.isArray(boundaryList) ? boundaryList : []).map(b => ({ ...b, _isBoundary: true })));
    } catch {
      /* silent — zones just won't display */
    } finally {
      setZonesLoading(false);
    }
  }, []);

  useEffect(() => { fetchCheckpoints(); }, [fetchCheckpoints]);
  useEffect(() => { fetchZones(); },      [fetchZones]);

  // ── tab change side effects ────────────────────────────────────────────
  useEffect(() => {
    // reset coord pick on tab switch
    setCoordPickEnabled(false);
    setPickedCoords(null);
    clickHandlerRef.current = null;

    // reset zone draw state on tab switch
    setDrawConfig(null);
    setPendingGeometry(null);
    setDrawing(false);
    setVertexCount(0);
    setEditVerticesConfig(null);
    setEditPendingGeometry(null);
    setEditingVertices(false);
    setSelectedZone(null);
    setPreviewZones([]);
    mapRef.current?.clearDrawnPreview();

    // auto-toggle Zones and Sensors layers based on active tab
    if (activeTab === 'elements') {
      setActiveElementLayers(prev => {
        const next = new Set(prev);
        next.delete('Zones');
        next.delete('Sensors'); // auto-turn off Sensors on elements tab
        return next;
      });
    } else {
      setActiveGeneralLayers(prev => {
        const next = new Set(prev);
        if (activeTab === 'zones') {
          next.add('Zones');
          next.delete('Sensors'); // auto-turn off Sensors on zones tab
        } else if (activeTab === 'sensors') {
          next.delete('Zones');
          next.add('Sensors');    // ensure Sensors are on for sensors tab
          next.delete('Elements'); // turn off Elements on sensors tab
        } else {
          // overview tab
          next.delete('Zones');
          next.add('Elements');
          next.add('Sensors');
        }
        return next;
      });
    }
  }, [activeTab]);

  // ── layer toggles ──────────────────────────────────────────────────────
  const toggleLayer = useCallback((layer) => {
    if (activeTab === 'elements') {
      setActiveElementLayers(prev => {
        const next = new Set(prev);
        next.has(layer) ? next.delete(layer) : next.add(layer);
        return next;
      });
    } else {
      setActiveGeneralLayers(prev => {
        const next = new Set(prev);
        next.has(layer) ? next.delete(layer) : next.add(layer);
        return next;
      });
    }
  }, [activeTab]);

  const isLayerActive = useCallback((key) => {
    if (activeTab === 'elements') {
      return activeElementLayers.has(key);
    } else {
      return activeGeneralLayers.has(key);
    }
  }, [activeTab, activeElementLayers, activeGeneralLayers]);

  const filteredCheckpoints = useMemo(() => {
    if (activeTab === 'zones') return checkpoints; // show all on zones tab
    if (activeTab === 'elements') {
      return checkpoints.filter(cp => {
        if (cp.type === 'sensor') return activeElementLayers.has('Sensors');
        const typeObj = elementTypes.find(t => (t.id ?? t.Id) === cp.elementTypeId);
        const typeName = typeObj?.name ?? typeObj?.Name ?? 'Uncategorized';
        return activeElementLayers.has(typeName);
      });
    } else {
      return checkpoints.filter(cp => {
        if (cp.type === 'sensor') return activeGeneralLayers.has('Sensors');
        return activeGeneralLayers.has('Elements');
      });
    }
  }, [checkpoints, activeElementLayers, activeGeneralLayers, activeTab, elementTypes]);

  // ── dynamically computed layers list ────────────────────────────────────
  const layerDefs = useMemo(() => {
    if (activeTab === 'elements') {
      const list = [];
      elementTypes.forEach(t => {
        const name = t.name ?? t.Name;
        list.push({ key: name, bg: getLayerBg(name) });
      });
      list.push({ key: 'Sensors', bg: 'bg-indigo-500' });
      list.push({ key: 'Zones', bg: 'bg-purple-500' });
      return list;
    } else {
      return [
        { key: 'Elements', bg: 'bg-game-green' },
        { key: 'Sensors',  bg: 'bg-indigo-500' },
        { key: 'Zones',    bg: 'bg-purple-500' },
      ];
    }
  }, [activeTab, elementTypes]);

  // ── all zones combined (for Map + ZonesPanel) ─────────────────────────
  const allZones = useMemo(() => [...boundaries, ...zones], [boundaries, zones]);

  const mapZones = useMemo(() => {
    if (selectedZone && selectedZone._isBoundary) {
      return [
        selectedZone,
        ...zones.filter(z => z.boundaryId === selectedZone.id)
      ];
    }
    if (selectedZone && !selectedZone._isBoundary) {
      const parentBoundary = boundaries.find(b => b.id === selectedZone.boundaryId);
      const siblingZones = zones.filter(z => z.boundaryId === selectedZone.boundaryId);
      return parentBoundary ? [parentBoundary, ...siblingZones] : [selectedZone];
    }
    return allZones;
  }, [allZones, selectedZone, boundaries, zones]);

  // ── checkpoint click routing ───────────────────────────────────────────
  const handleCheckpointClick = useCallback((cp) => {
    clickHandlerRef.current?.(cp);
  }, []);

  const handleCoordsPick = useCallback((c) => {
    setPickedCoords(c);
  }, []);

  const setClickHandler = useCallback((fn) => {
    clickHandlerRef.current = fn;
  }, []);

  const enableCoordPick  = useCallback(() => setCoordPickEnabled(true),  []);
  const disableCoordPick = useCallback(() => { setCoordPickEnabled(false); setPickedCoords(null); }, []);
  const clearPickedCoords = useCallback(() => setPickedCoords(null), []);

  // ── zone callbacks ─────────────────────────────────────────────────────
  const handleZoneClick = useCallback((zone) => {
    // null means background click → deselect
    setSelectedZone(zone ?? null);
    if (!zone) {
      setEditPendingGeometry(null);
      setEditingVertices(false);
      setEditVerticesConfig(null);
    }
  }, []);

  const handleDrawCreated = useCallback((geometry) => {
    setPendingGeometry(geometry);
    setDrawing(false);
    setDrawConfig(null);
  }, []);

  const handleVerticesSaved = useCallback((geom) => {
    setEditPendingGeometry(geom ?? null);
    setEditingVertices(false);
    setEditVerticesConfig(null);
  }, []);

  // ZonesPanel → MapDashboard → Map drive
  const handleStartDraw = useCallback((mode) => {
    if (mode === '__vertex_edit__') {
      // "Edit points" button — start vertex edit for selected zone
      setEditingVertices(true);
      setEditPendingGeometry(null);
      setEditVerticesConfig({ active: true, zone: selectedZone });
      return;
    }
    mapRef.current?.clearDrawnPreview();
    setPendingGeometry(null);
    setDrawing(true);
    setVertexCount(0);
    setDrawConfig({ active: true, mode });
  }, [selectedZone]);

  const handleCancelDraw = useCallback(() => {
    setDrawConfig(null);
    setDrawing(false);
    setPendingGeometry(null);
    setVertexCount(0);
    mapRef.current?.clearDrawnPreview();
  }, []);

  const handleZonesChanged = useCallback(() => {
    fetchZones();
    fetchCheckpoints();
  }, [fetchZones, fetchCheckpoints]);

  // ── shared panel props ─────────────────────────────────────────────────
  const sharedPanelProps = {
    onCheckpointsChanged: fetchCheckpoints,
    pickedCoords,
    onCoordsConsumed: clearPickedCoords,
    onEnableCoordPick: enableCoordPick,
    onDisableCoordPick: disableCoordPick,
    onFlyTo: setFlyTo,
    setClickHandler,
    onSwitchTab: setActiveTab,
    onPendingCountChanged,
    pendingCount,
  };

  const zonesPanelProps = {
    zones: allZones,
    checkpoints,
    zoneCount: allZones.length,
    selectedZone,
    onSelectZone: handleZoneClick,
    drawing,
    vertexCount,
    pendingGeometry,
    editingVertices,
    editPendingGeometry,
    onStartDraw: handleStartDraw,
    onCancelDraw: handleCancelDraw,
    onZonesChanged: handleZonesChanged,
    onGeneratedZonesChange: setPreviewZones,
    mapFlyTo: setFlyTo,
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {(isLoading || zonesLoading) && <Loading />}

      {/* Top bar */}
      <div className="bg-white border-b border-border flex flex-col md:flex-row md:items-center justify-between px-5 py-2.5 md:py-0 gap-3 min-h-[60px] md:h-[60px] shrink-0">
        <div className="ps-[50px] md:ps-0 flex flex-wrap items-center gap-4">
          <div>
            <h1 className="font-bold text-base text-text-primary leading-tight truncate">
              {TAB_LABELS[activeTab] ?? 'Map'}
            </h1>
            <p className="text-text-secondary text-[10px] hidden md:block leading-tight mt-0.5">
              Office of Sustainability · Arboretum
            </p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar py-1 md:py-0">
          {layerDefs.map(({ key, bg }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              title={`${isLayerActive(key) ? 'Hide' : 'Show'} ${key}`}
              className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isLayerActive(key)
                  ? `${bg} text-white border-transparent`
                  : 'bg-white text-text-secondary border-border'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Body: side panel + persistent map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[380px] shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden">
          {activeTab === 'overview' && <OverviewPanel {...sharedPanelProps} />}
          {activeTab === 'elements' && (
            <ElementsPanel
              {...sharedPanelProps}
              setSelectedItem={setSelectedItem}
            />
          )}
          {activeTab === 'sensors' && (
            <SensorsPanel
              {...sharedPanelProps}
              setSelectedItem={setSelectedItem}
              setBleSelectedSensorId={setBleSelectedSensorId}
            />
          )}
          {activeTab === 'zones' && <ZonesPanel {...zonesPanelProps} />}
        </div>

        {/* Persistent map — never remounts */}
        <div className="flex-1 overflow-hidden">
          <Map
            ref={mapRef}
            checkpoints={filteredCheckpoints}
            elementTypes={elementTypes}
            showDetailedElements={activeTab === 'elements'}
            onCheckpointClick={handleCheckpointClick}
            onCoordsPick={coordPickEnabled ? handleCoordsPick : null}
            pickedCoords={pickedCoords}
            closeModal={disableCoordPick}
            flyTo={flyTo}
            zones={mapZones}
            showZones={isLayerActive('Zones') || !!selectedZone}
            selectedZone={selectedZone}
            onZoneClick={handleZoneClick}
            drawConfig={drawConfig}
            onDrawCreated={handleDrawCreated}
            onVertexCountChange={setVertexCount}
            editVerticesConfig={editVerticesConfig}
            onVerticesSaved={handleVerticesSaved}
            previewZones={previewZones}
          />
        </div>
      </div>
    </div>
  );
}
