"use client";

// 歷史 3D 場景的 Canvas 外殼：
// - CameraRig：鏡頭平滑飛到每一幕指定的位置（資料檔的 camera）
// - Hotspot：名詞卡熱點（drei 的 Html 錨在 3D 座標上，DOM 按鈕、中文清晰可點）
// - DIORAMAS：場景 id → 3D 佈景元件 的註冊表（加新場景要在這裡掛）

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { HistoryScene, HistoryTerm, StageCamera } from "@/content/history/types";
import { CaveDiorama } from "./three/cave-diorama";
import { AustronesianDiorama } from "./three/austronesian-diorama";
import { SailDiorama } from "./three/sail-diorama";
import { FortsDiorama } from "./three/forts-diorama";
import { KoxingaDiorama } from "./three/koxinga-diorama";

const DIORAMAS: Record<
  string,
  React.ComponentType<{ stageIndex: number }>
> = {
  "s1-cave": CaveDiorama,
  "s1-austronesian": AustronesianDiorama,
  "s2-age-of-sail": SailDiorama,
  "s2-two-forts": FortsDiorama,
  "s2-koxinga": KoxingaDiorama,
};

/* 鏡頭平滑飛行：往目標位置與注視點做指數趨近 */
function CameraRig({ cam }: { cam: StageCamera }) {
  const look = React.useRef(new THREE.Vector3(...cam.look));
  const destPos = React.useMemo(() => new THREE.Vector3(...cam.pos), [cam]);
  const destLook = React.useMemo(() => new THREE.Vector3(...cam.look), [cam]);
  useFrame(({ camera }, delta) => {
    const k = 1 - Math.exp(-2.2 * delta);
    camera.position.lerp(destPos, k);
    look.current.lerp(destLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

/* 名詞卡熱點：發光小圓鈕，點了翻卡；收集後變成打勾 */
function Hotspot({
  term,
  collected,
  onClick,
}: {
  term: HistoryTerm;
  collected: boolean;
  onClick: () => void;
}) {
  return (
    <Html position={term.pos} center zIndexRange={[40, 0]}>
      <button
        onClick={onClick}
        className={
          "group relative flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-2.5 py-1 text-sm font-bold shadow-lg transition-transform hover:scale-110 " +
          (collected
            ? "border-emerald-400 bg-emerald-50/95 text-emerald-700"
            : "border-amber-400 bg-white/95 text-stone-800")
        }
        style={{ backdropFilter: "blur(2px)" }}
      >
        {!collected && (
          <span
            aria-hidden
            className="absolute -inset-1.5 -z-10 animate-ping rounded-full bg-amber-400/40"
            style={{ animationDuration: "1.6s" }}
          />
        )}
        <span className="text-base">{collected ? "✅" : term.emoji}</span>
        <span>{term.term}</span>
      </button>
    </Html>
  );
}

export function SceneCanvas({
  scene,
  stageIndex,
  collected,
  onHotspot,
}: {
  scene: HistoryScene;
  stageIndex: number;
  collected: string[];
  onHotspot: (term: HistoryTerm) => void;
}) {
  const Diorama = DIORAMAS[scene.id];
  const stage = scene.stages[stageIndex];
  if (!Diorama || !stage) return null;
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: scene.stages[0].camera.pos, fov: 50, near: 0.1, far: 200 }}
      style={{ touchAction: "none" }}
    >
      <CameraRig cam={stage.camera} />
      <Diorama stageIndex={stageIndex} />
      {stage.terms.map((t) => (
        <Hotspot
          key={t.id}
          term={t}
          collected={collected.includes(t.id)}
          onClick={() => onHotspot(t)}
        />
      ))}
    </Canvas>
  );
}
