"use client";

import * as React from "react";
import Link from "next/link";
import { units } from "@/content";
import { homeworks } from "@/content/homework";
import { wenyanWords } from "@/content/wenyan";
import { VOCAB_TOTAL } from "@/content/homework/vocab";
import { getAllProgress, type UnitProgress } from "@/lib/storage";
import {
  getAllWenyanProgress,
  type WenyanProgress,
} from "@/lib/wenyan-storage";
import {
  getAllDrafts,
  getAllVocabProgress,
  type DraftData,
  type VocabProgressData,
} from "@/lib/homework-storage";
import {
  getAllPracticeData,
  summarizePractice,
  type UnitPracticeData,
} from "@/lib/practice-storage";
import { SECTION_LABELS } from "@/components/progress-stepper";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  Repeat,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [progress, setProgress] = React.useState<Record<string, UnitProgress>>(
    {},
  );
  const [drafts, setDrafts] = React.useState<Record<string, DraftData>>({});
  const [vocab, setVocab] = React.useState<Record<string, VocabProgressData>>(
    {},
  );
  const [practice, setPractice] = React.useState<
    Record<string, UnitPracticeData>
  >({});
  const [wenyan, setWenyan] = React.useState<Record<string, WenyanProgress>>(
    {},
  );
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [all, d, v, wy] = await Promise.all([
        getAllProgress(),
        getAllDrafts(),
        getAllVocabProgress(),
        getAllWenyanProgress(),
      ]);
      const map: Record<string, UnitProgress> = {};
      for (const p of all) map[p.unitId] = p;
      setProgress(map);
      setDrafts(d);
      setVocab(v);
      setPractice(getAllPracticeData());
      const wmap: Record<string, WenyanProgress> = {};
      for (const p of wy) wmap[p.wordId] = p;
      setWenyan(wmap);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="flex flex-1 flex-col py-10">
      <header className="relative mb-8">
        <span
          aria-hidden
          className="float-bob pointer-events-none absolute right-1 top-0 hidden text-4xl opacity-70 sm:block"
        >
          📚
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
          ✍️
        </span>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          自己想、自己寫，才是你的
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">升國中・暑假學習基地</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          這裡幫你把<strong className="text-foreground">暑假作業</strong>一步步想清楚、打成草稿，
          再<strong className="text-foreground">親手抄到作業本上</strong>；
          也幫你把國中數學的<strong className="text-foreground">概念</strong>打扎實。
          重點都一樣——用自己的話想出來，不是照背、照抄。
        </p>
        <div className="mt-4">
          <Link
            href="/parent"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            家長檢視（查看孩子的學習紀錄）
          </Link>
        </div>
      </header>

      {/* ── 暑假作業引導 ── */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">📚 暑假作業引導</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {homeworks.length} 科
          </span>
        </div>
        <div className="space-y-3">
          {homeworks.map((hw) => {
            const st = statusFor(hw, drafts, vocab);
            return (
              <Link
                key={hw.id}
                href={`/homework/${hw.id}`}
                className="group block rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {hw.subjectEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {hw.subject}科
                      </span>
                      {hw.kind === "vocab" ? (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                          拼到全對
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          引導打草稿
                        </span>
                      )}
                      {loaded && st.done && (
                        <span className="flex items-center gap-1 rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {hw.kind === "vocab" ? "全部拼對" : "已手抄完成"}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold tracking-tight">
                      {hw.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hw.pdfNote}
                    </p>
                    {loaded && !st.done && st.started && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{st.label}</span>
                          <span>{Math.round(st.pct * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              hw.kind === "vocab" ? "bg-accent" : "bg-primary",
                            )}
                            style={{ width: `${st.pct * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {loaded && !st.started && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {st.label}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 國文・文言文（古今異義） ── */}
      <section className="mb-10">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight">
            📖 國文・文言文（先修）
          </h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            古今異義
          </span>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          同一個字，古代和現在意思常常不一樣。這裡不要你背對照表——
          <strong className="text-foreground">帶你自己推出古義</strong>，
          再用「沒看過的句子」驗證你是真懂還是在背。
        </p>
        <div className="space-y-3">
          {wenyanWords.map((w) => {
            const p = wenyan[w.id];
            const reached = p?.sectionReached ?? 0;
            const done = Boolean(p?.completedAt);
            const started = reached > 0;
            return (
              <Link
                key={w.id}
                href={`/wenyan/${w.id}`}
                className="group block rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="grad-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-black text-primary-foreground">
                    {w.word.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        第 {w.order} 字・{w.word}
                      </span>
                      {done && (
                        <span className="flex items-center gap-1 rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          已完成
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                      {w.teaser}
                    </p>
                    {loaded && started && !done && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            進行到：第 {reached} 拍 / 5
                          </span>
                          <span>{Math.round((reached / 5) * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(reached / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 數學概念 ── */}
      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight">
          🧮 數學・概念理解（國中先修）
        </h2>

        {/* 完整先修課表入口（主要進入點） */}
        <Link
          href="/course"
          className="group mb-4 block overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-5 transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold tracking-tight">完整先修課表</h3>
                <p className="text-sm text-muted-foreground">
                  照順序一步步學：學單元 → 間隔複習 → 完成自動診斷吸收度
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </Link>

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
              <h3 className="font-bold tracking-tight">螺旋複習</h3>
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
            const ps = summarizePractice(
              practice[unit.id],
              unit.practiceZone?.drill.questions.length ?? 0,
            );
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
                    <h3 className="mt-2 text-xl font-bold tracking-tight">
                      {unit.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                      {unit.summary}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>

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

                {/* 練習區紀錄：做過沒、做了幾次 */}
                {loaded && unit.practiceZone && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Dumbbell className="h-3.5 w-3.5" />
                      練習區
                    </span>
                    {ps.practiced ? (
                      <>
                        {ps.challengeRounds > 0 && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            變形題挑戰 {ps.challengeRounds} 回
                          </span>
                        )}
                        {ps.bestTotal > 0 && (
                          <span className="rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                            最佳 {ps.bestCorrect}/{ps.bestTotal}
                          </span>
                        )}
                        {ps.drillDone > 0 && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            手感題 {ps.drillDone}/{ps.drillTotal}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        還沒開始
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        <p>
          暑假作業在這裡只是「打草稿、想清楚」——草稿好了一定要親手抄到作業本上才算交。
          進度與你寫的內容預設存在這台電腦裡（本機自用）。
        </p>
      </footer>
    </div>
  );
}

// 計算每份作業的狀態（給首頁卡片用）
function statusFor(
  hw: (typeof homeworks)[number],
  drafts: Record<string, DraftData>,
  vocab: Record<string, VocabProgressData>,
): { label: string; pct: number; done: boolean; started: boolean } {
  if (hw.kind === "vocab") {
    const m = vocab[hw.id]?.masteredCardIds.length ?? 0;
    const done = m >= VOCAB_TOTAL;
    return {
      label: m === 0 ? "還沒開始・拼到全對就過關" : `已拼對 ${m}/${VOCAB_TOTAL} 個字`,
      pct: VOCAB_TOTAL ? m / VOCAB_TOTAL : 0,
      done,
      started: m > 0,
    };
  }
  const d = drafts[hw.id];
  const required = hw.fields.filter((f) => !f.optional);
  const filled = required.filter(
    (f) => (d?.fields[f.id] ?? "").trim().length > 0,
  ).length;
  if (d?.handCopied) {
    return { label: "已手抄完成", pct: 1, done: true, started: true };
  }
  return {
    label:
      filled === 0
        ? "還沒開始・點進來一步步打草稿"
        : `草稿已寫 ${filled}/${required.length} 題`,
    pct: required.length ? filled / required.length : 0,
    done: false,
    started: filled > 0,
  };
}
