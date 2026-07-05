// src/content/quizzes/types.ts
// 通用「線上題組」型別——五科共用的答題引擎。
//
// 設計原則（延續 CLAUDE.md 的起點：破解背誦）：
//   1. 每題都要有 explanation（詳解）＋ concept（這題在考什麼概念）。
//      答完不只給對錯，一定讓孩子看到「為什麼」。
//   2. 答錯的題目自動回鍋（跟英文單字 drill 同一套精神）：
//      整組每一題都答對過，這一輪才算完成。
//   3. 題組掛在 subjectId（五科之一）＋ topicId（章節地圖）底下，
//      科目頁自動列出、家長頁自動追蹤，不用改任何 UI 程式碼。
//
// 新增題組：在本資料夾寫一個 .ts 檔 export 一個 QuizSet，
// 再到 index.ts 的 quizzes 陣列註冊即可（詳見 AUTHORING.md）。

import type { SubjectId } from "@/content/subjects";

export type QuizQuestionType = "choice" | "text";

export interface QuizQuestion {
  id: string; // 題組內唯一即可，例 "q1"。存過紀錄後別改。
  type: QuizQuestionType;
  question: string; // 題幹，支援 \n 換行
  // type === "choice"：選項 + 正解索引
  choices?: string[];
  answerIndex?: number;
  // type === "text"：可接受的答案（比對時忽略大小寫/前後空白/全半形標點）
  answerText?: string[];
  explanation: string; // 詳解：為什麼是這個答案（不是只重述答案）
  concept: string; // 這題在考哪個概念（答題後顯示，家長頁彙整弱概念用）
}

export interface QuizSet {
  id: string; // 全站唯一，例 "quiz-math-integers-1"。存過紀錄後別改。
  subjectId: SubjectId;
  topicId?: string; // 對應 subjects.ts 的章節地圖（可先不掛）
  title: string; // 例「整數加減・基本功」
  description: string; // 一兩句：這組在練什麼、適合什麼時候做
  order: number; // 同科目內的排序
  questions: QuizQuestion[];
}
