"use client";

import * as React from "react";
import { useVoice } from "@/components/voice/voice-provider";
import { cn } from "@/lib/utils";
import { Mic, ChevronDown, Play, Square } from "lucide-react";

const SAMPLE =
  "哈囉同學！我是你的數學小老師。我們一起把概念想清楚，不要只是背公式喔。";

// 浮在右下角的「語音老師」設定面板：切換自然版／系統版、選音色、調語速、試聽。
export function VoicePanel() {
  const {
    ttsSupported,
    voices,
    voiceURI,
    setVoiceURI,
    rate,
    setRate,
    useNatural,
    setUseNatural,
    hasAnyNatural,
    playingId,
    preview,
    stop,
  } = useVoice();

  const [open, setOpen] = React.useState(false);
  const previewing = playingId === "__preview__";

  // 完全沒有語音能力就不顯示面板
  if (!ttsSupported && !hasAnyNatural) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grad-primary flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-105 active:scale-[0.98]"
        >
          <Mic className="h-4 w-4" />
          語音老師
        </button>
      ) : (
        <div className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border bg-card/95 p-4 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Mic className="h-4 w-4" />
              語音老師
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="收起"
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3.5">
            {/* 自然版 / 系統版 */}
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={useNatural}
                onChange={(e) => setUseNatural(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="text-sm leading-snug">
                <span className="font-medium">真人感語音（自然版）</span>
                <span className="block text-xs text-muted-foreground">
                  {hasAnyNatural
                    ? "用預先錄好的自然語音；沒有的段落會自動改用系統語音。"
                    : "目前尚未生成音檔，會使用瀏覽器內建語音（系統版）。"}
                </span>
              </span>
            </label>

            {/* 音色（系統版） */}
            {ttsSupported && voices.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  系統版音色
                </label>
                <select
                  value={voiceURI ?? ""}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}（{v.lang}）
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 語速 */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>語速</span>
                <span>{rate.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="mt-1 w-full accent-[hsl(var(--primary))]"
              />
            </div>

            {/* 試聽 / 停止 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => preview(SAMPLE)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                  previewing
                    ? "grad-primary border-transparent text-primary-foreground animate-pulse"
                    : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
                )}
              >
                {previewing ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                {previewing ? "播放中" : "試聽"}
              </button>
              <button
                type="button"
                onClick={stop}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                停止
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
