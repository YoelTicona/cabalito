"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Region { id: number; name: string; weather_api_location: string; latitude: number; longitude: number; status: string; }

const EMPTY: Omit<Region, "id" | "status"> = { name: "", weather_api_location: "", latitude: 0, longitude: 0 };

export default function RegionsTable() {
  const [items, setItems] = useState<Region[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("cabalito_token") || "" : "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`${API}/v1/admin/regions?${params}`, { headers });
    setItems(await res.json());
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (editing) {
      await fetch(`${API}/v1/admin/regions/${editing}`, { method: "PUT", headers, body: JSON.stringify(form) });
    } else {
      await fetch(`${API}/v1/admin/regions`, { method: "POST", headers, body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); setForm(EMPTY); load();
  }

  async function patchStatus(id: number) {
    await fetch(`${API}/v1/admin/regions/${id}/status`, { method: "PATCH", headers });
    load();
  }

  function startEdit(r: Region) {
    setForm({ name: r.name, weather_api_location: r.weather_api_location, latitude: r.latitude, longitude: r.longitude });
    setEditing(r.id); setShowForm(true);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input-field max-w-xs text-sm" placeholder="Buscar región..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY); }} className="btn-primary text-sm">+ Nueva Región</button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 mb-5 animate-fade-in">
          <h3 className="font-semibold text-white mb-3">{editing ? "Editar región" : "Nueva región"}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(["name", "weather_api_location", "latitude", "longitude"] as const).map((f) => (
              <input key={f} className="input-field text-sm" placeholder={f} type={f === "latitude" || f === "longitude" ? "number" : "text"}
                value={String(form[f])}
                onChange={(e) => setForm((p) => ({ ...p, [f]: f === "latitude" || f === "longitude" ? Number(e.target.value) : e.target.value }))}
              />
            ))}
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
              <th className="px-4 py-3 text-left">Ubicación clima</th>
              <th className="px-4 py-3 text-left">Lat / Lng</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((r) => (
              <tr key={r.id} className="table-row-hover">
                <td className="px-4 py-3 text-slate-400">{r.id}</td>
                <td className="px-4 py-3 text-white">{r.name}</td>
                <td className="px-4 py-3 text-slate-300">{r.weather_api_location}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.latitude}, {r.longitude}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${r.status === "ACTIVE" ? "text-green-400" : "text-slate-500"}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="btn-ghost text-xs py-1 px-2">Editar</button>
                    <button onClick={() => patchStatus(r.id)} className="btn-ghost text-xs py-1 px-2">{r.status === "ACTIVE" ? "Inactivar" : "Activar"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
