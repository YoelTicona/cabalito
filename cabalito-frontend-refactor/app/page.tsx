"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRadar } from "@/lib/api";
import type { RadarProduct } from "@/lib/types";

export default function LandingPage() {
  const [products, setProducts] = useState<RadarProduct[]>([]);

  useEffect(() => {
    getRadar().then(setProducts).catch(() => setProducts([]));
  }, []);

  const crisis = products.filter((p) => p.market_status === "RED").length;
  const total = products.length;

  return (
    <main className="min-h-screen bg-noche-800 text-paper flex flex-col">
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full border border-oro-600/20" />
          <div className="absolute w-44 h-44 rounded-full border border-oro-600/30" />
          <div className="absolute w-44 h-44 rounded-full bg-terracota-600/30 animate-radarping" />
        </div>

        <p className="relative z-10 text-xs tracking-[0.2em] uppercase text-paper/40 mb-4">La Paz, Bolivia</p>
        <h1 className="relative z-10 font-display text-6xl sm:text-7xl mb-4">Cabalito</h1>
        <p className="relative z-10 font-display text-xl sm:text-2xl text-paper/80 max-w-md text-center mb-10">
          Tu radar de precios. Sabe que esta caro, por que, y que comprar en su lugar.
        </p>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/radar"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-terracota-600 hover:bg-terracota-800 text-white font-medium transition-colors"
          >
            Ver el radar
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-paper/20 hover:bg-paper/5 text-paper/80 font-medium transition-colors"
          >
            Acceder
          </Link>
        </div>

        <div className="relative z-10 flex gap-8 mt-14 font-mono text-sm text-paper/50">
          <span>
            <span className="text-terracota-400">{crisis}</span> en crisis
          </span>
          <span>
            <span className="text-mercado-400">{total}</span> productos
          </span>
        </div>
      </div>

      <footer className="text-center text-xs text-paper/30 pb-6">
        proyecto civico, datos en tiempo real del mercado de La Paz
      </footer>
    </main>
  );
}
