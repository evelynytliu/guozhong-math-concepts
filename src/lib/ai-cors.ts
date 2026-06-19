// src/lib/ai-cors.ts
// 線上靜態站（GitHub Pages）會跨網域呼叫家裡電腦 tunnel 上的 AI route
//（答題在線上、只有 AI 連本機），所以這些 route 要回 CORS 標頭、並處理 OPTIONS 預檢。
//
// 預設允許所有來源（家用工具、tunnel 網址保密即可）；想收緊的話在本機 .env.local
// 設 AI_ALLOWED_ORIGIN=https://evelynytliu.github.io（只放行公開站來源）。
// 註：CORS 只擋瀏覽器，真正的防濫用是「tunnel 網址保密」；詳見 README 安全提醒。

import { NextResponse } from "next/server";

const ALLOW_ORIGIN = process.env.AI_ALLOWED_ORIGIN || "*";

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

// 包一層 NextResponse.json，帶上 CORS 標頭。
export function corsJson<T>(body: T): NextResponse<T> {
  return NextResponse.json(body, { headers: corsHeaders() });
}

// OPTIONS 預檢回應。
export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
