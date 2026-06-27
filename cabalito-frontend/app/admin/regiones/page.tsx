"use client";

import { useEffect, useState } from "react";
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
import { Field, Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { StatusSwitch } from "@/components/ui/switch";
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

      <DataTableToolbar>
        <SearchInput
          placeholder="Buscar region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </DataTableToolbar>

      <DataTable>
        <table className="w-full">
          <DataTableHead
            columns={[
              { header: "nombre" },
              { header: "ubicacion clima" },
              { header: "coordenadas" },
              { header: "estado" },
              { header: "", className: "text-right" },
            ]}
          />
          <tbody>
            {items.map((r) => (
              <DataTableRow key={r.id}>
                <DataTableCell className="font-medium">{r.name}</DataTableCell>
                <DataTableCell className="text-ink/60 dark:text-paper/60">
                  {r.weather_api_location ?? "-"}
                </DataTableCell>
                <DataTableCell className="font-mono text-xs text-ink/60 dark:text-paper/60">
                  {r.latitude && r.longitude ? `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}` : "-"}
                </DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={r.status} onToggle={() => toggleStatus(r.id)} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <ActionLink onClick={() => setEditing(r)}>editar</ActionLink>
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={5} message="no hay regiones todavia" />}
          </tbody>
        </table>
      </DataTable>

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
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">
        Guardar
      </Button>
    </Modal>
  );
}
