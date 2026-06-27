import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  GREEN: "bg-mercado-50 text-mercado-800 dark:bg-mercado-800/30 dark:text-mercado-200",
  YELLOW: "bg-oro-50 text-oro-800 dark:bg-oro-800/30 dark:text-oro-200",
  RED: "bg-terracota-50 text-terracota-800 dark:bg-terracota-800/30 dark:text-terracota-200",
  ACTIVE: "bg-mercado-50 text-mercado-800 dark:bg-mercado-800/30 dark:text-mercado-200",
  PENDING: "bg-oro-50 text-oro-800 dark:bg-oro-800/30 dark:text-oro-200",
  RESOLVED: "bg-noche-50 text-noche-800 dark:bg-noche-800/40 dark:text-noche-200",
  INACTIVE: "bg-ink/5 text-ink/50 dark:bg-paper/10 dark:text-paper/50",
};

const labels: Record<string, string> = {
  GREEN: "normal",
  YELLOW: "alerta",
  RED: "crisis",
  ACTIVE: "activo",
  PENDING: "pendiente",
  RESOLVED: "resuelto",
  INACTIVE: "inactivo",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "bg-ink/5 text-ink/60 dark:bg-paper/10 dark:text-paper/60"
      )}
    >
      {labels[status] ?? status.toLowerCase()}
    </span>
  );
}
