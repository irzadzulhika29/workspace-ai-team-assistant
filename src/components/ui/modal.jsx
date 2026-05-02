import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full animate-fade-in rounded-xl bg-white shadow-xl",
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function ModalBody({ children, className }) {
  return <div className={cn("px-6 pb-4", className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 pb-6 pt-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Modal, ModalBody, ModalFooter };
