"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
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
    <div className="min-h-screen bg-noche-800 text-paper flex flex-col">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-primary-600/20" />
            <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full border border-primary-600/30" />
            <div className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-primary-600/25 animate-radarping" />
          </div>

          <Image
            src="/images/logo_cabalito_claro.png"
            alt="Cabalito"
            style={{ width: "auto", height: "auto" }}
            width={80}
            height={80}
            className="relative z-10 rounded-2xl mb-6 md:hidden"
          />

          <p className="relative z-10 text-xs tracking-[0.2em] uppercase text-paper/40 mb-4">
            La Paz, Bolivia
          </p>
          <h1 className="relative z-10 font-display text-5xl sm:text-6xl md:text-7xl mb-4 text-center">
            Cabalito
          </h1>
          <p className="relative z-10 font-display text-lg sm:text-xl md:text-2xl text-paper/80 max-w-lg text-center mb-10">
            Tu radar de precios. Sabe que esta caro, por que, y que comprar en su lugar.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/radar"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary-600 hover:bg-primary-800 text-white font-medium shadow-lg shadow-primary-600/25 transition-all hover:shadow-xl hover:shadow-primary-600/30"
            >
              <span>◎</span> Ver el radar
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border-2 border-paper/20 hover:border-primary-600/50 hover:bg-paper/5 text-paper/90 font-medium transition-all"
            >
              Acceder <span className="text-primary-400">→</span>
            </Link>
          </div>

          <div className="relative z-10 flex gap-8 md:gap-12 mt-14 font-mono text-sm text-paper/50">
            <span>
              <span className="text-primary-400 text-lg md:text-xl font-display">{crisis}</span> en crisis
            </span>
            <span>
              <span className="text-tertiary-400 text-lg md:text-xl font-display">{total}</span> productos
            </span>
          </div>
        </div>

        <footer className="text-center text-xs text-paper/30 pb-6 md:pb-8">
          proyecto civico, datos en tiempo real del mercado de La Paz
        </footer>
      </main>
    </div>
  );
}
