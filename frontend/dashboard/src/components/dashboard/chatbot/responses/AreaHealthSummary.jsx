import ScoreCard from "./ScoreCard";

export default function AreaHealthSummary({ payload }) {
  return (
    <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Health" value={payload?.healthScore} />
        <ScoreCard label="Biodiversity" value={payload?.biodiversityScore} />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-slate-500">
          Main issues
        </p>

        <ul className="list-inside list-disc text-sm text-slate-600">
          {payload?.mainIssues?.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}