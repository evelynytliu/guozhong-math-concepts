"use client";

import * as React from "react";
import Link from "next/link";
import type {
  ClassicalWord,
  WenyanExample,
  WenyanVariant,
} from "@/content/wenyan/types";
import { getNextWord } from "@/content/wenyan";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProgressStepper } from "@/components/progress-stepper";
import {
  getWenyanProgress,
  saveWenyanProgress,
  type WenyanProgress,
  type WenyanSelfAssessment,
} from "@/lib/wenyan-storage";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Eye,
  Target,
  ScrollText,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  MessageCircle,
} from "lucide-react";

// 五拍的小標題（對應五段式）
const BEAT_LABELS = [
  "你以為你懂",
  "自己推古義",
  "用自己的話說",
  "換句子驗證",
  "講給家人聽",
];

// 把句子裡的目標字標色，讓孩子一眼看到「考的是這個字」
function HighlightSentence({
  text,
  target,
  className,
}: {
  text: string;
  target: string;
  className?: string;
}) {
  const idx = text.indexOf(target);
  if (idx === -1)
    return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {text.slice(0, idx)}
      <span className="rounded-md bg-accent/15 px-1 font-bold text-accent">
        {target}
      </span>
      {text.slice(idx + target.length)}
    </span>
  );
}

