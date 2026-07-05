import { Star } from "lucide-react";

export function RatingStars({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex" aria-label={`${value} 星評分`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-4 ${index < Math.round(value) ? "fill-amber-300 text-amber-300" : "text-slate-600"}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="font-semibold text-white">{value ? value.toFixed(1) : "未有評分"}</span>
      {typeof count === "number" ? <span className="text-slate-400">({count} 則評論)</span> : null}
    </div>
  );
}

export function RatingBar({ label, value }: { label: string; value: number }) {
  const width = `${Math.min(100, Math.max(0, (value / 5) * 100))}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-pink-300" style={{ width }} />
      </div>
    </div>
  );
}
