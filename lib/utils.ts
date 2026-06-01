import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Gevorderd",
  ADVANCED: "Expert",
};

export const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800",
  ADVANCED: "bg-red-100 text-red-800",
};

export const CATEGORY_ICONS: Record<string, string> = {
  networking: "🌐",
  cybersecurity: "🔒",
  webdev: "💻",
  cloud: "☁️",
  sysadmin: "🖥️",
  programming: "⌨️",
};
