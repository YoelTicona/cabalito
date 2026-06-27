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
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { StatusSwitch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import {
  createEvent,
  forceTrigger,
  listEventTypes,
  listEvents,
  listRegions,
  patchEventStatus,
} from "@/lib/api";
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

      <DataTableToolbar>
        <SearchInput
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </DataTableToolbar>

      <DataTable>
        <table className="w-full">
          <DataTableHead
            columns={[
              { header: "region" },
              { header: "tipo" },
              { header: "severidad" },
              { header: "reportes" },
              { header: "estado" },
              { header: "", className: "text-right" },
            ]}
          />
          <tbody>
            {items.map((e) => (
              <DataTableRow key={e.id}>
                <DataTableCell>{e.region?.name ?? e.region_id}</DataTableCell>
                <DataTableCell>{e.event_type?.name ?? e.event_type_id}</DataTableCell>
                <DataTableCell className="capitalize">{e.severity.toLowerCase()}</DataTableCell>
                <DataTableCell>{e.report_count}</DataTableCell>
                <DataTableCell>
                  <StatusSwitch status={e.status} onToggle={() => toggleStatus(e.id)} />
                </DataTableCell>
                <DataTableCell className="text-right">
                  <ActionLink onClick={() => setViewing(e)}>ver</ActionLink>
                </DataTableCell>
              </DataTableRow>
            ))}
            {items.length === 0 && <DataTableEmpty colSpan={6} message="no hay eventos todavia" />}
          </tbody>
        </table>
      </DataTable>

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
      {error && <p className="text-primary-600 text-sm mb-3">{error}</p>}
      <Button onClick={submit} className="w-full">
        Crear evento
      </Button>
    </Modal>
  );
}
