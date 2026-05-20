import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useOverviewData } from '../../../hooks/useOverviewData';
import ManageElement from './ManageElement';
import ElementDetails from './ElementDetails';
import { getSensorAlertState } from '../../../utils/sensorAlerts';
import Chart from './Chart';

const TREE_TYPE_ID = 1;

function HealthSummary({ greenPercent, alertSensorCount, pendingCount }) {
  const hasAlert = greenPercent < 70 || alertSensorCount > 0 || pendingCount > 0;
  const lines = [];
  lines.push(
    greenPercent >= 70
      ? `Green cover is at ${greenPercent}% — on target.`
      : `Green cover is ${greenPercent}% — below the 70% target.`
  );
  if (alertSensorCount > 0)
    lines.push(`${alertSensorCount} sensor${alertSensorCount !== 1 ? 's' : ''} need attention.`);
  else
    lines.push('All sensors are within normal range.');
  if (pendingCount > 0)
    lines.push(`${pendingCount} element submission${pendingCount !== 1 ? 's' : ''} await review.`);

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1.5 ${
      hasAlert ? 'bg-game-amber-soft border-game-amber/30' : 'bg-[#d1fae5] border-green-200'
    }`}>
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${hasAlert ? 'fa-triangle-exclamation text-[#CC8B00]' : 'fa-circle-check text-game-green'} text-sm`} />
        <p className={`text-xs font-bold uppercase tracking-wide ${hasAlert ? 'text-[#CC8B00]' : 'text-game-green'}`}>
          System Health
        </p>
      </div>
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-text-primary">{line}</p>
      ))}
    </div>
  );
}

