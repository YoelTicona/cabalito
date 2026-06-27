"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setToken(res.token);
      router.push("/admin");
    } catch {
      setError("Usuario o contrasena incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-noche-800 text-paper flex flex-col items-center justify-center px-6 relative">
      <Link
        href="/"
        className="absolute top-5 left-5 md:top-8 md:left-8 inline-flex items-center gap-2 h-10 px-4 rounded-full border border-paper/20 text-paper/80 text-sm font-medium hover:bg-paper/10 transition-colors"
      >
        ← Volver
      </Link>

      <Link href="/" className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/images/logo_cabalito_claro.png"
          alt="Cabalito"
          width={64}
          height={64}
          className="rounded-2xl"
        />
        <span className="font-display text-2xl">Cabalito</span>
      </Link>

      <div className="w-full max-w-sm bg-paper text-ink rounded-2xl p-6 shadow-xl">
        <h1 className="font-display text-xl mb-1">Acceder al panel</h1>
        <p className="text-ink/50 text-sm mb-6">Solo para el equipo de Cabalito.</p>

        <Field label="Usuario">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field label="Contrasena">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        {error && (
          <div className="mb-4 rounded-xl bg-terracota-50 border border-terracota-200 px-4 py-3">
            <p className="text-terracota-800 text-sm">{error}</p>
            <Link
              href="/"
              className="inline-flex mt-2 text-sm text-terracota-600 font-medium hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </main>
  );
}
