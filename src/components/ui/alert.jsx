import * as React from "react";
import { cva } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        error: "border-error/30 bg-error-bg text-error",
        warning: "border-warning/30 bg-warning-bg text-warning",
        success: "border-success/30 bg-success-bg text-success",
        info: "border-info/30 bg-info-bg text-info",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  }
);

const alertIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

function Alert({
  className,
  variant = "error",
  icon,
  title,
  children,
  onDismiss,
  ...props
}) {
  const Icon = icon || alertIcons[variant];

  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Alert, alertVariants };
