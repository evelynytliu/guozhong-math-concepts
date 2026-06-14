"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

// 「不同角度的提示」chips。點一下就把那句開頭塞進輸入框，孩子接著用自己的話寫。
// 同時被靜態 sparks 和 AI 追問的 directions 共用。
export function SparkChips({
  items,
  onPick,
  variant = "default",
}: {
  items: string[];
  onPick: (text: string) => void;
  variant?: "default" | "ai";
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((text, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(text)}
          className={cn(
            "group inline-flex items-start gap-1.5 rounded-xl border px-3 py-2 text-left text-[15px] leading-snug transition-colors",
            variant === "ai"
              ? "border-accent/30 bg-accent/5 hover:border-accent/60 hover:bg-accent/10"
              : "border-primary/20 bg-primary/5 hover:border-primary/50 hover:bg-primary/10",
          )}
        >
          <Plus
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              variant === "ai" ? "text-accent" : "text-primary",
            )}
          />
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}
