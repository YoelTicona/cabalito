import EventsTable from "@/features/admin-dashboard/EventsTable";

export default function EventsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Eventos</h1>
        <p className="text-slate-400 text-sm mt-1">Gestiona eventos ciudadanos y activa el Botón del Caos</p>
      </div>
      <EventsTable />
    </div>
  );
}
