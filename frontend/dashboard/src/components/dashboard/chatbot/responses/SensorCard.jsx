import {
  Thermometer,
  Droplets,
  Sun,
  Sprout,
  Activity,
} from "lucide-react";

function getSensorIcon(name) {
  const lowerName = name?.toLowerCase() || "";

  if (lowerName.includes("temp")) return <Thermometer size={16} />;
  if (lowerName.includes("humidity")) return <Droplets size={16} />;
  if (lowerName.includes("light")) return <Sun size={16} />;
  if (lowerName.includes("soil")) return <Sprout size={16} />;

  return <Activity size={16} />;
}

function getStatusClass(status) {
  switch (status) {
    case "low":
      return "bg-red-50 border-red-200 text-red-600";
    case "high":
      return "bg-purple-50 border-purple-200 text-purple-600";
    case "normal":
      return "bg-blue-50 border-blue-200 text-blue-600";
    default:
      return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

export default function SensorCard({ sensor }) {
  const icon = getSensorIcon(sensor.name);
  const statusClass = getStatusClass(sensor.status);

  return (
    <div className={`rounded-2xl border p-3 ${statusClass}`}>
      <div className="mb-2 flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-xs font-medium">{sensor.name}</span>
      </div>

      <p className="text-lg font-bold">
        {sensor.value} {sensor.unit}
      </p>

      <p className="mt-1 text-xs capitalize text-slate-500">
        Status: {sensor.status}
      </p>
    </div>
  );
}