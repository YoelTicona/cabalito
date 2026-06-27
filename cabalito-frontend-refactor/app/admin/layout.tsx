"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { clearToken, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/eventos", label: "Eventos", icon: "⚠" },
  { href: "/admin/regiones", label: "Regiones", icon: "◎" },
  { href: "/admin/catalogo", label: "Catalogo", icon: "▤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink text-ink dark:text-paper">
      <aside className="w-56 shrink-0 border-r border-ink/10 dark:border-paper/10 flex flex-col p-4">
        <Link href="/" className="font-display text-xl mb-8 px-2">
          Cabalito
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-terracota-600 text-white"
                  : "text-ink/70 dark:text-paper/70 hover:bg-ink/5 dark:hover:bg-paper/10"
              )}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
          className="text-sm text-ink/50 dark:text-paper/50 hover:text-terracota-600 px-3 h-10 flex items-center gap-3"
        >
          <span className="w-4 text-center">↩</span>
          Salir
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-end px-6 border-b border-ink/10 dark:border-paper/10">
          <ThemePill />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function ThemePill() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="cambiar tema"
      className="relative w-12 h-6 rounded-full bg-ink/10 dark:bg-paper/15 transition-colors"
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-noche-800 shadow transition-transform flex items-center justify-center text-[10px]",
          dark && "translate-x-6"
        )}
      >
        {dark ? "🌙" : "☀"}
      </span>
    </button>
  );
}
