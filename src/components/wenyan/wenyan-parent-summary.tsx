"use client";

import * as React from "react";
import Link from "next/link";
import { wenyanWords } from "@/content/wenyan";
import {
  getAllWenyanProgress,
  type WenyanProgress,
} from "@/lib/wenyan-storage";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

const BEAT_NAMES = [
  "你以為你懂",
  "自己推古義",
  "用自己的話說",
  "換句子驗證",
  "講給家人聽",
];

const SELF_LABEL: Record<string, { text: string; color: string }> = {
  got_it: { text: "有講到重點 ✅", color: "text-correct" },
  partial: { text: "部分有講到", color: "text-gentle-foreground" },
  cant_explain: { text: "講不太出來 🤔", color: "text-destructive/80" },
};

// 家長頁的文言文區塊：讀 wenyan 進度，逐字顯示走到哪、孩子寫的解釋、變形題對錯。
// 自成一體（自己讀資料），parent/page.tsx 只要放這個元件即可。
export function WenyanParentSummary() {
  const [map, setMap] = React.useState<Record<string, WenyanProgress>>({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const all = await getAllWenyanProgress();
      const m: Record<string, WenyanProgress> = {};
      for (const p of all) m[p.wordId] = p;
      setMap(m);
      setLoaded(true);
    })();
  }, []);

  const wordsWithData = wenyanWords.filter((w) => map[w.id]);
  if (!loaded || wordsWithData.length === 0) return null;

  const doneCount = wordsWithData.filter((w) => map[w.id]?.completedAt).length;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">
          國文・文言文（古今異義）
        </h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          完成 {doneCount}/{wenyanWords.length} 字
        </span>
      </div>

      <div className="space-y-4">
        {wordsWithData.map((w) => {
          const p = map[w.id]!;
          const completed = Boolean(p.completedAt);
          const reached = p.sectionReached;
          const answered = w.variants.filter((v) => v.id in p.variantResults);
          const correct = answered.filter(
            (v) => p.variantResults[v.id],
          ).length;
          const sa = p.selfAssessment
            ? SELF_LABEL[p.selfAssessment]
            : null;

          // 抓「課本題對、新句子錯＝背了沒遷移」
          const textbookQ = w.variants.find((v) => v.likeTextbook);
          const nonTextbook = w.variants.filter((v) => !v.likeTextbook);
          const noTransfer =
            answered.length >= 2 &&
            textbookQ &&
            p.variantResults[textbookQ.id] === true &&
            nonTextbook.length > 0 &&
            nonTextbook.every((v) => p.variantResults[v.id] === false);

          return (
            <div key={w.id} className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="grad-primary flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-black text-primary-foreground">
                    {w.word}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    第 {w.order} 字
                  </span>
                </div>
                {completed ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-correct/15 px-3 py-1 text-sm font-medium text-correct">
                    <CheckCircle2 className="h-4 w-4" />
                    完成
                  </span>
                ) : reached > 0 ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                    進行到第 {reached} 拍・{BEAT_NAMES[reached - 1]}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 p-5">
                {/* 孩子寫的解釋 */}
                {p.explanation.trim() && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      第 3 拍・孩子用自己的話解釋
                    </p>
                    <div className="rounded-lg border bg-muted/30 px-4 py-3">
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {p.explanation}
                      </p>
                    </div>
                    {sa && (
                      <p className="text-sm">
                        孩子自評：
                        <span className={cn("font-medium", sa.color)}>
                          {sa.text}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* 變形題結果 */}
                {answered.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        第 4 拍・換句子驗證
                      </p>
                      <span className="text-xs font-medium">
                        答對 {correct}/{answered.length} 句
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {answered.map((v) => {
                        const ok = p.variantResults[v.id];
                        return (
                          <div
                            key={v.id}
                            className={cn(
                              "flex items-start gap-2 rounded-lg border px-3 py-2 text-[14px] leading-snug",
                              ok
                                ? "border-correct/30 bg-correct/5"
                                : "border-gentle/30 bg-gentle/5",
                            )}
                          >
                            {ok ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
                            ) : (
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gentle-foreground" />
                            )}
                            <span>
                              「{v.sentence}」
                              <span className="text-muted-foreground">
                                （{v.likeTextbook ? "跟課本最像" : "換了外觀"}）
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {noTransfer && (
                      <div className="rounded-lg border border-gentle/40 bg-gentle/10 px-4 py-3 text-sm">
                        <p className="font-medium">📌 認得課本題，但概念還沒遷移</p>
                        <p className="mt-0.5 text-muted-foreground">
                          跟課本最像的句子對了，換陌生句子卻卡住——這是「背例句、不懂道理」的典型。可鼓勵孩子回第 2 拍重新推一次。
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-1">
                  <Link
                    href={`/wenyan/${w.id}`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    看這個字的教材 →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
