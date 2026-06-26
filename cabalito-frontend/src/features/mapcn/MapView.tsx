"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ChatBot from "@/features/chat-bot/ChatBot";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface RadarProduct {
  id: number;
  name: string;
  current_price: number;
  market_status: "GREEN" | "YELLOW" | "RED";
  latitude: number | null;
  longitude: number | null;
  region_name: string | null;
}

interface PriceHistory {
  id: number;
  price: number;
  recorded_date: string;
}

const STATUS_COLOR = { GREEN: "#22c55e", YELLOW: "#eab308", RED: "#ef4444" };
const STATUS_LABEL = { GREEN: "Estable", YELLOW: "Alerta", RED: "Crítico" };

function FitBounds({ products }: { products: RadarProduct[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = products.filter((p) => p.latitude && p.longitude);
    if (valid.length > 0) {
      map.setView([-16.4897, -68.1193], 14);
    }
  }, [products, map]);
  return null;
}

export default function MapView() {
  const [products, setProducts] = useState<RadarProduct[]>([]);
  const [selected, setSelected] = useState<RadarProduct | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportEventId, setReportEventId] = useState<number | null>(null);
  const [reportMsg, setReportMsg] = useState("");

  const fetchRadar = useCallback(async () => {
    try {
      const res = await fetch(`${API}/v1/products/radar`);
      const data = await res.json();
      setProducts(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchRadar();
    const id = setInterval(fetchRadar, 15000);
    return () => clearInterval(id);
  }, [fetchRadar]);

  async function openSheet(product: RadarProduct) {
    setSelected(product);
    setChatOpen(false);
    try {
      const res = await fetch(`${API}/v1/products/${product.id}/history`);
      const data = await res.json();
      setHistory(data.slice(-8));
    } catch {
      setHistory([]);
    }
  }

  async function handleReport() {
    if (!selected || !reportEventId) return;
    try {
      const res = await fetch(`${API}/v1/events/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: reportEventId, product_id: selected.id }),
      });
      const data = await res.json();
      setReportMsg(data.status === "accepted" ? "✅ Reporte enviado" : "❌ Reporte rechazado por IA");
      setTimeout(() => setReportMsg(""), 3000);
      fetchRadar();
    } catch {
      setReportMsg("Error enviando reporte");
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapContainer
        center={[-16.4897, -68.1193]}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <FitBounds products={products} />

        {products.map((p) =>
          p.latitude && p.longitude ? (
            <CircleMarker
              key={p.id}
              center={[p.latitude + (Math.random() * 0.002 - 0.001), p.longitude + (Math.random() * 0.002 - 0.001)]}
              radius={p.market_status === "RED" ? 16 : 12}
              pathOptions={{
                color: STATUS_COLOR[p.market_status],
                fillColor: STATUS_COLOR[p.market_status],
                fillOpacity: 0.85,
                weight: p.market_status === "RED" ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => openSheet(p) }}
            />
          ) : null
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 glass rounded-xl p-3 space-y-1.5 z-[1000]">
        <p className="text-xs font-semibold text-slate-400 mb-2">Estado de precios</p>
        {(["GREEN", "YELLOW", "RED"] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: STATUS_COLOR[s], boxShadow: s === "RED" ? "0 0 8px #ef4444" : undefined }}
            />
            <span className="text-xs text-slate-300">{STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>

      {/* Header bar */}
      <div className="absolute top-4 left-4 glass rounded-xl px-4 py-2.5 z-[1000] flex items-center gap-3">
        <span className="text-xl">🐴</span>
        <div>
          <p className="text-sm font-bold text-white">Radar Cabalito</p>
          <p className="text-xs text-slate-400">La Paz, Bolivia</p>
        </div>
        <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Bottom Sheet */}
      {selected && !chatOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-slide-up">
          <div className="bg-card border-t border-border rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <p className="text-slate-400 text-sm">{selected.region_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: STATUS_COLOR[selected.market_status] + "30",
                    color: STATUS_COLOR[selected.market_status],
                    border: `1px solid ${STATUS_COLOR[selected.market_status]}50`,
                  }}
                >
                  {STATUS_LABEL[selected.market_status]}
                </span>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white p-1">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-surface rounded-xl p-3">
                <p className="text-xs text-slate-400">Precio actual</p>
                <p className="text-2xl font-bold text-white">Bs {selected.current_price}</p>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <p className="text-xs text-slate-400">Tendencia</p>
                <p className="text-2xl font-bold" style={{ color: STATUS_COLOR[selected.market_status] }}>
                  {selected.market_status === "RED" ? "↑ Alza" : selected.market_status === "YELLOW" ? "→ Estable" : "↓ Bajo"}
                </p>
              </div>
            </div>

            {/* Price chart */}
            {history.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-400 mb-2">Histórico de precios</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={history}>
                    <XAxis dataKey="recorded_date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                      itemStyle={{ color: "#f97316" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={STATUS_COLOR[selected.market_status]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: STATUS_COLOR[selected.market_status] }}
                      name="Precio (Bs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Report section */}
            <div className="mb-4 bg-surface rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 mb-2">Reportar evento (comunidad)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ID del evento"
                  className="input-field text-sm py-1.5 flex-1"
                  onChange={(e) => setReportEventId(Number(e.target.value))}
                />
                <button onClick={handleReport} className="btn-ghost text-sm py-1.5 px-3">
                  Reportar
                </button>
              </div>
              {reportMsg && <p className="text-xs mt-2 text-slate-300">{reportMsg}</p>}
            </div>

            {/* CTA Casera */}
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <span>🤖</span>
              Consultar alternativas a La Casera IA
            </button>
          </div>
        </div>
      )}

      {/* Chatbot */}
      {chatOpen && selected && (
        <ChatBot
          product={selected}
          onClose={() => { setChatOpen(false); }}
        />
      )}
    </div>
  );
}
