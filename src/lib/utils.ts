import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// public/ 裡的靜態資產（例如老師語音 mp3）在公開版（GitHub Pages）需要帶上
// repo 前綴，本機版則是根路徑。NEXT_PUBLIC_BASE_PATH 由 next.config.mjs 注入。
export function assetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
