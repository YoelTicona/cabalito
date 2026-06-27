"use client";

import { useEffect, useMemo, useState } from "react";
import { RadarMap } from "@/components/radar/radar-map";
import { MapHud } from "@/components/radar/map-hud";
import { CaseraChat } from "@/components/radar/casera-chat";
import { Sparkline } from "@/components/radar/sparkline";
import { PublicHeader } from "@/components/layout/public-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import {
  getActiveEvents,
  getMarketProductHistory,
  getRadar,
  getPublicRegions,
  reportEvent,
} from "@/lib/api";
import { cn, formatBs } from "@/lib/utils";
import type { EventOut, PriceHistoryOut, RadarProduct, RegionOut } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  GREEN: "bg-tertiary-600",
  YELLOW: "bg-primary-400",
  RED: "bg-primary-600",
};

export default function RadarPage() {
  const [products, setProducts] = useState<RadarProduct[]>([]);
  const [selected, setSelected] = useState<RadarProduct | null>(null);
  const [history, setHistory] = useState<PriceHistoryOut[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getRadar().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getMarketProductHistory(selected.market_product_id).then(setHistory).catch(() => setHistory([]));
  }, [selected]);

  const crisisCount = useMemo(() => products.filter((p) => p.market_status === "RED").length, [products]);
  const crisisNames = useMemo(
    () => products.filter((p) => p.market_status === "RED").slice(0, 3).map((p) => p.product_name),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        (p.region_name ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  function openCasera() {
    if (!selected) {
      setNotice("Toca un producto en el mapa primero, caserito.");
      setTimeout(() => setNotice(null), 2200);
      return;
    }
    setChatOpen(true);
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-noche-800 overflow-hidden">
      <PublicHeader />

      <div className="flex-1 flex min-h-0">
        {/* Panel izquierdo — desktop */}
        <aside className="hidden md:flex w-72 lg:w-80 flex-col border-r border-paper/10 bg-noche-800 shrink-0">
          <div className="p-4 border-b border-paper/10 bg-gradient-to-b from-primary-600/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-tertiary-500 animate-pulse" />
              <h2 className="font-display text-lg text-paper">Productos</h2>
            </div>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o mercado..."
                className="w-full h-10 rounded-full bg-paper/10 border border-paper/10 pl-10 pr-4 text-sm text-paper placeholder:text-paper/40 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/30"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map((p) => (
              <li key={p.market_product_id}>
                <button
                  onClick={() => setSelected(p)}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all duration-200",
                    selected?.market_product_id === p.market_product_id
                      ? "bg-primary-600/20 border border-primary-600/30 shadow-[inset_0_0_12px_rgba(217,119,6,0.08)]"
                      : "hover:bg-paper/5 border border-transparent"
                  )}
                >
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", STATUS_COLORS[p.market_status])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-paper text-sm font-medium truncate">{p.product_name}</p>
                    <p className="text-paper/40 text-xs truncate">{p.region_name} · Bs {formatBs(p.current_price)}</p>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-paper/40 text-sm text-center py-8">sin resultados</li>
            )}
          </ul>
        </aside>

        {/* Mapa central */}
        <main className="relative flex-1 min-w-0 overflow-hidden">
          <RadarMap
            products={products}
            selectedId={selected?.market_product_id ?? null}
            onSelect={setSelected}
          />
          <MapHud products={products} crisisCount={crisisCount} />

          {crisisCount > 0 && (
            <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm z-[3]">
              <div className="map-hud-card px-4 py-3 flex items-start gap-3 border-primary-600/30 shadow-[0_0_24px_rgba(217,119,6,0.15)]">
                <span className="relative flex h-3 w-3 mt-1 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-600 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600" />
                </span>
                <div>
                  <p className="text-primary-400 text-[10px] uppercase tracking-[0.15em] font-semibold mb-0.5">
                    Alerta de crisis
                  </p>
                  <p className="text-paper text-sm leading-snug">
                    <span className="font-medium">
                      {crisisCount} producto{crisisCount > 1 ? "s" : ""} en crisis
                    </span>
                    <span className="text-paper/50"> — {crisisNames.join(", ")}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón reportar — desktop */}
          <button
            onClick={() => setReportOpen(true)}
            aria-label="reportar incidente"
            className="absolute right-4 top-4 z-[3] hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-primary-600 text-white text-sm font-medium shadow-lg shadow-primary-600/30 hover:bg-primary-800 hover:shadow-primary-600/40 transition-all"
          >
            📢 Reportar incidente
          </button>

          {notice && (
            <div className="absolute bottom-24 md:bottom-8 left-4 right-4 z-20 text-center">
              <span className="inline-block bg-paper text-ink text-sm rounded-full px-4 py-2 shadow">
                {notice}
              </span>
            </div>
          )}

          {/* Botón reportar — móvil */}
          <button
            onClick={() => setReportOpen(true)}
            aria-label="reportar incidente"
            className="md:hidden absolute right-4 bottom-28 z-10 w-14 h-14 rounded-full bg-primary-600 text-white text-xl shadow-lg shadow-primary-600/30 flex items-center justify-center"
          >
            📢
          </button>

          {/* Panel inferior — solo móvil */}
          {selected && (
            <div className="md:hidden absolute bottom-20 left-0 right-0 z-10 bg-paper rounded-t-2xl px-5 pt-4 pb-5 shadow-2xl">
              <ProductDetail selected={selected} history={history} onClose={() => setSelected(null)} onCasera={openCasera} />
            </div>
          )}

          <MobileNav onCasera={openCasera} />
        </main>

        {/* Panel derecho — desktop */}
        <aside className="hidden md:flex w-80 lg:w-96 flex-col border-l border-paper/10 bg-paper text-ink shrink-0">
          {selected ? (
            <div className="flex-1 overflow-y-auto p-5">
              <ProductDetail selected={selected} history={history} onClose={() => setSelected(null)} onCasera={openCasera} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-5">
                <span className="absolute inset-0 rounded-full border border-primary-600/20 animate-radarping" />
                <span className="absolute inset-3 rounded-full border border-primary-600/40" />
                <span className="absolute inset-0 flex items-center justify-center text-3xl text-primary-600">◎</span>
              </div>
              <p className="font-display text-xl mb-2">Selecciona un producto</p>
              <p className="text-ink/50 text-sm max-w-xs">
                Toca un punto brillante en el mapa o elige de la lista para ver precios y alternativas.
              </p>
            </div>
          )}
        </aside>
      </div>

      <CaseraChat
        open={chatOpen}
        productId={selected?.product_id ?? null}
        productName={selected?.product_name ?? ""}
        onClose={() => setChatOpen(false)}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        products={products}
      />
    </div>
  );
}

