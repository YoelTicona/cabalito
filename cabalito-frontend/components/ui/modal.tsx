"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: boolean;
}

export function Modal({ open, onClose, title, children, side }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative w-full bg-paper dark:bg-noche-800 text-ink dark:text-paper shadow-xl",
          side
            ? "sm:max-w-sm sm:h-full sm:ml-auto rounded-t-2xl sm:rounded-none"
            : "sm:max-w-md rounded-t-2xl sm:rounded-2xl"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10 dark:border-paper/10">
          <h2 className="font-display text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-ink/5 dark:hover:bg-paper/10"
          >
            ×
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
