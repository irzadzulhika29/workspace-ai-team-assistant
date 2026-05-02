import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Sidebar — Layout sidebar fixed kiri
 * Width: 270px (token: w-sidebar)
 * Container untuk logo + NavItem list
 */
const Sidebar = React.forwardRef(
  ({ logo, brandName, brandTagline, children, className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "fixed left-0 top-0 z-sticky flex h-screen w-sidebar flex-col",
          "border-r border-neutral-200 bg-white",
          className
        )}
        {...props}
      >
        {/* Brand */}
        {(logo || brandName) && (
          <div className="flex items-center gap-3 px-6 py-5 bg-gradient-stat text-white">
            {logo && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-primary-500">
                {logo}
              </div>
            )}
            {brandName && (
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight truncate">
                  {brandName}
                </h2>
                {brandTagline && (
                  <p className="text-xs opacity-90 truncate">{brandTagline}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {children}
        </nav>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
