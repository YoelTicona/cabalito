"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ActionLink,
  DataTable,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableToolbar,
} from "@/components/ui/data-table";
import { Field, Input, Select } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { StatusSwitch } from "@/components/ui/switch";
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
      <div className="inline-flex p-1 rounded-full bg-primary-50 dark:bg-paper/5 border border-primary-100 dark:border-paper/10 mb-6">
        {(["productos", "tipos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-full transition-all duration-200",
              tab === t
                ? "bg-primary-600 text-white shadow-sm"
                : "text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper"
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
      <DataTableToolbar>
        <SearchInput
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nuevo producto
        </Button>
      </DataTableToolbar>

      <DataTable>
        <table className="w-full">
          <DataTableHead
            columns={[
              { header: "nombre" },
              { header: "origen" },
              { header: "precio" },
              { header: "mercado" },
              { header: "estado" },
              { header: "", className: "text-right" },
            ]}
          />
          <tbody>
            {items.map((p) => (
              <DataTableRow key={p.id}>
                <DataTableCell className="font-medium">{p.name}</DataTableCell>
                <DataTableCell className="text-ink/60 dark:text-paper/60">
                  {p.origin_region?.name ?? p.origin_region_id}
                </DataTableCell>
                <DataTableCell className="font-mono">Bs {formatBs(p.current_price)}</DataTableCell>
                <DataTableCell>
                  <Badge status={p.market_status} />
                </DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={p.status} onToggle={() => toggleStatus(p.id)} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <ActionLink onClick={() => setEditing(p)}>editar</ActionLink>
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={6} message="no hay productos todavia" />}
          </tbody>
        </table>
      </DataTable>

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
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
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
      <DataTableToolbar>
        <SearchInput
          placeholder="Buscar tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs"
        />
        <div className="flex items-center gap-2 flex-1 justify-end">
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
      </DataTableToolbar>
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}

      <DataTable>
        <table className="w-full">
          <DataTableHead columns={[{ header: "nombre" }, { header: "estado" }]} />
          <tbody>
            {items.map((t) => (
              <DataTableRow key={t.id}>
                <DataTableCell className="font-medium">{t.name}</DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={t.status} onToggle={() => toggleStatus(t.id)} />
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={2} message="no hay tipos de evento todavia" />}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
