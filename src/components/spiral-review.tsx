"use client";

import * as React from "react";
import type { SpiralQuestion } from "@/content/spiral";
import { getUnit } from "@/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefreshCw, Target } from "lucide-react";

export function SpiralReview({
  questions,
  onRestart,
  onComplete,
}: {
  questions: SpiralQuestion[];
  onRestart: () => void;
  // 一輪做完時回報每題對錯（給 /review 記錄 session、標記課表檢核點用）。觸發一次。
  onComplete?: (
    results: { question: SpiralQuestion; correct: boolean }[],
  ) => void;
}) {
  const [idx, setIdx] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [marks, setMarks] = React.useState<boolean[]>([]);

  const reachedEnd = idx >= questions.length;
  const reported = React.useRef(false);
  React.useEffect(() => {
    if (reachedEnd && questions.length > 0 && !reported.current) {
      reported.current = true;
      onComplete?.(
        questions.map((q, i) => ({ question: q, correct: marks[i] ?? false })),
      );
    }
  }, [reachedEnd, questions, marks, onComplete]);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        還沒有可以複習的內容——先去做一個單元，之後這裡就會出現混合小測。
      </div>
    );
  }

  const done = idx >= questions.length;

  if (done) {
    const correct = marks.filter(Boolean).length;
    const total = questions.length;
    const allRight = correct === total;
    return (
      <div className="animate-fade-in space-y-5">
        <div
          className={cn(
            "rounded-xl border p-6 text-center",
            allRight
              ? "border-correct/40 bg-correct/5"
              : "border-primary/30 bg-primary/5",
          )}
        >
          <p className="text-2xl font-bold">
            {correct} / {total} 題
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-foreground/85">
            {allRight
              ? "全對！這些都是你之前學的概念，換了新題目你照樣抓得到——這就是真的記住了。"
              : "複習的重點不是分數，是看出『這題在練我學過的哪個概念』。錯的那幾題，回想一下它考的概念，不用重看整個單元。"}
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={onRestart}>
            <RefreshCw className="h-4 w-4" />
            再來一輪（換新題）
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const unit = getUnit(q.unitId);

  function mark(ok: boolean) {
    setMarks((prev) => [...prev, ok]);
    setIdx((i) => i + 1);
    setAnswer("");
    setRevealed(false);
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* 進度 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          第 {idx + 1} / {questions.length} 題
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full",
                i < idx
                  ? marks[i]
                    ? "bg-correct"
                    : "bg-gentle"
                  : i === idx
                    ? "bg-primary"
                    : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <p className="text-[18px] leading-relaxed">{q.question}</p>
        <Textarea
          className="mt-4"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="算算看、寫下你的答案…"
          disabled={revealed}
        />

        {!revealed ? (
          <Button
            variant="outline"
            className="mt-3"
            disabled={answer.trim().length === 0}
            onClick={() => setRevealed(true)}
          >
            看答案對照
          </Button>
        ) : (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-[16px]">
                <span className="font-semibold text-primary">參考答案：</span>
                {q.answer}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="flex items-center gap-2 text-sm text-foreground/85">
                <Target className="h-4 w-4 shrink-0 text-accent" />
                <span>
                  這題在複習：<span className="font-medium">{q.concept}</span>
                  {unit && (
                    <span className="text-muted-foreground">
                      （單元{unit.order}・{unit.title}）
                    </span>
                  )}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm text-muted-foreground">我這題：</span>
              <Button size="sm" onClick={() => mark(true)}>
                答對了
              </Button>
              <Button size="sm" variant="accent" onClick={() => mark(false)}>
                答錯了
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
