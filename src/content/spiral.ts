// src/content/spiral.ts
// 螺旋複習題庫：把每個單元的「核心概念」做成簡短的新題目。
// 目的：複習舊概念，但用「新外觀的題目」呈現，不必重看舊教材
//（這個孩子討厭重複看內容，所以複習一律用新題、自評對照）。
//
// 每題標記它在複習「哪個單元的哪個概念」，做完顯示出來，
// 讓孩子看見「這題其實在練我之前學的 ___」。

export interface SpiralQuestion {
  id: string;
  unitId: string; // 對應的單元
  concept: string; // 在複習的概念（會顯示給孩子看）
  question: string;
  answer: string; // 參考答案（自評對照）
}

export const spiralPool: SpiralQuestion[] = [
  // 單元 1：負數與數線・絕對值＝距離
  { id: "s01a", unitId: "unit-01", concept: "絕對值＝離 0 的距離", question: "比較 -15 和 +9 的絕對值（寫成 |-15| 和 |+9|），哪個離 0 比較遠？為什麼？", answer: "|-15|=15、|+9|=9，比的是距離，所以 -15 離 0 比較遠。" },
  { id: "s01b", unitId: "unit-01", concept: "數線上的移動", question: "從 -4 出發，往右走 7 格，會停在哪裡？", answer: "+3（-4 往右 7 格 = -4+7 = 3）。" },
  { id: "s01c", unitId: "unit-01", concept: "負數的加減（情境）", question: "氣溫原本 3°C，下降了 8 度，現在幾度？", answer: "-5°C（3 - 8 = -5）。" },

  // 單元 2：整數的四則運算・負負得正
  { id: "s04a", unitId: "unit-04", concept: "負負得正", question: "(-7) × (-2) = ?", answer: "14。負負得正（兩個負相乘變正）。" },
  { id: "s04b", unitId: "unit-04", concept: "減一個負數＝加正數", question: "-5 - (-9) = ? 並說說為什麼等於 -5 + 9。", answer: "4；減去一個負數就是把那筆負的拿走，等於加上正數，所以 -5+9 = 4。" },
  { id: "s04c", unitId: "unit-04", concept: "異號相乘得負", question: "(-3) × 4 = ?", answer: "-12（一正一負，異號得負）。" },

  // 單元 3：一元一次方程式解法・等量公理
  { id: "s05a", unitId: "unit-05", concept: "等量公理（兩邊做一樣的事）", question: "解 2x - 4 = 10", answer: "x = 7。兩邊同加 4 → 2x = 14，兩邊同除以 2 → x = 7。" },
  { id: "s05b", unitId: "unit-05", concept: "未知數在哪邊都一樣", question: "解 7 = 3x + 1", answer: "x = 2。兩邊同減 1 → 6 = 3x，兩邊同除以 3 → x = 2。" },
  { id: "s05c", unitId: "unit-05", concept: "含括號的方程式", question: "解 2(x - 1) = 8", answer: "x = 5。兩邊同除以 2 → x - 1 = 4 → x = 5（或先展開）。" },

  // 單元 4：一元一次應用題・找等量關係
  { id: "s02a", unitId: "unit-02", concept: "找等量關係列式", question: "兩個數的和是 20、差是 4，較小的數是多少？", answer: "8。設較小為 x，x + (x+4) = 20 → x = 8。" },
  { id: "s02b", unitId: "unit-02", concept: "同一等量關係換情境", question: "一條 24 公分緞帶剪成兩段，長的比短的多 6 公分，短的幾公分？", answer: "9 公分。x + (x+6) = 24 → x = 9（跟『和20差4』是同一型）。" },
  { id: "s02c", unitId: "unit-02", concept: "把文字翻成方程式", question: "哥哥年齡是妹妹的 2 倍，兩人相差 12 歲，妹妹幾歲？", answer: "12 歲。設妹妹 x，2x - x = 12 → x = 12。" },

  // 單元 5：因數倍數・GCD / LCM
  { id: "s03a", unitId: "unit-03", concept: "最大公因數 GCD", question: "求 16 和 24 的最大公因數。", answer: "8。" },
  { id: "s03b", unitId: "unit-03", concept: "最小公倍數 LCM（判斷類型）", question: "兩盞燈分別每 8 秒、每 12 秒閃一次，幾秒後會同時閃？", answer: "24 秒。這是『下次再一起』→ 用 LCM(8,12)=24。" },
  { id: "s03c", unitId: "unit-03", concept: "GCD 應用（平分）", question: "把 18 顆和 30 顆糖分成『一樣的最多袋』（都不剩），幾袋？", answer: "6 袋。『平分成最多份』→ 用 GCD(18,30)=6。" },

  // 單元 6：比與比例式
  { id: "s06a", unitId: "unit-06", concept: "解比例式", question: "解 x : 8 = 3 : 4", answer: "x = 6（交叉相乘 4x = 24，背後是兩邊同乘）。" },
  { id: "s06b", unitId: "unit-06", concept: "比的份數（情境）", question: "果汁 : 水 = 2 : 5，要調 21 杯飲料（果汁和水加起來共 21 杯），水要幾杯？", answer: "15 杯。一共 7 份、每份 3 杯，水佔 5 份 = 15 杯。" },
  { id: "s06c", unitId: "unit-06", concept: "先判斷正比/反比", question: "3 個工人 6 天蓋好一道牆，6 個工人要幾天？", answer: "3 天。人多天數少 → 這是反比！總工作量 18 人天 ÷ 6 人 = 3 天（別反射交叉相乘）。" },

  // 單元 7：指數與科學記號
  { id: "s07a", unitId: "unit-07", concept: "同底數相乘・指數相加", question: "2³ × 2⁴ = ?（用次方表示），並說一句為什麼指數是相加。", answer: "2⁷。因為 3 個 2 和 4 個 2 接起來共 7 個 2 相乘，所以指數相加（不是相乘）。" },
  { id: "s07b", unitId: "unit-07", concept: "次方＝連乘，不是乘", question: "3⁴ 是多少？它跟 3×4 一樣嗎？", answer: "3⁴ = 81（3 連乘 4 次）；3×4 = 12，不一樣。" },
  { id: "s07c", unitId: "unit-07", concept: "科學記號", question: "把 52000 寫成科學記號。", answer: "5.2 × 10⁴。" },

  // 單元 8：分數的四則運算
  { id: "s08a", unitId: "unit-08", concept: "加法要通分", question: "1/2 + 1/3 = ?，並說為什麼不能等於 2/5。", answer: "5/6。分母不同代表塊大小不同，要先通分成 3/6 + 2/6 才能加；直接加分子分母（2/5）會比 1/2 還小，不合理。" },
  { id: "s08b", unitId: "unit-08", concept: "乘法不用通分", question: "2/3 × 3/5 = ?", answer: "2/5。分子乘分子、分母乘分母 = 6/15 = 2/5，乘法不通分。" },
  { id: "s08c", unitId: "unit-08", concept: "除以分數＝顛倒相乘", question: "3/4 ÷ 1/2 = ? 並說為什麼可以顛倒相乘。", answer: "3/2。除以一個數＝乘它的倒數，所以 ÷(1/2) = ×2，得 3/4 × 2 = 3/2。" },
];

