"use client";

// 場景 5-2「一府二鹿三艋舺」的 3D 佈景。
// 左（x≈-9）：中國沿海碼頭（廈門/泉州旗）；中：海峽上對渡商船穿梭；
// 右（x≈5~10）：臺灣西岸由南（+z）到北（-z）排三座港市：府城、鹿港、艋舺。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  Flag,
  Gate,
  Junk,
  Person,
  PineTree,
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

/* 港市街屋（一排閩南紅磚厝＋燈籠） */
function TownBlock({
  position,
  rotation = 0,
  size = 1,
  lantern = "#ff7b3d",
}: {
  position: [number, number, number];
  rotation?: number;
  size?: number;
  lantern?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={size}>
      {[
        [-0.9, 0, 0.85, "#c05a3a"],
        [0, 0.15, 1, "#b3452f"],
        [0.95, 0, 0.8, "#c96f4a"],
      ].map(([x, zoff, s, c], i) => (
        <group key={i} position={[x as number, 0, zoff as number]} scale={s as number}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.85, 0.7, 0.7]} />
            <meshStandardMaterial color="#d9cbb0" />
          </mesh>
          {/* 紅磚屋頂：平頂板＋橫向菱形屋脊（box 轉 45° 當屋脊） */}
          <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow>
            <boxGeometry args={[0.98, 0.16, 0.16]} />
            <meshStandardMaterial color={c as string} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <boxGeometry args={[0.95, 0.1, 0.76]} />
            <meshStandardMaterial color={c as string} />
          </mesh>
          <mesh position={[0, 0.3, 0.36]}>
            <boxGeometry args={[0.26, 0.4, 0.04]} />
            <meshStandardMaterial color="#5a3220" />
          </mesh>
        </group>
      ))}
      {/* 燈籠（發光） */}
      {[-1.3, 1.35].map((x, i) => (
        <group key={i} position={[x, 0, -0.3]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 1.4, 6]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
          <mesh position={[0, 1.2, 0]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color={lantern} emissive={lantern} emissiveIntensity={1.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* 對渡商船：來回穿梭的戎克船 */
function FerryJunk({
  fromX,
  toX,
  z,
  speed = 0.06,
  offset = 0,
}: {
  fromX: number;
  toX: number;
  z: number;
  speed?: number;
  offset?: number;
}) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = (clock.elapsedTime * speed + offset) % 2;
    const u = t < 1 ? t : 2 - t;
    g.current.position.x = fromX + (toX - fromX) * u;
    g.current.rotation.y = t < 1 ? 0 : Math.PI;
    g.current.position.y = Math.sin(clock.elapsedTime * 1.6 + z) * 0.05;
  });
  return (
    <group ref={g} position={[fromX, 0, z]}>
      <Junk position={[0, 0, 0]} scale={0.8} bob={false} sailColor="#cfa86a" />
      <WakeRings position={[-0.7, 0.02, 0]} scale={0.55} />
    </group>
  );
}

export function PortsDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#f5e0c8"]} />
      <fog attach="fog" args={["#f5e0c8", 36, 85]} />
      {/* 黃昏：港市燈籠最好看的時刻 */}
      <SkyDome top="#7fa8d9" horizon="#ffe3b8" below="#c9884f" sunDir={[-0.55, 0.25, 0.3]} sunGlow="#ffce7a" />
      <SceneLights sun={[-14, 14, 8]} sunColor="#ffd9a3" intensity={1.15} shadowSize={26} groundColor="#7a6a4e" />
      <DriftingClouds count={4} />
      <Seabirds center={[-2, 0, 0]} count={3} radius={10} height={7} />

      {/* ── 海峽 ── */}
      <StylizedWater position={[-2, -0.15, 0]} radius={55} shallow="#57b0c9" deep="#2c6f96" />

      {/* ── 左：中國沿海碼頭 ── */}
      <group position={[-10, 0, 0]}>
        <mesh position={[-1.5, -0.05, 0]} receiveShadow>
          <boxGeometry args={[6.5, 0.7, 17]} />
          <meshStandardMaterial color="#c9b183" />
        </mesh>
        <TownBlock position={[-1.6, 0.3, -3]} rotation={0.3} size={0.9} lantern="#e8c33d" />
        {/* 廈門/泉州碼頭旗 */}
        <Flag position={[0.6, 0.3, 1.5]} color="#3f8f52" height={1.5} />
        <Flag position={[0.2, 0.3, -5.5]} color="#3f6fae" height={1.5} />
        {/* 棧橋與貨 */}
        <mesh position={[2, 0.15, 1.2]} castShadow>
          <boxGeometry args={[2.2, 0.12, 1.1]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
        <Crates position={[1, 0.3, 2.4]} scale={0.9} />
        {/* 布卷與藥材簍（大陸的貨） */}
        {["#c05a3a", "#3f6fae", "#6b4a86"].map((c, i) => (
          <mesh key={i} position={[0.4 + i * 0.3, 0.42, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 10]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
        <Person position={[1.6, 0.3, 0.2]} color="#5c7d9e" rotation={-1.2} hat="straw" scale={0.9} />
      </group>

      {/* ── 中：對渡商船隊 ── */}
      <FerryJunk fromX={-7} toX={2.5} z={-2.5} offset={0} />
      <FerryJunk fromX={-7} toX={2.8} z={1.5} offset={0.9} speed={0.05} />
      <FerryJunk fromX={-6.5} toX={2.2} z={4.5} offset={1.5} speed={0.07} />

      {/* ── 右：臺灣西岸與三大港市 ── */}
      <group position={[7, 0, 0]}>
        <mesh position={[2, -0.06, 0]} receiveShadow>
          <boxGeometry args={[11.5, 0.6, 21]} />
          <meshStandardMaterial color="#e8d9ab" />
        </mesh>
        <mesh position={[2.4, 0, 0]} receiveShadow>
          <boxGeometry args={[10.5, 0.8, 20.5]} />
          <meshStandardMaterial color="#8fbf70" />
        </mesh>
        {/* 山脈背景 */}
        {[
          [6.5, -6, 4],
          [7.2, 0, 4.6],
          [6.8, 6, 4.2],
        ].map(([x, z, h], i) => (
          <mesh key={i} position={[x, 0.4, z]}>
            <coneGeometry args={[2.8, h, 7]} />
            <meshStandardMaterial color="#4c8a55" flatShading />
          </mesh>
        ))}
        {/* 🥇 府城（南，+z）：最大、有牌樓 */}
        <group position={[0.2, 0.4, 4.5]}>
          <TownBlock position={[0.6, 0, 0]} rotation={-0.15} size={1.05} lantern="#ff7b3d" />
          <Gate position={[-1.2, 0, 0.6]} color="#b3452f" scale={0.5} />
          <Person position={[-0.6, 0, 1.4]} color="#8f5c33" rotation={0.6} hat="straw" scale={0.85} />
          <Crates position={[-1.8, 0, -0.4]} scale={0.8} />
        </group>
        {/* 🥈 鹿港（中） */}
        <group position={[0.4, 0.4, -0.5]}>
          <TownBlock position={[0.6, 0, 0]} rotation={0.1} size={0.9} lantern="#e8c33d" />
          <Person position={[-0.8, 0, 0.8]} color="#a9713f" rotation={0.8} scale={0.8} />
        </group>
        {/* 🥉 艋舺（北，-z） */}
        <group position={[0.8, 0.4, -4.8]}>
          <TownBlock position={[0.6, 0, 0]} rotation={0.25} size={0.75} lantern="#c58fff" />
          <Person position={[-0.6, 0, 0.7]} color="#5c7d9e" rotation={0.9} scale={0.75} />
        </group>
        {/* 米糖貨物待運 */}
        {[4.6, 0.1, -4.2].map((z, i) => (
          <mesh key={i} position={[-1.5, 0.55, z]} scale={[1, 0.75, 1]} castShadow>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#e8d9ab" />
          </mesh>
        ))}
        <PineTree position={[3.8, 0.4, 2.2]} height={1.5} />
        <GrassTuft position={[1.6, 0.4, 2]} />
        <Flower position={[2.6, 0.4, -2.6]} color="#ff8fb3" />
      </group>
    </group>
  );
}
