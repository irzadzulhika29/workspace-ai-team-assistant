import * as React from "react";
import { cn } from "@/lib/utils";

function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

function TabsList({ children, value, onValueChange, className }) {
  return (
    <div
      className={cn("flex items-center gap-1 border-b border-neutral-200", className)}
      role="tablist"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: child.props.value === value,
            onClick: () => onValueChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({
  children,
  icon,
  isActive,
  onClick,
  className,
  value,
  ...props
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 -mb-px px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "border-primary-500 text-primary-500"
          : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700",
        className
      )}
      data-value={value}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export { Tabs, TabsList, TabsTrigger };
