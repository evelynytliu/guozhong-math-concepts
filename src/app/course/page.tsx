"use client";

import * as React from "react";
import Link from "next/link";
import {
  curriculum,
  totalUnitSteps,
  type CurriculumStep,
} from "@/content/curriculum";
import { getAllProgress, type UnitProgress } from "@/lib/storage";
import {
  getCourseProgress,
  markStepDone,
  type CourseStepProgress,
} from "@/lib/course-storage";
import {
  getAllLatestDiagnoses,
  type DiagnosisRecord,
} from "@/lib/diagnosis-storage";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Repeat,
  Mic,
  ArrowRight,
  Clock,
  Lock,
  Sparkles,
} from "lucide-react";

const ABSORPTION: Record<
  string,
  { cls: string; emoji: string }
> = {
  扎實: { cls: "bg-correct/15 text-correct", emoji: "🟢" },
  大致理解: { cls: "bg-accent/15 text-accent", emoji: "🔵" },
  部分理解: { cls: "bg-gentle/20 text-gentle-foreground", emoji: "🟡" },
  還在背: { cls: "bg-destructive/10 text-destructive", emoji: "🔴" },
};

type ProgressMap = Record<string, UnitProgress>;
type CourseMap = Record<string, CourseStepProgress>;
type DiagMap = Record<string, DiagnosisRecord>;

