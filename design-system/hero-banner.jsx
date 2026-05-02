import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * HeroBanner — Banner sambutan di atas dashboard
 * Background: gradient merah ke gelap + overlay image (opsional)
 *
 * Contoh: "Morning, Admin" + deskripsi singkat
 */
const HeroBanner = React.forwardRef(
  ({ title, description, backgroundImage, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-hero p-8",
          className
        )}
        style={
          backgroundImage
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(232,67,34,0.92) 0%, rgba(31,31,31,0.85) 100%), url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        {...props}
      >
        <h1 className="text-3xl font-bold text-white leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            {description}
          </p>
        )}
      </div>
    );
  }
);
HeroBanner.displayName = "HeroBanner";

export { HeroBanner };
