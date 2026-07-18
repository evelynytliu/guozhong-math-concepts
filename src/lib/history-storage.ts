// src/lib/history-storage.ts
// 歷史 3D 場景館的進度儲存——v1 先只存 localStorage（本機）。
// 之後要上雲再比照 quiz-storage 加 Supabase append-only 存檔。
//
// 存什麼：每個場景走到第幾幕、收集了哪些名詞卡、快問快答是否通過（＝拿到徽章）。

"use client";

export interface SceneProgress {
  sceneId: string;
  stageIndex: number; // 目前走到第幾幕（resume 用）
  collected: string[]; // 已收集的名詞卡 id（場景內 id）
  quizPassed: boolean; // 快問快答全對過 → 徽章到手
  firstTryCorrect?: number; // 最近一次快問快答「一次就對」的題數（實力分）
  completedAt?: string; // ISO 時間
}

const KEY = "history3d_progress_v1";

type ProgressMap = Record<string, SceneProgress>;

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // 存不進去（隱私模式等）就算了，不能擋孩子玩
  }
}

export function getAllSceneProgress(): ProgressMap {
  return readAll();
}

export function getSceneProgress(sceneId: string): SceneProgress {
  return (
    readAll()[sceneId] ?? {
      sceneId,
      stageIndex: 0,
      collected: [],
      quizPassed: false,
    }
  );
}

export function saveSceneProgress(p: SceneProgress) {
  const map = readAll();
  map[p.sceneId] = p;
  writeAll(map);
}

export function collectTerm(sceneId: string, termId: string): SceneProgress {
  const p = getSceneProgress(sceneId);
  if (!p.collected.includes(termId)) p.collected = [...p.collected, termId];
  saveSceneProgress(p);
  return p;
}

export function setStageIndex(sceneId: string, stageIndex: number): SceneProgress {
  const p = getSceneProgress(sceneId);
  p.stageIndex = Math.max(p.stageIndex, stageIndex);
  saveSceneProgress(p);
  return p;
}

export function completeSceneQuiz(
  sceneId: string,
  firstTryCorrect: number,
): SceneProgress {
  const p = getSceneProgress(sceneId);
  p.quizPassed = true;
  p.firstTryCorrect = firstTryCorrect;
  p.completedAt = new Date().toISOString();
  saveSceneProgress(p);
  return p;
}

// hub 統計：拿到幾個徽章、收集幾張名詞卡
export function historyStats(sceneIds: string[]) {
  const map = readAll();
  let badges = 0;
  let cards = 0;
  for (const id of sceneIds) {
    const p = map[id];
    if (!p) continue;
    if (p.quizPassed) badges++;
    cards += p.collected.length;
  }
  return { badges, cards };
}
