"use client";

// 場景 6-2「馬偕與新事物」的 3D 佈景：淡水河港小鎮。
// 西（x≈-4）：教堂；中（x≈0）：拔牙診療攤（排隊人潮）；
// 東（x≈5）：牛津學堂（紅磚）＋女學堂；南（z≈6）：臺南看西街醫館一角。

import * as React from "react";
import {
  Crates,
  Flag,
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
  StylizedWater,
} from "./environment";

/* 白色小教堂（尖塔＋十字架） */
function Chapel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.4, 1.1, 2]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      <mesh position={[0, 1.32, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.05, 1.05, 2.1]} />
        <meshStandardMaterial color="#8a5a3f" />
      </mesh>
      <mesh position={[0, 1.9, 0.6]} castShadow>
        <boxGeometry args={[0.45, 1, 0.45]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      <mesh position={[0, 2.6, 0.6]} castShadow>
        <coneGeometry args={[0.4, 0.6, 4]} />
        <meshStandardMaterial color="#8a5a3f" />
      </mesh>
      <mesh position={[0, 3.1, 0.6]}>
        <boxGeometry args={[0.05, 0.36, 0.05]} />
        <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 3.02, 0.6]}>
        <boxGeometry args={[0.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 1.01]}>
        <boxGeometry args={[0.36, 0.6, 0.04]} />
        <meshStandardMaterial color="#5a3220" />
      </mesh>
      {/* 圓花窗 */}
      <mesh position={[0, 0.95, 1.02]}>
        <circleGeometry args={[0.16, 12]} />
        <meshStandardMaterial color="#7fb2d9" emissive="#4a7fae" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/* 紅磚學堂（牛津學堂風：紅磚＋白飾帶＋小尖飾） */
