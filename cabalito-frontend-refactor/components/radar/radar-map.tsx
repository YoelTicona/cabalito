"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RadarProduct } from "@/lib/types";

const LA_PAZ_CENTER: [number, number] = [-68.1193, -16.5];
const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const COLORS: Record<string, string> = {
  GREEN: "#82AC59",
  YELLOW: "#E6B845",
  RED: "#E07A50",
};

interface Props {
  products: RadarProduct[];
  selectedId: number | null;
  onSelect: (p: RadarProduct) => void;
}

export function RadarMap({ products, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: LA_PAZ_CENTER,
      zoom: 12.2,
      attributionControl: false,
    });
    mapRef.current = map;

    // el contenedor a veces no tiene su tamano final en el primer frame
    // (pasa seguido con 100dvh), asi que forzamos resize varias veces
    map.on("load", () => map.resize());
    requestAnimationFrame(() => map.resize());

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    function onWindowResize() {
      map.resize();
    }
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    products
      .filter((p) => p.latitude != null && p.longitude != null)
      .forEach((p) => {
        const isSelected = p.id === selectedId;
        const isCrisis = p.market_status === "RED";
        const color = COLORS[p.market_status] ?? COLORS.GREEN;

        const el = document.createElement("div");
        el.style.position = "relative";
        el.style.width = isSelected ? "26px" : "18px";
        el.style.height = isSelected ? "26px" : "18px";
        el.style.cursor = "pointer";

        if (isCrisis) {
          const ping = document.createElement("span");
          ping.className = "animate-radarping";
          ping.style.position = "absolute";
          ping.style.inset = "0";
          ping.style.borderRadius = "50%";
          ping.style.background = color;
          el.appendChild(ping);
        }

        const dot = document.createElement("span");
        dot.style.position = "absolute";
        dot.style.inset = "0";
        dot.style.borderRadius = "50%";
        dot.style.background = color;
        dot.style.border = isSelected ? "2px solid #F7F3EA" : "1.5px solid rgba(20,22,27,0.6)";
        el.appendChild(dot);

        el.addEventListener("click", () => onSelect(p));

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.longitude as number, p.latitude as number])
          .addTo(map);

        markersRef.current.push(marker);
      });
  }, [products, selectedId, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}