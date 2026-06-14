"use client";

import * as React from "react";
import type { DraftHomework, DraftField } from "@/content/homework/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SparkChips } from "./spark-chips";
import { getDraft, saveDraft, type DraftData } from "@/lib/homework-storage";
import { requestCoach, type CoachFeedback } from "@/lib/coach";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ClipboardCopy,
  Lightbulb,
  Loader2,
  PenLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type View = "write" | "assemble";

export function DraftFlow({ homework }: { homework: DraftHomework }) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [handCopied, setHandCopied] = React.useState(false);
  const [view, setView] = React.useState<View>("write");
  const [loaded, setLoaded] = React.useState(false);

  // 載入既有草稿
  React.useEffect(() => {
    let active = true;
    (async () => {
      const d = await getDraft(homework.id);
      if (!active) return;
      if (d) {
        setValues(d.fields ?? {});
        setHandCopied(Boolean(d.handCopied));
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [homework.id]);

  // 防抖自動存（草稿一定要保住，孩子可能寫到一半關掉）
  React.useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      const data: DraftData = {
        homeworkId: homework.id,
        fields: values,
        handCopied,
        updatedAt: new Date().toISOString(),
      };
      void saveDraft(data);
    }, 600);
    return () => clearTimeout(t);
  }, [values, handCopied, loaded, homework.id]);

  function setField(id: string, text: string) {
    setValues((prev) => ({ ...prev, [id]: text }));
    // 改了草稿就代表還沒抄（避免他改完忘了重抄）
    if (handCopied) setHandCopied(false);
  }

  const requiredFields = homework.fields.filter((f) => !f.optional);
  const filledRequired = requiredFields.filter(
    (f) => (values[f.id] ?? "").trim().length > 0,
  ).length;
  const allRequiredFilled = filledRequired === requiredFields.length;

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        載入草稿中…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      {/* 全程都在的「這是草稿區」提醒 */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-gentle/40 bg-gentle/10 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-medium text-gentle-foreground">
          <PenLine className="h-4 w-4 shrink-0" />
          這裡是<strong>草稿區</strong>。寫好之後，要一個字一個字抄到作業本上，手寫的才算交作業喔。
        </p>
      </div>

      {view === "write" ? (
        <div className="space-y-6">
          {/* 作業說明 */}
          <section className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-xs font-medium text-muted-foreground">
              {homework.pdfNote}
            </p>
            <div className="mt-2 space-y-1.5 text-[16px] leading-relaxed text-foreground/90">
              {homework.intro.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <p className="mt-3 flex gap-2 rounded-lg bg-secondary/60 p-3 text-[15px] leading-relaxed text-secondary-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{homework.paperNote}</span>
            </p>
          </section>

          {/* 進度 */}
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>已填 {filledRequired} / {requiredFields.length} 題</span>
              <span>
                {Math.round((filledRequired / requiredFields.length) * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(filledRequired / requiredFields.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 逐題引導 */}
          <div className="space-y-5">
            {homework.fields.map((field, i) => (
              <FieldCard
                key={field.id}
                field={field}
                index={i}
                value={values[field.id] ?? ""}
                onChange={(t) => setField(field.id, t)}
                aiCoach={homework.aiCoach}
                homeworkTitle={homework.title}
              />
            ))}
          </div>

          {/* 去組稿 */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-[16px]">
              {allRequiredFilled
                ? "每一題都寫了！來看看組好的草稿，準備抄到作業本上。"
                : "還有題目沒寫，不過你也可以先看看目前組好的草稿長怎樣。"}
            </p>
            <Button className="mt-4" size="lg" onClick={() => setView("assemble")}>
              看組好的草稿
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <AssembleView
          homework={homework}
          values={values}
          handCopied={handCopied}
          onBack={() => setView("write")}
          onConfirmCopied={() => setHandCopied(true)}
        />
      )}
    </div>
  );
}

// ── 單一欄位卡 ────────────────────────────────────

function FieldCard({
  field,
  index,
  value,
  onChange,
  aiCoach,
  homeworkTitle,
}: {
  field: DraftField;
  index: number;
  value: string;
  onChange: (text: string) => void;
  aiCoach: boolean;
  homeworkTitle: string;
}) {
  const longRef = React.useRef<HTMLTextAreaElement>(null);
  const shortRef = React.useRef<HTMLInputElement>(null);
  const [aiState, setAiState] = React.useState<
    "idle" | "loading" | "done" | "failed"
  >("idle");
  const [coach, setCoach] = React.useState<CoachFeedback | null>(null);

  function focusInput() {
    (field.type === "long" ? longRef.current : shortRef.current)?.focus();
  }

  // 點提示 → 把那句開頭接到目前內容後面，孩子接著寫
  function insert(text: string) {
    const cur = value;
    let next: string;
    if (field.type === "long") {
      next = cur.trim().length === 0 ? text : `${cur.replace(/\s+$/, "")}\n${text}`;
    } else {
      next = cur.trim().length === 0 ? text : `${cur.replace(/\s+$/, "")} ${text}`;
    }
    onChange(next);
    // 讓游標回到輸入框，方便他馬上填空
    requestAnimationFrame(focusInput);
  }

  async function askAi() {
    setAiState("loading");
    const res = await requestCoach({
      homeworkTitle,
      fieldLabel: field.label,
      guide: field.guide,
      fieldContext: field.aiContext ?? "",
      studentText: value,
    });
    if (res.ok && res.feedback && !res.fallbackToStatic) {
      setCoach(res.feedback);
      setAiState("done");
    } else {
      setAiState("failed");
    }
  }

  const charCount = value.trim().length;
  const showAiButton = aiCoach && field.type !== "choice" && field.aiContext;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold tracking-tight">
            {field.label}
            {field.optional && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                選做
              </span>
            )}
          </h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            {field.guide}
          </p>
        </div>
      </div>

      {/* 角度提示 */}
      {field.sparks.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" />
            卡住了？挑一個方向，幫你開頭（再用自己的話接下去）
          </p>
          <SparkChips items={field.sparks} onPick={insert} />
        </div>
      )}

      {/* 選擇題的選項 */}
      {field.type === "choice" && field.choices && (
        <div className="mt-4 flex flex-wrap gap-2">
          {field.choices.map((c) => {
            const active = value === c || value.startsWith(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  requestAnimationFrame(focusInput);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-[15px] transition-colors",
                  active
                    ? "border-primary bg-primary/10 font-medium"
                    : "hover:border-primary/50 hover:bg-secondary",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* 輸入框 */}
      <div className="mt-3">
        {field.type === "long" ? (
          <Textarea
            ref={longRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        ) : (
          <Input
            ref={shortRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        )}

        {field.minChars && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {charCount >= field.minChars ? (
              <span className="text-correct">
                ✓ 已經 {charCount} 字，夠了！還想多寫也很好。
              </span>
            ) : (
              <span>
                目前 {charCount} 字，目標 {field.minChars} 字（還差{" "}
                {field.minChars - charCount} 字）
              </span>
            )}
          </p>
        )}
      </div>

      {/* AI 追問（混合模式：本機有 claude login 才會真的回；失敗退回靜態提示） */}
      {showAiButton && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={askAi}
            disabled={aiState === "loading"}
          >
            {aiState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                老師正在想…
              </>
            ) : (
              <>
                <WandSparkles className="h-4 w-4" />
                {value.trim() ? "讓老師看我寫的，給我幾個方向" : "讓老師給我幾個不同方向"}
              </>
            )}
          </Button>

          {aiState === "failed" && (
            <p className="mt-2 rounded-lg border border-gentle/30 bg-gentle/10 p-2.5 text-sm text-gentle-foreground">
              AI 老師現在連不上，沒關係——上面那些「方向」一樣可以幫你開頭。
            </p>
          )}

          {aiState === "done" && coach && (
            <div className="mt-3 animate-fade-in space-y-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-semibold text-accent">老師給你的幾個方向：</p>
              <SparkChips items={coach.directions} onPick={insert} variant="ai" />
              <p className="flex gap-2 text-[15px] leading-relaxed">
                <span className="font-medium text-accent">再想一下：</span>
                <span>{coach.probe}</span>
              </p>
              <p className="flex gap-2 text-[15px] leading-relaxed text-foreground/85">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{coach.encouragement}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 組稿預覽 + 手抄提醒 ───────────────────────────

function AssembleView({
  homework,
  values,
  handCopied,
  onBack,
  onConfirmCopied,
}: {
  homework: DraftHomework;
  values: Record<string, string>;
  handCopied: boolean;
  onBack: () => void;
  onConfirmCopied: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  // 純文字版（複製到剪貼簿用，方便他一邊看一邊抄）
  const plainText = React.useMemo(() => {
    const lines: string[] = [`${homework.title}（草稿）`, ""];
    for (const f of homework.fields) {
      const v = (values[f.id] ?? "").trim();
      if (!v && f.optional) continue;
      lines.push(f.label);
      lines.push(v || "（還沒寫）");
      lines.push("");
    }
    return lines.join("\n");
  }, [homework, values]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 不能複製也沒關係，照著螢幕抄就好 */
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* 最重要的提醒：草稿 ≠ 交作業 */}
      <div className="rounded-2xl border-2 border-accent/50 bg-accent/5 p-5">
        <p className="flex items-center gap-2 text-lg font-bold text-accent">
          ✋ 草稿好了，但還沒結束！
        </p>
        <p className="mt-2 text-[16px] leading-relaxed">
          現在請把下面的草稿，<strong>一個字一個字抄到作業本上</strong>。
          手寫的才算交作業——打在電腦裡的不算喔。
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
          {homework.paperNote}
        </p>
      </div>

      {/* 組好的草稿 */}
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">
            {homework.assembleHeading}
          </h2>
          <Button variant="outline" size="sm" onClick={copy}>
            <ClipboardCopy className="h-4 w-4" />
            {copied ? "已複製" : "複製草稿"}
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {homework.fields.map((f) => {
            const v = (values[f.id] ?? "").trim();
            if (!v && f.optional) return null;
            return (
              <div key={f.id} className="border-b border-border/60 pb-4 last:border-0">
                <p className="text-sm font-semibold text-primary">{f.label}</p>
                <p className="mt-1 whitespace-pre-wrap text-[16px] leading-relaxed">
                  {v || <span className="text-muted-foreground">（這題還沒寫）</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 確認已手抄 */}
      {!handCopied ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-[16px]">抄完作業本了嗎？抄完再按下面這顆，這份作業就完成。</p>
          <Button className="mt-4" size="lg" onClick={onConfirmCopied}>
            我已經抄到作業本上了 ✍️
          </Button>
        </div>
      ) : (
        <div className="animate-fade-in rounded-2xl border border-correct/40 bg-correct/5 p-5 text-center">
          <p className="flex items-center justify-center gap-2 text-lg font-semibold text-correct">
            <CheckCircle2 className="h-5 w-5" />
            這份作業完成了 🎉
          </p>
          <p className="mt-1 text-muted-foreground">
            草稿想清楚、再親手寫一遍——這樣寫出來的，才是你自己的東西。
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="ghost" onClick={onBack}>
          ← 回去改草稿
        </Button>
      </div>
    </div>
  );
}
