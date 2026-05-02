import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-200 text-neutral-700",
        urgent: "bg-urgent-bg text-urgent-text font-semibold",
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        error: "bg-error-bg text-error",
        info: "bg-info-bg text-info",
        outline: "border border-neutral-300 bg-transparent text-neutral-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
