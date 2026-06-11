import {
  Activity,
} from "lucide-react";

export default function MaintenanceAdvice({ payload }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-amber-700">
        <Activity size={18} />
        <span className="font-semibold">{payload?.area}</span>
      </div>

      <ul className="space-y-2 text-sm text-amber-800">
        {payload?.recommendedActions?.map((action, index) => (
          <li key={index} className="rounded-xl bg-white/70 p-2">
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}