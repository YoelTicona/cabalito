"use client";

import { useState } from "react";
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
    <main className="min-h-screen bg-noche-800 text-paper flex flex-col items-center justify-center px-6">
      <Link href="/" className="font-display text-2xl mb-10">
        Cabalito
      </Link>
      <div className="w-full max-w-sm bg-paper text-ink rounded-2xl p-6">
        <h1 className="font-display text-xl mb-1">Acceder al panel</h1>
        <p className="text-ink/50 text-sm mb-6">Solo para el equipo de Cabalito.</p>

        <Field label="Usuario">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field label="Contrasena">
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" onKeyDown={(e) => e.key === "Enter" && submit()} />
        </Field>

        {error && <p className="text-terracota-600 text-sm mb-3">{error}</p>}

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </main>
  );
}
