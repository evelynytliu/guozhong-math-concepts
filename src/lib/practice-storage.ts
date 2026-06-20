// 練習區（手感題 + 變形題挑戰）的儲存層。
// 孩子端用 localStorage（同步、即時、resume），寫入時同時 fire-and-forget
// upsert 到 Supabase（雲端，與 storage.ts 同策略），這樣家長在別台裝置也看得到、
// 「所有進度都有紀錄」。雲端失敗一律吞掉，不影響孩子作答。

import { getSupabase, isSupabaseEnabled } from "./supabase";

const PRACTICE_KEY = "gz-math:practice";
const MAX_SESSIONS = 5;

// 與其他專案分開的資料表名稱（沿用 mathconcept_ 前綴）
const TABLE_PRACTICE = "mathconcept_practice";
// 每一輪變形題挑戰的「永久存檔」（append-only，不截斷、不覆蓋），供長期分析用。
const TABLE_PRACTICE_SESSIONS = "mathconcept_practice_sessions";

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

// ─── Supabase（雲端，與 localStorage 共通） ───────────────────────────────────

interface PracticeRow {
  unit_id: string;
  drill: Record<string, DrillEntry> | null;
  sessions: ChallengeSession[] | null;
  challenge_rounds: number | null;
}

interface PracticeSessionArchiveRow {
  unit_id: string;
  session_id: string | null;
  results: ChallengeQuestionResult[] | null;
  correct: number | null;
  total: number | null;
  created_at: string;
}

function rowToPractice(r: PracticeRow): UnitPracticeData {
  return {
    drill: r.drill ?? {},
    sessions: r.sessions ?? [],
    challengeRounds: r.challenge_rounds ?? r.sessions?.length ?? 0,
  };
}

// fire-and-forget 寫入雲端：失敗一律吞掉，孩子作答不受影響
function upsertPracticeToCloud(unitId: string, data: UnitPracticeData) {
  if (!isSupabaseEnabled) return;
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from(TABLE_PRACTICE)
    .upsert(
      {
        unit_id: unitId,
        drill: data.drill,
        sessions: data.sessions,
        challenge_rounds: data.challengeRounds ?? data.sessions.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "unit_id" },
    )
    .then(
      () => {},
      () => {},
    );
}

// append-only：把單獨一輪變形題挑戰永久存檔（不截斷、不覆蓋）。
// 這是長期分析的「完整資料」來源；mathconcept_practice 只留最近幾輪供顯示。
function appendPracticeSessionToCloud(unitId: string, session: ChallengeSession) {
  if (!isSupabaseEnabled) return;
  const sb = getSupabase();
  if (!sb) return;
  const correct = session.results.filter((r) => r.mark === "correct").length;
  void sb
    .from(TABLE_PRACTICE_SESSIONS)
    .insert({
      unit_id: unitId,
      session_id: session.sessionId,
      results: session.results,
      correct,
      total: session.results.length,
      created_at: session.savedAt,
    })
    .then(
      () => {},
      () => {},
    );
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
  upsertPracticeToCloud(unitId, unit);
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
  upsertPracticeToCloud(unitId, unit);
  // 同時把這一輪永久存檔（不受最近 5 輪上限影響），供長期分析。
  appendPracticeSessionToCloud(unitId, session);
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

// ─── 雲端讀取（給家長頁／課表頁用，跨裝置都看得到） ───────────────────────────

// 從 Supabase 讀所有單元的練習資料；沒啟用或出錯就退回本機 localStorage。
export async function getAllPracticeDataCloud(): Promise<Store> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_PRACTICE)
        .select("unit_id, drill, sessions, challenge_rounds");
      if (!error && data) {
        const store: Store = {};
        for (const r of data as PracticeRow[]) store[r.unit_id] = rowToPractice(r);
        return store;
      }
    }
  }
  return lsRead();
}

// 變形題挑戰的「完整歷史」（所有輪次、不截斷）。供日後長期分析 / 成長報告用，
// 與 getAllPracticeDataCloud（只給最近幾輪顯示）分工。
export interface PracticeSessionRecord {
  unitId: string;
  sessionId: string | null;
  results: ChallengeQuestionResult[];
  correct: number;
  total: number;
  createdAt: string;
}

export async function getAllPracticeSessionsCloud(): Promise<
  PracticeSessionRecord[]
> {
  if (!isSupabaseEnabled) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from(TABLE_PRACTICE_SESSIONS)
    .select("unit_id, session_id, results, correct, total, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PracticeSessionArchiveRow[]).map((r) => ({
    unitId: r.unit_id,
    sessionId: r.session_id,
    results: r.results ?? [],
    correct: r.correct ?? 0,
    total: r.total ?? 0,
    createdAt: r.created_at,
  }));
}

// 把本機練習資料整批推上雲端（家長頁「上傳到雲端」按鈕的 backfill 用）。
export async function syncPracticeLocalToSupabase(): Promise<{
  practiceCount: number;
  error: string | null;
}> {
  const sb = getSupabase();
  if (!sb) return { practiceCount: 0, error: "Supabase 未啟用" };

  const entries = Object.entries(lsRead());
  if (entries.length === 0) return { practiceCount: 0, error: null };

  const { error } = await sb.from(TABLE_PRACTICE).upsert(
    entries.map(([unitId, d]) => ({
      unit_id: unitId,
      drill: d.drill,
      sessions: d.sessions,
      challenge_rounds: d.challengeRounds ?? d.sessions.length,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "unit_id" },
  );
  if (error) return { practiceCount: 0, error: error.message };
  return { practiceCount: entries.length, error: null };
}
