// src/app/api/diagnose/route.ts
// 「完成章節即時診斷」：孩子做完一個單元（按下完成）時，把他在這個單元的所有訊號
// （第 3 段解釋、自評 / AI 判斷、第 4 段變形題對錯、練習區成績）綜合送給 AI，
// 判斷「吸收度」與「概念是否遷移」，回傳結構化 JSON 寫回家長頁與課表。
//
// 跟 /api/explain、/api/coach 同一套作法：Gemini REST API 當純分析引擎（單回合、
// 自訂 system prompt、只回 JSON），認證走免費的 Gemini API 金鑰。任何錯誤一律 try/catch →
// fallbackToStatic=true，前端改用 heuristicDiagnosis（本地啟發式），保證一定有診斷被記錄。
//
// 線上站會跨網域打到這支 API（見 lib/ai-endpoint.ts），所以加了 CORS（見 lib/ai-cors.ts）。

import { NextResponse } from "next/server";
import { corsJson, corsPreflight } from "@/lib/ai-cors";
import { callGemini } from "@/lib/gemini";
import type { Diagnosis, DiagnoseRequest, DiagnoseResponse } from "@/lib/diagnose";

const isStaticExport = process.env.BUILD_TARGET === "pages";

export const runtime = "nodejs";
export const dynamic = isStaticExport ? "force-static" : "force-dynamic";

const SYSTEM_PROMPT = `你是一位有經驗、溫暖的國中數學老師，正在看一個剛升國一的孩子做完一個概念單元後的整體表現，要給出「學習吸收度診斷」。

這個孩子的典型問題（診斷的重點）：很會背規則和題型，在熟悉題型上表現好，但題目稍微變化（換問法、換情境、多一個轉折）就會錯——因為腦中跑的是記憶檢索，不是概念推理。

你會拿到的訊號：
- 他用自己的話寫的概念解釋，以及他的自評（或單元二 AI 對解釋的判斷：理解型/複述型）。
- 第 4 段「變形題」每題的對錯，每題標了「likeTextbook」：true = 刻意跟教材長得像的題型題；false = 換了外觀（換情境/換問法/多一轉折）考同一概念。
- 練習區「變形題挑戰」每題的難度（basic 直接 / transfer 換情境 / synthesis 多一轉折）與對錯。

判斷準則（最重要）：
- 看「likeTextbook=true 的對、但 likeTextbook=false 的錯」這個樣態——這就是「會題型、概念沒遷移」的鐵證，吸收度判為「還在背」。
- 各種變形題（含換情境/多轉折）大多答對、且解釋是理解型 → 「扎實」。
- 介於中間 → 「大致理解」或「部分理解」。
- 解釋是「複述型」或自評「講不太出來」是重要扣分訊號。

你必須只輸出一個 JSON 物件，不要有任何其他文字、不要用 markdown 程式碼框。格式：
{
  "absorption_level": "扎實" | "大致理解" | "部分理解" | "還在背",
  "transferred": true | false,            // 換外觀的變形題是否真的遷移成功
  "strengths": "一句：他這個單元做得好的地方（具體）",
  "weakness": "一句：最該補的點（具體到概念的哪個面向，不要空泛）",
  "recommendation": "一句：建議下一步該做什麼",
  "next_action": "advance" | "spiral_review" | "redo_guided",
  "parent_note": "給家長看的一句話（要不要介入、怎麼陪）",
  "child_note": "給孩子看的、正向具體的一句話（點出做對的地方或溫和指方向，不要空泛說很好）"
}

next_action 對應：扎實→advance（可前進）；換外觀還不穩→spiral_review（去做螺旋複習）；會題型但概念沒遷移/複述型/講不出來→redo_guided（回第2段重走推導）。
全部用繁體中文，語氣親切，講給 12 歲的孩子與他媽媽聽。`;

function fmtVariants(req: DiagnoseRequest): string {
  const v = req.signals.variants;
  if (!v.length) return "（沒有變形題紀錄）";
  return v
    .map(
      (q, i) =>
        `  ${i + 1}. [${q.likeTextbook ? "教材題型" : "換外觀"}] ${q.correct ? "✓對" : "✗錯"}　考點：${q.testingWhat}　題目：${q.question}`,
    )
    .join("\n");
}

