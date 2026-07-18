"use client";

// 歷史 3D 場景播放器：全螢幕遊戲介面。
// 上：3D 場景（點熱點翻名詞卡）；下：旁白面板＋名詞卡進度＋幕導航。
// 收齊當幕名詞卡才能前進；最後一幕進快問快答（答錯回鍋），全對拿徽章。
// 進度存 localStorage（src/lib/history-storage.ts）。

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {
  HistoryQuizQ,
  HistoryScene,
  HistoryTerm,
} from "@/content/history/types";
import {
  collectTerm,
  completeSceneQuiz,
  getSceneProgress,
  setStageIndex as persistStageIndex,
} from "@/lib/history-storage";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";

const SceneCanvas = dynamic(
  () => import("./scene-canvas").then((m) => m.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-sky-100">
        <div className="text-center">
          <div className="animate-bounce text-5xl">🏛️</div>
          <p className="mt-3 text-sm font-medium text-sky-900/70">
            正在搭建歷史場景…
          </p>
        </div>
      </div>
    ),
  },
);

type Mode = "story" | "quiz" | "done";

export function ScenePlayer({ scene }: { scene: HistoryScene }) {
  const [stageIndex, setStageIndex] = React.useState(0);
  const [collected, setCollected] = React.useState<string[]>([]);
  const [openTerm, setOpenTerm] = React.useState<HistoryTerm | null>(null);
  const [mode, setMode] = React.useState<Mode>("story");
  const [showDex, setShowDex] = React.useState(false);
  const [firstTryScore, setFirstTryScore] = React.useState(0);

  const stage = scene.stages[stageIndex];
  const isLastStage = stageIndex === scene.stages.length - 1;
  const allTerms = React.useMemo(
    () => scene.stages.flatMap((s) => s.terms),
    [scene],
  );

  // 回訪 resume：接續上次的幕與已收集的卡
  React.useEffect(() => {
    const p = getSceneProgress(scene.id);
    setCollected(p.collected);
    setStageIndex(Math.min(p.stageIndex, scene.stages.length - 1));
  }, [scene]);

  const stageDone =
    stage.terms.length === 0 ||
    stage.terms.every((t) => collected.includes(t.id));
  const missing = stage.terms.filter((t) => !collected.includes(t.id)).length;

  function handleCollect(term: HistoryTerm) {
    const p = collectTerm(scene.id, term.id);
    setCollected(p.collected);
    setOpenTerm(null);
  }

  function goStage(i: number) {
    const next = Math.max(0, Math.min(i, scene.stages.length - 1));
    setStageIndex(next);
    persistStageIndex(scene.id, next);
  }

  function handleQuizPass(firstTry: number) {
    completeSceneQuiz(scene.id, firstTry);
    setFirstTryScore(firstTry);
    setMode("done");
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-sky-100">
      {/* ── 頂欄 ── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-4">
        <Link
          href="/history"
          className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-700 shadow backdrop-blur hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          回基地
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowDex(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-amber-700 shadow backdrop-blur hover:bg-white"
          >
            📇 {collected.length}/{allTerms.length}
          </button>
        </div>
      </header>

      {/* ── 3D 場景 ── */}
      <div className="min-h-0 flex-1">
        {mode === "story" && (
          <SceneCanvas
            scene={scene}
            stageIndex={stageIndex}
            collected={collected}
            onHotspot={setOpenTerm}
          />
        )}
        {mode !== "story" && (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-sky-200 to-amber-50">
            <div className="text-7xl">{mode === "quiz" ? "⚡" : scene.badge.emoji}</div>
          </div>
        )}
      </div>

      {/* ── 底部面板 ── */}
      {mode === "story" && (
        <div className="border-t bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur sm:p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-2">
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                {stage.kicker}
              </span>
            </div>
            <h2 className="mt-1.5 text-lg font-extrabold tracking-tight">
              {stage.title}
            </h2>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-700">
              {stage.narration}
            </p>

            {/* 名詞卡進度（也可以直接點開） */}
            {stage.terms.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {stage.terms.map((t) => {
                  const got = collected.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setOpenTerm(t)}
                      className={
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors " +
                        (got
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100")
                      }
                    >
                      <span>{got ? "✅" : t.emoji}</span>
                      {t.term}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 導航 */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => goStage(stageIndex - 1)}
                disabled={stageIndex === 0}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium text-stone-600 disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                上一幕
              </button>
              <div className="flex items-center gap-1.5">
                {scene.stages.map((s, i) => (
                  <span
                    key={s.id}
                    className={
                      "h-2 rounded-full transition-all " +
                      (i === stageIndex
                        ? "w-6 bg-sky-500"
                        : i < stageIndex
                          ? "w-2 bg-sky-300"
                          : "w-2 bg-stone-200")
                    }
                  />
                ))}
              </div>
              {isLastStage ? (
                <button
                  onClick={() => setMode("quiz")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600"
                >
                  <Sparkles className="h-4 w-4" />
                  快問快答
                </button>
              ) : (
                <button
                  onClick={() => goStage(stageIndex + 1)}
                  disabled={!stageDone}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow enabled:hover:bg-sky-700 disabled:bg-stone-300"
                >
                  {stageDone ? "下一幕" : `還差 ${missing} 張卡`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === "quiz" && (
        <QuickQuiz questions={scene.quiz} onPass={handleQuizPass} />
      )}

      {mode === "done" && (
        <div className="border-t bg-white/95 p-5 backdrop-blur">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-5xl">{scene.badge.emoji}</div>
            <h2 className="mt-2 text-xl font-extrabold">
              徽章入手：{scene.badge.name}！
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              快問快答一次就對 {firstTryScore}/{scene.quiz.length} 題
              {firstTryScore === scene.quiz.length
                ? "——全部一次過，超猛！"
                : "——回鍋的題目下次再驗收一次。"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setShowDex(true)}
                className="rounded-xl border px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                📇 複習名詞卡
              </button>
              <button
                onClick={() => {
                  setMode("story");
                  goStage(0);
                }}
                className="rounded-xl border px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                🔁 再走一次場景
              </button>
              <Link
                href="/history"
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
              >
                回基地選下一關 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 名詞卡彈窗（讀完 → 小測驗通過才能收卡） ── */}
      {openTerm && (
        <TermCardModal
          key={openTerm.id}
          term={openTerm}
          allTerms={allTerms}
          alreadyCollected={collected.includes(openTerm.id)}
          onCollect={() => handleCollect(openTerm)}
          onClose={() => setOpenTerm(null)}
        />
      )}

      {/* ── 名詞卡圖鑑 ── */}
      {showDex && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 sm:p-8">
          <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="inline-flex items-center gap-2 text-lg font-extrabold">
                <BookOpenCheck className="h-5 w-5 text-amber-600" />
                名詞卡圖鑑（{collected.length}/{allTerms.length}）
              </h3>
              <button
                onClick={() => setShowDex(false)}
                className="rounded-full p-1.5 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {allTerms.map((t) => {
                  const got = collected.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={
                        "rounded-2xl border p-3 " +
                        (got ? "bg-white" : "bg-stone-50 opacity-50")
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{got ? t.emoji : "❓"}</span>
                        <span className="font-bold">
                          {got ? t.term : "還沒收集"}
                        </span>
                      </div>
                      {got && (
                        <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                          {t.hook}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 語音朗讀（Web Speech API，zh-TW） ── */
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-TW";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}
function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/* ── 名詞卡彈窗：三階段防跳讀 ──
   1) read：卡片內容＋依字數計算的閱讀倒數（倒數完才能進下一步）
   2) check：小測驗「這張卡在說哪個名詞？」——答對才真的收卡，答錯回去重讀
   3) 已收藏的卡直接自由閱覽（複習不設關卡） */
function TermCardModal({
  term,
  allTerms,
  alreadyCollected,
  onCollect,
  onClose,
}: {
  term: HistoryTerm;
  allTerms: HistoryTerm[];
  alreadyCollected: boolean;
  onCollect: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = React.useState<"read" | "check">("read");
  const [retry, setRetry] = React.useState(false);
  const [picked, setPicked] = React.useState<string | null>(null);

  // 閱讀秒數：依內容長度估（12 歲閱讀速度），重讀時縮短
  const fullLen = term.explain.length + term.hook.length;
  const readSecs = retry ? 3 : Math.min(9, Math.max(4, Math.round(fullLen / 14)));
  const [secondsLeft, setSecondsLeft] = React.useState(readSecs);

  React.useEffect(() => {
    if (phase !== "read" || alreadyCollected) return;
    setSecondsLeft(readSecs);
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) clearInterval(timer);
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, retry]);

  React.useEffect(() => () => stopSpeaking(), []);

  // 小測驗：把記憶鉤（或解釋）裡的名詞挖空，三選一
  const quiz = React.useMemo(() => {
    const others = allTerms.filter((t) => t.id !== term.id);
    // 洗牌取 2 個混淆選項（用名詞長度+字元和當穩定隨機）
    const shuffled = [...others].sort(
      (a, b) =>
        ((a.term.charCodeAt(0) * 31 + a.term.length * 7) % 97) -
        ((b.term.charCodeAt(0) * 31 + b.term.length * 7) % 97),
    );
    const distractors = shuffled.slice(0, 2).map((t) => t.term);
    const options = [term.term, ...distractors].sort(
      (a, b) => ((a.charCodeAt(0) * 13) % 7) - ((b.charCodeAt(0) * 13) % 7),
    );
    let clozeText: string;
    if (term.hook.includes(term.term)) {
      clozeText = `「${term.hook.split(term.term).join("＿＿＿")}」`;
    } else if (term.explain.includes(term.term)) {
      const sentence =
        term.explain.split("。").find((s) => s.includes(term.term)) ?? term.explain;
      clozeText = `「${sentence.split(term.term).join("＿＿＿")}」`;
    } else {
      clozeText = `「${term.explain.slice(0, 46)}…」`;
    }
    return { clozeText, options };
  }, [term, allTerms]);

  const answered = picked !== null;
  const isCorrect = picked === term.term;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        stopSpeaking();
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "read" && (
          <>
            <div className="text-center text-5xl">{term.emoji}</div>
            <h3 className="mt-2 text-center text-2xl font-black tracking-tight">
              {term.term}
            </h3>
            {retry && (
              <p className="mt-1 text-center text-xs font-bold text-rose-500">
                沒關係！再仔細看一次，等等再考你 💪
              </p>
            )}
            <p className="mt-3 text-[15px] leading-relaxed text-stone-700">
              {term.explain}
            </p>
            <div className="mt-3 rounded-2xl bg-amber-50 p-3">
              <div className="text-xs font-bold text-amber-700">🧠 記憶鉤</div>
              <p className="mt-0.5 text-sm font-medium leading-relaxed text-amber-900">
                {term.hook}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() =>
                  speak(`${term.term}。${term.explain}。記憶鉤：${term.hook}`)
                }
                className="shrink-0 rounded-xl border-2 border-sky-200 px-3 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-50"
              >
                🔊 唸給我聽
              </button>
              {alreadyCollected ? (
                <button
                  onClick={() => {
                    stopSpeaking();
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-base font-bold text-white shadow hover:bg-emerald-600"
                >
                  已收藏 ✓ 關閉
                </button>
              ) : (
                <button
                  disabled={secondsLeft > 0}
                  onClick={() => {
                    stopSpeaking();
                    setPicked(null);
                    setPhase("check");
                  }}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-base font-bold text-white shadow enabled:hover:bg-amber-600 disabled:bg-stone-300"
                >
                  {secondsLeft > 0
                    ? `認真讀…（${secondsLeft}）`
                    : "讀完了，考我！"}
                </button>
              )}
            </div>
          </>
        )}

        {phase === "check" && (
          <>
            <div className="text-center text-3xl">🤔</div>
            <h3 className="mt-1 text-center text-lg font-extrabold">
              這張卡在說哪個名詞？
            </h3>
            <p className="mt-3 rounded-2xl bg-stone-50 p-3 text-[15px] leading-relaxed text-stone-700">
              {quiz.clozeText}
            </p>
            <div className="mt-3 grid gap-2">
              {quiz.options.map((opt) => {
                let cls = "border-stone-200 bg-white hover:border-amber-400";
                if (answered) {
                  if (opt === term.term)
                    cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
                  else if (opt === picked)
                    cls = "border-rose-300 bg-rose-50 text-rose-700";
                  else cls = "border-stone-200 opacity-50";
                }
                return (
                  <button
                    key={opt}
                    disabled={answered}
                    onClick={() => setPicked(opt)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition-colors ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && isCorrect && (
              <button
                onClick={onCollect}
                className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 text-base font-bold text-white shadow hover:bg-emerald-600"
              >
                答對了！收進圖鑑 🎉
              </button>
            )}
            {answered && !isCorrect && (
              <button
                onClick={() => {
                  setRetry(true);
                  setPicked(null);
                  setPhase("read");
                }}
                className="mt-3 w-full rounded-xl bg-rose-400 py-2.5 text-base font-bold text-white shadow hover:bg-rose-500"
              >
                再讀一次 →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── 快問快答：答錯的題回鍋，全對才過 ── */
function QuickQuiz({
  questions,
  onPass,
}: {
  questions: HistoryQuizQ[];
  onPass: (firstTryCorrect: number) => void;
}) {
  const [queue, setQueue] = React.useState<number[]>(() =>
    questions.map((_, i) => i),
  );
  const [firstTry, setFirstTry] = React.useState<Record<number, boolean>>({});
  const [picked, setPicked] = React.useState<number | null>(null);

  const qi = queue[0];
  const q = questions[qi];
  const answered = picked !== null;
  const isCorrect = answered && picked === q.answer;
  const solvedCount = questions.length - queue.length;

  function next() {
    if (isCorrect) {
      const rest = queue.slice(1);
      if (rest.length === 0) {
        const score = questions.reduce(
          (n, _, i) => n + (firstTry[i] ? 1 : 0),
          0,
        );
        onPass(score);
        return;
      }
      setQueue(rest);
    } else {
      // 答錯回鍋：移到隊伍最後，等等再考一次
      setQueue([...queue.slice(1), qi]);
    }
    setPicked(null);
  }

  function pick(i: number) {
    if (answered) return;
    setPicked(i);
    if (!(qi in firstTry)) {
      setFirstTry({ ...firstTry, [qi]: i === q.answer });
    }
  }

  return (
    <div className="border-t bg-white/95 p-4 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
          <span>⚡ 快問快答（答錯的題會回鍋再考）</span>
          <span>
            過關 {solvedCount}/{questions.length}
          </span>
        </div>
        <h3 className="mt-2 text-base font-extrabold leading-relaxed">{q.q}</h3>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            let cls = "border-stone-200 bg-white hover:border-sky-400";
            if (answered) {
              if (i === q.answer)
                cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
              else if (i === picked)
                cls = "border-rose-300 bg-rose-50 text-rose-700";
              else cls = "border-stone-200 bg-white opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={answered}
                className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div
            className={
              "mt-2.5 rounded-2xl p-3 text-sm leading-relaxed " +
              (isCorrect
                ? "bg-emerald-50 text-emerald-900"
                : "bg-amber-50 text-amber-900")
            }
          >
            <span className="font-bold">
              {isCorrect ? "答對了！" : "先別急——"}
            </span>{" "}
            {q.explain}
            {!isCorrect && (
              <span className="mt-1 block text-xs font-semibold text-amber-700">
                這題等等會回鍋，再答一次把它收服。
              </span>
            )}
          </div>
        )}
        {answered && (
          <button
            onClick={next}
            className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-base font-bold text-white shadow hover:bg-sky-700"
          >
            {isCorrect && queue.length === 1 ? "領取徽章 🏅" : "下一題 →"}
          </button>
        )}
      </div>
    </div>
  );
}
