import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — AI Team Assistant
 * Varian: primary (default), outline, ghost, destructive, link
 * Ukuran: sm, md (default), lg, icon
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-md hover:-translate-y-0.5 active:bg-primary-700 active:translate-y-0",
        outline:
          "border border-primary-500 bg-white text-primary-500 hover:bg-primary-50 active:bg-primary-100",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 active:bg-neutral-200",
        destructive:
          "bg-error text-white hover:bg-red-600 active:bg-red-700",
        link:
          "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        sm:   "h-8 px-3 text-xs",
        md:   "h-10 px-5 text-sm",
        lg:   "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
