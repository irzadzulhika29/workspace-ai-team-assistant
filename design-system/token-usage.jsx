import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TokenUsage — Widget besar "842k / 1M Limit"
 * Background gradient gelap dengan angka putih
 */
const TokenUsage = React.forwardRef(
  ({ used, limit, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-gradient-token p-6 text-white shadow-stat",
          className
        )}
        {...props}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold leading-none">{used}</span>
          <span className="text-sm font-medium opacity-80">/ {limit}</span>
        </div>
      </div>
    );
  }
);
TokenUsage.displayName = "TokenUsage";

export { TokenUsage };
