// src/lib/narration.ts
// 老師語音的「文字來源」與清理邏輯。重點：runtime 的瀏覽器語音（Web Speech）
// 和離線生成的 mp3（scripts/generate-audio.mts）都呼叫這裡的 getNarrationText，
// 確保「自然版 mp3」和「系統版語音」念的是同一段話。
//
// 沒有相依 React / Next，純資料函式，所以生成腳本（Node + tsx）也能直接 import。
// 注意：這裡刻意用「相對路徑」import（不是 @/ 別名），因為生成腳本用 tsx 執行，
// 預設不解析 tsconfig 的 paths；保持整條 content/lib 鏈無別名，腳本才載得進來。

import type { Unit, NarrationKey } from "../content/types";
import { narrations } from "../content/narration";

export const NARRATION_KEYS: NarrationKey[] = [
  "intro",
  "guided",
  "explain",
  "variants",
  "recap",
];

// 段落對應的中文標籤（按鈕 title / 面板用）
export const NARRATION_LABELS: Record<NarrationKey, string> = {
  intro: "情境引入",
  guided: "引導推導",
  explain: "用自己的話解釋",
  variants: "變形題驗證",
  recap: "回扣",
};

// 把「給眼睛看」的文字，整理成「給耳朵聽」也不會出包的字串。
// 主要處理：去掉表情符號與裝飾符號、把容易被念錯的數學符號換成中文、
// 換行轉成停頓、引號去掉、空白收斂。
export function cleanForSpeech(input: string): string {
  let s = input;

  // 換行 → 句中停頓
  s = s.replace(/\r?\n+/g, "，");

  // 箭頭 → 語氣連接（要在「去符號」之前做，否則箭頭會先被清掉）
  s = s.replace(/[→⇒➜➡]/g, "，接著，");

  // 數學符號 → 中文（主要給「自動生成」的備援文字用；手寫稿已盡量避免）
  s = s.replace(/×/g, "乘以");
  s = s.replace(/÷/g, "除以");
  s = s.replace(/[＝=]/g, "等於");
  s = s.replace(/≠/g, "不等於");
  s = s.replace(/≥/g, "大於等於").replace(/≤/g, "小於等於");
  s = s.replace(/[＞>]/g, "大於").replace(/[＜<]/g, "小於");

  // 條列點、置中點 → 停頓
  s = s.replace(/[・·•‧]/g, "，");

  // 去掉表情符號（astral 區的 emoji，用代理對範圍，避免 u flag）
  s = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
  // 去掉 BMP 區的雜項符號／箭頭／幾何圖形／變體選擇子／ZWJ（刻意跳過 ①②③ 等圈號）
  s = s.replace(
    /[←-⇿⌀-⏿■-⛿✀-➿⬀-⯿️‍]/g,
    "",
  );

  // 引號 / 括號裝飾去掉（保留逗號句號的語氣）
  s = s.replace(/[「」『』“”"]/g, "");
  s = s.replace(/[（）()]/g, "，");

  // 省略號 → 停頓
  s = s.replace(/[…⋯]+/g, "，");
  s = s.replace(/\.{2,}/g, "，");

  // 收斂重複標點與空白
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/，\s*，+/g, "，");
  s = s.replace(/，\s*。/g, "。");
  s = s.replace(/^[，、。\s]+/, "");
  s = s.replace(/[，、\s]+$/, "");

  return s.trim();
}

// 沒手寫旁白時，從單元內容自動長出一段可朗讀的文字（備援，不爆雷答案）。
function deriveNarration(unit: Unit, key: NarrationKey): string {
  switch (key) {
    case "intro": {
      const s = unit.section1_intro;
      return [s.heading, ...s.body].filter(Boolean).join("，");
    }
    case "guided": {
      const s = unit.section2_guided;
      const partTitles = s.parts.map((p) => p.title).join("；");
      return `${s.heading}。我們會分成這幾個部分：${partTitles}。一步一步來，不要急著背結論，跟著想就好。`;
    }
    case "explain": {
      const s = unit.section3_explain;
      return `${s.heading}。${s.prompt}`;
    }
    case "variants": {
      const s = unit.section4_variants;
      return `${s.heading}。這幾題考的是同一個概念，只是換了外觀，每題寫完再展開對照。`;
    }
    case "recap": {
      const s = unit.section5_recap;
      return `${s.heading}。${s.prompt}`;
    }
  }
}

// 取得某單元某段的旁白文字：優先用手寫稿，沒有就自動生成；最後一律過清理。
export function getNarrationText(unit: Unit, key: NarrationKey): string {
  const handwritten = narrations[unit.id]?.[key];
  const raw = handwritten ?? deriveNarration(unit, key);
  return cleanForSpeech(raw);
}
