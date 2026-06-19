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
  unit.sessions = [session, ...unit.sessions].slice(0, MAX_SESSIONS);
  store[unitId] = unit;
  lsWrite(store);
}