// 依「可複習的單元」挑出一份混合小測。
// availableUnitIds：孩子已開始/完成、可被複習的單元（依先修順序傳入）。
// 盡量讓題目分散到不同單元（round-robin），達到「跨單元混合」。
export function pickSpiral(
  availableUnitIds: string[],
  n: number,
): SpiralQuestion[] {
  let unitIds = availableUnitIds.filter((id) =>
    spiralPool.some((q) => q.unitId === id),
  );
  // 還沒有任何單元 → 至少用單元 1 暖身
  if (unitIds.length === 0) unitIds = ["unit-01"];

  // 依單元分組並洗牌
  const byUnit = new Map<string, SpiralQuestion[]>();
  for (const id of unitIds) {
    const qs = spiralPool.filter((q) => q.unitId === id);
    byUnit.set(id, shuffle(qs));
  }

  // round-robin 跨單元取題，達到混合
  const picked: SpiralQuestion[] = [];
  let added = true;
  while (picked.length < n && added) {
    added = false;
    for (const id of shuffle(unitIds)) {
      const bucket = byUnit.get(id);
      if (bucket && bucket.length > 0) {
        picked.push(bucket.shift() as SpiralQuestion);
        added = true;
        if (picked.length >= n) break;
      }
    }
  }
  return picked;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