// 例句卡：原文（標色）＋出處＋可展開的注釋＋（作答後）白話翻譯
function ExampleCard({
  example,
  showTranslation,
}: {
  example: WenyanExample;
  showTranslation: boolean;
}) {
  const [openNotes, setOpenNotes] = React.useState(false);
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <p className="text-[22px] font-semibold leading-loose tracking-wide text-foreground">
        「<HighlightSentence text={example.sentence} target={example.target} />」
      </p>
      <p className="mt-1 text-right text-sm text-muted-foreground">
        —— {example.source}
      </p>

      {example.notes.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setOpenNotes((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            {openNotes ? "收起注釋" : "看不懂哪個字？點開注釋"}
          </button>
          {openNotes && (
            <ul className="mt-2 space-y-1.5 rounded-xl bg-secondary/50 p-3 text-[15px] leading-relaxed">
              {example.notes.map((n) => (
                <li key={n.term}>
                  <span className="font-semibold text-secondary-foreground">
                    {n.term}
                  </span>
                  <span className="text-muted-foreground">：{n.gloss}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showTranslation && (
        <div className="mt-3 flex gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-[15px] leading-relaxed animate-fade-in">
          <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium text-primary">白話：</span>
            {example.translation}
          </span>
        </div>
      )}
    </div>
  );
}

// 一題選擇題（第 2 拍的猜猜看、第 4 拍的變形題共用外觀）
function ChoiceQuestion({
  choices,
  answer,
  picked,
  onPick,
  disabled,
}: {
  choices: string[];
  answer: string;
  picked: string | null;
  onPick: (c: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {choices.map((c) => {
        const isPicked = picked === c;
        const isAnswer = c === answer;
        const revealed = picked !== null;
        return (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left text-[16px] transition-colors",
              !revealed && "hover:border-primary/50 hover:bg-secondary",
              revealed && isAnswer && "border-correct bg-correct/10 font-medium",
              revealed &&
                isPicked &&
                !isAnswer &&
                "border-gentle bg-gentle/10",
              revealed && !isPicked && !isAnswer && "opacity-60",
              !revealed && "border-input bg-card",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              {c}
              {revealed && isAnswer && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-correct" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function WenyanFlow({ word }: { word: ClassicalWord }) {
  const [beat, setBeat] = React.useState(1);
  const [reached, setReached] = React.useState(1);
  const [loaded, setLoaded] = React.useState(false);

  // 各拍的狀態
  const [ancientRevealed, setAncientRevealed] = React.useState(false); // 第 1 拍
  const [guess, setGuess] = React.useState<string | null>(null); // 第 2 拍
  const [explanation, setExplanation] = React.useState(""); // 第 3 拍
  const [refRevealed, setRefRevealed] = React.useState(false);
  const [selfAssessment, setSelfAssessment] =
    React.useState<WenyanSelfAssessment | null>(null);
  const [variantPicks, setVariantPicks] = React.useState<
    Record<string, string>
  >({}); // 第 4 拍 variantId → 選的答案

  // 載入既有進度
  React.useEffect(() => {
    let active = true;
    (async () => {
      const p = await getWenyanProgress(word.id);
      if (!active) return;
      if (p) {
        setReached(Math.max(1, p.sectionReached));
        setBeat(Math.max(1, p.sectionReached));
        setExplanation(p.explanation ?? "");
        setSelfAssessment(p.selfAssessment ?? null);
        if ((p.explanation ?? "").trim()) setRefRevealed(true);
        if (p.sectionReached >= 2) setAncientRevealed(true);
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [word.id]);

  // 統一存檔（把目前狀態組成一列）
  const persist = React.useCallback(
    (over: Partial<WenyanProgress>) => {
      const variantResults: Record<string, boolean> = {};
      for (const v of word.variants) {
        const pick = variantPicks[v.id];
        if (pick != null) variantResults[v.id] = pick === v.answer;
      }
      const base: WenyanProgress = {
        wordId: word.id,
        sectionReached: reached,
        completedAt: null,
        variantResults,
        explanation,
        selfAssessment,
        updatedAt: new Date().toISOString(),
        ...over,
      };
      void saveWenyanProgress(base);
    },
    [word.id, word.variants, variantPicks, reached, explanation, selfAssessment],
  );

  function goToBeat(n: number) {
    const next = Math.min(5, Math.max(1, n));
    setBeat(next);
    const newReached = Math.max(reached, next);
    setReached(newReached);
    persist({ sectionReached: newReached });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const allVariantsDone = word.variants.every((v) => variantPicks[v.id] != null);

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">
        載入中…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-16">
      {/* 頁頭 */}
      <div className="flex items-center gap-3 py-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          回首頁
        </Link>
        <span className="text-sm text-muted-foreground">・國文・文言文</span>
      </div>

      {/* 大字卡 */}
      <div className="mb-5 flex items-end gap-4">
        <div className="grad-primary flex h-20 min-w-20 items-center justify-center rounded-2xl px-4 text-4xl font-black text-primary-foreground shadow-sm">
          {word.word}
        </div>
        <div className="pb-1">
          {word.pinyin && (
            <p className="text-sm text-muted-foreground">{word.pinyin}</p>
          )}
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {word.teaser}
          </p>
        </div>
      </div>

      {/* 進度（沿用五段式 stepper） */}
      <div className="mb-8">
        <ProgressStepper
          current={beat}
          reached={reached}
          onJump={(n) => goToBeat(n)}
        />
        <p className="mt-3 text-center text-sm font-medium text-primary">
          第 {beat} 拍・{BEAT_LABELS[beat - 1]}
        </p>
      </div>

      {/* ── 內容 ── */}
      {beat === 1 && (
        <BeatHook
          word={word}
          revealed={ancientRevealed}
          onReveal={() => setAncientRevealed(true)}
          onNext={() => goToBeat(2)}
        />
      )}

      {beat === 2 && (
        <BeatGuided
          word={word}
          guess={guess}
          onGuess={(c) => {
            setGuess(c);
          }}
          onNext={() => goToBeat(3)}
        />
      )}

      {beat === 3 && (
        <BeatExplain
          word={word}
          explanation={explanation}
          onExplanationChange={setExplanation}
          refRevealed={refRevealed}
          onRevealRef={() => {
            setRefRevealed(true);
            persist({ explanation });
          }}
          selfAssessment={selfAssessment}
          onSelfAssess={(v) => {
            setSelfAssessment(v);
            persist({ explanation, selfAssessment: v });
          }}
          onBackToGuided={() => goToBeat(2)}
          onNext={() => goToBeat(4)}
        />
      )}

      {beat === 4 && (
        <BeatVariants
          word={word}
          picks={variantPicks}
          onPick={(id, c) => {
            const next = { ...variantPicks, [id]: c };
            setVariantPicks(next);
            // 直接把這次作答結果存起來
            const variantResults: Record<string, boolean> = {};
            for (const v of word.variants) {
              const pick = next[v.id];
              if (pick != null) variantResults[v.id] = pick === v.answer;
            }
            persist({ variantResults });
          }}
          allDone={allVariantsDone}
          onBackToGuided={() => goToBeat(2)}
          onNext={() => goToBeat(5)}
        />
      )}

      {beat === 5 && (
        <BeatRecap
          word={word}
          onFinish={() => {
            const newReached = 5;
            setReached(newReached);
            persist({
              sectionReached: newReached,
              completedAt: new Date().toISOString(),
            });
          }}
        />
      )}
    </div>
  );
}

// ── 第 1 拍：你以為你懂 ────────────────────────────
function BeatHook({
  word,
  revealed,
  onReveal,
  onNext,
}: {
  word: ClassicalWord;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      {/* 自信小孩的對話框 */}
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          😎
        </span>
        <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-[16px] leading-relaxed shadow-soft">
          {word.hook.modernBubble}
        </div>
      </div>
      {/* 老師的翻轉 */}
      <div className="flex flex-row-reverse items-start gap-3">
        <span className="text-2xl" aria-hidden>
          🧑‍🏫
        </span>
        <div className="rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/5 px-4 py-3 text-[16px] leading-relaxed">
          {word.hook.twist}
        </div>
      </div>

      {/* 今義 vs 古義（蓋牌 → 翻開） */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">
            現在的意思
          </p>
          <p className="mt-1 text-[17px] font-medium">{word.modernMeaning}</p>
        </div>
        <button
          type="button"
          onClick={onReveal}
          disabled={revealed}
          className={cn(
            "rounded-2xl border-2 border-dashed p-5 text-left transition-colors",
            revealed
              ? "border-accent/40 bg-accent/5"
              : "border-accent/40 bg-accent/5 hover:bg-accent/10",
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
            <Eye className="h-3.5 w-3.5" />
            古代的意思
          </p>
          {revealed ? (
            <p className="mt-1 text-[17px] font-medium text-accent animate-fade-in">
              {word.ancientMeaning}
            </p>
          ) : (
            <p className="mt-1 text-[17px] font-medium text-accent/70">
              點一下翻開 👀
            </p>
          )}
        </button>
      </div>

      {revealed && (
        <div className="animate-fade-in rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-[16px]">
            差很多對吧？下一拍，我們不要你「背」這個古義——
            <strong>要你自己把它推出來。</strong>
          </p>
          <Button className="mt-4" size="lg" onClick={onNext}>
            自己來推推看
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── 第 2 拍：自己推出古義 ──────────────────────────
function BeatGuided({
  word,
  guess,
  onGuess,
  onNext,
}: {
  word: ClassicalWord;
  guess: string | null;
  onGuess: (c: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-5">
      {/* 線索一：字形／組字 */}
      {word.glyph && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Sparkles className="h-4 w-4" />
            線索一・這個字本來的樣子
          </p>
          <p className="mt-2 text-[16px] leading-relaxed">{word.glyph.form}</p>
          <p className="mt-2 flex gap-2 text-[15px] leading-relaxed text-muted-foreground">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {word.glyph.insight}
          </p>
        </div>
      )}

      {/* 線索二：課本例句 */}
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">
          線索二・看古人怎麼用它
        </p>
        <ExampleCard example={word.example} showTranslation={guess !== null} />
      </div>

      {/* 猜猜看 */}
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <p className="text-[16px] font-medium">{word.guessPrompt}</p>
        <ChoiceQuestion
          choices={word.guessChoices}
          answer={word.guessAnswer}
          picked={guess}
          onPick={onGuess}
          disabled={guess !== null}
        />
        {guess !== null && (
          <div className="mt-4 animate-fade-in space-y-3">
            <div
              className={cn(
                "rounded-xl border p-4 text-[15px] leading-relaxed",
                guess === word.guessAnswer
                  ? "border-correct/40 bg-correct/5"
                  : "border-gentle/40 bg-gentle/10 text-gentle-foreground",
              )}
            >
              <p className="font-semibold">
                {guess === word.guessAnswer
                  ? "✅ 沒錯！"
                  : `再看一次——答案是「${word.guessAnswer}」`}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="flex gap-2 text-[15px] leading-relaxed">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium text-primary">推出來了：</span>
                  {word.derived}
                </span>
              </p>
            </div>
            <div className="pt-1 text-center">
              <Button size="lg" onClick={onNext}>
                我推出古義了，下一拍
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 第 3 拍：用自己的話說 ──────────────────────────
const SELF_OPTIONS: { value: WenyanSelfAssessment; label: string }[] = [
  { value: "got_it", label: "我有講到重點" },
  { value: "partial", label: "部分有講到" },
  { value: "cant_explain", label: "我其實講不太出來" },
];

function BeatExplain({
  word,
  explanation,
  onExplanationChange,
  refRevealed,
  onRevealRef,
  selfAssessment,
  onSelfAssess,
  onBackToGuided,
  onNext,
}: {
  word: ClassicalWord;
  explanation: string;
  onExplanationChange: (t: string) => void;
  refRevealed: boolean;
  onRevealRef: () => void;
  selfAssessment: WenyanSelfAssessment | null;
  onSelfAssess: (v: WenyanSelfAssessment) => void;
  onBackToGuided: () => void;
  onNext: () => void;
}) {
  const canReveal = explanation.trim().length >= 2;
  return (
    <div className="animate-fade-in space-y-5">
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <p className="flex items-center gap-2 text-[16px] font-medium">
          <MessageCircle className="h-4 w-4 text-primary" />
          {word.explainPrompt}
        </p>
        <Textarea
          className="mt-3"
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="用你自己的話寫下來…（講得出「為什麼」，才代表你不是在背）"
        />
        {!refRevealed ? (
          <Button
            variant="outline"
            className="mt-3"
            disabled={!canReveal}
            onClick={onRevealRef}
          >
            我寫好了，看參考解釋來對照
          </Button>
        ) : (
          <div className="mt-4 animate-fade-in space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">參考解釋：</p>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed">
                {word.referenceExplain.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 自評 */}
            <div>
              <p className="text-sm text-muted-foreground">
                對照之後，你自己覺得——
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SELF_OPTIONS.map((o) => (
                  <Button
                    key={o.value}
                    size="sm"
                    variant={
                      selfAssessment === o.value ? "default" : "outline"
                    }
                    onClick={() => onSelfAssess(o.value)}
                  >
                    {o.label}
                  </Button>
                ))}
              </div>
            </div>

            {selfAssessment === "cant_explain" && (
              <div className="rounded-xl border border-gentle/40 bg-gentle/10 p-4 text-[15px] leading-relaxed text-gentle-foreground">
                <p>
                  講不太出來，代表這個古義還是「用背的」。沒關係——回第 2 拍，
                  重新看一次字形和例句，把「為什麼」想通再回來。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onBackToGuided}
                >
                  <RotateCcw className="h-4 w-4" />
                  回第 2 拍再推一次
                </Button>
              </div>
            )}

            {selfAssessment && selfAssessment !== "cant_explain" && (
              <div className="text-center animate-fade-in">
                <Button size="lg" onClick={onNext}>
                  下一拍・換句子驗證
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 第 4 拍：換句子驗證（變形題，自動批改） ────────────
function BeatVariants({
  word,
  picks,
  onPick,
  allDone,
  onBackToGuided,
  onNext,
}: {
  word: ClassicalWord;
  picks: Record<string, string>;
  onPick: (id: string, c: string) => void;
  allDone: boolean;
  onBackToGuided: () => void;
  onNext: () => void;
}) {
  // 回饋：抓「課本題對、新句子錯＝背了沒遷移」
  const feedbackKind: keyof ClassicalWord["variantFeedback"] | null =
    React.useMemo(() => {
      if (!allDone) return null;
      const textbookQ = word.variants.find((v) => v.likeTextbook);
      const nonTextbook = word.variants.filter((v) => !v.likeTextbook);
      const isRight = (v: WenyanVariant) => picks[v.id] === v.answer;
      if (word.variants.every(isRight)) return "allCorrect";
      const textbookOk = textbookQ ? isRight(textbookQ) : false;
      const allNonWrong = nonTextbook.every((v) => !isRight(v));
      if (textbookOk && allNonWrong) return "firstOnlyCorrect";
      return "someWrong";
    }, [allDone, picks, word.variants]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-[15px] leading-relaxed text-muted-foreground">
        這幾句都是<strong className="text-foreground">課本沒出現過</strong>的新文言文，
        考的都是同一個字。看你抓的是「道理」，還是只背了課本那一句。
      </div>

      <div className="space-y-5">
        {word.variants.map((v, i) => (
          <VariantCard
            key={v.id}
            variant={v}
            index={i}
            picked={picks[v.id] ?? null}
            onPick={(c) => onPick(v.id, c)}
          />
        ))}
      </div>

      {feedbackKind && (
        <div
          className={cn(
            "animate-fade-in rounded-2xl border p-5 text-[16px] leading-relaxed",
            feedbackKind === "allCorrect"
              ? "border-correct/40 bg-correct/5"
              : "border-gentle/40 bg-gentle/10 text-gentle-foreground",
          )}
        >
          <p className="mb-1 font-semibold">
            {feedbackKind === "allCorrect"
              ? "🎉 概念真的遷移了"
              : feedbackKind === "firstOnlyCorrect"
                ? "📌 你認得課本題型，但概念還沒遷移"
                : "再想一下"}
          </p>
          {word.variantFeedback[feedbackKind]}
          {feedbackKind !== "allCorrect" && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={onBackToGuided}>
                <RotateCcw className="h-4 w-4" />
                回第 2 拍重新推導
              </Button>
            </div>
          )}
        </div>
      )}

      {allDone && (
        <div className="text-center">
          <Button size="lg" onClick={onNext}>
            最後一拍・講給家人聽
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function VariantCard({
  variant,
  index,
  picked,
  onPick,
}: {
  variant: WenyanVariant;
  index: number;
  picked: string | null;
  onPick: (c: string) => void;
}) {
  const revealed = picked !== null;
  const correct = picked === variant.answer;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
          {index + 1}
        </span>
        {variant.likeTextbook ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            跟課本最像
          </span>
        ) : (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
            換了外觀
          </span>
        )}
      </div>

      <p className="mt-3 text-[20px] font-semibold leading-loose tracking-wide">
        「<HighlightSentence text={variant.sentence} target={variant.target} />」
      </p>
      <p className="mt-1 text-right text-sm text-muted-foreground">
        —— {variant.source}
      </p>

      <p className="mt-3 text-[16px] font-medium">{variant.prompt}</p>
      <ChoiceQuestion
        choices={variant.choices}
        answer={variant.answer}
        picked={picked}
        onPick={onPick}
        disabled={revealed}
      />

      {revealed && (
        <div className="mt-4 animate-fade-in space-y-3">
          <p
            className={cn(
              "text-[15px] font-semibold",
              correct ? "text-correct" : "text-gentle-foreground",
            )}
          >
            {correct ? "✅ 答對了" : `不是喔，答案是「${variant.answer}」`}
          </p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[15px] leading-relaxed">
            <span className="font-medium text-primary">白話：</span>
            {variant.translation}
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="flex gap-2 text-[15px] leading-relaxed text-foreground/85">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <span className="font-medium">這題在考：</span>
                {variant.testingWhat}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 第 5 拍：講給家人聽（回扣） ────────────────────
function BeatRecap({
  word,
  onFinish,
}: {
  word: ClassicalWord;
  onFinish: () => void;
}) {
  const [done, setDone] = React.useState(false);
  const next = getNextWord(word.id);
  return (
    <div className="animate-fade-in space-y-5">
      {word.treasureBox && (
        <div className="rounded-2xl border border-gentle/40 bg-gentle/10 p-5">
          <p className="text-[15px] leading-relaxed text-gentle-foreground">
            🧰 {word.treasureBox}
          </p>
        </div>
      )}

      {word.related && word.related.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <p className="text-sm font-semibold text-primary">延伸・同一家族的字</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {word.related.map((r) => (
              <li key={r.char} className="text-[15px] leading-relaxed">
                <span className="mr-1 rounded-md bg-accent/15 px-1.5 py-0.5 font-bold text-accent">
                  {r.char}
                </span>
                {r.meaning}
                {r.example && (
                  <span className="text-muted-foreground">（{r.example}）</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 text-center">
        <p className="text-3xl">🗣️</p>
        <p className="mt-2 text-[17px] font-medium leading-relaxed">
          {word.recap}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          講得出來，才算真的懂——這是背公式的人最怕的一關。
        </p>
        {!done ? (
          <Button
            className="mt-4"
            size="lg"
            onClick={() => {
              setDone(true);
              onFinish();
            }}
          >
            我講完了，完成這個字 ✅
          </Button>
        ) : (
          <div className="mt-4 animate-fade-in">
            <p className="flex items-center justify-center gap-2 text-lg font-semibold text-correct">
              <CheckCircle2 className="h-5 w-5" />
              「{word.word}」完成了 🎉
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {next && (
                <Button asChild size="lg">
                  <Link href={`/wenyan/${next.id}`}>
                    下一個字・{next.word}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href="/">回首頁</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
