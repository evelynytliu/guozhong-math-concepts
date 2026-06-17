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
  type UnitProgress,
} from "@/lib/storage";
import { ArrowLeft, ArrowRight, ChevronLeft, Dumbbell } from "lucide-react";

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

  // 載入既有進度（resume）
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
