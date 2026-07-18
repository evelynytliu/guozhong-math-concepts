"use client";

// 場景 4-2「從消極到建省」的 3D 佈景。
// 南（z≈6）：恆春半島石門峽谷＋日艦；中（x≈-3）：億載金城式新式炮臺；
// 北（z≈-6）：臺北城＋會跑的蒸汽火車＋電報桿；西北外海：法國軍艦。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  EuroShip,
  Flag,
  Gate,
  Person,
  PineTree,
  Rock,
  Smoke,
} from "./primitives";
import {
  DriftingClouds,
  GrassTuft,
  Flower,
  SceneLights,
  Seabirds,
  SkyDome,
  StylizedWater,
} from "./environment";

/* 新式稜堡炮臺（億載金城風：方形稜堡＋四角突出＋大炮） */
function ModernFort({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.5, 3.2]} />
        <meshStandardMaterial color="#a5854a" />
      </mesh>
      {/* 四角稜堡突出 */}
      {[
        [-1.5, -1.5],
        [1.5, -1.5],
        [-1.5, 1.5],
        [1.5, 1.5],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.28, z]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[1.1, 0.56, 1.1]} />
          <meshStandardMaterial color="#93753e" />
        </mesh>
      ))}
      {/* 內牆與門洞 */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#b3452f" />
      </mesh>
      <mesh position={[0, 0.5, 1.12]}>
        <boxGeometry args={[0.5, 0.45, 0.05]} />
        <meshStandardMaterial color="#4a3320" />
      </mesh>
      {/* 大炮 ×2 */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={i} position={[x, 0.95, -0.4]} rotation={[0, i === 0 ? 0.3 : -0.3, 0]}>
          <mesh rotation={[1.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.9, 10]} />
            <meshStandardMaterial color="#3d3a36" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.12, 0.1]}>
            <boxGeometry args={[0.3, 0.14, 0.3]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
        </group>
      ))}
      <Flag position={[0, 0.85, 0]} color="#e8c33d" stripe="#b3452f" height={1.4} />
    </group>
  );
}

/* 蒸汽小火車：沿直線來回跑 */
function Train({ z }: { z: number }) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = (clock.elapsedTime * 0.12) % 2;
    const u = t < 1 ? t : 2 - t; // 來回
    g.current.position.x = 2 + u * 7;
    g.current.rotation.y = t < 1 ? 0 : Math.PI;
  });
  return (
    <group ref={g} position={[2, 0.4, z]}>
      {/* 火車頭 */}
      <mesh position={[0.35, 0.3, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.55]} />
        <meshStandardMaterial color="#2f3b45" />
      </mesh>
      <mesh position={[0.62, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.3, 8]} />
        <meshStandardMaterial color="#1f2830" />
      </mesh>
      <mesh position={[-0.05, 0.62, 0]} castShadow>
        <boxGeometry args={[0.45, 0.35, 0.5]} />
        <meshStandardMaterial color="#3d4b57" />
      </mesh>
      <Smoke position={[0.62, 0.85, 0]} scale={0.5} />
      {/* 車廂 */}
      {[-0.85, -1.75].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0]} castShadow>
          <boxGeometry args={[0.8, 0.42, 0.5]} />
          <meshStandardMaterial color={i === 0 ? "#8f4f33" : "#6d4a2a"} />
        </mesh>
      ))}
      {/* 車輪 */}
      {[0.35, -0.85, -1.75].map((x) =>
        [-0.22, 0.22].map((zz) => (
          <mesh key={`${x}${zz}`} position={[x, 0.06, zz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.05, 10]} />
            <meshStandardMaterial color="#1f2830" />
          </mesh>
        )),
      )}
    </group>
  );
}

/* 電報桿 */
function TelegraphPole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.8, 6]} />
        <meshStandardMaterial color="#6d4a2a" />
      </mesh>
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 5]} />
        <meshStandardMaterial color="#6d4a2a" />
      </mesh>
    </group>
  );
}

