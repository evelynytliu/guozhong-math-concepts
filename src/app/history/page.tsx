"use client";

// /history — 歷史 3D 場景館的關卡選擇頁（hub）。
// 依課排列：已實作的課列出場景關卡卡（含進度徽章），
// 未實作的課顯示「即將開放」預告卡（規劃見 content/history/index.ts）。

import * as React from "react";
import Link from "next/link";
import {
  historyLessonPlans,
  historyScenes,
  scenesForLesson,
} from "@/content/history";
import {
  getAllSceneProgress,
  historyStats,
} from "@/lib/history-storage";
import type { SceneProgress } from "@/lib/history-storage";
import { ArrowLeft, ArrowRight, Lock, Medal } from "lucide-react";

export default function HistoryHubPage() {
  const [progress, setProgress] = React.useState<Record<string, SceneProgress>>(
    {},
  );
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setProgress(getAllSceneProgress());
    setLoaded(true);
  }, []);

  const stats = historyStats(historyScenes.map((s) => s.id));
  const totalTerms = historyScenes.reduce(
    (n, s) => n + s.stages.reduce((m, st) => m + st.terms.length, 0),
    0,
  );

  return (
    <div className="flex flex-1 flex-col py-8">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        回首頁
      </Link>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, hsl(202 82% 40%), hsl(230 80% 52%))",
        }}
      >
        <span aria-hidden className="absolute -right-4 -top-6 text-8xl opacity-20">
          🏛️
        </span>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          社會・歷史｜康軒 第二單元 臺灣的歷史（上）
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          歷史 3D 場景館
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/90">
          走進一幕幕 3D 歷史現場，把發光的名詞卡全部收集起來，
          最後用快問快答拿下徽章——課本名詞，用眼睛記。
        </p>
        {loaded && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-white/20 px-3 py-1">
              🏅 徽章 {stats.badges}/{historyScenes.length}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1">
              📇 名詞卡 {stats.cards}/{totalTerms}
            </span>
          </div>
        )}
      </header>

      {/* ── 各課關卡 ── */}
      <div className="mt-8 space-y-8">
        {historyLessonPlans.map((plan) => {
          const scenes = scenesForLesson(plan.lesson);
          return (
            <section key={plan.lesson}>
              <h2 className="mb-3 flex items-baseline gap-2 text-lg font-extrabold tracking-tight">
                <span
                  className="rounded-lg px-2 py-0.5 text-sm text-white"
                  style={{ background: "hsl(202 82% 45%)" }}
                >
                  第 {plan.lesson} 課
                </span>
                {plan.title}
              </h2>

              {scenes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {scenes.map((s) => {
                    const p = progress[s.id];
                    const stageCount = s.stages.length;
                    const status = p?.quizPassed
                      ? "done"
                      : p && (p.stageIndex > 0 || p.collected.length > 0)
                        ? "playing"
                        : "new";
                    return (
                      <Link
                        key={s.id}
                        href={`/history/${s.id}`}
                        className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-2xl transition-transform group-hover:scale-110">
                            {s.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold tracking-tight">
                                {s.title}
                              </h3>
                              {status === "done" && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                  <Medal className="h-3 w-3" />
                                  {s.badge.name}
                                </span>
                              )}
                              {status === "playing" && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                  進行中
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                              {s.subtitle}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-sky-700">
                              <span>
                                {stageCount} 幕・約 {s.minutes} 分鐘
                              </span>
                              {p && !p.quizPassed && p.collected.length > 0 && (
                                <span className="text-amber-600">
                                  已收 {p.collected.length} 張卡
                                </span>
                              )}
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {plan.scenes.map((t) => (
                    <div
                      key={t.title}
                      className="flex items-start gap-3 rounded-2xl border border-dashed bg-muted/40 p-4"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-2xl opacity-60">
                        {t.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold tracking-tight text-muted-foreground">
                            {t.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-bold text-stone-500">
                            <Lock className="h-3 w-3" />
                            即將開放
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground/80">
                          {t.teaser}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className="mt-10 border-t pt-5 text-sm text-muted-foreground">
        進度存在這台裝置上。玩完一關，記得闔上螢幕，
        用嘴巴跟家人講一遍剛剛的故事——講得出來才算真的記住。
      </footer>
    </div>
  );
}
