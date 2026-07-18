"use client";

// 場景 6-1「移墾江湖」的 3D 佈景。
// 西閩村與東粵村隔著隘門牆對峙（中央）；北（z≈-6）：官府與民變旗海；
// 南（z≈6）：廟宇街（開漳聖王/三山國王/媽祖廟/有應公）；東（x≈8）：書院與進士第。

import * as React from "react";
import {
  Campfire,
  Crates,
  Field,
  Flag,
  Gate,
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
  Torch,
} from "./environment";

/* 閩南紅磚小廟（可調色） */
function Temple({
  position,
  color = "#b3452f",
  roof = "#d98035",
  size = 1,
}: {
  position: [number, number, number];
  color?: string;
  roof?: string;
  size?: number;
}) {
  return (
    <group position={position} scale={size}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[1.7, 0.16, 1.3]} />
        <meshStandardMaterial color="#cbb896" />
      </mesh>
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[1.3, 0.7, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 翹脊雙層屋頂 */}
      <mesh position={[0, 0.98, -0.1]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.15, 0.35, 4]} />
        <meshStandardMaterial color={roof} flatShading />
      </mesh>
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={i} position={[x, 1.06, -0.1]} rotation={[0, 0, i === 0 ? 0.55 : -0.55]} castShadow>
          <boxGeometry args={[0.28, 0.08, 0.5]} />
          <meshStandardMaterial color={roof} />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 0.36]}>
        <boxGeometry args={[0.32, 0.44, 0.05]} />
        <meshStandardMaterial color="#5a3220" />
      </mesh>
      {/* 香爐 */}
      <mesh position={[0, 0.22, 0.75]} castShadow>
        <cylinderGeometry args={[0.14, 0.11, 0.18, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* 村落（幾間屋＋旗） */
function Village({
  position,
  flagColor,
  tone = "#d9cbb0",
}: {
  position: [number, number, number];
  flagColor: string;
  tone?: string;
}) {
  return (
    <group position={position}>
      {[
        [0, 0, 0.9],
        [1.3, 0.5, 0.75],
        [-0.9, 0.9, 0.8],
      ].map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.9, 0.7, 0.75]} />
            <meshStandardMaterial color={tone} />
          </mesh>
          <mesh position={[0, 0.82, 0]} castShadow>
            <boxGeometry args={[1, 0.12, 0.85]} />
            <meshStandardMaterial color="#8f4f33" />
          </mesh>
          <mesh position={[0, 0.94, 0]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 1, 3]} />
            <meshStandardMaterial color="#8f4f33" />
          </mesh>
        </group>
      ))}
      <Flag position={[0.6, 0, -0.6]} color={flagColor} height={1.6} />
      <Field position={[-0.4, 0, 2.6]} />
    </group>
  );
}

