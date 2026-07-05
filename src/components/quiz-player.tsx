"use client";

// 通用題組答題引擎（五科共用）。
//
// 流程：一次一題 → 立刻對答案 → 一定看得到「詳解 + 這題在考什麼概念」
// → 答錯的題回鍋排到後面，整組每題都對過才完成 → 結算畫面存紀錄。
// 「一次就對」的題數才是實力分數；回鍋全對是精熟門檻，兩個分開呈現。

import * as React from "react";
import Link from "next/link";
import type { QuizSet, QuizQuestion } from "@/content/quizzes/types";
import { getSubject, getTopic } from "@/content/subjects";
import { saveQuizAttempt } from "@/lib/quiz-storage";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

// 填答比對：忽略大小寫、前後空白、全形/半形差異、常見標點
function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s。，．.,、！!？?'’‘"“”]/g, "")
    .replace(/[０-９ａ-ｚＡ-Ｚ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0),
    );
}

function isTextCorrect(q: QuizQuestion, input: string): boolean {
  const n = normalize(input);
  return (q.answerText ?? []).some((a) => normalize(a) === n);
}

type Phase = "answering" | "feedback" | "done";

export function QuizPlayer({ quiz }: { quiz: QuizSet }) {
  const subject = getSubject(quiz.subjectId);
  const topic = quiz.topicId ? getTopic(quiz.topicId) : undefined;

  // queue 放「還沒答對」的題目 id；答錯就 push 回尾端
  const [queue, setQueue] = React.useState<string[]>(() =>
    quiz.questions.map((q) => q.id),
  );
  const [firstTry, setFirstTry] = React.useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = React.useState<Set<string>>(new Set());
  const [phase, setPhase] = React.useState<Phase>("answering");
  const [picked, setPicked] = React.useState<number | null>(null);
  const [typed, setTyped] = React.useState("");
  const [lastCorrect, setLastCorrect] = React.useState(false);
  const [answeredCount, setAnsweredCount] = React.useState(0); // 已「答對過」的題數
  const [saved, setSaved] = React.useState(false);

  const current = quiz.questions.find((q) => q.id === queue[0]);
  const total = quiz.questions.length;
  const color = subject?.color.main ?? "hsl(252 83% 62%)";

  function submit() {
    if (!current) return;
    const correct =
      current.type === "choice"
        ? picked === current.answerIndex
        : isTextCorrect(current, typed);
    // 第一次碰這題才記入「一次就對」
    if (!attempted.has(current.id)) {
      setAttempted((s) => new Set(s).add(current.id));
      setFirstTry((m) => ({ ...m, [current.id]: correct }));
    }
    setLastCorrect(correct);
    setPhase("feedback");
  }

  function next() {
    if (!current) return;
    const rest = queue.slice(1);
    const nextQueue = lastCorrect ? rest : [...rest, current.id];
    if (lastCorrect) setAnsweredCount((n) => n + 1);
    setPicked(null);
    setTyped("");
    if (nextQueue.length === 0) {
      setPhase("done");
      if (!saved) {
        setSaved(true);
        const firstTryCorrect = quiz.questions.filter(
          (q) => firstTry[q.id],
        ).length;
        void saveQuizAttempt({
          quizId: quiz.id,
          firstTryCorrect,
          total,
          wrongQuestionIds: quiz.questions
            .filter((q) => !firstTry[q.id])
            .map((q) => q.id),
          finishedAt: new Date().toISOString(),
        });
      }
    } else {
      setQueue(nextQueue);
      setPhase("answering");
    }
  }

  function restart() {
    setQueue(quiz.questions.map((q) => q.id));
    setFirstTry({});
    setAttempted(new Set());
    setPhase("answering");
    setPicked(null);
    setTyped("");
    setAnsweredCount(0);
    setSaved(false);
  }

  // ── 結算畫面 ──
  if (phase === "done") {
    const firstTryCorrect = quiz.questions.filter((q) => firstTry[q.id]).length;
    const perfect = firstTryCorrect === total;
    return (
      <div className="flex flex-1 flex-col py-10">
        <BackLink subjectId={quiz.subjectId} />
        <div className="animate-fade-in rounded-2xl border bg-card p-8 text-center shadow-soft">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: subject?.color.soft }}
          >
            {perfect ? "🏆" : "💪"}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            {perfect ? "全部一次就對，太強了！" : "整組都答對過了，過關！"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {quiz.title}・共 {total} 題
          </p>
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-6">
            <div>
              <div className="text-3xl font-black" style={{ color }}>
                {firstTryCorrect}/{total}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                一次就對（實力分）
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-correct">100%</div>
              <div className="mt-1 text-xs text-muted-foreground">
                最後全數答對（精熟）
              </div>
            </div>
          </div>
          {!perfect && (
            <div className="mx-auto mt-6 max-w-md rounded-xl bg-secondary/60 p-4 text-left text-sm leading-relaxed">
              <p className="font-medium">回鍋過的題目，考的是這些概念：</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {quiz.questions
                  .filter((q) => !firstTry[q.id])
                  .map((q) => (
                    <li key={q.id} className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                      <span>{q.concept}</span>
                    </li>
                  ))}
              </ul>
              <p className="mt-3 text-muted-foreground">
                答錯不代表你不行——代表這個概念還沒站穩。過幾天再回來挑戰一次，
                「一次就對」的分數會告訴你有沒有真的進步。
              </p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              再挑戰一次
            </button>
            <Link
              href={`/subject/${quiz.subjectId}`}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: subject?.color.grad }}
            >
              回{subject?.name}基地
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const isFirstVisit = !attempted.has(current.id);
  const progress = total ? answeredCount / total : 0;

  return (
    <div className="flex flex-1 flex-col py-10">
      <BackLink subjectId={quiz.subjectId} />

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ background: color }}
          >
            {subject?.emoji} {subject?.name}
          </span>
          {topic && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {topic.title}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
          {quiz.title}
        </h1>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              已過關 {answeredCount}/{total} 題
              {queue.length > total - answeredCount && "（有題目回鍋中）"}
            </span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%`, background: subject?.color.grad }}
            />
          </div>
        </div>
      </header>

      <div className="animate-fade-in rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {phase === "answering" && !isFirstVisit && (
            <span className="rounded-full bg-gentle/15 px-2 py-0.5 text-gentle">
              回鍋題・這次要拿下
            </span>
          )}
        </div>
        <p className="mt-2 whitespace-pre-line text-lg font-medium leading-relaxed">
          {current.question}
        </p>

        {/* 作答區 */}
        {current.type === "choice" ? (
          <div className="mt-5 space-y-2.5">
            {(current.choices ?? []).map((c, i) => {
              const isPicked = picked === i;
              const isAnswer = i === current.answerIndex;
              const showState = phase === "feedback";
              return (
                <button
                  key={i}
                  disabled={phase === "feedback"}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-all",
                    !showState && isPicked && "border-transparent ring-2",
                    !showState && !isPicked && "hover:bg-secondary/60",
                    showState && isAnswer && "border-correct bg-correct/10",
                    showState &&
                      isPicked &&
                      !isAnswer &&
                      "border-gentle/50 bg-gentle/10 opacity-80",
                    showState && !isPicked && !isAnswer && "opacity-50",
                  )}
                  style={
                    !showState && isPicked
                      ? ({ "--tw-ring-color": color } as React.CSSProperties)
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    )}
                    style={{
                      background:
                        showState && isAnswer
                          ? "hsl(var(--correct))"
                          : subject?.color.soft,
                      color: showState && isAnswer ? "white" : color,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{c}</span>
                  {showState && isAnswer && (
                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-correct" />
                  )}
                  {showState && isPicked && !isAnswer && (
                    <XCircle className="ml-auto h-5 w-5 shrink-0 text-gentle" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <input
              value={typed}
              disabled={phase === "feedback"}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && typed.trim() && phase === "answering")
                  submit();
              }}
              placeholder="把答案打在這裡"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg outline-none transition-shadow focus:ring-2"
              style={{ "--tw-ring-color": color } as React.CSSProperties}
              autoFocus
            />
          </div>
        )}

        {/* 送出 / 回饋 */}
        {phase === "answering" ? (
          <button
            onClick={submit}
            disabled={
              current.type === "choice" ? picked === null : !typed.trim()
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: subject?.color.grad }}
          >
            對答案
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="animate-fade-in mt-6">
            <div
              className={cn(
                "rounded-xl p-4",
                lastCorrect ? "bg-correct/10" : "bg-gentle/10",
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-2 font-bold",
                  lastCorrect ? "text-correct" : "text-gentle",
                )}
              >
                {lastCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> 答對了！
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    {current.type === "text"
                      ? `還不對。答案是：${(current.answerText ?? [])[0] ?? ""}`
                      : "還不對，看一下為什麼——等一下這題會再出現"}
                  </>
                )}
              </p>
              <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                <div>
                  <p className="whitespace-pre-line">{current.explanation}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    <Target className="mr-1 inline h-3.5 w-3.5" />
                    這題在考：{current.concept}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: subject?.color.grad }}
              autoFocus
            >
              {queue.length === 1 && lastCorrect ? (
                <>
                  看成績 <Trophy className="h-4 w-4" />
                </>
              ) : (
                <>
                  下一題 <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BackLink({ subjectId }: { subjectId: string }) {
  const subject = getSubject(subjectId);
  return (
    <Link
      href={`/subject/${subjectId}`}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      回{subject?.name ?? ""}基地
    </Link>
  );
}
