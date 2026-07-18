"use client";

// 場景 4-1「渡臺悲歌」的 3D 佈景：橫跨黑水溝的大場面。
// 西（x≈-11）：廈門碼頭（棄留辯論＋告示牌＋查驗）；中（x≈-4~0）：黑水溝與偷渡小船；
// 東（x≈4~8）：臺灣移民村（羅漢腳、通婚家庭）；最東（x≈10+）：番界土牛溝與山區。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  Field,
  Flag,
  Hut,
  Junk,
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

/* 官府告示牌 */
function NoticeBoard({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
          <meshStandardMaterial color="#6d4a2a" />
        </mesh>
      ))}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.06]} />
        <meshStandardMaterial color="#f2e8d0" />
      </mesh>
      {[0.18, 0.02, -0.14].map((y, i) => (
        <mesh key={i} position={[0, 1 + y, 0.035]}>
          <boxGeometry args={[0.9 - i * 0.15, 0.06, 0.01]} />
          <meshStandardMaterial color="#4a3320" />
        </mesh>
      ))}
      <mesh position={[0, 1.42, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.35, 0.14, 0.1]} />
        <meshStandardMaterial color="#8f4f33" />
      </mesh>
    </group>
  );
}

/* 偷渡小舢舨（超載、在浪裡搖） */
function Sampan({ position, phase = 0 }: { position: [number, number, number]; phase?: number }) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    g.current.position.y = position[1] + Math.sin(t * 2.2 + phase) * 0.12;
    g.current.rotation.z = Math.sin(t * 1.8 + phase) * 0.12;
    g.current.rotation.x = Math.sin(t * 1.5 + phase * 2) * 0.08;
  });
  return (
    <group ref={g} position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.1, 0.18, 0.45]} />
        <meshStandardMaterial color="#7d5432" />
      </mesh>
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.25, 0.1, 0.4]} />
        <meshStandardMaterial color="#7d5432" />
      </mesh>
      {/* 擠成一團的偷渡客 */}
      <Person position={[-0.3, 0.15, 0]} color="#8f5c33" scale={0.5} />
      <Person position={[0, 0.15, 0.1]} color="#a9713f" scale={0.5} hat="straw" />
      <Person position={[0.25, 0.15, -0.08]} color="#7d6248" scale={0.5} />
    </group>
  );
}

