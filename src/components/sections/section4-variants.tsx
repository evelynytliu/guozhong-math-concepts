"use client";

import * as React from "react";
import type { Unit, VariantQuestion } from "@/content/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceButton } from "@/components/voice/voice-button";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

type Mark = "correct" | "wrong";

export function Section4Variants({
  unit,
  onResults,
}: {
  unit: Unit;
  onResults?: (results: Record<string, boolean>) => void;
}) {
  const s = unit.section4_variants;
  const [marks, setMarks] = React.useState<Record<string, Mark>>({});

  const allMarked = s.questions.every((q) => marks[q.id]);

  React.useEffect(() => {
    if (allMarked) {
      const record: Record<string, boolean> = {};
      for (const q of s.questions) record[q.id] = marks[q.id] === "correct";
      onResults?.(record);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMarked, marks]);

  function mark(id: string, m: Mark) {
    setMarks((prev) => ({ ...prev, [id]: m }));
  }

  // 回饋邏輯：抓「會題型但沒遷移」
  const feedbackKind: "allCorrect" | "firstOnlyCorrect" | "someWrong" | null =
    React.useMemo(() => {
      if (!allMarked) return null;
      const textbookQ = s.questions.find((q) => q.likeTextbook);
      const nonTextbook = s.questions.filter((q) => !q.likeTextbook);
      const allCorrect = s.questions.every((q) => marks[q.id] === "correct");
      if (allCorrect) return "allCorrect";
      const textbookCorrect =
        textbookQ && marks[textbookQ.id] === "correct";
      const noTransfer = nonTextbook.every((q) => marks[q.id] === "wrong");
      if (textbookCorrect && noTransfer) return "firstOnlyCorrect";
      return "someWrong";
    }, [allMarked, marks, s.questions]);

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">第 4 段・變形題驗證</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{s.heading}</h2>
          <VoiceButton unit={unit} sectionKey="variants" />
        </div>
        <p className="mt-2 text-muted-foreground">
          這 3 題考的是同一個概念，只是換了外觀。每題寫完後展開對照，誠實標記自己對不對。
        </p>
      </header>

      <div className="space-y-5">
        {s.questions.map((q, i) => (
          <VariantCard
            key={q.id}
            q={q}
            index={i}
            mark={marks[q.id]}
            onMark={(m) => mark(q.id, m)}
          />
        ))}
      </div>

      {feedbackKind && (
        <div
          className={cn(
            "animate-fade-in rounded-xl border p-5 text-[16px] leading-relaxed",
            feedbackKind === "allCorrect"
              ? "border-correct/40 bg-correct/5"
              : "border-gentle/40 bg-gentle/10 text-gentle-foreground",
          )}
        >
          <p className="mb-1 font-semibold">
            {feedbackKind === "allCorrect"
              ? "🎉 概念真的遷移了"
              : feedbackKind === "firstOnlyCorrect"
                ? "📌 你認得題型，但概念還沒遷移"
                : "再想一下"}
          </p>
          {s.feedbackRules[feedbackKind]}
        </div>
      )}
    </div>
  );
}

function VariantCard({
  q,
  index,
  mark,
  onMark,
}: {
  q: VariantQuestion;
  index: number;
  mark?: Mark;
  onMark: (m: Mark) => void;
}) {
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const canReveal = answer.trim().length >= 1;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
          {index + 1}
        </span>
        {q.likeTextbook ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            跟教材最像
          </span>
        ) : (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
            換了外觀
          </span>
        )}
      </div>

      <p className="mt-3 text-[17px] leading-relaxed">{q.question}</p>

      <div className="mt-4">
        {q.type === "input" ? (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="把你的答案和理由寫出來…"
            disabled={revealed}
          />
        ) : (
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="寫下你的答案…"
            disabled={revealed}
          />
        )}
      </div>

      {!revealed ? (
        <Button
          variant="outline"
          className="mt-3"
          disabled={!canReveal}
          onClick={() => setRevealed(true)}
        >
          看參考答案 + 這題在考什麼
        </Button>
      ) : (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-[16px]">
              <span className="font-semibold text-primary">參考答案：</span>
              {q.answer}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="flex gap-2 text-[15px] leading-relaxed text-foreground/85">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <span className="font-medium">這題其實在考：</span>
                {q.testingWhat}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-muted-foreground">
              對照之後，我這題：
            </span>
            <Button
              size="sm"
              variant={mark === "correct" ? "default" : "outline"}
              onClick={() => onMark("correct")}
            >
              我答對了
            </Button>
            <Button
              size="sm"
              variant={mark === "wrong" ? "accent" : "outline"}
              onClick={() => onMark("wrong")}
            >
              我答錯了
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
