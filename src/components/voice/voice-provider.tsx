"use client";

import * as React from "react";
import { assetUrl } from "@/lib/utils";
import type { NarrationKey } from "@/content/types";

// ───────────────────────────────────────────────────────────────
// 老師語音的中央控制器。
//   - 「自然版」：播放離線生成的 mp3（edge-tts 神經語音，最自然）
//   - 「系統版」：用瀏覽器內建語音（Web Speech API，零成本、離線也能用）
// 設計重點（對齊 CLAUDE.md 的「不能讓孩子卡住」）：
//   * 同一時間只播一段；按同一顆按鈕再按一次 = 停止。
//   * 偏好自然版，但音檔載入失敗會「自動退回」系統版，孩子不會卡住。
//   * 音色 / 語速 / 自然版偏好都記在 localStorage。
// ───────────────────────────────────────────────────────────────

type Manifest = Record<string, string[]>;

interface PlayArgs {
  id: string; // 這顆按鈕的唯一 id（用來做 toggle / 標記播放中）
  unitId: string;
  sectionKey: NarrationKey;
  text: string; // 系統版要念的文字（也是自然版失敗時的退路）
}

interface VoiceContextValue {
  ttsSupported: boolean;
  voices: SpeechSynthesisVoice[];
  voiceURI: string | null;
  setVoiceURI: (uri: string) => void;
  rate: number;
  setRate: (r: number) => void;
  useNatural: boolean;
  setUseNatural: (v: boolean) => void;
  hasAnyNatural: boolean;
  isNaturalAvailable: (unitId: string, key: NarrationKey) => boolean;
  playingId: string | null;
  play: (args: PlayArgs) => void;
  stop: () => void;
  preview: (text: string) => void;
}

const VoiceContext = React.createContext<VoiceContextValue | null>(null);

