"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV = [
  { href: "/", icon: "🗺️", label: "Radar" },
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/events", icon: "⚡", label: "Eventos" },
  { href: "/admin/event-types", icon: "🏷️", label: "Tipos" },
  { href: "/admin/regions", icon: "📍", label: "Regiones" },
  { href: "/admin/products", icon: "🛒", label: "Productos" },
  { href: "/login", icon: "🔐", label: "Login" },
];

export default function NavSide() {
  const path = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-20 bg-card border-r border-border h-screen sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center justify-center h-16 border-b border-border">
        <span className="text-2xl">🐴</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200",
                active
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="h-16 border-t border-border flex items-center justify-center">
        <span className="text-slate-600 text-xs">v1.0</span>
      </div>
    </aside>
  );
}
