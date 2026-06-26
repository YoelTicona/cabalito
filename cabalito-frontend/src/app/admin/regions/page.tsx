import RegionsTable from "@/features/admin-dashboard/RegionsTable";

export default function RegionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Regiones</h1>
        <p className="text-slate-400 text-sm mt-1">Mercados y zonas de impacto en La Paz</p>
      </div>
      <RegionsTable />
    </div>
  );
}
