"use client";

// 場景 6-3「改變中的原住民社會」的 3D 佈景。
// 西（x≈-7）：平埔村（水田＋契約桌）；中：遷徙隊伍走向東方群山的隘口；
// 東（x≈7）：埔里盆地（群山環抱）與東海岸（大港口紀念碑＋開路工程）。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Field,
  Hut,
  Person,
  PineTree,
  Rock,
  Smoke,
} from "./primitives";
import {
  DriftingClouds,
  Flower,
  GrassTuft,
  SceneLights,
  Seabirds,
  SkyDome,
  StylizedWater,
} from "./environment";

/* 走路的遷徙隊伍：沿路緩慢前進（循環） */
function MigrationLine() {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = (clock.elapsedTime * 0.18) % 6;
    g.current.position.x = -2 + t;
    g.current.position.z = 0.5 - t * 0.25;
  });
  return (
    <group ref={g}>
      <Person position={[0, 0, 0]} color="#a04a38" rotation={-1.4} hat="band" hatColor="#c0392b" scale={0.9} />
      <Person position={[-0.8, 0, 0.3]} color="#b0503c" rotation={-1.4} scale={0.82} />
      <Person position={[-1.5, 0, 0.1]} color="#96633a" rotation={-1.5} scale={0.75} />
      <Person position={[-2.1, 0, 0.4]} color="#8a3d2e" rotation={-1.4} hat="band" hatColor="#e8c33d" scale={0.85} />
      {/* 挑擔（扁擔＋兩簍家當） */}
      <mesh position={[-0.8, 0.75, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 5]} />
        <meshStandardMaterial color="#8a6238" />
      </mesh>
      {[-0.42, 0.42].map((o, i) => (
        <mesh key={i} position={[-0.8 + o, 0.5, 0.3]} castShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.2, 8]} />
          <meshStandardMaterial color="#c9a06a" />
        </mesh>
      ))}
    </group>
  );
}

