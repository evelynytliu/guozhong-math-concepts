"use client";

// 場景 5-1「水圳與良田」的 3D 佈景：一座正在被水圳餵飽的山谷。
// 西（x≈-6）：拓墾營地（墾照桌）；中央：大水圳分四道閘門（四大圳）；
// 東（x≈7）：豐收稻田與穀倉；水車會轉、水面會流動。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  Field,
  Flag,
  Hut,
  Person,
  PineTree,
  Rock,
} from "./primitives";
import {
  DriftingClouds,
  Flower,
  GrassTuft,
  SceneLights,
  Seabirds,
  SkyDome,
} from "./environment";

/* 流動的水道（貼圖動畫感：兩層錯位波紋帶） */
function Canal({
  from,
  to,
  width = 0.8,
}: {
  from: [number, number];
  to: [number, number];
  width?: number;
}) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const angle = Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.06, (from[1] + to[1]) / 2];
  const ripple = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ripple.current)
      (ripple.current.material as THREE.MeshStandardMaterial).opacity =
        0.35 + Math.sin(clock.elapsedTime * 2.5 + from[0]) * 0.15;
  });
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, width]} />
        <meshStandardMaterial color="#49b7d6" />
      </mesh>
      <mesh ref={ripple} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[len * 0.96, width * 0.5]} />
        <meshStandardMaterial color="#a8e4f0" transparent opacity={0.4} />
      </mesh>
      {/* 圳岸 */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.06, (s * (width + 0.18)) / 2]}>
          <boxGeometry args={[len, 0.16, 0.18]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
      ))}
    </group>
  );
}

/* 會轉的水車 */
function WaterWheel({ position }: { position: [number, number, number] }) {
  const wheel = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wheel.current) wheel.current.rotation.z = -clock.elapsedTime * 0.7;
  });
  return (
    <group position={position}>
      {[-0.3, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.9, z]} castShadow>
          <boxGeometry args={[0.1, 1.5, 0.08]} />
          <meshStandardMaterial color="#6d4a2a" />
        </mesh>
      ))}
      <group ref={wheel} position={[0, 1, 0]}>
        {/* 輪圈與輻條同在 XY 平面（torus 預設面向 +Z，跟輻條一致） */}
        <mesh>
          <torusGeometry args={[0.75, 0.07, 8, 20]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} castShadow>
            <boxGeometry args={[1.5, 0.09, 0.26]} />
            <meshStandardMaterial color="#93765a" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* 水閘門（每道代表一條圳，插一面色旗） */
function SluiceGate({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0]} castShadow>
          <boxGeometry args={[0.16, 1, 0.2]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.15, 0.16, 0.22]} />
        <meshStandardMaterial color="#7d6248" />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.85, 0.5, 0.08]} />
        <meshStandardMaterial color="#a5854a" />
      </mesh>
      <Flag position={[0.65, 0, 0]} color={color} height={1.5} />
    </group>
  );
}

