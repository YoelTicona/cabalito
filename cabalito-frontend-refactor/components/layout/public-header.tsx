"use client";

import Image from "next/image";
import Link from "next/link";
import { PublicNavPill } from "@/components/layout/public-nav";

export function PublicHeader() {
  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 lg:px-10 border-b border-paper/10 bg-noche-800/95 backdrop-blur-md shrink-0">
      <Link href="/" className="flex items-center gap-3 group">
        <Image
          src="/images/logo_cabalito_claro.png"
          alt="Cabalito"
          style={{ width: "auto", height: "auto" }}
          width={36}
          height={36}
          className="rounded-lg transition-transform group-hover:scale-105"
        />
        <span className="font-display text-xl text-paper">Cabalito</span>
      </Link>

      <PublicNavPill />
    </header>
  );
}
