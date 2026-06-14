// src/content/homework/types.ts
// 暑假作業「引導導師」的型別。
//
// 跟數學的「五段式概念單元」(src/content/types.ts) 是兩套不同結構：
//   - 數學單元 = 把一個概念推導 + 變形題驗證
//   - 暑假作業 = 幫孩子「打草稿」(draft) 或「背到全對」(vocab)
//
// 設計起點（CLAUDE.md 的孩子核心問題）也一樣套用在這裡：
//   不要直接給標準答案。報告類作業用「不同角度的提示(sparks)」刺激他思考、
//   讓他自己挑一個方向、用自己的話寫，草稿慢慢長出來。
//   寫完一定要提醒：草稿要『手抄』到作業本上才算交作業。

export type HomeworkKind = "draft" | "vocab";

export interface HomeworkBase {
  id: string; // 例 "hw-chinese-reading"
  subject: string; // "國文" / "數學" / "生物" / "社會" / "英文"
  subjectEmoji: string; // "📖"
  title: string; // "閱讀大挑戰・我是讀報小達人"
  order: number;
  kind: HomeworkKind;
  pdfNote: string; // 對應暑假作業哪一頁/份量
  // 進入作業前的說明（這份作業在做什麼、怎麼用這個工具）
  intro: string[];
  // 這份作業在真正的作業本上長什麼樣（讓孩子知道最後要抄成什麼）
  paperNote: string;
}

// ── 報告草稿型 (draft) ───────────────────────────────

export type DraftFieldType = "short" | "long" | "choice";

export interface DraftField {
  id: string; // 穩定 key，用來存草稿（換內容也別改 id）
  label: string; // 欄位標題，例「三、選擇這本書的原因」
  // 引導語：要他「想什麼」、什麼叫好答案。不是給答案，是給思考的方向。
  guide: string;
  // 「不同的答案選擇」——一組不同角度的提示。點一下會把一句開頭塞進輸入框，
  // 讓他接著用自己的話寫下去（挑哪個角度由他決定 → 草稿慢慢成形）。
  sparks: string[];
  type: DraftFieldType;
  choices?: string[]; // type === "choice" 時提供
  placeholder: string;
  // 溫和的字數目標（例：心得 100 字）。只用來顯示鼓勵，不擋他。
  minChars?: number;
  optional?: boolean;
  // AI 追問用：這個欄位在問什麼、好答案大概長怎樣（給 coach route 當脈絡）
  aiContext?: string;
}

export interface DraftHomework extends HomeworkBase {
  kind: "draft";
  // 是否開放 AI 追問按鈕（混合模式）。本機有 claude login 才會真的呼叫，
  // 失敗一律退回靜態 sparks。
  aiCoach: boolean;
  fields: DraftField[];
  // 組稿頁的標題
  assembleHeading: string;
}

// ── 英文單字拼寫型 (vocab) ────────────────────────────

// 一筆原始單字（看中文、拼英文）
export interface RawVocab {
  en: string; // 正確拼法（顯示用）
  zh: string; // 中文提示（出題用）
  // 額外可接受的拼法（例 he is/she is）。大小寫、空白、標點的差異
  // 由 normalize 處理，這裡只放「不同的字」。
  accept?: string[];
}

// 合併同義字後的一張卡（同一個中文可能對應多個英文，例 看 = look/watch/see）
export interface VocabCard {
  id: string;
  zh: string;
  answers: string[]; // 所有可接受的英文（至少拼出一個就算對）
}

export interface VocabBatch {
  id: string;
  label: string; // 例「a – August」
  cards: VocabCard[];
}

export interface VocabHomework extends HomeworkBase {
  kind: "vocab";
  // 家長簽名提醒（單字表作業要家長確認背完簽名）
  parentSignNote: string;
}

export type Homework = DraftHomework | VocabHomework;
