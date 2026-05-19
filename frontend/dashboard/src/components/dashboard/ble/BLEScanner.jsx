import { useState, useEffect, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardNavBar from "../DashboardNavBar";
import { APICall } from "../../../hooks/useAPI";
import { overviewService } from "../../../services/overviewService";
import LineChart from "../overview/charts/LineChart";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const MAX_HISTORY  = 60;
const DRY_VALUE    = 3500;
const WET_VALUE    = 1200;

function calcSoilMoisture(raw) {
  if (raw == null) return null;
  const pct = Math.round((raw - DRY_VALUE) * 100 / (WET_VALUE - DRY_VALUE));
  return Math.max(0, Math.min(100, pct));
}

const LINE_CONFIG = [
  { dataKey: "temp",         color: "#ef4444", name: "Temp °C"        },
  { dataKey: "humidity",     color: "#3b82f6", name: "Humidity %"      },
  { dataKey: "light",        color: "#f59e0b", name: "Light lux"       },
  { dataKey: "soilMoisture", color: "#22c55e", name: "Soil Moisture %" },
];

const CHART_REFS = [
  { y: 25, label: "Dry threshold",  color: "#f97316" },
  { y: 70, label: "Wet threshold",  color: "#6366f1" },
];

function soilStatus(pct) {
  if (pct == null) return null;
  if (pct < 25)  return { label: "Dry",       color: "orange", icon: "fa-sun",       bg: "bg-orange-50 border-orange-200", text: "text-orange-600" };
  if (pct < 60)  return { label: "Optimal",   color: "green",  icon: "fa-seedling",  bg: "bg-green-50 border-green-200",   text: "text-green-600"  };
  if (pct < 80)  return { label: "Moist",     color: "blue",   icon: "fa-droplet",   bg: "bg-blue-50 border-blue-200",     text: "text-blue-600"   };
  return           { label: "Saturated", color: "purple", icon: "fa-water",     bg: "bg-purple-50 border-purple-200", text: "text-purple-600" };
}

function tempStatus(c) {
  if (c == null) return null;
  if (c < 10)  return { label: "Cold",    bg: "bg-blue-50 border-blue-200",   text: "text-blue-600"   };
  if (c < 28)  return { label: "Optimal", bg: "bg-green-50 border-green-200", text: "text-green-600"  };
  return         { label: "Hot",     bg: "bg-red-50 border-red-200",     text: "text-red-600"    };
}

export default function BLEScanner({ bleSelectedSensorId, setBleSelectedSensorId }) {
  const [status, setStatus]           = useState("idle");
  const [deviceName, setDeviceName]   = useState("");
  const [readings, setReadings]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [highlight, setHighlight]     = useState(false);
  const [sensorId, setSensorId]       = useState("");
  const [saving, setSaving]           = useState(false);
  const [sensors, setSensors]         = useState([]);
  const [autoSave, setAutoSave]       = useState(false);
  const [saveCount, setSaveCount]     = useState(0);
  const [readingHistory, setReadingHistory] = useState([]);
  const [visibleLines, setVisibleLines]     = useState({
    temp: true, humidity: true, light: true, soilMoisture: true,
  });

  const bleSupported   = !!navigator.bluetooth;
  const deviceRef      = useRef(null);
  const charRef        = useRef(null);
  const highlightTimer = useRef(null);
  const autoSaveRef    = useRef(false);
  const sensorIdRef    = useRef("");

  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);
  useEffect(() => { sensorIdRef.current = sensorId; }, [sensorId]);

  useEffect(() => {
    overviewService.getAllElements().then((data) => {
      setSensors(data?.sensors ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (bleSelectedSensorId != null) {
      setSensorId(String(bleSelectedSensorId));
      setBleSelectedSensorId(null);
    }
  }, [bleSelectedSensorId, setBleSelectedSensorId]);

  useEffect(() => {
    return () => {
      clearTimeout(highlightTimer.current);
      deviceRef.current?.gatt?.disconnect();
    };
  }, []);

  const handleSaveReading = useCallback(async (currentReadings, currentSensorId) => {
    if (!currentReadings || !currentSensorId) return;
    try {
      const res = await APICall(
        "POST",
        "/sensors/data",
        JSON.stringify({
          sensorId:     parseInt(currentSensorId, 10),
          temperature:  currentReadings.temp,
          humidity:     currentReadings.humidity,
          light:        0,
          soilMoisture: currentReadings.soilMoisture,
          rawMoisture:  currentReadings.rawMoisture,
        }),
        localStorage.getItem("token") ?? ""
      );
      if (!res?.ok) throw new Error("Save failed");
      setSaveCount((c) => c + 1);
    } catch {
      // silent in auto-save mode
    }
  }, []);

  const handleValueChange = useCallback((e) => {
    try {
      const json = new TextDecoder().decode(e.target.value);
      const data = JSON.parse(json);
      if (data.t === undefined) return;
      const soilMoisture = data.m != null ? data.m : calcSoilMoisture(data.r);
      const newReadings = { temp: data.t, humidity: data.h, soilMoisture, rawMoisture: data.r, light: data.l ?? null };
      setReadings(newReadings);
      if (data.id != null && !sensorIdRef.current) {
        const id = String(data.id);
        setSensorId(id);
        sensorIdRef.current = id;
      }
      const now = new Date();
      setLastUpdated(now);
      setHighlight(true);
      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlight(false), 700);
      setReadingHistory((prev) => [
        ...prev.slice(-(MAX_HISTORY - 1)),
        { name: now.toLocaleTimeString(), temp: data.t, humidity: data.h, light: data.l ?? null, soilMoisture },
      ]);
      if (autoSaveRef.current && sensorIdRef.current) {
        handleSaveReading(newReadings, sensorIdRef.current);
      }
    } catch {
      // ignore malformed packet
    }
  }, [handleSaveReading]);

  const connect = async () => {
    try {
      setStatus("connecting");
      const dev = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
      });
      dev.addEventListener("gattserverdisconnected", () => {
        setStatus("idle");
        setReadings(null);
        setDeviceName("");
        setAutoSave(false);
        setReadingHistory([]);
        toast.info("Sensor disconnected", { toastId: "ble-disconnect" });
      });
      const server  = await dev.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const char    = await service.getCharacteristic(CHAR_UUID);
      charRef.current = char;
      char.oncharacteristicvaluechanged = handleValueChange;
      await char.startNotifications();
      try {
        const value = await char.readValue();
        handleValueChange({ target: { value } });
      } catch {
        // no value yet
      }
      deviceRef.current = dev;
      setDeviceName(dev.name || "Goalz-Sensor");
      setStatus("connected");
      setSaveCount(0);
      toast.success(`Connected to ${dev.name || "Goalz-Sensor"}`);
    } catch (err) {
      setStatus("idle");
      if (err.name !== "NotFoundError") toast.error("Connection failed: " + err.message);
    }
  };

  const disconnect = () => {
    deviceRef.current?.gatt?.disconnect();
    setStatus("idle");
    setReadings(null);
    setDeviceName("");
    setAutoSave(false);
    setReadingHistory([]);
  };

  const handleSave = async () => {
    if (!readings || !sensorId) return;
    setSaving(true);
    try {
      await handleSaveReading(readings, sensorId);
      toast.success("Reading saved!");
    } catch (e) {
      toast.error(e.message || "Failed to save reading");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (val, decimals = 1) =>
    val != null ? Number(val).toFixed(decimals) : null;

  const selectedSensor = sensors.find((s) => String(s.id) === sensorId);
  const soil  = soilStatus(readings?.soilMoisture);
  const temp  = tempStatus(readings?.temp);
  const activeLines = LINE_CONFIG.filter((l) => visibleLines[l.dataKey]);

  return (
    <div className="flex flex-col min-h-screen h-full relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      <DashboardNavBar title="Sensor Monitor" />

      <div className="p-4 md:p-5 flex flex-col gap-5 flex-1 overflow-y-auto">

        {!bleSupported && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">Web Bluetooth not available</p>
              <p className="text-amber-700 text-sm mt-0.5">
                Open this page in <strong>Google Chrome</strong> on a laptop with Bluetooth hardware.
                Firefox and Safari do not support Web Bluetooth.
              </p>
            </div>
          </div>
        )}

        {/* Connect panel */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                status === "connected" ? "bg-green-100" : "bg-indigo-100"
              }`}>
                <i className={`fa-brands fa-bluetooth text-sm transition-colors duration-300 ${
                  status === "connected" ? "text-green-600" : "text-indigo-500"
                }`} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {status === "idle"       && "No sensor connected"}
                  {status === "connecting" && "Connecting…"}
                  {status === "connected"  && (
                    <span className="flex items-center gap-2">
                      <span>{deviceName}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Connected</span>
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {status === "idle"       && "Press Connect, then select your sensor from the browser dialog"}
                  {status === "connecting" && "Select the sensor from the browser dialog…"}
                  {status === "connected"  && "Live — receiving readings every ~1 s"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {autoSave && status === "connected" && (
                <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  Recording · {saveCount} saved
                </span>
              )}
              {status === "connected" && (
                <span className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live
                </span>
              )}
              {status !== "connected" ? (
                <button
                  onClick={connect}
                  disabled={!bleSupported || status === "connecting"}
                  className="bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition"
                >
                  {status === "connecting" ? (
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-xs" /> Connecting
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="fa-brands fa-bluetooth text-xs" /> Connect Sensor
                    </span>
                  )}
                </button>
              ) : (
                <button onClick={disconnect} className="bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Onboarding steps — only when idle */}
          {status === "idle" && (
            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: "1", icon: "fa-bluetooth", text: "Press Connect Sensor and select your device from the browser popup" },
                { step: "2", icon: "fa-chart-line", text: "Live readings will appear below. Check the chart to spot trends." },
                { step: "3", icon: "fa-floppy-disk", text: "Select a sensor and press Save Reading to log data to the database" },
              ].map(({ step, icon, text }) => (
                <div key={step} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">{step}</div>
                  <div>
                    <i className={`fa-solid ${icon} text-indigo-400 text-xs mb-1`} />
                    <p className="text-xs text-gray-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save / log panel — primary action, shown as soon as connected */}
        {status === "connected" && (
          <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-gray-800">Log Reading</h2>
                <p className="text-sm text-gray-500">Choose a sensor, then save manually or enable auto-logging.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-gray-600">Auto-log</span>
                <div
                  onClick={() => setAutoSave((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    autoSave ? "bg-red-500" : "bg-gray-300"
                  } ${!sensorId ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${autoSave ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </label>
            </div>

            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-xs text-gray-500 mb-1">Sensor</p>
                {sensors.length > 0 ? (
                  <select
                    value={sensorId}
                    onChange={(e) => { setSensorId(e.target.value); setAutoSave(false); setSaveCount(0); }}
                    className="w-full h-9 border border-gray-300 rounded px-2 text-sm bg-white"
                  >
                    <option value="">— Select a sensor —</option>
                    {sensors.map((s) => (
                      <option key={s.id} value={String(s.id)}>{s.sensorName} (#{s.id})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number" min="1" value={sensorId}
                    onChange={(e) => setSensorId(e.target.value)}
                    placeholder="Sensor ID"
                    className="w-32 h-9 border border-gray-300 rounded px-3 text-sm"
                  />
                )}
              </div>

              {autoSave ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-600 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                    Auto-logging · {saveCount} saved
                  </span>
                  <button onClick={() => setAutoSave(false)} className="bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Stop
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || !sensorId || !readings}
                  className="bg-secondary-green text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                >
                  {saving ? "Saving…" : "Save Reading"}
                </button>
              )}
            </div>

            {selectedSensor && !autoSave && (
              <p className="text-xs text-gray-400">
                Saving to: <span className="font-semibold text-gray-600">{selectedSensor.sensorName}</span>
              </p>
            )}
          </div>
        )}

        {/* Live readings */}
        {status === "connected" && (
          <div className={`bg-white rounded-lg shadow p-5 flex flex-col gap-4 transition-all duration-300 ${highlight ? "ring-2 ring-indigo-300" : ""}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Current Readings</h2>
              {lastUpdated && <span className="text-xs text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</span>}
            </div>

            {!readings ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["Temperature", "Humidity", "Light", "Soil Moisture", "Soil Health"].map((label) => (
                  <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <p className="text-xs text-gray-400">{label}</p>
                    <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <ReadingCard
                  label="Temperature"
                  value={fmt(readings.temp) != null ? `${fmt(readings.temp)} °C` : "—"}
                  icon="fa-thermometer-half"
                  colorClass="bg-red-50 border-red-200 text-red-600"
                  iconClass="text-red-400"
                  highlight={highlight}
                  badge={temp ? { label: temp.label, className: `${temp.bg} ${temp.text}` } : null}
                />
                <ReadingCard
                  label="Humidity"
                  value={fmt(readings.humidity) != null ? `${fmt(readings.humidity)} %` : "—"}
                  icon="fa-droplet"
                  colorClass="bg-blue-50 border-blue-200 text-blue-600"
                  iconClass="text-blue-400"
                  highlight={highlight}
                />
                <ReadingCard
                  label="Light"
                  value={readings.light != null ? `${readings.light} lux` : "—"}
                  icon="fa-sun"
                  colorClass="bg-yellow-50 border-yellow-200 text-yellow-600"
                  iconClass="text-yellow-400"
                  highlight={highlight}
                />
                <ReadingCard
                  label="Soil Moisture"
                  value={fmt(readings.soilMoisture, 0) != null ? `${fmt(readings.soilMoisture, 0)} %` : "—"}
                  icon="fa-seedling"
                  colorClass="bg-green-50 border-green-200 text-green-600"
                  iconClass="text-green-400"
                  highlight={highlight}
                />
                <div className={`border rounded-lg p-3 flex flex-col items-center gap-1 transition-all duration-300 ${
                  soil ? `${soil.bg}` : "bg-gray-50 border-gray-200"
                } ${highlight ? "scale-[1.03]" : "scale-100"}`}>
                  <i className={`fa-solid ${soil?.icon ?? "fa-circle-question"} text-sm ${soil?.text ?? "text-gray-400"}`} />
                  <p className="text-xs text-gray-500">Soil Health</p>
                  <p className={`font-bold text-sm ${soil?.text ?? "text-gray-400"}`}>{soil?.label ?? "—"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reading history chart */}
        {status === "connected" && (
          <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-gray-800">Reading History</h2>
                <p className="text-xs text-gray-400">Last {MAX_HISTORY} readings · dashed lines show optimal soil moisture range (25 – 70 %)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {LINE_CONFIG.map((line) => {
                  const active = visibleLines[line.dataKey];
                  return (
                    <button
                      key={line.dataKey}
                      onClick={() => setVisibleLines((v) => ({ ...v, [line.dataKey]: !v[line.dataKey] }))}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition ${
                        active ? "text-white border-transparent" : "bg-white text-gray-400 border-gray-200"
                      }`}
                      style={active ? { backgroundColor: line.color, borderColor: line.color } : {}}
                    >
                      <span className={`w-2 h-2 rounded-full inline-block ${active ? "bg-white" : "bg-gray-300"}`} />
                      {line.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-[220px]">
              {readingHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">Waiting for first reading…</p>
                </div>
              ) : (
                <LineChart
                  data={readingHistory}
                  lines={activeLines}
                  referenceLines={visibleLines.soilMoisture ? CHART_REFS : []}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ReadingCard({ label, value, icon, colorClass, iconClass, highlight, badge }) {
  return (
    <div className={`border rounded-lg p-3 flex flex-col items-center gap-1 transition-all duration-300 ${colorClass} ${highlight ? "scale-[1.03]" : "scale-100"}`}>
      <i className={`fa-solid ${icon} ${iconClass} text-sm`} />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-sm">{value}</p>
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${badge.className}`}>
          {badge.label}
        </span>
      )}
    </div>
  );
}
