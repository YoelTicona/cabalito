"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Event {
  id: number;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  report_count: number;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  ai_explanation: string | null;
  region?: { name: string };
  event_type?: { name: string };
}

const SEV_COLOR: Record<string, string> = { LOW: "text-green-400", MEDIUM: "text-yellow-400", HIGH: "text-red-400" };
const ST_COLOR: Record<string, string> = { PENDING: "text-yellow-400", ACTIVE: "text-green-400", INACTIVE: "text-slate-500" };

export default function EventsTable() {
  const [items, setItems] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Event | null>(null);
  const [forceId, setForceId] = useState<number | null>(null);
  const [forceMsg, setForceMsg] = useState("");
  const size = 10;

  const token = typeof window !== "undefined" ? localStorage.getItem("cabalito_token") || "" : "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`${API}/v1/admin/events?${params}`, { headers });
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  async function patchStatus(id: number) {
    await fetch(`${API}/v1/admin/events/${id}/status`, { method: "PATCH", headers });
    load();
  }

  async function forceEvent(id: number) {
    const res = await fetch(`${API}/v1/admin/events/trigger-force`, {
      method: "POST",
      headers,
      body: JSON.stringify({ event_id: id }),
    });
    const data = await res.json();
    setForceMsg(data.ai_explanation ?? "Evento activado");
    setForceId(id);
    load();
  }

  async function viewDetail(id: number) {
    const res = await fetch(`${API}/v1/admin/events/${id}`, { headers });
    const data = await res.json();
    setDetail(data);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="input-field max-w-xs text-sm"
          placeholder="Buscar por descripción..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input-field max-w-[160px] text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Región</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Severidad</th>
              <th className="px-4 py-3 text-left">Reportes</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((ev) => (
              <tr key={ev.id} className="table-row-hover">
                <td className="px-4 py-3 text-slate-400">{ev.id}</td>
                <td className="px-4 py-3 text-white max-w-xs truncate">{ev.description}</td>
                <td className="px-4 py-3 text-slate-300">{ev.region?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{ev.event_type?.name ?? "—"}</td>
                <td className={`px-4 py-3 font-semibold ${SEV_COLOR[ev.severity]}`}>{ev.severity}</td>
                <td className="px-4 py-3 text-slate-300">{ev.report_count}</td>
                <td className={`px-4 py-3 font-semibold ${ST_COLOR[ev.status]}`}>{ev.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => viewDetail(ev.id)} className="btn-ghost text-xs py-1 px-2">Ver</button>
                    <button onClick={() => patchStatus(ev.id)} className="btn-ghost text-xs py-1 px-2">
                      {ev.status === "ACTIVE" ? "Inactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => forceEvent(ev.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs py-1 px-2 rounded-lg transition-all"
                    >
                      💥 Forzar Caos
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
        <span>Total: {total} eventos</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost text-xs py-1 px-3 disabled:opacity-40">← Ant</button>
          <span className="px-3 py-1">Pág {page}</span>
          <button disabled={page * size >= total} onClick={() => setPage(page + 1)} className="btn-ghost text-xs py-1 px-3 disabled:opacity-40">Sig →</button>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Evento #{detail.id}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-400">Descripción</dt><dd className="text-white mt-1">{detail.description}</dd></div>
              <div><dt className="text-slate-400">Región</dt><dd className="text-white">{detail.region?.name}</dd></div>
              <div><dt className="text-slate-400">Tipo</dt><dd className="text-white">{detail.event_type?.name}</dd></div>
              <div><dt className="text-slate-400">Explicación IA</dt><dd className="text-brand-400 mt-1 italic">{detail.ai_explanation ?? "Sin explicación aún"}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {/* Force chaos modal */}
      {forceId && forceMsg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setForceId(null); setForceMsg(""); }}>
          <div className="bg-card rounded-2xl border border-red-500/30 p-6 max-w-lg w-full animate-fade-in text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl mb-4">💥</p>
            <h3 className="text-xl font-bold text-red-400 mb-3">¡Caos Activado!</h3>
            <p className="text-slate-300 text-sm">{forceMsg}</p>
            <button onClick={() => { setForceId(null); setForceMsg(""); }} className="btn-primary mt-5 px-6">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}
