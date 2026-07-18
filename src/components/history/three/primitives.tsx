"use client";

// 歷史 3D 場景的共用「積木」——全部用 three 內建幾何體拼出來的低多邊形小物件。
// 風格約定：flatShading、飽和但柔和的顏色，像可愛的桌遊模型。
// 每個積木都很小（人、船、城堡、樹、火堆…），佈景檔負責把它們擺成一幕幕場景。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type V3 = [number, number, number];

/* ── 人（膠囊身體＋圓頭） ── */
export function Person({
  position,
  color = "#a9713f",
  rotation = 0,
  scale = 1,
  skin = "#e5b184",
}: {
  position: V3;
  color?: string;
  rotation?: number;
  scale?: number;
  skin?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 4, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
    </group>
  );
}

/* ── 營火（柴堆＋跳動的火焰＋閃爍點光源） ── */
export function Campfire({ position, scale = 1 }: { position: V3; scale?: number }) {
  const light = React.useRef<THREE.PointLight>(null);
  const flame = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (light.current)
      light.current.intensity = 2.2 + Math.sin(t * 9) * 0.5 + Math.sin(t * 23) * 0.3;
    if (flame.current) {
      const s = 1 + Math.sin(t * 7) * 0.12;
      flame.current.scale.set(s, 1 + Math.sin(t * 5.3) * 0.2, s);
    }
  });
  return (
    <group position={position} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i * Math.PI * 2) / 3) * 0.18, 0.08, Math.sin((i * Math.PI * 2) / 3) * 0.18]}
          rotation={[Math.PI / 2.4, 0, (i * Math.PI * 2) / 3]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.55, 6]} />
          <meshStandardMaterial color="#6d4a2a" flatShading />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 0.32, 0]}>
        <coneGeometry args={[0.16, 0.5, 6]} />
        <meshStandardMaterial color="#ff9a3d" emissive="#ff6a00" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <coneGeometry args={[0.09, 0.3, 6]} />
        <meshStandardMaterial color="#ffd76a" emissive="#ffb300" emissiveIntensity={2} />
      </mesh>
      <pointLight ref={light} position={[0, 0.7, 0]} color="#ffab52" distance={7} decay={2} />
    </group>
  );
}

/* ── 針葉樹 ── */
export function PineTree({
  position,
  height = 1.6,
  color = "#3e7d4f",
}: {
  position: V3;
  height?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height * 0.18, 0]}>
        <cylinderGeometry args={[0.07, 0.1, height * 0.4, 6]} />
        <meshStandardMaterial color="#6d4a2a" flatShading />
      </mesh>
      <mesh position={[0, height * 0.55, 0]}>
        <coneGeometry args={[height * 0.3, height * 0.6, 7]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, height * 0.9, 0]}>
        <coneGeometry args={[height * 0.2, height * 0.5, 7]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

/* ── 棕櫚樹（彎幹＋放射狀葉片） ── */
export function PalmTree({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.06, 0.1, 1.1, 6]} />
        <meshStandardMaterial color="#8a6238" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[0.12, 1.12, 0]}
          rotation={[0.5, (i * Math.PI * 2) / 5, 0]}
        >
          <boxGeometry args={[0.09, 0.02, 0.85]} />
          <meshStandardMaterial color="#3f8f52" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── 茅草屋（圓筒牆＋草頂） ── */
export function Hut({ position, scale = 1, rotation = 0 }: { position: V3; scale?: number; rotation?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.7, 8]} />
        <meshStandardMaterial color="#c9a06a" flatShading />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <coneGeometry args={[0.8, 0.65, 8]} />
        <meshStandardMaterial color="#9a7b3f" flatShading />
      </mesh>
      <mesh position={[0, 0.28, 0.56]}>
        <boxGeometry args={[0.28, 0.42, 0.06]} />
        <meshStandardMaterial color="#4a3320" flatShading />
      </mesh>
    </group>
  );
}

/* ── 旗子（旗桿＋隨風擺動的旗面） ── */
export function Flag({
  position,
  color = "#ff7b3d",
  height = 1.4,
  stripe,
}: {
  position: V3;
  color?: string;
  height?: number;
  stripe?: string;
}) {
  const flag = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flag.current)
      flag.current.rotation.y = Math.sin(clock.elapsedTime * 3.2 + position[0]) * 0.25;
  });
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.035, height, 6]} />
        <meshStandardMaterial color="#7d6248" flatShading />
      </mesh>
      <group position={[0, height - 0.16, 0]}>
        <mesh ref={flag} position={[0.26, 0, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.02]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        {stripe && (
          <mesh position={[0.26, -0.06, 0.015]}>
            <boxGeometry args={[0.5, 0.08, 0.01]} />
            <meshStandardMaterial color={stripe} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* ── 城堡／稜堡（雙層底座＋角塔＋旗） ── */
export function Fort({
  position,
  color = "#d98052",
  flagColor = "#ff7b3d",
  scale = 1,
  rotation = 0,
}: {
  position: V3;
  color?: string;
  flagColor?: string;
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* 星形稜堡感：兩個交錯 45° 的方座 */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2, 0.36, 2]} />
        <meshStandardMaterial color="#bfae8f" flatShading />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2, 0.36, 2]} />
        <meshStandardMaterial color="#bfae8f" flatShading />
      </mesh>
      {/* 主堡 */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.3, 0.6, 1.3]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {/* 角塔 */}
      {[
        [-0.6, -0.6],
        [0.6, -0.6],
        [-0.6, 0.6],
        [0.6, 0.6],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.85, z]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.2, 0.7, 8]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.24, 0.3, 8]} />
            <meshStandardMaterial color="#8f4f33" flatShading />
          </mesh>
        </group>
      ))}
      <Flag position={[0, 0.92, 0]} color={flagColor} height={1.1} />
    </group>
  );
}

