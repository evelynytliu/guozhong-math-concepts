// src/lib/course-storage.ts
// 「完整先修課表」的進度紀錄 + 螺旋複習 session 紀錄。
// 同 storage.ts 策略：Supabase 優先、localStorage 備援，兩邊共通。

import { getSupabase, isSupabaseEnabled } from "./supabase";

// ── 課表步驟完成紀錄 ──────────────────────────────────

export interface CourseStepProgress {
  stepId: string;
  completedAt: string | null;
  payload: Record<string, unknown>; // 如複習分數 { correct, total }
  updatedAt: string;
}

const COURSE_KEY = "gz-math:course";
const SPIRAL_KEY = "gz-math:spiral-log";
const TABLE_COURSE = "mathconcept_course_progress";
const TABLE_SPIRAL = "mathconcept_spiral_sessions";

function hasWindow() {
  return typeof window !== "undefined";
}
function lsReadCourse(): Record<string, CourseStepProgress> {
  if (!hasWindow()) return {};
  try {
    const raw = window.localStorage.getItem(COURSE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CourseStepProgress>) : {};
  } catch {
    return {};
  }
}
function lsWriteCourse(all: Record<string, CourseStepProgress>) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(COURSE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

interface CourseRow {
  step_id: string;
  completed_at: string | null;
  payload: Record<string, unknown> | null;
  updated_at: string;
}
function rowToStep(r: CourseRow): CourseStepProgress {
  return {
    stepId: r.step_id,
    completedAt: r.completed_at,
    payload: r.payload ?? {},
    updatedAt: r.updated_at,
  };
}

export async function getCourseProgress(): Promise<
  Record<string, CourseStepProgress>
> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE_COURSE)
        .select("step_id, completed_at, payload, updated_at");
      if (!error && data) {
        const map: Record<string, CourseStepProgress> = {};
        for (const r of data as CourseRow[]) map[r.step_id] = rowToStep(r);
        return map;
      }
    }
  }
  return lsReadCourse();
}

export async function markStepDone(
  stepId: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from(TABLE_COURSE).upsert(
        { step_id: stepId, completed_at: now, payload, updated_at: now },
        { onConflict: "step_id" },
      );
      if (!error) return;
    }
  }
  const all = lsReadCourse();
  all[stepId] = { stepId, completedAt: now, payload, updatedAt: now };
  lsWriteCourse(all);
}

// ── 螺旋複習 session 紀錄（append-only） ──────────────

export interface SpiralResultItem {
  id: string;
  unitId: string;
  concept: string;
  correct: boolean;
}

export interface SpiralSessionRecord {
  checkpointId: string | null; // 對應課表檢核點（rA/rB/rC）；自由練習為 null
  availableUnits: string[];
  results: SpiralResultItem[];
  correct: number;
  total: number;
  createdAt: string;
}

function lsAppendSpiral(rec: SpiralSessionRecord) {
  if (!hasWindow()) return;
  try {
    const raw = window.localStorage.getItem(SPIRAL_KEY);
    const list = raw ? (JSON.parse(raw) as SpiralSessionRecord[]) : [];
    list.unshift(rec);
    window.localStorage.setItem(SPIRAL_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

// 螺旋複習做完記一筆。雲端 + 本機都寫，確保「所有進度都有紀錄」。
export async function logSpiralSession(params: {
  checkpointId: string | null;
  availableUnits: string[];
  results: SpiralResultItem[];
}): Promise<void> {
  const correct = params.results.filter((r) => r.correct).length;
  const total = params.results.length;
  const rec: SpiralSessionRecord = {
    checkpointId: params.checkpointId,
    availableUnits: params.availableUnits,
    results: params.results,
    correct,
    total,
    createdAt: new Date().toISOString(),
  };
  lsAppendSpiral(rec);
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      await sb
        .from(TABLE_SPIRAL)
        .insert({
          checkpoint_id: rec.checkpointId,
          available_units: rec.availableUnits,
          results: rec.results,
          correct: rec.correct,
          total: rec.total,
          created_at: rec.createdAt,
        })
        .then(
          () => {},
          () => {},
        );
    }
  }
}
