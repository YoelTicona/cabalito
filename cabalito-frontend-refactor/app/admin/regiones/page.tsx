"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createRegion, listRegions, patchRegionStatus, updateRegion } from "@/lib/api";
import type { RegionOut } from "@/lib/types";

export default function RegionesPage() {
  const [items, setItems] = useState<RegionOut[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RegionOut | null>(null);
  const [creating, setCreating] = useState(false);

  function refresh() {
    listRegions(search).then(setItems).catch(() => {});
  }

  useEffect(refresh, [search]);

  async function toggleStatus(id: number) {
    await patchRegionStatus(id).catch(() => {});
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Regiones</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Nueva region
        </Button>
      </div>

      <Input
        placeholder="Buscar region..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-4"
      />

      <div className="rounded-xl border border-ink/10 dark:border-paper/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] dark:bg-paper/[0.05] text-left text-ink/50 dark:text-paper/50">
            <tr>
              <th className="px-4 py-2.5 font-medium">nombre</th>
              <th className="px-4 py-2.5 font-medium">ubicacion clima</th>
              <th className="px-4 py-2.5 font-medium">coordenadas</th>
              <th className="px-4 py-2.5 font-medium">estado</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-ink/10 dark:border-paper/10">
                <td className="px-4 py-2.5">{r.name}</td>
                <td className="px-4 py-2.5 text-ink/60 dark:text-paper/60">{r.weather_api_location ?? "-"}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink/60 dark:text-paper/60">
                  {r.latitude && r.longitude ? `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}` : "-"}
                </td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleStatus(r.id)}>
                    <Badge status={r.status} />
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setEditing(r)} className="text-oro-600 hover:underline">
                    editar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40 dark:text-paper/40">
                  no hay regiones todavia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RegionForm
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refresh}
        create={createRegion}
      />
      {editing && (
        <RegionForm
          open
          onClose={() => setEditing(null)}
          onSaved={refresh}
          initial={editing}
          create={(payload) => updateRegion(editing.id, payload)}
        />
      )}
    </div>
  );
}

function RegionForm({
  open,
  onClose,
  onSaved,
  initial,
  create,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: RegionOut;
  create: (payload: { name: string; weather_api_location?: string; latitude?: number; longitude?: number }) => Promise<unknown>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [weather, setWeather] = useState(initial?.weather_api_location ?? "");
  const [lat, setLat] = useState(initial?.latitude?.toString() ?? "");
  const [lng, setLng] = useState(initial?.longitude?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }
    try {
      await create({
        name,
        weather_api_location: weather || undefined,
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined,
      });
      onSaved();
      onClose();
    } catch {
      setError("No se pudo guardar la region.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar region" : "Nueva region"} side>
      <Field label="Nombre">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Mercado Rodriguez" />
      </Field>
      <Field label="Ubicacion para clima (opcional)">
        <Input value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="ej. La Paz,BO" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitud">
          <Input value={lat} onChange={(e) => setLat(e.target.value)} type="number" placeholder="-16.500" />
        </Field>
        <Field label="Longitud">
          <Input value={lng} onChange={(e) => setLng(e.target.value)} type="number" placeholder="-68.119" />
        </Field>
      </div>
      {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">
        Guardar
      </Button>
    </Modal>
  );
}
