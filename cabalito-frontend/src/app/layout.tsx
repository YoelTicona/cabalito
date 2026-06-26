import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cabalito — Radar de Precios",
  description: "Validador ciudadano de precios con IA para La Paz, Bolivia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-surface">{children}</body>
    </html>
  );
}
