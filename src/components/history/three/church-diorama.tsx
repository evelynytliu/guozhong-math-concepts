"use client";

// 場景 3-1「教堂與獵場」的 3D 佈景：西部平原上的平埔族世界。
// 中央：聚落與獵鹿；西（x≈-8）：麻豆社衝突；東（x≈7）：地方會議涼亭；
// 南（z≈6）：教堂、貿易桌與鹿皮堆。

import * as React from "react";
import {
  Campfire,
  Crates,
  Deer,
  Field,
  Flag,
  Hut,
  Person,
  PineTree,
  Pot,
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

/* 小教堂：白牆、紅瓦、十字架 */
function Church({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.5, 1.1, 2.2]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.15, 1.15, 2.3]} />
        <meshStandardMaterial color="#c05a3a" />
      </mesh>
      {/* 鐘塔＋十字架 */}
      <mesh position={[0, 1.9, 0.7]} castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      <mesh position={[0, 2.55, 0.7]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.45, 0.55, 4]} />
        <meshStandardMaterial color="#c05a3a" />
      </mesh>
      <mesh position={[0, 3.05, 0.7]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 2.95, 0.7]}>
        <boxGeometry args={[0.24, 0.06, 0.06]} />
        <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.4} />
      </mesh>
      {/* 門與窗 */}
      <mesh position={[0, 0.42, 1.11]}>
        <boxGeometry args={[0.4, 0.65, 0.04]} />
        <meshStandardMaterial color="#5a3220" />
      </mesh>
      {[-0.4, 0.4].map((z, i) => (
        <mesh key={i} position={[0.76, 0.65, z]}>
          <boxGeometry args={[0.03, 0.35, 0.2]} />
          <meshStandardMaterial color="#7fb2d9" emissive="#4a7fae" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* 會議涼亭：柱子＋大屋頂＋高座 */
function Pavilion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[
        [-1, -0.8],
        [1, -0.8],
        [-1, 0.8],
        [1, 0.8],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color="#9a7b3f" flatShading />
      </mesh>
      {/* 高座（荷蘭長官坐的位子） */}
      <mesh position={[0, 0.3, -0.3]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.7]} />
        <meshStandardMaterial color="#b3452f" />
      </mesh>
    </group>
  );
}

export function ChurchDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#cde7f0"]} />
      <fog attach="fog" args={["#cde7f0", 34, 80]} />
      <SkyDome top="#4f9fe0" horizon="#d8f0f7" below="#7fae62" sunDir={[0.45, 0.4, 0.4]} />
      <SceneLights sun={[11, 18, 9]} shadowSize={24} groundColor="#4a5d3f" />
      <DriftingClouds count={5} />
      <Seabirds center={[0, 0, 0]} count={3} radius={11} height={7} />

      {/* ── 大平原 ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[20, 21, 0.5, 36]} />
        <meshStandardMaterial color="#7fae62" />
      </mesh>
      {/* 遠景山脈 */}
      {[
        [-14, -10, 3],
        [-8, -13, 4],
        [0, -14, 3.4],
        [8, -13, 4.2],
        [14, -10, 3],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[3.4, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}

      {/* ── 中央：平埔族聚落與獵鹿 ── */}
      <group>
        <Hut position={[-1.2, 0, -2.6]} rotation={0.4} />
        <Hut position={[1.4, 0, -3.2]} scale={0.85} rotation={-0.5} />
        <Hut position={[-3.6, 0, -3.4]} scale={0.75} rotation={1} />
        <Campfire position={[0, 0, -1.4]} scale={0.85} />
        {/* 游耕燒墾地（焦土＋新綠） */}
        <group position={[-3.4, 0, -0.6]}>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0.4]}>
            <circleGeometry args={[1.5, 16]} />
            <meshStandardMaterial color="#4c4238" />
          </mesh>
          <Smoke position={[0.4, 0.1, 0.2]} scale={0.5} />
          {[
            [-0.6, 0.5],
            [0.5, -0.4],
            [0.1, 0.8],
          ].map(([x, z], i) => (
            <GrassTuft key={i} position={[x, 0.05, z]} scale={0.7} color="#8fce6a" />
          ))}
        </group>
        {/* 獵鹿：鹿群＋持矛獵人 */}
        <Deer position={[3.2, 0, 0.8]} rotation={2.2} />
        <Deer position={[4.4, 0, -0.4]} rotation={2.6} scale={0.8} />
        <Deer position={[2.4, 0, 2]} rotation={1.6} scale={0.7} />
        <Person position={[1.4, 0, 1]} color="#a04a38" rotation={1} hat="band" hatColor="#c0392b" />
        <Person position={[4.2, 0, 2.2]} color="#8a3d2e" rotation={-2.4} hat="band" hatColor="#e8c33d" scale={0.9} />
        {/* 獵人的長矛 */}
        <mesh position={[1.7, 0.7, 1.15]} rotation={[0.3, 0, 1.1]}>
          <cylinderGeometry args={[0.02, 0.02, 1.3, 5]} />
          <meshStandardMaterial color="#7d6248" />
        </mesh>
        <Pot position={[0.7, 0, -2.2]} scale={0.7} />
        <GrassTuft position={[-2, 0, 1.8]} />
        <Flower position={[2.8, 0, -1.6]} color="#ff8fb3" />
      </group>

      {/* ── 西：麻豆社衝突區 ── */}
      <group position={[-8, 0, -3]}>
        {/* 木柵圍籬 */}
        {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 0.5, -1.2]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 1 + (i % 2) * 0.2, 6]} />
            <meshStandardMaterial color="#7d6248" />
          </mesh>
        ))}
        <Hut position={[-0.6, 0, -2.6]} scale={0.8} rotation={0.3} />
        <Smoke position={[-0.6, 1.2, -2.6]} scale={0.8} />
        {/* 對峙：原住民戰士 vs 荷蘭士兵＋新港社盟友 */}
        <Person position={[-1.2, 0, 0.4]} color="#8a3d2e" rotation={0.5} hat="band" hatColor="#c0392b" />
        <Person position={[-0.2, 0, 0.8]} color="#a04a38" rotation={0.3} scale={0.9} />
        <Person position={[1.6, 0, 1.6]} color="#3f5d8a" rotation={-2.6} hat="cone" hatColor="#2b2118" />
        <Person position={[2.6, 0, 1]} color="#3f5d8a" rotation={-2.9} hat="cone" hatColor="#2b2118" scale={0.9} />
        <Person position={[2.2, 0, 2.6]} color="#6f8f4e" rotation={-2.2} hat="band" hatColor="#e8c33d" scale={0.85} />
        <Flag position={[2.9, 0, 0.2]} color="#ff7b3d" height={1.2} />
        <Rock position={[-2.4, 0.1, 1.2]} scale={0.7} />
      </group>

      {/* ── 東：地方會議 ── */}
      <group position={[7, 0, -2]}>
        <Pavilion position={[0, 0, -0.5]} />
        {/* 荷蘭長官（高座上） */}
        <Person position={[0, 0.6, -0.8]} color="#b3452f" rotation={Math.PI} hat="cone" hatColor="#2b2118" scale={0.9} />
        {/* 各社長老（亭外矮凳圍圈） */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = Math.PI * 0.25 + (i / 5) * Math.PI * 1.1;
          const x = Math.sin(a) * 2.6;
          const z = 1.2 + Math.cos(a) * 1.4;
          return (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.24, 0.24, 8]} />
                <meshStandardMaterial color="#93765a" />
              </mesh>
              <Person
                position={[0, 0.2, 0]}
                color={["#a04a38", "#8a3d2e", "#b0503c", "#96633a", "#a05a2e"][i]}
                rotation={Math.PI + (a - Math.PI * 0.8)}
                hat="band"
                hatColor={i % 2 ? "#e8c33d" : "#c0392b"}
                scale={0.8}
              />
            </group>
          );
        })}
        {/* 權杖架（金頂籐杖） */}
        <group position={[2, 0, -1.6]}>
          <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.15]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 1, 6]} />
            <meshStandardMaterial color="#93765a" />
          </mesh>
          <mesh position={[0.08, 1.05, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ── 南：教堂、學校與貿易 ── */}
      <group position={[1, 0, 6]}>
        <Church position={[0, 0, 1.5]} rotation={Math.PI} />
        {/* 貿易桌：布匹鹽鐵器 ↔ 鹿皮 */}
        <group position={[-2.8, 0, -0.2]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.6, 0.1, 0.9]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
          {[
            [-0.6, -0.25],
            [0.6, -0.25],
            [-0.6, 0.25],
            [0.6, 0.25],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.24, z]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#6d4a2a" />
            </mesh>
          ))}
          {/* 布匹（彩色卷）＋鹽袋 */}
          {["#c05a3a", "#3f6fae", "#6b4a86"].map((c, i) => (
            <mesh key={i} position={[-0.5 + i * 0.25, 0.62, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 10]} />
              <meshStandardMaterial color={c} />
            </mesh>
          ))}
          <mesh position={[0.5, 0.66, 0.15]} scale={[1, 0.8, 1]} castShadow>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#f2ede0" />
          </mesh>
          <Person position={[-1.3, 0, 0.6]} color="#5c7d9e" rotation={0.8} hat="straw" scale={0.85} />
          <Person position={[0.9, 0, 0.9]} color="#a04a38" rotation={-0.6} hat="band" hatColor="#c0392b" scale={0.85} />
        </group>
        {/* 鹿皮堆 */}
        <group position={[-4.6, 0, 0.4]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.06 + i * 0.1, 0]} rotation={[0, i * 0.5, 0]} castShadow>
              <boxGeometry args={[0.7, 0.08, 0.5]} />
              <meshStandardMaterial color="#c98f52" />
            </mesh>
          ))}
        </group>
        <Crates position={[2.2, 0, -0.6]} scale={0.8} />
        {/* 新港文書桌（紙卷＋鵝毛筆） */}
        <group position={[2.4, 0, 3.6]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
          <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
            <planeGeometry args={[0.5, 0.36]} />
            <meshStandardMaterial color="#f7f1e3" />
          </mesh>
          <mesh position={[0.3, 0.62, 0.1]} rotation={[0.4, 0, -0.5]}>
            <coneGeometry args={[0.02, 0.3, 5]} />
            <meshStandardMaterial color="#f2ede0" />
          </mesh>
          <Person position={[0, 0, -0.8]} color="#4a6b8a" rotation={0} hat="cone" hatColor="#2b2118" scale={0.85} />
          <Person position={[0.9, 0, 0.5]} color="#a04a38" rotation={-2} hat="band" hatColor="#e8c33d" scale={0.8} />
        </group>
        <PineTree position={[4.4, 0, 1.4]} height={1.6} />
        <GrassTuft position={[-1.4, 0, 2.8]} />
        <Flower position={[3.4, 0, -1.4]} color="#ffd34d" />
      </group>
    </group>
  );
}
