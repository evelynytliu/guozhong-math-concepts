// src/content/index.ts
// 單元註冊表。新增單元只要在這裡 import 進來、放進陣列即可，
// UI 會自動跑同一套五段式流程。

import type { Unit } from "./types";
import { unit01 } from "./unit-01";
import { unit02 } from "./unit-02";
import { unit03 } from "./unit-03";

// 依 order 排序，首頁與單元頁都用這個順序
export const units: Unit[] = [unit01, unit02, unit03].sort(
  (a, b) => a.order - b.order,
);

export function getUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id);
}

export function getNextUnit(id: string): Unit | undefined {
  const idx = units.findIndex((u) => u.id === id);
  if (idx === -1 || idx === units.length - 1) return undefined;
  return units[idx + 1];
}

export type { Unit } from "./types";