export function CrossingDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#c8dce8"]} />
      <fog attach="fog" args={["#c8dce8", 36, 85]} />
      <SkyDome top="#5a95c9" horizon="#dcebf2" below="#27536f" sunDir={[0.4, 0.34, 0.45]} />
      <SceneLights sun={[10, 18, 10]} shadowSize={28} />
      <DriftingClouds count={6} />
      <Seabirds center={[-4, 0, 0]} count={3} radius={9} height={7} />

      {/* ── 海（黑水溝：中央加一條深色湍流帶） ── */}
      <StylizedWater position={[-3, -0.15, 0]} radius={55} shallow="#49b7d6" deep="#27536f" />
      <mesh position={[-3.5, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[4.5, 40]} />
        <meshStandardMaterial color="#1d3d54" transparent opacity={0.75} />
      </mesh>

      {/* ── 西：廈門碼頭 ── */}
      <group position={[-11, 0, 0]}>
        <mesh position={[-1.5, 0, 0]} receiveShadow>
          <boxGeometry args={[7, 0.7, 18]} />
          <meshStandardMaterial color="#b8a684" />
        </mesh>
        {/* 棧橋 */}
        <mesh position={[2.4, 0.2, 1]} castShadow>
          <boxGeometry args={[2.4, 0.12, 1.2]} />
          <meshStandardMaterial color="#93765a" />
        </mesh>
        {/* 官府查驗亭＋官員＋排隊移民 */}
        <group position={[-1, 0.35, -2.5]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.4, 1.1, 1]} />
            <meshStandardMaterial color="#b3452f" />
          </mesh>
          <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.2, 0.5, 4]} />
            <meshStandardMaterial color="#4a3a30" />
          </mesh>
          <Person position={[0, 0, 0.9]} color="#3f5d8a" rotation={Math.PI} hat="cone" hatColor="#2b2118" scale={0.9} />
        </group>
        <NoticeBoard position={[-2.6, 0.35, 0.6]} rotation={0.5} />
        {/* 排隊的移民 */}
        <Person position={[0.6, 0.35, 0.4]} color="#8f5c33" rotation={-1.4} hat="straw" scale={0.9} />
        <Person position={[1.2, 0.35, 1.6]} color="#a9713f" rotation={-1.2} scale={0.85} />
        <Person position={[0.2, 0.35, 2.6]} color="#7d6248" rotation={-1} hat="straw" scale={0.9} />
        <Crates position={[0.4, 0.35, -1.2]} scale={0.8} />
        {/* 棄留辯論：兩位大官對峙＋施琅 */}
        <group position={[-3.2, 0.35, 3.6]}>
          <Person position={[-0.6, 0, 0]} color="#6b4a86" rotation={1.2} hat="cone" hatColor="#2b2118" />
          <Person position={[0.7, 0, 0.2]} color="#b3452f" rotation={-1.6} hat="cone" hatColor="#2b2118" />
          <Flag position={[0, 0, -0.9]} color="#e8c33d" stripe="#b3452f" height={1.5} />
        </group>
        <Junk position={[3.6, 0, -2.4]} scale={0.8} rotation={0.3} sailColor="#cfa86a" />
      </group>

      {/* ── 中：黑水溝上的偷渡船 ── */}
      <Sampan position={[-5.5, 0, -1.5]} phase={0} />
      <Sampan position={[-3, 0, 2.5]} phase={2} />
      <WakeRings position={[-5.5, -0.05, -1.5]} scale={0.6} />
      {/* 浪花 */}
      {[
        [-4.5, 0.6],
        [-2.8, -2.2],
        [-5.8, 3.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, i * 1.2]}>
          <ringGeometry args={[0.3, 0.42, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ── 東：臺灣島 ── */}
      <group position={[7, 0, 0]}>
        {/* 陸地與沙灘 */}
        <mesh position={[3, -0.06, 0]} receiveShadow>
          <boxGeometry args={[14.5, 0.6, 20.5]} />
          <meshStandardMaterial color="#e8d9ab" />
        </mesh>
        <mesh position={[3.4, 0, 0]} receiveShadow>
          <boxGeometry args={[13.5, 0.8, 20]} />
          <meshStandardMaterial color="#7fae62" />
        </mesh>
        {/* 移民村（通婚家庭＋羅漢腳） */}
        <group position={[-1.6, 0.4, 1]}>
          <Hut position={[0, 0, -1.2]} scale={0.85} rotation={0.3} />
          <Field position={[1.8, 0, 0.6]} />
          {/* 通婚家庭：漢人丈夫＋平埔族妻子＋孩子 */}
          <Person position={[-0.6, 0, 0.4]} color="#5c7d9e" rotation={0.4} hat="straw" scale={0.9} />
          <Person position={[-0.1, 0, 0.7]} color="#a04a38" rotation={-0.3} hat="band" hatColor="#e8c33d" scale={0.85} />
          <Person position={[-0.4, 0, 1.1]} color="#c9793f" scale={0.5} />
          {/* 羅漢腳三人組（蹲坐遊蕩） */}
          <Person position={[3.6, 0, 2.2]} color="#7d6248" rotation={2.6} scale={0.85} />
          <Person position={[4.2, 0, 1.6]} color="#93765a" rotation={-2.8} scale={0.8} />
          <Person position={[4, 0, 2.8]} color="#8a6238" rotation={0.4} scale={0.82} />
          <Rock position={[4.6, 0.1, 2.3]} scale={0.5} />
        </group>
        {/* 行政區旗（一府三縣 → 增設） */}
        <Flag position={[-0.5, 0.4, 5.2]} color="#e8c33d" stripe="#b3452f" height={1.6} />
        <Flag position={[1.6, 0.4, 6.4]} color="#3f8f52" height={1.2} />
        <Flag position={[0.8, 0.4, -6.2]} color="#3f6fae" height={1.2} />
        <Flag position={[2.6, 0.4, -8]} color="#6b4a86" height={1.2} />
        {/* 番界：土牛溝（溝＋土堆一路延伸）＋界碑 */}
        <group position={[3.4, 0.4, -1.5]}>
          {[-6, -4, -2, 0, 2, 4, 6].map((z, i) => (
            <group key={i} position={[Math.sin(z * 0.4) * 0.4, 0, z]}>
              <mesh position={[0.5, 0.22, 0]} castShadow>
                <sphereGeometry args={[0.42, 8, 6]} />
                <meshStandardMaterial color="#a5854a" flatShading />
              </mesh>
              <mesh position={[-0.35, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.7, 2.1]} />
                <meshStandardMaterial color="#5a4a35" />
              </mesh>
            </group>
          ))}
          {/* 界碑 */}
          <group position={[0.2, 0, -0.8]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.4, 0.9, 0.14]} />
              <meshStandardMaterial color="#c3b294" />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.55, 0.12, 0.3]} />
              <meshStandardMaterial color="#8d8478" />
            </mesh>
          </group>
        </group>
        {/* 界外：山區與原住民 */}
        {[
          [7.2, -5, 3.6],
          [8.2, 0, 4.4],
          [7.6, 5, 3.8],
        ].map(([x, z, h], i) => (
          <mesh key={i} position={[x, 0.4, z]}>
            <coneGeometry args={[2.6, h, 7]} />
            <meshStandardMaterial color="#4c8a55" flatShading />
          </mesh>
        ))}
        <Person position={[5.6, 0.4, 1.8]} color="#8a3d2e" rotation={-1.6} hat="band" hatColor="#c0392b" scale={0.9} />
        <PineTree position={[5.2, 0.4, -3.6]} height={1.7} />
        <PineTree position={[6, 0.4, 4]} height={1.9} />
        <GrassTuft position={[0.4, 0.4, 3.2]} />
        <Flower position={[-2.6, 0.4, 3.4]} color="#ff8fb3" />
      </group>
    </group>
  );
}
