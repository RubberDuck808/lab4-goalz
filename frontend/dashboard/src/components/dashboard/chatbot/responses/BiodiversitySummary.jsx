export default function BiodiversitySummary({ payload }) {
  return (
    <div className="rounded-2xl bg-green-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-green-700">
        <Sprout size={18} />
        <span className="font-semibold">{payload?.area}</span>
      </div>

      <p className="text-2xl font-bold text-green-700">
        {payload?.biodiversityScore}
      </p>

      <p className="text-xs text-green-600">Biodiversity score</p>

      <ul className="mt-3 list-inside list-disc text-sm text-green-700">
        {payload?.mainIssues?.map((issue, index) => (
          <li key={index}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}