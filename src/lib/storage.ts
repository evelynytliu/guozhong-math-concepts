// src/lib/storage.ts
// 進度與「孩子寫的解釋」的儲存層。
//
// 預設：localStorage（本機自用，零設定、離線可用）。
// 若 .env.local 有填 Supabase 設定，自動改用 Supabase（見 supabase.ts）。
// 兩個後端共用同一組 async 介面，UI 不用管實際存在哪。
//
// 對應 CLAUDE.md 的資料結構：
//   progress      → UnitProgress
//   explanations  → ExplanationRecord

import type { SelfAssessment } from "@/content/types";
import type { AiFeedback } from "./explanation";
import { getSupabase, isSupabaseEnabled } from "./supabase";

export interface UnitProgress {
  unitId: string;
  sectionReached: number; // 走到第幾段（1-5）
  completedAt: string | null; // ISO 字串；完成第 5 段才填
  variantResults: Record<string, boolean>; // 第 4 段：questionId → 是否答對
}

export interface ExplanationRecord {
  unitId: string;
  studentText: string;
  selfAssessment: SelfAssessment | null; // 靜態模式
  aiFeedback: AiFeedback | null; // AI 模式
  createdAt: string; // ISO 字串
}

const PROGRESS_KEY = "gz-math:progress";
const EXPLANATIONS_KEY = "gz-math:explanations";

// Supabase 資料表名稱。用 mathconcept_ 前綴，與同一個資料庫裡其他專案
// （kiddolens_、錯題本…）明確分開，避免撞名。
const TABLE_PROGRESS = "mathconcept_progress";
const TABLE_EXPLANATIONS = "mathconcept_explanations";

// ─────────────────────────────────────────────
// localStorage 後端
// ─────────────────────────────────────────────

function hasWindow() {
  return typeof window !== "undefined";
}

function lsReadProgress(): Record<string, UnitProgress> {
  if (!hasWindow()) return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UnitProgress>) : {};
  } catch {
    return {};
  }
}

function lsWriteProgress(all: Record<string, UnitProgress>) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* 存不進去也不要讓孩子卡住 */
  }
}

function lsReadExplanations(): ExplanationRecord[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(EXPLANATIONS_KEY);
    return raw ? (JSON.parse(raw) as ExplanationRecord[]) : [];
  } catch {
    return [];
  }
}

function lsWriteExplanations(list: ExplanationRecord[]) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(list));
  } catch {
    /* 同上 */
  }
}

// ─────────────────────────────────────────────
// Supabase 後端（資料表 schema 見 supabase/schema.sql）
// ─────────────────────────────────────────────

interface SbProgressRow {
  unit_id: string;
  section_reached: number;
  completed_at: string | null;
  variant_results: Record<string, boolean> | null;
}

function rowToProgress(r: SbProgressRow): UnitProgress {
  return {
    unitId: r.unit_id,
    sectionReached: r.section_reached,
    completedAt: r.completed_at,
    variantResults: r.variant_results ?? {},
  };
}

// ─────────────────────────────────────────────
// 對外 API（UI 只用這幾個）
// ─────────────────────────────────────────────

export async function getProgress(
  unitId: string,
): Promise<UnitProgress | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_PROGRESS)
        .select("unit_id, section_reached, completed_at, variant_results")
        .eq("unit_id", unitId)
        .maybeSingle();
      if (!error && data) return rowToProgress(data as SbProgressRow);
      // 出錯就退回 localStorage（不讓孩子卡住）
    }
  }
  return lsReadProgress()[unitId] ?? null;
}

export async function getAllProgress(): Promise<UnitProgress[]> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_PROGRESS)
        .select("unit_id, section_reached, completed_at, variant_results");
      if (!error && data)
        return (data as SbProgressRow[]).map(rowToProgress);
    }
  }
  return Object.values(lsReadProgress());
}

export async function saveProgress(p: UnitProgress): Promise<void> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from(TABLE_PROGRESS).upsert(
        {
          unit_id: p.unitId,
          section_reached: p.sectionReached,
          completed_at: p.completedAt,
          variant_results: p.variantResults,
        },
        { onConflict: "unit_id" },
      );
      if (!error) return;
      // 出錯就同時寫進 localStorage 當備援
    }
  }
  const all = lsReadProgress();
  all[p.unitId] = p;
  lsWriteProgress(all);
}

export async function saveExplanation(e: ExplanationRecord): Promise<void> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from(TABLE_EXPLANATIONS).insert({
        unit_id: e.unitId,
        student_text: e.studentText,
        self_assessment: e.selfAssessment,
        ai_feedback: e.aiFeedback,
        created_at: e.createdAt,
      });
      if (!error) return;
    }
  }
  const list = lsReadExplanations();
  list.push(e);
  lsWriteExplanations(list);
}

export async function getLatestExplanation(
  unitId: string,
): Promise<ExplanationRecord | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_EXPLANATIONS)
        .select("unit_id, student_text, self_assessment, ai_feedback, created_at")
        .eq("unit_id", unitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        const r = data as {
          unit_id: string;
          student_text: string;
          self_assessment: SelfAssessment | null;
          ai_feedback: AiFeedback | null;
          created_at: string;
        };
        return {
          unitId: r.unit_id,
          studentText: r.student_text,
          selfAssessment: r.self_assessment,
          aiFeedback: r.ai_feedback,
          createdAt: r.created_at,
        };
      }
    }
  }
  const list = lsReadExplanations().filter((x) => x.unitId === unitId);
  if (list.length === 0) return null;
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
