export default function ScoreCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-[#14243b]">{value}</p>
    </div>
  );
}