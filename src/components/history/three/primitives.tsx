"use client";

// 歷史 3D 場景的共用「積木」——升級版。
// 風格：任天堂系 Q 版——大頭小身、圓潤幾何、飽和暖色、全員投影陰影、
// 待機小動作（角色呼吸晃動、旗幟飄動、火焰跳動）讓畫面隨時是活的。
// 介面（元件名／props）與舊版相容，佈景檔不用改就能吃到新視覺。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type V3 = [number, number, number];

/* 由座標算出穩定的偽隨機數（讓每棵樹/每個人略有差異但不閃爍） */
function hash(x: number, y: number, z: number) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

/* ── 人（Q 版：大頭、眼睛、小手、待機晃動、可戴帽） ── */
export function Person({
  position,
  color = "#a9713f",
  rotation = 0,
  scale = 1,
  skin = "#f0c39a",
  hat,
  hatColor = "#8a5a35",
}: {
  position: V3;
  color?: string;
  rotation?: number;
  scale?: number;
  skin?: string;
  hat?: "cone" | "straw" | "band";
  hatColor?: string;
}) {
  const g = React.useRef<THREE.Group>(null);
  const phase = React.useMemo(() => hash(...position) * Math.PI * 2, [position]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    g.current.position.y = position[1] + Math.sin(t * 2 + phase) * 0.025;
    g.current.rotation.y = rotation + Math.sin(t * 1.3 + phase) * 0.06;
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* 身體 */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.26, 6, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 手 */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.22, 0.36, 0]} rotation={[0, 0, s * -0.5]} castShadow>
          <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* 頭（大頭比例） */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 14]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* 眼睛＋腮紅 */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.08, 0.77, 0.19]}>
          <sphereGeometry args={[0.026, 8, 6]} />
          <meshStandardMaterial color="#2b2118" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * 0.14, 0.71, 0.16]}>
          <sphereGeometry args={[0.024, 6, 5]} />
          <meshStandardMaterial color="#f5967f" />
        </mesh>
      ))}
      {/* 帽子 */}
      {hat === "cone" && (
        <mesh position={[0, 0.95, 0]} castShadow>
          <coneGeometry args={[0.2, 0.24, 10]} />
          <meshStandardMaterial color={hatColor} />
        </mesh>
      )}
      {hat === "straw" && (
        <group position={[0, 0.9, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.34, 0.04, 12]} />
            <meshStandardMaterial color="#d9b36c" />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.1, 10]} />
            <meshStandardMaterial color="#d9b36c" />
          </mesh>
        </group>
      )}
      {hat === "band" && (
        <mesh position={[0, 0.88, 0]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.19, 0.035, 8, 16]} />
          <meshStandardMaterial color={hatColor} />
        </mesh>
      )}
    </group>
  );
}

/* ── 營火（石圈＋柴堆＋雙層火焰＋閃爍光） ── */
export function Campfire({ position, scale = 1 }: { position: V3; scale?: number }) {
  const light = React.useRef<THREE.PointLight>(null);
  const flame = React.useRef<THREE.Mesh>(null);
  const inner = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (light.current)
      light.current.intensity = 2.6 + Math.sin(t * 9) * 0.6 + Math.sin(t * 23) * 0.35;
    if (flame.current) {
      const s = 1 + Math.sin(t * 7) * 0.13;
      flame.current.scale.set(s, 1 + Math.sin(t * 5.3) * 0.22, s);
      flame.current.rotation.y = t * 0.8;
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 8.7 + 1) * 0.18;
      inner.current.scale.set(s, 1 + Math.sin(t * 6.1 + 2) * 0.25, s);
    }
  });
  return (
    <group position={position} scale={scale}>
      {/* 石圈 */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.42, 0.07, Math.sin(a) * 0.42]} rotation={[hash(i, a, 0), a, 0]} castShadow>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color="#8d8478" flatShading />
          </mesh>
        );
      })}
      {/* 柴堆 */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`l${i}`}
          position={[Math.cos((i * Math.PI * 2) / 3) * 0.15, 0.09, Math.sin((i * Math.PI * 2) / 3) * 0.15]}
          rotation={[Math.PI / 2.3, 0, (i * Math.PI * 2) / 3]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
          <meshStandardMaterial color="#5f4127" flatShading />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 0.34, 0]}>
        <coneGeometry args={[0.17, 0.55, 8]} />
        <meshStandardMaterial color="#ff9a3d" emissive="#ff5d00" emissiveIntensity={2} transparent opacity={0.95} />
      </mesh>
      <mesh ref={inner} position={[0, 0.26, 0]}>
        <coneGeometry args={[0.1, 0.34, 7]} />
        <meshStandardMaterial color="#ffe08a" emissive="#ffb300" emissiveIntensity={2.6} />
      </mesh>
      <pointLight ref={light} position={[0, 0.75, 0]} color="#ffab52" distance={8} decay={2} />
    </group>
  );
}

