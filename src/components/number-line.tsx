"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NumberLineProps {
  min: number;
  max: number;
  mode: "click" | "walk";
  target?: number; // click 模式：正確位置
  start?: number; // walk 模式：起點
  walk?: number[]; // walk 模式：每一步位移，例如 [+5, -3]
  onResolved?: (correct: boolean) => void; // 完成互動時回呼（對/錯）
}

const W = 720;
const H = 130;
const PAD_X = 44;
const AXIS_Y = 78;

export function NumberLine({
  min,
  max,
  mode,
  target,
  start = 0,
  walk = [],
  onResolved,
}: NumberLineProps) {
  const span = max - min;
  const usable = W - PAD_X * 2;
  const stepPx = usable / span;
  const x = React.useCallback(
    (v: number) => PAD_X + (v - min) * stepPx,
    [min, stepPx],
  );

  const ticks = React.useMemo(
    () => Array.from({ length: span + 1 }, (_, i) => min + i),
    [min, span],
  );

  // ── click 模式 ──
  const [selected, setSelected] = React.useState<number | null>(null);
  const clickResolved = selected !== null;
  const clickCorrect = selected === target;

  function handleClick(v: number) {
    if (clickResolved) return;
    setSelected(v);
    onResolved?.(v === target);
  }

  // ── walk 模式 ──
  const [stepIndex, setStepIndex] = React.useState(0);
  const pos = start + walk.slice(0, stepIndex).reduce((a, b) => a + b, 0);
  const walkDone = stepIndex >= walk.length;

  function takeStep() {
    if (walkDone) return;
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next >= walk.length) onResolved?.(true);
  }

  function resetWalk() {
    setStepIndex(0);
  }

  const nextDelta = !walkDone ? walk[stepIndex] : null;

  return (
    <div className="rounded-xl border bg-secondary/40 p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none-all"
        role="img"
        aria-label="數線"
      >
        {/* 主軸線 */}
        <line
          x1={PAD_X - 16}
          y1={AXIS_Y}
          x2={W - PAD_X + 16}
          y2={AXIS_Y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
        />
        {/* 兩端箭頭 */}
        <polygon
          points={`${W - PAD_X + 16},${AXIS_Y} ${W - PAD_X + 6},${AXIS_Y - 5} ${W - PAD_X + 6},${AXIS_Y + 5}`}
          fill="hsl(var(--muted-foreground))"
        />
        <polygon
          points={`${PAD_X - 16},${AXIS_Y} ${PAD_X - 6},${AXIS_Y - 5} ${PAD_X - 6},${AXIS_Y + 5}`}
          fill="hsl(var(--muted-foreground))"
        />

        {/* 刻度 */}
        {ticks.map((v) => {
          const isZero = v === 0;
          return (
            <g key={v}>
              <line
                x1={x(v)}
                y1={AXIS_Y - (isZero ? 12 : 7)}
                x2={x(v)}
                y2={AXIS_Y + (isZero ? 12 : 7)}
                stroke={
                  isZero
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))"
                }
                strokeWidth={isZero ? 2.5 : 1.5}
              />
              <text
                x={x(v)}
                y={AXIS_Y + 30}
                textAnchor="middle"
                className="fill-muted-foreground text-[13px]"
                style={{ fontWeight: isZero ? 700 : 400 }}
              >
                {v > 0 ? `+${v}` : v}
              </text>
            </g>
          );
        })}

        {/* click 模式：可點的位置 */}
        {mode === "click" &&
          ticks.map((v) => {
            const isSel = selected === v;
            return (
              <circle
                key={`hit-${v}`}
                cx={x(v)}
                cy={AXIS_Y}
                r={isSel ? 9 : 13}
                onClick={() => handleClick(v)}
                className={cn(
                  "transition-all",
                  clickResolved ? "cursor-default" : "cursor-pointer",
                )}
                fill={
                  isSel
                    ? clickCorrect
                      ? "hsl(var(--correct))"
                      : "hsl(var(--gentle))"
                    : "transparent"
                }
                stroke={isSel ? "transparent" : "hsl(var(--border))"}
                strokeWidth={1}
                opacity={isSel ? 1 : clickResolved ? 0.2 : 0.55}
              />
            );
          })}

        {/* click 模式：若答錯，標出正確位置 */}
        {mode === "click" &&
          clickResolved &&
          !clickCorrect &&
          target !== undefined && (
            <circle
              cx={x(target)}
              cy={AXIS_Y}
              r={9}
              fill="hsl(var(--correct))"
              opacity={0.85}
            />
          )}

        {/* walk 模式：走過的每一步用弧線箭頭表示 */}
        {mode === "walk" &&
          walk.slice(0, stepIndex).map((d, i) => {
            const from = start + walk.slice(0, i).reduce((a, b) => a + b, 0);
            const to = from + d;
            const midX = (x(from) + x(to)) / 2;
            const arcTop = AXIS_Y - 34 - (i % 2) * 6;
            const positive = d > 0;
            return (
              <g key={`arc-${i}`}>
                <path
                  d={`M ${x(from)} ${AXIS_Y - 6} Q ${midX} ${arcTop} ${x(to)} ${AXIS_Y - 6}`}
                  fill="none"
                  stroke={
                    positive ? "hsl(var(--primary))" : "hsl(var(--accent))"
                  }
                  strokeWidth={2.5}
                />
                <text
                  x={midX}
                  y={arcTop - 2}
                  textAnchor="middle"
                  className="text-[12px]"
                  fill={positive ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                  style={{ fontWeight: 600 }}
                >
                  {positive ? `+${d}` : d}
                </text>
              </g>
            );
          })}

        {/* walk 模式：目前所在位置的標記 */}
        {mode === "walk" && (
          <g style={{ transition: "transform 0.4s ease" }}>
            <circle
              cx={x(pos)}
              cy={AXIS_Y}
              r={10}
              fill="hsl(var(--primary))"
              style={{ transition: "cx 0.4s ease" }}
            />
            <text
              x={x(pos)}
              y={AXIS_Y - 18}
              textAnchor="middle"
              className="text-[14px]"
              fill="hsl(var(--primary))"
              style={{ fontWeight: 700, transition: "x 0.4s ease" }}
            >
              {pos > 0 ? `+${pos}` : pos}
            </text>
          </g>
        )}
      </svg>

      {/* walk 模式控制列 */}
      {mode === "walk" && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {!walkDone ? (
            <Button size="sm" onClick={takeStep}>
              走下一步（
              {nextDelta !== null && nextDelta > 0 ? `往右 +${nextDelta}` : ""}
              {nextDelta !== null && nextDelta < 0
                ? `往左 ${nextDelta}`
                : ""}
              ）
            </Button>
          ) : (
            <span className="text-sm font-medium text-correct">
              走完了，停在 {pos > 0 ? `+${pos}` : pos}
            </span>
          )}
          {stepIndex > 0 && (
            <Button size="sm" variant="ghost" onClick={resetWalk}>
              重走一次
            </Button>
          )}
        </div>
      )}

      {/* click 模式提示 */}
      {mode === "click" && (
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {!clickResolved
            ? "點數線上的位置"
            : clickCorrect
              ? "對了！這就是它的位置 ✅"
              : "不是這裡喔，綠點才是正確位置——再看一次它離 0 幾格、在哪一邊。"}
        </p>
      )}
    </div>
  );
}
