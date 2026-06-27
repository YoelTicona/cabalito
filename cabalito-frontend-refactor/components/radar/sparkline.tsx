import type { PriceHistoryOut } from "@/lib/types";

export function Sparkline({ data }: { data: PriceHistoryOut[] }) {
  if (data.length < 2) {
    return <div className="h-16 flex items-center text-xs text-paper/40">no hay suficiente historial todavia</div>;
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
  const stroke = rising ? "#D8572E" : "#5B8C3A";
  const areaPoints = `0,${h} ${points.join(" ")} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <polygon points={areaPoints} fill={stroke} opacity={0.12} />
      <polyline points={points.join(" ")} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