/* ── 針葉樹（三層樹冠、顏色微差、隨風輕搖） ── */
export function PineTree({
  position,
  height = 1.6,
  color = "#3e7d4f",
}: {
  position: V3;
  height?: number;
  color?: string;
}) {
  const g = React.useRef<THREE.Group>(null);
  const j = React.useMemo(() => hash(...position), [position]);
  const c = React.useMemo(() => {
    const base = new THREE.Color(color);
    base.offsetHSL((j - 0.5) * 0.04, 0, (j - 0.5) * 0.08);
    return base;
  }, [color, j]);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + j * 9) * 0.015;
  });
  return (
    <group ref={g} position={position} rotation={[0, j * 6.28, 0]}>
      <mesh position={[0, height * 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, height * 0.38, 7]} />
        <meshStandardMaterial color="#6d4a2a" flatShading />
      </mesh>
      {[0.42, 0.66, 0.88].map((h, i) => (
        <mesh key={i} position={[0, height * h, 0]} castShadow>
          <coneGeometry args={[height * (0.34 - i * 0.09), height * 0.42, 8]} />
          <meshStandardMaterial color={c} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── 棕櫚樹（彎曲樹幹、垂墜葉、椰子） ── */
export function PalmTree({ position, scale = 1 }: { position: V3; scale?: number }) {
  const g = React.useRef<THREE.Group>(null);
  const j = React.useMemo(() => hash(...position), [position]);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = 0.06 + Math.sin(clock.elapsedTime * 1.3 + j * 7) * 0.02;
  });
  return (
    <group ref={g} position={position} scale={scale} rotation={[0, j * 6.28, 0.06]}>
      {/* 彎曲樹幹（三段） */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.07, 0.22 + i * 0.38, 0]} rotation={[0, 0, 0.1 + i * 0.08]} castShadow>
          <cylinderGeometry args={[0.075 - i * 0.012, 0.09 - i * 0.012, 0.44, 7]} />
          <meshStandardMaterial color="#8a6238" flatShading />
        </mesh>
      ))}
      {/* 葉片（先上揚再下垂的弧形，用兩段箱體） */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI * 2) / 6 + j;
        return (
          <group key={`f${i}`} position={[0.2, 1.28, 0]} rotation={[0, a, 0]}>
            <mesh position={[0.3, 0.06, 0]} rotation={[0, 0, -0.25]} castShadow>
              <boxGeometry args={[0.62, 0.025, 0.16]} />
              <meshStandardMaterial color="#3f8f52" flatShading />
            </mesh>
            <mesh position={[0.75, -0.02, 0]} rotation={[0, 0, -0.75]}>
              <boxGeometry args={[0.4, 0.02, 0.12]} />
              <meshStandardMaterial color="#357a45" flatShading />
            </mesh>
          </group>
        );
      })}
      {/* 椰子 */}
      {[0, 1].map((i) => (
        <mesh key={`c${i}`} position={[0.16 + i * 0.1, 1.2, i === 0 ? 0.1 : -0.1]} castShadow>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#6d4a2a" />
        </mesh>
      ))}
    </group>
  );
}