export function PingpuDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#e0ddd0"]} />
      <fog attach="fog" args={["#e0ddd0", 34, 80]} />
      {/* 黃昏微光：告別的氛圍 */}
      <SkyDome top="#8f9fc9" horizon="#f2e3c8" below="#8a7a5c" sunDir={[-0.5, 0.25, 0.35]} sunGlow="#ffd9a3" />
      <SceneLights sun={[-13, 14, 8]} sunColor="#ffd9a8" intensity={1.1} shadowSize={26} groundColor="#6a5d42" />
      <DriftingClouds count={4} />
      <Seabirds center={[3, 0, -2]} count={2} radius={10} height={7.5} />

      {/* ── 大地 ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[20, 21, 0.5, 36]} />
        <meshStandardMaterial color="#9cb56e" />
      </mesh>

      {/* ── 東側群山（埔里盆地：兩排山夾一塊平地） ── */}
      {[
        [5.5, -5, 4.2],
        [8.5, -6.5, 5],
        [11.5, -4.5, 4],
        [5.5, 3.5, 4],
        [8.5, 5, 4.6],
        [11.5, 3, 3.8],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[2.8, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}
      {/* 埔里盆地（山間新家：小村） */}
      <group position={[8.5, 0, -0.8]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.6, 18]} />
          <meshStandardMaterial color="#a8c47a" />
        </mesh>
        <Hut position={[-0.8, 0, -0.6]} scale={0.6} rotation={0.4} />
        <Hut position={[0.6, 0, 0.4]} scale={0.5} rotation={-0.5} />
        <Smoke position={[-0.8, 0.8, -0.6]} scale={0.5} />
        <Person position={[0.2, 0, -1]} color="#a04a38" rotation={2.6} hat="band" hatColor="#c0392b" scale={0.75} />
      </group>

      {/* ── 西：平埔村（水田＋契約桌） ── */}
      <group position={[-7.5, 0, 0.5]}>
        <Hut position={[-1.2, 0, -1.8]} scale={0.85} rotation={0.4} />
        <Hut position={[0.6, 0, -2.4]} scale={0.7} rotation={-0.4} />
        {/* 水田（帶水光的田） */}
        <group position={[-0.6, 0, 0.8]}>
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[2.6, 0.1, 1.9]} />
            <meshStandardMaterial color="#7a5c39" />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.3, 1.6]} />
            <meshStandardMaterial color="#8fd4de" transparent opacity={0.85} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[-0.9 + (i % 4) * 0.6, 0.2, -0.4 + Math.floor(i / 4) * 0.8]} castShadow>
              <coneGeometry args={[0.06, 0.28, 5]} />
              <meshStandardMaterial color="#5d9b4e" />
            </mesh>
          ))}
        </group>
        {/* 插秧的人 */}
        <Person position={[0.8, 0, 1.4]} color="#96633a" rotation={-0.8} hat="straw" scale={0.82} />
        {/* 土地契約桌（漢人商人＋平埔族） */}
        <group position={[2, 0, -0.6]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
          <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0.25]}>
            <planeGeometry args={[0.46, 0.34]} />
            <meshStandardMaterial color="#f7f1e3" />
          </mesh>
          <Person position={[-0.6, 0, 0.6]} color="#5c7d9e" rotation={0.6} hat="straw" scale={0.85} />
          <Person position={[0.7, 0, 0.6]} color="#a04a38" rotation={-0.6} hat="band" hatColor="#e8c33d" scale={0.85} />
        </group>
      </group>

      {/* ── 中：遷徙之路（蜿蜒小徑＋行走的隊伍） ── */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[-3.5 + i * 1.15, 0.02, 1 - i * 0.28]}
          rotation={[-Math.PI / 2, 0, i * 0.8]}
        >
          <circleGeometry args={[0.34, 8]} />
          <meshStandardMaterial color="#b8a684" />
        </mesh>
      ))}
      <MigrationLine />
      {/* 回望的老人（隊伍後方，面向西邊老家） */}
      <Person position={[-4.4, 0, 1.4]} color="#8a5a35" rotation={1.6} hat="band" hatColor="#c0392b" scale={0.8} />

      {/* ── 東南：東海岸與大港口 ── */}
      <StylizedWater position={[14, -0.15, 9]} radius={16} shallow="#49b7d6" deep="#2c83b3" />
      <group position={[9.5, 0, 7]}>
        {/* 開路工程（碎石＋十字鎬工人） */}
        {[0, 1, 2].map((i) => (
          <Rock key={i} position={[-1.2 + i * 0.8, 0.1, 0.4 - i * 0.3]} scale={0.5} color="#8f8271" />
        ))}
        <Person position={[-1.8, 0, 1.2]} color="#3f5d8a" rotation={-0.8} hat="cone" hatColor="#2b2118" scale={0.85} />
        {/* 大港口紀念碑 */}
        <group position={[1.8, 0, 0.6]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.8, 0.24, 0.6]} />
            <meshStandardMaterial color="#8d8478" />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.34, 1.25, 0.22]} />
            <meshStandardMaterial color="#5c6470" />
          </mesh>
          {/* 獻花 */}
          <Flower position={[0.35, 0.24, 0.25]} color="#ffffff" />
          <Flower position={[-0.3, 0.24, 0.3]} color="#ffd34d" scale={0.9} />
        </group>
      </group>

      {/* 點綴 */}
      <PineTree position={[-10, 0, -3]} height={1.9} />
      <PineTree position={[-4, 0, -4.5]} height={1.6} />
      <PineTree position={[2, 0, 5.5]} height={1.5} />
      <GrassTuft position={[-2.5, 0, 3.5]} />
      <GrassTuft position={[4.5, 0, 2.8]} scale={1.1} />
      <Flower position={[-5.8, 0, 3.6]} color="#c58fff" />
    </group>
  );
}
