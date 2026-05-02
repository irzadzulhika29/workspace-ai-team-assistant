import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently across design-system primitives.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
