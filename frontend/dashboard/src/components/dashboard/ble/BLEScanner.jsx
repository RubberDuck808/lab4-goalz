import { useState, useEffect, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { APICall } from "../../../hooks/useAPI";
import { overviewService } from "../../../services/overviewService";
import {
  LineChart as RechartsLineChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

// ── constants ──────────────────────────────────────────────────────────────
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const MAX_HISTORY  = 60;
const DRY_VALUE    = 3500;
const WET_VALUE    = 1200;

function calcSoilMoisture(raw) {
  if (raw == null) return null;
  return Math.max(0, Math.min(100, Math.round((raw - DRY_VALUE) * 100 / (WET_VALUE - DRY_VALUE))));
}

function calcWindSpeed(rawWindRv, rawWindTmp) {
  if (rawWindRv == null || rawWindTmp == null) return 0;
  const rvVolts = (rawWindRv / 4095.0) * 3.3;
  const tmpVolts = (rawWindTmp / 4095.0) * 3.3;
  const tmpRawEquivalent5V = Math.floor((tmpVolts / 5.0) * 1023.0);
  const zeroWindAdUnits = -0.0006 * tmpRawEquivalent5V * tmpRawEquivalent5V + 1.0727 * tmpRawEquivalent5V + 47.172;
  const zeroWindVolts = (zeroWindAdUnits * 0.0048828125) - 0.2;
  const windSpeedMph = Math.pow((rvVolts - zeroWindVolts) / 0.2300, 2.7265);
  return isNaN(windSpeedMph) || windSpeedMph < 0 ? 0 : Math.round(windSpeedMph * 100) / 100;
}

const LINE_CONFIG = [
  { dataKey: "temp",         color: "#FF4B4B", name: "Temp °C"        },
  { dataKey: "humidity",     color: "#1CB0F6", name: "Humidity %"      },
  { dataKey: "light",        color: "#FFC107", name: "Light lux"       },
  { dataKey: "soilMoisture", color: "#58CC02", name: "Soil Moisture %"  },
  { dataKey: "windSpeed",    color: "#8E44AD", name: "Wind Speed mph"  },
];

const SOIL_REFS = [
  { y: 25, label: "Dry",  color: "#FF9830" },
  { y: 70, label: "Wet",  color: "#1CB0F6" },
];

// ── helpers ────────────────────────────────────────────────────────────────
function soilThreshold(pct) {
  if (pct == null) return { color: "#a1a1aa", label: "—", barColor: "var(--color-border)" };
  if (pct < 25)  return { color: "#FF9830", label: "Dry",       barColor: "#FF9830" };
  if (pct < 60)  return { color: "#58CC02", label: "Optimal",   barColor: "#58CC02" };
  if (pct < 80)  return { color: "#1CB0F6", label: "Moist",     barColor: "#1CB0F6" };
  return           { color: "#FFC107", label: "Saturated", barColor: "#FFC107" };
}

function tempThreshold(c) {
  if (c == null) return { color: "#a1a1aa", label: "—" };
  if (c < 10)  return { color: "#1CB0F6", label: "Cold"    };
  if (c < 28)  return { color: "#58CC02", label: "Optimal" };
  return         { color: "#FF4B4B", label: "Hot"     };
}

function humidityThreshold(h) {
  if (h == null) return { color: "#a1a1aa" };
  if (h < 30 || h > 70) return { color: "#FF9830" };
  return { color: "#1CB0F6" };
}

const fmt = (val, decimals = 1) => val != null ? Number(val).toFixed(decimals) : null;

// ── Duolingo-style line chart ───────────────────────────────────────────────
function DuolingoLineChart({ data, lines, referenceLines = [] }) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center gap-3">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="text-sm text-text-secondary">Waiting for first reading…</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12, color: "var(--color-text-primary)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          labelStyle={{ color: "var(--color-text-secondary)", marginBottom: 4 }}
          cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
        />
        {referenceLines.map(ref => (
          <ReferenceLine key={ref.label} y={ref.y} stroke={ref.color} strokeDasharray="4 3" strokeOpacity={0.6}
            label={{ value: ref.label, fontSize: 9, fill: ref.color, position: "insideTopRight" }} />
        ))}
        {lines.map(line => (
          <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color}
            name={line.name} dot={false} strokeWidth={1.5} isAnimationActive={false} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

// ── Duolingo stat panel ─────────────────────────────────────────────────────
function StatPanel({ label, value, unit, valueColor, statusLabel, statusColor, icon, loading }) {
  return (
    <div className="flex flex-col relative overflow-hidden rounded-xl bg-white border border-border">
      {/* colored bottom bar = threshold state */}
      <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ background: statusColor ?? "var(--color-border)" }} />
      <div className="flex flex-col gap-1.5 p-4 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{label}</span>
          {icon && <i className={`fa-solid ${icon} text-xs text-zinc-400`} />}
        </div>
        {loading ? (
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="h-8 w-24 rounded-lg animate-pulse bg-surface" />
            <div className="h-3 w-12 rounded animate-pulse bg-surface" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold font-mono leading-none mt-1 text-text-primary" style={{ color: valueColor }}>
              {value ?? <span className="text-zinc-300">—</span>}
              {value != null && unit && <span className="text-base font-normal ml-1 text-text-secondary">{unit}</span>}
            </p>
            {statusLabel && (
              <span className="text-xs font-bold mt-0.5" style={{ color: statusColor }}>{statusLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
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
    temp: true, humidity: true, light: true, soilMoisture: true, windSpeed: false,
  });

  const bleSupported   = !!navigator.bluetooth;
  const deviceRef      = useRef(null);
  const charRef        = useRef(null);
  const highlightTimer = useRef(null);
  const autoSaveRef    = useRef(false);
  const sensorIdRef    = useRef("");
  const lastSavedReadingsRef  = useRef(null);
  const lastHistoryUpdateRef  = useRef(0);

  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);
  useEffect(() => { sensorIdRef.current = sensorId; }, [sensorId]);

  useEffect(() => {
    overviewService.getAllElements().then(data => setSensors(data?.sensors ?? [])).catch(() => {});
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
    if (!currentReadings || !currentSensorId) return false;

    // Check if telemetry values have changed since the last successful push
    const lastSaved = lastSavedReadingsRef.current;
    if (lastSaved &&
        lastSaved.sensorId === currentSensorId &&
        lastSaved.temp === currentReadings.temp &&
        lastSaved.humidity === currentReadings.humidity &&
        lastSaved.rawMoisture === currentReadings.rawMoisture &&
        lastSaved.rawRed === currentReadings.rawRed &&
        lastSaved.rawGreen === currentReadings.rawGreen &&
        lastSaved.rawBlue === currentReadings.rawBlue &&
        lastSaved.rawIR === currentReadings.rawIR &&
        lastSaved.rawWindRv === currentReadings.rawWindRv &&
        lastSaved.rawWindTmp === currentReadings.rawWindTmp &&
        lastSaved.light === currentReadings.light) {
      return "unchanged";
    }

    try {
      const res = await APICall("POST", "/sensors/data", JSON.stringify({
        sensorId:     parseInt(currentSensorId, 10),
        temperature:  currentReadings.temp,
        humidity:     currentReadings.humidity,
        rawMoisture:  currentReadings.rawMoisture ?? 0,
        rawRed:       currentReadings.rawRed ?? 0,
        rawGreen:     currentReadings.rawGreen ?? 0,
        rawBlue:      currentReadings.rawBlue ?? 0,
        rawIR:        currentReadings.rawIR ?? 0,
        rawWindRv:    currentReadings.rawWindRv ?? 0,
        rawWindTmp:   currentReadings.rawWindTmp ?? 0,
        light:        currentReadings.light ?? 0
      }), sessionStorage.getItem("token") ?? "");

      if (!res?.ok) {
        if (res?.status === 404) {
          toast.error(`Sensor with ID ${currentSensorId} does not exist in the database. Disconnecting device.`, { toastId: `ble-404-${currentSensorId}` });
          setAutoSave(false);
          deviceRef.current?.gatt?.disconnect();
          return "not_found";
        }
        return "failed";
      }

      // Record successful state
      lastSavedReadingsRef.current = {
        sensorId: currentSensorId,
        temp: currentReadings.temp,
        humidity: currentReadings.humidity,
        rawMoisture: currentReadings.rawMoisture ?? 0,
        rawRed: currentReadings.rawRed ?? 0,
        rawGreen: currentReadings.rawGreen ?? 0,
        rawBlue: currentReadings.rawBlue ?? 0,
        rawIR: currentReadings.rawIR ?? 0,
        rawWindRv: currentReadings.rawWindRv ?? 0,
        rawWindTmp: currentReadings.rawWindTmp ?? 0,
        light: currentReadings.light ?? 0
      };

      setSaveCount(c => c + 1);
      return "success";
    } catch (err) {
      console.error("Auto-save failed:", err);
      return "failed";
    }
  }, []);

  const handleValueChange = useCallback((e) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(e.target.value));
      if (data.t === undefined) return;
      const soilMoisture = data.m != null ? data.m : calcSoilMoisture(data.r);
      const newReadings = {
        temp: data.t,
        humidity: data.h,
        soilMoisture,
        rawMoisture: data.r ?? 0,
        light: data.l ?? null,
        rawRed: data.red ?? 0,
        rawGreen: data.green ?? 0,
        rawBlue: data.blue ?? 0,
        rawIR: data.ir ?? 0,
        rawWindRv: data.windRv ?? 0,
        rawWindTmp: data.windTmp ?? 0
      };
      setReadings(newReadings);
      
      let currentId = sensorIdRef.current;
      if (data.id != null && !currentId) {
        currentId = String(data.id);
        setSensorId(currentId);
        sensorIdRef.current = currentId;
      }
      
      const windSpeed = calcWindSpeed(newReadings.rawWindRv, newReadings.rawWindTmp);
      
      const now = new Date();
      setLastUpdated(now);
      setHighlight(true);
      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlight(false), 600);
      if (now.getTime() - lastHistoryUpdateRef.current >= 500) {
        lastHistoryUpdateRef.current = now.getTime();
        setReadingHistory(prev => [
          ...prev.slice(-(MAX_HISTORY - 1)),
          { name: now.toLocaleTimeString(), temp: data.t, humidity: data.h, light: data.l ?? null, soilMoisture, windSpeed },
        ]);
      }
      
      // Only auto-save if the sensor is registered in database (checked locally if sensor list is populated)
      if (autoSaveRef.current && currentId) {
        handleSaveReading(newReadings, currentId);
      }
    } catch {}
  }, [handleSaveReading]);

  const connect = async () => {
    try {
      setStatus("connecting");
      const dev = await navigator.bluetooth.requestDevice({ filters: [{ services: [SERVICE_UUID] }] });
      dev.addEventListener("gattserverdisconnected", () => {
        setStatus("idle"); setReadings(null); setDeviceName(""); setAutoSave(false); setReadingHistory([]);
        toast.info("Sensor disconnected", { toastId: "ble-disconnect" });
      });
      const server  = await dev.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const char    = await service.getCharacteristic(CHAR_UUID);
      charRef.current = char;
      char.oncharacteristicvaluechanged = handleValueChange;
      await char.startNotifications();
      
      deviceRef.current = dev;
      setDeviceName(dev.name || "Goalz-Sensor");
      setStatus("connected");
      setSaveCount(0);
      setAutoSave(true); // Automatically start database logging upon connection
      toast.success(`Connected to ${dev.name || "Goalz-Sensor"}. Auto-saving enabled.`);
      
      try { const v = await char.readValue(); handleValueChange({ target: { value: v } }); } catch {}
    } catch (err) {
      setStatus("idle");
      if (err.name !== "NotFoundError") toast.error("Connection failed: " + err.message);
    }
  };

  const disconnect = () => {
    deviceRef.current?.gatt?.disconnect();
    setStatus("idle"); setReadings(null); setDeviceName(""); setAutoSave(false); setReadingHistory([]);
  };

  const handleSave = async () => {
    if (!readings || !sensorId) return;
    
    // Frontend validation: check if sensor exists in loaded list
    const exists = sensors.length === 0 || sensors.some(s => String(s.id) === String(sensorId));
    if (!exists) {
      toast.error(`Sensor with ID ${sensorId} does not exist in the database.`);
      return;
    }

    setSaving(true);
    try {
      const res = await handleSaveReading(readings, sensorId);
      if (res === "success") {
        toast.success("Reading saved!");
      } else if (res === "unchanged") {
        toast.info("No changes in readings since last save.");
      } else if (res === "failed") {
        toast.error("Failed to save reading");
      }
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const selectedSensor = sensors.find(s => String(s.id) === sensorId);
  const soilT  = soilThreshold(readings?.soilMoisture);
  const tempT  = tempThreshold(readings?.temp);
  const humT   = humidityThreshold(readings?.humidity);
  const activeLines = LINE_CONFIG.filter(l => visibleLines[l.dataKey]);
  const isConnected = status === "connected";
  const isLoading   = isConnected && !readings;

  // Duolingo palette
  const G = {
    pageBg:    "var(--color-surface)",
    panelBg:   "#ffffff",
    panelBg2:  "var(--color-surface)",
    border:    "var(--color-border)",
    border2:   "var(--color-border)",
    textMain:  "var(--color-text-primary)",
    textDim:   "var(--color-text-secondary)",
    textFaint: "#a1a1aa",
    green:     "var(--color-game-green)",
    red:       "var(--color-game-red)",
    blue:      "var(--color-game-blue)",
    yellow:    "var(--color-game-amber)",
    orange:    "#FF9830",
  };

  return (
    <div className="flex flex-col min-h-screen h-full bg-surface text-text-primary">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 h-[60px] shrink-0 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <i className="fa-brands fa-bluetooth text-base" style={{ color: isConnected ? "var(--color-game-green)" : "#a1a1aa" }} />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-text-primary">Sensor Monitor</span>
              {isConnected && (
                <>
                  <span className="text-zinc-300">/</span>
                  <span className="text-sm font-semibold text-text-secondary">{deviceName}</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-text-secondary hidden md:block leading-tight">loggin-dashboard.com</span>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-game-green">
              <span className="w-1.5 h-1.5 rounded-full bg-game-green animate-pulse inline-block" />
              LIVE
            </span>
          )}
          {autoSave && isConnected && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-game-red">
              <span className="w-1.5 h-1.5 rounded-full bg-game-red animate-pulse inline-block" />
              REC · {saveCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && isConnected && (
            <span className="text-xs text-text-secondary mr-2">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {status !== "connected" ? (
            <button
              onClick={connect}
              disabled={!bleSupported || status === "connecting"}
              className="bg-game-green border-b-[3px] border-game-green-border text-white text-xs font-bold px-4 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition disabled:opacity-40"
            >
              {status === "connecting"
                ? <><i className="fa-solid fa-circle-notch fa-spin text-xs" /> Connecting…</>
                : <><i className="fa-brands fa-bluetooth text-xs" /> Connect Sensor</>
              }
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="bg-surface border border-border text-text-primary text-xs font-bold px-4 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:bg-border transition"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-4 p-5 overflow-y-auto">

        {/* ── BLE not supported warning ────────────────────────────────── */}
        {!bleSupported && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-game-amber/30 bg-game-amber-soft text-[#CC8B00] text-sm">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-base" />
            <div>
              <span className="font-bold">Web Bluetooth unavailable</span>
              <span className="text-xs ml-2 opacity-90">Open in Chrome on a device with Bluetooth hardware. Firefox and Safari are not supported.</span>
            </div>
          </div>
        )}

        {/* ── Onboarding (idle) ────────────────────────────────────────── */}
        {status === "idle" && (
          <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
            <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">Getting Started</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: "01", icon: "fa-bluetooth", title: "Connect", text: "Click Connect Sensor and select your device from the browser Bluetooth dialog." },
                { step: "02", icon: "fa-chart-line", title: "Monitor", text: "Live readings stream below every ~1 second. Use the chart to inspect trends over time." },
                { step: "03", icon: "fa-floppy-disk", title: "Log", text: "Select a sensor record and hit Save Reading — or enable Auto-log for continuous recording." },
              ].map(({ step, icon, title, text }) => (
                <div key={step} className="flex gap-3 p-4 rounded-xl bg-surface border border-border">
                  <span className="text-xs font-mono font-bold shrink-0 mt-0.5 text-text-secondary">{step}</span>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className={`fa-solid ${icon} text-xs text-game-blue`} />
                      <span className="text-xs font-bold text-text-primary">{title}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Stat panels ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatPanel
            label="Temperature"
            value={fmt(readings?.temp)}
            unit="°C"
            icon="fa-thermometer-half"
            valueColor={tempT.color}
            statusLabel={tempT.label}
            statusColor={tempT.color}
            loading={isLoading}
          />
          <StatPanel
            label="Humidity"
            value={fmt(readings?.humidity)}
            unit="%"
            icon="fa-droplet"
            valueColor={humT.color}
            statusColor={humT.color}
            loading={isLoading}
          />
          <StatPanel
            label="Light"
            value={readings?.light != null ? String(readings.light) : null}
            unit="lux"
            icon="fa-sun"
            valueColor={G.yellow}
            statusColor={readings?.light != null ? G.yellow : G.textFaint}
            loading={isLoading}
          />
          <StatPanel
            label="Soil Moisture"
            value={fmt(readings?.soilMoisture, 0)}
            unit="%"
            icon="fa-seedling"
            valueColor={soilT.color}
            statusColor={soilT.barColor}
            loading={isLoading}
          />
          <StatPanel
            label="Soil Health"
            value={readings ? soilT.label : null}
            unit=""
            icon="fa-heart-pulse"
            valueColor={soilT.color}
            statusColor={soilT.barColor}
            loading={isLoading}
          />
          <StatPanel
            label="Wind Speed"
            value={readings ? fmt(calcWindSpeed(readings.rawWindRv, readings.rawWindTmp)) : null}
            unit="mph"
            icon="fa-wind"
            valueColor={G.blue}
            statusColor={readings ? G.blue : G.textFaint}
            loading={isLoading}
          />
        </div>

        {/* ── Chart panel ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">Reading History</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Last {MAX_HISTORY} samples · dashed lines = soil moisture range</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LINE_CONFIG.map(line => {
                const active = visibleLines[line.dataKey];
                return (
                  <button
                    key={line.dataKey}
                    onClick={() => setVisibleLines(v => ({ ...v, [line.dataKey]: !v[line.dataKey] }))}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer"
                    style={{
                      background: active ? line.color : "transparent",
                      color: active ? "#ffffff" : "var(--color-text-secondary)",
                      borderColor: active ? "transparent" : "var(--color-border)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? "#ffffff" : "var(--color-text-secondary)" }} />
                    {line.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-[220px] px-3 py-4">
            <DuolingoLineChart
              data={readingHistory}
              lines={activeLines}
              referenceLines={visibleLines.soilMoisture ? SOIL_REFS : []}
            />
          </div>
        </div>

        {/* ── Bottom row: log + device info ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Log panel */}
          <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">Log to Database</p>
              {isConnected && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[10px] font-bold text-text-secondary">AUTO-LOG</span>
                  <div
                    onClick={() => sensorId && setAutoSave(v => !v)}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${!sensorId ? "opacity-30 pointer-events-none" : "cursor-pointer"}`}
                    style={{ background: autoSave ? "var(--color-game-red)" : "var(--color-border)" }}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform duration-200 ${autoSave ? "translate-x-4.5" : "translate-x-0.5"}`}
                      style={{ background: "#fff" }} />
                  </div>
                </label>
              )}
            </div>

            <div>
              <p className="text-[10px] mb-1.5 font-bold uppercase tracking-wide text-text-secondary">Sensor</p>
              {sensors.length > 0 ? (
                <select
                  value={sensorId}
                  onChange={e => { setSensorId(e.target.value); setAutoSave(false); setSaveCount(0); }}
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white text-text-primary"
                >
                  <option value="">— Select sensor —</option>
                  {sensors.map(s => <option key={s.id} value={String(s.id)}>{s.sensorName} (#{s.id})</option>)}
                </select>
              ) : (
                <input
                  type="number" min="1" value={sensorId}
                  onChange={e => setSensorId(e.target.value)}
                  placeholder="Sensor ID"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-game-blue/30 bg-white text-text-primary"
                />
              )}
            </div>

            {sensorId && sensors.length > 0 && !sensors.some(s => String(s.id) === String(sensorId)) && (
              <div className="flex items-center gap-2 text-xs font-bold text-game-red bg-red-50 border border-red-200 rounded-xl p-3">
                <i className="fa-solid fa-triangle-exclamation text-sm shrink-0" />
                <span>Sensor #{sensorId} is not registered in the database. Data logging is disabled.</span>
              </div>
            )}

            {autoSave ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm font-bold text-game-red flex-1">
                  <span className="w-2 h-2 rounded-full bg-game-red animate-pulse inline-block" />
                  Recording · {saveCount} saved
                </span>
                <button
                  onClick={() => setAutoSave(false)}
                  className="bg-surface border border-border text-text-primary text-xs font-bold px-3 py-2 rounded-xl hover:bg-border transition cursor-pointer"
                >
                  Stop
                </button>
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !sensorId || !readings || !isConnected || (sensors.length > 0 && !sensors.some(s => String(s.id) === String(sensorId)))}
                className="w-full bg-game-green border-b-[3px] border-game-green-border text-white text-sm font-bold py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-30 cursor-pointer"
              >
                {saving ? "Saving…" : "Save Reading"}
              </button>
            )}

            {selectedSensor && !autoSave && (
              <p className="text-[10px] text-text-secondary">
                Target: <span className="font-bold text-text-primary">{selectedSensor.sensorName}</span>
              </p>
            )}
          </div>

          {/* Device info panel */}
          <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
            <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">Device Info</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Device",    value: isConnected ? deviceName : "—" },
                { label: "Status",    value: isConnected ? "Connected" : status === "connecting" ? "Connecting" : "Idle",
                  color: isConnected ? "var(--color-game-green)" : status === "connecting" ? "var(--color-game-amber)" : "var(--color-text-secondary)" },
                { label: "Samples",   value: isConnected ? String(readingHistory.length) : "—" },
                { label: "Saved",     value: isConnected ? String(saveCount) : "—" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-surface">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">{label}</span>
                  <span className="text-sm font-bold font-mono text-text-primary" style={{ color: color }}>{value}</span>
                </div>
              ))}
            </div>

            {isConnected && (
              <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">BLE Services</p>
                <p className="text-[10px] font-mono truncate bg-surface px-2.5 py-1.5 rounded-lg border border-border text-text-secondary">{SERVICE_UUID}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