export default function CoursePage() {
  const [progress, setProgress] = React.useState<ProgressMap>({});
  const [course, setCourse] = React.useState<CourseMap>({});
  const [diagnoses, setDiagnoses] = React.useState<DiagMap>({});
  const [loaded, setLoaded] = React.useState(false);
  const [now] = React.useState(() => new Date());

  React.useEffect(() => {
    let active = true;
    (async () => {
      const [all, c, d] = await Promise.all([
        getAllProgress(),
        getCourseProgress(),
        getAllLatestDiagnoses(),
      ]);
      if (!active) return;
      const map: ProgressMap = {};
      for (const p of all) map[p.unitId] = p;
      setProgress(map);
      setCourse(c);
      setDiagnoses(d);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  // 一個步驟是否完成
  const isStepDone = React.useCallback(
    (step: CurriculumStep): boolean => {
      if (step.kind === "unit")
        return Boolean(step.unitId && progress[step.unitId]?.completedAt);
      return Boolean(course[step.id]?.completedAt);
    },
    [progress, course],
  );

  // 整體：完成幾個「學單元」步驟
  const doneUnitSteps = curriculum.filter(
    (s) => s.kind === "unit" && isStepDone(s),
  ).length;

  // 「下一步」= 第一個還沒完成的步驟
  const nextStepId = curriculum.find((s) => !isStepDone(s))?.id ?? null;

  async function handleFinishCourse() {
    await markStepDone("step-final", {});
    setCourse((prev) => ({
      ...prev,
      "step-final": {
        stepId: "step-final",
        completedAt: now.toISOString(),
        payload: {},
        updatedAt: now.toISOString(),
      },
    }));
  }

  // 把連續相同 phase 的步驟分組
  const groups: { phase: string; steps: CurriculumStep[] }[] = [];
  for (const step of curriculum) {
    const last = groups[groups.length - 1];
    if (last && last.phase === step.phase) last.steps.push(step);
    else groups.push({ phase: step.phase, steps: [step] });
  }

  return (
    <div className="flex flex-1 flex-col py-8">
      <div className="flex items-center gap-3 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          回首頁
        </Link>
      </div>

      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          一步一步來，不用急著全部學完
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-gradient">完整先修課表</span>
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          七上數學的概念先修路線：每學完一個單元就<strong className="text-foreground">做題提取</strong>、
          隔幾天<strong className="text-foreground">間隔複習</strong>，最後用嘴巴講一次。
          學完一個單元系統會自動<strong className="text-foreground">診斷吸收度</strong>，
          告訴你該前進、還是先回去把概念補穩。
        </p>

        {/* 整體進度 */}
        <div className="mt-5 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">單元學習進度</span>
            <span className="text-muted-foreground">
              {loaded ? `${doneUnitSteps} / ${totalUnitSteps} 單元完成` : "讀取中…"}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${totalUnitSteps ? (doneUnitSteps / totalUnitSteps) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.phase}>
            <h2 className="mb-3 text-sm font-bold tracking-wide text-muted-foreground">
              {group.phase}
            </h2>
            <div className="space-y-3 border-l-2 border-dashed border-border pl-4 sm:pl-5">
              {group.steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  done={isStepDone(step)}
                  isNext={step.id === nextStepId}
                  progress={progress}
                  course={course}
                  diagnosis={
                    step.unitId ? diagnoses[step.unitId] ?? null : null
                  }
                  now={now}
                  loaded={loaded}
                  onFinishCourse={handleFinishCourse}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        <p>
          這張課表不是要你照表操課趕進度——慢慢來，把每個概念用自己的話講得出來，比學得快重要。
          間隔複習的「建議幾天後」只是提示，晚一點做也沒關係。
        </p>
      </footer>
    </div>
  );
}

// 計算間隔複習檢核點的狀態
function reviewState(
  step: CurriculumStep,
  progress: ProgressMap,
  now: Date,
): { locked: boolean; ready: boolean; waitDays: number } {
  const prereq = step.reviewUnitIds ?? [];
  const completedDates = prereq
    .map((id) => progress[id]?.completedAt)
    .filter((d): d is string => Boolean(d));
  const allDone = prereq.length > 0 && completedDates.length === prereq.length;
  if (!allDone) return { locked: true, ready: false, waitDays: 0 };
  const latest = completedDates
    .map((d) => new Date(d).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  const elapsedDays = Math.floor((now.getTime() - latest) / 86_400_000);
  const waitDays = Math.max(0, (step.spacingDays ?? 0) - elapsedDays);
  return { locked: false, ready: waitDays <= 0, waitDays };
}

function StepCard({
  step,
  done,
  isNext,
  progress,
  course,
  diagnosis,
  now,
  loaded,
  onFinishCourse,
}: {
  step: CurriculumStep;
  done: boolean;
  isNext: boolean;
  progress: ProgressMap;
  course: CourseMap;
  diagnosis: DiagnosisRecord | null;
  now: Date;
  loaded: boolean;
  onFinishCourse: () => void;
}) {
  const Icon =
    step.kind === "unit" ? BookOpen : step.kind === "review" ? Repeat : Mic;

  // 各 kind 的副資訊與行動
  let href: string | null = null;
  let statusNode: React.ReactNode = null;
  let actionLabel = "開始";

  if (step.kind === "unit" && step.unitId) {
    href = `/unit/${step.unitId}`;
    const p = progress[step.unitId];
    const reached = p?.sectionReached ?? 0;
    if (done) {
      actionLabel = "再看一次";
    } else if (reached > 0) {
      actionLabel = "繼續";
      statusNode = (
        <span className="text-xs text-muted-foreground">
          進行到第 {reached} 段
        </span>
      );
    }
  } else if (step.kind === "review") {
    const rs = reviewState(step, progress, now);
    href = rs.locked ? null : `/review?checkpoint=${step.checkpointId}`;
    const cp = course[step.id];
    const lastScore = cp?.payload as { correct?: number; total?: number } | undefined;
    if (done) {
      actionLabel = "再複習一次";
      if (lastScore?.total) {
        statusNode = (
          <span className="text-xs font-medium text-correct">
            上次 {lastScore.correct}/{lastScore.total}
          </span>
        );
      }
    } else if (rs.locked) {
      statusNode = (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          完成前面單元後解鎖
        </span>
      );
    } else if (!rs.ready) {
      statusNode = (
        <span className="flex items-center gap-1 text-xs text-gentle-foreground">
          <Clock className="h-3 w-3" />
          建議 {rs.waitDays} 天後再做（讓記憶沉澱）
        </span>
      );
      actionLabel = "還是要做";
    } else {
      statusNode = (
        <span className="text-xs font-medium text-accent">可以做了</span>
      );
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-4 transition-all sm:p-5",
        done && "border-correct/30",
        isNext && !done && "border-primary/50 shadow-sm ring-1 ring-primary/20",
      )}
    >
      {/* 時間軸節點 */}
      <span
        className={cn(
          "absolute -left-[1.45rem] top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background sm:-left-[1.7rem]",
          done
            ? "border-correct text-correct"
            : isNext
              ? "border-primary text-primary"
              : "border-border text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {step.principle}
            </span>
            {isNext && !done && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                下一步
              </span>
            )}
            {done && (
              <span className="flex items-center gap-1 rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                <CheckCircle2 className="h-3 w-3" />
                完成
              </span>
            )}
          </div>
          <h3 className="mt-1.5 font-bold tracking-tight">{step.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {step.note}
          </p>
          {loaded && statusNode && <div className="mt-2">{statusNode}</div>}

          {/* 該單元的最新診斷摘要 */}
          {loaded && diagnosis && (
            <DiagnosisChip diagnosis={diagnosis} />
          )}
        </div>

        {/* 行動按鈕 */}
        <div className="shrink-0">
          {step.kind === "milestone" ? (
            done ? (
              <span className="text-sm font-medium text-correct">🎉 已驗收</span>
            ) : (
              <button
                onClick={onFinishCourse}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                我講完了
              </button>
            )
          ) : href ? (
            <Link
              href={href}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                done
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : isNext
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DiagnosisChip({ diagnosis }: { diagnosis: DiagnosisRecord }) {
  const d = diagnosis.diagnosis;
  const style = ABSORPTION[d.absorption_level] ?? ABSORPTION["部分理解"];
  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          上次診斷：
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            style.cls,
          )}
        >
          {style.emoji} 吸收度・{d.absorption_level}
        </span>
        {diagnosis.source === "heuristic" && (
          <span className="text-[10px] text-muted-foreground">（離線判斷）</span>
        )}
      </div>
      {d.child_note && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
          {d.child_note}
        </p>
      )}
    </div>
  );
}
