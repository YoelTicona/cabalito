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
  createMarketProduct,
  createProduct,
  listEventTypes,
  listMarketProducts,
  listProducts,
  listRegions,
  patchEventTypeStatus,
  patchMarketProductStatus,
  patchProductStatus,
  updateMarketProduct,
  updateProduct,
} from "@/lib/api";
import type { EventTypeOut, MarketProductOut, ProductOut, RegionOut } from "@/lib/types";

type Tab = "productos" | "mercados" | "tipos";

export default function CatalogoPage() {
  const [tab, setTab] = useState<Tab>("productos");

  const tabs: { key: Tab; label: string }[] = [
    { key: "productos", label: "Productos" },
    { key: "mercados", label: "Precios por mercado" },
    { key: "tipos", label: "Tipos de evento" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Catálogo</h1>
      <div className="inline-flex p-1 rounded-full bg-primary-50 dark:bg-paper/5 border border-primary-100 dark:border-paper/10 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-full transition-all duration-200",
              tab === t.key
                ? "bg-primary-600 text-white shadow-sm"
                : "text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "productos" && <ProductsTab />}
      {tab === "mercados" && <MarketProductsTab />}
      {tab === "tipos" && <EventTypesTab />}
    </div>
  );
}

// ---- Tab: Catálogo de Productos ----
function ProductsTab() {
  const [items, setItems] = useState<ProductOut[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductOut | null>(null);
  const [creating, setCreating] = useState(false);

  function refresh() {
    listProducts({ search, page: 1, size: 100 }).then((r) => setItems(r.items)).catch(() => {});
  }

  useEffect(refresh, [search]);

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
              { header: "unidad" },
              { header: "categoría" },
              { header: "estado" },
              { header: "", className: "text-right" },
            ]}
          />
          <tbody>
            {items.map((p) => (
              <DataTableRow key={p.id}>
                <DataTableCell className="font-medium">{p.name}</DataTableCell>
                <DataTableCell className="text-ink/60 dark:text-paper/60">{p.unit}</DataTableCell>
                <DataTableCell className="text-ink/60 dark:text-paper/60">{p.category ?? "—"}</DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={p.status} onToggle={() => toggleStatus(p.id)} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <ActionLink onClick={() => setEditing(p)}>editar</ActionLink>
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={5} message="no hay productos todavía" />}
          </tbody>
        </table>
      </DataTable>

      <ProductForm open={creating} onClose={() => setCreating(false)} onSaved={refresh} save={createProduct} />
      {editing && (
        <ProductForm
          open
          onClose={() => setEditing(null)}
          onSaved={refresh}
          initial={editing}
          save={(payload) => updateProduct(editing.id, payload)}
        />
      )}
    </div>
  );
}

function ProductForm({
  open,
  onClose,
  onSaved,
  initial,
  save,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: ProductOut;
  save: (payload: { name: string; unit?: string; category?: string }) => Promise<unknown>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "kg");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    try {
      await save({ name: name.trim(), unit: unit || "kg", category: category || undefined });
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
      <Field label="Unidad">
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="kg">kg</option>
          <option value="L">L</option>
          <option value="unidad">unidad</option>
          <option value="arroba">arroba</option>
        </Select>
      </Field>
      <Field label="Categoría (opcional)">
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ej. Verdura" />
      </Field>
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">Guardar</Button>
    </Modal>
  );
}

// ---- Tab: Precios por Mercado ----
function MarketProductsTab() {
  const [items, setItems] = useState<MarketProductOut[]>([]);
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [regions, setRegions] = useState<RegionOut[]>([]);
  const [filterRegion, setFilterRegion] = useState("");
  const [editing, setEditing] = useState<MarketProductOut | null>(null);
  const [creating, setCreating] = useState(false);

  function refresh() {
    listMarketProducts({
      region_id: filterRegion ? parseInt(filterRegion, 10) : undefined,
      size: 100,
    })
      .then((r) => setItems(r.items))
      .catch(() => {});
  }

  useEffect(refresh, [filterRegion]);

  useEffect(() => {
    listProducts({ size: 100 }).then((r) => setProducts(r.items)).catch(() => {});
    listRegions().then(setRegions).catch(() => {});
  }, []);

  async function toggleStatus(id: number) {
    await patchMarketProductStatus(id).catch(() => {});
    refresh();
  }

  return (
    <div>
      <DataTableToolbar>
        <Select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="max-w-xs"
        >
          <option value="">Todos los mercados</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Asignar producto a mercado
        </Button>
      </DataTableToolbar>

      <DataTable>
        <table className="w-full">
          <DataTableHead
            columns={[
              { header: "producto" },
              { header: "mercado" },
              { header: "precio" },
              { header: "estado mercado" },
              { header: "activo" },
              { header: "", className: "text-right" },
            ]}
          />
          <tbody>
            {items.map((mp) => (
              <DataTableRow key={mp.id}>
                <DataTableCell className="font-medium">
                  {mp.product?.name ?? mp.product_id}
                  <span className="text-ink/40 dark:text-paper/40 font-normal ml-1">
                    ({mp.product?.unit ?? "—"})
                  </span>
                </DataTableCell>
                <DataTableCell className="text-ink/60 dark:text-paper/60">
                  {mp.region?.name ?? mp.region_id}
                </DataTableCell>
                <DataTableCell className="font-mono">Bs {formatBs(mp.current_price)}</DataTableCell>
                <DataTableCell>
                  <Badge status={mp.market_status} />
                </DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={mp.status} onToggle={() => toggleStatus(mp.id)} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <ActionLink onClick={() => setEditing(mp)}>editar</ActionLink>
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={6} message="no hay relaciones producto-mercado todavía" />}
          </tbody>
        </table>
      </DataTable>

      <MarketProductForm
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refresh}
        products={products}
        regions={regions}
        save={createMarketProduct}
      />
      {editing && (
        <MarketProductForm
          open
          onClose={() => setEditing(null)}
          onSaved={refresh}
          products={products}
          regions={regions}
          initial={editing}
          save={(payload) => updateMarketProduct(editing.id, payload)}
        />
      )}
    </div>
  );
}

function MarketProductForm({
  open,
  onClose,
  onSaved,
  products,
  regions,
  initial,
  save,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  products: ProductOut[];
  regions: RegionOut[];
  initial?: MarketProductOut;
  save: (payload: {
    region_id: number;
    product_id: number;
    current_price: number;
    market_status?: string;
  }) => Promise<unknown>;
}) {
  const [productId, setProductId] = useState(initial?.product_id?.toString() ?? "");
  const [regionId, setRegionId] = useState(initial?.region_id?.toString() ?? "");
  const [price, setPrice] = useState(initial?.current_price?.toString() ?? "");
  const [marketStatus, setMarketStatus] = useState(initial?.market_status ?? "GREEN");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!productId || !regionId || !price) {
      setError("Producto, mercado y precio son obligatorios.");
      return;
    }
    try {
      await save({
        region_id: parseInt(regionId, 10),
        product_id: parseInt(productId, 10),
        current_price: parseFloat(price),
        market_status: marketStatus,
      });
      onSaved();
      onClose();
    } catch {
      setError("No se pudo guardar.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar precio de mercado" : "Asignar producto a mercado"} side>
      <Field label="Producto">
        <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">selecciona un producto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
          ))}
        </Select>
      </Field>
      <Field label="Mercado">
        <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">selecciona un mercado...</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Precio actual (Bs)">
        <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="ej. 3.50" />
      </Field>
      <Field label="Estado de mercado">
        <Select value={marketStatus} onChange={(e) => setMarketStatus(e.target.value)}>
          <option value="GREEN">Normal</option>
          <option value="YELLOW">En alerta</option>
          <option value="RED">En crisis</option>
        </Select>
      </Field>
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">Guardar</Button>
    </Modal>
  );
}

// ---- Tab: Tipos de Evento ----
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
          <Button size="sm" onClick={add}>+ Agregar</Button>
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
            {items.length === 0 && <DataTableEmpty colSpan={2} message="no hay tipos de evento todavía" />}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
