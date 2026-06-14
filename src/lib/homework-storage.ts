// src/lib/homework-storage.ts
// 暑假作業的儲存層（草稿內容 + 單字精熟進度）。
//
// 跟 storage.ts 同一套策略：預設 localStorage（本機自用、離線可用、零設定），
// .env.local 有填 Supabase 就改用 Supabase（兩邊資料共通）。
// 所有 Supabase 呼叫出錯都自動退回 localStorage，孩子永遠不會卡住。

import { getSupabase, isSupabaseEnabled } from "./supabase";

// ── 型別 ──────────────────────────────────────────

// 報告草稿：每個欄位 id → 孩子打的文字；是否已經「抄到作業本上」
export interface DraftData {
  homeworkId: string;
  fields: Record<string, string>;
  handCopied: boolean;
  updatedAt: string;
}

// 單字精熟：記錄哪些卡已經「拼對過」，用來顯示進度、resume
export interface VocabProgressData {
  homeworkId: string;
  masteredCardIds: string[];
  updatedAt: string;
}

const DRAFTS_KEY = "gz-hw:drafts";
const VOCAB_KEY = "gz-hw:vocab";

// 與其他專案分開的資料表名稱（沿用 mathconcept_ 前綴）
const TABLE_DRAFTS = "mathconcept_homework_drafts";
const TABLE_VOCAB = "mathconcept_homework_vocab";

// ── localStorage helpers ─────────────────────────

function hasWindow() {
  return typeof window !== "undefined";
}

function lsRead<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key: string, value: unknown) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存不進去也別讓孩子卡住 */
  }
}

// ── Supabase row 對應 ─────────────────────────────

interface DraftRow {
  homework_id: string;
  fields: Record<string, string> | null;
  hand_copied: boolean | null;
  updated_at: string;
}

interface VocabRow {
  homework_id: string;
  mastered_card_ids: string[] | null;
  updated_at: string;
}

function rowToDraft(r: DraftRow): DraftData {
  return {
    homeworkId: r.homework_id,
    fields: r.fields ?? {},
    handCopied: Boolean(r.hand_copied),
    updatedAt: r.updated_at,
  };
}

function rowToVocab(r: VocabRow): VocabProgressData {
  return {
    homeworkId: r.homework_id,
    masteredCardIds: r.mastered_card_ids ?? [],
    updatedAt: r.updated_at,
  };
}

// ── 草稿 API ─────────────────────────────────────

export async function getDraft(homeworkId: string): Promise<DraftData | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_DRAFTS)
        .select("homework_id, fields, hand_copied, updated_at")
        .eq("homework_id", homeworkId)
        .maybeSingle();
      if (!error && data) return rowToDraft(data as DraftRow);
    }
  }
  const all = lsRead<Record<string, DraftData>>(DRAFTS_KEY, {});
  return all[homeworkId] ?? null;
}

export async function getAllDrafts(): Promise<Record<string, DraftData>> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_DRAFTS)
        .select("homework_id, fields, hand_copied, updated_at");
      if (!error && data) {
        const map: Record<string, DraftData> = {};
        for (const r of data as DraftRow[]) map[r.homework_id] = rowToDraft(r);
        return map;
      }
    }
  }
  return lsRead<Record<string, DraftData>>(DRAFTS_KEY, {});
}

export async function saveDraft(d: DraftData): Promise<void> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from(TABLE_DRAFTS).upsert(
        {
          homework_id: d.homeworkId,
          fields: d.fields,
          hand_copied: d.handCopied,
          updated_at: d.updatedAt,
        },
        { onConflict: "homework_id" },
      );
      if (!error) return;
    }
  }
  const all = lsRead<Record<string, DraftData>>(DRAFTS_KEY, {});
  all[d.homeworkId] = d;
  lsWrite(DRAFTS_KEY, all);
}

// ── 單字精熟 API ─────────────────────────────────

export async function getVocabProgress(
  homeworkId: string,
): Promise<VocabProgressData | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_VOCAB)
        .select("homework_id, mastered_card_ids, updated_at")
        .eq("homework_id", homeworkId)
        .maybeSingle();
      if (!error && data) return rowToVocab(data as VocabRow);
    }
  }
  const all = lsRead<Record<string, VocabProgressData>>(VOCAB_KEY, {});
  return all[homeworkId] ?? null;
}

export async function getAllVocabProgress(): Promise<
  Record<string, VocabProgressData>
> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_VOCAB)
        .select("homework_id, mastered_card_ids, updated_at");
      if (!error && data) {
        const map: Record<string, VocabProgressData> = {};
        for (const r of data as VocabRow[]) map[r.homework_id] = rowToVocab(r);
        return map;
      }
    }
  }
  return lsRead<Record<string, VocabProgressData>>(VOCAB_KEY, {});
}

export async function saveVocabProgress(
  homeworkId: string,
  masteredCardIds: string[],
): Promise<void> {
  const payload: VocabProgressData = {
    homeworkId,
    masteredCardIds,
    updatedAt: new Date().toISOString(),
  };
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from(TABLE_VOCAB).upsert(
        {
          homework_id: payload.homeworkId,
          mastered_card_ids: payload.masteredCardIds,
          updated_at: payload.updatedAt,
        },
        { onConflict: "homework_id" },
      );
      if (!error) return;
    }
  }
  const all = lsRead<Record<string, VocabProgressData>>(VOCAB_KEY, {});
  all[homeworkId] = payload;
  lsWrite(VOCAB_KEY, all);
}
