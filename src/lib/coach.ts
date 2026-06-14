// src/lib/coach.ts
// 報告草稿「AI 追問」（混合模式）的共用型別與前端呼叫 helper。
// 型別同時被前端元件與 /api/coach 後端 route 使用。
//
// 跟 explanation.ts 的設計一致：任何錯誤都不丟出來，而是回傳
// fallbackToStatic=true，讓前端退回靜態的角度提示(sparks)，孩子永遠不會卡住。

// AI 回傳的結構（給草稿欄位的引導，不是幫他寫答案）
export interface CoachFeedback {
  // 幾個「不同的方向」讓他挑著想（開頭式，不是完整答案）
  directions: string[];
  // 一個追問，逼他想得更具體、更是他自己的
  probe: string;
  // 給孩子的正向、具體的一句鼓勵
  encouragement: string;
}

export interface CoachResponse {
  ok: boolean;
  feedback: CoachFeedback | null;
  fallbackToStatic: boolean;
  error?: string;
}

export interface CoachRequest {
  homeworkTitle: string;
  fieldLabel: string; // 這個欄位在問什麼（label）
  guide: string; // 這個欄位的引導語
  fieldContext: string; // 給 AI 的脈絡（field.aiContext）
  studentText: string; // 孩子目前在這欄寫的內容（可能是空的）
}

// 前端 helper：把欄位脈絡 + 孩子目前寫的內容送到 /api/coach。
export async function requestCoach(req: CoachRequest): Promise<CoachResponse> {
  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return {
        ok: false,
        feedback: null,
        fallbackToStatic: true,
        error: `HTTP ${res.status}`,
      };
    }
    return (await res.json()) as CoachResponse;
  } catch (err) {
    return {
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
