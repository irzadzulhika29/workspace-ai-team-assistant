import * as React from "react";
import { cn } from "@/lib/utils";

const NavItem = React.forwardRef(
  (
    {
      icon,
      label,
      active = false,
      className,
      collapsed = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center",
            active ? "text-white" : "text-primary-500"
          )}
        >
          {icon}
        </span>
        <span className={cn(collapsed && "md:hidden")}>{label}</span>
      </>
    );

    const classes = cn(
      "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
      collapsed && "md:justify-center",
      active
        ? "bg-primary-500 font-semibold text-white shadow-stat"
        : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600",
      className
    );

    if (asChild) {
      const child = React.Children.only(children);

      return React.cloneElement(child, {
        ...props,
        ...child.props,
        ref,
        className: cn(classes, child.props.className),
        "aria-current": active ? "page" : undefined,
        children: content,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        aria-current={active ? "page" : undefined}
        type="button"
        {...props}
      >
        {content}
      </button>
    );
  }
);
NavItem.displayName = "NavItem";

export { NavItem };