/* ── 中式帆船（戎克船） ── */
export function Junk({
  position,
  rotation = 0,
  scale = 1,
  sailColor = "#d9c48a",
  hullColor = "#6b4a2f",
  bob = true,
}: {
  position: V3;
  rotation?: number;
  scale?: number;
  sailColor?: string;
  hullColor?: string;
  bob?: boolean;
}) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bob && g.current) {
      g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.6 + position[0] * 2) * 0.06;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + position[2]) * 0.03;
    }
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[1.5, 0.3, 0.55]} />
        <meshStandardMaterial color={hullColor} flatShading />
      </mesh>
      <mesh position={[-0.62, 0.38, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.5]} />
        <meshStandardMaterial color={hullColor} flatShading />
      </mesh>
      {/* 兩面硬式帆 */}
      {[0.28, -0.25].map((x, i) => (
        <group key={i} position={[x, 0.32, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 1, 5]} />
            <meshStandardMaterial color="#54331e" flatShading />
          </mesh>
          <mesh position={[0.02, 0.62, 0]} rotation={[0, 0, -0.06]}>
            <boxGeometry args={[0.55 - i * 0.1, 0.72 - i * 0.08, 0.02]} />
            <meshStandardMaterial color={sailColor} flatShading side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── 歐式帆船（蓋倫帆船：白色方帆＋旗） ── */
export function EuroShip({
  position,
  rotation = 0,
  scale = 1,
  flagColor = "#ff7b3d",
  hullColor = "#5d4030",
  bob = true,
}: {
  position: V3;
  rotation?: number;
  scale?: number;
  flagColor?: string;
  hullColor?: string;
  bob?: boolean;
}) {
  const g = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bob && g.current) {
      g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.4 + position[2] * 2) * 0.07;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.035;
    }
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.9, 0.4, 0.6]} />
        <meshStandardMaterial color={hullColor} flatShading />
      </mesh>
      <mesh position={[-0.8, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.55]} />
        <meshStandardMaterial color={hullColor} flatShading />
      </mesh>
      {/* 船首斜桅 */}
      <mesh position={[1.05, 0.42, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.02, 0.03, 0.6, 5]} />
        <meshStandardMaterial color="#54331e" flatShading />
      </mesh>
      {/* 兩桅白帆 */}
      {[0.35, -0.35].map((x, i) => (
        <group key={i} position={[x, 0.4, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 1.15, 5]} />
            <meshStandardMaterial color="#54331e" flatShading />
          </mesh>
          <mesh position={[0.03, 0.55, 0]} rotation={[0, 0, -0.04]}>
            <boxGeometry args={[0.02, 0.55, 0.7 - i * 0.12]} />
            <meshStandardMaterial color="#f2ead3" flatShading side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.03, 0.98, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.45 - i * 0.08]} />
            <meshStandardMaterial color="#f2ead3" flatShading side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.35, 1.22, 0]}>
        <boxGeometry args={[0.26, 0.14, 0.02]} />
        <meshStandardMaterial color={flagColor} />
      </mesh>
    </group>
  );
}

/* ── 獨木舟（舷外浮桿＋三角帆） ── */
export function Canoe({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: V3;
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.2, 0.18, 0.28]} />
        <meshStandardMaterial color="#7d5432" flatShading />
      </mesh>
      {/* 舷外浮桿 */}
      <mesh position={[0, 0.08, 0.5]}>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshStandardMaterial color="#8a6238" flatShading />
      </mesh>
      {[0.35, -0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.14, 0.25]} rotation={[0.9, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.55, 5]} />
          <meshStandardMaterial color="#8a6238" flatShading />
        </mesh>
      ))}
      {/* 三角帆 */}
      <mesh position={[0.1, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.8, 5]} />
        <meshStandardMaterial color="#54331e" flatShading />
      </mesh>
      <mesh position={[0.28, 0.62, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.42, 0.5, 0.015]} />
        <meshStandardMaterial color="#efe3c2" flatShading side={THREE.DoubleSide} />
      </mesh>
      <Person position={[-0.3, 0.12, 0]} color="#8f4f33" scale={0.55} />
    </group>
  );
}

