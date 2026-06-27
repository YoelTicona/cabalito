import type { PriceHistoryOut } from "@/lib/types";

export function Sparkline({ data }: { data: PriceHistoryOut[] }) {
  if (data.length < 2) {
    return <div className="h-16 flex items-center text-xs text-ink/40">no hay suficiente historial todavia</div>;
  }

  const prices = data.map((d) => parseFloat(d.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 280;
  const h = 64;
  const step = w / (prices.length - 1);

  const points = prices.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });

  const rising = prices[prices.length - 1] >= prices[0];
  const stroke = rising ? "#D97706" : "#059669";
  const areaPoints = `0,${h} ${points.join(" ")} ${w},${h}`;

  const last = points[points.length - 1].split(",");
  const lastX = last[0];
  const lastY = last[1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill={stroke} />
    </svg>
  );
}
