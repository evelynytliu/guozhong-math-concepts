// src/content/curriculum.ts
// 「完整先修課表」——把現有 6 個數學單元編成一條有順序、有間隔複習檢核點的
// 導引式課程，對應學習原則：預習→推導→提取練習→間隔/交錯複習→Feynman 口頭驗收。
//
// 不新增單元內容，只是把單元串成課程；每一「學」步驟連到既有 /unit/[id]，
// 每個「複」檢核點連到 /review?checkpoint=rX（沿用螺旋複習），最後一步是口頭總驗收。
//
// 順序沿用單元 order：負數→整數運算→指數科記→方程式解法→應用題(AI)→因倍數→分數運算→比例。

import { getUnit } from "./index";
import type { Unit } from "./types";

export type CurriculumStepKind = "unit" | "review" | "milestone";

export interface CurriculumStep {
  id: string; // step-u1 / step-rA / step-final
  kind: CurriculumStepKind;
  phase: string; // 階段標題（連續相同的會被歸成一組）
  title: string;
  principle: string; // 這一步服務的學習原則（標籤）
  note: string; // 一句說明
  // kind === "unit"
  unitId?: string;
  // kind === "review"
  checkpointId?: string; // rA / rB / rC → /review?checkpoint=rX
  reviewUnitIds?: string[]; // 這個檢核點在複習哪些單元（也用來算間隔建議）
  spacingDays?: number; // 建議完成前面單元後幾天再來做（間隔效應）
}

const PHASE_1 = "階段一・數的世界（把負數打底）";
const PHASE_2 = "階段二・方程式（從解法到應用，最容易背題型）";
const PHASE_3 = "階段三・數的結構與關係";
const PHASE_FINAL = "結業・融會貫通驗收";

export const curriculum: CurriculumStep[] = [
  // ── 階段一 ──
  {
    id: "step-u1",
    kind: "unit",
    phase: PHASE_1,
    title: "負數與數線",
    unitId: "unit-01",
    principle: "推導＋用自己的話說",
    note: "從欠債/溫度推出負數，破解「絕對值＝去掉負號」的死背。",
  },
  {
    id: "step-u4",
    kind: "unit",
    phase: PHASE_1,
    title: "整數的四則運算（含負負得正）",
    unitId: "unit-04",
    principle: "提取練習",
    note: "讓「負負得正」是自己看出來的規律，不是背的口訣。",
  },
  {
    id: "step-u7",
    kind: "unit",
    phase: PHASE_1,
    title: "指數與科學記號",
    unitId: "unit-07",
    principle: "推導：把因數數一數",
    note: "指數律不是背「指數相加」，是把因數攤開、數個數自己看出來的。",
  },
  {
    id: "step-rA",
    kind: "review",
    phase: PHASE_1,
    title: "間隔複習 A：負數＋整數運算＋指數",
    checkpointId: "rA",
    reviewUnitIds: ["unit-01", "unit-04", "unit-07"],
    spacingDays: 3,
    principle: "間隔複習",
    note: "隔幾天用新題目混合練一遍——能在新外觀認出舊概念，才是真的記住。",
  },

  // ── 階段二 ──
  {
    id: "step-u5",
    kind: "unit",
    phase: PHASE_2,
    title: "一元一次方程式的解法（等量公理）",
    unitId: "unit-05",
    principle: "推導：等量公理",
    note: "用「天平兩邊做一樣的事」理解解法，不是背移項變號。",
  },
  {
    id: "step-u2",
    kind: "unit",
    phase: PHASE_2,
    title: "一元一次方程式・應用題　⭐AI 判斷",
    unitId: "unit-02",
    principle: "翻譯成方程式・AI 判斷理解",
    note: "「題目一活就錯」的重災區。學找等量關係，AI 會判斷你是真懂還是在背。",
  },
  {
    id: "step-rB",
    kind: "review",
    phase: PHASE_2,
    title: "間隔複習 B：混前面單元（偏應用題變形）",
    checkpointId: "rB",
    reviewUnitIds: ["unit-01", "unit-04", "unit-07", "unit-05", "unit-02"],
    spacingDays: 3,
    principle: "間隔＋交錯",
    note: "把前四個單元交錯著練，重點放在應用題換情境也抓得到等量關係。",
  },

  // ── 階段三 ──
  {
    id: "step-u3",
    kind: "unit",
    phase: PHASE_3,
    title: "因數倍數・最大公因數與最小公倍數",
    unitId: "unit-03",
    principle: "判斷何時用 GCD／LCM",
    note: "用鋪磁磚（GCD）、公車同時發車（LCM）的情境，知道什麼時候用哪個。",
  },
  {
    id: "step-u8",
    kind: "unit",
    phase: PHASE_3,
    title: "分數的四則運算",
    unitId: "unit-08",
    principle: "推導：塊要一樣大／除＝乘倒數",
    note: "加減為什麼通分、除法為什麼顛倒相乘，都是推出來的，不是背口訣（通分會用到剛學的 LCM）。",
  },
  {
    id: "step-u6",
    kind: "unit",
    phase: PHASE_3,
    title: "比與比例式",
    unitId: "unit-06",
    principle: "用推導不背口訣",
    note: "交叉相乘是用等量公理推出來的，不是背的口訣。",
  },
  {
    id: "step-rC",
    kind: "review",
    phase: PHASE_3,
    title: "總複習：混全部 8 單元",
    checkpointId: "rC",
    reviewUnitIds: [
      "unit-01",
      "unit-04",
      "unit-07",
      "unit-05",
      "unit-02",
      "unit-03",
      "unit-08",
      "unit-06",
    ],
    spacingDays: 4,
    principle: "交錯・驗收",
    note: "八個單元全部混在一起練，能分辨「這題該用哪一招」就是融會貫通了。",
  },

  // ── 結業 ──
  {
    id: "step-final",
    kind: "milestone",
    phase: PHASE_FINAL,
    title: "口頭總驗收：講給家人聽",
    principle: "Feynman 口頭驗收",
    note: "挑 3 個你覺得最重要的概念，闔上螢幕，用自己的話講給家人聽。講得清楚才算真懂。",
  },
];

export function getCurriculumStep(id: string): CurriculumStep | undefined {
  return curriculum.find((s) => s.id === id);
}

export function stepUnit(step: CurriculumStep): Unit | undefined {
  return step.unitId ? getUnit(step.unitId) : undefined;
}

// 課表裡所有「學單元」步驟數（用來算整體進度）。
export const totalUnitSteps = curriculum.filter(
  (s) => s.kind === "unit",
).length;
