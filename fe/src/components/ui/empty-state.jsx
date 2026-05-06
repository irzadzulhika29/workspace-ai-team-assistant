import * as React from "react";
import { cn } from "@/lib/utils";

function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      {title && (
        <h3 className="mb-1 text-base font-semibold text-neutral-700">
          {title}
        </h3>
      )}
      {description && (
        <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