export function ReformDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#cfe3ec"]} />
      <fog attach="fog" args={["#cfe3ec", 34, 82]} />
      <SkyDome top="#5a9fd4" horizon="#e0eff5" below="#2c83b3" sunDir={[0.42, 0.36, 0.4]} />
      <SceneLights sun={[11, 18, 9]} shadowSize={26} />
      <DriftingClouds count={5} />
      <Seabirds center={[-4, 0, 2]} count={3} radius={10} height={7} />

      {/* ── 海 ── */}
      <StylizedWater position={[-6, -0.15, 0]} radius={55} shallow="#49b7d6" deep="#2c83b3" />

      {/* ── 主島陸地 ── */}
      <mesh position={[3, -0.06, 0]} receiveShadow>
        <boxGeometry args={[16.5, 0.6, 22.5]} />
        <meshStandardMaterial color="#e8d9ab" />
      </mesh>
      <mesh position={[3.4, 0, 0]} receiveShadow>
        <boxGeometry args={[15.5, 0.8, 22]} />
        <meshStandardMaterial color="#7fae62" />
      </mesh>
      {/* 東側山脈 */}
      {[
        [10.5, -6, 4.2],
        [11.2, -1, 4.8],
        [10.8, 4, 4.4],
        [9.8, 8, 3.6],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, 0.4, z]}>
          <coneGeometry args={[2.8, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}
      {/* 開山撫番三路（往東的石板小徑） */}
      {[
        { z0: -3, dir: 0.3 },
        { z0: 0.5, dir: 0 },
        { z0: 4, dir: -0.3 },
      ].map((road, r) => (
        <group key={r}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[5.5 + i * 1.1, 0.42, road.z0 + i * road.dir]}
              rotation={[-Math.PI / 2, 0, i]}
            >
              <circleGeometry args={[0.3, 8]} />
              <meshStandardMaterial color="#9c8f7c" />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── 南：恆春半島與石門 ── */}
      <group position={[1, 0.4, 6.5]}>
        {/* 石門峽谷（兩壁夾道） */}
        <Rock position={[1.2, 0.4, 0.2]} scale={2.4} color="#8f8271" />
        <Rock position={[2.6, 0.3, 0.6]} scale={1.8} color="#7c7264" />
        {/* 排灣族戰士據高處 */}
        <Person position={[1.4, 1.5, 0.4]} color="#8a3d2e" rotation={-2.2} hat="band" hatColor="#c0392b" scale={0.85} />
        {/* 牡丹社小屋 */}
        <group position={[4, 0, 0.8]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.5, 0.6, 8]} />
            <meshStandardMaterial color="#cfa671" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <coneGeometry args={[0.65, 0.45, 8]} />
            <meshStandardMaterial color="#a5854a" flatShading />
          </mesh>
        </group>
        {/* 琉球難民墓碑 */}
        <group position={[-1.6, 0, 1.4]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.34, 0.7, 0.1]} />
            <meshStandardMaterial color="#c3b294" />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.5, 0.1, 0.26]} />
            <meshStandardMaterial color="#8d8478" />
          </mesh>
        </group>
        {/* 日軍：軍旗＋士兵（灘頭） */}
        <Person position={[-3.4, 0, 0.6]} color="#5a5a66" rotation={1.2} scale={0.85} />
        <Person position={[-4, 0, 1.4]} color="#5a5a66" rotation={1} scale={0.82} />
        <Flag position={[-3.8, 0, -0.2]} color="#f2ead3" stripe="#c94040" height={1.2} />
      </group>
      {/* 日艦（南方外海） */}
      <EuroShip position={[-6.5, 0, 8.5]} flagColor="#f2ead3" scale={0.85} rotation={0.4} />

      {/* ── 中：新式炮臺（億載金城） ── */}
      <ModernFort position={[-3, 0.4, 1]} />
      <Person position={[-1.4, 0.4, 2.4]} color="#3f5d8a" rotation={-0.8} hat="cone" hatColor="#2b2118" scale={0.9} />

      {/* ── 北：臺北城與現代化建設 ── */}
      <group position={[3, 0.4, -6]}>
        {/* 城牆一角＋城門 */}
        <mesh position={[-1.8, 0.5, 0.5]} castShadow>
          <boxGeometry args={[3.2, 1, 0.5]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
        <Gate position={[-1.8, 0, 0.5]} color="#8f4f33" scale={0.6} />
        {/* 郵政總局（白樓） */}
        <group position={[-0.2, 0, -1.6]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.3, 1, 0.9]} />
            <meshStandardMaterial color="#f2ede0" />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1, 0.4, 4]} />
            <meshStandardMaterial color="#3f6fae" />
          </mesh>
        </group>
        {/* 西學堂（紅樓） */}
        <group position={[-2.8, 0, -1.8]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.8]} />
            <meshStandardMaterial color="#b3452f" />
          </mesh>
          <mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.95, 0.4, 4]} />
            <meshStandardMaterial color="#4a3a30" />
          </mesh>
          <Person position={[0, 0, 0.7]} color="#4a7fae" scale={0.55} />
          <Person position={[0.5, 0, 0.85]} color="#6b4a86" scale={0.55} />
        </group>
        {/* 路燈（亮起的臺北街頭） */}
        {[
          [0.8, 0.4],
          [1.6, -0.6],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 1.1, 6]} />
              <meshStandardMaterial color="#3d3a36" />
            </mesh>
            <mesh position={[0, 1.15, 0]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color="#ffe08a" emissive="#ffb300" emissiveIntensity={1.5} />
            </mesh>
          </group>
        ))}
      </group>
      {/* 鐵路（枕木＋鐵軌）＋火車 */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} position={[1.6 + i * 0.55, 0.41, -8.2]} receiveShadow>
            <boxGeometry args={[0.14, 0.04, 0.7]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
        ))}
        {[-0.24, 0.24].map((zz, i) => (
          <mesh key={i} position={[5.7, 0.44, -8.2 + zz]}>
            <boxGeometry args={[9, 0.04, 0.06]} />
            <meshStandardMaterial color="#8a8f94" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <Train z={-8.2} />
      </group>
      {/* 電報桿列（往西北通向海＝連福州） */}
      {[
        [1, -4.5],
        [-0.8, -5.2],
        [-2.6, -5.9],
        [-4.4, -6.6],
      ].map(([x, z], i) => (
        <TelegraphPole key={i} position={[x, 0.4, z]} />
      ))}

      {/* 法艦（西北外海，清法戰爭） */}
      <EuroShip position={[-8, 0, -8]} flagColor="#3f6fae" scale={0.9} rotation={2.7} />
      <EuroShip position={[-10.5, 0, -5.5]} flagColor="#3f6fae" scale={0.8} rotation={2.9} />

      {/* 點綴 */}
      <PineTree position={[7.5, 0.4, 2]} height={1.7} />
      <PineTree position={[6.8, 0.4, -2.6]} height={1.5} />
      <GrassTuft position={[0.6, 0.4, 3.6]} />
      <Flower position={[2.2, 0.4, 4.6]} color="#ff8fb3" />
      <Flower position={[-0.6, 0.4, -2.8]} color="#ffd34d" />
    </group>
  );
}
