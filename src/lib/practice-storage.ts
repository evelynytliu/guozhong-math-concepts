// 練習區（手感題 + 變形題挑戰）的儲存層，純 localStorage。

const PRACTICE_KEY = "gz-math:practice";
const MAX_SESSIONS = 5;

export interface DrillEntry {
  answer: string;
  revealed: boolean;
  updatedAt: string;
}

export interface ChallengeQuestionResult {
  questionId: string;
  question: string;
  studentAnswer: string;
  mark: "correct" | "wrong" | null;
  conceptAspect: string;
  difficulty: "basic" | "transfer" | "synthesis";
}

export interface ChallengeSession {
  sessionId: string;
  results: ChallengeQuestionResult[];
  savedAt: string;
}

export interface UnitPracticeData {
  drill: Record<string, DrillEntry>;
  sessions: ChallengeSession[];
  // 累計做過幾組變形題挑戰。sessions 只保留最近 MAX_SESSIONS 組，
  // 這個數字不會被截斷，用來如實顯示「做了幾次」。舊資料沒有這欄時退回 sessions.length。
  challengeRounds?: number;
}

type Store = Record<string, UnitPracticeData>;

function lsRead(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PRACTICE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function lsWrite(data: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRACTICE_KEY, JSON.stringify(data));
  } catch {}
}

function getUnit(unitId: string, store: Store): UnitPracticeData {
  return store[unitId] ?? { drill: {}, sessions: [] };
}

export function getPracticeData(unitId: string): UnitPracticeData {
  return getUnit(unitId, lsRead());
}

export function getAllPracticeData(): Store {
  return lsRead();
}

export function saveDrillEntry(
  unitId: string,
  questionId: string,
  entry: DrillEntry,
): void {
  const store = lsRead();
  const unit = getUnit(unitId, store);
  unit.drill[questionId] = entry;
  store[unitId] = unit;
  lsWrite(store);
}

export function saveChallengeSession(
  unitId: string,
  session: ChallengeSession,
): void {
  const store = lsRead();
  const unit = getUnit(unitId, store);
  const priorRounds = unit.challengeRounds ?? unit.sessions.length;
  unit.sessions = [session, ...unit.sessions].slice(0, MAX_SESSIONS);
  unit.challengeRounds = priorRounds + 1;
  store[unitId] = unit;
  lsWrite(store);
}

// ─── 摘要（給首頁卡片顯示「練習過沒、做了幾次」用） ──────────────────────────

export interface PracticeSummary {
  practiced: boolean; // 有沒有做過任何練習（手感題或變形題挑戰）
  challengeRounds: number; // 變形題挑戰做過幾組（累計，不受保留上限影響）
  bestCorrect: number; // 各組中答對最多的一次
  bestTotal: number; // 那一組的總題數
  drillDone: number; // 手感題已作答（看過答案）的題數
  drillTotal: number; // 手感題總題數
}

export function summarizePractice(
  data: UnitPracticeData | undefined,
  drillTotal: number,
): PracticeSummary {
  const sessions = data?.sessions ?? [];
  const drillDone = Object.values(data?.drill ?? {}).filter(
    (d) => d.revealed,
  ).length;

  let bestCorrect = 0;
  let bestTotal = 0;
  for (const s of sessions) {
    const correct = s.results.filter((r) => r.mark === "correct").length;
    if (correct >= bestCorrect) {
      bestCorrect = correct;
      bestTotal = s.results.length;
    }
  }

  const challengeRounds = data?.challengeRounds ?? sessions.length;

  return {
    practiced: drillDone > 0 || challengeRounds > 0,
    challengeRounds,
    bestCorrect,
    bestTotal,
    drillDone,
    drillTotal,
  };
}
