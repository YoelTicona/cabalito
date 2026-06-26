"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Product {
  id: number;
  name: string;
  market_status: string;
}

interface Message {
  role: "user" | "ai";
  text: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ChatBot({ product, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greet = async () => {
      const autoMsg = `Hola Casera! El precio de ${product.name} está muy alto hoy. ¿Qué alternativas económicas me recomiendas?`;
      setMessages([{ role: "user", text: autoMsg }]);
      setLoading(true);
      try {
        const res = await fetch(`${API}/v1/chat/casera`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, userMessage: autoMsg }),
        });
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } catch {
        setMessages((prev) => [...prev, { role: "ai", text: "Ups, no pude conectarme. Intenta de nuevo." }]);
      } finally {
        setLoading(false);
      }
    };
    greet();
  }, [product]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/v1/chat/casera`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, userMessage: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Error de conexión." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1001] animate-slide-up">
      <div className="bg-card border-t border-border rounded-t-3xl flex flex-col" style={{ height: "72vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
              👩‍🍳
            </div>
            <div>
              <p className="font-bold text-white text-sm">La Casera IA</p>
              <p className="text-xs text-brand-400">● En línea · ahorrando contigo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl px-2">✕</button>
        </div>

        {/* Context chip */}
        <div className="px-5 pt-3">
          <span className="text-xs bg-surface border border-border text-slate-400 px-3 py-1 rounded-full">
            Consultando: {product.name}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                  👩‍🍳
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-surface border border-border text-slate-200 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm mr-2">👩‍🍳</div>
              <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="px-5 pb-5 pt-2 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a La Casera..."
            className="input-field flex-1 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-2.5 disabled:opacity-40"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
