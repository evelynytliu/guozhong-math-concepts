// src/lib/diagnose.ts
// 「完成章節即時診斷」的共用型別 + 前端呼叫 helper + 本地啟發式 fallback。
// 型別同時被前端（unit-flow、家長頁、課表頁）與 /api/diagnose 後端使用。
//
// 與 explanation.ts / coach.ts 一致：任何錯誤都不丟出，回傳 fallbackToStatic=true，
// 讓前端改用本地啟發式診斷（heuristicDiagnosis），保證一定有診斷被記錄、孩子不會卡住。

import { aiEndpoint } from "./ai-endpoint";

export type AbsorptionLevel = "扎實" | "大致理解" | "部分理解" | "還在背";
export type NextAction = "advance" | "spiral_review" | "redo_guided";

// AI（或本地啟發式）回傳的診斷結果
export interface Diagnosis {
  absorption_level: AbsorptionLevel;
  transferred: boolean; // 變形題（非教材題）是否遷移成功
  strengths: string;
  weakness: string;
  recommendation: string;
  next_action: NextAction; // 機器可讀，課表用來決定下一步按鈕
  parent_note: string;
  child_note: string;
}

// 診斷時用到的訊號（送給 AI，也存進 diagnoses.signals 欄位）
export interface VariantSignal {
  question: string;
  testingWhat: string;
  likeTextbook: boolean; // 第 1 題刻意像教材；其他換外觀
  correct: boolean;
}
export interface ChallengeSignal {
  difficulty: "basic" | "transfer" | "synthesis";
  conceptAspect: string;
  correct: boolean;
}
export interface DiagnoseSignals {
  explanation?: string; // 第 3 段孩子寫的解釋
  selfAssessment?: string | null; // got_it | partial | cant_explain
  aiUnderstanding?: string | null; // 理解型 | 複述型 | 不確定（單元二 AI 模式）
  variants: VariantSignal[]; // 第 4 段變形題
  challenge: ChallengeSignal[]; // 練習區變形題挑戰（最近一次）
}

export interface DiagnoseRequest {
  unitId: string;
  unitTitle: string;
  conceptHint: string; // 這個單元在考的概念（section3_explain.aiConceptHint 或 summary）
  signals: DiagnoseSignals;
}

export interface DiagnoseResponse {
  ok: boolean;
  diagnosis: Diagnosis | null;
  fallbackToStatic: boolean; // true = AI 不可用，前端改用 heuristicDiagnosis
  error?: string;
}

// 前端 helper：送到 /api/diagnose。
// 線上靜態站會透過 aiEndpoint() 打到家裡電腦的 tunnel（見 ai-endpoint.ts）。
export async function requestDiagnosis(
  req: DiagnoseRequest,
): Promise<DiagnoseResponse> {
  try {
    const res = await fetch(aiEndpoint("/api/diagnose"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return {
        ok: false,
        diagnosis: null,
        fallbackToStatic: true,
        error: `HTTP ${res.status}`,
      };
    }
    return (await res.json()) as DiagnoseResponse;
  } catch (err) {
    return {
      ok: false,
      diagnosis: null,
      fallbackToStatic: true,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

// 本地啟發式診斷：AI 不可用（電腦關著 / tunnel 連不到 / 靜態站）時用，
// 保證一定有診斷被記錄。規則沿用家長頁既有邏輯：
// 教材題對、但換外觀的變形題全錯 = 還在背（會題型、概念沒遷移），這正是這孩子的典型。
export function heuristicDiagnosis(signals: DiagnoseSignals): Diagnosis {
  const variants = signals.variants;
  const nonTextbook = variants.filter((v) => !v.likeTextbook);
  const textbook = variants.filter((v) => v.likeTextbook);
  const textbookOk = textbook.length > 0 && textbook.every((v) => v.correct);
  const nonTextbookCorrect = nonTextbook.filter((v) => v.correct).length;
  const transferred =
    nonTextbook.length > 0 && nonTextbookCorrect === nonTextbook.length;
  const allVariantOk = variants.length > 0 && variants.every((v) => v.correct);

  const cantExplain = signals.selfAssessment === "cant_explain";
  const reciting = signals.aiUnderstanding === "複述型";

  let level: AbsorptionLevel;
  let next: NextAction;
  let transferredFlag = transferred;

  if (textbookOk && nonTextbook.length > 0 && nonTextbookCorrect === 0) {
    // 典型「背題型」：教材題對、變形題全錯
    level = "還在背";
    next = "redo_guided";
    transferredFlag = false;
  } else if (allVariantOk && !cantExplain && !reciting) {
    level = "扎實";
    next = "advance";
    transferredFlag = true;
  } else if (transferred && !reciting) {
    level = "大致理解";
    next = "spiral_review";
  } else {
    level = "部分理解";
    next = cantExplain || reciting ? "redo_guided" : "spiral_review";
  }

  const correctV = variants.filter((v) => v.correct).length;
  const strengths =
    correctV > 0
      ? `變形題答對 ${correctV}/${variants.length} 題${textbookOk ? "，熟悉的題型掌握住了" : ""}。`
      : "願意把整個單元走完、把想法寫下來，這一步就很重要。";
  const weakness =
    level === "還在背"
      ? "看得懂熟悉題型，但題目換個外觀就卡住——概念還停在「記題型」，沒真的遷移。"
      : level === "扎實"
        ? "目前看不出明顯弱點，保持用間隔複習維持手感即可。"
        : "換情境或多一個轉折的題目還不太穩，概念遷移還要再練。";
  const recommendation =
    next === "advance"
      ? "可以前往下一個單元。過幾天回來做一次螺旋複習鞏固。"
      : next === "spiral_review"
        ? "先做一次螺旋複習（混合新題），把這個概念換個外觀再練一遍。"
        : "建議回到第 2 段重新走一次推導，重點放在「為什麼」，不要背步驟。";
  const parent_note =
    level === "還在背"
      ? "孩子在這個單元出現「會題型、不懂概念」的訊號，值得花幾分鐘陪他口頭講一次為什麼。"
      : level === "扎實"
        ? "這個單元吸收得不錯，維持間隔複習就好，不需要介入。"
        : "概念大致有了，但遷移還不穩；讓他做一次螺旋複習再看看。";
  const child_note =
    level === "扎實"
      ? "你不是把它背起來，是真的會了——換了題目照樣抓得到！"
      : level === "還在背"
        ? "熟悉的題型你都對，很棒。換外觀的題目卡住很正常，回去把「為什麼」再想一次就會通。"
        : "你已經抓到大方向了，再換幾個新題目練一下，概念就會變成你的。";

  return {
    absorption_level: level,
    transferred: transferredFlag,
    strengths,
    weakness,
    recommendation,
    next_action: next,
    parent_note,
    child_note,
  };
}
