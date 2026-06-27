"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { RadarProduct } from "@/lib/types";

interface Props {
  products: RadarProduct[];
  crisisCount: number;
}

export function MapHud({ products, crisisCount }: Props) {
  const stats = useMemo(() => {
    const green = products.filter((p) => p.market_status === "GREEN").length;
    const yellow = products.filter((p) => p.market_status === "YELLOW").length;
    const red = products.filter((p) => p.market_status === "RED").length;
    return { green, yellow, red, total: products.length };
  }, [products]);

  return (
    <>
      {/* Barrido radar */}
      <div className="map-radar-sweep pointer-events-none" aria-hidden />

      {/* Anillos concéntricos */}
      <div className="map-radar-rings pointer-events-none" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      {/* Viñeta */}
      <div className="map-vignette pointer-events-none" aria-hidden />

      {/* HUD superior izquierdo — debajo del banner de crisis en móvil */}
      <div className="absolute bottom-24 md:bottom-6 left-4 z-[2] flex flex-col gap-2 pointer-events-none md:pointer-events-auto">
        <div className="map-hud-card px-4 py-3 flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
            <span className="absolute inset-0 rounded-full border-2 border-primary-600/40 animate-radarping" />
            <span className="absolute inset-1.5 rounded-full bg-primary-600/20 border border-primary-600/60 flex items-center justify-center text-primary-400 text-sm">
              ◎
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-paper/40 font-medium">Radar activo</p>
            <p className="text-paper font-display text-lg leading-tight">
              {stats.total} productos<span className="text-paper/40 font-sans text-sm"> monitoreados</span>
            </p>
          </div>
        </div>

        <div className="map-hud-card px-4 py-2.5 flex items-center gap-3">
          <StatPill color="bg-tertiary-500" label="normal" value={stats.green} />
          <StatPill color="bg-primary-400" label="alerta" value={stats.yellow} />
          <StatPill color="bg-primary-600" label="crisis" value={stats.red} pulse={crisisCount > 0} />
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-24 md:bottom-6 right-4 z-[2] hidden sm:block pointer-events-none">
        <div className="map-hud-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-paper/40 font-medium mb-2">Leyenda</p>
          <div className="space-y-1.5 text-xs text-paper/70">
            <LegendRow color="bg-tertiary-500" label="Precio normal" />
            <LegendRow color="bg-primary-400" label="En alerta" />
            <LegendRow color="bg-primary-600" label="En crisis" glow />
          </div>
        </div>
      </div>

      {/* Marca de agua */}
      <div className="absolute top-20 md:top-4 left-1/2 -translate-x-1/2 z-[2] pointer-events-none hidden md:block">
        <div className="map-hud-card px-5 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary-500 animate-pulse" />
          <span className="text-xs text-paper/60 font-medium tracking-wide">La Paz · tiempo real</span>
        </div>
      </div>
    </>
  );
}

function StatPill({
  color,
  label,
  value,
  pulse,
}: {
  color: string;
  label: string;
  value: number;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2 h-2 rounded-full shrink-0", color, pulse && "animate-pulse shadow-[0_0_8px_#D97706]")} />
      <span className="text-paper/50 text-xs">{label}</span>
      <span className="text-paper font-mono text-sm font-medium">{value}</span>
    </div>
  );
}

function LegendRow({ color, label, glow }: { color: string; label: string; glow?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-3 h-3 rounded-full", color, glow && "shadow-[0_0_10px_#D97706]")} />
      {label}
    </div>
  );
}
