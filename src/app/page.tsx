"use client";

import * as React from "react";
import Link from "next/link";
import { units } from "@/content";
import { getAllProgress, type UnitProgress } from "@/lib/storage";
import { SECTION_LABELS } from "@/components/progress-stepper";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Repeat, Sparkles } from "lucide-react";

export default function HomePage() {
  const [progress, setProgress] = React.useState<
    Record<string, UnitProgress>
  >({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const all = await getAllProgress();
      const map: Record<string, UnitProgress> = {};
      for (const p of all) map[p.unitId] = p;
      setProgress(map);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="flex flex-1 flex-col py-10">
      <header className="relative mb-8">
        {/* 浮動 emoji 裝飾（純裝飾、不擋點擊） */}
        <span
          aria-hidden
          className="float-bob pointer-events-none absolute right-1 top-0 hidden text-4xl opacity-70 sm:block"
        >
          🧮
        </span>
        <span
          aria-hidden
          className="float-bob pointer-events-none absolute right-16 top-9 hidden text-2xl opacity-60 sm:block"
          style={{ animationDelay: "1.6s" }}
        >
          ✨
        </span>
        <span
          aria-hidden
          className="float-bob pointer-events-none absolute right-28 top-1 hidden text-xl opacity-50 sm:block"
          style={{ animationDelay: "3.2s" }}
        >
          💡
        </span>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          概念理解，不是多寫題目
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">國中數學・把概念打扎實</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          每個單元都用同一套五段式流程：先看見概念怎麼來，自己一步步把規則推出來，
          再用<strong className="text-foreground">自己的話講清楚為什麼</strong>，
          最後用<strong className="text-foreground">變形題</strong>驗證你是真懂、還是在背題型。
        </p>
      </header>

      {/* 螺旋複習入口 */}
      <Link
        href="/review"
        className="group mb-4 flex items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-5 transition-all hover:border-accent/50 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Repeat className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold tracking-tight">螺旋複習</h2>
            <p className="text-sm text-muted-foreground">
              把學過的概念，用新題目混合練一遍（不用重看舊內容）
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </Link>

      <div className="space-y-4">
        {units.map((unit) => {
          const p = progress[unit.id];
          const reached = p?.sectionReached ?? 0;
          const done = Boolean(p?.completedAt);
          const started = reached > 0;
          return (
            <Link
              key={unit.id}
              href={`/unit/${unit.id}`}
              className="group block rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      單元 {unit.order}
                    </span>
                    {unit.checkMode === "ai" ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                        AI 解釋判斷
                      </span>
                    ) : (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        靜態對照
                      </span>
                    )}
                    {done && (
                      <span className="flex items-center gap-1 rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        已完成
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-bold tracking-tight">
                    {unit.title}
                  </h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {unit.summary}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              {/* 進度條 */}
              {loaded && started && !done && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      進行到：第 {reached} 段（{SECTION_LABELS[reached - 1]}）
                    </span>
                    <span>{Math.round((reached / 5) * 100)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full bg-primary")}
                      style={{ width: `${(reached / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        <p>
          這個網站是為了「概念理解」設計的，刻意不給一堆練習題。
          進度與你寫的解釋預設存在這台電腦的瀏覽器裡（本機自用）。
        </p>
      </footer>
    </div>
  );
}