function fmtChallenge(req: DiagnoseRequest): string {
  const c = req.signals.challenge;
  if (!c.length) return "（沒有做練習區變形題挑戰，或還沒做）";
  const label: Record<string, string> = {
    basic: "直接",
    transfer: "換情境",
    synthesis: "多一轉折",
  };
  return c
    .map(
      (q, i) =>
        `  ${i + 1}. [${label[q.difficulty] ?? q.difficulty}] ${q.correct ? "✓對" : "✗錯"}　考點：${q.conceptAspect}`,
    )
    .join("\n");
}

function buildUserPrompt(req: DiagnoseRequest): string {
  const s = req.signals;
  return `【單元】${req.unitTitle}
【這個單元在考的概念】${req.conceptHint}

【孩子用自己的話寫的解釋】
${s.explanation?.trim() || "（沒有寫，或留白）"}

【他的自評】${s.selfAssessment ?? "（無）"}
【單元二 AI 對解釋的判斷】${s.aiUnderstanding ?? "（此單元非 AI 模式 / 無）"}

【第 4 段 變形題逐題】
${fmtVariants(req)}

【練習區 變形題挑戰逐題（最近一次）】
${fmtChallenge(req)}

請依系統指示，綜合以上訊號，只輸出那個 JSON 物件。`;
}

const LEVELS = ["扎實", "大致理解", "部分理解", "還在背"];
const ACTIONS = ["advance", "spiral_review", "redo_guided"];

// 從模型回傳的字串盡量解析出 JSON（容忍 ```json 包裹或前後雜訊）
function parseDiagnosis(raw: string): Diagnosis | null {
  if (!raw) return null;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const o = JSON.parse(text.slice(start, end + 1));
    const level = String(o.absorption_level ?? "").trim();
    const action = String(o.next_action ?? "").trim();
    const strengths = String(o.strengths ?? "").trim();
    const weakness = String(o.weakness ?? "").trim();
    const recommendation = String(o.recommendation ?? "").trim();
    const parent_note = String(o.parent_note ?? "").trim();
    const child_note = String(o.child_note ?? "").trim();
    // 至少要有等級和一句話才算有效
    if (!LEVELS.includes(level) && !child_note) return null;
    return {
      absorption_level: (LEVELS.includes(level)
        ? level
        : "部分理解") as Diagnosis["absorption_level"],
      transferred: Boolean(o.transferred),
      strengths: strengths || "願意把整個單元走完、把想法寫下來，這一步就很重要。",
      weakness: weakness || "概念遷移還可以再練——換個外觀的題目多做幾題。",
      recommendation:
        recommendation || "做一次螺旋複習，把這個概念換個外觀再練一遍。",
      next_action: (ACTIONS.includes(action)
        ? action
        : "spiral_review") as Diagnosis["next_action"],
      parent_note: parent_note || "可以讓孩子做一次螺旋複習再看看。",
      child_note:
        child_note || "你已經抓到大方向了，再換幾個新題目練一下就更穩。",
    };
  } catch {
    return null;
  }
}

async function handleDiagnose(
  request: Request,
): Promise<NextResponse<DiagnoseResponse>> {
  let body: DiagnoseRequest;
  try {
    body = (await request.json()) as DiagnoseRequest;
  } catch {
    return corsJson({
      ok: false,
      diagnosis: null,
      fallbackToStatic: true,
      error: "invalid request body",
    });
  }

  if (!body?.unitId || !body?.signals) {
    return corsJson({
      ok: false,
      diagnosis: null,
      fallbackToStatic: true,
      error: "missing unitId or signals",
    });
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  try {
    // 送給 Gemini 綜合診斷。失敗（沒金鑰、額度、逾時等）會 throw → 落入 catch，
    // 前端改用本地 heuristicDiagnosis，保證一定有診斷被記錄。
    const resultText = await callGemini({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(body),
      signal: abortController.signal,
    });

    const diagnosis = parseDiagnosis(resultText);
    if (!diagnosis) {
      return corsJson({
        ok: false,
        diagnosis: null,
        fallbackToStatic: true,
        error: "could not parse AI output",
      });
    }

    return corsJson({ ok: true, diagnosis, fallbackToStatic: false });
  } catch (err) {
    return corsJson({
      ok: false,
      diagnosis: null,
      fallbackToStatic: true,
      error: err instanceof Error ? err.message : "AI unavailable",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export const POST = isStaticExport ? undefined : handleDiagnose;
// 線上靜態站跨網域呼叫時的 OPTIONS 預檢（靜態匯出時為 undefined）。
export const OPTIONS = isStaticExport ? undefined : corsPreflight;
