import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";

const ListItem = React.forwardRef(
  (
    { sender, avatarUrl, title, body, badge, className, ...props },
    ref
  ) => {
    const initials = sender
      .split(" ")
      .map((segment) => segment[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3",
          "transition-colors duration-150 hover:border-primary-200 hover:bg-primary-50/30",
          className
        )}
        {...props}
      >
        <Avatar size="sm" className="mt-0.5">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={sender} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-neutral-500">{sender}</span>
            {badge && (
              <Badge variant={badge.variant ?? "urgent"}>{badge.label}</Badge>
            )}
          </div>
          <h4 className="mt-0.5 truncate text-sm font-semibold text-neutral-900">
            {title}
          </h4>
          {body && (
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
              {body}
            </p>
          )}
        </div>
      </div>
    );
  }
);
ListItem.displayName = "ListItem";

export { ListItem };
