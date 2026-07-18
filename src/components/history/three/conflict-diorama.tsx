"use client";

// 場景 3-2「衝突與共存」的 3D 佈景。
// 東（x≈7）：鄭氏學堂與市街；中央：不斷外擴的軍屯田；
// 西（x≈-7）：大肚王的山丘部落（衝突前線）；遠山：管轄區外的自由部落。

import * as React from "react";
import {
  Campfire,
  Field,
  Flag,
  Gate,
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
} from "./environment";

/* 鄭氏學堂：紅牆黑瓦的小書院 */
function School({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[2.6, 0.16, 1.9]} />
        <meshStandardMaterial color="#cbb896" />
      </mesh>
      <mesh position={[0, 0.6, -0.2]} castShadow>
        <boxGeometry args={[2, 0.9, 1.1]} />
        <meshStandardMaterial color="#b3452f" />
      </mesh>
      <mesh position={[0, 1.25, -0.2]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.7, 0.5, 4]} />
        <meshStandardMaterial color="#4a3a30" />
      </mesh>
      <mesh position={[0, 0.45, 0.36]}>
        <boxGeometry args={[0.36, 0.5, 0.05]} />
        <meshStandardMaterial color="#5a3220" />
      </mesh>
      {/* 讀書的孩子們（原住民與漢人同堂） */}
      <Person position={[-0.7, 0, 0.9]} color="#a04a38" scale={0.55} hat="band" hatColor="#c0392b" />
      <Person position={[0, 0, 1.05]} color="#4a7fae" scale={0.55} />
      <Person position={[0.7, 0, 0.9]} color="#6b4a86" scale={0.55} />
      {/* 老師 */}
      <Person position={[0, 0, 0.2]} color="#4a6b8a" rotation={Math.PI} hat="cone" hatColor="#2b2118" scale={0.85} />
    </group>
  );
}

export function ConflictDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#d8e8dc"]} />
      <fog attach="fog" args={["#d8e8dc", 32, 78]} />
      <SkyDome top="#5aa4d9" horizon="#e3f0e6" below="#6fae62" sunDir={[-0.4, 0.36, 0.4]} sunGlow="#ffedb8" />
      <SceneLights sun={[-11, 17, 9]} shadowSize={24} groundColor="#4a5d3f" />
      <DriftingClouds count={5} />
      <Seabirds center={[0, 0, -2]} count={2} radius={10} height={7} />

      {/* ── 平原 ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[20, 21, 0.5, 36]} />
        <meshStandardMaterial color="#7fae62" />
      </mesh>

      {/* ── 遠山（管轄區外的自由部落：山上小聚落＋炊煙） ── */}
      {[
        [-13, -9, 4.5],
        [-7, -12, 5.5],
        [1, -13, 4.8],
        [9, -12, 5],
        [15, -8, 3.6],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[3.8, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}
      <group position={[-5.2, 2.6, -9.4]}>
        <Hut position={[0, 0, 0]} scale={0.5} />
        <Hut position={[0.8, -0.15, 0.4]} scale={0.4} rotation={1} />
        <Smoke position={[0, 0.6, 0]} scale={0.5} />
      </group>

      {/* ── 東：鄭氏學堂與市街 ── */}
      <group position={[7, 0, -1]}>
        <School position={[0, 0, -1]} />
        <Gate position={[0, 0, 1.8]} color="#b3452f" scale={0.5} />
        {/* 市街小屋 */}
        {[
          [2.4, 0.4],
          [3.2, -0.8],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.8, 0.6, 0.7]} />
              <meshStandardMaterial color="#d9cbb0" />
            </mesh>
            <mesh position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.62, 0.36, 4]} />
              <meshStandardMaterial color="#8f4f33" />
            </mesh>
          </group>
        ))}
        <Flag position={[-1.8, 0, 1.2]} color="#c0392b" height={1.3} />
        <PineTree position={[-2.6, 0, -2.2]} height={1.5} />
        <Flower position={[1.6, 0, 1.6]} color="#ff8fb3" />
      </group>

      {/* ── 中央：外擴的軍屯田（一路朝西推進） ── */}
      <group>
        <Field position={[2.2, 0, 1.2]} />
        <Field position={[0, 0, -0.8]} />
        <Field position={[-2.2, 0, 0.8]} />
        {/* 開墾前緣：士兵農夫拿鋤頭往西 */}
        <Person position={[-3.6, 0, 0.2]} color="#8f5c33" rotation={-1.5} hat="straw" scale={0.9} />
        <Person position={[-1, 0, 1.9]} color="#a9713f" rotation={-1.8} hat="straw" scale={0.85} />
        <Person position={[1.2, 0, -1.6]} color="#7d6248" rotation={2.2} scale={0.85} />
        {/* 鋤頭 */}
        <mesh position={[-3.9, 0.6, 0.4]} rotation={[0.3, 0, 0.9]}>
          <cylinderGeometry args={[0.02, 0.025, 0.9, 5]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
        {/* 被砍掉的樹樁（獵場消失的痕跡） */}
        {[
          [-4.6, 1.6],
          [-5.4, -0.6],
          [-3.8, -1.8],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.12, z]} castShadow>
            <cylinderGeometry args={[0.14, 0.18, 0.24, 8]} />
            <meshStandardMaterial color="#93765a" />
          </mesh>
        ))}
        <GrassTuft position={[3.6, 0, -0.4]} />
      </group>

      {/* ── 西：大肚王山丘部落（衝突前線） ── */}
      <group position={[-7.5, 0, -1]}>
        {/* 小丘 */}
        <mesh position={[0, 0.15, -1.5]} scale={[2.6, 0.8, 2]} receiveShadow>
          <sphereGeometry args={[1, 12, 9]} />
          <meshStandardMaterial color="#6fae62" />
        </mesh>
        <Hut position={[-0.6, 0.85, -1.8]} scale={0.7} rotation={0.4} />
        <Hut position={[0.8, 0.8, -2.2]} scale={0.6} rotation={-0.6} />
        <Campfire position={[0, 0.9, -1]} scale={0.6} />
        {/* 大肚王與戰士（面向東邊的屯田） */}
        <Person position={[0.6, 0.95, -0.4]} color="#8a3d2e" rotation={1.4} hat="band" hatColor="#e8c33d" />
        <Person position={[-0.8, 0.9, -0.6]} color="#a04a38" rotation={1.2} hat="band" hatColor="#c0392b" scale={0.9} />
        <Person position={[1.6, 0.4, 0.6]} color="#b0503c" rotation={1.6} scale={0.85} />
        {/* 長矛與盾 */}
        <mesh position={[0.9, 1.6, -0.3]} rotation={[0.2, 0, 0.9]}>
          <cylinderGeometry args={[0.02, 0.02, 1.4, 5]} />
          <meshStandardMaterial color="#7d6248" />
        </mesh>
        <mesh position={[-1.2, 0.9, 0.2]} rotation={[0.4, 0.6, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.06, 10]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
        <Rock position={[2.2, 0.15, 1.4]} scale={0.8} />
        <PineTree position={[-2.4, 0.2, 0.4]} height={1.8} />
        <PineTree position={[2.6, 0.1, -2.8]} height={1.5} />
      </group>
    </group>
  );
}