/* ── 茅草屋（圓筒牆＋雙層草頂＋門窗） ── */
export function Hut({ position, scale = 1, rotation = 0 }: { position: V3; scale?: number; rotation?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.7, 10]} />
        <meshStandardMaterial color="#cfa671" />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <coneGeometry args={[0.85, 0.5, 10]} />
        <meshStandardMaterial color="#a5854a" flatShading />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow>
        <coneGeometry args={[0.55, 0.4, 10]} />
        <meshStandardMaterial color="#93753e" flatShading />
      </mesh>
      {/* 門 */}
      <mesh position={[0, 0.26, 0.57]}>
        <boxGeometry args={[0.28, 0.44, 0.06]} />
        <meshStandardMaterial color="#4a3320" />
      </mesh>
      {/* 圓窗 */}
      <mesh position={[0.42, 0.45, 0.36]} rotation={[0, 0.6, 0]}>
        <circleGeometry args={[0.08, 10]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
    </group>
  );
}

/* ── 旗子（旗桿＋金頂＋飄動旗面） ── */
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
  const flag = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flag.current) {
      flag.current.rotation.y = Math.sin(clock.elapsedTime * 3.2 + position[0]) * 0.3;
      flag.current.rotation.z = Math.sin(clock.elapsedTime * 5.1 + position[2]) * 0.05;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.032, height, 6]} />
        <meshStandardMaterial color="#7d6248" />
      </mesh>
      <mesh position={[0, height + 0.03, 0]}>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial color="#e8c33d" emissive="#c9a227" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={flag} position={[0, height - 0.17, 0]}>
        <mesh position={[0.27, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.32, 0.02]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
        {stripe && (
          <mesh position={[0.27, -0.07, 0.013]}>
            <boxGeometry args={[0.52, 0.09, 0.008]} />
            <meshStandardMaterial color={stripe} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* ── 城堡／稜堡（星形底座＋主堡（門窗）＋垛口角塔＋旗） ── */
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
  const dark = React.useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, 0.02, -0.12);
    return c;
  }, [color]);
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* 星形稜堡底座 */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.36, 2.05]} />
        <meshStandardMaterial color="#c3b294" />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.36, 2.05]} />
        <meshStandardMaterial color="#c3b294" />
      </mesh>
      {/* 底座上的矮牆垛口 */}
      {[0, 1, 2, 3].map((side) =>
        [-0.7, -0.25, 0.25, 0.7].map((o, i) => {
          const r = (side * Math.PI) / 2;
          return (
            <mesh
              key={`${side}-${i}`}
              position={[Math.cos(r) * 1 + Math.sin(r) * o, 0.42, Math.sin(r) * 1 - Math.cos(r) * o]}
              rotation={[0, r, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 0.12, 0.22]} />
              <meshStandardMaterial color="#b5a385" />
            </mesh>
          );
        }),
      )}
      {/* 主堡 */}
      <mesh position={[0, 0.66, 0]} castShadow>
        <boxGeometry args={[1.3, 0.64, 1.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 大門與窗 */}
      <mesh position={[0, 0.5, 0.66]}>
        <boxGeometry args={[0.3, 0.36, 0.03]} />
        <meshStandardMaterial color="#4a3320" />
      </mesh>
      {[-0.35, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.74, 0.66]}>
          <boxGeometry args={[0.12, 0.16, 0.03]} />
          <meshStandardMaterial color="#33281c" />
        </mesh>
      ))}
      {/* 角塔（圓塔＋尖頂） */}
      {[
        [-0.62, -0.62],
        [0.62, -0.62],
        [-0.62, 0.62],
        [0.62, 0.62],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.88, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.17, 0.2, 0.72, 10]} />
            <meshStandardMaterial color={dark} />
          </mesh>
          <mesh position={[0, 0.43, 0]} castShadow>
            <coneGeometry args={[0.24, 0.34, 10]} />
            <meshStandardMaterial color="#8f4f33" />
          </mesh>
          <mesh position={[0, 0.2, 0.14]}>
            <boxGeometry args={[0.07, 0.1, 0.03]} />
            <meshStandardMaterial color="#33281c" />
          </mesh>
        </group>
      ))}
      <Flag position={[0, 0.95, 0]} color={flagColor} height={1.15} />
    </group>
  );
}

