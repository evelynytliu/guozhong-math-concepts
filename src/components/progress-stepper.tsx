"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const SECTION_LABELS = [
  "情境引入",
  "引導推導",
  "用自己的話說",
  "變形題驗證",
  "回扣",
];

interface ProgressStepperProps {
  current: number; // 目前第幾段（1-5）
  reached: number; // 最遠到過第幾段（已解鎖）
  onJump?: (section: number) => void; // 點已解鎖的段可跳轉
}

export function ProgressStepper({
  current,
  reached,
  onJump,
}: ProgressStepperProps) {
  return (
    <nav aria-label="學習進度" className="w-full">
      <ol className="flex items-center">
        {SECTION_LABELS.map((label, i) => {
          const n = i + 1;
          const isDone = n < current;
          const isCurrent = n === current;
          const unlocked = n <= reached;
          return (
            <li
              key={n}
              className={cn("flex items-center", i < 4 && "flex-1")}
            >
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && onJump?.(n)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-opacity",
                  unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-40",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground shadow-sm",
                    isDone &&
                      "border-correct bg-correct text-correct-foreground",
                    !isCurrent &&
                      !isDone &&
                      "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-center text-xs sm:block",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < 4 && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2",
                    n < current ? "bg-correct" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