function ProductDetail({
  selected,
  history,
  onClose,
  onCasera,
}: {
  selected: RadarProduct;
  history: PriceHistoryOut[];
  onClose: () => void;
  onCasera: () => void;
}) {
  const statusLabel =
    selected.market_status === "RED" ? "crisis" : selected.market_status === "YELLOW" ? "alerta" : "normal";
  const statusClass =
    selected.market_status === "RED"
      ? "bg-primary-100 text-primary-800 border-primary-200"
      : selected.market_status === "YELLOW"
      ? "bg-primary-50 text-primary-700 border-primary-200"
      : "bg-tertiary-50 text-tertiary-800 border-tertiary-200";

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border", statusClass)}>
            {statusLabel}
          </span>
          <p className="text-ink/50 text-xs">{selected.region_name ?? "La Paz"}</p>
        </div>
        <button onClick={onClose} aria-label="cerrar" className="w-8 h-8 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink/40 text-lg">
          ×
        </button>
      </div>
      <h2 className="font-display text-2xl text-ink mb-0.5">{selected.product_name}</h2>
      <p className="text-ink/40 text-xs mb-2">{selected.unit} · {selected.region_name}</p>
      <p
        className={cn(
          "text-4xl font-display tracking-tight",
          selected.market_status === "RED"
            ? "text-primary-600"
            : selected.market_status === "YELLOW"
            ? "text-primary-500"
            : "text-tertiary-600"
        )}
      >
        Bs {formatBs(selected.current_price)}
      </p>
      <p className="text-ink/40 text-xs mt-1 mb-4">precio actual en este mercado</p>
      <div className="rounded-xl bg-ink/[0.03] border border-ink/5 p-3">
        <p className="text-[10px] uppercase tracking-wider text-ink/40 font-medium mb-2">Historial de precios</p>
        <Sparkline data={history} />
      </div>
      <Button onClick={onCasera} className="w-full mt-4" size="md">
        Preguntar alternativas a La Casera
      </Button>
    </>
  );
}

