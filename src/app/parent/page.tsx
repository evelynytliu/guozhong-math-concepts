"use client";

import * as React from "react";
import Link from "next/link";
import { units } from "@/content";
import {
  getAllProgress,
  getLatestExplanation,
  syncLocalToSupabase,
  type UnitProgress,
  type ExplanationRecord,
} from "@/lib/storage";
import { syncHomeworkLocalToSupabase } from "@/lib/homework-storage";
import {
  getAllPracticeData,
  type UnitPracticeData,
  type ChallengeSession,
  type DrillEntry,
} from "@/lib/practice-storage";
import type { DrillQuestion } from "@/content/types";
import { isSupabaseEnabled } from "@/lib/supabase";
import { ChevronLeft, CheckCircle2, AlertCircle, CloudUpload, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_NAMES = ["情境引入", "引導推導", "用自己的話說", "變形題驗證", "回扣"];

const SELF_ASSESSMENT_LABEL: Record<string, { text: string; color: string }> = {
  got_it:       { text: "有講到重點 ✅",      color: "text-correct" },
  partial:      { text: "部分有講到",          color: "text-gentle-foreground" },
  cant_explain: { text: "講不太出來 🤔",       color: "text-destructive/80" },
};

type SyncState = "idle" | "syncing" | "done" | "error";

export default function ParentPage() {
  const [rows, setRows] = React.useState<
    { progress: UnitProgress | null; explanation: ExplanationRecord | null }[]
  >([]);
  const [practiceData, setPracticeData] = React.useState<
    Record<string, UnitPracticeData>
  >({});
  const [loaded, setLoaded] = React.useState(false);
  const [syncState, setSyncState] = React.useState<SyncState>("idle");
  const [syncMsg, setSyncMsg] = React.useState("");

  React.useEffect(() => {
    let active = true;
    (async () => {
      const allProgress = await getAllProgress();
      const progressMap: Record<string, UnitProgress> = {};
      for (const p of allProgress) progressMap[p.unitId] = p;

      const result = await Promise.all(
        units.map(async (u) => ({
          progress: progressMap[u.id] ?? null,
          explanation: await getLatestExplanation(u.id),
        })),
      );
      if (active) {
        setRows(result);
        setPracticeData(getAllPracticeData());
        setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, []);

  async function handleSync() {
    setSyncState("syncing");
    setSyncMsg("");
    try {
      const [math, hw] = await Promise.all([
        syncLocalToSupabase(),
        syncHomeworkLocalToSupabase(),
      ]);
      const errors = [math.error, hw.error].filter(Boolean);
      if (errors.length > 0) {
        setSyncState("error");
        setSyncMsg(`部分失敗：${errors.join("；")}`);
      } else {
        const total =
          math.progressCount +
          math.explanationCount +
          hw.draftCount +
          hw.vocabCount;
        setSyncState("done");
        setSyncMsg(
          total === 0
            ? "本機沒有新資料需要上傳"
            : `已上傳 ${total} 筆資料到雲端`,
        );
      }
    } catch (e) {
      setSyncState("error");
      setSyncMsg(String(e));
    }
  }

  const anyData =
    rows.some((r) => r.progress !== null || r.explanation !== null) ||
    Object.keys(practiceData).length > 0;

  return (
    <div className="flex flex-1 flex-col py-8">
      {/* 頁頭 */}
      <div className="mb-1 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          回首頁
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">家長檢視</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        孩子在這台裝置、這個瀏覽器上的所有學習紀錄。
      </p>

      {/* 提示：只有同一台裝置才能看到 */}
      <div className="mt-4 rounded-xl border border-gentle/40 bg-gentle/10 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">注意：</span>
        資料存在孩子使用的裝置裡。如果你現在用的不是孩子平常用來學習的裝置，這裡會是空的。
      </div>

      {/* 跨裝置同步 */}
      <div className="mt-4 rounded-xl border bg-card px-5 py-4">
        <p className="text-sm font-medium">跨裝置同步</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          在孩子使用的裝置上，點「上傳到雲端」把本機資料推上去；之後在任何裝置開啟這頁都看得到。
        </p>
        {isSupabaseEnabled ? (
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncState === "syncing"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                syncState === "syncing"
                  ? "cursor-not-allowed bg-secondary text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {syncState === "syncing" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  上傳中…
                </>
              ) : syncState === "done" ? (
                <>
                  <CheckCheck className="h-4 w-4" />
                  再次上傳
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" />
                  上傳本機資料到雲端
                </>
              )}
            </button>
            {syncMsg && (
              <span
                className={cn(
                  "text-sm",
                  syncState === "done" ? "text-correct" : "text-destructive",
                )}
              >
                {syncMsg}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            雲端同步尚未啟用（需要設定 Supabase 環境變數後重新部署）。
          </p>
        )}
      </div>

      {!loaded ? (
        <div className="mt-10 text-center text-muted-foreground">讀取中…</div>
      ) : !anyData ? (
        <div className="mt-10 rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">還沒有任何學習紀錄。</p>
          <p className="mt-1 text-sm text-muted-foreground">
            孩子開始做題目之後，紀錄會出現在這裡。
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {units.map((unit, i) => {
            const { progress, explanation } = rows[i] ?? {};
            const pd = practiceData[unit.id];
            if (!progress && !explanation && !pd) return null;
            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                progress={progress ?? null}
                explanation={explanation ?? null}
                practice={pd ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function UnitCard({
  unit,
  progress,
  explanation,
  practice,
}: {
  unit: (typeof units)[number];
  progress: UnitProgress | null;
  explanation: ExplanationRecord | null;
  practice: UnitPracticeData | null;
}) {
  const reached = progress?.sectionReached ?? 0;
  const completed = Boolean(progress?.completedAt);
  const variantResults = progress?.variantResults ?? {};
  const variantQs = unit.section4_variants.questions;
  const hasVariants = Object.keys(variantResults).length > 0;

  const drillQuestions = unit.practiceZone?.drill.questions ?? [];
  const revealedDrills = drillQuestions.filter(
    (q) => practice?.drill[q.id]?.revealed,
  );
  const latestSession = practice?.sessions?.[0] ?? null;
  const hasPractice = revealedDrills.length > 0 || latestSession !== null;

  return (
    <div className="rounded-xl border bg-card">
      {/* 單元標題 + 完成狀態 */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            單元 {unit.order}
          </p>
          <h2 className="text-lg font-semibold">{unit.title}</h2>
        </div>
        {completed ? (
          <span className="flex items-center gap-1.5 rounded-full bg-correct/15 px-3 py-1 text-sm font-medium text-correct">
            <CheckCircle2 className="h-4 w-4" />
            完成
          </span>
        ) : reached > 0 ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            進行到第 {reached} 段・{SECTION_NAMES[reached - 1]}
          </span>
        ) : null}
      </div>

      <div className="space-y-5 p-5">
        {/* 進度條 */}
        {progress && (
          <ProgressBar reached={reached} completed={completed} />
        )}

        {/* 孩子寫的解釋（第 3 段） */}
        {explanation && (
          <ExplanationBlock explanation={explanation} unitTitle={unit.title} />
        )}

        {/* 變形題結果（第 4 段） */}
        {hasVariants && (
          <VariantResultBlock questions={variantQs} results={variantResults} />
        )}

        {/* 練習區記錄 */}
        {hasPractice && (
          <PracticeBlock
            drillQuestions={drillQuestions}
            drillData={practice?.drill ?? {}}
            revealedDrills={revealedDrills}
            latestSession={latestSession}
          />
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  reached,
  completed,
}: {
  reached: number;
  completed: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">學習進度</p>
      <div className="flex items-center gap-1.5">
        {SECTION_NAMES.map((name, i) => {
          const n = i + 1;
          const done = n < reached || completed;
          const current = n === reached && !completed;
          return (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    done && "border-correct bg-correct text-correct-foreground",
                    current && "border-primary bg-primary text-primary-foreground",
                    !done && !current && "border-border bg-card text-muted-foreground opacity-40",
                  )}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {name}
                </span>
              </div>
              {i < 4 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    n < reached || completed ? "bg-correct" : "bg-border opacity-40",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ExplanationBlock({
  explanation,
  unitTitle,
}: {
  explanation: ExplanationRecord;
  unitTitle: string;
}) {
  const sa = explanation.selfAssessment;
  const saInfo = sa ? SELF_ASSESSMENT_LABEL[sa] : null;
  const aiFb = explanation.aiFeedback;
  const date = new Date(explanation.createdAt).toLocaleDateString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          第 3 段・孩子用自己的話解釋
        </p>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* 孩子寫的文字 */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {explanation.studentText || (
            <span className="italic text-muted-foreground">（空白，沒有輸入）</span>
          )}
        </p>
      </div>

      {/* 自評（靜態模式） */}
      {saInfo && (
        <p className="text-sm">
          孩子自評：
          <span className={cn("font-medium", saInfo.color)}>
            {saInfo.text}
          </span>
        </p>
      )}

      {/* AI 回饋（AI 模式） */}
      {aiFb && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
          <p className="text-xs font-medium text-primary">AI 老師的回饋</p>
          <p className="text-sm">
            判斷：
            <span className="font-medium">
              {aiFb.understanding_level === "理解型" ? "✅ 理解型解釋" :
               aiFb.understanding_level === "複述型" ? "⚠️ 複述型（像在背）" :
               aiFb.understanding_level}
            </span>
          </p>
          {aiFb.followup_question && (
            <p className="text-sm text-muted-foreground">
              追問：{aiFb.followup_question}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function VariantResultBlock({
  questions,
  results,
}: {
  questions: { id: string; question: string; testingWhat: string; likeTextbook: boolean }[];
  results: Record<string, boolean>;
}) {
  const answered = questions.filter((q) => q.id in results);
  if (answered.length === 0) return null;

  const correctCount = answered.filter((q) => results[q.id]).length;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          第 4 段・變形題驗證結果
        </p>
        <span className="text-xs font-medium">
          答對 {correctCount} / {answered.length} 題
        </span>
      </div>
      <div className="space-y-2">
        {answered.map((q, i) => {
          const isCorrect = results[q.id];
          return (
            <div
              key={q.id}
              className={cn(
                "rounded-lg border px-4 py-3",
                isCorrect ? "border-correct/30 bg-correct/5" : "border-gentle/30 bg-gentle/5",
              )}
            >
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gentle-foreground" />
                )}
                <div className="space-y-0.5">
                  <p className="text-[14px] leading-snug">
                    <span className="font-medium">第 {i + 1} 題{q.likeTextbook ? "（跟教材最像）" : "（換了外觀）"}：</span>
                    {q.question}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    考驗點：{q.testingWhat}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 診斷提示 */}
      {answered.length >= 3 && (() => {
        const textbookQ = questions.find((q) => q.likeTextbook);
        const nonTextbook = questions.filter((q) => !q.likeTextbook);
        const textbookOk = textbookQ && results[textbookQ.id] === true;
        const allNonFail = nonTextbook.every((q) => results[q.id] === false);
        if (textbookOk && allNonFail) {
          return (
            <div className="rounded-lg border border-gentle/40 bg-gentle/10 px-4 py-3 text-sm">
              <p className="font-medium">📌 認得題型，但概念還沒遷移</p>
              <p className="mt-0.5 text-muted-foreground">
                第 1 題（教材題型）對了，變形題卻卡住——這是「背題型、不懂概念」的典型。建議讓孩子回到第 2 段，重新走一次推導。
              </p>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}

// ─── 練習區記錄（家長視角） ─────────────────────────────────────────────────

const DIFF_LABEL: Record<string, string> = {
  basic: "直接",
  transfer: "換情境",
  synthesis: "多一個轉折",
};

function PracticeBlock({
  drillQuestions,
  drillData,
  revealedDrills,
  latestSession,
}: {
  drillQuestions: DrillQuestion[];
  drillData: Record<string, DrillEntry>;
  revealedDrills: DrillQuestion[];
  latestSession: ChallengeSession | null;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">練習區紀錄</p>

      {/* 手感題 */}
      {revealedDrills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">手感題（已作答）</p>
          <div className="overflow-hidden rounded-lg border text-sm">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">題目</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">孩子的答案</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">正確答案</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {revealedDrills.map((q) => {
                  const entry = drillData[q.id];
                  const correct = q.answer;
                  const studentAns = entry?.answer ?? "";
                  const match =
                    studentAns.trim() === correct.trim();
                  return (
                    <tr key={q.id}>
                      <td className="px-3 py-2 text-muted-foreground">{q.question}</td>
                      <td className={cn("px-3 py-2 font-mono", match ? "text-correct" : "text-gentle-foreground")}>
                        {studentAns || <span className="italic text-muted-foreground">（空白）</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-foreground">{correct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 最近一次變形題挑戰 */}
      {latestSession && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-muted-foreground">最近一次變形題挑戰</p>
            <span className="text-xs font-medium">
              答對{" "}
              {latestSession.results.filter((r) => r.mark === "correct").length}{" "}
              / {latestSession.results.length} 題
            </span>
          </div>
          <div className="space-y-2">
            {latestSession.results.map((r, i) => {
              const isCorrect = r.mark === "correct";
              return (
                <div
                  key={r.questionId}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm",
                    isCorrect
                      ? "border-correct/30 bg-correct/5"
                      : r.mark === "wrong"
                        ? "border-gentle/30 bg-gentle/5"
                        : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                    ) : r.mark === "wrong" ? (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gentle-foreground" />
                    ) : (
                      <span className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="leading-snug">
                        <span className="font-medium">
                          第 {i + 1} 題
                          <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                            {DIFF_LABEL[r.difficulty] ?? r.difficulty}
                          </span>
                          ：
                        </span>
                        {r.question}
                      </p>
                      {r.studentAnswer && (
                        <p className="text-muted-foreground">
                          孩子寫的：
                          <span className="font-mono">{r.studentAnswer}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        這題在考：{r.conceptAspect}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 弱點診斷：全錯 transfer+synthesis 題 */}
          {(() => {
            const wrong = latestSession.results.filter(
              (r) => r.mark === "wrong" && r.difficulty !== "basic",
            );
            if (wrong.length >= 2) {
              return (
                <div className="rounded-lg border border-gentle/40 bg-gentle/10 px-4 py-3 text-sm">
                  <p className="font-medium">📌 換情境就卡住了</p>
                  <p className="mt-0.5 text-muted-foreground">
                    換情境或多一個轉折的題目答錯 {wrong.length} 題——概念可能還停在「認得這個題型」，還沒真正遷移。建議讓孩子再回到第 2 段重新走推導。
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
