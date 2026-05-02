import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";

/**
 * ListItem — Row untuk Comms (email) & Agenda
 *
 * Layout:
 *   [avatar]  [sender + judul + body]  [badge]
 */
const ListItem = React.forwardRef(
  (
    { sender, avatarUrl, title, body, badge, className, ...props },
    ref
  ) => {
    const initials = sender
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3",
          "hover:border-primary-200 hover:bg-primary-50/30 transition-colors duration-150 cursor-pointer",
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
            <span className="text-xs text-neutral-500 truncate">{sender}</span>
            {badge && (
              <Badge variant={badge.variant ?? "urgent"}>{badge.label}</Badge>
            )}
          </div>
          <h4 className="mt-0.5 text-sm font-semibold text-neutral-900 truncate">
            {title}
          </h4>
          {body && (
            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">
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
