"use client";

// 家長頁的「線上題目答題狀況」——跨五科彙整。
// 資料來源：quiz-storage 的歷史紀錄（有 Supabase 拉雲端全部，否則本機最新一筆）。
// 對每一科算：做過幾組、幾次、最佳「一次就對」率，並列出最常答錯的概念。

import * as React from "react";
import { subjects, getSubject } from "@/content/subjects";
import { getQuiz, quizzes } from "@/content/quizzes";
import {
  getQuizHistory,
  type QuizAttemptRow,
} from "@/lib/quiz-storage";
import { cn } from "@/lib/utils";
import { Target, Trophy } from "lucide-react";

interface SubjectQuizStat {
  subjectId: string;
  attempts: number; // 完成過幾輪（跨該科所有題組）
  quizzesTried: number; // 做過幾組不同的題組
  bestRate: number; // 最佳單組「一次就對」率
  weakConcepts: { concept: string; count: number }[];
}

function buildStats(history: QuizAttemptRow[]): SubjectQuizStat[] {
  const bySubject = new Map<
    string,
    {
      attempts: number;
      quizIds: Set<string>;
      bestRate: number;
      wrongConcepts: Map<string, number>;
    }
  >();

  for (const a of history) {
    const quiz = getQuiz(a.quizId);
    if (!quiz) continue;
    const sid = quiz.subjectId;
    if (!bySubject.has(sid)) {
      bySubject.set(sid, {
        attempts: 0,
        quizIds: new Set(),
        bestRate: 0,
        wrongConcepts: new Map(),
      });
    }
    const s = bySubject.get(sid)!;
    s.attempts += 1;
    s.quizIds.add(a.quizId);
    const rate = a.total > 0 ? a.firstTryCorrect / a.total : 0;
    if (rate > s.bestRate) s.bestRate = rate;
    // 把答錯題 id 對回概念名稱
    for (const qid of a.wrongQuestionIds) {
      const q = quiz.questions.find((q) => q.id === qid);
      if (!q) continue;
      s.wrongConcepts.set(q.concept, (s.wrongConcepts.get(q.concept) ?? 0) + 1);
    }
  }

  return Array.from(bySubject.entries()).map(([subjectId, s]) => ({
    subjectId,
    attempts: s.attempts,
    quizzesTried: s.quizIds.size,
    bestRate: s.bestRate,
    weakConcepts: Array.from(s.wrongConcepts.entries())
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
  }));
}

export function QuizParentSummary() {
  const [history, setHistory] = React.useState<QuizAttemptRow[] | null>(null);

  React.useEffect(() => {
    void getQuizHistory().then(setHistory);
  }, []);

  if (history === null) return null;
  if (history.length === 0) return null;

  const stats = buildStats(history);
  const totalQuizzes = quizzes.length;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">線上題目・答題狀況</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        「一次就對」率才是實力訊號（答錯回鍋、整組全對只代表有耐心做完）。
        最常答錯的概念列在下面，就是最該回去補的地方。
      </p>

      <div className="space-y-3">
        {subjects.map((subject) => {
          const stat = stats.find((s) => s.subjectId === subject.id);
          if (!stat) return null;
          return (
            <div
              key={subject.id}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                    style={{ background: subject.color.soft }}
                  >
                    {subject.emoji}
                  </span>
                  <div>
                    <p className="font-bold">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      做過 {stat.quizzesTried} 組・共 {stat.attempts} 次
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    stat.bestRate >= 0.8
                      ? "bg-correct/15 text-correct"
                      : stat.bestRate >= 0.5
                        ? "bg-accent/15 text-accent"
                        : "bg-gentle/20 text-gentle-foreground",
                  )}
                >
                  最佳一次就對 {Math.round(stat.bestRate * 100)}%
                </span>
              </div>

              {stat.weakConcepts.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    最常答錯的概念（該回去補）
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stat.weakConcepts.map((w) => (
                      <span
                        key={w.concept}
                        className="inline-flex items-center gap-1 rounded-lg bg-gentle/10 px-2.5 py-1 text-xs text-gentle-foreground"
                      >
                        <Target className="h-3 w-3" />
                        {w.concept}
                        {w.count > 1 && (
                          <span className="font-semibold">×{w.count}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        全站目前有 {totalQuizzes} 組線上題目，之後會持續增加。
      </p>
    </section>
  );
}
