"use client";

import Link from "next/link";
import type { Homework } from "@/content/homework/types";
import { DraftFlow } from "./draft-flow";
import { VocabDrill } from "./vocab-drill";
import { ChevronLeft } from "lucide-react";

export function HomeworkFlow({ homework }: { homework: Homework }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 py-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          回首頁
        </Link>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {homework.subjectEmoji}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium text-secondary-foreground">
          {homework.subject}科
        </span>
      </div>
      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
        {homework.title}
      </h1>

      <div className="mt-2 flex flex-1 flex-col">
        {homework.kind === "vocab" ? (
          <VocabDrill homework={homework} />
        ) : (
          <DraftFlow homework={homework} />
        )}
      </div>
    </div>
  );
}
