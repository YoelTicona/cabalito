"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/radar", label: "Radar", icon: "◎" },
] as const;

export function PublicNavPill({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <nav
        className="flex items-center p-1 rounded-full bg-paper/10 border border-paper/10 backdrop-blur-sm"
        aria-label="Navegación principal"
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium transition-all duration-200",
                active
                  ? "bg-paper text-ink shadow-md"
                  : "text-paper/70 hover:text-paper hover:bg-paper/5"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/login"
        className={cn(
          "inline-flex items-center gap-2 h-9 px-5 rounded-full text-sm font-medium transition-all duration-200",
          pathname === "/login"
            ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
            : "bg-primary-600/90 text-white hover:bg-primary-600 shadow-sm hover:shadow-md hover:shadow-primary-600/25"
        )}
      >
        Acceder
        <span aria-hidden className="text-xs opacity-80">→</span>
      </Link>
    </div>
  );
}

export function MobileNavPill({ onCasera }: { onCasera?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden absolute bottom-4 left-4 right-4 z-10"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-between p-1.5 rounded-full bg-noche-800/90 backdrop-blur-md border border-paper/10 shadow-xl">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 rounded-full text-[11px] font-medium transition-all",
                active ? "bg-primary-600 text-white" : "text-paper/60"
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={onCasera}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 rounded-full text-paper/60 text-[11px] font-medium"
        >
          <span className="text-lg leading-none">💬</span>
          casera
        </button>
        <Link
          href="/login"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 rounded-full text-[11px] font-medium transition-all",
            pathname === "/login" ? "bg-primary-600 text-white" : "text-paper/60"
          )}
        >
          <span className="text-lg leading-none">◉</span>
          acceder
        </Link>
      </div>
    </nav>
  );
}
