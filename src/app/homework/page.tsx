"use client";

import * as React from "react";
import Link from "next/link";
import { homeworks } from "@/content/homework";
import { VOCAB_TOTAL } from "@/content/homework/vocab";
import {
  getAllDrafts,
  getAllVocabProgress,
  type DraftData,
  type VocabProgressData,
} from "@/lib/homework-storage";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomeworkListPage() {
  const [drafts, setDrafts] = React.useState<Record<string, DraftData>>({});
  const [vocab, setVocab] = React.useState<Record<string, VocabProgressData>>(
    {},
  );
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [d, v] = await Promise.all([getAllDrafts(), getAllVocabProgress()]);
      setDrafts(d);
      setVocab(v);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="flex flex-1 flex-col py-8">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        回學習站首頁
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          📚 暑假作業引導
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          這裡只是「打草稿、想清楚」的地方——
          <strong className="text-foreground">草稿好了一定要親手抄到作業本上才算交。</strong>
          提示是「不同角度」不是答案，用自己的話接下去寫。
        </p>
      </header>

      <div className="space-y-3">
        {homeworks.map((hw) => {
          const st = statusFor(hw, drafts, vocab);
          return (
            <Link
              key={hw.id}
              href={`/homework/${hw.id}`}
              className="group block rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {hw.subjectEmoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {hw.subject}科
                    </span>
                    {hw.kind === "vocab" ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                        拼到全對
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        引導打草稿
                      </span>
                    )}
                    {loaded && st.done && (
                      <span className="flex items-center gap-1 rounded-full bg-correct/15 px-2 py-0.5 text-xs font-medium text-correct">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {hw.kind === "vocab" ? "全部拼對" : "已手抄完成"}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold tracking-tight">
                    {hw.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hw.pdfNote}
                  </p>
                  {loaded && !st.done && st.started && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{st.label}</span>
                        <span>{Math.round(st.pct * 100)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            hw.kind === "vocab" ? "bg-accent" : "bg-primary",
                          )}
                          style={{ width: `${st.pct * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {loaded && !st.started && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {st.label}
                    </p>
                  )}
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function statusFor(
  hw: (typeof homeworks)[number],
  drafts: Record<string, DraftData>,
  vocab: Record<string, VocabProgressData>,
): { label: string; pct: number; done: boolean; started: boolean } {
  if (hw.kind === "vocab") {
    const m = vocab[hw.id]?.masteredCardIds.length ?? 0;
    const done = m >= VOCAB_TOTAL;
    return {
      label:
        m === 0 ? "還沒開始・拼到全對就過關" : `已拼對 ${m}/${VOCAB_TOTAL} 個字`,
      pct: VOCAB_TOTAL ? m / VOCAB_TOTAL : 0,
      done,
      started: m > 0,
    };
  }
  const d = drafts[hw.id];
  const required = hw.fields.filter((f) => !f.optional);
  const filled = required.filter(
    (f) => (d?.fields[f.id] ?? "").trim().length > 0,
  ).length;
  if (d?.handCopied) {
    return { label: "已手抄完成", pct: 1, done: true, started: true };
  }
  return {
    label:
      filled === 0
        ? "還沒開始・點進來一步步打草稿"
        : `草稿已寫 ${filled}/${required.length} 題`,
    pct: required.length ? filled / required.length : 0,
    done: false,
    started: filled > 0,
  };
}
