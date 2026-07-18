// src/content/history/index.ts
// 歷史 3D 場景館的註冊表。
//
// 加新場景：寫一個 scene-*.ts（照 types.ts 的 HistoryScene），import 進來加入
// historyScenes 陣列，並在 src/components/history/three/ 加對應佈景元件、
// 在 scene-canvas.tsx 的 DIORAMAS 註冊。未實作的課放在 lessonPlans 顯示「即將開放」。

import type { HistoryLessonPlan, HistoryScene } from "./types";
import { sceneCave } from "./scene-1-cave";
import { sceneAustronesian } from "./scene-1-austronesian";
import { sceneAgeOfSail } from "./scene-2-age-of-sail";
import { sceneTwoForts } from "./scene-2-two-forts";
import { sceneKoxinga } from "./scene-2-koxinga";

export const historyScenes: HistoryScene[] = [
  sceneCave,
  sceneAustronesian,
  sceneAgeOfSail,
  sceneTwoForts,
  sceneKoxinga,
];

export function getHistoryScene(id: string): HistoryScene | undefined {
  return historyScenes.find((s) => s.id === id);
}

// 課本（康軒・第二單元 臺灣的歷史(上)）6 課的整體規劃。
// 已實作的課：scenes 留空（hub 直接列 historyScenes）；
// 未實作的課：scenes 放預告卡（之後照 HISTORY3D-PLAN.md 逐課補上）。
export const historyLessonPlans: HistoryLessonPlan[] = [
  { lesson: 1, title: "史前文化與原住民族", scenes: [] },
  { lesson: 2, title: "大航海時代各方勢力在臺灣", scenes: [] },
  {
    lesson: 3,
    title: "大航海時代臺灣原住民與外來者",
    scenes: [
      {
        title: "教堂與獵場",
        emoji: "⛪",
        teaser: "傳教士、新港文書與鹿皮交易——原住民遇上歐洲人",
      },
      {
        title: "衝突與共存",
        emoji: "🤝",
        teaser: "軍屯開進獵場之後——原住民與鄭氏政權的互動",
      },
    ],
  },
  {
    lesson: 4,
    title: "清帝國時期的行政治理",
    scenes: [
      {
        title: "渡臺悲歌",
        emoji: "🌊",
        teaser: "渡臺禁令與黑水溝——移民偷渡的驚險路",
      },
      {
        title: "從消極到建省",
        emoji: "🏛️",
        teaser: "牡丹社事件敲響警鐘，沈葆楨、劉銘傳接力改革",
      },
    ],
  },
  {
    lesson: 5,
    title: "清帝國時期的農商發展",
    scenes: [
      {
        title: "水圳與良田",
        emoji: "💧",
        teaser: "把荒地變良田的水利工程大冒險",
      },
      {
        title: "一府二鹿三艋舺",
        emoji: "🏮",
        teaser: "郊商與港口城市的黃金年代",
      },
      {
        title: "茶・糖・樟腦",
        emoji: "🍵",
        teaser: "開港之後，臺灣特產賣向全世界",
      },
    ],
  },
  {
    lesson: 6,
    title: "清帝國時期的社會與文化",
    scenes: [
      {
        title: "移墾江湖",
        emoji: "🥋",
        teaser: "羅漢腳、械鬥與民變——移民社會的生存法則",
      },
      {
        title: "馬偕與新事物",
        emoji: "🏥",
        teaser: "西方文化再傳入：教會、醫療與學堂",
      },
      {
        title: "改變中的原住民社會",
        emoji: "🌾",
        teaser: "土地流失與文化變遷——原住民社會的轉折",
      },
    ],
  },
];

export function scenesForLesson(lesson: number): HistoryScene[] {
  return historyScenes
    .filter((s) => s.lesson === lesson)
    .sort((a, b) => a.order - b.order);
}