export function WaterDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#d5ecdf"]} />
      <fog attach="fog" args={["#d5ecdf", 34, 80]} />
      <SkyDome top="#5aa4d9" horizon="#e6f5ea" below="#6fae62" sunDir={[-0.42, 0.38, 0.42]} sunGlow="#fff0b8" />
      <SceneLights sun={[-11, 18, 10]} shadowSize={26} groundColor="#4a5d3f" />
      <DriftingClouds count={5} />
      <Seabirds center={[2, 0, 0]} count={3} radius={10} height={7.5} />

      {/* ── 谷地 ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[19, 20, 0.5, 36]} />
        <meshStandardMaterial color="#8fbf70" />
      </mesh>
      {/* 北面山（水源） */}
      {[
        [-6, -11, 5],
        [0, -12.5, 6],
        [6, -11, 5.2],
        [-11, -8, 3.8],
        [11, -8, 4],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[3.6, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}
      {/* 山腳蓄水潭 */}
      <mesh position={[0, 0.03, -7]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 20]} />
        <meshStandardMaterial color="#49b7d6" />
      </mesh>

      {/* ── 主圳：從山潭往南，分出四條支圳 ── */}
      <Canal from={[0, -6.5]} to={[0, -1.5]} width={1} />
      <Canal from={[0, -1.5]} to={[-5, 1.5]} />
      <Canal from={[0, -1.5]} to={[-1.6, 2.2]} />
      <Canal from={[0, -1.5]} to={[2.4, 2]} />
      <Canal from={[0, -1.5]} to={[6, 1]} />
      {/* 四道閘門＝四大圳（顏色對應熱點順序） */}
      <SluiceGate position={[-2.6, 0, -0.4]} color="#3f6fae" />
      <SluiceGate position={[-0.4, 0, -1]} color="#3f8f52" />
      <SluiceGate position={[1.8, 0, -0.6]} color="#e8c33d" />
      <SluiceGate position={[4, 0, 0]} color="#b3452f" />
      <WaterWheel position={[0, 0, -3.6]} />

      {/* ── 西：拓墾營地（墾照桌＋合資夥伴） ── */}
      <group position={[-6.5, 0, 3]}>
        <Hut position={[-1.2, 0, -0.8]} scale={0.8} rotation={0.5} />
        {/* 墾照桌 */}
        <mesh position={[0.4, 0.45, 0.4]} castShadow>
          <boxGeometry args={[1.2, 0.08, 0.8]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
        <mesh position={[0.4, 0.52, 0.4]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.5, 0.36]} />
          <meshStandardMaterial color="#f7f1e3" />
        </mesh>
        {/* 三位合資夥伴圍桌 */}
        <Person position={[-0.3, 0, 1.2]} color="#5c7d9e" rotation={-0.4} hat="straw" scale={0.85} />
        <Person position={[1.1, 0, 1]} color="#8f5c33" rotation={-0.9} scale={0.85} />
        <Person position={[0.4, 0, -0.5]} color="#a04a38" rotation={Math.PI} hat="band" hatColor="#e8c33d" scale={0.85} />
        <Crates position={[-2.2, 0, 1.2]} scale={0.7} />
        <Rock position={[2, 0.1, -1.4]} scale={0.6} />
      </group>

      {/* ── 東：豐收稻田區＋穀倉 ── */}
      <group position={[7, 0, 3]}>
        <Field position={[-1.2, 0, 0]} />
        <Field position={[1.6, 0, 0.8]} />
        <Field position={[0.2, 0, 2.2]} />
        {/* 穀倉 */}
        <group position={[3.6, 0, -0.8]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.8, 1.1, 10]} />
            <meshStandardMaterial color="#d9b36c" />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <coneGeometry args={[0.95, 0.6, 10]} />
            <meshStandardMaterial color="#9a7b3f" flatShading />
          </mesh>
        </group>
        {/* 米袋堆 */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[2.6 + (i % 2) * 0.4, 0.2 + Math.floor(i / 2) * 0.32, 1.6]} scale={[1, 0.75, 1]} castShadow>
            <sphereGeometry args={[0.24, 10, 8]} />
            <meshStandardMaterial color="#e8d9ab" />
          </mesh>
        ))}
        <Person position={[-0.4, 0, 1.2]} color="#8f5c33" rotation={2.4} hat="straw" scale={0.85} />
        <Person position={[2, 0, 2.4]} color="#a9713f" rotation={-1} hat="straw" scale={0.9} />
      </group>

      {/* 點綴 */}
      <PineTree position={[-9.5, 0, -1]} height={1.8} />
      <PineTree position={[9.5, 0, -2.5]} height={1.6} />
      <GrassTuft position={[-3, 0, 5]} />
      <GrassTuft position={[4, 0, 4.6]} scale={1.2} />
      <Flower position={[-1.6, 0, 4.2]} color="#ff8fb3" />
      <Flower position={[6, 0, 5]} color="#ffd34d" />
      <Flower position={[1, 0, 5.4]} color="#c58fff" />
    </group>
  );
}
