import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 overflow-hidden rounded-full bg-neutral-200",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const Avatar = React.forwardRef(({ className, size, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center bg-primary-100 font-semibold text-primary-700",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

const AvatarGroup = React.forwardRef(
  ({ children, max = 5, className, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visible = childArray.slice(0, max);
    const overflow = childArray.length - max;

    return (
      <div ref={ref} className={cn("flex -space-x-2", className)} {...props}>
        {visible.map((child, idx) => (
          <span
            key={idx}
            className="inline-flex rounded-full ring-2 ring-white"
          >
            {child}
          </span>
        ))}
        {overflow > 0 && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 ring-2 ring-white">
            +{overflow}
          </span>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage, avatarVariants };
