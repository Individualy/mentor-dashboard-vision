import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the current frontend URL (hostname and port)
export function getFrontendUrl() {
  return window.location.origin;
}
