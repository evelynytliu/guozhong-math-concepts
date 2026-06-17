"use client";

import * as React from "react";
import type { Unit, DrillQuestion, ChallengeQuestion } from "@/content/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Dumbbell, Shuffle, Target } from "lucide-react";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeZone({ unit }: { unit: Unit }) {
  const pz = unit.practiceZone;
  if (!pz) return null;

  return (
    <div className="animate-fade-in space-y-10">
      <header className="flex items-center gap-3 border-b pb-4">
        <Dumbbell className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">練習區</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            概念學完了，這裡練手感 + 挑戰遷移。
          </p>
        </div>
      </header>

      <DrillSection questions={pz.drill.questions} note={pz.drill.note} />
      <ChallengeSection
        heading={pz.challenge.heading}
        bank={pz.challenge.bank}
      />
    </div>
  );
}

// ─── 手感題區 ───────────────────────────────────────────────────────────────

function DrillSection({
  questions,
  note,
}: {
  questions: DrillQuestion[];
  note: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">手感題</h3>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
          {note}
        </span>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <DrillCard key={q.id} q={q} index={i} />
        ))}
      </div>
    </section>
  );
}

function DrillCard({ q, index }: { q: DrillQuestion; index: number }) {
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <p className="text-[16px] leading-snug">{q.question}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="答案…"
          className="max-w-[200px]"
          disabled={revealed}
        />
        {!revealed ? (
          <Button
            variant="outline"
            size="sm"
            disabled={answer.trim().length === 0}
            onClick={() => setRevealed(true)}
          >
            看答案
          </Button>
        ) : (
          <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {q.answer}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 變形題挑戰區 ────────────────────────────────────────────────────────────

const SAMPLE_SIZE = 5;

const DIFFICULTY_LABEL: Record<ChallengeQuestion["difficulty"], string> = {
  basic: "直接",
  transfer: "換情境",
  synthesis: "多一個轉折",
};

const DIFFICULTY_CLASS: Record<ChallengeQuestion["difficulty"], string> = {
  basic: "bg-secondary text-muted-foreground",
  transfer: "bg-accent/15 text-accent",
  synthesis: "bg-gentle/20 text-gentle-foreground",
};

type Mark = "correct" | "wrong";

function ChallengeSection({
  heading,
  bank,
}: {
  heading: string;
  bank: ChallengeQuestion[];
}) {
  const [samples, setSamples] = React.useState<ChallengeQuestion[]>(() =>
    shuffle(bank).slice(0, SAMPLE_SIZE),
  );
  const [sampleKey, setSampleKey] = React.useState(0);
  const [marks, setMarks] = React.useState<Record<string, Mark>>({});

  function resample() {
    setSamples(shuffle(bank).slice(0, SAMPLE_SIZE));
    setSampleKey((k) => k + 1);
    setMarks({});
  }

  const allMarked = samples.length > 0 && samples.every((q) => marks[q.id]);
  const correctCount = allMarked
    ? samples.filter((q) => marks[q.id] === "correct").length
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <div>
          <h3 className="text-lg font-semibold">{heading}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            從題庫（{bank.length} 題）隨機抽 {SAMPLE_SIZE} 題。重複進來每次不同組合。
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resample} className="gap-1.5">
          <Shuffle className="h-3.5 w-3.5" />
          換一組題目
        </Button>
      </div>

      <div className="space-y-4">
        {samples.map((q, i) => (
          <ChallengeCard
            key={`${sampleKey}-${q.id}`}
            q={q}
            index={i}
            mark={marks[q.id]}
            onMark={(m) => setMarks((prev) => ({ ...prev, [q.id]: m }))}
          />
        ))}
      </div>

      {allMarked && (
        <div
          className={cn(
            "animate-fade-in rounded-xl border p-5",
            correctCount === SAMPLE_SIZE
              ? "border-correct/40 bg-correct/5"
              : "border-gentle/40 bg-gentle/10",
          )}
        >
          <p className="font-semibold">
            {correctCount === SAMPLE_SIZE
              ? `全對！這 ${SAMPLE_SIZE} 題都拿下了。`
              : `答對 ${correctCount} / ${SAMPLE_SIZE} 題。`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {correctCount === SAMPLE_SIZE
              ? "換一組再試試，看能不能連續拿下不同情境的題目。"
              : "答錯的題目，對照「這題在考什麼」再想一次。想清楚後換一組繼續練。"}
          </p>
          <Button variant="outline" size="sm" onClick={resample} className="mt-3 gap-1.5">
            <Shuffle className="h-3.5 w-3.5" />
            再來一組
          </Button>
        </div>
      )}
    </section>
  );
}

function ChallengeCard({
  q,
  index,
  mark,
  onMark,
}: {
  q: ChallengeQuestion;
  index: number;
  mark?: Mark;
  onMark: (m: Mark) => void;
}) {
  const [answer, setAnswer] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const isLong = q.question.length > 60;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
          {index + 1}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            DIFFICULTY_CLASS[q.difficulty],
          )}
        >
          {DIFFICULTY_LABEL[q.difficulty]}
        </span>
      </div>

      <p className="mt-3 text-[17px] leading-relaxed">{q.question}</p>

      <div className="mt-4">
        {isLong ? (
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
          disabled={answer.trim().length === 0}
          onClick={() => setRevealed(true)}
        >
          看參考答案 + 這題在考什麼
        </Button>
      ) : (
        <div className="mt-4 animate-fade-in space-y-3">
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
                <span className="font-medium">這題在考：</span>
                {q.conceptAspect}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-muted-foreground">我這題：</span>
            <Button
              size="sm"
              variant={mark === "correct" ? "default" : "outline"}
              onClick={() => onMark("correct")}
            >
              答對了
            </Button>
            <Button
              size="sm"
              variant={mark === "wrong" ? "accent" : "outline"}
              onClick={() => onMark("wrong")}
            >
              答錯了
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
