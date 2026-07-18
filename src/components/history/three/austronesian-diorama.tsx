"use client";

// 場景 1-2「南島大遷徙」的 3D 佈景。
// 三個區域：大洋與群島（原點附近，臺灣在 [-6,0,0]）、
// 傳說之森（-18,-16 一帶）、名稱時光廊（18,-16 一帶）。鏡頭在區域間飛行。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles } from "@react-three/drei";
import {
  Campfire,
  Canoe,
  DottedRoute,
  Gate,
  lerpPath,
  PalmTree,
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
  WakeRings,
} from "./environment";

type V3 = [number, number, number];

/* 小島（綠丘＋山峰＋棕櫚樹） */
function Island({
  position,
  size = 1,
  palm = true,
}: {
  position: V3;
  size?: number;
  palm?: boolean;
}) {
  return (
    <group position={position} scale={size}>
      <mesh position={[0, -0.15, 0]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[1.2, 10, 8]} />
        <meshStandardMaterial color="#e3d3a4" flatShading />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[0.85, 0.5, 0.85]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#6fae62" flatShading />
      </mesh>
      {palm && <PalmTree position={[0.2, 0.4, 0.1]} scale={0.8} />}
    </group>
  );
}

/* 沿航線來回航行的獨木舟 */
function SailingCanoe() {
  const g = React.useRef<THREE.Group>(null);
  const path = React.useMemo(() => {
    const pts = [
      new THREE.Vector3(-4.2, 0, 0.4),
      new THREE.Vector3(-1.5, 0, 1.8),
      new THREE.Vector3(1, 0, 2.2),
      new THREE.Vector3(4, 0, 4),
      new THREE.Vector3(7.5, 0, 2.2),
      new THREE.Vector3(10.5, 0, 4.6),
      new THREE.Vector3(13.5, 0, 2.4),
    ];
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = (clock.elapsedTime * 0.03) % 1;
    const p = path.getPointAt(t);
    const tangent = path.getTangentAt(t);
    g.current.position.set(p.x, Math.sin(clock.elapsedTime * 1.8) * 0.05, p.z);
    g.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
  });
  return (
    <group ref={g}>
      <Canoe position={[0, 0, 0]} scale={1.1} />
      <WakeRings position={[-0.4, -0.05, 0]} scale={0.8} />
    </group>
  );
}

/* 布農傳說的大螃蟹 */
function Crab({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} scale={[1.3, 0.7, 1]}>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshStandardMaterial color="#d9543f" flatShading />
      </mesh>
      {[-0.5, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.3, 0.35]}>
          <mesh rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#e06a50" flatShading />
          </mesh>
          <mesh position={[i === 0 ? -0.12 : 0.12, 0.18, 0.05]} rotation={[0, 0, i === 0 ? 0.7 : -0.7]} scale={[0.6, 1, 0.6]}>
            <coneGeometry args={[0.12, 0.3, 6]} />
            <meshStandardMaterial color="#e06a50" flatShading />
          </mesh>
        </group>
      ))}
      {[-0.35, 0.35].map((x, i) => (
        <mesh key={i} position={[x * 1.4, 0.12, -0.1]} rotation={[0, 0, i === 0 ? 1 : -1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 5]} />
          <meshStandardMaterial color="#b8462f" flatShading />
        </mesh>
      ))}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.28]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#2b211c" />
        </mesh>
      ))}
    </group>
  );
}

