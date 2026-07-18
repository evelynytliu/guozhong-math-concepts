"use client";

// 場景 2-1「大航海時代」的 3D 佈景：一張立體航海圖。
// 中國沿海在左、日本右上、臺灣中右、馬尼拉下方、巴達維亞左下。
// 幾艘船沿航線航行，像桌上的戰略地圖活起來。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Crates,
  DottedRoute,
  EuroShip,
  Flag,
  Junk,
  lerpPath,
  Person,
} from "./primitives";

type V3 = [number, number, number];

/* 地圖上的一塊陸地（壓扁的圓球，可拉長） */
function Land({
  position,
  scaleXZ = [1, 1],
  color = "#8fbf70",
  rotationY = 0,
}: {
  position: V3;
  scaleXZ?: [number, number];
  color?: string;
  rotationY?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      scale={[scaleXZ[0], 0.38, scaleXZ[1]]}
    >
      <sphereGeometry args={[1, 12, 9]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

/* 港口據點：小城塊＋旗 */
function Port({
  position,
  flagColor,
  stripe,
}: {
  position: V3;
  flagColor: string;
  stripe?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.55, 0.44, 0.55]} />
        <meshStandardMaterial color="#d9cbb0" flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.42, 0.32, 4]} />
        <meshStandardMaterial color="#8f4f33" flatShading />
      </mesh>
      <Flag position={[0.32, 0.4, 0.32]} color={flagColor} stripe={stripe} height={1.05} />
    </group>
  );
}

/* 沿路線航行的船（把任何船元件當 children 塞進來） */
function SailAlong({
  waypoints,
  speed = 0.025,
  offset = 0,
  children,
}: {
  waypoints: V3[];
  speed?: number;
  offset?: number;
  children: React.ReactNode;
}) {
  const g = React.useRef<THREE.Group>(null);
  const path = React.useMemo(
    () => new THREE.CatmullRomCurve3(waypoints.map((p) => new THREE.Vector3(...p))),
    [waypoints],
  );
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    const p = path.getPointAt(t);
    const tangent = path.getTangentAt(t);
    g.current.position.set(p.x, p.y, p.z);
    g.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
  });
  return <group ref={g}>{children}</group>;
}

/* 地圖角落的羅盤玫瑰 */
function CompassRose({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 20]} />
        <meshStandardMaterial color="#dcc9a0" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.05, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <coneGeometry args={[0.16, 1.9, 4]} />
          <meshStandardMaterial color={i === 0 ? "#b34a4a" : "#7a6a4e"} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#b34a4a" flatShading />
      </mesh>
    </group>
  );
}

/* 地圖裝飾：海怪 */
function SeaSerpent({ position }: { position: V3 }) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.08;
  });
  return (
    <group ref={g} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.55, 0.15 + (i % 2) * 0.25, 0]}>
          <sphereGeometry args={[0.22 - i * 0.03, 8, 8]} />
          <meshStandardMaterial color="#3f7d6d" flatShading />
        </mesh>
      ))}
      <mesh position={[-0.35, 0.5, 0]}>
        <coneGeometry args={[0.14, 0.4, 6]} />
        <meshStandardMaterial color="#3f7d6d" flatShading />
      </mesh>
    </group>
  );
}

