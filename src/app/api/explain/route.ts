// src/app/api/explain/route.ts
// 單元二（AI 模式）第 3 段：判斷孩子的解釋是「理解型」還是「複述型」。
//
// 用 Agent SDK 當「純分析引擎」：關掉所有工具、單回合、自訂 system prompt，
// 要求只回傳 JSON。認證走本機 `claude login` 的訂閱（所以不部署雲端）。
// 任何錯誤（SDK 不在、未登入、逾時、解析失敗）一律 try/catch，
// 回傳 fallbackToStatic=true，讓前端退回靜態對照，孩子永遠不會卡住。

import { NextResponse } from "next/server";
import type {
  AiFeedback,
  ExplainRequest,
  ExplainResponse,
} from "@/lib/explanation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `你是一位有經驗、溫暖的國中數學老師，正在看一個剛升國一的孩子用自己的話寫下的概念解釋。

你的任務「不是」改作文、也不是判斷答案對錯，而是判斷這孩子是「真的理解」還是「在複述背起來的句子」。這個孩子的典型問題是：很會背規則和步驟，但題目一變化就錯，因為腦中跑的是記憶檢索、不是概念推理。

判斷原則：
- 「理解型」：用自己的話、自己的例子或因果（因為…所以…）說出「為什麼」，就算用詞不精準也算。
- 「複述型」：只是把規則、步驟、口訣照搬出來（例如只寫「絕對值就是去掉負號」「先設x再列式」），沒有講出背後的原因。
- 「不確定」：太短、空泛、或看不出來。

你必須只輸出一個 JSON 物件，不要有任何其他文字、不要用 markdown 程式碼框。格式：
{
  "understanding_level": "理解型" | "複述型" | "不確定",
  "followup_question": "針對他解釋裡最弱的一點，再戳一下的一個追問（口語、針對性，像老師當面追問。例如把數字換成負的、換個情境，看他的說法還成不成立）",
  "encouragement": "給這個孩子看的、正向具體的一句鼓勵（不要空泛說『很好』，要點出他做對的地方，或溫和指出方向）"
}

全部用繁體中文，語氣親切，講給 12 歲的孩子聽。`;

function buildUserPrompt(req: ExplainRequest): string {
  return `【單元】${req.unitTitle}
【這個單元在考的概念】${req.conceptHint}
【我們問孩子的問題】${req.question}

【孩子寫的解釋】
${req.studentText}

請依系統指示，只輸出那個 JSON 物件。`;
}

// 從模型回傳的字串中盡量解析出 JSON（容忍 ```json 包裹或前後雜訊）
function parseFeedback(raw: string): AiFeedback | null {
  if (!raw) return null;
  let text = raw.trim();
  // 去掉可能的 markdown 程式碼框
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // 取第一個 { 到最後一個 }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    const levelRaw = String(obj.understanding_level ?? "").trim();
    const level: AiFeedback["understanding_level"] =
      levelRaw === "理解型" || levelRaw === "複述型" ? levelRaw : "不確定";
    const followup = String(obj.followup_question ?? "").trim();
    const encouragement = String(obj.encouragement ?? "").trim();
    if (!followup && !encouragement) return null;
    return {
      understanding_level: level,
      followup_question:
        followup || "再多說一點：如果把題目裡的數字換成別的，你的說法還成立嗎？",
      encouragement: encouragement || "你願意用自己的話試著解釋，這一步就很棒了。",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse<ExplainResponse>> {
  let body: ExplainRequest;
  try {
    body = (await request.json()) as ExplainRequest;
  } catch {
    return NextResponse.json({
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: "invalid request body",
    });
  }

  if (!body?.studentText || body.studentText.trim().length < 2) {
    return NextResponse.json({
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: "empty explanation",
    });
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  try {
    // 動態載入 SDK：若套件不存在或載入失敗，落入 catch → 退回靜態
    const { query } = await import("@anthropic-ai/claude-agent-sdk");

    const response = query({
      prompt: buildUserPrompt(body),
      options: {
        systemPrompt: SYSTEM_PROMPT, // 自訂 prompt，當分析引擎（不走 coding 預設）
        allowedTools: [], // 關掉所有工具
        disallowedTools: ["Bash", "Read", "Write", "Edit", "WebSearch", "WebFetch"],
        maxTurns: 1, // 單回合分析
        permissionMode: "default",
        abortController,
        ...(process.env.ANTHROPIC_MODEL
          ? { model: process.env.ANTHROPIC_MODEL }
          : {}),
      },
    });

    let resultText = "";
    for await (const message of response) {
      if (message.type === "result") {
        if (message.subtype === "success") {
          resultText = message.result;
        }
        break; // 拿到 result 就結束
      }
    }

    // 偵測「未登入 / 額度用盡」這類訊息：CLI 會把它當成一般文字回傳，
    // 不是拋例外。明確判斷後給清楚的錯誤訊息（仍然退回靜態）。
    if (/invalid api key|please run \/login|not logged in|credit balance|insufficient/i.test(resultText)) {
      return NextResponse.json({
        ok: false,
        feedback: null,
        fallbackToStatic: true,
        error:
          "AI 未認證：請在這台電腦的終端機執行 `claude login`（或在 .env.local 填 ANTHROPIC_API_KEY）後重試。",
      });
    }

    const feedback = parseFeedback(resultText);
    if (!feedback) {
      return NextResponse.json({
        ok: false,
        feedback: null,
        fallbackToStatic: true,
        error: "could not parse AI output",
      });
    }

    return NextResponse.json({ ok: true, feedback, fallbackToStatic: false });
  } catch (err) {
    // SDK 不在、未 claude login、逾時、其他錯誤 → 退回靜態
    return NextResponse.json({
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: err instanceof Error ? err.message : "AI unavailable",
    });
  } finally {
    clearTimeout(timeout);
  }
}