const soilStatus = (pct) => {
  if (pct == null) return null;
  if (pct < 25) return { label: 'Dry', text: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
  if (pct < 60) return { label: 'Optimal', text: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  if (pct < 80) return { label: 'Moist', text: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
  return { label: 'Saturated', text: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
};

export default function OverviewPanel({
  onCheckpointsChanged,
  pickedCoords,
  onCoordsConsumed,
  onEnableCoordPick,
  onDisableCoordPick,
  setClickHandler,
  onSwitchTab,
  pendingCount = 0,
}) {
  const [view, setView] = useState('stats');
  const [subTab, setSubTab] = useState('status'); // 'status' | 'analytics'
  const [selectedElement, setSelectedElement] = useState(null);

  const { data, loading, error } = useOverviewData();
  const elements = data?.element ?? [];
  const sensors = data?.sensors ?? [];

  // Register map click handler — always reads fresh state via ref
  const internalClickRef = useRef();
  internalClickRef.current = (cp) => {
    if (cp.type === 'element') {
      const el = elements.find(e => e.id === cp.referenceId);
      if (el) {
        setSelectedElement(el);
        setView('detail');
      }
    }
  };
  useEffect(() => {
    setClickHandler((cp) => internalClickRef.current(cp));
    return () => setClickHandler(null);
  }, [setClickHandler]);

  // Enable/disable coord pick based on view
  useEffect(() => {
    if (view === 'add') onEnableCoordPick();
    else onDisableCoordPick();
  }, [view]);

  const handleOpenAdd = () => setView('add');
  const handleBack = () => {
    setView('stats');
    setSelectedElement(null);
    onDisableCoordPick();
  };

  const greenPercent = elements.length
    ? Math.round((elements.filter(e => e.isGreen).length / elements.length) * 100)
    : 0;

  const alertSensorCount = sensors.filter(s => getSensorAlertState(s) !== null).length;

  const top3Sensors = useMemo(() => [...sensors]
    .sort((a, b) => {
      if (!a.lastReading && !b.lastReading) return 0;
      if (!a.lastReading) return 1;
      if (!b.lastReading) return -1;
      return new Date(b.lastReading) - new Date(a.lastReading);
    })
    .slice(0, 3),
  [sensors]);

  const greenChartData = useMemo(() => {
    const green = elements.filter((e) => e.isGreen).length;
    return [
      { name: "Green", value: green },
      { name: "Non-Green", value: elements.length - green },
    ];
  }, [elements]);

  const elementTypesData = useMemo(() => {
    const counts = {};
    elements.forEach((e) => {
      const label = e.elementType?.name ?? `Type ${e.elementTypeId}`;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [elements]);

  const sensorChartData = useMemo(
    () => sensors.map((s) => ({ name: `S${s.id}`, temp: s.temp, humidity: s.humidity, light: s.light })),
    [sensors]
  );

  const sensorBars = useMemo(() => [
    { dataKey: "temp",     color: "#ef4444", name: "Temp °C"    },
    { dataKey: "humidity", color: "#3b82f6", name: "Humidity %" },
    { dataKey: "light",    color: "#f59e0b", name: "Light lux"  },
  ], []);

  const canopyData = useMemo(() => {
    const trees = elements.filter((e) => e.elementType?.id === TREE_TYPE_ID).length;
    return [
      { name: "Canopy", value: trees },
      { name: "Non-Canopy", value: elements.length - trees },
    ];
  }, [elements]);

  const canopyPercent = elements.length
    ? Math.round((elements.filter((e) => e.elementType?.id === TREE_TYPE_ID).length / elements.length) * 100)
    : 0;

  if (view === 'add') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border bg-white shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary font-medium"
          >
            <i className="fa-solid fa-arrow-left text-xs" /> Back
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ManageElement
            coordsPick={pickedCoords}
            onCoordsConsumed={onCoordsConsumed}
            onSaved={() => { handleBack(); onCheckpointsChanged(); }}
            onCancel={handleBack}
          />
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedElement) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border bg-white shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary font-medium"
          >
            <i className="fa-solid fa-arrow-left text-xs" /> Back
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ElementDetails
            element={selectedElement}
            onElementSaved={() => { handleBack(); onCheckpointsChanged(); }}
            onElementDeleted={() => { handleBack(); onCheckpointsChanged(); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto gap-4 p-4 pb-8">
      {/* Sub-tab navigation */}
      <div className="flex bg-[#f1f5f9] border border-border p-1 rounded-xl shrink-0">
        <button
          onClick={() => setSubTab('status')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
            subTab === 'status'
              ? 'bg-white text-text-primary shadow-sm border border-border/10'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setSubTab('analytics')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
            subTab === 'analytics'
              ? 'bg-white text-text-primary shadow-sm border border-border/10'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Analytics
        </button>
      </div>

      {subTab === 'status' ? (
        <>
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0">
                <i className="fa-solid fa-leaf text-game-blue text-sm" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide">Elements</p>
                <p className="text-xl font-bold text-text-primary">{elements.length}</p>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-game-amber-soft flex items-center justify-center shrink-0">
                <i className="fa-solid fa-clock text-[#CC8B00] text-sm" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide">Pending</p>
                <p className={`text-xl font-bold ${pendingCount > 0 ? 'text-[#CC8B00]' : 'text-text-primary'}`}>
                  {pendingCount}
                </p>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d1fae5] flex items-center justify-center shrink-0">
                <i className="fa-solid fa-seedling text-game-green text-sm" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide">Green</p>
                <p className="text-xl font-bold text-text-primary">{greenPercent}%</p>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0">
                <i className="fa-solid fa-wifi text-game-blue text-sm" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wide">Sensors</p>
                <p className="text-xl font-bold text-text-primary">{sensors.length}</p>
              </div>
            </div>
          </div>

          {/* Add Element */}
          <button
            onClick={handleOpenAdd}
            className="w-full bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <i className="fa-solid fa-plus" /> Add Element
          </button>

          {/* Pending CTA */}
          {pendingCount > 0 && (
            <button
              onClick={() => onSwitchTab?.('elements')}
              className="w-full flex items-center justify-between px-4 py-3 bg-game-amber-soft border border-game-amber/40 rounded-xl text-sm font-semibold text-[#CC8B00] hover:bg-game-amber/20 transition"
            >
              <span>
                <i className="fa-solid fa-inbox mr-2" />
                Review {pendingCount} submission{pendingCount !== 1 ? 's' : ''}
              </span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          )}

          {/* Health summary */}
          {!loading && !error && (
            <HealthSummary
              greenPercent={greenPercent}
              alertSensorCount={alertSensorCount}
              pendingCount={pendingCount}
            />
          )}

          {loading && (
            <p className="text-center text-text-secondary text-sm py-4">Loading data…</p>
          )}
          {error && (
            <p className="text-center text-game-red text-sm py-4">Failed to load data.</p>
          )}

          {/* Top-3 sensor list */}
          {!loading && !error && sensors.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                  Sensors · latest readings
                </h2>
                {sensors.length > 3 && (
                  <button
                    onClick={() => onSwitchTab?.('sensors')}
                    className="text-xs text-game-blue font-semibold hover:underline"
                  >
                    View all →
                  </button>
                )}
              </div>

              {top3Sensors.map(sensor => {
                const alertState = getSensorAlertState(sensor);
                const soil = soilStatus(sensor.soilMoisture);
                const hasReading = sensor.temp != null || sensor.humidity != null;
                return (
                  <div
                    key={sensor.id}
                    className={`rounded-xl border p-4 flex flex-col gap-3 ${
                      alertState ? 'bg-white animate-border-breathe' : 'bg-white border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-game-blue-soft flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-wifi text-game-blue text-sm" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-text-primary">{sensor.sensorName}</p>
                          <p className="text-xs text-text-secondary">ID #{sensor.id}</p>
                        </div>
                      </div>
                      {sensor.lastReading ? (
                        <span className="text-xs text-text-secondary">
                          {new Date(sensor.lastReading).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-xs text-text-secondary italic">No data</span>
                      )}
                    </div>

                    {hasReading ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                          <p className="text-xs text-text-secondary">Temp</p>
                          <p className="font-bold text-game-red text-sm">{sensor.temp != null ? `${Number(sensor.temp).toFixed(1)} °C` : '—'}</p>
                        </div>
                        <div className="bg-game-blue-soft border border-game-blue/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-text-secondary">Humidity</p>
                          <p className="font-bold text-game-blue text-sm">{sensor.humidity != null ? `${Math.round(sensor.humidity)} %` : '—'}</p>
                        </div>
                        <div className="bg-game-amber-soft border border-game-amber/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-text-secondary">Light</p>
                          <p className="font-bold text-[#CC8B00] text-sm">{sensor.light != null ? `${Math.round(sensor.light)} lux` : '—'}</p>
                        </div>
                        <div className={`border rounded-lg p-3 text-center ${soil ? soil.bg : 'bg-[#d1fae5] border-green-200'}`}>
                          <p className="text-xs text-text-secondary">Soil</p>
                          <p className={`font-bold text-sm ${soil ? soil.text : 'text-game-green'}`}>
                            {sensor.soilMoisture != null ? `${Math.round(sensor.soilMoisture)} %` : '—'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary italic text-center py-1">Awaiting first reading</p>
                    )}

                    {alertState && (
                      <p className="text-xs text-[#CC8B00] font-medium">
                        <i className="fa-solid fa-triangle-exclamation mr-1" />
                        {alertState.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full h-[260px]">
            <Chart
              color="border-game-green"
              type="pie"
              title="Green vs Non-Green"
              value={`${greenPercent}% Green`}
              data={greenChartData}
            />
          </div>

          <div className="w-full h-[260px]">
            <Chart
              color="border-game-blue"
              type="bar"
              title="Element Types"
              value={`${elements.length} Elements`}
              data={elementTypesData}
              bars={[{ dataKey: "value", color: "#3b82f6", name: "Count" }]}
            />
          </div>

          <div className="w-full h-[260px]">
            <Chart
              color="border-game-amber"
              type="bar"
              title="Sensor Readings"
              value={`${sensors.length} Sensors`}
              data={sensorChartData}
              bars={sensorBars}
            />
          </div>

          <div className="w-full h-[260px]">
            <Chart
              color="border-game-red"
              type="pie"
              title="Canopy Coverage"
              value={`${canopyPercent}% Canopy`}
              data={canopyData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
