"use client";

// 場景 1-1「時光洞穴」的 3D 佈景：一面考古剖面大崖壁。
// 地表 y=0（八仙洞考古現場）、金屬器層 y=-6、新石器層 y=-12、舊石器層 y=-18。
// 鏡頭（由 scene-1-cave.ts 的 camera 定義）先降到最深，再一層層往上＝時間往前走。

import * as React from "react";
import {
  Campfire,
  Crates,
  Deer,
  Hut,
  PalmTree,
  Person,
  Pot,
  Rock,
  Smoke,
} from "./primitives";

/* 一條從地表通到最深層的木梯（暗示「往下挖」的路徑） */
function Ladder() {
  const rungs = [];
  for (let y = -0.6; y > -18; y -= 1.2) rungs.push(y);
  return (
    <group position={[5.4, 0, 0.6]}>
      {[-0.35, 0.35].map((x, i) => (
        <mesh key={i} position={[x, -9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 18.6, 6]} />
          <meshStandardMaterial color="#7d6248" flatShading />
        </mesh>
      ))}
      {rungs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.7, 6]} />
          <meshStandardMaterial color="#93765a" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* 石板棺（灰色板組成的小棺＋玉飾） */
function SlateCoffin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.5]} />
        <meshStandardMaterial color="#7f8a92" flatShading />
      </mesh>
      {[
        { p: [0, 0.22, 0.22] as const, s: [0.9, 0.28, 0.06] as const },
        { p: [0, 0.22, -0.22] as const, s: [0.9, 0.28, 0.06] as const },
        { p: [0.44, 0.22, 0] as const, s: [0.06, 0.28, 0.42] as const },
        { p: [-0.44, 0.22, 0] as const, s: [0.06, 0.28, 0.42] as const },
      ].map((w, i) => (
        <mesh key={i} position={[...w.p]}>
          <boxGeometry args={[...w.s]} />
          <meshStandardMaterial color="#8d99a3" flatShading />
        </mesh>
      ))}
      {/* 人獸形玉器（綠色小環） */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.035, 8, 12]} />
        <meshStandardMaterial color="#3fae7c" emissive="#1c7a51" emissiveIntensity={0.4} flatShading />
      </mesh>
    </group>
  );
}

/* 煉鐵爐（十三行）：圓爐＋火光＋煙 */
function Furnace({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.42, 0.55, 0.9, 8]} />
        <meshStandardMaterial color="#8a7b6b" flatShading />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.15, 8]} />
        <meshStandardMaterial color="#6f6154" flatShading />
      </mesh>
      <mesh position={[0, 0.93, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#ff7b2d" emissive="#ff4d00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.35, 0.5]}>
        <boxGeometry args={[0.24, 0.2, 0.2]} />
        <meshStandardMaterial color="#4c4238" flatShading />
      </mesh>
      <pointLight position={[0, 1.1, 0.3]} color="#ff8c42" intensity={1.6} distance={5} decay={2} />
      <Smoke position={[0, 1.05, 0]} scale={0.8} />
    </group>
  );
}

