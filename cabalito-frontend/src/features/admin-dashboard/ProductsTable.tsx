"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Product { id: number; name: string; current_price: number; market_status: string; status: string; origin_region?: { name: string }; }

const MS_COLOR: Record<string, string> = { GREEN: "text-green-400", YELLOW: "text-yellow-400", RED: "text-red-400" };

const EMPTY = { name: "", origin_region_id: 1, current_price: 0, market_status: "GREEN" };

export default function ProductsTable() {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const size = 10;

  const token = typeof window !== "undefined" ? localStorage.getItem("cabalito_token") || "" : "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`${API}/v1/admin/products?${params}`, { headers });
    const data = await res.json();
    setItems(data.items ?? []); setTotal(data.total ?? 0);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (editing) {
      await fetch(`${API}/v1/admin/products/${editing}`, { method: "PUT", headers, body: JSON.stringify(form) });
    } else {
      await fetch(`${API}/v1/admin/products`, { method: "POST", headers, body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); setForm(EMPTY); load();
  }

  async function patchStatus(id: number) {
    await fetch(`${API}/v1/admin/products/${id}/status`, { method: "PATCH", headers });
    load();
  }

  function startEdit(p: Product) {
    setForm({ name: p.name, origin_region_id: 1, current_price: p.current_price, market_status: p.market_status });
    setEditing(p.id); setShowForm(true);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input-field max-w-xs text-sm" placeholder="Buscar producto..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-field max-w-[160px] text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Todos</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY); }} className="btn-primary text-sm">+ Nuevo</button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 mb-5 animate-fade-in">
          <h3 className="font-semibold text-white mb-3">{editing ? "Editar producto" : "Nuevo producto"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field text-sm" placeholder="Nombre" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="input-field text-sm" type="number" placeholder="Precio actual" value={form.current_price} onChange={(e) => setForm((p) => ({ ...p, current_price: Number(e.target.value) }))} />
            <input className="input-field text-sm" type="number" placeholder="ID Región origen" value={form.origin_region_id} onChange={(e) => setForm((p) => ({ ...p, origin_region_id: Number(e.target.value) }))} />
            <select className="input-field text-sm" value={form.market_status} onChange={(e) => setForm((p) => ({ ...p, market_status: e.target.value }))}>
              <option value="GREEN">GREEN</option>
              <option value="YELLOW">YELLOW</option>
              <option value="RED">RED</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={save} className="btn-primary text-sm px-4">Guardar</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost text-sm px-4">Cancelar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Región</th>
              <th className="px-4 py-3 text-left">Precio (Bs)</th>
              <th className="px-4 py-3 text-left">Mercado</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((p) => (
              <tr key={p.id} className="table-row-hover">
                <td className="px-4 py-3 text-slate-400">{p.id}</td>
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 text-slate-300">{p.origin_region?.name ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-white">{p.current_price}</td>
                <td className={`px-4 py-3 font-bold ${MS_COLOR[p.market_status]}`}>{p.market_status}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.status === "ACTIVE" ? "text-green-400" : "text-slate-500"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="btn-ghost text-xs py-1 px-2">Editar</button>
                    <button onClick={() => patchStatus(p.id)} className="btn-ghost text-xs py-1 px-2">{p.status === "ACTIVE" ? "Inactivar" : "Activar"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
        <span>Total: {total} productos</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs py-1 px-3 disabled:opacity-40">← Ant</button>
          <span className="px-3 py-1">Pág {page}</span>
          <button disabled={page * size >= total} onClick={() => setPage(page + 1)} className="btn-ghost text-xs py-1 px-3 disabled:opacity-40">Sig →</button>
        </div>
      </div>
    </div>
  );
}