/* ── 中式帆船（戎克船：分段船身、帆骨、旗、纜繩） ── */
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
  const darkHull = React.useMemo(() => {
    const c = new THREE.Color(hullColor);
    c.offsetHSL(0, 0, -0.08);
    return c;
  }, [hullColor]);
  useFrame(({ clock }) => {
    if (bob && g.current) {
      g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.6 + position[0] * 2) * 0.055;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + position[2]) * 0.03;
      g.current.rotation.x = Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.02;
    }
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* 船身（底＋舷牆＋船頭翹起） */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[1.5, 0.22, 0.52]} />
        <meshStandardMaterial color={darkHull} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.62, 0.1, 0.6]} />
        <meshStandardMaterial color={hullColor} />
      </mesh>
      <mesh position={[0.78, 0.32, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.5]} />
        <meshStandardMaterial color={hullColor} />
      </mesh>
      {/* 船尾樓 */}
      <mesh position={[-0.6, 0.42, 0]} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.48]} />
        <meshStandardMaterial color={darkHull} />
      </mesh>
      <mesh position={[-0.6, 0.55, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.54]} />
        <meshStandardMaterial color="#8f4f33" />
      </mesh>
      {/* 兩面硬式帆（含帆骨） */}
      {[
        { x: 0.26, w: 0.58, h: 0.78 },
        { x: -0.26, w: 0.48, h: 0.66 },
      ].map((s, i) => (
        <group key={i} position={[s.x, 0.3, 0]}>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 1.05, 6]} />
            <meshStandardMaterial color="#54331e" />
          </mesh>
          <mesh position={[0.03, 0.62, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[s.w, s.h, 0.015]} />
            <meshStandardMaterial color={sailColor} side={THREE.DoubleSide} />
          </mesh>
          {/* 帆骨（橫向細桿） */}
          {[-0.3, -0.1, 0.1, 0.3].map((o, k) => (
            <mesh key={k} position={[0.03, 0.62 + o * s.h, 0.012]} rotation={[0, 0, Math.PI / 2 - 0.06]}>
              <cylinderGeometry args={[0.008, 0.008, s.w + 0.04, 4]} />
              <meshStandardMaterial color="#54331e" />
            </mesh>
          ))}
        </group>
      ))}
      {/* 纜繩：桅頂 → 船頭 */}
      <mesh position={[0.62, 0.75, 0]} rotation={[0, 0, -0.9]}>
        <cylinderGeometry args={[0.006, 0.006, 0.85, 4]} />
        <meshStandardMaterial color="#3d2f22" />
      </mesh>
    </group>
  );
}

