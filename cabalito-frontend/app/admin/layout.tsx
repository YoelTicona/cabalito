"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { clearToken, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/eventos", label: "Eventos", icon: "⚠" },
  { href: "/admin/regiones", label: "Regiones", icon: "◎" },
  { href: "/admin/catalogo", label: "Catalogo", icon: "▤" },
];

// 1. Extraemos el Logo para usarlo en el header móvil y en el menú de escritorio
function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo que se muestra en modo claro */}
      <Image
        src="/images/logo_cabalito_negro.png"
        alt="Cabalito"
        width={28}
        height={28}
        className="rounded-md dark:hidden"
      />
      {/* Logo que se muestra en modo oscuro */}
      <Image
        src="/images/logo_cabalito_claro.png"
        alt="Cabalito"
        width={28}
        height={28}
        className="rounded-md hidden dark:block"
      />
      <span className="font-display text-xl font-semibold">Cabalito</span>
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col md:flex-row bg-paper dark:bg-ink text-ink dark:text-paper">
      
      {/* --- HEADER MÓVIL (Solo visible en celulares) --- */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink sticky top-0 z-40">
        <Link href="/">
          <BrandLogo />
        </Link>
        <ThemePill />
      </header>

      {/* --- MENÚ DE NAVEGACIÓN (Abajo en móvil / Lateral en Desktop) --- */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full flex-row items-center justify-around border-t border-ink/10 bg-paper dark:border-paper/10 dark:bg-ink md:relative md:h-screen md:w-56 md:shrink-0 md:flex-col md:justify-start md:border-r md:border-t-0 md:p-4">
        
        {/* Logo en Desktop (Oculto en móvil) */}
        <Link href="/" className="hidden md:flex items-center mb-8 px-2">
          <BrandLogo />
        </Link>

        {/* Enlaces de Navegación */}
        <nav className="flex w-full flex-1 flex-row items-center justify-around md:flex-col md:items-stretch md:justify-start md:space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-3 h-14 md:h-10 rounded-lg md:rounded-full transition-all duration-200",
                pathname === item.href
                  ? "text-primary-600 dark:text-primary-400 md:bg-primary-600 md:text-white md:shadow-sm md:dark:text-white"
                  : "text-ink/60 dark:text-paper/60 hover:bg-ink/5 dark:hover:bg-paper/5 md:hover:bg-primary-50 md:dark:hover:bg-paper/10"
              )}
            >
              <span className="text-xl md:text-base md:w-4 text-center">{item.icon}</span>
              {/* En móvil la fuente es más pequeña para que quepa bien, como en WhatsApp */}
              <span className="text-[10px] md:text-sm">{item.label}</span>
            </Link>
          ))}
          
          {/* Botón Salir */}
          <button
            onClick={() => {
              clearToken();
              router.push("/login");
            }}
            className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-3 h-14 md:h-10 rounded-lg md:rounded-full text-ink/50 dark:text-paper/50 hover:text-red-500 md:mt-auto transition-colors"
          >
            <span className="text-xl md:text-base md:w-4 text-center">↩</span>
            <span className="text-[10px] md:text-sm">Salir</span>
          </button>
        </nav>
      </aside>

      {/* --- ÁREA PRINCIPAL DE CONTENIDO --- */}
      {/* pb-16 en móvil evita que el menú inferior tape el contenido */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        
        {/* Header Desktop (Oculto en móvil) */}
        <header className="hidden md:flex h-14 items-center justify-end px-6 border-b border-ink/10 dark:border-paper/10">
          <ThemePill />
        </header>
        
        <main className="flex-1 p-4 md:p-6 md:overflow-y-auto">
          {children}
        </main>
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
      className="relative w-12 h-6 rounded-full bg-ink/10 dark:bg-paper/15 transition-colors focus:outline-none"
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