/* ── 梅花鹿（低多邊形） ── */
export function Deer({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: V3;
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.55, 0.3, 0.24]} />
        <meshStandardMaterial color="#c98f52" flatShading />
      </mesh>
      {[
        [-0.2, -0.08],
        [0.2, -0.08],
        [-0.2, 0.08],
        [0.2, 0.08],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.14, z]}>
          <cylinderGeometry args={[0.035, 0.03, 0.3, 5]} />
          <meshStandardMaterial color="#b57c42" flatShading />
        </mesh>
      ))}
      <mesh position={[0.32, 0.62, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.16]} />
        <meshStandardMaterial color="#c98f52" flatShading />
      </mesh>
      {[-0.04, 0.04].map((z, i) => (
        <mesh key={i} position={[0.3, 0.78, z]} rotation={[0, 0, 0.3 - i * 0.6]}>
          <cylinderGeometry args={[0.012, 0.02, 0.2, 4]} />
          <meshStandardMaterial color="#8a5a2e" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── 陶罐 ── */
export function Pot({
  position,
  scale = 1,
  color = "#c07a4a",
}: {
  position: V3;
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} scale={[1, 1.15, 1]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.12, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

/* ── 石頭 ── */
export function Rock({
  position,
  scale = 1,
  color = "#9aa0a6",
}: {
  position: V3;
  scale?: number;
  color?: string;
}) {
  return (
    <mesh position={position} scale={scale} rotation={[0.3, 0.8, 0.1]}>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

/* ── 冒煙（三顆往上飄、循環的半透明球） ── */
export function Smoke({ position, scale = 1 }: { position: V3; scale?: number }) {
  const refs = [
    React.useRef<THREE.Mesh>(null),
    React.useRef<THREE.Mesh>(null),
    React.useRef<THREE.Mesh>(null),
  ];
  useFrame(({ clock }) => {
    refs.forEach((r, i) => {
      if (!r.current) return;
      const t = (clock.elapsedTime * 0.5 + i * 0.33) % 1;
      r.current.position.y = t * 1.6;
      r.current.position.x = Math.sin((t + i) * 4) * 0.15;
      const s = 0.12 + t * 0.2;
      r.current.scale.set(s, s, s);
      (r.current.material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - t);
    });
  });
  return (
    <group position={position} scale={scale}>
      {refs.map((r, i) => (
        <mesh key={i} ref={r}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#d8d8d8" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── 牌樓／時光門（兩柱＋橫梁） ── */
export function Gate({
  position,
  color = "#c96f4a",
  rotation = 0,
  scale = 1,
}: {
  position: V3;
  color?: string;
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1, 0]}>
          <boxGeometry args={[0.22, 2, 0.22]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[2.1, 0.24, 0.3]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 2.32, 0]}>
        <boxGeometry args={[2.4, 0.16, 0.34]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

/* ── 木箱堆（貿易貨物） ── */
export function Crates({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#a97c4a" flatShading />
      </mesh>
      <mesh position={[0.45, 0.17, 0.1]}>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshStandardMaterial color="#8f6538" flatShading />
      </mesh>
      <mesh position={[0.2, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#bd8f5a" flatShading />
      </mesh>
    </group>
  );
}

/* ── 一小塊田（土壟＋綠色作物條） ── */
export function Field({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.8]} />
        <meshStandardMaterial color="#7a5c39" flatShading />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 0]}>
          <boxGeometry args={[0.28, 0.12, 1.6]} />
          <meshStandardMaterial color="#5d9b4e" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── 弧形飛行箭頭（貿易路線／進軍路線） ── */
export function ArcTube({
  from,
  to,
  height = 2,
  color = "#ffffff",
  radius = 0.07,
  opacity = 0.85,
}: {
  from: V3;
  to: V3;
  height?: number;
  color?: string;
  radius?: number;
  opacity?: number;
}) {
  const curve = React.useMemo(() => {
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + height,
      (from[2] + to[2]) / 2,
    );
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      mid,
      new THREE.Vector3(...to),
    );
  }, [from, to, height]);
  const end = React.useMemo(() => {
    const p = curve.getPoint(0.97);
    const q = curve.getPoint(1);
    return { pos: q, dir: q.clone().sub(p).normalize() };
  }, [curve]);
  const coneQuat = React.useMemo(() => {
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.dir);
    return quat;
  }, [end]);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 24, radius, 6, false]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh position={end.pos} quaternion={coneQuat}>
        <coneGeometry args={[radius * 3, radius * 8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

/* ── 點狀航線（一排小球） ── */
export function DottedRoute({
  points,
  color = "#ffffff",
  size = 0.09,
}: {
  points: V3[];
  color?: string;
  size?: number;
}) {
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[size, 6, 6]} />
          <meshStandardMaterial color={color} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

/* ── 沿線段插值出 n 個點（給 DottedRoute 用） ── */
export function lerpPath(waypoints: V3[], perSegment = 6): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [ax, ay, az] = waypoints[i];
    const [bx, by, bz] = waypoints[i + 1];
    for (let j = 0; j < perSegment; j++) {
      const t = j / perSegment;
      pts.push([ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t]);
    }
  }
  pts.push(waypoints[waypoints.length - 1]);
  return pts;
}
