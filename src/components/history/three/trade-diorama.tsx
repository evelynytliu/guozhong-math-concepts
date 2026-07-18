"use client";

// 場景 5-3「茶・糖・樟腦」的 3D 佈景。
// 北（z≈-5）：丘陵茶園梯田；東（x≈6）：山區腦寮（冒煙）＋隘寮；
// 南（z≈5）：甘蔗田；西（x≈-7）：通商港口（洋行＋冒煙的輪船）。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  Flag,
  Hut,
  Person,
  PineTree,
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
  WakeRings,
} from "./environment";

/* 茶園梯田：一層層綠色茶壟 */
function TeaTerrace({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((tier) => (
        <group key={tier} position={[0, tier * 0.35, -tier * 1.1]}>
          <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
            <boxGeometry args={[7 - tier * 1.2, 0.35, 1.15]} />
            <meshStandardMaterial color="#8a6f47" />
          </mesh>
          {Array.from({ length: 7 - tier }, (_, i) => (
            <mesh key={i} position={[-(6 - tier * 1.2) / 2 + i * ((6 - tier * 1.2) / (6 - tier)) , 0.42, 0]} castShadow>
              <sphereGeometry args={[0.32, 9, 7]} />
              <meshStandardMaterial color={i % 2 ? "#3f8f52" : "#4c9e5e"} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* 甘蔗田：一叢叢高瘦的甘蔗 */
function CaneField({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.12, 3.4]} />
        <meshStandardMaterial color="#7a5c39" />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const x = -2.4 + (i % 7) * 0.8;
        const z = -0.8 + Math.floor(i / 7) * 1.6;
        return (
          <group key={i} position={[x, 0, z]}>
            {[0, 1, 2].map((k) => (
              <mesh
                key={k}
                position={[Math.cos(k * 2.1) * 0.08, 0.55, Math.sin(k * 2.1) * 0.08]}
                rotation={[Math.cos(k) * 0.1, 0, Math.sin(k) * 0.12]}
                castShadow
              >
                <cylinderGeometry args={[0.035, 0.045, 1.1, 5]} />
                <meshStandardMaterial color="#9ec25f" />
              </mesh>
            ))}
            <mesh position={[0, 1.15, 0]}>
              <coneGeometry args={[0.16, 0.35, 5]} />
              <meshStandardMaterial color="#6fae52" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* 蒸汽輪船（黑船身＋煙囪冒煙） */
function Steamship({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + 2) * 0.05;
    g.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.02;
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[2.4, 0.4, 0.7]} />
        <meshStandardMaterial color="#2f3b45" />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[1.4, 0.3, 0.55]} />
        <meshStandardMaterial color="#f2ede0" />
      </mesh>
      {[0.3, -0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.4, 8]} />
          <meshStandardMaterial color="#c94040" />
        </mesh>
      ))}
      <Smoke position={[0.3, 1, 0]} scale={0.6} />
      <mesh position={[1.15, 0.4, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.015, 0.02, 0.5, 5]} />
        <meshStandardMaterial color="#54331e" />
      </mesh>
    </group>
  );
}

export function TradeDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#d5e8ec"]} />
      <fog attach="fog" args={["#d5e8ec", 34, 82]} />
      <SkyDome top="#549bd4" horizon="#e3f2f5" below="#2c83b3" sunDir={[0.4, 0.38, 0.42]} />
      <SceneLights sun={[10, 18, 10]} shadowSize={26} />
      <DriftingClouds count={5} />
      <Seabirds center={[-5, 0, 0]} count={3} radius={9} height={7} />

      {/* ── 海（西側港灣） ── */}
      <StylizedWater position={[-9, -0.15, 0]} radius={45} shallow="#49b7d6" deep="#2c83b3" />

      {/* ── 陸地 ── */}
      <mesh position={[2, -0.06, 0]} receiveShadow>
        <boxGeometry args={[19, 0.6, 22.5]} />
        <meshStandardMaterial color="#e8d9ab" />
      </mesh>
      <mesh position={[2.5, 0, 0]} receiveShadow>
        <boxGeometry args={[18, 0.8, 22]} />
        <meshStandardMaterial color="#8fbf70" />
      </mesh>
      {/* 東側山（樟樹林覆蓋） */}
      {[
        [9.5, -4, 4.6],
        [10.5, 1, 5.2],
        [9.8, 6, 4.2],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0.4, z]}>
          <coneGeometry args={[3, h, 7]} />
          <meshStandardMaterial color="#3e7d4f" flatShading />
        </mesh>
      ))}

      {/* ── 北：茶園梯田 ── */}
      <TeaTerrace position={[0, 0.4, -4.5]} />
      <Person position={[-2.2, 0.4, -3.4]} color="#a04a38" rotation={0.6} hat="straw" scale={0.85} />
      <Person position={[1.8, 0.4, -3.6]} color="#8f5c33" rotation={-0.8} hat="straw" scale={0.82} />
      {/* 茶簍 */}
      <mesh position={[-1, 0.55, -3.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.3, 10]} />
        <meshStandardMaterial color="#c9a06a" />
      </mesh>

      {/* ── 東：腦寮（煙）＋隘寮（瞭望塔） ── */}
      <group position={[6.5, 0.4, -1.5]}>
        <Hut position={[0, 0, 0]} scale={0.8} rotation={0.4} />
        <Smoke position={[0, 1.1, 0]} scale={0.9} />
        {/* 樟木堆 */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-1 - (i % 2) * 0.3, 0.14 + Math.floor(i / 2) * 0.24, 0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.9, 8]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
        ))}
        {/* 隘寮：高腳瞭望塔 */}
        <group position={[1.8, 0, 1.6]}>
          {[
            [-0.3, -0.3],
            [0.3, -0.3],
            [-0.3, 0.3],
            [0.3, 0.3],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.7, z]} castShadow>
              <cylinderGeometry args={[0.05, 0.06, 1.4, 6]} />
              <meshStandardMaterial color="#7d6248" />
            </mesh>
          ))}
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color="#c9a06a" />
          </mesh>
          <mesh position={[0, 1.85, 0]} castShadow>
            <coneGeometry args={[0.7, 0.4, 4]} />
            <meshStandardMaterial color="#9a7b3f" flatShading />
          </mesh>
          <Person position={[0, 1.62, 0]} color="#5c7d9e" scale={0.5} hat="cone" hatColor="#2b2118" />
        </group>
        <Person position={[-0.6, 0, 1.4]} color="#93765a" rotation={0.8} scale={0.85} />
      </group>

      {/* ── 南：甘蔗田 ── */}
      <CaneField position={[2.5, 0.4, 5.5]} />
      <Person position={[0.2, 0.4, 4.2]} color="#a9713f" rotation={1.8} hat="straw" scale={0.85} />

      {/* ── 西：通商港口（洋行＋輪船＋貨物山） ── */}
      <group position={[-5.5, 0, 0.5]}>
        {/* 碼頭平台 */}
        <mesh position={[-0.6, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.3, 6.5]} />
          <meshStandardMaterial color="#b8a684" />
        </mesh>
        {/* 洋行（白色西式二層樓＋拱廊） */}
        <group position={[0.6, 0.3, -1.6]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[2, 1.4, 1.2]} />
            <meshStandardMaterial color="#f2ede0" />
          </mesh>
          {/* 拱廊柱 */}
          {[-0.7, -0.23, 0.23, 0.7].map((x, i) => (
            <mesh key={i} position={[x, 0.5, 0.66]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 1, 8]} />
              <meshStandardMaterial color="#e3ddd0" />
            </mesh>
          ))}
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[2.2, 0.14, 1.4]} />
            <meshStandardMaterial color="#c05a3a" />
          </mesh>
          <Flag position={[0.9, 1.55, 0.5]} color="#3f6fae" stripe="#f2ead3" height={0.9} />
          {/* 窗 */}
          {[-0.55, 0, 0.55].map((x, i) => (
            <mesh key={i} position={[x, 1.05, 0.61]}>
              <boxGeometry args={[0.24, 0.3, 0.03]} />
              <meshStandardMaterial color="#7fb2d9" emissive="#4a7fae" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
        {/* 出口貨物山：茶箱、糖包、樟腦桶 */}
        <Crates position={[-0.8, 0.3, 1.6]} scale={0.9} />
        {[0, 1].map((i) => (
          <mesh key={i} position={[-1.6 + i * 0.45, 0.5, 0.6]} scale={[1, 0.75, 1]} castShadow>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color="#e8d9ab" />
          </mesh>
        ))}
        <mesh position={[-0.2, 0.48, 0.3]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.36, 10]} />
          <meshStandardMaterial color="#c9a06a" />
        </mesh>
        <Person position={[-1.4, 0.3, 2.6]} color="#5c7d9e" rotation={-0.6} hat="straw" scale={0.9} />
        <Person position={[0.4, 0.3, 2.2]} color="#3f5d8a" rotation={-2.4} scale={0.9} />
      </group>
      <Steamship position={[-9, 0, 2.5]} rotation={0.3} />
      <WakeRings position={[-10.2, -0.05, 2]} scale={0.8} />

      {/* 點綴 */}
      <PineTree position={[4.6, 0.4, -0.8]} height={1.5} />
      <GrassTuft position={[1.2, 0.4, 1.8]} />
      <Flower position={[3.6, 0.4, 2.6]} color="#ff8fb3" />
      <Flower position={[-0.8, 0.4, -1.8]} color="#ffd34d" />
    </group>
  );
}
