"use client";

import * as React from "react";
import Link from "next/link";
import { units } from "@/content";
import {
  getAllProgress,
  getLatestExplanation,
  type UnitProgress,
  type ExplanationRecord,
} from "@/lib/storage";
import { ChevronLeft, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_NAMES = ["情境引入", "引導推導", "用自己的話說", "變形題驗證", "回扣"];

const SELF_ASSESSMENT_LABEL: Record<string, { text: string; color: string }> = {
  got_it:       { text: "有講到重點 ✅",      color: "text-correct" },
  partial:      { text: "部分有講到",          color: "text-gentle-foreground" },
  cant_explain: { text: "講不太出來 🤔",       color: "text-destructive/80" },
};

export default function ParentPage() {
  const [rows, setRows] = React.useState<
    { progress: UnitProgress | null; explanation: ExplanationRecord | null }[]
  >([]);
  const [loaded, setLoaded] = React.useState(false);

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
        setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const anyData = rows.some((r) => r.progress !== null || r.explanation !== null);

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
            if (!progress && !explanation) return null;
            return (
              <UnitCard
                key={unit.id}
                unit={unit}
                progress={progress ?? null}
                explanation={explanation ?? null}
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
}: {
  unit: (typeof units)[number];
  progress: UnitProgress | null;
  explanation: ExplanationRecord | null;
}) {
  const reached = progress?.sectionReached ?? 0;
  const completed = Boolean(progress?.completedAt);
  const variantResults = progress?.variantResults ?? {};
  const variantQs = unit.section4_variants.questions;
  const hasVariants = Object.keys(variantResults).length > 0;

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
