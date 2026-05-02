import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * NavItem — Item navigasi di sidebar
 * Saat active: background primary-500, text putih
 * Default: text neutral-700, hover background primary-50
 */
const NavItem = React.forwardRef(
  ({ icon, label, active = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
          active
            ? "bg-primary-500 text-white shadow-stat font-semibold"
            : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600",
          className
        )}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center",
            active ? "text-white" : "text-primary-500"
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  }
);
NavItem.displayName = "NavItem";

export { NavItem };