/* 一小塊田（幾條綠壟） */
function Field({ position }: { position: [number, number, number] }) {
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

/* 貝塚（白貝殼小山） */
function ShellMound({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.7, 0.7, 9]} />
        <meshStandardMaterial color="#e8e2d2" flatShading />
      </mesh>
      {[
        [0.2, 0.62, 0.1],
        [-0.25, 0.45, 0.2],
        [0.05, 0.5, -0.3],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0.4 * i, i, 0]}>
          <coneGeometry args={[0.09, 0.05, 6]} />
          <meshStandardMaterial color="#f7f3e8" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* 一層文化層的地板與洞窟背景 */
function Level({
  y,
  floorColor,
  caveColor = "#2e2823",
  children,
}: {
  y: number;
  floorColor: string;
  caveColor?: string;
  children: React.ReactNode;
}) {
  return (
    <group>
      {/* 地板 */}
      <mesh position={[0, y - 0.3, -0.8]}>
        <boxGeometry args={[13.5, 0.6, 7.5]} />
        <meshStandardMaterial color={floorColor} flatShading />
      </mesh>
      {/* 洞窟開口（深色圓弧背景） */}
      <mesh position={[0, y + 1.7, -4.25]}>
        <circleGeometry args={[3.4, 24]} />
        <meshStandardMaterial color={caveColor} />
      </mesh>
      {/* 柔和補光 */}
      <pointLight position={[0, y + 3, 2]} color="#ffe9c8" intensity={0.7} distance={12} decay={2} />
      <group position={[0, y, 0]}>{children}</group>
    </group>
  );
}

export function CaveDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#cde7f0"]} />
      <fog attach="fog" args={["#cde7f0", 24, 60]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[8, 14, 8]} intensity={1.05} />

      {/* ── 大崖壁（貫穿所有層） ── */}
      <mesh position={[0, -8, -6.6]}>
        <boxGeometry args={[28, 30, 4]} />
        <meshStandardMaterial color="#a89a86" flatShading />
      </mesh>
      {/* 文化層色帶：越深越老（金屬器/新石器/舊石器） */}
      {[
        { y: -3.5, c: "#b0705a" },
        { y: -9.5, c: "#c2955f" },
        { y: -15.5, c: "#8d8478" },
      ].map((b, i) => (
        <mesh key={i} position={[0, b.y, -4.55]}>
          <boxGeometry args={[28, 6, 0.25]} />
          <meshStandardMaterial color={b.c} flatShading />
        </mesh>
      ))}
      {/* 地表上方的崖面與八仙洞洞口 */}
      {[
        { p: [-3.5, 2.6, -4.4] as const, r: 0.7 },
        { p: [0.5, 3.4, -4.4] as const, r: 0.9 },
        { p: [3.8, 2.2, -4.4] as const, r: 0.55 },
        { p: [-1.2, 4.6, -4.4] as const, r: 0.5 },
      ].map((c, i) => (
        <mesh key={i} position={[...c.p]}>
          <circleGeometry args={[c.r, 20]} />
          <meshStandardMaterial color="#33302b" />
        </mesh>
      ))}

      <Ladder />

      {/* ── 地表：八仙洞考古現場 ── */}
      <group>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[28, 0.3, 13]} />
          <meshStandardMaterial color="#7fae62" flatShading />
        </mesh>
        {/* 海（在鏡頭後方延伸） */}
        <mesh position={[0, -0.45, 13]}>
          <boxGeometry args={[40, 0.3, 14]} />
          <meshStandardMaterial color="#5fb4cf" flatShading />
        </mesh>
        {/* 沙灘過渡 */}
        <mesh position={[0, -0.28, 7.2]}>
          <boxGeometry args={[28, 0.3, 3]} />
          <meshStandardMaterial color="#e3d3a4" flatShading />
        </mesh>
        {/* 考古帳棚 */}
        <mesh position={[-2.8, 0.55, 1.4]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[1, 1.1, 4]} />
          <meshStandardMaterial color="#f2ede0" flatShading />
        </mesh>
        <Person position={[-1.6, 0, 2.2]} color="#4a7fae" />
        <Person position={[2.2, 0, 0.9]} color="#c9793f" scale={0.85} />
        <Crates position={[1.2, 0, 2.6]} scale={0.8} />
        <PalmTree position={[4.6, 0, 4.6]} />
        <PalmTree position={[-5.2, 0, 5]} scale={0.85} />
        {/* 挖掘坑（提示往下） */}
        <mesh position={[0.4, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 1.6]} />
          <meshStandardMaterial color="#4c4238" />
        </mesh>
      </group>

      {/* ── 金屬器層（y=-6）：十三行 ── */}
      <Level y={-6} floorColor="#9c8468">
        <Furnace position={[-2.6, 0, 0.8]} />
        <Person position={[-1.7, 0, 1.4]} color="#8f5c33" rotation={-0.6} />
        {/* 干欄式小屋 */}
        <group position={[0.8, 0, -2]}>
          {[
            [-0.5, -0.35],
            [0.5, -0.35],
            [-0.5, 0.35],
            [0.5, 0.35],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.3, z]}>
              <cylinderGeometry args={[0.06, 0.06, 0.6, 6]} />
              <meshStandardMaterial color="#7d6248" flatShading />
            </mesh>
          ))}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.5, 0.5, 1]} />
            <meshStandardMaterial color="#c9a06a" flatShading />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[1, 0.55, 4]} />
            <meshStandardMaterial color="#9a7b3f" flatShading />
          </mesh>
        </group>
        {/* 人面陶罐（有眼睛的罐子） */}
        <group position={[1.8, 0, 1.4]}>
          <Pot position={[0, 0, 0]} scale={1.25} color="#b56a42" />
          {[-0.08, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.32, 0.24]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshStandardMaterial color="#3a2a1e" />
            </mesh>
          ))}
          <mesh position={[0, 0.24, 0.26]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
        </group>
        {/* 貿易品：木箱＋玻璃手環＋銅錢 */}
        <Crates position={[3.1, 0, -0.4]} scale={0.9} />
        <mesh position={[2.9, 0.08, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.045, 8, 14]} />
          <meshStandardMaterial color="#4fc3d9" emissive="#1c7a8a" emissiveIntensity={0.5} flatShading />
        </mesh>
        <mesh position={[3.5, 0.06, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.03, 12]} />
          <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.4} />
        </mesh>
        <Person position={[2.4, 0, 2.2]} color="#5c7d9e" rotation={2.6} scale={0.9} />
      </Level>

      {/* ── 新石器層（y=-12）：大坌坑・圓山・卑南 ── */}
      <Level y={-12} floorColor="#b08d5d">
        <Hut position={[-0.6, 0, -1.9]} scale={0.95} rotation={0.3} />
        <Hut position={[1.3, 0, -2.4]} scale={0.75} rotation={-0.4} />
        <Field position={[3.1, 0, -0.2]} />
        <Person position={[3.4, 0, 1]} color="#6f8f4e" rotation={2.8} scale={0.9} />
        {/* 磨石器的人（蹲著磨） */}
        <Person position={[2.6, 0, -1.6]} color="#9e6b3f" rotation={1.2} scale={0.8} />
        <mesh position={[2.9, 0.1, -1.3]}>
          <boxGeometry args={[0.5, 0.16, 0.4]} />
          <meshStandardMaterial color="#8d99a3" flatShading />
        </mesh>
        {/* 製陶的人＋陶器 */}
        <Person position={[-2.4, 0, 0.4]} color="#b0713f" rotation={-1.8} scale={0.9} />
        <Pot position={[-2.9, 0, 1]} scale={0.9} color="#a4623c" />
        <Pot position={[-2.2, 0, 1.3]} scale={0.7} />
        {/* 圓山貝塚 */}
        <ShellMound position={[-1.3, 0, 1.7]} />
        {/* 卑南石板棺 */}
        <SlateCoffin position={[2, 0, 1.2]} />
        {/* 家畜（小豬圈） */}
        <group position={[-3.4, 0, -1.4]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.55, 0.32, 0.3]} />
            <meshStandardMaterial color="#e2a9a1" flatShading />
          </mesh>
          <mesh position={[0.32, 0.3, 0]}>
            <boxGeometry args={[0.18, 0.2, 0.22]} />
            <meshStandardMaterial color="#e2a9a1" flatShading />
          </mesh>
        </group>
      </Level>

      {/* ── 舊石器層（y=-18）：長濱文化的洞穴 ── */}
      <Level y={-18} floorColor="#8d8478" caveColor="#241f1b">
        <Campfire position={[0.2, 0, -0.6]} />
        <Person position={[-0.9, 0, 0.2]} color="#8a5a35" rotation={0.8} />
        <Person position={[1.2, 0, 0.3]} color="#7d5230" rotation={-1} scale={0.9} />
        <Person position={[0.1, 0, 1.2]} color="#96633a" rotation={0} scale={0.75} />
        {/* 敲石器的人＋石片 */}
        <Person position={[1.9, 0, 1.6]} color="#8a5a35" rotation={-2.2} scale={0.85} />
        <Rock position={[1.5, 0.12, 1.9]} scale={0.6} />
        <Rock position={[2.3, 0.08, 1.3]} scale={0.4} color="#7c8288" />
        <Rock position={[-2.2, 0.15, -1]} scale={0.9} color="#847d74" />
        {/* 獵物（鹿）與魚 */}
        <Deer position={[-3.1, 0, 1]} rotation={2.4} scale={0.8} />
        <mesh position={[3.1, 0.08, -0.2]} rotation={[0, 0.6, 0]}>
          <coneGeometry args={[0.1, 0.5, 5]} />
          <meshStandardMaterial color="#6f9fb5" flatShading />
        </mesh>
        {/* 洞頂鐘乳石 */}
        {[
          [-2.5, 4.2, -3.5],
          [-0.8, 4.5, -3.8],
          [1.6, 4.3, -3.6],
        ].map((p, i) => (
          <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.22, 0.9 + i * 0.2, 6]} />
            <meshStandardMaterial color="#6f675e" flatShading />
          </mesh>
        ))}
      </Level>
    </group>
  );
}