function OxfordCollege({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.6, 1.1, 1.4]} />
        <meshStandardMaterial color="#a5473a" />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[2.7, 0.08, 1.5]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[2.7, 0.5, 1.5]} />
        <meshStandardMaterial color="#8f4f33" />
      </mesh>
      {/* 屋脊小尖飾（中西合璧） */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x, 1.62, 0]} castShadow>
          <coneGeometry args={[0.09, 0.28, 6]} />
          <meshStandardMaterial color="#f2ede0" />
        </mesh>
      ))}
      {/* 拱窗一排 */}
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.72]}>
          <boxGeometry args={[0.26, 0.44, 0.03]} />
          <meshStandardMaterial color="#7fb2d9" emissive="#4a7fae" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function MackayDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#d9e6ec"]} />
      <fog attach="fog" args={["#d9e6ec", 32, 78]} />
      <SkyDome top="#5a9fd4" horizon="#e6f1f5" below="#2c83b3" sunDir={[0.42, 0.36, 0.42]} />
      <SceneLights sun={[10, 17, 9]} shadowSize={24} />
      <DriftingClouds count={5} />
      <Seabirds center={[-4, 0, -3]} count={3} radius={9} height={6.5} />

      {/* ── 淡水河（北側） ── */}
      <StylizedWater position={[0, -0.15, -9]} radius={30} shallow="#49b7d6" deep="#2c83b3" />

      {/* ── 河岸小鎮地面 ── */}
      <mesh position={[0, -0.06, 2]} receiveShadow>
        <boxGeometry args={[22, 0.6, 16]} />
        <meshStandardMaterial color="#e8d9ab" />
      </mesh>
      <mesh position={[0, 0, 2.4]} receiveShadow>
        <boxGeometry args={[21, 0.8, 15]} />
        <meshStandardMaterial color="#8fbf70" />
      </mesh>
      {/* 觀音山遠景 */}
      <mesh position={[-8, 0, -11]}>
        <coneGeometry args={[4.5, 3.6, 7]} />
        <meshStandardMaterial color="#4c8a55" flatShading />
      </mesh>
      {/* 碼頭與小船 */}
      <mesh position={[-1, 0.15, -4.6]} castShadow>
        <boxGeometry args={[2.4, 0.12, 1.6]} />
        <meshStandardMaterial color="#93765a" />
      </mesh>

      {/* ── 西：教堂 ── */}
      <Chapel position={[-4.5, 0.4, 0.5]} rotation={0.4} />
      <Person position={[-3.2, 0.4, 1.8]} color="#6b4a86" rotation={-0.8} scale={0.85} />

      {/* ── 中：馬偕的拔牙診療攤 ── */}
      <group position={[0.2, 0.4, 1.2]}>
        {/* 遮陽棚 */}
        {[
          [-0.8, -0.5],
          [0.8, -0.5],
          [-0.8, 0.7],
          [0.8, 0.7],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.75, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 1.5, 6]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
        ))}
        <mesh position={[0, 1.55, 0.1]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[2, 0.06, 1.5]} />
          <meshStandardMaterial color="#f2e0c8" />
        </mesh>
        {/* 診療椅＋病人＋馬偕（黑袍大鬍子意象：深色+帽） */}
        <mesh position={[0.1, 0.28, 0]} castShadow>
          <boxGeometry args={[0.5, 0.56, 0.5]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
        <Person position={[0.1, 0.5, 0]} color="#c9793f" rotation={0.3} scale={0.8} />
        <Person position={[-0.6, 0, -0.3]} color="#2f3b45" rotation={0.9} hat="band" hatColor="#1f2830" scale={0.95} />
        {/* 排隊人龍 */}
        <Person position={[-0.4, 0, 1.5]} color="#8f5c33" rotation={-0.2} hat="straw" scale={0.85} />
        <Person position={[0.3, 0, 2.2]} color="#a9713f" rotation={-0.1} scale={0.8} />
        <Person position={[1, 0, 2.9]} color="#7d6248" rotation={-0.3} hat="straw" scale={0.82} />
        {/* 藥箱 */}
        <Crates position={[1.2, 0, -0.3]} scale={0.55} />
      </group>

      {/* ── 東：牛津學堂＋女學堂 ── */}
      <group position={[5.2, 0.4, 0]}>
        <OxfordCollege position={[0, 0, -1]} />
        {/* 女學堂（白樓小間） */}
        <group position={[0.6, 0, 2.2]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.5, 0.9, 1]} />
            <meshStandardMaterial color="#f2ede0" />
          </mesh>
          <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.2, 0.45, 4]} />
            <meshStandardMaterial color="#c05a3a" flatShading />
          </mesh>
        </group>
        {/* 上學的學生們 */}
        <Person position={[-1.6, 0, 0.8]} color="#4a7fae" scale={0.55} />
        <Person position={[-1.1, 0, 1.1]} color="#3f8f52" scale={0.55} />
        <Person position={[-0.4, 0, 3.4]} color="#c95a8a" scale={0.55} />
        <Person position={[0.3, 0, 3.6]} color="#8a4a86" scale={0.55} />
        <Flag position={[1.8, 0, 0.6]} color="#3f6fae" stripe="#f2ead3" height={1.4} />
      </group>

      {/* ── 南：臺南看西街醫館（馬雅各）一角 ── */}
      <group position={[-1.5, 0.4, 6]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.9, 1, 1.1]} />
          <meshStandardMaterial color="#f2ede0" />
        </mesh>
        <mesh position={[0, 1.12, 0]} castShadow>
          <boxGeometry args={[2, 0.14, 1.2]} />
          <meshStandardMaterial color="#3f8f52" />
        </mesh>
        {/* 紅十字 */}
        <mesh position={[0, 0.62, 0.57]}>
          <boxGeometry args={[0.08, 0.3, 0.03]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <mesh position={[0, 0.62, 0.57]}>
          <boxGeometry args={[0.3, 0.08, 0.03]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <Person position={[1.3, 0, 0.4]} color="#2f3b45" rotation={-1} hat="band" hatColor="#1f2830" scale={0.9} />
        <Person position={[-1.2, 0, 0.7]} color="#c9793f" rotation={0.8} scale={0.8} />
      </group>

      {/* 點綴 */}
      <PineTree position={[8.5, 0.4, 4]} height={1.6} />
      <PineTree position={[-8, 0.4, 4.5]} height={1.8} />
      <Rock position={[-6.8, 0.5, 3.2]} scale={0.6} />
      <GrassTuft position={[2.6, 0.4, 4.6]} />
      <Flower position={[-2.4, 0.4, 3.4]} color="#ff8fb3" />
      <Flower position={[6.8, 0.4, 3.2]} color="#ffd34d" />
    </group>
  );
}
