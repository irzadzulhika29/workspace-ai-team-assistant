import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — Field input dasar
 * Dipakai untuk search bar global di top bar
 */
const Input = React.forwardRef(
  ({ className, type = "text", icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative w-full">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </span>
          <input
            type={type}
            ref={ref}
            className={cn(
              "h-10 w-full rounded-full bg-white border border-neutral-200 pl-11 pr-4 text-sm",
              "placeholder:text-neutral-400 text-neutral-700",
              "focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-150",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md bg-white border border-neutral-200 px-3 text-sm",
          "placeholder:text-neutral-400 text-neutral-700",
          "focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-150",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
