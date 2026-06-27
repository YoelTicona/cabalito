import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100 dark:border-paper/10 overflow-hidden",
        "bg-white dark:bg-ink/30 shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTableToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 mb-4", className)}>
      {children}
    </div>
  );
}

interface Col {
  header: string;
  className?: string;
}

export function DataTableHead({ columns }: { columns: Col[] }) {
  return (
    <thead>
      <tr className="bg-primary-50/80 dark:bg-paper/[0.04] text-left text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
        {columns.map((col) => (
          <th key={col.header} className={cn("px-4 py-3 font-semibold", col.className)}>
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        "border-t border-primary-50 dark:border-paper/10 transition-colors",
        "hover:bg-primary-50/40 dark:hover:bg-paper/[0.03]",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-sm", className)}>{children}</td>;
}

export function DataTableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-ink/40 dark:text-paper/40 text-sm">
        {message}
      </td>
    </tr>
  );
}

export function ActionLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-primary-600 hover:text-primary-800 text-sm font-medium hover:underline transition-colors"
    >
      {children}
    </button>
  );
}
