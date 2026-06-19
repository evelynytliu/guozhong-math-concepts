"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Unit } from "@/content/types";
import { getNextUnit } from "@/content";
import { ProgressStepper } from "@/components/progress-stepper";
import { Section1Intro } from "@/components/sections/section1-intro";
import { Section2Guided } from "@/components/sections/section2-guided";
import { Section3Explain } from "@/components/sections/section3-explain";
import { Section4Variants } from "@/components/sections/section4-variants";
import { Section5Recap } from "@/components/sections/section5-recap";
import { PracticeZone } from "@/components/practice-zone";
import { Button } from "@/components/ui/button";
import {
  getProgress,
  saveProgress,
  getLatestExplanation,
  type UnitProgress,
} from "@/lib/storage";
import { getPracticeData } from "@/lib/practice-storage";
import {
  requestDiagnosis,
  heuristicDiagnosis,
  type Diagnosis,
  type DiagnoseSignals,
} from "@/lib/diagnose";
import { saveDiagnosis, getLatestDiagnosis } from "@/lib/diagnosis-storage";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Dumbbell,
  Repeat,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type DiagState = {
  state: "idle" | "running" | "done";
  result: Diagnosis | null;
  source: "ai" | "heuristic" | null;
};

const ABSORPTION_STYLE: Record<string, { cls: string; emoji: string }> = {
  扎實: { cls: "bg-correct/15 text-correct", emoji: "🟢" },
  大致理解: { cls: "bg-accent/15 text-accent", emoji: "🔵" },
  部分理解: { cls: "bg-gentle/20 text-gentle-foreground", emoji: "🟡" },
  還在背: { cls: "bg-destructive/10 text-destructive", emoji: "🔴" },
};

