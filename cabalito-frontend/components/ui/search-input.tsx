import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 pointer-events-none" />
      <input
        {...props}
        className={cn(
          "w-full h-11 pl-11 pr-4 rounded-full text-sm",
          "bg-primary-50/60 dark:bg-ink/50",
          "border-2 border-primary-100 dark:border-paper/10",
          "text-ink dark:text-paper placeholder:text-ink/35 dark:placeholder:text-paper/35",
          "shadow-sm",
          "transition-all duration-150",
          "focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/15 focus:bg-white dark:focus:bg-ink/70"
        )}
      />
    </div>
  );
}
