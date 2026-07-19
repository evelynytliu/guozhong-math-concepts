"use client";

// 歷史 3D 場景的 Canvas 外殼：
// - CameraRig：鏡頭平滑飛到每一幕指定的位置（資料檔的 camera）
// - Hotspot：名詞卡熱點（drei 的 Html 錨在 3D 座標上，DOM 按鈕、中文清晰可點）
// - DIORAMAS：場景 id → 3D 佈景元件 的註冊表（加新場景要在這裡掛）

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Html } from "@react-three/drei";
import * as THREE from "three";
import type { HistoryScene, HistoryTerm, StageCamera } from "@/content/history/types";
import { ThreeWDiorama } from "./three/threew-diorama";
import { CaveDiorama } from "./three/cave-diorama";
import { AustronesianDiorama } from "./three/austronesian-diorama";
import { SailDiorama } from "./three/sail-diorama";
import { FortsDiorama } from "./three/forts-diorama";
import { KoxingaDiorama } from "./three/koxinga-diorama";
import { ChurchDiorama } from "./three/church-diorama";
import { ConflictDiorama } from "./three/conflict-diorama";
import { CrossingDiorama } from "./three/crossing-diorama";
import { ReformDiorama } from "./three/reform-diorama";
import { WaterDiorama } from "./three/water-diorama";
import { PortsDiorama } from "./three/ports-diorama";
import { TradeDiorama } from "./three/trade-diorama";
import { FrontierDiorama } from "./three/frontier-diorama";
import { MackayDiorama } from "./three/mackay-diorama";
import { PingpuDiorama } from "./three/pingpu-diorama";
import { PostFX } from "./three/fx";

const DIORAMAS: Record<
  string,
  React.ComponentType<{ stageIndex: number }>
> = {
  "s0-three-w": ThreeWDiorama,
  "s1-cave": CaveDiorama,
  "s1-austronesian": AustronesianDiorama,
  "s2-age-of-sail": SailDiorama,
  "s2-two-forts": FortsDiorama,
  "s2-koxinga": KoxingaDiorama,
  "s3-church": ChurchDiorama,
  "s3-conflict": ConflictDiorama,
  "s4-crossing": CrossingDiorama,
  "s4-reform": ReformDiorama,
  "s5-water": WaterDiorama,
  "s5-ports": PortsDiorama,
  "s5-trade": TradeDiorama,
  "s6-frontier": FrontierDiorama,
  "s6-mackay": MackayDiorama,
  "s6-pingpu": PingpuDiorama,
};

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/* 鏡頭平滑飛行：往目標位置與注視點做指數趨近，
   到定點後帶一點極輕微的漂浮晃動（遊戲鏡頭的「呼吸感」）。
   另支援「抓著轉」：滑鼠/手指按住拖曳 → 繞注視點加上偏航/俯仰偏移，
   放開後偏移量以彈簧感緩緩歸零、回到原本設定的構圖。 */
function CameraRig({ cam }: { cam: StageCamera }) {
  const { gl } = useThree();
  const look = React.useRef(new THREE.Vector3(...cam.look));
  const pos = React.useRef<THREE.Vector3 | null>(null);
  const destPos = React.useMemo(() => new THREE.Vector3(...cam.pos), [cam]);
  const destLook = React.useMemo(() => new THREE.Vector3(...cam.look), [cam]);
  // 使用者拖曳出來的視角偏移（偏航/俯仰）
  const orbit = React.useRef({ yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 });

  React.useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      orbit.current.dragging = true;
      orbit.current.x = e.clientX;
      orbit.current.y = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const o = orbit.current;
      if (!o.dragging) return;
      const dx = e.clientX - o.x;
      const dy = e.clientY - o.y;
      o.x = e.clientX;
      o.y = e.clientY;
      o.yaw = clamp(o.yaw - dx * 0.006, -2.4, 2.4);
      o.pitch = clamp(o.pitch - dy * 0.0045, -0.9, 0.55);
    };
    const up = () => {
      orbit.current.dragging = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame(({ camera, clock }, delta) => {
    if (!pos.current) pos.current = camera.position.clone();
    const k = 1 - Math.exp(-2.2 * delta);
    pos.current.lerp(destPos, k);
    look.current.lerp(destLook, k);
    const o = orbit.current;
    // 放開後：偏移量緩緩歸零（自動回到原本構圖）
    if (!o.dragging) {
      const back = 1 - Math.exp(-3 * delta);
      o.yaw += (0 - o.yaw) * back;
      o.pitch += (0 - o.pitch) * back;
    }
    const t = clock.elapsedTime;
    const base = new THREE.Vector3(
      pos.current.x + Math.sin(t * 0.5) * 0.18,
      pos.current.y + Math.sin(t * 0.35 + 1.3) * 0.14,
      pos.current.z + Math.cos(t * 0.42) * 0.18,
    );
    // 以注視點為中心，套用拖曳偏移（球座標旋轉）
    const v = base.sub(look.current);
    const sph = new THREE.Spherical().setFromVector3(v);
    sph.theta += o.yaw;
    sph.phi = clamp(sph.phi + o.pitch, 0.15, 1.72);
    v.setFromSpherical(sph);
    camera.position.copy(look.current).add(v);
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
  // 低規模式：網址加 ?fx=0 可關閉後製特效（弱 GPU 的逃生口）
  const fxOff =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("fx") === "0";
  if (!Diorama || !stage) return null;
  return (
    <Canvas
      shadows
      dpr={[0.8, 1.5]}
      performance={{ min: 0.45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
      camera={{ position: scene.stages[0].camera.pos, fov: 48, near: 0.1, far: 300 }}
      style={{ touchAction: "none" }}
    >
      <AdaptiveDpr />
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
      {!fxOff && <PostFX />}
    </Canvas>
  );
}
