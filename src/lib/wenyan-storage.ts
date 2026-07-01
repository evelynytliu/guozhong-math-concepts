// src/lib/wenyan-storage.ts
// 文言文「古今異義」學習進度的儲存層。
// 跟 lib/storage.ts（數學單元）同一套設計：localStorage 優先、Supabase 可選，
// 共用同一組 async 介面，UI 不用管實際存在哪。
//
// 一個字一列，欄位盡量精簡：走到第幾拍、完成沒、變形題逐題對錯、
// 以及第 3 拍孩子寫的解釋＋自評（直接存在同一列，家長頁好呈現）。

import { getSupabase, isSupabaseEnabled } from "./supabase";

// 五拍對應五段式；自評沿用數學那套三選一
export type WenyanSelfAssessment = "got_it" | "partial" | "cant_explain";

export interface WenyanProgress {
  wordId: string;
  sectionReached: number; // 走到第幾拍（1-5）
  completedAt: string | null; // 完成第 5 拍才填
  variantResults: Record<string, boolean>; // 第 4 拍：variantId → 是否答對
  explanation: string; // 第 3 拍孩子寫的解釋
  selfAssessment: WenyanSelfAssessment | null; // 第 3 拍自評
  updatedAt: string;
}

const KEY = "gz-math:wenyan";
const TABLE = "mathconcept_wenyan_progress";

function hasWindow() {
  return typeof window !== "undefined";
}

function lsReadAll(): Record<string, WenyanProgress> {
  if (!hasWindow()) return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, WenyanProgress>) : {};
  } catch {
    return {};
  }
}

function lsWriteAll(all: Record<string, WenyanProgress>) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* 存不進去也不要讓孩子卡住 */
  }
}

interface SbRow {
  word_id: string;
  section_reached: number;
  completed_at: string | null;
  variant_results: Record<string, boolean> | null;
  explanation: string | null;
  self_assessment: WenyanSelfAssessment | null;
  updated_at: string;
}

function rowToProgress(r: SbRow): WenyanProgress {
  return {
    wordId: r.word_id,
    sectionReached: r.section_reached,
    completedAt: r.completed_at,
    variantResults: r.variant_results ?? {},
    explanation: r.explanation ?? "",
    selfAssessment: r.self_assessment,
    updatedAt: r.updated_at,
  };
}

function progressToRow(p: WenyanProgress) {
  return {
    word_id: p.wordId,
    section_reached: p.sectionReached,
    completed_at: p.completedAt,
    variant_results: p.variantResults,
    explanation: p.explanation,
    self_assessment: p.selfAssessment,
    updated_at: p.updatedAt,
  };
}

// ── 對外 API ─────────────────────────────────────────

export async function getWenyanProgress(
  wordId: string,
): Promise<WenyanProgress | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE)
        .select(
          "word_id, section_reached, completed_at, variant_results, explanation, self_assessment, updated_at",
        )
        .eq("word_id", wordId)
        .maybeSingle();
      if (!error && data) return rowToProgress(data as SbRow);
      // 出錯就退回 localStorage
    }
  }
  return lsReadAll()[wordId] ?? null;
}

export async function getAllWenyanProgress(): Promise<WenyanProgress[]> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE)
        .select(
          "word_id, section_reached, completed_at, variant_results, explanation, self_assessment, updated_at",
        );
      if (!error && data) return (data as SbRow[]).map(rowToProgress);
    }
  }
  return Object.values(lsReadAll());
}

export async function saveWenyanProgress(p: WenyanProgress): Promise<void> {
  // 一律先寫本機（離線可用、當雲端備援）
  const all = lsReadAll();
  all[p.wordId] = p;
  lsWriteAll(all);

  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      await sb.from(TABLE).upsert(progressToRow(p), { onConflict: "word_id" });
    }
  }
}

export async function syncWenyanLocalToSupabase(): Promise<{
  wenyanCount: number;
  error: string | null;
}> {
  const sb = getSupabase();
  if (!sb) return { wenyanCount: 0, error: "Supabase 未啟用" };
  const list = Object.values(lsReadAll());
  if (list.length === 0) return { wenyanCount: 0, error: null };
  const { error } = await sb
    .from(TABLE)
    .upsert(list.map(progressToRow), { onConflict: "word_id" });
  if (error) return { wenyanCount: 0, error: error.message };
  return { wenyanCount: list.length, error: null };
}
