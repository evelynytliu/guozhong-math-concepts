"use client";

import * as React from "react";
import type { Unit, NarrationKey } from "@/content/types";
import { getNarrationText } from "@/lib/narration";
import { useVoice } from "@/components/voice/voice-provider";
import { cn } from "@/lib/utils";
import { Volume2, Square } from "lucide-react";

// 每一段標題旁的「聽老師講」按鈕。
// 自己算出這段要念的文字（系統版用），自然版有 mp3 時優先播 mp3。
export function VoiceButton({
  unit,
  sectionKey,
  label = "聽老師講",
  className,
}: {
  unit: Unit;
  sectionKey: NarrationKey;
  label?: string;
  className?: string;
}) {
  const { play, playingId, ttsSupported, isNaturalAvailable } = useVoice();
  const id = `${unit.id}:${sectionKey}`;
  const playing = playingId === id;
  const natural = isNaturalAvailable(unit.id, sectionKey);

  const text = React.useMemo(
    () => getNarrationText(unit, sectionKey),
    [unit, sectionKey],
  );

  // 完全沒有語音能力（沒 mp3 又沒瀏覽器語音）就不顯示按鈕，免得按了沒反應
  if (!natural && !ttsSupported) return null;

  return (
    <button
      type="button"
      onClick={() => play({ id, unitId: unit.id, sectionKey, text })}
      aria-pressed={playing}
      title={
        natural ? "老師語音（自然版）" : "老師語音（系統版・瀏覽器內建）"
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        playing
          ? "grad-primary border-transparent text-primary-foreground shadow-sm animate-pulse"
          : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
        className,
      )}
    >
      {playing ? (
        <Square className="h-3.5 w-3.5 fill-current" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span>{playing ? "播放中…" : label}</span>
    </button>
  );
}
