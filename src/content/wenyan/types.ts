// src/content/wenyan/types.ts
// 國文・文言文「古今異義」單元的型別。
//
// 跟數學的五段式概念單元(src/content/types.ts)、暑假作業(src/content/homework/types.ts)
// 是第三套獨立結構，但教學靈魂一模一樣——破解「背」：
//   數學：背公式 → 逼你自己推、自己講、換外觀驗證
//   文言文：背「走＝跑」這種對照表 → 逼你從字形/上下文「推出」古義，
//           再用「沒看過的新句子」驗證你是真的會遷移，還是只背了課本那一句。
//
// 這正是 CLAUDE.md 的孩子核心問題在國文的版本：
//   「背了課本例句，換一句陌生的文言文就不會了」＝ 只會題型、概念沒遷移。
//
// 每個「字」都照同一套五拍流程（對應五段式）：
//   1 你以為你懂（情境）→ 2 自己推出古義（引導推導）→ 3 用自己的話說（Feynman）
//   → 4 換句子驗證（變形題）→ 5 講給家人聽（回扣）
// UI 由 components/wenyan/wenyan-flow.tsx 自動套用，加新字只要新增一個資料檔。

// 一條注釋（點字詞展開）
export interface WenyanGloss {
  term: string; // 要解釋的字詞，例「挈」
  gloss: string; // 白話解釋，例「帶、領」
}

// 課本主例句（第 2 段用）
export interface WenyanExample {
  sentence: string; // 例句原文（含目標字）
  target: string; // 例句裡的目標字詞，會被標色（需與 sentence 中的字完全一致）
  source: string; // 出處，例「〈口技〉．林嗣環」
  translation: string; // 白話翻譯
  notes: WenyanGloss[]; // 逐字注釋
}

// 變形題：一句「課本沒出現過」的新文言文，考同一個字
export interface WenyanVariant {
  id: string;
  sentence: string;
  target: string; // 句中的目標字詞（標色用）
  source: string;
  prompt: string; // 問法，例「這裡的『走』是什麼意思？」
  choices: string[]; // 選項（意思）
  answer: string; // 正解（choices 之一）
  translation: string; // 揭曉後顯示的白話翻譯
  testingWhat: string; // 這題其實在考概念的哪個面向
  likeTextbook: boolean; // 第 1 題刻意跟課本最像；其餘換情境/換用法
}

// 「走路家族」這種延伸對照（只有部分字用得到，例「走」）
export interface WenyanRelated {
  char: string; // 例「奔」
  meaning: string; // 例「快跑」
  example?: string; // 例「猛浪若奔」
}

export interface ClassicalWord {
  id: string; // 例「zou」
  order: number;
  word: string; // 「走」「妻子」
  pinyin?: string; // 「zǒu」
  // 首頁卡片用的一句話（今義 vs 古義的反差）
  teaser: string;

  // ── 第 1 拍：你以為你懂（情境引入）──
  hook: {
    modernBubble: string; // 孩子以為的今義（照課本那顆自信的對話框口吻）
    twist: string; // 老師的一句翻轉：其實古代不一樣
  };
  modernMeaning: string; // 今義（現在的用法）
  ancientMeaning: string; // 古義（這一拍結束要推出來的目標）

  // ── 第 2 拍：自己推出古義（引導推導）──
  // 線索一：字形演變（金文/甲骨文的「畫」），沒有就省略
  glyph?: {
    form: string; // 字形描述，例「金文的『走』上面是甩動雙臂的人、下面是一隻腳」
    insight: string; // 從字形看出的本義
  };
  example: WenyanExample; // 線索二：課本主例句
  guessPrompt: string; // 「在這一句裡，『走』是什麼意思？」
  guessChoices: string[];
  guessAnswer: string;
  derived: string; // 推導結論：古義是什麼、為什麼（含道理）

  // ── 第 3 拍：用自己的話說（Feynman，靜態對照）──
  explainPrompt: string;
  referenceExplain: string[]; // 參考解釋（孩子寫完自己對照）

  // ── 第 4 拍：換句子驗證（變形題）──
  variants: WenyanVariant[];
  variantFeedback: {
    allCorrect: string;
    firstOnlyCorrect: string; // 課本題對、新句子錯＝背了沒遷移
    someWrong: string;
  };

  // ── 第 5 拍：講給家人聽（回扣）──
  recap: string;

  // 延伸小知識（對應課本的「小古寶箱」），可省略
  treasureBox?: string;
  related?: WenyanRelated[];
}
