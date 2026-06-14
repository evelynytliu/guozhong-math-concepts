"use client";

import * as React from "react";
import type { VocabHomework, VocabBatch, VocabCard } from "@/content/homework/types";
import {
  VOCAB_BATCHES,
  VOCAB_TOTAL,
  isVocabCorrect,
} from "@/content/homework/vocab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVocabProgress,
  saveVocabProgress,
} from "@/lib/homework-storage";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  PartyPopper,
  RotateCcw,
} from "lucide-react";

// 洗牌（一般前端程式，可用 Math.random）
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Result = { correct: boolean; card: VocabCard } | null;

export function VocabDrill({ homework }: { homework: VocabHomework }) {
  const [mastered, setMastered] = React.useState<Set<string>>(new Set());
  const [loaded, setLoaded] = React.useState(false);
  const [mode, setMode] = React.useState<"overview" | "drill">("overview");
  const [batch, setBatch] = React.useState<VocabBatch | null>(null);
  const [queue, setQueue] = React.useState<VocabCard[]>([]);
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<Result>(null);
  const [hint, setHint] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);

  // 載入精熟進度
  React.useEffect(() => {
    let active = true;
    (async () => {
      const p = await getVocabProgress(homework.id);
      if (!active) return;
      if (p) setMastered(new Set(p.masteredCardIds));
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [homework.id]);

  // 出結果後，把焦點移到「下一個」鈕，讓 Enter 可以繼續
  React.useEffect(() => {
    if (result) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [result]);

  function persist(next: Set<string>) {
    void saveVocabProgress(homework.id, Array.from(next));
  }

  function startBatch(b: VocabBatch) {
    const todo = b.cards.filter((c) => !mastered.has(c.id));
    setBatch(b);
    setQueue(shuffle(todo));
    setInput("");
    setResult(null);
    setHint(false);
    setMode("drill");
  }

  function resetBatch(b: VocabBatch) {
    const next = new Set(mastered);
    for (const c of b.cards) next.delete(c.id);
    setMastered(next);
    persist(next);
    startBatch(b);
  }

  function submit() {
    const current = queue[0];
    if (!current || result) return;
    const ok = isVocabCorrect(input, current);
    if (ok) {
      const next = new Set(mastered);
      next.add(current.id);
      setMastered(next);
      persist(next);
    }
    setResult({ correct: ok, card: current });
  }

  function nextCard() {
    setQueue((q) => {
      if (q.length === 0) return q;
      const [head, ...rest] = q;
      // 答對 → 移除；答錯 → 排到最後，等一下再出現（保證最後全對才結束）
      return result?.correct ? rest : [...rest, head];
    });
    setInput("");
    setResult(null);
    setHint(false);
  }

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        載入進度中…
      </div>
    );
  }

  // ── 總覽 ──
  if (mode === "overview") {
    const masteredCount = mastered.size;
    return (
      <div className="flex flex-1 flex-col pb-10">
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <p className="text-xs font-medium text-muted-foreground">
            {homework.pdfNote}
          </p>
          <div className="mt-2 space-y-1.5 text-[16px] leading-relaxed text-foreground/90">
            {homework.intro.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-[15px] leading-relaxed text-secondary-foreground">
            👪 {homework.parentSignNote}
          </p>
        </section>

        {/* 總進度 */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              全部拼對：{masteredCount} / {VOCAB_TOTAL} 個字
            </span>
            <span className="text-muted-foreground">
              {Math.round((masteredCount / VOCAB_TOTAL) * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-correct transition-all"
              style={{ width: `${(masteredCount / VOCAB_TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* 分組 */}
        <p className="mt-6 mb-2 text-sm font-medium text-muted-foreground">
          一次練一組就好（每組約 18 個字）：
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {VOCAB_BATCHES.map((b, i) => {
            const done = b.cards.filter((c) => mastered.has(c.id)).length;
            const complete = done === b.cards.length;
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 shadow-sm transition-colors",
                  complete && "border-correct/40 bg-correct/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    第 {i + 1} 組
                  </span>
                  {complete && (
                    <span className="flex items-center gap-1 text-xs font-medium text-correct">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      全對
                    </span>
                  )}
                </div>
                <p className="mt-1 font-semibold tracking-tight">{b.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        complete ? "bg-correct" : "bg-primary",
                      )}
                      style={{ width: `${(done / b.cards.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {done}/{b.cards.length}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" onClick={() => startBatch(b)}>
                    {complete ? "再練一次" : done > 0 ? "繼續" : "開始"}
                  </Button>
                  {done > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetBatch(b)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      重來
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 練習中 ──
  const current = queue[0];
  const inBatchDone = batch
    ? batch.cards.filter((c) => mastered.has(c.id)).length
    : 0;
  const batchTotal = batch?.cards.length ?? 0;

  // 這組已經全對（queue 清空）→ 過關畫面
  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
        <div className="animate-pop rounded-2xl border border-correct/40 bg-correct/5 p-8">
          <PartyPopper className="mx-auto h-12 w-12 text-correct" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            這一組，每個字都拼對了！
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
            {batch?.label}・{batchTotal} 個字全部過關 🎉
          </p>
          <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-[15px] leading-relaxed text-secondary-foreground">
            👪 背到全對了，記得請爸媽在作業本的單字表那一欄簽名。
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <Button onClick={() => setMode("overview")}>
              回去看所有組別
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => batch && resetBatch(batch)}>
              <RotateCcw className="h-4 w-4" />
              再從頭練這一組
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      {/* 這組進度 */}
      <div className="flex items-center justify-between py-3">
        <button
          type="button"
          onClick={() => setMode("overview")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 先回總覽
        </button>
        <span className="text-sm text-muted-foreground">
          {batch?.label}：{inBatchDone}/{batchTotal}・還剩 {queue.length} 個要拼對
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-correct transition-all"
          style={{ width: `${(inBatchDone / batchTotal) * 100}%` }}
        />
      </div>

      {/* 出題卡 */}
      <div className="mt-8 flex flex-col items-center">
        <p className="text-sm text-muted-foreground">把這個中文，拼成英文：</p>
        <p className="mt-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {current.zh}
        </p>

        <div className="mt-7 w-full max-w-sm">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !result && input.trim()) submit();
            }}
            placeholder="在這裡拼出英文…"
            disabled={Boolean(result)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="text-center text-lg"
          />

          {!result && (
            <div className="mt-3 flex items-center justify-between">
              {!hint ? (
                <button
                  type="button"
                  onClick={() => setHint(true)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                  想不起來？看第一個字母
                </button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  開頭是「
                  <span className="font-semibold text-foreground">
                    {current.answers[0][0]}
                  </span>
                  」…（共 {current.answers[0].replace(/[^a-zA-Z]/g, "").length} 個字母）
                </span>
              )}
              <Button onClick={submit} disabled={!input.trim()}>
                送出
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 批改結果 */}
      {result && (
        <div className="mt-6 flex flex-col items-center">
          {result.correct ? (
            <div className="animate-pop flex w-full max-w-sm flex-col items-center rounded-2xl border border-correct/40 bg-correct/5 p-5 text-center">
              <CheckCircle2 className="h-8 w-8 text-correct" />
              <p className="mt-2 text-lg font-bold text-correct">答對了！</p>
              <p className="mt-1 text-[17px] font-semibold">
                {result.card.answers.join(" / ")}
              </p>
              <p className="text-sm text-muted-foreground">{result.card.zh}</p>
            </div>
          ) : (
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-gentle/40 bg-gentle/10 p-5 text-center">
              <p className="text-[16px] font-medium text-gentle-foreground">
                差一點，正確拼法是：
              </p>
              <p className="mt-1 text-[19px] font-bold">
                {result.card.answers.join(" / ")}
              </p>
              <p className="text-sm text-muted-foreground">{result.card.zh}</p>
              <p className="mt-2 text-sm text-gentle-foreground">
                沒關係，這個字等一下會再出現一次，這次把它記起來。
              </p>
            </div>
          )}

          <Button ref={nextRef} className="mt-4" onClick={nextCard}>
            {queue.length > 1 || !result.correct ? "下一個" : "完成這一組"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
