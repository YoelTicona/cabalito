"use client";

import { useEffect, useState } from "react";
import { listEvents, listProducts, listRegions } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, products: 0, regions: 0, active: 0 });

  useEffect(() => {
    Promise.all([
      listEvents({ page: 1, size: 1 }),
      listProducts({ page: 1, size: 1 }),
      listRegions(),
      listEvents({ page: 1, size: 50, status: "PENDING" }),
    ])
      .then(([events, products, regions, active]) =>
        setStats({ events: events.total, products: products.total, regions: regions.length, active: active.total })
      )
      .catch(() => {});
  }, []);

  const cards = [
    { label: "eventos totales", value: stats.events },
    { label: "eventos activos", value: stats.active },
    { label: "productos en catalogo", value: stats.products },
    { label: "regiones", value: stats.regions },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Panel de control</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-ink/[0.03] dark:bg-paper/[0.05] p-4">
            <p className="text-xs text-ink/50 dark:text-paper/50 mb-1">{c.label}</p>
            <p className="font-display text-3xl">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-ink/40 dark:text-paper/40 mt-8">
        Usa el menu de la izquierda para gestionar eventos, regiones y el catalogo de productos.
      </p>
    </div>
  );
}
