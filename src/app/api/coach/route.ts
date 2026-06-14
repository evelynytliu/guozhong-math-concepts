// src/app/api/coach/route.ts
// 報告草稿（draft）的「AI 追問」按鈕（混合模式）。
//
// 跟 /api/explain 同一套作法：用 Agent SDK 當純分析引擎（關掉工具、單回合、
// 自訂 system prompt、只回傳 JSON），認證走本機 `claude login` 訂閱。
// 任何錯誤一律 try/catch → fallbackToStatic=true，前端退回靜態的角度提示。
//
// 設計原則（呼應 CLAUDE.md 的孩子問題）：
//   這個孩子習慣「照範例反射」。所以 AI 的任務「不是幫他寫答案」，
//   而是給幾個『不同的方向』讓他自己挑，再問一個逼他想得更具體的問題。
//   絕對不要直接產出可以照抄的成品。

import { NextResponse } from "next/server";
import type { CoachFeedback, CoachRequest, CoachResponse } from "@/lib/coach";

// 靜態匯出（GitHub Pages）不能有後端 POST handler；此時 route 留空，
// 前端呼叫失敗會自動退回靜態角度提示。
const isStaticExport = process.env.BUILD_TARGET === "pages";

export const runtime = "nodejs";
export const dynamic = isStaticExport ? "force-static" : "force-dynamic";

const SYSTEM_PROMPT = `你是一位溫暖、有經驗的國中導師，正在陪一個剛升國一的孩子寫暑假作業的草稿。這個孩子常常「對著空白頁發呆」，也習慣照著範例反射、不太敢寫自己的想法。

你的任務「不是」幫他把答案寫出來（那會害了他，他需要的是自己想），而是：
- 給他幾個「不同的方向」去想，讓他有得挑、不再卡住。每個方向是一句「開頭」或「一個切入點」，不是完整的句子，更不是可以直接抄的成品。
- 問他一個能逼他想得「更具體、更是他自己」的問題。
- 給他一句正向、具體的鼓勵。

如果他已經寫了一些，方向和追問要「順著他寫的」往下推（接他的話，而不是另起爐灶）。如果他還沒寫，就給他幾個好上手的不同起點。

你必須只輸出一個 JSON 物件，不要有任何其他文字、不要用 markdown 程式碼框。格式：
{
  "directions": ["方向一（一句開頭或切入點）", "方向二", "方向三"],
  "probe": "一個追問，逼他想得更具體、更是他自己的",
  "encouragement": "給這個孩子看的、正向具體的一句鼓勵"
}

全部用繁體中文，語氣親切，講給 12 歲的孩子聽。directions 給 2~4 個就好。`;

function buildUserPrompt(req: CoachRequest): string {
  const written = req.studentText.trim();
  return `【作業】${req.homeworkTitle}
【這一題在問】${req.fieldLabel}
【引導語】${req.guide}
【這題在練什麼】${req.fieldContext}

【孩子目前寫的內容】
${written ? written : "（還沒開始寫，對著空白發呆）"}

請依系統指示，只輸出那個 JSON 物件。`;
}

// 從模型回傳的字串盡量解析出 JSON（容忍 ```json 包裹或前後雜訊）
function parseCoach(raw: string): CoachFeedback | null {
  if (!raw) return null;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    const directions = Array.isArray(obj.directions)
      ? obj.directions
          .map((d: unknown) => String(d ?? "").trim())
          .filter((d: string) => d.length > 0)
          .slice(0, 4)
      : [];
    const probe = String(obj.probe ?? "").trim();
    const encouragement = String(obj.encouragement ?? "").trim();
    if (directions.length === 0 && !probe) return null;
    return {
      directions:
        directions.length > 0
          ? directions
          : ["先寫你最有印象的那一個點，從那裡開始就好。"],
      probe: probe || "你寫的這件事，有沒有一個只有你知道的小細節可以加進去？",
      encouragement:
        encouragement || "你願意動筆，就已經跨出最難的一步了，慢慢寫。",
    };
  } catch {
    return null;
  }
}

async function handleCoach(
  request: Request,
): Promise<NextResponse<CoachResponse>> {
  let body: CoachRequest;
  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json({
      ok: false,
      feedback: null,
      fallbackToStatic: true,
      error: "invalid request body",
    });
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  try {
    const { query } = await import("@anthropic-ai/claude-agent-sdk");

    const response = query({
      prompt: buildUserPrompt(body),
      options: {
        systemPrompt: SYSTEM_PROMPT,
        allowedTools: [],
        disallowedTools: ["Bash", "Read", "Write", "Edit", "WebSearch", "WebFetch"],
        maxTurns: 1,
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
        if (message.subtype === "success") resultText = message.result;
        break;
      }
    }

    if (
      /invalid api key|please run \/login|not logged in|credit balance|insufficient/i.test(
        resultText,
      )
    ) {
      return NextResponse.json({
        ok: false,
        feedback: null,
        fallbackToStatic: true,
        error:
          "AI 未認證：請在這台電腦的終端機執行 `claude login`（或在 .env.local 填 ANTHROPIC_API_KEY）後重試。",
      });
    }

    const feedback = parseCoach(resultText);
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

export const POST = isStaticExport ? undefined : handleCoach;