const LS_VOICE = "gz-math:voice-uri";
const LS_RATE = "gz-math:voice-rate";
const LS_NATURAL = "gz-math:voice-natural";

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURIState] = React.useState<string | null>(null);
  const [rate, setRateState] = React.useState(1);
  const [useNatural, setUseNaturalState] = React.useState(true);
  const [manifest, setManifest] = React.useState<Manifest>({});
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  // 用 state 而非直接讀 window：避免 SSR（false）和 client 首次 render（true）
  // 不一致造成 hydration mismatch。掛載後才設為真，按鈕/面板隨後出現。
  const [ttsSupported, setTtsSupported] = React.useState(false);
  React.useEffect(() => {
    setTtsSupported("speechSynthesis" in window);
  }, []);

  // ── refs：讓 play/stop 用 useCallback 也能讀到最新值 ──
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const voicesRef = React.useRef(voices);
  const voiceURIRef = React.useRef(voiceURI);
  const rateRef = React.useRef(rate);
  const useNaturalRef = React.useRef(useNatural);
  const manifestRef = React.useRef(manifest);
  const playingIdRef = React.useRef(playingId);
  React.useEffect(() => void (voicesRef.current = voices), [voices]);
  React.useEffect(() => void (voiceURIRef.current = voiceURI), [voiceURI]);
  React.useEffect(() => void (rateRef.current = rate), [rate]);
  React.useEffect(() => void (useNaturalRef.current = useNatural), [useNatural]);
  React.useEffect(() => void (manifestRef.current = manifest), [manifest]);
  React.useEffect(() => void (playingIdRef.current = playingId), [playingId]);

  // ── 從 localStorage 還原設定 ──
  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(LS_VOICE);
      if (v) setVoiceURIState(v);
      const r = window.localStorage.getItem(LS_RATE);
      if (r) setRateState(Math.min(1.4, Math.max(0.6, parseFloat(r) || 1)));
      const n = window.localStorage.getItem(LS_NATURAL);
      if (n != null) setUseNaturalState(n === "1");
    } catch {
      /* 忽略 */
    }
  }, []);

  // ── 載入瀏覽器語音清單（偏好台灣中文）──
  React.useEffect(() => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    const load = () => {
      const all = synth.getVoices();
      const zh = all.filter((v) => /zh|cmn/i.test(v.lang));
      const list = zh.length ? zh : all;
      setVoices(list);
      setVoiceURIState((prev) => {
        if (prev && list.some((v) => v.voiceURI === prev)) return prev;
        const tw = list.find((v) =>
          /zh.?TW|cmn.?TW|Hanhan|Yating|Meijia|HsiaoChen|HsiaoYu/i.test(
            v.lang + v.name,
          ),
        );
        return (tw ?? list[0])?.voiceURI ?? null;
      });
    };
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => synth.removeEventListener?.("voiceschanged", load);
  }, [ttsSupported]);

  // ── 載入音檔清單（哪些單元 / 段落有自然版 mp3）──
  React.useEffect(() => {
    let active = true;
    fetch(assetUrl("/audio/manifest.json"))
      .then((r) => (r.ok ? r.json() : {}))
      .then(
        (m: unknown) =>
          active &&
          setManifest(m && typeof m === "object" ? (m as Manifest) : {}),
      )
      .catch(() => active && setManifest({}));
    return () => {
      active = false;
    };
  }, []);

  // 語速變動時，正在播的 mp3 即時跟著變
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const stop = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const audio = audioRef.current;
    if (audio) {
      audio.onerror = null;
      audio.onended = null;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* 某些瀏覽器在未載入時設定會丟錯，忽略 */
      }
    }
    setPlayingId(null);
  }, []);

  // 系統版：瀏覽器內建語音
  const speak = React.useCallback((text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voicesRef.current.find((x) => x.voiceURI === voiceURIRef.current);
    if (v) u.voice = v;
    u.lang = v?.lang || "zh-TW";
    u.rate = rateRef.current;
    u.pitch = 1.05;
    u.onend = () => {
      if (playingIdRef.current === id) setPlayingId(null);
    };
    u.onerror = u.onend;
    setPlayingId(id);
    synth.speak(u);
  }, []);

  // 自然版：mp3，失敗自動退回系統版
  const playMp3 = React.useCallback(
    (url: string, id: string, fallbackText: string) => {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audioRef.current = audio;
      }
      let fellBack = false;
      const fallback = () => {
        if (fellBack) return;
        fellBack = true;
        speak(fallbackText, id);
      };
      audio.src = url;
      audio.playbackRate = rateRef.current;
      audio.onended = () => {
        if (playingIdRef.current === id) setPlayingId(null);
      };
      audio.onerror = fallback;
      setPlayingId(id);
      audio.play().catch(fallback);
    },
    [speak],
  );

  const isNaturalAvailable = React.useCallback(
    (unitId: string, key: NarrationKey) =>
      Boolean(manifest[unitId]?.includes(key)),
    [manifest],
  );

  const play = React.useCallback(
    ({ id, unitId, sectionKey, text }: PlayArgs) => {
      if (playingIdRef.current === id) {
        stop();
        return;
      }
      stop();
      const natural =
        useNaturalRef.current &&
        Boolean(manifestRef.current[unitId]?.includes(sectionKey));
      if (natural) {
        playMp3(assetUrl(`/audio/${unitId}/${sectionKey}.mp3`), id, text);
      } else {
        speak(text, id);
      }
    },
    [stop, speak, playMp3],
  );

  const preview = React.useCallback(
    (text: string) => {
      if (playingIdRef.current === "__preview__") {
        stop();
        return;
      }
      stop();
      speak(text, "__preview__");
    },
    [stop, speak],
  );

  const setVoiceURI = React.useCallback((uri: string) => {
    setVoiceURIState(uri);
    try {
      window.localStorage.setItem(LS_VOICE, uri);
    } catch {
      /* 忽略 */
    }
  }, []);

  const setRate = React.useCallback((r: number) => {
    const clamped = Math.min(1.4, Math.max(0.6, r));
    setRateState(clamped);
    try {
      window.localStorage.setItem(LS_RATE, String(clamped));
    } catch {
      /* 忽略 */
    }
  }, []);

  const setUseNatural = React.useCallback(
    (v: boolean) => {
      setUseNaturalState(v);
      try {
        window.localStorage.setItem(LS_NATURAL, v ? "1" : "0");
      } catch {
        /* 忽略 */
      }
      stop();
    },
    [stop],
  );

  const hasAnyNatural = React.useMemo(
    () => Object.values(manifest).some((arr) => arr.length > 0),
    [manifest],
  );

  // 離開頁面時把聲音停掉
  React.useEffect(() => stop, [stop]);

  const value: VoiceContextValue = {
    ttsSupported,
    voices,
    voiceURI,
    setVoiceURI,
    rate,
    setRate,
    useNatural,
    setUseNatural,
    hasAnyNatural,
    isNaturalAvailable,
    playingId,
    play,
    stop,
    preview,
  };

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
}

export function useVoice(): VoiceContextValue {
  const ctx = React.useContext(VoiceContext);
  if (!ctx) {
    throw new Error("useVoice 必須在 <VoiceProvider> 之內使用");
  }
  return ctx;
}
