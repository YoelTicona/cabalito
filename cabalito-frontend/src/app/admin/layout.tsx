"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavSide from "@/layouts/navside";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cabalito_token");
    if (!token) router.push("/login");
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <NavSide />
      <main className="flex-1 overflow-y-auto bg-surface p-6">{children}</main>
    </div>
  );
}
