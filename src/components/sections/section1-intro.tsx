"use client";

import * as React from "react";
import type { Unit } from "@/content/types";
import { Button } from "@/components/ui/button";
import { VoiceButton } from "@/components/voice/voice-button";
import { Lightbulb } from "lucide-react";

export function Section1Intro({ unit }: { unit: Unit }) {
  const { heading, body, warmup } = unit.section1_intro;
  const [showAnswer, setShowAnswer] = React.useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">第 1 段・情境引入</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          <VoiceButton unit={unit} sectionKey="intro" />
        </div>
      </header>

      <div className="space-y-1.5 text-[17px] leading-relaxed text-foreground/90">
        {body.map((line, i) =>
          line === "" ? (
            <div key={i} className="h-2" />
          ) : (
            <p key={i}>{line}</p>
          ),
        )}
      </div>

      {/* 熱身問題 */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
        <div className="flex items-center gap-2 text-accent">
          <Lightbulb className="h-5 w-5" />
          <span className="font-semibold">先動動腦（不算分，熱身用）</span>
        </div>
        <p className="mt-3 text-[17px]">{warmup.question}</p>

        {!showAnswer ? (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowAnswer(true)}
          >
            想好了，看看怎麼想
          </Button>
        ) : (
          <div className="mt-4 animate-fade-in rounded-lg bg-card p-4 text-[16px] leading-relaxed">
            {warmup.answer}
          </div>
        )}
      </div>
    </div>
  );
}