export function SailDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#d8c9a3"]} />
      <fog attach="fog" args={["#d8c9a3", 34, 70]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 18, 10]} intensity={0.95} />

      {/* ── 航海圖桌面（羊皮紙色外框＋藍色海面） ── */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[44, 0.6, 30]} />
        <meshStandardMaterial color="#c9b183" flatShading />
      </mesh>
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[41, 0.3, 27]} />
        <meshStandardMaterial color="#5fa8c4" flatShading />
      </mesh>

      {/* ── 陸地 ── */}
      {/* 中國（明） */}
      <Land position={[-10, 0, -5]} scaleXZ={[5.5, 4.2]} color="#9dbb74" />
      <Land position={[-13, 0, -1]} scaleXZ={[3.6, 3]} color="#94b56e" />
      <Land position={[-6.5, 0, -3]} scaleXZ={[3.2, 2.6]} color="#a3c17c" rotationY={0.5} />
      {/* 日本 */}
      <Land position={[8.6, 0, -7.2]} scaleXZ={[2.4, 1.1]} color="#9dbb74" rotationY={-0.5} />
      <Land position={[11.2, 0, -8.4]} scaleXZ={[1.4, 0.8]} color="#94b56e" rotationY={-0.4} />
      {/* 臺灣（微微發亮的主角） */}
      <mesh position={[5, 0.05, -2]} rotation={[0, 0.35, 0]} scale={[1.05, 0.45, 1.9]}>
        <sphereGeometry args={[1, 12, 9]} />
        <meshStandardMaterial color="#6fae62" emissive="#2c5e2e" emissiveIntensity={0.25} flatShading />
      </mesh>
      {/* 澎湖（三顆小點） */}
      {[
        [3.3, -0.9],
        [3.6, -1.2],
        [3.2, -1.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} scale={[0.22, 0.12, 0.22]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#c9c07c" flatShading />
        </mesh>
      ))}
      {/* 菲律賓（馬尼拉） */}
      <Land position={[3.2, 0, 6]} scaleXZ={[1.2, 2.2]} color="#9dbb74" rotationY={0.2} />
      {/* 爪哇（巴達維亞） */}
      <Land position={[-7, 0, 9.5]} scaleXZ={[3.4, 1.1]} color="#94b56e" />
      {/* 中南半島 */}
      <Land position={[-13.5, 0, 4.5]} scaleXZ={[2.6, 3.2]} color="#9dbb74" rotationY={-0.3} />

      {/* ── 港口據點 ── */}
      <Port position={[-5.8, 0.2, -1]} flagColor="#3f7d46" stripe="#c94040" /> {/* 澳門（葡） */}
      <Port position={[3, 0.2, 5.4]} flagColor="#c94040" stripe="#e8c33d" /> {/* 馬尼拉（西） */}
      <Port position={[-6.6, 0.2, 9.2]} flagColor="#ff7b3d" /> {/* 巴達維亞（荷 VOC） */}
      <Port position={[8.8, 0.2, -7]} flagColor="#f2ead3" stripe="#c94040" /> {/* 長崎（日本） */}
      <Flag position={[5.2, 0.35, -1.6]} color="#ff7b3d" height={1.2} /> {/* 大員 */}

      {/* ── 航線（點狀） ── */}
      {/* 歐洲人航線：從地圖左緣繞進來 → 澳門 → 馬尼拉 */}
      <DottedRoute
        points={lerpPath(
          [
            [-19, 0.12, 7],
            [-15.5, 0.12, 6.5],
            [-11, 0.12, 7.5],
            [-8.5, 0.12, 4],
            [-6.5, 0.12, 0.5],
          ],
          5,
        )}
        color="#3f7d46"
        size={0.08}
      />
      <DottedRoute
        points={lerpPath(
          [
            [-19, 0.12, 10.5],
            [-10.5, 0.12, 11],
            [-2, 0.12, 9],
            [2.5, 0.12, 6.6],
          ],
          5,
        )}
        color="#c94040"
        size={0.08}
      />
      {/* VOC：巴達維亞 → 澎湖 → 大員 */}
      <DottedRoute
        points={lerpPath(
          [
            [-6, 0.12, 8.6],
            [-2, 0.12, 5],
            [1, 0.12, 1.5],
            [3.4, 0.12, -0.9],
            [4.6, 0.12, -1.5],
          ],
          5,
        )}
        color="#ff7b3d"
        size={0.08}
      />

      {/* ── 航行中的船 ── */}
      <SailAlong
        waypoints={[
          [-17, 0, 8],
          [-11, 0, 8.5],
          [-7.5, 0, 4.5],
          [-6, 0, 1],
          [-3, 0, 2.5],
          [0.5, 0, 5],
          [-3, 0, 8],
          [-8, 0, 9.5],
          [-13, 0, 9.8],
          [-17, 0, 8],
        ]}
        speed={0.012}
      >
        <EuroShip position={[0, 0, 0]} flagColor="#3f7d46" scale={0.9} bob={false} />
      </SailAlong>
      <SailAlong
        waypoints={[
          [-6.2, 0, 8.8],
          [-2, 0, 5.5],
          [1.5, 0, 1.8],
          [4.4, 0, -0.6],
          [2, 0, 2],
          [-2.5, 0, 6],
          [-6.2, 0, 8.8],
        ]}
        speed={0.016}
        offset={0.3}
      >
        <EuroShip position={[0, 0, 0]} flagColor="#ff7b3d" scale={0.95} bob={false} />
      </SailAlong>
      {/* 漢人海商戎克船：中國沿海 ↔ 臺灣 */}
      <SailAlong
        waypoints={[
          [-4.5, 0, -2.5],
          [-1, 0, -1.5],
          [2, 0, -1.8],
          [4.2, 0, -2.4],
          [1.5, 0, -3.2],
          [-2, 0, -3],
          [-4.5, 0, -2.5],
        ]}
        speed={0.02}
        offset={0.6}
      >
        <Junk position={[0, 0, 0]} scale={0.85} bob={false} />
      </SailAlong>
      {/* 倭寇船（黑帆，在沿海鬼鬼祟祟） */}
      <SailAlong
        waypoints={[
          [-3, 0, -6.5],
          [0, 0, -5.5],
          [2.5, 0, -6.8],
          [-0.5, 0, -7.5],
          [-3, 0, -6.5],
        ]}
        speed={0.03}
        offset={0.1}
      >
        <Junk position={[0, 0, 0]} scale={0.75} sailColor="#4a4038" hullColor="#3d3128" bob={false} />
      </SailAlong>

      {/* 顏思齊、鄭芝龍的開墾據點（臺灣島上小人＋貨物） */}
      <Person position={[4.4, 0.42, -2.6]} color="#b0713f" scale={0.7} />
      <Person position={[5.4, 0.42, -1.3]} color="#8f5c33" scale={0.7} rotation={2} />
      <Crates position={[5.7, 0.35, -2.5]} scale={0.6} />

      {/* ── 地圖裝飾 ── */}
      <CompassRose position={[14.5, 0.05, 8.5]} />
      <SeaSerpent position={[12, 0, 3.5]} />
      <SeaSerpent position={[-11.5, 0, 2]} />
    </group>
  );
}
