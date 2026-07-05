// src/lib/subject-content.ts
// 把散落的內容（數學單元、文言字、線上題組、暑假作業）全部歸類到「科目」底下，
// 讓首頁科目卡、/subject/[id] 科目頁用同一份資料來源列出「這一科有什麼」。
//
// 這是純資料整理（不碰進度/儲存），所以 server component 也能直接用。
// 新增內容後不用改這裡：各 registry（units / wenyanWords / quizzes / homeworks）
// 一更新，這裡自動吃到——除了暑假作業的科目對應寫在 HOMEWORK_SUBJECT。

import { subjects, type Subject, type SubjectId } from "@/content/subjects";
import { units } from "@/content";
import { wenyanWords } from "@/content/wenyan";
import { quizzes } from "@/content/quizzes";
import { homeworks } from "@/content/homework";

// 學習內容的統一卡片形狀（科目頁/首頁列表用）
export type ContentKind = "unit" | "wenyan" | "quiz" | "homework-draft" | "vocab";

export interface ContentItem {
  key: string; // React key（含類型前綴避免撞號）
  kind: ContentKind;
  href: string; // 點進去的路由
  title: string;
  subtitle: string;
  badge: string; // 類型徽章文字
  topicId?: string; // 對應章節地圖
}

// 暑假作業 id → 科目（作業本身只有中文 subject 字串，這裡明確對應到 SubjectId）
const HOMEWORK_SUBJECT: Record<string, SubjectId> = {
  "hw-english-vocab": "english",
  "hw-chinese-reading": "chinese",
  "hw-math-life": "math",
  "hw-biology-vertebrates": "science",
  "hw-social-growth": "social",
};

// 有些作業 id 可能與上面不同——用作業的 subject 中文名做後備對應
const SUBJECT_BY_NAME: Record<string, SubjectId> = {
  國文: "chinese",
  數學: "math",
  英文: "english",
  英語: "english",
  自然: "science",
  生物: "science",
  社會: "social",
};

function homeworkSubjectId(hwId: string, subjectName: string): SubjectId | undefined {
  return HOMEWORK_SUBJECT[hwId] ?? SUBJECT_BY_NAME[subjectName];
}

// 目前所有數學單元都屬於「整數/分數/方程式」——用 order 粗略掛到章節地圖。
// （精準對應之後可在單元資料加 topicId 欄位；先用範圍規則。）
function mathUnitTopicId(order: number): string {
  if (order <= 3) return "math-7a-1"; // 負數/整數/指數科記
  if (order <= 6) return "math-7a-3"; // 方程式解法/應用/比例式相關
  return "math-7a-2"; // 分數/因倍數
}

export function contentForSubject(subjectId: SubjectId): ContentItem[] {
  const items: ContentItem[] = [];

  if (subjectId === "math") {
    for (const u of units) {
      items.push({
        key: `unit-${u.id}`,
        kind: "unit",
        href: `/unit/${u.id}`,
        title: u.title,
        subtitle: u.summary,
        badge: u.checkMode === "ai" ? "五段式・AI 判讀" : "五段式概念",
        topicId: mathUnitTopicId(u.order),
      });
    }
  }

  if (subjectId === "chinese") {
    for (const w of wenyanWords) {
      items.push({
        key: `wenyan-${w.id}`,
        kind: "wenyan",
        href: `/wenyan/${w.id}`,
        title: `文言字・${w.word}`,
        subtitle: w.teaser,
        badge: "古今異義推導",
        topicId: "chinese-pre-1",
      });
    }
  }

  for (const q of quizzes) {
    if (q.subjectId !== subjectId) continue;
    items.push({
      key: `quiz-${q.id}`,
      kind: "quiz",
      href: `/quiz/${q.id}`,
      title: q.title,
      subtitle: q.description,
      badge: `線上題組・${q.questions.length} 題`,
      topicId: q.topicId,
    });
  }

  for (const hw of homeworks) {
    const sid = homeworkSubjectId(hw.id, hw.subject);
    if (sid !== subjectId) continue;
    items.push({
      key: `hw-${hw.id}`,
      kind: hw.kind === "vocab" ? "vocab" : "homework-draft",
      href: `/homework/${hw.id}`,
      title: hw.title,
      subtitle: hw.kind === "vocab" ? "看中文拼英文，拼到全對才過關" : hw.pdfNote,
      badge: hw.kind === "vocab" ? "暑假作業・單字" : "暑假作業・打草稿",
    });
  }

  return items;
}

// 首頁科目卡用：每科的內容數量（拿來顯示「N 個學習內容」）
export interface SubjectSummary {
  subject: Subject;
  contentCount: number;
  quizCount: number;
}

export function allSubjectSummaries(): SubjectSummary[] {
  return subjects.map((subject) => {
    const items = contentForSubject(subject.id);
    return {
      subject,
      contentCount: items.length,
      quizCount: items.filter((i) => i.kind === "quiz").length,
    };
  });
}