/* ── 歐式蓋倫帆船（船身層次、鼓起的方帆、瞭望台、纜繩） ── */
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
  const trim = React.useMemo(() => {
    const c = new THREE.Color(hullColor);
    c.offsetHSL(0.02, 0.1, 0.12);
    return c;
  }, [hullColor]);
  useFrame(({ clock }) => {
    if (bob && g.current) {
      g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.4 + position[2] * 2) * 0.06;
      g.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.03;
      g.current.rotation.x = Math.sin(clock.elapsedTime * 0.9 + position[2]) * 0.02;
    }
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* 船身（底層深、上緣亮的線條） */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.85, 0.34, 0.58]} />
        <meshStandardMaterial color={hullColor} />
      </mesh>
      <mesh position={[0, 0.37, 0]} castShadow>
        <boxGeometry args={[1.95, 0.08, 0.64]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      {/* 船尾樓（兩層） */}
      <mesh position={[-0.75, 0.5, 0]} castShadow>
        <boxGeometry args={[0.44, 0.26, 0.56]} />
        <meshStandardMaterial color={hullColor} />
      </mesh>
      <mesh position={[-0.85, 0.68, 0]} castShadow>
        <boxGeometry args={[0.26, 0.14, 0.5]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      {/* 船首斜桅＋小三角帆 */}
      <mesh position={[1.05, 0.48, 0]} rotation={[0, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.018, 0.028, 0.7, 6]} />
        <meshStandardMaterial color="#54331e" />
      </mesh>
      <mesh position={[1.05, 0.6, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.02, 0.3, 0.28]} />
        <meshStandardMaterial color="#f2ead3" side={THREE.DoubleSide} />
      </mesh>
      {/* 兩桅：鼓起的方帆（兩片微彎角度製造弧度）＋瞭望台 */}
      {[
        { x: 0.35, main: true },
        { x: -0.3, main: false },
      ].map((m, i) => (
        <group key={i} position={[m.x, 0.4, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.032, 1.25, 6]} />
            <meshStandardMaterial color="#54331e" />
          </mesh>
          {/* 主帆（兩片斜接，看起來像被風吹鼓） */}
          <mesh position={[0.06, 0.52, 0]} rotation={[0, 0, -0.08]} castShadow>
            <boxGeometry args={[0.05, 0.5, m.main ? 0.72 : 0.6]} />
            <meshStandardMaterial color="#f5efdc" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.1, 0.53, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.03, 0.42, m.main ? 0.66 : 0.55]} />
            <meshStandardMaterial color="#efe7cf" side={THREE.DoubleSide} />
          </mesh>
          {/* 上帆 */}
          <mesh position={[0.05, 0.95, 0]} rotation={[0, 0, -0.06]} castShadow>
            <boxGeometry args={[0.04, 0.28, m.main ? 0.48 : 0.4]} />
            <meshStandardMaterial color="#f5efdc" side={THREE.DoubleSide} />
          </mesh>
          {/* 帆桁 */}
          {[0.78, 1.1].map((h, k) => (
            <mesh key={k} position={[0.03, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, m.main ? 0.8 : 0.66, 5]} />
              <meshStandardMaterial color="#54331e" />
            </mesh>
          ))}
          {m.main && (
            <mesh position={[0, 1.12, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.05, 0.08, 8]} />
              <meshStandardMaterial color="#54331e" />
            </mesh>
          )}
        </group>
      ))}
      {/* 纜繩 */}
      <mesh position={[0.85, 0.78, 0]} rotation={[0, 0, -0.75]}>
        <cylinderGeometry args={[0.006, 0.006, 1.1, 4]} />
        <meshStandardMaterial color="#3d2f22" />
      </mesh>
      <mesh position={[-0.05, 0.85, 0]} rotation={[0, 0, 0.45]}>
        <cylinderGeometry args={[0.005, 0.005, 0.85, 4]} />
        <meshStandardMaterial color="#3d2f22" />
      </mesh>
      {/* 桅頂旗 */}
      <mesh position={[0.42, 1.62, 0]}>
        <boxGeometry args={[0.26, 0.14, 0.015]} />
        <meshStandardMaterial color={flagColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── 獨木舟（舷外浮桿＋三角帆＋划槳手） ── */
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
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.13, 1, 4, 8]} />
        <meshStandardMaterial color="#7d5432" />
      </mesh>
      {/* 舷外浮桿 */}
      <mesh position={[0, 0.08, 0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.045, 0.9, 4, 8]} />
        <meshStandardMaterial color="#8a6238" />
      </mesh>
      {[0.32, -0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 0.25]} rotation={[0.95, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.55, 5]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
      ))}
      {/* 三角帆 */}
      <mesh position={[0.08, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.026, 0.85, 5]} />
        <meshStandardMaterial color="#54331e" />
      </mesh>
      <mesh position={[0.27, 0.6, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.42, 0.52, 0.012]} />
        <meshStandardMaterial color="#f2e8ca" side={THREE.DoubleSide} />
      </mesh>
      <Person position={[-0.32, 0.1, 0]} color="#8f4f33" scale={0.5} hat="band" hatColor="#c0392b" />
    </group>
  );
}

