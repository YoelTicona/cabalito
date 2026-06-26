"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface EventType { id: number; name: string; status: string; }

export default function EventTypesTable() {
  const [items, setItems] = useState<EventType[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("cabalito_token") || "" : "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`${API}/v1/admin/event-types?${params}`, { headers });
    setItems(await res.json());
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!newName.trim()) return;
    await fetch(`${API}/v1/admin/event-types`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    load();
  }

  async function patchStatus(id: number) {
    await fetch(`${API}/v1/admin/event-types/${id}/status`, { method: "PATCH", headers });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input-field max-w-xs text-sm" placeholder="Buscar tipo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input className="input-field flex-1 text-sm" placeholder="Nuevo tipo de evento" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={create} className="btn-primary text-sm px-4">+ Crear</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((et) => (
              <tr key={et.id} className="table-row-hover">
                <td className="px-4 py-3 text-slate-400">{et.id}</td>
                <td className="px-4 py-3 text-white">{et.name}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${et.status === "ACTIVE" ? "text-green-400" : "text-slate-500"}`}>{et.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => patchStatus(et.id)} className="btn-ghost text-xs py-1 px-3">
                    {et.status === "ACTIVE" ? "Inactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
