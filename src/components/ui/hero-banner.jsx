import * as React from "react";
import { cn } from "@/lib/utils";

const HeroBanner = React.forwardRef(
  ({ title, description, backgroundImage, tone = "default", className, ...props }, ref) => {
    const isNeutral = tone === "neutral";

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl p-8",
          isNeutral
            ? "border border-neutral-200 bg-white"
            : "bg-gradient-hero",
          className
        )}
        style={
          backgroundImage && !isNeutral
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(232,67,34,0.92) 0%, rgba(31,31,31,0.85) 100%), url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        {...props}
      >
        <h1
          className={cn(
            "text-3xl font-bold leading-tight",
            isNeutral ? "text-neutral-900" : "text-white"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-2 max-w-2xl text-sm",
              isNeutral ? "text-neutral-500" : "text-white/85"
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);
HeroBanner.displayName = "HeroBanner";

export { HeroBanner };
