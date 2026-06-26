import EventTypesTable from "@/features/admin-dashboard/EventTypesTable";

export default function EventTypesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tipos de Evento</h1>
        <p className="text-slate-400 text-sm mt-1">Bloqueos, heladas, paros y más</p>
      </div>
      <EventTypesTable />
    </div>
  );
}
