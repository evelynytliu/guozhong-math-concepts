"use client";

import * as React from "react";
import type { Unit, GuidedStep } from "@/content/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberLine } from "@/components/number-line";
import { VoiceButton } from "@/components/voice/voice-button";
import { cn } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";

interface FlatStep {
  step: GuidedStep;
  globalIndex: number;
  partIndex: number;
  isFirstInPart: boolean;
  partTitle: string;
}

export function Section2Guided({
  unit,
  onComplete,
}: {
  unit: Unit;
  onComplete?: () => void;
}) {
  const { heading, parts } = unit.section2_guided;

  // 把所有 part 的 steps 攤平，用全域 index 做「一步答完才解鎖下一步」
  const flat: FlatStep[] = React.useMemo(() => {
    const out: FlatStep[] = [];
    let g = 0;
    parts.forEach((part, pi) => {
      part.steps.forEach((step, si) => {
        out.push({
          step,
          globalIndex: g++,
          partIndex: pi,
          isFirstInPart: si === 0,
          partTitle: part.title,
        });
      });
    });
    return out;
  }, [parts]);

  // 已完成的步數（= 已解鎖到第幾步）
  const [doneCount, setDoneCount] = React.useState(0);
  const allDone = doneCount >= flat.length;

  React.useEffect(() => {
    if (allDone) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  function completeStep(globalIndex: number) {
    setDoneCount((c) => (globalIndex === c ? c + 1 : c));
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">第 2 段・引導推導</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          <VoiceButton unit={unit} sectionKey="guided" />
        </div>
        <p className="mt-2 text-muted-foreground">
          一步一步來，答完一步才會打開下一步。不要急著背結論，跟著想就好。
        </p>
      </header>

      <div className="space-y-5">
        {flat.map((fs) => {
          const status: "done" | "active" | "locked" =
            fs.globalIndex < doneCount
              ? "done"
              : fs.globalIndex === doneCount
                ? "active"
                : "locked";

          return (
            <React.Fragment key={fs.globalIndex}>
              {fs.isFirstInPart && (
                <h3 className="pt-2 text-lg font-semibold text-foreground/90">
                  {fs.partTitle}
                </h3>
              )}
              <GuidedStepView
                step={fs.step}
                status={status}
                onDone={() => completeStep(fs.globalIndex)}
              />
            </React.Fragment>
          );
        })}
      </div>

      {allDone && (
        <div className="animate-fade-in rounded-xl border border-correct/30 bg-correct/5 p-5">
          <p className="font-medium text-foreground">
            推導完成 🎉 你不是「被告知」規則，是自己一步步推出來的。
          </p>
          <p className="mt-1 text-muted-foreground">
            接下來最重要的一關：用你自己的話，把它講清楚。
          </p>
        </div>
      )}
    </div>
  );
}

function GuidedStepView({
  step,
  status,
  onDone,
}: {
  step: GuidedStep;
  status: "done" | "active" | "locked";
  onDone: () => void;
}) {
  if (status === "locked") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/40 p-4 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-sm">先完成上一步，這一步會自動打開</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        status === "active" ? "border-primary/40 bg-card" : "bg-card/60",
      )}
    >
      <p className="text-[17px] leading-relaxed">{step.prompt}</p>

      <div className="mt-4">
        {step.type === "number-line-click" && step.numberLine && (
          <NumberLineStep step={step} onResolved={onDone} />
        )}
        {step.type === "number-line-walk" && step.numberLine && (
          <NumberLineStep step={step} onResolved={onDone} />
        )}
        {step.type === "choice" && (
          <ChoiceStep step={step} onDone={onDone} />
        )}
        {step.type === "input" && <InputStep step={step} onDone={onDone} />}
      </div>
    </div>
  );
}

// ── 數線型步驟 ──
function NumberLineStep({
  step,
  onResolved,
}: {
  step: GuidedStep;
  onResolved: () => void;
}) {
  const cfg = step.numberLine!;
  const mode = step.type === "number-line-click" ? "click" : "walk";
  const [resolved, setResolved] = React.useState(false);

  return (
    <div className="space-y-3">
      <NumberLine
        min={cfg.min}
        max={cfg.max}
        mode={mode}
        target={cfg.target}
        start={cfg.start}
        walk={cfg.walk}
        onResolved={() => {
          if (!resolved) {
            setResolved(true);
            onResolved();
          }
        }}
      />
      {resolved && <InsightBox answer={step.answer} insight={step.insight} />}
    </div>
  );
}

// ── 選擇題步驟 ──
function ChoiceStep({
  step,
  onDone,
}: {
  step: GuidedStep;
  onDone: () => void;
}) {
  const [picked, setPicked] = React.useState<string | null>(null);
  const choices = step.choices ?? [];
  const correct = picked === step.answer;

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {choices.map((c) => {
          const isPicked = picked === c;
          const isAnswer = c === step.answer;
          return (
            <button
              key={c}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(c);
                onDone();
              }}
              className={cn(
                "rounded-lg border p-3 text-left text-[16px] transition-colors",
                picked === null && "hover:border-primary/50 hover:bg-secondary",
                isPicked &&
                  (correct
                    ? "border-correct bg-correct/10"
                    : "border-gentle bg-gentle/10"),
                picked !== null && !isPicked && isAnswer && "border-correct bg-correct/10",
                picked !== null && !isPicked && !isAnswer && "opacity-60",
              )}
            >
              {c}
              {picked !== null && isAnswer && " ✅"}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          {!correct && (
            <p className="text-sm text-gentle-foreground">
              你選的不是最好的答案，看一下標✅的那個，再讀下面的說明。
            </p>
          )}
          <InsightBox insight={step.insight} />
        </>
      )}
    </div>
  );
}

// ── 填空 / 輸入型步驟（自由作答，作答後自己對照）──
function InputStep({ step, onDone }: { step: GuidedStep; onDone: () => void }) {
  const [value, setValue] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);

  return (
    <div className="space-y-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="把你的想法或答案打在這裡…"
        disabled={revealed}
      />
      {!revealed ? (
        <Button
          variant="outline"
          onClick={() => {
            setRevealed(true);
            onDone();
          }}
        >
          我想好了，看看對不對
        </Button>
      ) : (
        <InsightBox answer={step.answer} insight={step.insight} />
      )}
    </div>
  );
}

function InsightBox({ answer, insight }: { answer?: string; insight: string }) {
  return (
    <div className="animate-fade-in space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
      {answer && (
        <p className="text-[16px]">
          <span className="font-semibold text-primary">參考答案：</span>
          {answer}
        </p>
      )}
      <p className="flex gap-2 text-[15px] leading-relaxed text-foreground/85">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>{insight}</span>
      </p>
    </div>
  );
}
