"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RadarMap } from "@/components/radar/radar-map";
import { CaseraChat } from "@/components/radar/casera-chat";
import { Sparkline } from "@/components/radar/sparkline";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { getProductHistory, getRadar, reportEvent } from "@/lib/api";
import { formatBs } from "@/lib/utils";
import type { PriceHistoryOut, RadarProduct } from "@/lib/types";

export default function RadarPage() {
  const [products, setProducts] = useState<RadarProduct[]>([]);
  const [selected, setSelected] = useState<RadarProduct | null>(null);
  const [history, setHistory] = useState<PriceHistoryOut[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getRadar().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    getProductHistory(selected.id).then(setHistory).catch(() => setHistory([]));
  }, [selected]);

  const crisisCount = useMemo(() => products.filter((p) => p.market_status === "RED").length, [products]);
  const crisisNames = useMemo(
    () => products.filter((p) => p.market_status === "RED").slice(0, 3).map((p) => p.name),
    [products]
  );

  function openCasera() {
    if (!selected) {
      setNotice("Toca un producto en el mapa primero, caserito.");
      setTimeout(() => setNotice(null), 2200);
      return;
    }
    setChatOpen(true);
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-noche-800">
      <RadarMap products={products} selectedId={selected?.id ?? null} onSelect={setSelected} />

      {crisisCount > 0 && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="rounded-2xl bg-noche-800/70 backdrop-blur-md border border-paper/10 px-4 py-3 flex items-start gap-3">
            <span className="text-terracota-400 text-lg leading-none mt-0.5">●</span>
            <p className="text-paper text-sm leading-snug">
              <span className="font-medium">{crisisCount} producto{crisisCount > 1 ? "s" : ""} en crisis:</span>{" "}
              {crisisNames.join(", ")}
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div className="absolute bottom-24 left-4 right-4 z-20 text-center">
          <span className="inline-block bg-paper text-ink text-sm rounded-full px-4 py-2 shadow">{notice}</span>
        </div>
      )}

      <button
        onClick={() => setReportOpen(true)}
        aria-label="reportar incidente"
        className="absolute right-4 bottom-24 z-10 w-14 h-14 rounded-full bg-terracota-600 text-white text-xl shadow-lg flex items-center justify-center"
      >
        📢
      </button>

      {selected && (
        <div className="absolute bottom-16 left-0 right-0 z-10 bg-paper rounded-t-2xl px-5 pt-4 pb-5 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <p className="text-ink/60 text-xs">{selected.region_name ?? "La Paz"}</p>
            <button onClick={() => setSelected(null)} aria-label="cerrar" className="text-ink/40 text-lg leading-none">
              ×
            </button>
          </div>
          <h2 className="font-display text-xl text-ink mb-1">{selected.name}</h2>
          <p
            className={
              selected.market_status === "RED"
                ? "text-terracota-600 text-3xl font-display"
                : selected.market_status === "YELLOW"
                ? "text-oro-600 text-3xl font-display"
                : "text-mercado-600 text-3xl font-display"
            }
          >
            Bs {formatBs(selected.current_price)}
          </p>
          <div className="mt-2">
            <Sparkline data={history} />
          </div>
          <Button onClick={openCasera} className="w-full mt-3" size="md">
            Preguntar alternativas a La Casera
          </Button>
        </div>
      )}

      <nav className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-noche-800 border-t border-paper/10 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-paper/50 text-[11px]">
          <span className="text-lg leading-none">⌂</span>
          inicio
        </Link>
        <span className="flex flex-col items-center gap-0.5 text-oro-600 text-[11px]">
          <span className="text-lg leading-none">◎</span>
          radar
        </span>
        <button onClick={openCasera} className="flex flex-col items-center gap-0.5 text-paper/50 text-[11px]">
          <span className="text-lg leading-none">💬</span>
          casera
        </button>
      </nav>

      <CaseraChat
        open={chatOpen}
        productId={selected?.id ?? null}
        productName={selected?.name ?? ""}
        onClose={() => setChatOpen(false)}
      />

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} products={products} />
    </main>
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
  const [eventId, setEventId] = useState("");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!eventId) {
      setError("Necesitas el ID de la alerta que quieres confirmar.");
      return;
    }
    try {
      await reportEvent({
        event_id: parseInt(eventId, 10),
        product_id: productId ? parseInt(productId, 10) : undefined,
        reported_price: price ? parseFloat(price) : undefined,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
        setEventId("");
        setProductId("");
        setPrice("");
      }, 1400);
    } catch {
      setError("No se pudo enviar el reporte, intenta de nuevo.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reportar incidente">
      {sent ? (
        <p className="text-mercado-600 text-sm">Gracias por confirmar, caserito. Tu reporte ayuda a otros.</p>
      ) : (
        <>
          <p className="text-ink/60 text-sm mb-4">
            Confirma una alerta activa que viste en el mercado. El ID de la alerta lo puede compartir el equipo de
            Cabalito en el lugar del evento.
          </p>
          <Field label="ID de la alerta">
            <Input value={eventId} onChange={(e) => setEventId(e.target.value)} type="number" placeholder="ej. 4" />
          </Field>
          <Field label="Producto (opcional)">
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">selecciona...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Precio que viste (opcional)">
            <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="ej. 9.50" />
          </Field>
          {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}
          <Button onClick={submit} className="w-full">
            Enviar reporte
          </Button>
        </>
      )}
    </Modal>
  );
}
