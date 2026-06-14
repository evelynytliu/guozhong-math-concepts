"use client";

import * as React from "react";
import Link from "next/link";
import { pickSpiral, type SpiralQuestion } from "@/content/spiral";
import { units } from "@/content";
import { getAllProgress } from "@/lib/storage";
import { SpiralReview } from "@/components/spiral-review";
import { ChevronLeft, Repeat } from "lucide-react";

const PER_SESSION = 5;

export default function ReviewPage() {
  const [questions, setQuestions] = React.useState<SpiralQuestion[] | null>(
    null,
  );
  const [seed, setSeed] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const progress = await getAllProgress();
      // 學過夠多可複習的單元：做過變形題(第4段)的優先；其次有開始推導的；都沒有就用單元1暖身
      const learned = progress
        .filter((p) => p.sectionReached >= 4)
        .map((p) => p.unitId);
      const started = progress
        .filter((p) => p.sectionReached >= 2)
        .map((p) => p.unitId);
      const availableSet = new Set(
        learned.length ? learned : started.length ? started : ["unit-01"],
      );
      // 依先修順序排列
      const available = units
        .map((u) => u.id)
        .filter((id) => availableSet.has(id));
      if (active) setQuestions(pickSpiral(available, PER_SESSION));
    })();
    return () => {
      active = false;
    };
  }, [seed]);

  return (
    <div className="flex flex-1 flex-col py-8">
      <div className="flex items-center gap-3 pb-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          回首頁
        </Link>
      </div>

      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
          <Repeat className="h-4 w-4" />
          螺旋複習
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          把學過的概念，用新題目練一遍
        </h1>
        <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          這裡的題目會從你做過的單元裡，混合出{PER_SESSION}題「新外觀」的小測。
          不用重看舊內容——能在新題目認出舊概念，才是真的學會了。
        </p>
      </header>

      {questions === null ? (
        <div className="py-16 text-center text-muted-foreground">準備題目中…</div>
      ) : (
        <SpiralReview questions={questions} onRestart={() => setSeed((s) => s + 1)} />
      )}
    </div>
  );
}
