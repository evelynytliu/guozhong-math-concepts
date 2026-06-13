"use client";

import * as React from "react";
import type { Unit, SelfAssessment } from "@/content/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { requestAiFeedback, type AiFeedback } from "@/lib/explanation";
import { saveExplanation } from "@/lib/storage";
import { Loader2, MessageCircleQuestion, Sparkles } from "lucide-react";

type Phase = "writing" | "loading" | "ai_done" | "static_reveal";

export function Section3Explain({ unit }: { unit: Unit }) {
  const s = unit.section3_explain;
  const isAi = unit.checkMode === "ai";

  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("writing");
  const [feedback, setFeedback] = React.useState<AiFeedback | null>(null);
  const [aiFailed, setAiFailed] = React.useState(false);
  const [selfAssessment, setSelfAssessment] =
    React.useState<SelfAssessment | null>(null);

  const canSubmit = text.trim().length >= 4;

  async function handleStaticSubmit() {
    setPhase("static_reveal");
  }

  async function handleAiSubmit() {
    setPhase("loading");
    const res = await requestAiFeedback({
      unitId: unit.id,
      unitTitle: unit.title,
      question: s.prompt,
      conceptHint: s.aiConceptHint ?? "",
      studentText: text.trim(),
    });

    if (res.ok && res.feedback && !res.fallbackToStatic) {
      setFeedback(res.feedback);
      setPhase("ai_done");
      void saveExplanation({
        unitId: unit.id,
        studentText: text.trim(),
        selfAssessment: null,
        aiFeedback: res.feedback,
        createdAt: new Date().toISOString(),
      });
    } else {
      // AI 失敗：退回靜態模式，孩子不會卡住
      setAiFailed(true);
      setPhase("static_reveal");
    }
  }

  function handleSelfAssess(value: SelfAssessment) {
    setSelfAssessment(value);
    void saveExplanation({
      unitId: unit.id,
      studentText: text.trim(),
      selfAssessment: value,
      aiFeedback: null,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">
          第 3 段・用自己的話解釋
          {isAi && (
            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              AI 老師會看你的回答
            </span>
          )}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{s.heading}</h2>
      </header>

      <div className="rounded-xl border bg-card p-5">
        <p className="text-[17px] leading-relaxed">{s.prompt}</p>
        <Textarea
          className="mt-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="用你自己的話寫，不要照抄上面的句子。寫個三五句也沒關係，重點是講出『為什麼』。"
          disabled={phase === "loading"}
        />

        {(phase === "writing" || phase === "loading") && (
          <div className="mt-4 flex items-center gap-3">
            {isAi ? (
              <Button
                onClick={handleAiSubmit}
                disabled={!canSubmit || phase === "loading"}
              >
                {phase === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI 老師正在看…
                  </>
                ) : (
                  "送出給 AI 老師看"
                )}
              </Button>
            ) : (
              <Button onClick={handleStaticSubmit} disabled={!canSubmit}>
                我寫好了，展開參考解釋對照
              </Button>
            )}
            {!canSubmit && (
              <span className="text-sm text-muted-foreground">
                先用自己的話寫一點再送出
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI 回饋 */}
      {phase === "ai_done" && feedback && (
        <AiFeedbackView
          feedback={feedback}
          onRetry={() => setPhase("writing")}
        />
      )}

      {/* 靜態對照 + 自評（預設模式，或 AI 失敗退回） */}
      {phase === "static_reveal" && (
        <div className="animate-fade-in space-y-5">
          {aiFailed && (
            <p className="rounded-lg border border-gentle/30 bg-gentle/10 p-3 text-sm text-gentle-foreground">
              AI 老師現在連不上，沒關係，我們用參考解釋自己對照一下就好。
            </p>
          )}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="font-semibold text-primary">參考解釋（拿來對照你寫的）</p>
            <div className="mt-3 space-y-1.5 text-[16px] leading-relaxed">
              {s.referenceAnswer.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium">對照之後，誠實選一個：</p>
            <div className="mt-3 grid gap-2">
              {s.selfAssessment.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelfAssess(opt.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-[16px] transition-colors",
                    selfAssessment === opt.value
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50 hover:bg-secondary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {selfAssessment === "cant_explain" && (
            <div className="animate-fade-in rounded-xl border border-gentle/40 bg-gentle/10 p-5 text-[16px] leading-relaxed text-gentle-foreground">
              {s.onCantExplain}
            </div>
          )}
          {selfAssessment === "partial" && (
            <div className="animate-fade-in rounded-xl border border-gentle/40 bg-gentle/10 p-5 text-[16px] leading-relaxed text-gentle-foreground">
              有寫但沒抓到重點，回第 2 段對照一下「參考答案」裡反覆出現的那個關鍵詞，再補一句你自己的話。
            </div>
          )}
          {selfAssessment === "got_it" && (
            <div className="animate-fade-in rounded-xl border border-correct/30 bg-correct/5 p-5 text-[16px] leading-relaxed">
              很好。能用自己的話講出『為什麼』，代表你不是在背。繼續往下驗證看看。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AiFeedbackView({
  feedback,
  onRetry,
}: {
  feedback: AiFeedback;
  onRetry: () => void;
}) {
  const level = feedback.understanding_level;
  const tone =
    level === "理解型"
      ? "border-correct/40 bg-correct/5"
      : level === "複述型"
        ? "border-gentle/40 bg-gentle/10"
        : "border-border bg-muted/40";

  return (
    <div className={cn("animate-fade-in space-y-4 rounded-xl border p-5", tone)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">AI 老師的判斷：</span>
        <span
          className={cn(
            "rounded-full px-3 py-0.5 text-sm font-semibold",
            level === "理解型" && "bg-correct text-correct-foreground",
            level === "複述型" && "bg-gentle text-gentle-foreground",
            level === "不確定" && "bg-muted text-muted-foreground",
          )}
        >
          {level}
        </span>
      </div>

      <div className="rounded-lg bg-card p-4">
        <p className="flex items-center gap-2 font-medium text-primary">
          <MessageCircleQuestion className="h-5 w-5" />
          再想一個問題：
        </p>
        <p className="mt-2 text-[16px] leading-relaxed">
          {feedback.followup_question}
        </p>
      </div>

      <p className="flex gap-2 text-[16px] leading-relaxed text-foreground/85">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>{feedback.encouragement}</span>
      </p>

      <Button variant="outline" size="sm" onClick={onRetry}>
        想到更好的說法？再寫一次送出
      </Button>
    </div>
  );
}