/* 布農傳說的大蛇（幾顆球串成的彎曲身體） */
function Snake({ position }: { position: V3 }) {
  const segs = [0, 1, 2, 3, 4, 5];
  return (
    <group position={position}>
      {segs.map((i) => (
        <mesh
          key={i}
          position={[i * 0.4, 0.16 + Math.sin(i * 1.1) * 0.06, Math.sin(i * 0.9) * 0.35]}
        >
          <sphereGeometry args={[0.2 - i * 0.02, 8, 8]} />
          <meshStandardMaterial color="#4c7d46" flatShading />
        </mesh>
      ))}
      {[-0.06, 0.06].map((z, i) => (
        <mesh key={i} position={[-0.1, 0.3, z]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#f4d03f" />
        </mesh>
      ))}
    </group>
  );
}

export function AustronesianDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#bfe4ef"]} />
      <fog attach="fog" args={["#bfe4ef", 38, 95]} />
      <SkyDome top="#4f9fe0" horizon="#d8f0f7" below="#2c83b3" sunDir={[0.4, 0.38, 0.35]} />
      <SceneLights sun={[12, 20, 10]} shadowSize={30} />
      <DriftingClouds count={6} />
      <Seabirds center={[-2, 0, 2]} count={4} radius={11} height={7} />

      {/* ── 大海（會流動閃光的風格化水面） ── */}
      <StylizedWater position={[0, -0.25, -4]} radius={65} shallow="#49b7d6" deep="#2c83b3" />

      {/* ── 臺灣（大島＋中央山脈） ── */}
      <group position={[-6, 0, 0]}>
        <mesh position={[0, -0.1, 0]} scale={[1.9, 0.55, 2.9]}>
          <sphereGeometry args={[1.4, 12, 10]} />
          <meshStandardMaterial color="#6fae62" flatShading />
        </mesh>
        {[-0.9, 0, 0.9].map((z, i) => (
          <mesh key={i} position={[0.2, 0.75, z]}>
            <coneGeometry args={[0.55, 1.15, 7]} />
            <meshStandardMaterial color="#4c8a55" flatShading />
          </mesh>
        ))}
        <PalmTree position={[-1.4, 0.35, 1.6]} scale={0.9} />
        <Person position={[-1.8, 0.4, 0.4]} color="#b0503c" scale={0.9} />
      </group>

      {/* ── 跳島群島（往太平洋方向） ── */}
      <Island position={[0.5, 0, 2]} size={0.8} />
      <Island position={[4, 0, 4]} size={0.65} />
      <Island position={[7.8, 0, 2]} size={0.75} />
      <Island position={[10.8, 0, 4.8]} size={0.55} />
      <Island position={[13.8, 0, 2.2]} size={0.6} />
      <Island position={[3, 0, 7.6]} size={0.5} palm={false} />
      <Island position={[9, 0, 8.2]} size={0.45} palm={false} />

      {/* 航線與航行中的獨木舟 */}
      <DottedRoute
        points={lerpPath(
          [
            [-4.2, 0.15, 0.4],
            [-1.5, 0.15, 1.8],
            [1, 0.15, 2.2],
            [4, 0.15, 4],
            [7.5, 0.15, 2.2],
            [10.5, 0.15, 4.6],
            [13.5, 0.15, 2.4],
          ],
          5,
        )}
        size={0.07}
      />
      <SailingCanoe />

      {/* ── 傳說之森（-18, -16） ── */}
      <group position={[-18, 0, -16]}>
        {/* 森林地面 */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[8.5, 9, 0.5, 24]} />
          <meshStandardMaterial color="#5d9b4e" flatShading />
        </mesh>
        {/* 樹林 */}
        {[
          [-4.5, -3.5, 1.9],
          [-2, -4.8, 2.3],
          [1.5, -4.2, 1.7],
          [4.2, -3, 2.1],
          [-5.5, 0.5, 2.2],
          [5.2, 0.8, 1.8],
          [-3.8, 3.6, 2],
          [3.5, 3.8, 2.4],
          [0.5, 4.6, 1.8],
        ].map(([x, z, h], i) => (
          <PineTree key={i} position={[x, 0.2, z]} height={h} />
        ))}
        {/* 泰雅巨石（發光感的大石） */}
        <group position={[-3.5, 0.2, -0.5]}>
          <Rock position={[0, 0.8, 0]} scale={3} color="#8f9aa5" />
          <Rock position={[1, 0.3, 0.7]} scale={1.2} color="#7c8792" />
          <Person position={[1.6, 0, 1.4]} color="#b0503c" scale={0.85} />
          <Person position={[0.4, 0, 2]} color="#8a3d2e" scale={0.8} />
        </group>
        {/* 布農洪水：水灘＋大螃蟹 vs 大蛇 */}
        <group position={[3.5, 0.2, -1]}>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2, 18]} />
            <meshStandardMaterial color="#4fa8c9" />
          </mesh>
          <Crab position={[-0.6, 0, 0.6]} />
          <Snake position={[-0.4, 0, -1]} />
        </group>
        {/* 賽夏矮靈祭：營火＋圍圈的人 */}
        <group position={[0, 0.2, -3.8]}>
          <Campfire position={[0, 0, 0]} scale={0.9} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <Person
                key={i}
                position={[Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3]}
                rotation={-a + Math.PI / 2}
                color={i % 2 ? "#a04a38" : "#6b4a86"}
                scale={0.8}
                hat="band"
                hatColor={i % 2 ? "#e8c33d" : "#c0392b"}
              />
            );
          })}
        </group>
        {/* 林間光束與螢火蟲（傳說森林的魔幻感） */}
        {[
          [-2.5, -1.5],
          [2, 1],
        ].map(([x, z], i) => (
          <mesh key={`shaft${i}`} position={[x, 3.2, z]} rotation={[0.15, 0, 0.12]}>
            <coneGeometry args={[1.5, 6, 12, 1, true]} />
            <meshBasicMaterial color="#fff7d6" transparent opacity={0.07} depthWrite={false} side={2} />
          </mesh>
        ))}
        <Sparkles count={40} position={[0, 1.4, -1]} scale={[13, 2.6, 9]} size={2.6} speed={0.35} color="#d9ffb3" opacity={0.75} />
        <GrassTuft position={[-2.5, 0.2, 1]} scale={1.3} />
        <GrassTuft position={[1.8, 0.2, 3.2]} />
        <GrassTuft position={[4.6, 0.2, -2.2]} scale={1.1} />
        <Flower position={[-1.2, 0.2, 2.6]} color="#ff8fb3" />
        <Flower position={[3.2, 0.2, 2]} color="#c58fff" />
        <Flower position={[-4.6, 0.2, -2.4]} color="#ffd34d" scale={1.1} />
      </group>

      {/* ── 名稱時光廊（18, -16） ── */}
      <group position={[18, 0, -16]}>
        <mesh position={[0, -0.05, -2]} rotation={[0, 0.6, 0]} receiveShadow>
          <boxGeometry args={[3.4, 0.4, 14]} />
          <meshStandardMaterial color="#cbb896" />
        </mesh>
        {/* 廊道兩側的石燈籠感火把 */}
        {[
          [-4.6, 4.4],
          [-1.2, 1.8],
          [2.2, -0.8],
          [5.6, -3.4],
        ].map(([x, z], i) => (
          <group key={`lt${i}`} position={[x + (i % 2 === 0 ? -1.4 : 1.4), 0.15, z]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
              <meshStandardMaterial color="#8d8478" />
            </mesh>
            <mesh position={[0, 0.58, 0]}>
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshStandardMaterial color="#ffe08a" emissive="#ffb300" emissiveIntensity={1.4} />
            </mesh>
          </group>
        ))}
        {/* 三道門：清 → 日治 → 民國（顏色與位置對應資料檔熱點） */}
        <Gate position={[-3.4, 0.15, 3]} color="#b3823f" rotation={0.6} />
        <Gate position={[0, 0.15, 0.4]} color="#b34a4a" rotation={0.6} />
        <Gate position={[3.4, 0.15, -2.2]} color="#3f8f8a" rotation={0.6} />
        {/* 走廊盡頭：一群不同色的人＝十六族 */}
        <group position={[6.2, 0.15, -4.6]}>
          {[
            "#b0503c",
            "#3f6fae",
            "#6b4a86",
            "#3f8f52",
            "#c9793f",
            "#8a3d2e",
            "#4a7fae",
            "#9e5c8a",
          ].map((c, i) => (
            <Person
              key={i}
              position={[Math.cos((i / 8) * Math.PI * 2) * 1.5, 0, Math.sin((i / 8) * Math.PI * 2) * 1.5]}
              rotation={-((i / 8) * Math.PI * 2) + Math.PI / 2}
              color={c}
              scale={0.85}
            />
          ))}
        </group>
      </group>
    </group>
  );
}