function ReportModal({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: RadarProduct[];
}) {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [regions, setRegions] = useState<RegionOut[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Campos del formulario
  const [eventId, setEventId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [marketProductId, setMarketProductId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [placeRef, setPlaceRef] = useState("");
  const [description, setDescription] = useState("");

  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingEvents(true);
    Promise.all([getActiveEvents(), getPublicRegions()])
      .then(([evts, regs]) => {
        setEvents(evts);
        setRegions(regs);
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, [open]);

  // Autocompletar región al seleccionar evento
  useEffect(() => {
    if (!eventId) return;
    const ev = events.find((e) => String(e.id) === eventId);
    if (ev?.region_id) setRegionId(String(ev.region_id));
  }, [eventId, events]);

  // Filtrar market_products según región seleccionada
  const filteredProducts = useMemo(() => {
    if (!regionId) return products;
    return products.filter((p) => String(p.region_id) === regionId);
  }, [products, regionId]);

  function eventLabel(e: EventOut) {
    const region = e.region?.name ?? `Region ${e.region_id}`;
    const tipo = e.event_type?.name ?? "Evento";
    const desc = e.description ? ` — ${e.description.slice(0, 40)}${e.description.length > 40 ? "…" : ""}` : "";
    return `${tipo} · ${region}${desc}`;
  }

  function reset() {
    setEventId("");
    setRegionId("");
    setMarketProductId("");
    setPrice("");
    setUnit("kg");
    setPlaceRef("");
    setDescription("");
    setError(null);
  }

  async function submit() {
    setError(null);
    if (!eventId && !regionId && !marketProductId) {
      setError("Selecciona una alerta, un mercado o un producto.");
      return;
    }
    try {
      await reportEvent({
        event_id: eventId ? parseInt(eventId, 10) : null,
        region_id: regionId ? parseInt(regionId, 10) : null,
        market_product_id: marketProductId ? parseInt(marketProductId, 10) : null,
        reported_price: price ? parseFloat(price) : null,
        reported_unit: unit || null,
        market_place_reference: placeRef || null,
        description: description || null,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
        reset();
      }, 1400);
    } catch {
      setError("No se pudo enviar el reporte, intenta de nuevo.");
    }
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="Reportar incidente">
      {sent ? (
        <p className="text-tertiary-600 text-sm">Gracias por confirmar, caserito. Tu reporte ayuda a otros.</p>
      ) : (
        <>
          <p className="text-ink/60 text-sm mb-4">
            Reporta una situación en el mercado. Puedes confirmar una alerta activa o hacer un reporte libre.
          </p>

          <Field label="Alerta activa (opcional)">
            <Select value={eventId} onChange={(e) => setEventId(e.target.value)} disabled={loadingEvents}>
              <option value="">
                {loadingEvents ? "Cargando alertas..." : "ninguna / reporte libre"}
              </option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {eventLabel(e)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Mercado o zona">
            <Select value={regionId} onChange={(e) => { setRegionId(e.target.value); setMarketProductId(""); }}>
              <option value="">selecciona un mercado...</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Producto (opcional)">
            <Select value={marketProductId} onChange={(e) => setMarketProductId(e.target.value)}>
              <option value="">selecciona un producto...</option>
              {filteredProducts.map((p) => (
                <option key={p.market_product_id} value={p.market_product_id}>
                  {p.product_name} ({p.unit})
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex gap-3">
            <Field label="Precio que viste (Bs)" className="flex-1">
              <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="ej. 4.20" />
            </Field>
            <Field label="Unidad" className="w-28">
              <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="unidad">unidad</option>
                <option value="arroba">arroba</option>
              </Select>
            </Field>
          </div>

          <Field label="Lugar específico (opcional)">
            <Input
              value={placeRef}
              onChange={(e) => setPlaceRef(e.target.value)}
              placeholder="ej. Puesto 12, pasillo de verduras"
            />
          </Field>

          <Field label="Comentario adicional (opcional)">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej. El precio subió desde esta mañana"
            />
          </Field>

          {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
          <Button onClick={submit} className="w-full">
            Enviar reporte
          </Button>
        </>
      )}
    </Modal>
  );
}
