// src/content/types.ts
// 所有單元共用的型別。重點：把「引導推導」設計成 parts[] 陣列、
// 「變形題」設計成 questions[] 陣列，這樣同一套五段式結構能直接套到
// 任何單元（負數、應用題、因倍數…），不用為每個單元改 UI。

export type CheckMode = "static" | "ai";

// 老師語音（旁白）用的 key：對應五段式的每一段。
// 每個單元都可以針對這幾段手寫一段「給耳朵聽」的旁白稿（見 content/narration.ts）；
// 沒手寫的段落，lib/narration.ts 會自動從畫面內容生成可朗讀的版本。
export type NarrationKey = "intro" | "guided" | "explain" | "variants" | "recap";

export type UnitNarration = Partial<Record<NarrationKey, string>>;

// 互動類型。前端依這個值決定要渲染哪種輸入元件。
//   input            → 純文字／數字輸入
//   choice           → 選擇題（需提供 choices）
//   number-line-click→ 在數線上點一個位置
//   number-line-walk → 在數線上「走路」（提供起點與每一步的位移）
export type StepType = "input" | "choice" | "number-line-click" | "number-line-walk";

// 數線互動的設定（給 NumberLine 元件用）
export interface NumberLineConfig {
  min: number;
  max: number;
  // number-line-click：正確答案的座標
  target?: number;
  // number-line-walk：起點 + 每一步位移（例如 [+5, -3]），讓孩子按步驟走
  start?: number;
  walk?: number[];
}

export interface GuidedStep {
  prompt: string;
  type: StepType;
  answer: string; // 參考答案（孩子作答後展開對照）
  insight: string; // 這一步要他「看見」的概念，作答後顯示
  choices?: string[]; // type === "choice" 時提供
  numberLine?: NumberLineConfig; // 數線型互動時提供
}

export interface GuidedPart {
  title: string;
  steps: GuidedStep[];
}

export type SelfAssessment = "got_it" | "partial" | "cant_explain";

export interface SelfAssessmentOption {
  value: SelfAssessment;
  label: string;
}

export interface VariantQuestion {
  id: string;
  question: string;
  type: StepType;
  answer: string;
  // 這題其實在考概念的哪個面向（不只給對錯，要讓孩子看見）
  testingWhat: string;
  // 第 1 題刻意像教材；第 2、3 題換外觀。用來抓「會題型但概念沒遷移」。
  likeTextbook: boolean;
  choices?: string[];
  numberLine?: NumberLineConfig;
}

// 練習區：接在五段式流程後面，分「手感題」和「變形題挑戰」兩塊。
// 手感題：換數字的純計算，練熟練度用，明確標示「只是練手感」。
// 變形題挑戰：題庫 10-12 題，每次隨機抽 5 題，同概念不同情境/問法。

export interface DrillQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface ChallengeQuestion {
  id: string;
  question: string;
  answer: string;
  // 作答後顯示：這題其實在考概念的哪個面向
  conceptAspect: string;
  difficulty: "basic" | "transfer" | "synthesis";
}

export interface PracticeZone {
  drill: {
    note: string;
    questions: DrillQuestion[];
  };
  challenge: {
    heading: string;
    bank: ChallengeQuestion[];
  };
}

export interface Unit {
  id: string;
  title: string;
  order: number;
  checkMode: CheckMode;
  summary: string;
  practiceZone?: PracticeZone;

  // 第 1 段：情境引入
  section1_intro: {
    heading: string;
    body: string[];
    warmup: { question: string; answer: string };
  };

  // 第 2 段：引導推導（自己長出規則）
  section2_guided: {
    heading: string;
    parts: GuidedPart[];
  };

  // 第 3 段：用自己的話解釋
  section3_explain: {
    heading: string;
    prompt: string;
    referenceAnswer: string[];
    selfAssessment: SelfAssessmentOption[];
    onCantExplain: string;
    // AI 模式才用得到：給 AI 判斷時的額外脈絡（這個單元在考什麼概念）
    aiConceptHint?: string;
  };

  // 第 4 段：變形題驗證
  section4_variants: {
    heading: string;
    questions: VariantQuestion[];
    feedbackRules: {
      allCorrect: string;
      firstOnlyCorrect: string;
      someWrong: string;
    };
  };

  // 第 5 段：回扣（口頭解釋）
  section5_recap: {
    heading: string;
    prompt: string;
    note: string;
  };
}