export function UnitFlow({ unit }: { unit: Unit }) {
  const router = useRouter();
  const hasPractice = Boolean(unit.practiceZone);
  const maxSection = hasPractice ? 6 : 5;

  const [current, setCurrent] = React.useState(1);
  const [reached, setReached] = React.useState(1);
  const [variantResults, setVariantResults] = React.useState<
    Record<string, boolean>
  >({});
  const [completedAt, setCompletedAt] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [diag, setDiag] = React.useState<DiagState>({
    state: "idle",
    result: null,
    source: null,
  });

  // 載入既有進度（resume）+ 若已完成，撈出上次的診斷一起顯示
  React.useEffect(() => {
    let active = true;
    (async () => {
      const p = await getProgress(unit.id);
      if (!active) return;
      if (p) {
        setReached(Math.max(1, p.sectionReached));
        setCurrent(Math.max(1, p.sectionReached));
        setVariantResults(p.variantResults ?? {});
        setCompletedAt(p.completedAt);
        if (p.completedAt) {
          const existing = await getLatestDiagnosis(unit.id);
          if (active && existing)
            setDiag({
              state: "done",
              result: existing.diagnosis,
              source: existing.source,
            });
        }
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [unit.id]);

  // 進度有變動就存（練習區不算進 sectionReached，五段式進度才算）
  const persist = React.useCallback(
    (patch: Partial<UnitProgress>) => {
      const next: UnitProgress = {
        unitId: unit.id,
        sectionReached: reached,
        completedAt,
        variantResults,
        ...patch,
      };
      void saveProgress(next);
    },
    [unit.id, reached, completedAt, variantResults],
  );

  function goTo(section: number) {
    const clamped = Math.min(maxSection, Math.max(1, section));
    setCurrent(clamped);
    // 練習區（第 6 段）不寫入 sectionReached，以免蓋掉五段式最高紀錄
    const reachedSection = Math.min(5, clamped);
    setReached((r) => {
      const nr = Math.max(r, reachedSection);
      void saveProgress({
        unitId: unit.id,
        sectionReached: nr,
        completedAt,
        variantResults,
      });
      return nr;
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleVariantResults(results: Record<string, boolean>) {
    setVariantResults(results);
    persist({ variantResults: results });
  }

  function handleFinish() {
    const now = new Date().toISOString();
    setCompletedAt(now);
    void saveProgress({
      unitId: unit.id,
      sectionReached: 5,
      completedAt: now,
      variantResults,
    });
    void runDiagnosis(now);
  }

  // 完成單元當下的即時診斷：蒐集這個單元的所有訊號 → 送 /api/diagnose
  //（線上站會打回本機 tunnel）→ AI 不可用就退回本地啟發式，保證一定有診斷被記錄。
  async function runDiagnosis(now: string) {
    setDiag({ state: "running", result: null, source: null });
    // 先把訊號組好，catch 時也能用本地啟發式產出
    let signals: DiagnoseSignals = { variants: [], challenge: [] };
    try {
      const explanation = await getLatestExplanation(unit.id);
      const practice = getPracticeData(unit.id);
      const latestSession = practice.sessions[0];
      const variantQs = unit.section4_variants.questions;
      signals = {
        explanation: explanation?.studentText,
        selfAssessment: explanation?.selfAssessment ?? null,
        aiUnderstanding: explanation?.aiFeedback?.understanding_level ?? null,
        variants: variantQs
          .filter((q) => q.id in variantResults)
          .map((q) => ({
            question: q.question,
            testingWhat: q.testingWhat,
            likeTextbook: q.likeTextbook,
            correct: variantResults[q.id] === true,
          })),
        challenge: (latestSession?.results ?? []).map((r) => ({
          difficulty: r.difficulty,
          conceptAspect: r.conceptAspect,
          correct: r.mark === "correct",
        })),
      };
      const conceptHint =
        unit.section3_explain.aiConceptHint || unit.summary;
      const res = await requestDiagnosis({
        unitId: unit.id,
        unitTitle: unit.title,
        conceptHint,
        signals,
      });
      const useAi = res.ok && res.diagnosis;
      const diagnosis = useAi ? res.diagnosis! : heuristicDiagnosis(signals);
      const source: "ai" | "heuristic" = useAi ? "ai" : "heuristic";
      await saveDiagnosis({
        unitId: unit.id,
        diagnosis,
        source,
        signals,
        createdAt: now,
      });
      setDiag({ state: "done", result: diagnosis, source });
    } catch {
      const diagnosis = heuristicDiagnosis(signals);
      await saveDiagnosis({
        unitId: unit.id,
        diagnosis,
        source: "heuristic",
        signals,
        createdAt: now,
      });
      setDiag({ state: "done", result: diagnosis, source: "heuristic" });
    }
  }

  const nextUnit = getNextUnit(unit.id);

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        載入進度中…
      </div>
    );
  }

  const isPracticeSection = current === 6;

  return (
    <div className="flex flex-1 flex-col pb-10">
      {/* 頂部：返回 + 單元標題 */}
      <div className="flex items-center gap-3 py-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          所有單元
        </Link>
      </div>
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
        {unit.title}
      </h1>

      {/* 進度指示 */}
      <div className="sticky top-0 z-10 -mx-4 mt-4 border-b bg-background/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <ProgressStepper
          current={current}
          reached={reached}
          onJump={goTo}
          hasPractice={hasPractice}
        />
      </div>

      {/* 內容 */}
      <main className="flex-1 py-8">
        {current === 1 && <Section1Intro unit={unit} />}
        {current === 2 && (
          <Section2Guided
            unit={unit}
            onComplete={() => setReached((r) => Math.max(r, 3))}
          />
        )}
        {current === 3 && <Section3Explain unit={unit} />}
        {current === 4 && (
          <Section4Variants unit={unit} onResults={handleVariantResults} />
        )}
        {current === 5 && (
          <div className="space-y-8">
            <Section5Recap unit={unit} />
            <UnitCompletion
              completed={Boolean(completedAt)}
              nextTitle={nextUnit?.title}
              hasPractice={hasPractice}
              onFinish={handleFinish}
              onNext={() =>
                nextUnit
                  ? router.push(`/unit/${nextUnit.id}`)
                  : router.push("/")
              }
              onPractice={() => goTo(6)}
            />
            {diag.state !== "idle" && (
              <DiagnosisResult
                diag={diag}
                hasPractice={hasPractice}
                nextTitle={nextUnit?.title}
                onRedo={() => goTo(2)}
                onSpiral={() => router.push("/review")}
                onNext={() =>
                  nextUnit
                    ? router.push(`/unit/${nextUnit.id}`)
                    : router.push("/")
                }
                onCourse={() => router.push("/course")}
              />
            )}
          </div>
        )}
        {current === 6 && <PracticeZone unit={unit} />}
      </main>

      {/* 底部導覽 */}
      <footer className="flex items-center justify-between border-t pt-6">
        <Button
          variant="ghost"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          {isPracticeSection ? "返回第 5 段" : "上一段"}
        </Button>
        {current < maxSection ? (
          <Button onClick={() => goTo(current + 1)}>
            {current === 5 && hasPractice ? (
              <>
                <Dumbbell className="h-4 w-4" />
                進入練習區
              </>
            ) : (
              <>
                下一段
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {isPracticeSection ? "練習完了？換一組繼續" : "這是最後一段"}
          </span>
        )}
      </footer>
    </div>
  );
}

function UnitCompletion({
  completed,
  nextTitle,
  hasPractice,
  onFinish,
  onNext,
  onPractice,
}: {
  completed: boolean;
  nextTitle?: string;
  hasPractice: boolean;
  onFinish: () => void;
  onNext: () => void;
  onPractice: () => void;
}) {
  if (!completed) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-[17px]">
          講完了嗎？講得出來，就按下面的按鈕，這個單元就算過關。
        </p>
        <Button className="mt-4" size="lg" onClick={onFinish}>
          我講得出來，完成這個單元 🎯
        </Button>
      </div>
    );
  }
  return (
    <div className="animate-fade-in space-y-4">
      <div className="rounded-xl border border-correct/40 bg-correct/5 p-6 text-center">
        <p className="text-lg font-semibold">這個單元完成了 🎉</p>
        <p className="mt-1 text-muted-foreground">
          你不是把它背起來，是真的把它推出來、講出來了。
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {hasPractice && (
            <Button variant="outline" size="lg" onClick={onPractice}>
              <Dumbbell className="h-4 w-4" />
              進入練習區（手感 + 變形挑戰）
            </Button>
          )}
          <Button size="lg" onClick={onNext}>
            {nextTitle ? `前往下一單元：${nextTitle}` : "回到所有單元"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 完成單元後的即時吸收度診斷（診斷中 → 結果 + 依建議的下一步）
function DiagnosisResult({
  diag,
  nextTitle,
  onRedo,
  onSpiral,
  onNext,
  onCourse,
}: {
  diag: DiagState;
  hasPractice: boolean;
  nextTitle?: string;
  onRedo: () => void;
  onSpiral: () => void;
  onNext: () => void;
  onCourse: () => void;
}) {
  if (diag.state === "running") {
    return (
      <div className="animate-fade-in rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          AI 老師正在看你這個單元的整體表現…
        </div>
      </div>
    );
  }

  const d = diag.result;
  if (!d) return null;
  const style =
    ABSORPTION_STYLE[d.absorption_level] ?? ABSORPTION_STYLE["部分理解"];

  const primary =
    d.next_action === "redo_guided"
      ? { label: "回第 2 段，把概念再推一次", Icon: RotateCcw, onClick: onRedo }
      : d.next_action === "spiral_review"
        ? { label: "去做螺旋複習（換新題練）", Icon: Repeat, onClick: onSpiral }
        : {
            label: nextTitle ? `前往下一單元：${nextTitle}` : "回到所有單元",
            Icon: ArrowRight,
            onClick: onNext,
          };
  const PrimaryIcon = primary.Icon;

  return (
    <div className="animate-fade-in space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">AI 吸收度診斷</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            style.cls,
          )}
        >
          {style.emoji} {d.absorption_level}
        </span>
        {diag.source === "heuristic" && (
          <span className="text-[10px] text-muted-foreground">
            （離線判斷；連上 AI 後會更準）
          </span>
        )}
      </div>

      <p className="text-[15px] leading-relaxed">{d.child_note}</p>

      <div className="rounded-lg bg-muted/40 p-3 text-sm text-foreground/80">
        <span className="font-medium">建議：</span>
        {d.recommendation}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={primary.onClick}>
          <PrimaryIcon className="h-4 w-4" />
          {primary.label}
        </Button>
        <button
          onClick={onCourse}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          回完整課表
        </button>
      </div>
    </div>
  );
}