/* ── 梅花鹿（脖子、耳朵、尾巴、分岔鹿角、白斑） ── */
export function Deer({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: V3;
  rotation?: number;
  scale?: number;
}) {
  const g = React.useRef<THREE.Group>(null);
  const j = React.useMemo(() => hash(...position), [position]);
  useFrame(({ clock }) => {
    // 偶爾低頭吃草的小動作
    if (g.current) g.current.rotation.x = Math.max(0, Math.sin(clock.elapsedTime * 0.5 + j * 9)) * 0.06;
  });
  return (
    <group ref={g} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* 身體 */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.34, 6, 10]} />
        <meshStandardMaterial color="#c98f52" />
      </mesh>
      {/* 白斑 */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.1 + i * 0.09, 0.52 + (i % 2) * 0.05, 0.145]}>
          <sphereGeometry args={[0.022, 6, 5]} />
          <meshStandardMaterial color="#f2e8d5" />
        </mesh>
      ))}
      {/* 腿 */}
      {[
        [-0.18, -0.08],
        [0.18, -0.08],
        [-0.18, 0.08],
        [0.18, 0.08],
      ].map(([x, z], i) => (
        <mesh key={`l${i}`} position={[x, 0.15, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.024, 0.3, 6]} />
          <meshStandardMaterial color="#b57c42" />
        </mesh>
      ))}
      {/* 脖子＋頭＋口鼻 */}
      <mesh position={[0.26, 0.62, 0]} rotation={[0, 0, -0.7]} castShadow>
        <capsuleGeometry args={[0.055, 0.22, 4, 8]} />
        <meshStandardMaterial color="#c98f52" />
      </mesh>
      <mesh position={[0.36, 0.76, 0]} castShadow>
        <sphereGeometry args={[0.095, 10, 8]} />
        <meshStandardMaterial color="#c98f52" />
      </mesh>
      <mesh position={[0.44, 0.73, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color="#b57c42" />
      </mesh>
      <mesh position={[0.48, 0.73, 0]}>
        <sphereGeometry args={[0.018, 6, 5]} />
        <meshStandardMaterial color="#2b2118" />
      </mesh>
      {/* 眼睛 */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[0.38, 0.79, s * 0.07]}>
          <sphereGeometry args={[0.016, 6, 5]} />
          <meshStandardMaterial color="#2b2118" />
        </mesh>
      ))}
      {/* 耳朵 */}
      {[-1, 1].map((s) => (
        <mesh key={`r${s}`} position={[0.32, 0.85, s * 0.07]} rotation={[s * 0.5, 0, 0.3]}>
          <coneGeometry args={[0.03, 0.09, 5]} />
          <meshStandardMaterial color="#b57c42" />
        </mesh>
      ))}
      {/* 分岔鹿角 */}
      {[-1, 1].map((s) => (
        <group key={`a${s}`} position={[0.33, 0.85, s * 0.045]}>
          <mesh rotation={[s * 0.25, 0, 0.35]}>
            <cylinderGeometry args={[0.012, 0.018, 0.18, 5]} />
            <meshStandardMaterial color="#8a5a2e" />
          </mesh>
          <mesh position={[0.02, 0.08, s * 0.02]} rotation={[s * 0.6, 0, 0.9]}>
            <cylinderGeometry args={[0.008, 0.012, 0.1, 4]} />
            <meshStandardMaterial color="#8a5a2e" />
          </mesh>
        </group>
      ))}
      {/* 尾巴 */}
      <mesh position={[-0.26, 0.52, 0]} rotation={[0, 0, 0.6]}>
        <coneGeometry args={[0.035, 0.1, 6]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
    </group>
  );
}

/* ── 陶罐（圓身＋窄口＋紋路環） ── */
export function Pot({
  position,
  scale = 1,
  color = "#c07a4a",
}: {
  position: V3;
  scale?: number;
  color?: string;
}) {
  const dark = React.useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, 0, -0.1);
    return c;
  }, [color]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} scale={[1, 1.15, 1]} castShadow>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.47, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.12, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 繩紋裝飾環 */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.215, 0.012, 6, 18]} />
        <meshStandardMaterial color={dark} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.225, 0.01, 6, 18]} />
        <meshStandardMaterial color={dark} />
      </mesh>
    </group>
  );
}

/* ── 石頭（兩顆疊放、顏色微差） ── */
export function Rock({
  position,
  scale = 1,
  color = "#9aa0a6",
}: {
  position: V3;
  scale?: number;
  color?: string;
}) {
  const j = React.useMemo(() => hash(...position), [position]);
  return (
    <group position={position} scale={scale} rotation={[j * 0.4, j * 6.28, 0]}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.18, 0.14, 0.1]} scale={0.45} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

