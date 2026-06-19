// src/lib/ai-endpoint.ts
// 決定 AI 請求（/api/explain、/api/coach、/api/diagnose）要打到哪裡。
//
// - 本機（npm run dev / npm start）：NEXT_PUBLIC_AI_BASE_URL 留空 →
//   回傳相對路徑（同源 /api/...），就是這台電腦自己的 API route。
// - 線上靜態站（GitHub Pages）：把 NEXT_PUBLIC_AI_BASE_URL 設成家裡電腦的
//   tunnel 網址（例如 Cloudflare Tunnel 的 https URL），AI 請求就會打回本機的
//   `claude login`。這就是「答題在線上、只有 AI 連本機」的關鍵。
//
// NEXT_PUBLIC_ 變數在 build 時就被內嵌；線上站的值設在 GitHub Secrets（見
// .github/workflows/deploy-pages.yml）。
export function aiEndpoint(path: string): string {
  const base = (process.env.NEXT_PUBLIC_AI_BASE_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}
