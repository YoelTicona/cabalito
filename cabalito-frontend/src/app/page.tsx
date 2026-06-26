"use client";

import dynamic from "next/dynamic";
import NavSide from "@/layouts/navside";

const MapView = dynamic(() => import("@/features/mapcn/MapView"), { ssr: false });

export default function HomePage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <NavSide />
      <main className="flex-1 relative">
        <MapView />
      </main>
    </div>
  );
}
