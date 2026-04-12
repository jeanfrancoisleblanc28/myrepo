import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes and resolve conflicts (e.g. px-3 + px-4 → px-4) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
