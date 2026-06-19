// src/lib/diagnosis-storage.ts
// 「完成章節即時診斷」結果的儲存層。
// 跟 storage.ts / homework-storage.ts 同一套策略：Supabase 優先、localStorage 備援。
// 線上靜態站 Supabase 已啟用（金鑰在 GitHub Secrets），所以 iPad 上完成單元產生的
// 診斷也會寫進雲端，家長在任何裝置都看得到。

import { getSupabase, isSupabaseEnabled } from "./supabase";
import type { Diagnosis, DiagnoseSignals } from "./diagnose";

export interface DiagnosisRecord {
  unitId: string;
  diagnosis: Diagnosis;
  source: "ai" | "heuristic";
  signals?: DiagnoseSignals;
  createdAt: string; // ISO 字串
}

const KEY = "gz-math:diagnoses";
const TABLE = "mathconcept_diagnoses";

function hasWindow() {
  return typeof window !== "undefined";
}
function lsRead(): DiagnosisRecord[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DiagnosisRecord[]) : [];
  } catch {
    return [];
  }
}
function lsWrite(list: DiagnosisRecord[]) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 存不進去也不要讓孩子卡住 */
  }
}

interface DiagnosisRow {
  unit_id: string;
  absorption_level: string | null;
  transferred: boolean | null;
  strengths: string | null;
  weakness: string | null;
  recommendation: string | null;
  next_action: string | null;
  parent_note: string | null;
  child_note: string | null;
  source: string | null;
  signals: DiagnoseSignals | null;
  created_at: string;
}

const SELECT_COLS =
  "unit_id, absorption_level, transferred, strengths, weakness, recommendation, next_action, parent_note, child_note, source, signals, created_at";

function rowToRecord(r: DiagnosisRow): DiagnosisRecord {
  return {
    unitId: r.unit_id,
    source: r.source === "heuristic" ? "heuristic" : "ai",
    signals: r.signals ?? undefined,
    createdAt: r.created_at,
    diagnosis: {
      absorption_level:
        (r.absorption_level as Diagnosis["absorption_level"]) ?? "部分理解",
      transferred: Boolean(r.transferred),
      strengths: r.strengths ?? "",
      weakness: r.weakness ?? "",
      recommendation: r.recommendation ?? "",
      next_action: (r.next_action as Diagnosis["next_action"]) ?? "spiral_review",
      parent_note: r.parent_note ?? "",
      child_note: r.child_note ?? "",
    },
  };
}

export async function saveDiagnosis(rec: DiagnosisRecord): Promise<void> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const d = rec.diagnosis;
      const { error } = await sb.from(TABLE).insert({
        unit_id: rec.unitId,
        absorption_level: d.absorption_level,
        transferred: d.transferred,
        strengths: d.strengths,
        weakness: d.weakness,
        recommendation: d.recommendation,
        next_action: d.next_action,
        parent_note: d.parent_note,
        child_note: d.child_note,
        source: rec.source,
        signals: rec.signals ?? null,
        raw: d,
        created_at: rec.createdAt,
      });
      if (!error) return;
    }
  }
  const list = lsRead();
  list.push(rec);
  lsWrite(list);
}

export async function getLatestDiagnosis(
  unitId: string,
): Promise<DiagnosisRecord | null> {
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE)
        .select(SELECT_COLS)
        .eq("unit_id", unitId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) return rowToRecord(data as DiagnosisRow);
    }
  }
  const list = lsRead().filter((r) => r.unitId === unitId);
  if (list.length === 0) return null;
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

// 每個單元的最新一筆診斷（家長頁／課表頁用）。
export async function getAllLatestDiagnoses(): Promise<
  Record<string, DiagnosisRecord>
> {
  const map: Record<string, DiagnosisRecord> = {};
  if (isSupabaseEnabled) {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from(TABLE)
        .select(SELECT_COLS)
        .order("created_at", { ascending: false });
      if (!error && data) {
        // 已按 created_at desc，每個單元第一筆即最新
        for (const r of data as DiagnosisRow[]) {
          if (!map[r.unit_id]) map[r.unit_id] = rowToRecord(r);
        }
        return map;
      }
    }
  }
  for (const rec of lsRead().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )) {
    if (!map[rec.unitId]) map[rec.unitId] = rec;
  }
  return map;
}
