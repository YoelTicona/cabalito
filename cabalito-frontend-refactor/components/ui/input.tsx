import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full h-10 rounded-lg border border-ink/15 dark:border-paper/15 bg-white dark:bg-ink/40 px-3 text-sm text-ink dark:text-paper placeholder:text-ink/40 dark:placeholder:text-paper/40 focus:border-oro-600 outline-none";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block mb-1.5 text-xs font-medium text-ink/60 dark:text-paper/60">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, props.className)} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(base, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "h-20 py-2 resize-none", props.className)} {...props} />;
}
