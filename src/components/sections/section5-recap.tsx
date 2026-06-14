"use client";

import type { Unit } from "@/content/types";
import { VoiceButton } from "@/components/voice/voice-button";
import { Mic } from "lucide-react";

export function Section5Recap({ unit }: { unit: Unit }) {
  const s = unit.section5_recap;
  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">第 5 段・回扣</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{s.heading}</h2>
          <VoiceButton unit={unit} sectionKey="recap" />
        </div>
      </header>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
        <div className="flex items-center gap-2 text-accent">
          <Mic className="h-6 w-6" />
          <span className="font-semibold">用嘴巴講一次</span>
        </div>
        <p className="mt-4 text-[18px] leading-relaxed">{s.prompt}</p>
      </div>

      <p className="text-[16px] leading-relaxed text-muted-foreground">
        {s.note}
      </p>
    </div>
  );
}
