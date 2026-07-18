"use client";

// 場景 2-2「雙城記」的 3D 佈景：一座立體臺灣島。
// 南部（+z）：熱蘭遮城與普羅民遮；北部（-z）：雞籠與淡水（西班牙→荷蘭）。
// stageIndex 會推進劇情：第 3 幕（index 2）起北部換成荷蘭旗、出現北伐箭頭，
// 第 4 幕（index 3）起出現貿易航線與貨物。

import * as React from "react";
import * as THREE from "three";
import {
  ArcTube,
  Crates,
  Deer,
  EuroShip,
  Flag,
  Fort,
  Junk,
  Person,
  PineTree,
} from "./primitives";
import {
  DriftingClouds,
  SceneLights,
  Seabirds,
  SkyDome,
  StylizedWater,
  WakeRings,
} from "./environment";

/* 立體臺灣島（Shape 擠出＋中央山脈） */
function TaiwanIsland() {
  const geom = React.useMemo(() => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [0.5, 7],
      [1.9, 6.2],
      [2.6, 3.5],
      [2.75, 0.5],
      [2.2, -3.5],
      [0.9, -6.8],
      [0.2, -7],
      [-1.2, -5.5],
      [-2.4, -2],
      [-2.75, 1.5],
      [-2.2, 4.5],
      [-0.8, 6.5],
    ];
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false });
  }, []);
  const beachGeom = React.useMemo(() => {
    // 沿島形放大一圈的淺色沙灘裙邊
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [0.5, 7.35],
      [2.05, 6.5],
      [2.8, 3.6],
      [2.95, 0.5],
      [2.4, -3.65],
      [1, -7.15],
      [0.15, -7.4],
      [-1.35, -5.75],
      [-2.6, -2.05],
      [-2.95, 1.55],
      [-2.35, 4.7],
      [-0.9, 6.85],
    ];
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false });
  }, []);
  return (
    <group>
      <mesh geometry={beachGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#e8d9ab" />
      </mesh>
      <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7fae62" />
      </mesh>
      {/* 中央山脈（偏東的一排山） */}
      {[
        [0.9, -4.5, 1.5],
        [1.2, -2.5, 2],
        [1.3, -0.5, 2.3],
        [1.2, 1.5, 2.1],
        [0.9, 3.5, 1.7],
        [0.5, 5, 1.3],
      ].map(([x, nz, h], i) => (
        <mesh key={i} position={[x, 0.7, -nz]}>
          <coneGeometry args={[0.9, h, 7]} />
          <meshStandardMaterial color="#4c8a55" flatShading />
        </mesh>
      ))}
      {[
        [1.4, -3.4],
        [0.6, 0.8],
        [1.5, 2.6],
      ].map(([x, nz], i) => (
        <PineTree key={i} position={[x, 0.7, -nz]} height={1} />
      ))}
    </group>
  );
}

