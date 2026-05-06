import * as React from "react";
import { cn } from "@/lib/utils";

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
              "h-10 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-4 text-sm",
              "text-neutral-700 placeholder:text-neutral-400",
              "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
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
          "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm",
          "text-neutral-700 placeholder:text-neutral-400",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
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
