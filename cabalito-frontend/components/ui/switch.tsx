"use client";

import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  pending?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled, pending, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? (checked ? "Activo" : "Inactivo")}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-ink",
        disabled && "opacity-50 cursor-not-allowed",
        checked
          ? pending
            ? "bg-primary-200 dark:bg-primary-800/50"
            : "bg-tertiary-600"
          : "bg-ink/15 dark:bg-paper/20"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
          pending && checked && "ring-2 ring-primary-600/30"
        )}
      />
    </button>
  );
}

export function StatusSwitch({
  status,
  onToggle,
}: {
  status: string;
  onToggle: () => void;
}) {
  const isActive = status === "ACTIVE" || status === "PENDING";
  const isPending = status === "PENDING";

  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={isActive} pending={isPending} onChange={onToggle} />
      <span
        className={cn(
          "text-xs font-medium min-w-[52px]",
          isPending
            ? "text-primary-600"
            : isActive
            ? "text-tertiary-600"
            : "text-ink/40 dark:text-paper/40"
        )}
      >
        {isPending ? "pendiente" : isActive ? "activo" : "inactivo"}
      </span>
    </div>
  );
}