/* ── 冒煙（往上飄、循環的半透明球） ── */
export function Smoke({ position, scale = 1 }: { position: V3; scale?: number }) {
  const refs = [
    React.useRef<THREE.Mesh>(null),
    React.useRef<THREE.Mesh>(null),
    React.useRef<THREE.Mesh>(null),
    React.useRef<THREE.Mesh>(null),
  ];
  useFrame(({ clock }) => {
    refs.forEach((r, i) => {
      if (!r.current) return;
      const t = (clock.elapsedTime * 0.45 + i * 0.25) % 1;
      r.current.position.y = t * 1.9;
      r.current.position.x = Math.sin((t + i) * 4) * 0.18;
      const s = 0.13 + t * 0.26;
      r.current.scale.set(s, s, s);
      (r.current.material as THREE.MeshStandardMaterial).opacity = 0.45 * (1 - t);
    });
  });
  return (
    <group position={position} scale={scale}>
      {refs.map((r, i) => (
        <mesh key={i} ref={r}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#e3e3e3" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── 牌樓／時光門（紅柱、雙層簷、匾額） ── */
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
  const roof = React.useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, 0.05, -0.15);
    return c;
  }, [color]);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.12, 10]} />
            <meshStandardMaterial color="#8d8478" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 1.9, 10]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}
      {/* 雙層簷（上簷微翹） */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <boxGeometry args={[2.15, 0.16, 0.34]} />
        <meshStandardMaterial color={roof} />
      </mesh>
      <mesh position={[0, 2.28, 0]} castShadow>
        <boxGeometry args={[2.5, 0.14, 0.4]} />
        <meshStandardMaterial color={roof} />
      </mesh>
      {[-1.28, 1.28].map((x, i) => (
        <mesh key={`t${i}`} position={[x, 2.36, 0]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.4]} />
          <meshStandardMaterial color={roof} />
        </mesh>
      ))}
      {/* 匾額 */}
      <mesh position={[0, 1.78, 0.02]}>
        <boxGeometry args={[0.6, 0.3, 0.06]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
    </group>
  );
}

/* ── 木箱堆（板條＋金屬邊） ── */
export function Crates({ position, scale = 1 }: { position: V3; scale?: number }) {
  const crate = (p: V3, s: number, c: string) => (
    <group position={p}>
      <mesh castShadow>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color={c} />
      </mesh>
      {/* 板條線 */}
      <mesh position={[0, 0, s / 2 + 0.002]}>
        <boxGeometry args={[s * 1.02, s * 0.14, 0.008]} />
        <meshStandardMaterial color="#6d4a2a" />
      </mesh>
      <mesh position={[0, 0, -s / 2 - 0.002]}>
        <boxGeometry args={[s * 1.02, s * 0.14, 0.008]} />
        <meshStandardMaterial color="#6d4a2a" />
      </mesh>
    </group>
  );
  return (
    <group position={position} scale={scale}>
      {crate([0, 0.2, 0], 0.4, "#a97c4a")}
      {crate([0.46, 0.17, 0.1], 0.34, "#8f6538")}
      {crate([0.2, 0.56, 0], 0.3, "#bd8f5a")}
      {/* 一袋米 */}
      <mesh position={[-0.35, 0.15, 0.15]} scale={[1, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#e3d3a4" />
      </mesh>
    </group>
  );
}

/* ── 一小塊田（土壟＋綠色作物條＋豆苗點） ── */
export function Field({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 1.8]} />
        <meshStandardMaterial color="#7a5c39" />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.13, 0]} receiveShadow>
            <boxGeometry args={[0.28, 0.12, 1.6]} />
            <meshStandardMaterial color="#5d9b4e" />
          </mesh>
          {[-0.55, 0, 0.55].map((z, k) => (
            <mesh key={k} position={[x, 0.24, z]} castShadow>
              <sphereGeometry args={[0.05, 6, 5]} />
              <meshStandardMaterial color="#6fae52" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── 弧形飛行箭頭（貿易路線／進軍路線，發光吃 Bloom） ── */
export function ArcTube({
  from,
  to,
  height = 2,
  color = "#ffffff",
  radius = 0.07,
  opacity = 0.9,
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
        <tubeGeometry args={[curve, 28, radius, 8, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={opacity} />
      </mesh>
      <mesh position={end.pos} quaternion={coneQuat}>
        <coneGeometry args={[radius * 3, radius * 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

/* ── 點狀航線（微發光小球） ── */
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
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
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
