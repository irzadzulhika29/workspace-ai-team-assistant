import * as React from "react";
import { cn } from "@/lib/utils";

const Sidebar = React.forwardRef(
  ({ logo, brandName, brandTagline, children, className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "fixed left-0 top-0 z-sticky flex h-screen w-sidebar flex-col border-r border-neutral-200 bg-white",
          className
        )}
        {...props}
      >
        {(logo || brandName) && (
          <div className="bg-gradient-stat px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              {logo && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-primary-500">
                  {logo}
                </div>
              )}
              {brandName && (
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold leading-tight">
                    {brandName}
                  </h2>
                  {brandTagline && (
                    <p className="truncate text-xs opacity-90">{brandTagline}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="sidebar-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {children}
        </nav>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
