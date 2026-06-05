import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';
import { overviewService } from '../../../services/overviewService';
import { getSensorAlertState } from '../../../utils/sensorAlerts';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const defaultAddForm = { sensorName: '', latitude: '', longitude: '' };

export default function SensorsPanel({
  onCheckpointsChanged,
  pickedCoords,
  onCoordsConsumed,
  onEnableCoordPick,
  onDisableCoordPick,
  setClickHandler,
  setSelectedItem,
  setBleSelectedSensorId,
  onFlyTo,
}) {
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Sensor data history graph states
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState({
    temp: true,
    humidity: true,
    light: false,
    soilMoisture: false,
    wind: false,
  });
  // Smooth scroll active sensor card into view
  useEffect(() => {
    if (selectedSensorId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`sensor-card-${selectedSensorId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedSensorId]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const overviewData = await overviewService.getAllElements();
      setSensors(overviewData?.sensors ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll the sensor list status every 3 seconds to keep telemetry values on the cards fresh
    const interval = setInterval(() => {
      overviewService.getAllElements()
        .then(data => {
          setSensors(data?.sensors ?? []);
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch historical readings when selectedSensorId changes, with live polling every 3 seconds
  useEffect(() => {
    if (!selectedSensorId) {
      setSensorHistory([]);
      return;
    }

    let isSubscribed = true;

    const loadHistory = (showSpinner) => {
      if (showSpinner) setHistoryLoading(true);
      overviewService.getSensorHistory(selectedSensorId)
        .then(data => {
          if (!isSubscribed) return;
          const sorted = (data ?? []).map(item => {
            const rawTemp = item.Temp ?? item.temp;
            const rawHumidity = item.Humidity ?? item.humidity;
            const rawLight = item.Light ?? item.light;
            const rawSoilMoisture = item.SoilMoisture ?? item.soilMoisture;
            const rawWind = item.Wind ?? item.wind;
            const rawTimestamp = item.Timestamp ?? item.timestamp;

            let formattedTime = "";
            let timestampDate = null;
            if (rawTimestamp) {
              const isoStr = String(rawTimestamp).replace(" ", "T");
              timestampDate = new Date(isoStr);
              if (!isNaN(timestampDate.getTime())) {
                formattedTime = timestampDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
              }
            }

            return {
              ...item,
              timestampDate,
              formattedTime,
              temp: rawTemp != null ? parseFloat(Number(rawTemp).toFixed(2)) : 0,
              humidity: rawHumidity != null ? parseFloat(Number(rawHumidity).toFixed(2)) : 0,
              light: rawLight != null ? parseFloat(Number(rawLight).toFixed(2)) : 0,
              soilMoisture: rawSoilMoisture != null ? parseFloat(Number(rawSoilMoisture).toFixed(2)) : 0,
              wind: rawWind != null ? parseFloat(Number(rawWind).toFixed(2)) : 0
            };
          }).sort((a, b) => {
            if (!a.timestampDate) return 1;
            if (!b.timestampDate) return -1;
            return a.timestampDate - b.timestampDate;
          });
          setSensorHistory(sorted);
        })
        .catch((err) => {
          if (!isSubscribed) return;
          console.error("Error loading historical sensor data:", err);
          if (showSpinner) toast.error("Failed to load sensor history graph.");
          setSensorHistory([]);
        })
        .finally(() => {
          if (isSubscribed && showSpinner) setHistoryLoading(false);
        });
    };

    // Initial load with spinner
    loadHistory(true);

    // Poll every 3 seconds without spinner to avoid UI flicker
    const interval = setInterval(() => {
      loadHistory(false);
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [selectedSensorId]);

  // Sync coord pick mode
  const mapPickActive = showAddPanel || !!editingId;
  useEffect(() => {
    if (mapPickActive) onEnableCoordPick();
    else onDisableCoordPick();
  }, [mapPickActive]);

  // Panel exclusivity
  useEffect(() => { if (showAddPanel) { setEditingId(null); setEditForm({}); } }, [showAddPanel]);
  useEffect(() => { if (editingId) setShowAddPanel(false); }, [editingId]);

  // Consume picked coords from MapDashboard
  useEffect(() => {
    if (!pickedCoords) return;
    if (showAddPanel) {
      setAddForm(f => ({ ...f, latitude: pickedCoords.lat.toFixed(6), longitude: pickedCoords.lng.toFixed(6) }));
      onCoordsConsumed();
    } else if (editingId) {
      setEditForm(f => ({ ...f, editLatitude: pickedCoords.lat.toFixed(6), editLongitude: pickedCoords.lng.toFixed(6) }));
      onCoordsConsumed();
    }
  }, [pickedCoords]);

  // Register map click handler (always fresh via ref)
  const clickRef = useRef();
  clickRef.current = (cp) => {
    if (cp.type === 'sensor') {
      const sensor = sensors.find(s => s.id === cp.referenceId);
      if (sensor) {
        setSelectedSensorId(selectedSensorId === sensor.id ? null : sensor.id);
      }
    }
  };
  useEffect(() => {
    setClickHandler((cp) => clickRef.current(cp));
    return () => setClickHandler(null);
  }, [setClickHandler]);

  const startEdit = (sensor) => {
    const coords = sensor.geo?.coordinates ?? [0, 0];
    setEditingId(sensor.id);
    setEditForm({
      sensorName: sensor.sensorName,
      editLongitude: String(coords[0] ?? ''),
      editLatitude: String(coords[1] ?? ''),
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleAddSensor = async () => {
    setAddLoading(true);
    try {
      await overviewService.createSensor({
        sensorName: addForm.sensorName,
        longitude: parseFloat(addForm.longitude),
        latitude: parseFloat(addForm.latitude),
      });
      setAddForm(defaultAddForm);
      setShowAddPanel(false);
      await fetchData(); onCheckpointsChanged();
      toast.success('Sensor created successfully!');
    } catch (e) { toast.error(e.message || 'Failed to create sensor.'); }
    finally { setAddLoading(false); }
  };

  const handleSaveEdit = async (id) => {
    setSavingId(id);
    try {
      await overviewService.updateSensor(id, {
        sensorName: editForm.sensorName,
        longitude: parseFloat(editForm.editLongitude),
        latitude: parseFloat(editForm.editLatitude),
      });
      setEditingId(null);
      await fetchData(); onCheckpointsChanged();
      toast.success('Sensor updated successfully!');
    } catch (e) { toast.error(e.message || 'Failed to update sensor.'); }
    finally { setSavingId(null); }
  };

  const handleDelete = async (sensor) => {
    if (!window.confirm(`Delete sensor "${sensor.sensorName}"?`)) return;
    setDeletingId(sensor.id);
    try {
      await overviewService.deleteSensor(sensor.id);
      if (editingId === sensor.id) cancelEdit();
      await fetchData(); onCheckpointsChanged();
      toast.success('Sensor deleted.');
    } catch (e) { toast.error(e.message || 'Failed to delete sensor.'); }
    finally { setDeletingId(null); }
  };

  // Sort and filter sensors: bubble editing sensor to the top
  const sortedAndFilteredSensors = [...sensors]
    .sort((a, b) => {
      const aEditing = a.id === editingId;
      const bEditing = b.id === editingId;
      if (aEditing && !bEditing) return -1;
      if (!aEditing && bEditing) return 1;
      return 0;
    })
    .filter(sensor => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        sensor.sensorName.toLowerCase().includes(query) ||
        String(sensor.id).includes(query)
      );
    });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {isLoading && <Loading />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
        <div>
          <h2 className="text-sm font-bold text-text-primary">All Sensors</h2>
          <p className="text-xs text-text-secondary">{sensors.length} sensor{sensors.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowAddPanel(v => !v)}
          className="bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-90 transition"
        >
          <i className="fa-solid fa-plus" /> Add Sensor
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 border-b border-border bg-white shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search sensor by name or ID..."
            className="w-full h-9 pl-9 pr-8 border border-border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-game-blue/20 transition-all font-sans"
          />
          <i className="fa-solid fa-magnifying-glass text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Add form */}
      {showAddPanel && (
        <div className="m-4 bg-white rounded-xl border border-border overflow-hidden shrink-0">
          <div className="w-full h-10 bg-game-green flex items-center px-4">
            <i className="fa-solid fa-plus text-white mr-2 text-xs" />
            <p className="text-white text-xs font-bold">New Sensor</p>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">Sensor name</p>
              <input
                type="text"
                value={addForm.sensorName}
                onChange={e => setAddForm(f => ({ ...f, sensorName: e.target.value }))}
                placeholder="e.g. Sensor A1"
                className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-1">Latitude</p>
                <input type="text" value={addForm.latitude} onChange={e => setAddForm(f => ({ ...f, latitude: e.target.value }))} className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-1">Longitude</p>
                <input type="text" value={addForm.longitude} onChange={e => setAddForm(f => ({ ...f, longitude: e.target.value }))} className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
              </div>
            </div>
            <p className="text-xs text-text-secondary italic text-center">Click on the map to fill coordinates.</p>
            <div className="flex gap-2">
              <button onClick={handleAddSensor} disabled={addLoading} className="bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold px-3 py-2 rounded-xl flex-1 disabled:opacity-50">
                {addLoading ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setShowAddPanel(false); setAddForm(defaultAddForm); }} className="bg-surface border border-border text-text-primary text-sm font-bold px-3 py-2 rounded-xl flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sensor List (Scrollable & Virtualized) */}
      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto relative pb-8"
        style={{ minHeight: '300px' }}
      >
        {!isLoading && sortedAndFilteredSensors.length === 0 ? (
          <div className="mx-4 mt-3 bg-white rounded-xl border border-border p-6 text-center text-sm text-text-secondary">
            {searchQuery ? "No matching sensors found." : "No sensors found. Add one to get started."}
          </div>
        ) : (() => {
          const { visible, totalHeight } = getVisibleItems(sortedAndFilteredSensors, scrollTop, editingId, selectedSensorId);
          return (
            <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
              {visible.map(({ item: sensor, top, height }) => {
                const coords = sensor.geo?.coordinates ?? [];
                const isEditing = editingId === sensor.id;
                const alertState = getSensorAlertState(sensor);

                return (
                  <div
                    key={sensor.id}
                    id={`sensor-card-${sensor.id}`}
                    onClick={() => {
                      if (!isEditing && coords[1] != null && coords[0] != null) {
                        onFlyTo?.({ lat: coords[1], lng: coords[0] });
                        setSelectedSensorId(selectedSensorId === sensor.id ? null : sensor.id);
                      }
                    }}
                    style={{ position: 'absolute', top: `${top}px`, left: '16px', right: '16px', height: `${height}px` }}
                    className={`rounded-xl border p-4 flex flex-col gap-3 transition-all overflow-hidden ${
                      isEditing
                        ? 'bg-white border-game-blue ring-1 ring-game-blue/30'
                        : selectedSensorId === sensor.id
                          ? 'bg-blue-50/25 border-game-blue ring-2 ring-game-blue/20 shadow-md cursor-pointer'
                          : alertState
                            ? 'bg-white animate-border-breathe cursor-pointer hover:shadow-md hover:border-game-blue/40'
                            : 'bg-white border-border cursor-pointer hover:shadow-md hover:border-game-blue/40'
                    }`}
                  >
                    {/* Name row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-wifi text-game-blue text-sm" />
                        </div>
                        {isEditing ? (
                          <input value={editForm.sensorName} onChange={e => setEditForm(f => ({ ...f, sensorName: e.target.value }))} className="border border-border rounded-lg px-2 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
                        ) : (
                          <div>
                            <p className="font-bold text-sm text-text-primary truncate max-w-[120px]">{sensor.sensorName}</p>
                            <p className="text-xs text-text-secondary">ID #{sensor.id}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(sensor.id)} disabled={savingId === sensor.id} className="bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                              {savingId === sensor.id ? '…' : 'Save'}
                            </button>
                            <button onClick={cancelEdit} className="bg-surface border border-border text-text-primary text-xs font-bold px-2.5 py-1.5 rounded-lg">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setBleSelectedSensorId?.(sensor.id); setSelectedItem?.('Sensor Monitor'); }}
                              title="Open in BLE Scanner"
                              className="bg-game-blue-soft text-game-blue text-xs font-bold px-2.5 py-1.5 rounded-lg hover:opacity-80 transition"
                            >
                              <i className="fa-brands fa-bluetooth" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSensorId(selectedSensorId === sensor.id ? null : sensor.id);
                              }}
                              title="View Historical Graph"
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition ${
                                selectedSensorId === sensor.id
                                  ? "bg-game-blue text-white"
                                  : "bg-game-blue-soft text-game-blue hover:opacity-80"
                              }`}
                            >
                              <i className="fa-solid fa-chart-line" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); startEdit(sensor); }} className="bg-game-blue border-b-[3px] border-game-blue-border text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:opacity-90">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(sensor); }} disabled={deletingId === sensor.id} className="bg-game-red border-b-[3px] border-game-red-dark text-white text-xs font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                              {deletingId === sensor.id ? '…' : 'Del'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary">Latitude</p>
                        {isEditing ? (
                          <input value={editForm.editLatitude} onChange={e => setEditForm(f => ({ ...f, editLatitude: e.target.value }))} className="w-full border border-border rounded-lg px-2 py-1 text-xs mt-0.5 focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
                        ) : (
                          <p className="text-xs text-text-primary">{coords[1] ?? 'N/A'}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary">Longitude</p>
                        {isEditing ? (
                          <input value={editForm.editLongitude} onChange={e => setEditForm(f => ({ ...f, editLongitude: e.target.value }))} className="w-full border border-border rounded-lg px-2 py-1 text-xs mt-0.5 focus:outline-none focus:ring-2 focus:ring-game-blue/30" />
                        ) : (
                          <p className="text-xs text-text-primary">{coords[0] ?? 'N/A'}</p>
                        )}
                      </div>
                    </div>
                    {isEditing && <p className="text-xs text-game-blue italic text-center">Click on the map to update coordinates.</p>}

                    {/* Readings */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-text-secondary">Temp</p>
                        <p className="font-bold text-game-red text-xs">{sensor.temp != null ? `${Number(sensor.temp).toFixed(1)}°` : 'N/A'}</p>
                      </div>
                      <div className="bg-game-blue-soft border border-game-blue/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-text-secondary">Hum</p>
                        <p className="font-bold text-game-blue text-xs">{sensor.humidity != null ? `${Math.round(sensor.humidity)}%` : 'N/A'}</p>
                      </div>
                      <div className="bg-game-amber-soft border border-game-amber/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-text-secondary">Light</p>
                        <p className="font-bold text-[#CC8B00] text-xs">{sensor.light != null ? `${Math.round(sensor.light)}lx` : 'N/A'}</p>
                      </div>
                      <div className="bg-[#d1fae5] border border-green-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-text-secondary">Soil</p>
                        <p className="font-bold text-game-green text-xs">{sensor.soilMoisture != null ? `${Math.round(sensor.soilMoisture)}%` : 'N/A'}</p>
                      </div>
                    </div>

                    {selectedSensorId === sensor.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 font-sans">
                            <i className="fa-solid fa-chart-line text-game-blue" />
                            Historical Readings (ID #{sensor.id})
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSensorId(null);
                            }}
                            className="text-[10px] text-game-blue hover:underline font-bold cursor-pointer"
                          >
                            Close Graph
                          </button>
                        </div>

                        {historyLoading ? (
                          <div className="h-44 flex items-center justify-center text-xs font-bold text-gray-400">
                            <i className="fa-solid fa-circle-notch fa-spin mr-1.5" /> Loading historical data...
                          </div>
                        ) : sensorHistory.length === 0 ? (
                          <div className="h-28 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                            No telemetry recorded yet for this sensor.
                          </div>
                        ) : (
                          <div className="w-full flex flex-col gap-3">
                            {/* Toggleable metrics */}
                            <div className="flex flex-wrap gap-1.5">
                              {["temp", "humidity", "light", "soilMoisture", "wind"].map(metric => {
                                const labelMap = {
                                  temp: "Temp (°C)",
                                  humidity: "Hum (%)",
                                  light: "Light (lux)",
                                  soilMoisture: "Soil (%)",
                                  wind: "Wind (m/s)"
                                };
                                const activeColorMap = {
                                  temp: "bg-game-red text-white border-game-red",
                                  humidity: "bg-game-blue text-white border-game-blue",
                                  light: "bg-[#CC8B00] text-white border-[#CC8B00]",
                                  soilMoisture: "bg-game-green text-white border-game-green",
                                  wind: "bg-purple-500 text-white border-purple-500"
                                };
                                const active = activeMetrics[metric];
                                return (
                                  <button
                                    key={metric}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMetrics(m => ({ ...m, [metric]: !m[metric] }));
                                    }}
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition ${
                                      active ? activeColorMap[metric] : `border-gray-200 text-gray-500 hover:bg-gray-50`
                                    }`}
                                  >
                                    {labelMap[metric]}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Chart container */}
                            <div className="h-48 w-full pr-2 mt-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <XAxis dataKey="formattedTime" tick={{ fontSize: 7, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                  <Tooltip
                                    contentStyle={{
                                      background: "rgba(255, 255, 255, 0.98)",
                                      backdropFilter: "blur(4px)",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "10px",
                                      fontSize: "9px",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                    }}
                                  />
                                  {activeMetrics.temp && <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
                                  {activeMetrics.humidity && <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
                                  {activeMetrics.light && <Line type="monotone" dataKey="light" name="Light (lux)" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
                                  {activeMetrics.soilMoisture && <Line type="monotone" dataKey="soilMoisture" name="Soil (%)" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
                                  {activeMetrics.wind && <Line type="monotone" dataKey="wind" name="Wind (m/s)" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isEditing && alertState && (
                      <p className="text-xs text-[#CC8B00] font-medium">
                        <i className="fa-solid fa-triangle-exclamation mr-1" />
                        {alertState.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Helpers for virtualization
const gap = 12;
const viewportHeight = 600;

function getVisibleItems(items, scrollTop, editingId, selectedSensorId) {
  let currentTop = 12; // Start padding
  const itemHeights = items.map(sensor => {
    if (sensor.id === editingId) return 210;
    if (sensor.id === selectedSensorId) return 460;
    return 165;
  });

  const positions = [];
  for (let i = 0; i < items.length; i++) {
    positions.push(currentTop);
    currentTop += itemHeights[i] + gap;
  }

  const totalHeight = currentTop;

  let startIndex = 0;
  while (startIndex < items.length - 1 && positions[startIndex] + itemHeights[startIndex] < scrollTop - 200) {
    startIndex++;
  }

  let endIndex = startIndex;
  while (endIndex < items.length - 1 && positions[endIndex] < scrollTop + viewportHeight + 200) {
    endIndex++;
  }

  const visible = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visible.push({
        item: items[i],
        index: i,
        top: positions[i],
        height: itemHeights[i]
      });
    }
  }

  return { visible, totalHeight };
}