export function FortsDiorama({ stageIndex }: { stageIndex: number }) {
  const northIsDutch = stageIndex >= 2;
  return (
    <group>
      <color attach="background" args={["#bfe4ef"]} />
      <fog attach="fog" args={["#bfe4ef", 34, 85]} />
      <SkyDome top="#4f9fe0" horizon="#d8f0f7" below="#2c83b3" sunDir={[0.45, 0.4, 0.4]} />
      <SceneLights sun={[11, 18, 9]} shadowSize={22} />
      <DriftingClouds count={5} />
      <Seabirds center={[-3, 0, 3]} count={3} radius={8} height={6} />

      {/* 海 */}
      <StylizedWater position={[0, -0.15, 0]} radius={60} shallow="#49b7d6" deep="#2c83b3" />

      <TaiwanIsland />

      {/* ── 南部：荷蘭雙城 ── */}
      {/* 大員沙洲 */}
      <mesh position={[-2.6, 0.08, 4.9]} rotation={[0, 0.5, 0]} scale={[1.4, 0.25, 0.5]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e3d3a4" flatShading />
      </mesh>
      <Fort position={[-3, 0.3, 4.8]} scale={0.55} color="#d98052" flagColor="#ff7b3d" rotation={0.4} />
      {/* 普羅民遮（岸上的市街） */}
      <group position={[-1.3, 0.7, 4]}>
        {[
          [0, 0],
          [0.5, 0.3],
          [-0.4, 0.35],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.16, z]}>
            <boxGeometry args={[0.4, 0.32, 0.32]} />
            <meshStandardMaterial color="#e0e0d2" flatShading />
          </mesh>
        ))}
        {[
          [0, 0],
          [0.5, 0.3],
          [-0.4, 0.35],
        ].map(([x, z], i) => (
          <mesh key={`r${i}`} position={[x, 0.4, z]}>
            <coneGeometry args={[0.3, 0.24, 4]} />
            <meshStandardMaterial color="#c05a3a" flatShading />
          </mesh>
        ))}
        <Flag position={[0.9, 0, 0]} color="#ff7b3d" height={0.9} />
      </group>
      {/* 荷蘭船 */}
      <group>
        <EuroShip position={[-6.6, 0, 7.8]} flagColor="#ff7b3d" scale={0.8} rotation={0.6} />
        <WakeRings position={[-7.2, -0.05, 7.5]} scale={0.7} />
      </group>

      {/* ── 北部：雞籠與淡水 ── */}
      <Fort
        position={[1.5, 0.75, -6.2]}
        scale={0.45}
        color={northIsDutch ? "#d98052" : "#c9573f"}
        flagColor={northIsDutch ? "#ff7b3d" : "#c94040"}
        rotation={-0.3}
      />
      {/* 淡水紅毛城（紅色方塔） */}
      <group position={[-0.7, 0.7, -5.9]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.6, 0.7, 0.6]} />
          <meshStandardMaterial color="#c0392b" flatShading />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[0.7, 0.16, 0.7]} />
          <meshStandardMaterial color="#96281b" flatShading />
        </mesh>
        <Flag
          position={[0.3, 0.85, 0.3]}
          color={northIsDutch ? "#ff7b3d" : "#c94040"}
          height={0.8}
        />
      </group>
      {/* 西班牙船（1642 後就不見了） */}
      {!northIsDutch && (
        <group>
          <EuroShip position={[0.8, 0, -8.3]} flagColor="#c94040" scale={0.8} rotation={2.6} />
          <WakeRings position={[1.4, -0.05, -8]} scale={0.7} />
        </group>
      )}

      {/* 1642 荷蘭北伐箭頭 */}
      {northIsDutch && (
        <ArcTube from={[-3.6, 0.6, 4.6]} to={[0.6, 1, -5.6]} height={3.2} color="#ff7b3d" radius={0.09} />
      )}

      {/* ── 西部平原：鹿群與漢人開墾 ── */}
      <Deer position={[-1.6, 0.7, 0.2]} rotation={0.6} scale={0.8} />
      <Deer position={[-2, 0.7, 1.4]} rotation={2.2} scale={0.65} />
      <Deer position={[-1, 0.7, -1.2]} rotation={-0.8} scale={0.7} />
      <group position={[-1.6, 0.7, 2.6]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.9]} />
          <meshStandardMaterial color="#7a5c39" flatShading />
        </mesh>
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.13, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.8]} />
            <meshStandardMaterial color="#5d9b4e" flatShading />
          </mesh>
        ))}
        <Person position={[0.7, 0, 0.3]} color="#8f5c33" scale={0.6} />
        <Person position={[-0.7, 0, -0.2]} color="#a9713f" scale={0.6} rotation={2.4} />
      </group>

      {/* ── 貿易航線與貨物（第 4 幕起） ── */}
      {stageIndex >= 3 && (
        <group>
          <ArcTube from={[-3.4, 0.5, 5.2]} to={[-10, 0.3, -3]} height={3.5} color="#ffd76a" radius={0.08} />
          <ArcTube from={[-3.4, 0.5, 5.2]} to={[-11, 0.3, 8]} height={3} color="#ffd76a" radius={0.08} />
          <ArcTube from={[-3.4, 0.5, 5.2]} to={[8, 0.3, -9]} height={4} color="#ffd76a" radius={0.08} />
          <Crates position={[-2.2, 0.72, 3.2]} scale={0.7} />
          <Junk position={[-5.8, 0, 2.2]} scale={0.7} rotation={0.3} />
          <EuroShip position={[-7, 0, 7.5]} flagColor="#ff7b3d" scale={0.75} rotation={2.8} />
        </group>
      )}
    </group>
  );
}
