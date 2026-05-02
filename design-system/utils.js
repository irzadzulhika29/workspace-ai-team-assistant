import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently.
 * Used by all shadcn components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
