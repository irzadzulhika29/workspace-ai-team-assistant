import * as React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = React.forwardRef(
  ({ label, value, caption, trendIcon, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-gradient-stat p-4 text-white shadow-stat",
          "transition-transform duration-200 hover:-translate-y-1",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium opacity-90">{label}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-primary-500">
            {trendIcon ?? <TrendingUp className="h-4 w-4" />}
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold leading-none">{value}</div>
        {caption && (
          <p className="mt-3 text-[10px] leading-snug opacity-80">{caption}</p>
        )}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
