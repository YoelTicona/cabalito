"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  createEvent,
  forceTrigger,
  listEventTypes,
  listEvents,
  listRegions,
  patchEventStatus,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { EventOut, EventTypeOut, RegionOut } from "@/lib/types";

export default function EventosPage() {
  const [items, setItems] = useState<EventOut[]>([]);
  const [search, setSearch] = useState("");
  const [regions, setRegions] = useState<RegionOut[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeOut[]>([]);
  const [viewing, setViewing] = useState<EventOut | null>(null);
  const [creating, setCreating] = useState(false);
  const [triggering, setTriggering] = useState(false);

  function refresh() {
    listEvents({ search, page: 1, size: 50 }).then((r) => setItems(r.items)).catch(() => {});
  }

  useEffect(refresh, [search]);
  useEffect(() => {
    listRegions().then(setRegions).catch(() => {});
    listEventTypes().then(setEventTypes).catch(() => {});
  }, []);

  async function toggleStatus(id: number) {
    await patchEventStatus(id).catch(() => {});
    refresh();
  }

  async function force() {
    if (items.length === 0) return;
    setTriggering(true);
    try {
      await forceTrigger(items[0].id);
      refresh();
    } catch {
      // demo button: si falla, no rompemos el panel
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="font-display text-2xl">Eventos</h1>
        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={force} disabled={triggering || items.length === 0}>
            ⚡ Forzar crisis (demo)
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            + Nuevo evento
          </Button>
        </div>
      </div>

      <Input
        placeholder="Buscar evento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs mb-4"
      />

      <div className="rounded-xl border border-ink/10 dark:border-paper/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] dark:bg-paper/[0.05] text-left text-ink/50 dark:text-paper/50">
            <tr>
              <th className="px-4 py-2.5 font-medium">region</th>
              <th className="px-4 py-2.5 font-medium">tipo</th>
              <th className="px-4 py-2.5 font-medium">severidad</th>
              <th className="px-4 py-2.5 font-medium">reportes</th>
              <th className="px-4 py-2.5 font-medium">estado</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-t border-ink/10 dark:border-paper/10">
                <td className="px-4 py-2.5">{e.region?.name ?? e.region_id}</td>
                <td className="px-4 py-2.5">{e.event_type?.name ?? e.event_type_id}</td>
                <td className="px-4 py-2.5 capitalize">{e.severity.toLowerCase()}</td>
                <td className="px-4 py-2.5">{e.report_count}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleStatus(e.id)}>
                    <Badge status={e.status} />
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setViewing(e)} className="text-oro-600 hover:underline">
                    ver
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/40 dark:text-paper/40">
                  no hay eventos todavia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={`Evento #${viewing?.id ?? ""}`}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <Row label="Region" value={viewing.region?.name ?? String(viewing.region_id)} />
            <Row label="Tipo" value={viewing.event_type?.name ?? String(viewing.event_type_id)} />
            <Row label="Severidad" value={viewing.severity} />
            <Row label="Reportes" value={String(viewing.report_count)} />
            <Row label="Estado" value={viewing.status} />
            {viewing.description && <Row label="Descripcion" value={viewing.description} />}
            {viewing.ai_explanation && <Row label="Explicacion IA" value={viewing.ai_explanation} />}
          </div>
        )}
      </Modal>

      <CreateEventModal
        open={creating}
        onClose={() => setCreating(false)}
        regions={regions}
        eventTypes={eventTypes}
        onCreated={refresh}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/10 dark:border-paper/10 pb-2">
      <span className="text-ink/50 dark:text-paper/50">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function CreateEventModal({
  open,
  onClose,
  regions,
  eventTypes,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  regions: RegionOut[];
  eventTypes: EventTypeOut[];
  onCreated: () => void;
}) {
  const [regionId, setRegionId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!regionId || !typeId) {
      setError("Elige region y tipo de evento.");
      return;
    }
    try {
      await createEvent({
        region_id: parseInt(regionId, 10),
        event_type_id: parseInt(typeId, 10),
        severity,
        description: description || undefined,
      });
      onCreated();
      onClose();
      setRegionId("");
      setTypeId("");
      setDescription("");
    } catch {
      setError("No se pudo crear el evento.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo evento" side>
      <Field label="Region">
        <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">selecciona...</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Tipo de evento">
        <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          <option value="">selecciona...</option>
          {eventTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Severidad">
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="LOW">baja</option>
          <option value="MEDIUM">media</option>
          <option value="HIGH">alta</option>
        </Select>
      </Field>
      <Field label="Descripcion (opcional)">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">
        Crear evento
      </Button>
    </Modal>
  );
}
