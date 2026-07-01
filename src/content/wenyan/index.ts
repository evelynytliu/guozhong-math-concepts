// src/content/wenyan/index.ts
// 文言文「古今異義」字表註冊表。新增一個字，只要在這裡 import 進來、放進陣列，
// 首頁與 /wenyan/[id] 會自動跑同一套五拍流程。
// 內容來源：《文言文輕鬆學（上）》「不一樣的古今異義」。

import type { ClassicalWord } from "./types";
import { qizi } from "./qizi";
import { zou } from "./zou";
import { furen } from "./furen";
import { zhongren } from "./zhongren";
import { xiaoren } from "./xiaoren";

// 依 order 排序（由淺入深：妻子→走→夫人→眾人→小人，小人最能驗收「看上下文」）
export const wenyanWords: ClassicalWord[] = [
  qizi,
  zou,
  furen,
  zhongren,
  xiaoren,
].sort((a, b) => a.order - b.order);

export function getWord(id: string): ClassicalWord | undefined {
  return wenyanWords.find((w) => w.id === id);
}

export function getNextWord(id: string): ClassicalWord | undefined {
  const idx = wenyanWords.findIndex((w) => w.id === id);
  if (idx === -1 || idx === wenyanWords.length - 1) return undefined;
  return wenyanWords[idx + 1];
}

export type { ClassicalWord } from "./types";
