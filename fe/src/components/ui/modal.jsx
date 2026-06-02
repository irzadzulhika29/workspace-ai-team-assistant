import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]",
};

function ModalRoot({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  hideCloseButton = false,
}) {
  React.useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const showAutoHeader = Boolean(title || description);

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
          sizeClasses[size] ?? sizeClasses.md,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {showAutoHeader && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-bold text-neutral-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            {onClose && !hideCloseButton && (
              <Modal.Close onClick={onClose} />
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function ModalHeader({ children, className, onClose, hideCloseButton = false }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 p-6 pb-4",
        className
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && !hideCloseButton && <Modal.Close onClick={onClose} />}
    </div>
  );
}

function ModalTitle({ children, className }) {
  return (
    <h2
      id="modal-title"
      className={cn("text-lg font-bold text-neutral-900", className)}
    >
      {children}
    </h2>
  );
}

function ModalDescription({ children, className }) {
  return (
    <p className={cn("mt-1 text-sm text-neutral-500", className)}>
      {children}
    </p>
  );
}

function ModalBody({ children, className }) {
  return <div className={cn("px-6 pb-4", className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pb-6 pt-2 sm:flex-row sm:items-center sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

function ModalClose({ children, className, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700",
        className
      )}
      aria-label="Close"
    >
      {children ?? <X className="h-5 w-5" />}
    </button>
  );
}

const Modal = ModalRoot;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Close = ModalClose;

export { Modal, ModalRoot, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose };
