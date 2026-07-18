"use client";

// 場景 2-3「國姓爺來了」的 3D 佈景：台江內海一帶。
// 左側沙洲上是熱蘭遮城，中間是台江內海，右側陸地（承天府、軍屯田、孔廟、港口）。
// stageIndex 推進劇情：第 2 幕（index 1）起熱蘭遮城換上鄭氏紅旗；
// 第 4 幕（index 3）出現清軍艦隊與西邊的暴風雲。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  Field,
  Flag,
  Fort,
  Gate,
  Junk,
  Person,
  PineTree,
} from "./primitives";
import {
  DriftingClouds,
  GrassTuft,
  Flower,
  SceneLights,
  Seabirds,
  SkyDome,
  StylizedWater,
  Torch,
  WakeRings,
} from "./environment";

/* 孔廟：紅牆、雙層屋頂、前庭 */
function ConfuciusTemple({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 台基 */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.6, 0.16, 2]} />
        <meshStandardMaterial color="#cbb896" flatShading />
      </mesh>
      {/* 主殿紅牆 */}
      <mesh position={[0, 0.5, -0.3]}>
        <boxGeometry args={[1.8, 0.7, 1]} />
        <meshStandardMaterial color="#b3452f" flatShading />
      </mesh>
      {/* 兩層屋頂（翹脊用扁四角錐疊出） */}
      <mesh position={[0, 0.98, -0.3]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.55, 0.35, 4]} />
        <meshStandardMaterial color="#d98035" flatShading />
      </mesh>
      <mesh position={[0, 1.25, -0.3]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1, 0.3, 4]} />
        <meshStandardMaterial color="#e0913f" flatShading />
      </mesh>
      {/* 大門 */}
      <mesh position={[0, 0.32, 0.22]}>
        <boxGeometry args={[0.4, 0.44, 0.06]} />
        <meshStandardMaterial color="#5a3220" flatShading />
      </mesh>
      {/* 前庭牌樓（全臺首學） */}
      <Gate position={[0, 0, 0.85]} color="#b3452f" scale={0.42} />
      <PineTree position={[-1.1, 0, 0.6]} height={0.9} color="#4c8a55" />
      <PineTree position={[1.1, 0, 0.6]} height={0.8} color="#4c8a55" />
      {/* 讀書的孩子們 */}
      <Person position={[-0.5, 0, 1.3]} color="#4a7fae" scale={0.55} />
      <Person position={[0.5, 0, 1.35]} color="#6b4a86" scale={0.55} rotation={2.8} />
    </group>
  );
}

/* 兵器架（軍屯：農具與長矛放在一起） */
function SpearRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.7, 5]} />
          <meshStandardMaterial color="#7d6248" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.66, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.75, 5]} />
        <meshStandardMaterial color="#7d6248" flatShading />
      </mesh>
      {[-0.18, 0, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.42, 0.06]} rotation={[0.25, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.85, 5]} />
            <meshStandardMaterial color="#93765a" flatShading />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.045, 0.16, 6]} />
            <meshStandardMaterial color="#aab4bc" metalness={0.5} roughness={0.4} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* 西邊的暴風雲（清帝國的壓力）——內部偶爾閃電 */
function StormCloud({ position }: { position: [number, number, number] }) {
  const g = React.useRef<THREE.Group>(null);
  const bolt = React.useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.4) * 0.4;
    if (bolt.current) {
      // 每 ~4 秒閃一下（用 sin 疊出偶發的尖峰）
      const t = clock.elapsedTime + position[2] * 1.7;
      const spike = Math.max(0, Math.sin(t * 1.6) * Math.sin(t * 5.3) - 0.82) * 40;
      bolt.current.intensity = spike;
    }
  });
  return (
    <group ref={g} position={position}>
      {[
        [0, 0, 0, 1.4],
        [1.3, 0.3, 0.4, 1.1],
        [-1.2, 0.2, -0.3, 1],
        [0.4, 0.6, -0.5, 0.9],
        [-0.5, 0.5, 0.6, 0.8],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#5c6470" transparent opacity={0.88} />
        </mesh>
      ))}
      <pointLight ref={bolt} position={[0, -0.5, 0]} color="#cfe0ff" distance={16} decay={2} intensity={0} />
    </group>
  );
}

export function KoxingaDiorama({ stageIndex }: { stageIndex: number }) {
  const zhengFlag = stageIndex >= 1;
  return (
    <group>
      <color attach="background" args={[stageIndex >= 3 ? "#b9cfd8" : "#cde7f0"]} />
      <fog attach="fog" args={[stageIndex >= 3 ? "#b9cfd8" : "#cde7f0", 34, 85]} />
      {stageIndex >= 3 ? (
        <SkyDome top="#6b7f96" horizon="#cfdbe3" below="#33607a" sunDir={[0.4, 0.3, 0.5]} sunGlow="#e8ecf2" />
      ) : (
        <SkyDome top="#4f9fe0" horizon="#d8f0f7" below="#2c83b3" sunDir={[0.4, 0.38, 0.5]} />
      )}
      <SceneLights
        sun={[10, 17, 9]}
        intensity={stageIndex >= 3 ? 0.95 : 1.3}
        sunColor={stageIndex >= 3 ? "#dfe6ee" : "#fff2dc"}
        shadowSize={24}
      />
      <DriftingClouds count={stageIndex >= 3 ? 3 : 5} />
      <Seabirds center={[-2, 0, -2]} count={3} radius={9} height={6.5} />

      {/* 海（外海＋台江內海） */}
      <StylizedWater
        position={[-2, -0.15, 0]}
        radius={55}
        shallow={stageIndex >= 3 ? "#587f93" : "#49b7d6"}
        deep={stageIndex >= 3 ? "#33607a" : "#2c83b3"}
      />

      {/* ── 右側陸地（臺南平原）＋沙岸裙邊 ── */}
      <mesh position={[7.6, -0.06, 0]} receiveShadow>
        <boxGeometry args={[12.8, 0.6, 24.8]} />
        <meshStandardMaterial color="#e8d9ab" />
      </mesh>
      <mesh position={[7.8, 0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.8, 24]} />
        <meshStandardMaterial color="#7fae62" />
      </mesh>
      {/* 平原點綴 */}
      <GrassTuft position={[4.2, 0.4, -3.4]} scale={1.2} />
      <GrassTuft position={[6.2, 0.4, 1.4]} />
      <GrassTuft position={[5, 0.4, 4.8]} scale={1.1} />
      <Flower position={[4.8, 0.4, -1]} color="#ff8fb3" />
      <Flower position={[6.8, 0.4, 5.4]} color="#ffd34d" />
      <PineTree position={[5.4, 0.4, -8.6]} height={1.4} />
      <PineTree position={[11.6, 0.4, 6.4]} height={1.7} />
      <PineTree position={[12.2, 0.4, -2.2]} height={1.5} />
      {/* 東側山脈背景 */}
      {[
        [-6, 2.2],
        [-2, 2.8],
        [2, 2.5],
        [6, 3],
        [9, 2.3],
      ].map(([z, h], i) => (
        <mesh key={i} position={[14.5, 0.4, z]}>
          <coneGeometry args={[2.2, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}

      {/* ── 沙洲與熱蘭遮城 ── */}
      <mesh position={[-5, 0.05, 0.8]} scale={[1.1, 0.3, 4.6]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e3d3a4" flatShading />
      </mesh>
      <Fort
        position={[-5, 0.3, 1]}
        scale={0.6}
        color="#d98052"
        flagColor={zhengFlag ? "#c0392b" : "#ff7b3d"}
      />
      {/* 鹿耳門水道北側的小沙洲 */}
      <mesh position={[-5.4, 0.02, -6.8]} scale={[0.9, 0.22, 1.3]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#e3d3a4" flatShading />
      </mesh>

      {/* ── 鄭家艦隊：從鹿耳門魚貫而入 ── */}
      {[
        { p: [-7.2, 0, -7.6] as const, r: -0.5, s: 0.85 },
        { p: [-5.8, 0, -5.9] as const, r: -0.6, s: 0.9 },
        { p: [-4.3, 0, -4.2] as const, r: -0.7, s: 0.95 },
        { p: [-3, 0, -2.4] as const, r: -0.8, s: 0.9 },
      ].map((s, i) => (
        <group key={i}>
          <Junk position={[...s.p]} rotation={s.r} scale={s.s} sailColor="#cfa86a" />
          <WakeRings position={[s.p[0] + 0.6, -0.05, s.p[2] - 0.6]} scale={0.7} />
        </group>
      ))}
      {/* 主帥船（大一點、掛紅旗） */}
      <group>
        <Junk position={[-2, 0, -1]} rotation={-0.9} scale={1.15} sailColor="#c9b48a" />
        <Flag position={[-2, 0.5, -1]} color="#c0392b" height={1.3} />
        <WakeRings position={[-1.3, -0.05, -1.8]} scale={0.9} />
      </group>

      {/* ── 普羅民遮（岸邊小城） ── */}
      <group position={[2.6, 0.4, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.8, 0.44, 0.7]} />
          <meshStandardMaterial color="#e0e0d2" flatShading />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.55, 0.3, 4]} />
          <meshStandardMaterial color="#c05a3a" flatShading />
        </mesh>
        <Flag position={[0.5, 0.4, 0.35]} color={zhengFlag ? "#c0392b" : "#ff7b3d"} height={0.9} />
      </group>
      {/* 承天府市街 */}
      <group position={[4.6, 0.4, -1.6]}>
        {[
          [0, 0],
          [0.7, 0.4],
          [-0.2, 0.7],
          [0.9, -0.3],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.45, 0.36, 0.36]} />
              <meshStandardMaterial color="#d9cbb0" flatShading />
            </mesh>
            <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.36, 0.24, 4]} />
              <meshStandardMaterial color="#8f4f33" flatShading />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 軍屯田（田＋兵農合一的人們） ── */}
      <group position={[8.6, 0.4, -5.8]}>
        <Field position={[0, 0, 0]} />
        <Field position={[2.8, 0, 0.4]} />
        <Field position={[1.2, 0, 2.2]} />
        <Person position={[-0.8, 0, 1.2]} color="#8f5c33" scale={0.8} />
        <Person position={[2, 0, 1.6]} color="#a9713f" scale={0.8} rotation={2.2} />
        <Person position={[3.4, 0, -0.8]} color="#7d6248" scale={0.8} rotation={-1} />
        <SpearRack position={[-1.4, 0, -0.6]} />
      </group>

      {/* ── 孔廟（全臺首學） ── */}
      <ConfuciusTemple position={[8.2, 0.4, 3]} />

      {/* ── 港口與走私貿易 ── */}
      <group position={[1.6, 0, 5.6]}>
        {/* 棧橋 */}
        <mesh position={[-0.9, 0.3, 0]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[2.4, 0.1, 0.7]} />
          <meshStandardMaterial color="#93765a" flatShading />
        </mesh>
        {[-1.8, -0.9, 0].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0.25]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 5]} />
            <meshStandardMaterial color="#7d6248" flatShading />
          </mesh>
        ))}
        <Junk position={[-3.2, 0, 0.4]} rotation={0.15} scale={0.9} sailColor="#cfa86a" />
        <Crates position={[0.2, 0.42, -0.1]} scale={0.8} />
        <Person position={[0.9, 0.4, 0.5]} color="#5c7d9e" scale={0.75} rotation={-2} hat="straw" />
        <Torch position={[0.4, 0.4, 0.9]} scale={0.9} />
        <Torch position={[-2, 0.35, -0.6]} scale={0.9} />
      </group>

      {/* ── 第 4 幕：西邊來的清軍與暴風雲 ── */}
      {stageIndex >= 3 && (
        <group>
          <StormCloud position={[-11, 5.5, 6]} />
          <StormCloud position={[-13, 6.5, 1]} />
          {[
            { p: [-12, 0, 7.5] as const, r: 0.4 },
            { p: [-10.5, 0, 9] as const, r: 0.5 },
            { p: [-13.5, 0, 10] as const, r: 0.45 },
          ].map((s, i) => (
            <Junk
              key={i}
              position={[...s.p]}
              rotation={s.r}
              scale={0.9}
              sailColor="#4a4038"
              hullColor="#3d3128"
            />
          ))}
        </group>
      )}
    </group>
  );
}
