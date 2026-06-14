// src/content/homework/vocab.ts
// 從 RAW_VOCAB 建出「出題卡」「分組」與「批改」邏輯。
//
// 設計重點（對應使用者要求「確保每個單字都答對」）：
//   1. 同一個中文對應多個英文 → 合併成一張卡，拼出任一個就算對（公平、不冤枉）。
//   2. 批改用 normalize：只看字母、容忍大小寫/空白/標點
//      （T-shirt = tshirt、P.E. = pe、ice cream = icecream）。
//   3. drill 流程（在 vocab-drill.tsx）：答錯的字會「回鍋」排到後面，
//      整組只有在『每個字都答對過』才結束 → 保證全對。

import type { RawVocab, VocabBatch, VocabCard, VocabHomework } from "./types";
import { RAW_VOCAB } from "./vocab-list";

// 批改用：轉小寫、只留 a–z 字母（去掉空白、句點、連字號、斜線等）
export function normalizeWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

// 一張卡所有可接受的拼法（含 accept），給批改與「展開正解」用
function answersOf(raw: RawVocab): string[] {
  return [raw.en, ...(raw.accept ?? [])];
}

// 把 RAW 依「相同中文」合併成卡：例 看 = [look]、看見 = [see]…
// （注意：刻意用「中文字面」當 key。look/see/watch 在原表中文不同
//   （看 / 看見 / 觀看；手錶），所以是三張不同的卡，各自獨立練——
//   只有中文完全一樣的（爸爸=dad/father）才合併。）
export function buildCards(raw: RawVocab[] = RAW_VOCAB): VocabCard[] {
  const byZh = new Map<string, VocabCard>();
  for (const w of raw) {
    const existing = byZh.get(w.zh);
    if (existing) {
      for (const a of answersOf(w)) {
        if (!existing.answers.includes(a)) existing.answers.push(a);
      }
    } else {
      byZh.set(w.zh, {
        id: `v-${byZh.size}`,
        zh: w.zh,
        answers: [...answersOf(w)],
      });
    }
  }
  return Array.from(byZh.values());
}

// 切成一組一組（預設每組 ~18 張），組名顯示首尾英文，方便「今天先背這一組」
export function buildBatches(size = 18): VocabBatch[] {
  const cards = buildCards();
  const batches: VocabBatch[] = [];
  for (let i = 0; i < cards.length; i += size) {
    const chunk = cards.slice(i, i + size);
    const first = chunk[0].answers[0];
    const last = chunk[chunk.length - 1].answers[0];
    batches.push({
      id: `batch-${batches.length + 1}`,
      label: `${first} – ${last}`,
      cards: chunk,
    });
  }
  return batches;
}

export const VOCAB_BATCHES = buildBatches();
export const VOCAB_TOTAL = buildCards().length;

// 批改一張卡：輸入經 normalize 後，比對任一可接受拼法
export function isVocabCorrect(input: string, card: VocabCard): boolean {
  const got = normalizeWord(input);
  if (!got) return false;
  return card.answers.some((a) => normalizeWord(a) === got);
}

// 英文單字表這份作業的 meta
export const vocabHomework: VocabHomework = {
  id: "hw-english-vocab",
  subject: "英文",
  subjectEmoji: "🔤",
  title: "英文單字表・拼到全對",
  order: 1,
  kind: "vocab",
  pdfNote: "暑假作業・英文科 單字表（共 3 面）",
  parentSignNote:
    "作業本上的單字表要『家長確認孩子已背完後簽名』。這裡是幫你練到全對的地方——每個字都拼對之後，再請爸媽簽名。",
  intro: [
    `這份作業有 ${VOCAB_TOTAL} 個單字。我們不要「看過就算」，要練到「每一個都拼得出來」。`,
    "玩法：螢幕給你中文，你把英文拼出來。拼對就過；拼錯沒關係，那個字會排到後面再出現一次，直到你把它記起來。",
    "一次練一組就好（大概 18 個字），不用一口氣全部背完。練完一組，明天再練下一組。",
    "大小寫、空白、句點都不會算你錯，只看字母拼對沒有（T-shirt 打成 tshirt 也算對）。",
  ],
  paperNote:
    "作業本上的單字表是給家長檢查、簽名用的。你在這裡把每個字練到全對，背起來之後，作業本那一欄就請爸媽簽名。",
};
