// src/content/history/types.ts
// 歷史 3D 場景館的資料型別。
//
// 一個「場景（HistoryScene）」＝一段分幕推進的 3D 故事：
//   幕（stage）→ 鏡頭飛到定點 → 旁白 → 點場景裡的發光熱點收集「名詞卡」→
//   全部收齊才能進下一幕 → 最後一幕是快問快答（答錯回鍋）→ 拿徽章。
//
// 名詞卡（HistoryTerm）是整個設計的核心：課本裡要背的名詞，
// 每張卡＝名詞＋一句人話解釋＋一個記憶鉤子（hook）。
// pos 是名詞熱點在 3D 世界裡的座標；camera 是每一幕的鏡頭位置。
// 3D 佈景本身在 src/components/history/three/，資料檔只管故事與座標。

export type Vec3 = [number, number, number];

export interface HistoryTerm {
  id: string; // 場景內唯一即可，進度儲存用 `${sceneId}:${termId}`
  term: string; // 課本上的名詞（要記起來的）
  emoji: string;
  explain: string; // 一句人話解釋（對 12 歲說的）
  hook: string; // 記憶鉤子：一句幫助記住的話
  pos: Vec3; // 熱點在 3D 世界的位置
}

export interface StageCamera {
  pos: Vec3;
  look: Vec3;
}

export interface HistoryStage {
  id: string;
  title: string; // 幕標題（像遊戲關卡名）
  kicker: string; // 幕上方的小字（時間/地點感，例「五萬年前・臺東長濱」）
  narration: string; // 旁白：生動、短、對孩子說話
  camera: StageCamera;
  terms: HistoryTerm[]; // 這一幕要收集的名詞卡（可為空）
}

export interface HistoryQuizQ {
  q: string;
  options: string[];
  answer: number; // options 索引
  explain: string; // 答完顯示的「為什麼」
}

export interface HistoryScene {
  id: string;
  lesson: number; // 第幾課（1~6）
  order: number; // 課內順序
  title: string;
  subtitle: string;
  emoji: string;
  minutes: number; // 預估遊玩分鐘（hub 卡顯示）
  stages: HistoryStage[];
  quiz: HistoryQuizQ[]; // 最終快問快答（答錯回鍋，全對過關）
  badge: { name: string; emoji: string }; // 通關徽章
}

// hub 上的課程規劃（含未實作的課，顯示「即將開放」）
export interface HistoryLessonPlan {
  lesson: number;
  title: string; // 課本課名
  scenes: { title: string; emoji: string; teaser: string }[]; // 未開放場景的預告
}
