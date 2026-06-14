// src/content/homework/index.ts
// 暑假作業註冊表。新增一份作業只要在這裡 import 進來、放進陣列，
// 首頁與 /homework/[id] 會自動跑對應的流程（draft 草稿 / vocab 拼字）。

import type { Homework } from "./types";
import { vocabHomework } from "./vocab";
import { chineseReadingHomework } from "./hw-chinese";
import { mathConceptHomework } from "./hw-math";
import { biologyHomework } from "./hw-biology";
import { socialGrowthHomework } from "./hw-social";

export const homeworks: Homework[] = [
  vocabHomework,
  chineseReadingHomework,
  mathConceptHomework,
  biologyHomework,
  socialGrowthHomework,
].sort((a, b) => a.order - b.order);

export function getHomework(id: string): Homework | undefined {
  return homeworks.find((h) => h.id === id);
}

export type { Homework } from "./types";