export function FrontierDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#e3dcc8"]} />
      <fog attach="fog" args={["#e3dcc8", 34, 80]} />
      <SkyDome top="#7fa8cf" horizon="#f0e8d0" below="#8a7a5c" sunDir={[-0.45, 0.3, 0.4]} sunGlow="#ffdf9e" />
      <SceneLights sun={[-12, 16, 9]} sunColor="#ffe3b8" intensity={1.2} shadowSize={26} groundColor="#6a5d42" />
      <DriftingClouds count={4} />
      <Seabirds center={[0, 0, 0]} count={2} radius={10} height={7} />

      {/* ── 大地 ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[20, 21, 0.5, 36]} />
        <meshStandardMaterial color="#9cb56e" />
      </mesh>
      {/* 遠山 */}
      {[
        [-13, -10, 3.6],
        [-5, -13, 4.4],
        [4, -13.5, 4],
        [12, -11, 3.4],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[3.4, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}

      {/* ── 西：閩村 vs 東：粵村，中間隘門牆 ── */}
      <Village position={[-6, 0, -1]} flagColor="#c0392b" />
      <Village position={[2.4, 0, -1]} flagColor="#3f6fae" tone="#cfc4a4" />
      {/* 隘門：磚牆＋門洞 */}
      <group position={[-2, 0, -0.5]}>
        {[-1.6, 1.6].map((z, i) => (
          <mesh key={i} position={[0, 0.6, z]} castShadow>
            <boxGeometry args={[0.4, 1.2, 2.4]} />
            <meshStandardMaterial color="#a5674a" />
          </mesh>
        ))}
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 1.6]} />
          <meshStandardMaterial color="#8f4f33" />
        </mesh>
        <mesh position={[0, 1.62, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.9, 3]} />
          <meshStandardMaterial color="#7a4230" />
        </mesh>
      </group>
      {/* 對峙的兩幫人（拿鋤頭扁擔） */}
      <Person position={[-3.8, 0, 0.8]} color="#a04a38" rotation={1.4} hat="straw" scale={0.9} />
      <Person position={[-4.6, 0, 1.6]} color="#b0503c" rotation={1.2} scale={0.85} />
      <Person position={[-0.4, 0, 0.9]} color="#3f5d8a" rotation={-1.5} hat="straw" scale={0.9} />
      <Person position={[0.4, 0, 1.7]} color="#4a6b8a" rotation={-1.3} scale={0.85} />
      <mesh position={[-4.1, 0.7, 1.1]} rotation={[0.2, 0, 1]}>
        <cylinderGeometry args={[0.02, 0.025, 1, 5]} />
        <meshStandardMaterial color="#8a6238" />
      </mesh>
      <mesh position={[0, 0.7, 1.3]} rotation={[0.2, 0, -1]}>
        <cylinderGeometry args={[0.02, 0.025, 1, 5]} />
        <meshStandardMaterial color="#8a6238" />
      </mesh>

      {/* ── 北：官府與民變 ── */}
      <group position={[0, 0, -6.5]}>
        {/* 官府（衙門） */}
        <group position={[-2.6, 0, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[2, 1.1, 1.2]} />
            <meshStandardMaterial color="#8a8f94" />
          </mesh>
          <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.7, 0.55, 4]} />
            <meshStandardMaterial color="#3d3a36" flatShading />
          </mesh>
          <mesh position={[0, 0.4, 0.62]}>
            <boxGeometry args={[0.44, 0.6, 0.05]} />
            <meshStandardMaterial color="#5a3220" />
          </mesh>
          <Person position={[0.9, 0, 0.9]} color="#3f5d8a" rotation={-2.4} hat="cone" hatColor="#2b2118" scale={0.9} />
        </group>
        {/* 民變軍：義旗與火把 */}
        <group position={[2.6, 0, 0.4]}>
          <Flag position={[0, 0, 0]} color="#c0392b" stripe="#e8c33d" height={1.8} />
          <Flag position={[1.2, 0, 0.8]} color="#e8c33d" height={1.4} />
          <Torch position={[-0.8, 0, 0.6]} scale={0.9} />
          <Person position={[0.4, 0, 1.2]} color="#8f5c33" rotation={-2} scale={0.9} />
          <Person position={[1.4, 0, 1.8]} color="#a9713f" rotation={-2.2} hat="band" hatColor="#c0392b" scale={0.85} />
          <Person position={[-0.6, 0, 1.6]} color="#7d6248" rotation={-1.8} scale={0.82} />
          <Campfire position={[0.4, 0, 2.8]} scale={0.7} />
        </group>
        {/* 紀功碑（赤崁樓前的乾隆碑意象） */}
        <group position={[5.4, 0, 0.6]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.2, 0.5]} />
            <meshStandardMaterial color="#8d8478" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[0.5, 1.1, 0.16]} />
            <meshStandardMaterial color="#c3b294" />
          </mesh>
        </group>
      </group>

      {/* ── 南：廟宇街 ── */}
      <group position={[0, 0, 6]}>
        <Temple position={[-3.2, 0, 0]} color="#b3452f" roof="#d98035" />
        <Temple position={[0, 0, 0.6]} color="#8a4a86" roof="#c9a227" size={0.85} />
        <Temple position={[2.8, 0, 0]} color="#3f6fae" roof="#8f4f33" size={0.85} />
        {/* 有應公小祠 */}
        <group position={[5, 0, 0.8]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.5]} />
            <meshStandardMaterial color="#93765a" />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.55, 0.3, 4]} />
            <meshStandardMaterial color="#6d4a2a" flatShading />
          </mesh>
          <Torch position={[0.6, 0, 0.4]} scale={0.7} />
        </group>
        {/* 進香的人們 */}
        <Person position={[-2.4, 0, 1.6]} color="#c9793f" rotation={Math.PI} hat="straw" scale={0.85} />
        <Person position={[0.6, 0, 2]} color="#6b4a86" rotation={Math.PI} scale={0.8} />
        <Person position={[3.2, 0, 1.8]} color="#4a7fae" rotation={Math.PI} scale={0.82} />
      </group>

      {/* ── 東：書院與進士第 ── */}
      <group position={[8, 0, 1]}>
        <Gate position={[0, 0, 1.6]} color="#c05a3a" scale={0.55} />
        <group position={[0, 0, -0.4]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.8, 1, 1.1]} />
            <meshStandardMaterial color="#d9cbb0" />
          </mesh>
          <mesh position={[0, 1.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.5, 0.5, 4]} />
            <meshStandardMaterial color="#8f4f33" flatShading />
          </mesh>
          {/* 匾額 */}
          <mesh position={[0, 0.82, 0.57]}>
            <boxGeometry args={[0.6, 0.22, 0.04]} />
            <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.3} />
          </mesh>
        </group>
        {/* 讀書人 */}
        <Person position={[-0.8, 0, 0.9]} color="#4a6b8a" rotation={0.4} hat="cone" hatColor="#2b2118" scale={0.85} />
        <Person position={[0.6, 0, 1.1]} color="#5c7d9e" scale={0.6} />
        <Crates position={[1.6, 0, -0.9]} scale={0.6} />
      </group>

      {/* 點綴 */}
      <PineTree position={[-9, 0, 3]} height={1.7} />
      <PineTree position={[9.5, 0, -3]} height={1.5} />
      <Rock position={[6.4, 0.1, 4.2]} scale={0.7} />
      <GrassTuft position={[-2, 0, 3.6]} />
      <Flower position={[4, 0, 3.8]} color="#ff8fb3" />
      <Flower position={[-6.5, 0, 2.6]} color="#ffd34d" />
    </group>
  );
}
