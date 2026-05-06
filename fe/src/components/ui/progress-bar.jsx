import * as React from "react";
import { cn } from "@/lib/utils";

function ProgressBar({
  value = 0,
  max = 100,
  variant = "primary",
  label,
  showPercentage,
  className,
}) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  const barVariants = {
    primary: "bg-primary-500",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    gradient: "bg-gradient-stat",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs text-neutral-500">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-neutral-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barVariants[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={safeMax}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
