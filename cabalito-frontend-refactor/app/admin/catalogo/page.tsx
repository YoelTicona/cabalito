"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn, formatBs } from "@/lib/utils";
import {
  createEventType,
  createProduct,
  listEventTypes,
  listProducts,
  listRegions,
  patchEventTypeStatus,
  patchProductStatus,
  updateProduct,
} from "@/lib/api";
import type { EventTypeOut, ProductOut, RegionOut } from "@/lib/types";

export default function CatalogoPage() {
  const [tab, setTab] = useState<"productos" | "tipos">("productos");

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Catalogo</h1>
      <div className="flex gap-1 mb-6 border-b border-ink/10 dark:border-paper/10">
        {(["productos", "tipos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              tab === t ? "border-terracota-600 text-terracota-600" : "border-transparent text-ink/50 dark:text-paper/50"
            )}
          >
            {t === "productos" ? "Productos" : "Tipos de evento"}
          </button>
        ))}
      </div>
      {tab === "productos" ? <ProductsTab /> : <EventTypesTab />}
    </div>
  );
}

function ProductsTab() {
  const [items, setItems] = useState<ProductOut[]>([]);
  const [regions, setRegions] = useState<RegionOut[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [creating, setCreating] = useState(false);

  function refresh() {
    listProducts({ search, page: 1, size: 50 }).then((r) => setItems(r.items)).catch(() => {});
  }

  useEffect(refresh, [search]);
  useEffect(() => {
    listRegions().then(setRegions).catch(() => {});
  }, []);

  async function toggleStatus(id: number) {
    await patchProductStatus(id).catch(() => {});
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nuevo producto
        </Button>
      </div>

      <div className="rounded-xl border border-ink/10 dark:border-paper/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] dark:bg-paper/[0.05] text-left text-ink/50 dark:text-paper/50">
            <tr>
              <th className="px-4 py-2.5 font-medium">nombre</th>
              <th className="px-4 py-2.5 font-medium">origen</th>
              <th className="px-4 py-2.5 font-medium">precio</th>
              <th className="px-4 py-2.5 font-medium">mercado</th>
              <th className="px-4 py-2.5 font-medium">estado</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-ink/10 dark:border-paper/10">
                <td className="px-4 py-2.5">{p.name}</td>
                <td className="px-4 py-2.5 text-ink/60 dark:text-paper/60">{p.origin_region?.name ?? p.origin_region_id}</td>
                <td className="px-4 py-2.5 font-mono">Bs {formatBs(p.current_price)}</td>
                <td className="px-4 py-2.5">
                  <Badge status={p.market_status} />
                </td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleStatus(p.id)}>
                    <Badge status={p.status} />
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setEditing(p)} className="text-oro-600 hover:underline">
                    editar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/40 dark:text-paper/40">
                  no hay productos todavia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductForm open={creating} onClose={() => setCreating(false)} onSaved={refresh} regions={regions} create={createProduct} />
      {editing && (
        <ProductForm
          open
          onClose={() => setEditing(null)}
          onSaved={refresh}
          regions={regions}
          initial={editing}
          create={(payload) => updateProduct(editing.id, payload)}
        />
      )}
    </div>
  );
}

function ProductForm({
  open,
  onClose,
  onSaved,
  regions,
  initial,
  create,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  regions: RegionOut[];
  initial?: ProductOut;
  create: (payload: { name: string; origin_region_id: number; current_price: number; market_status?: string }) => Promise<unknown>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [regionId, setRegionId] = useState(initial?.origin_region_id?.toString() ?? "");
  const [price, setPrice] = useState(initial?.current_price ?? "");
  const [status, setStatus] = useState(initial?.market_status ?? "GREEN");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name || !regionId || !price) {
      setError("Completa nombre, region de origen y precio.");
      return;
    }
    try {
      await create({ name, origin_region_id: parseInt(regionId, 10), current_price: parseFloat(price as string), market_status: status });
      onSaved();
      onClose();
    } catch {
      setError("No se pudo guardar el producto.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar producto" : "Nuevo producto"} side>
      <Field label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Tomate" />
      </Field>
      <Field label="Region de origen">
        <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">selecciona...</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Precio actual (Bs)">
        <Input value={price as string} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="9.50" />
      </Field>
      <Field label="Estado de mercado">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="GREEN">normal</option>
          <option value="YELLOW">alerta</option>
          <option value="RED">crisis</option>
        </Select>
      </Field>
      {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">
        Guardar
      </Button>
    </Modal>
  );
}

function EventTypesTab() {
  const [items, setItems] = useState<EventTypeOut[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    listEventTypes(search).then(setItems).catch(() => {});
  }

  useEffect(refresh, [search]);

  async function add() {
    if (!name.trim()) return;
    try {
      await createEventType(name.trim());
      setName("");
      refresh();
    } catch {
      setError("No se pudo crear el tipo de evento.");
    }
  }

  async function toggleStatus(id: number) {
    await patchEventTypeStatus(id).catch(() => {});
    refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Buscar tipo..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Input
          placeholder="Nuevo tipo, ej. Bloqueo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="max-w-xs"
        />
        <Button size="sm" onClick={add}>
          + Agregar
        </Button>
      </div>
      {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}

      <div className="rounded-xl border border-ink/10 dark:border-paper/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] dark:bg-paper/[0.05] text-left text-ink/50 dark:text-paper/50">
            <tr>
              <th className="px-4 py-2.5 font-medium">nombre</th>
              <th className="px-4 py-2.5 font-medium">estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t border-ink/10 dark:border-paper/10">
                <td className="px-4 py-2.5">{t.name}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleStatus(t.id)}>
                    <Badge status={t.status} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-ink/40 dark:text-paper/40">
                  no hay tipos de evento todavia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
