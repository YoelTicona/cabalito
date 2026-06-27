"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RadarProduct } from "@/lib/types";

const LA_PAZ_CENTER: [number, number] = [-68.1193, -16.5];
const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const COLORS: Record<string, string> = {
  GREEN: "#059669",
  YELLOW: "#F59E0B",
  RED: "#D97706",
};

const GLOW: Record<string, string> = {
  GREEN: "rgba(5, 150, 105, 0.55)",
  YELLOW: "rgba(245, 158, 11, 0.55)",
  RED: "rgba(217, 119, 6, 0.7)",
};

interface Props {
  products: RadarProduct[];
  selectedId: number | null;
  onSelect: (p: RadarProduct) => void;
}

function createMarkerElement(p: RadarProduct, isSelected: boolean): HTMLDivElement {
  const color = COLORS[p.market_status] ?? COLORS.GREEN;
  const glow = GLOW[p.market_status] ?? GLOW.GREEN;
  const isCrisis = p.market_status === "RED";
  const isAlert = p.market_status === "YELLOW";

  const wrap = document.createElement("div");
  wrap.className = "map-marker";
  wrap.style.setProperty("--marker-color", color);
  wrap.style.setProperty("--marker-glow", glow);

  if (isCrisis) {
    const pulse = document.createElement("span");
    pulse.className = "map-marker-pulse";
    wrap.appendChild(pulse);
    const pulse2 = document.createElement("span");
    pulse2.className = "map-marker-pulse map-marker-pulse-delay";
    wrap.appendChild(pulse2);
  }

  const halo = document.createElement("span");
  halo.className = "map-marker-halo";
  wrap.appendChild(halo);

  const dot = document.createElement("span");
  dot.className = "map-marker-dot";
  if (isSelected) dot.classList.add("map-marker-dot-selected");
  if (isAlert) dot.classList.add("map-marker-dot-alert");
  wrap.appendChild(dot);

  const chip = document.createElement("div");
  chip.className = "map-marker-chip";
  if (isSelected) chip.classList.add("map-marker-chip-visible");
  chip.innerHTML = `
    <span class="map-marker-chip-name">${p.product_name}</span>
    <span class="map-marker-chip-price">Bs ${parseFloat(p.current_price).toFixed(2)}</span>
  `;
  wrap.appendChild(chip);

  return wrap;
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
      zoom: 12.4,
      pitch: 42,
      bearing: -12,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    map.on("load", () => {
      map.resize();
      try {
        if (map.getLayer("background")) {
          map.setPaintProperty("background", "background-color", "#0d1117");
        }
        if (map.getLayer("water")) {
          map.setPaintProperty("water", "fill-color", "#111827");
        }
      } catch {
        // capas varían según el estilo base
      }
    });

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

  // Fly-to al seleccionar desde sidebar
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = products.find((x) => x.market_product_id === selectedId);
    if (p?.latitude == null || p?.longitude == null) return;
    map.flyTo({
      center: [p.longitude, p.latitude],
      zoom: 14,
      pitch: 48,
      bearing: -8,
      speed: 1.4,
      essential: true,
    });
  }, [selectedId, products]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    products
      .filter((p) => p.latitude != null && p.longitude != null)
      .forEach((p) => {
        const isSelected = p.market_product_id === selectedId;
        const el = createMarkerElement(p, isSelected);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect(p);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.longitude as number, p.latitude as number])
          .addTo(map);

        markersRef.current.push(marker);
      });
  }, [products, selectedId, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full map-container" />;
}
