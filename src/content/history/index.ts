// src/content/history/index.ts
// 歷史 3D 場景館的註冊表。
//
// 加新場景：寫一個 scene-*.ts（照 types.ts 的 HistoryScene），import 進來加入
// historyScenes 陣列，並在 src/components/history/three/ 加對應佈景元件、
// 在 scene-canvas.tsx 的 DIORAMAS 註冊。

import type { HistoryLessonPlan, HistoryScene } from "./types";
import { sceneThreeW } from "./scene-0-three-w";
import { sceneCave } from "./scene-1-cave";
import { sceneAustronesian } from "./scene-1-austronesian";
import { sceneAgeOfSail } from "./scene-2-age-of-sail";
import { sceneTwoForts } from "./scene-2-two-forts";
import { sceneKoxinga } from "./scene-2-koxinga";
import { sceneChurch } from "./scene-3-church";
import { sceneConflict } from "./scene-3-conflict";
import { sceneCrossing } from "./scene-4-crossing";
import { sceneReform } from "./scene-4-reform";
import { sceneWater } from "./scene-5-water";
import { scenePorts } from "./scene-5-ports";
import { sceneTrade } from "./scene-5-trade";
import { sceneFrontier } from "./scene-6-frontier";
import { sceneMackay } from "./scene-6-mackay";
import { scenePingpu } from "./scene-6-pingpu";

export const historyScenes: HistoryScene[] = [
  sceneThreeW,
  sceneCave,
  sceneAustronesian,
  sceneAgeOfSail,
  sceneTwoForts,
  sceneKoxinga,
  sceneChurch,
  sceneConflict,
  sceneCrossing,
  sceneReform,
  sceneWater,
  scenePorts,
  sceneTrade,
  sceneFrontier,
  sceneMackay,
  scenePingpu,
];

export function getHistoryScene(id: string): HistoryScene | undefined {
  return historyScenes.find((s) => s.id === id);
}

// 課本（康軒・第二單元 臺灣的歷史(上)）的整體規劃。
// 全部課次都已實作，scenes 留空（hub 直接列 historyScenes）。
export const historyLessonPlans: HistoryLessonPlan[] = [
  { lesson: 0, title: "序章｜學習歷史的 3 個 W", scenes: [] },
  { lesson: 1, title: "史前文化與原住民族", scenes: [] },
  { lesson: 2, title: "大航海時代各方勢力在臺灣", scenes: [] },
  { lesson: 3, title: "大航海時代臺灣原住民與外來者", scenes: [] },
  { lesson: 4, title: "清帝國時期的行政治理", scenes: [] },
  { lesson: 5, title: "清帝國時期的農商發展", scenes: [] },
  { lesson: 6, title: "清帝國時期的社會與文化", scenes: [] },
];

export function scenesForLesson(lesson: number): HistoryScene[] {
  return historyScenes
    .filter((s) => s.lesson === lesson)
    .sort((a, b) => a.order - b.order);
}
