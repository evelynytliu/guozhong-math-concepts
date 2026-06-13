// src/lib/explanation.ts
// 第 3 段「用自己的話解釋」相關的共用型別與 AI 呼叫 helper。
// 型別同時被前端元件與 /api/explain 後端 route 使用。

import type { SelfAssessment } from "@/content/types";

// AI 回傳的結構（CLAUDE.md 規定的 JSON 形狀）
export interface AiFeedback {
  understanding_level: "理解型" | "複述型" | "不確定";
  followup_question: string;
  encouragement: string;
}

// /api/explain 的回傳：成功帶 feedback，失敗帶 fallback 旗標讓前端退回靜態模式
export interface ExplainResponse {
  ok: boolean;
  feedback: AiFeedback | null;
  // true = AI 不可用 / 出錯，前端應退回靜態「參考解釋對照」模式
  fallbackToStatic: boolean;
  // 給開發時看的錯誤訊息（不一定要顯示給孩子）
  error?: string;
}

export interface ExplainRequest {
  unitId: string;
  unitTitle: string;
  // 第 3 段的題目（讓 AI 知道孩子在回答什麼）
  question: string;
  // 這個單元在考的概念脈絡（unit.section3_explain.aiConceptHint）
  conceptHint: string;
  // 孩子寫的解釋
  studentText: string;
}

export type { SelfAssessment };

// 前端 helper：把孩子的解釋送到 /api/explain。
// 任何網路/伺服器錯誤都不丟出來，而是回傳 fallbackToStatic=true，
// 讓孩子永遠不會卡住（符合 CLAUDE.md：AI 失敗一定退回靜態）。
export async function requestAiFeedback(
  req: ExplainRequest,
): Promise<ExplainResponse> {
  try {
    const res = await fetch("/api/explain", {
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

    const data = (await res.json()) as ExplainResponse;
    return data;
  } catch (err) {
    return {
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
