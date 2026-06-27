"use client";

import { useEffect, useRef, useState } from "react";
import { askCasera } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "casera";
  text: string;
}

interface Props {
  open: boolean;
  productId: number | null;
  productName: string;
  onClose: () => void;
}

export function CaseraChat({ open, productId, productName, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const greetedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !productId || greetedFor.current === productId) return;
    greetedFor.current = productId;
    setMessages([]);
    setLoading(true);
    askCasera(productId, `Hola, el ${productName} esta caro, dame una alternativa o consejo`)
      .then((res) => setMessages([{ role: "casera", text: res.reply }]))
      .catch(() =>
        setMessages([{ role: "casera", text: "No pude conectarme ahorita caserito, pero intenta de nuevo." }])
      )
      .finally(() => setLoading(false));
  }, [open, productId, productName]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!open) return null;

  async function send() {
    if (!input.trim() || !productId || loading) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askCasera(productId, text);
      setMessages((m) => [...m, { role: "casera", text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "casera", text: "Se me corto la senal, intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-noche-800 flex flex-col">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-paper/10 shrink-0">
        <button onClick={onClose} aria-label="volver" className="text-paper/70 text-2xl leading-none">
          ‹
        </button>
        <div className="w-9 h-9 rounded-full bg-oro-600 flex items-center justify-center text-noche-800 font-display">
          C
        </div>
        <div>
          <p className="text-paper text-sm font-medium">La Casera</p>
          <p className="text-paper/40 text-xs">sobre {productName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                m.role === "user" ? "bg-oro-600 text-noche-800" : "bg-paper/10 text-paper"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-paper/10 text-paper/50 text-sm rounded-2xl px-3.5 py-2">escribiendo...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-paper/10 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escribe aqui..."
          className="flex-1 h-11 rounded-full bg-paper/10 px-4 text-sm text-paper placeholder:text-paper/40 outline-none"
        />
        <button
          onClick={send}
          aria-label="enviar"
          className="w-11 h-11 rounded-full bg-oro-600 text-noche-800 flex items-center justify-center shrink-0"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
