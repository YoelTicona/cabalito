import ProductsTable from "@/features/admin-dashboard/ProductsTable";

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <p className="text-slate-400 text-sm mt-1">Canasta familiar y estados de mercado</p>
      </div>
      <ProductsTable />
    </div>
  );
}
