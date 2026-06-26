"use client";

import Link from "next/link";

const CARDS = [
  { href: "/admin/events",       icon: "⚡", label: "Eventos",      desc: "Gestiona y activa eventos en tiempo real" },
  { href: "/admin/event-types",  icon: "🏷️", label: "Tipos",        desc: "Bloqueos, heladas y más" },
  { href: "/admin/regions",      icon: "📍", label: "Regiones",     desc: "Mercados y zonas de La Paz" },
  { href: "/admin/products",     icon: "🛒", label: "Productos",    desc: "Canasta familiar y precios" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Panel de administración — Cabalito</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{c.label}</h2>
                <p className="text-slate-400 text-sm">{c.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl p-5">
        <p className="text-xs text-slate-500 text-center">
          Cabalito v1.0 · Hackathon 2026 · La Paz, Bolivia 🇧🇴
        </p>
      </div>
    </div>
  );
}
