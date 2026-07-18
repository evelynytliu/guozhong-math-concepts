"use client";

// 場景 0「歷史學家的工具箱」的 3D 佈景：時光工房。
// 三區：書房（x≈-6：書桌、書牆、學者）、文字之門（z≈-6：史前石門 vs 歷史紙門＋大毛筆）、
// 時間巨輪（x≈6：大時鐘＋四面紀年旗＋1894/1912 里程碑）。

import * as React from "react";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Flag, Gate, Person, Pot, Rock } from "./primitives";
import {
  DriftingClouds,
  SceneLights,
  SkyDome,
  Torch,
} from "./environment";

/* 一疊書 */
function BookStack({ position, n = 3 }: { position: [number, number, number]; n?: number }) {
  const colors = ["#b3452f", "#3f6fae", "#3f8f52", "#c9a227", "#6b4a86"];
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 2.3) * 0.03, 0.05 + i * 0.09, 0]}
          rotation={[0, i * 0.25, 0]}
          castShadow
        >
          <boxGeometry args={[0.42, 0.08, 0.3]} />
          <meshStandardMaterial color={colors[i % colors.length]} />
        </mesh>
      ))}
    </group>
  );
}

/* 大時鐘（立起來的鐘面＋會走的指針） */
function BigClock({ position }: { position: [number, number, number] }) {
  const minute = React.useRef<THREE.Mesh>(null);
  const hour = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (minute.current) minute.current.rotation.z = -clock.elapsedTime * 0.5;
    if (hour.current) hour.current.rotation.z = -clock.elapsedTime * 0.04;
  });
  return (
    <group position={position}>
      {/* 支柱 */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 2, 8]} />
        <meshStandardMaterial color="#7d6248" />
      </mesh>
      {/* 鐘框＋鐘面 */}
      <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.15, 0.14, 10, 28]} />
        <meshStandardMaterial color="#c9a227" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.08, 28]} />
        <meshStandardMaterial color="#f7f1e3" />
      </mesh>
      {/* 12 個刻度 */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.88, 2.6 + Math.cos(a) * 0.88, 0.06]}
          >
            <boxGeometry args={[0.07, 0.16, 0.03]} />
            <meshStandardMaterial color="#4a3320" />
          </mesh>
        );
      })}
      {/* 指針（分針/時針） */}
      <group position={[0, 2.6, 0.09]}>
        <mesh ref={minute}>
          <boxGeometry args={[0.06, 1.55, 0.03]} />
          <meshStandardMaterial color="#b3452f" />
        </mesh>
        <mesh ref={hour}>
          <boxGeometry args={[0.09, 1.05, 0.03]} />
          <meshStandardMaterial color="#2b2118" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* 年份里程碑（小石碑＋字版） */
function Milestone({
  position,
  color = "#e8dbc0",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.5, 0.16, 0.36]} />
        <meshStandardMaterial color="#8d8478" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.42, 0.7, 0.12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function ThreeWDiorama(_props: { stageIndex: number }) {
  return (
    <group>
      <color attach="background" args={["#e8dcc8"]} />
      <fog attach="fog" args={["#e8dcc8", 32, 70]} />
      <SkyDome top="#8fb8dc" horizon="#f5e6c8" below="#b8a684" sunDir={[-0.4, 0.32, 0.45]} sunGlow="#ffe3a8" />
      <SceneLights sun={[-10, 16, 10]} sunColor="#ffe8c2" intensity={1.2} shadowSize={20} groundColor="#8a7a5c" />
      <DriftingClouds count={4} />
      {/* 空氣中的金色時光塵埃 */}
      <Sparkles count={60} position={[0, 3, -1]} scale={[22, 5, 16]} size={2} speed={0.2} opacity={0.5} color="#ffd98a" />

      {/* ── 工房大地板（木紋圓台＋地毯） ── */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[16, 17, 0.5, 36]} />
        <meshStandardMaterial color="#b08d5d" />
      </mesh>
      <mesh position={[0, 0.01, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.5, 32]} />
        <meshStandardMaterial color="#a34a3f" />
      </mesh>
      <mesh position={[0, 0.02, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.6, 6, 32]} />
        <meshStandardMaterial color="#e8c33d" />
      </mesh>

      {/* ── 書房區（x≈-6） ── */}
      <group position={[-6, 0, 0]}>
        {/* 書桌 */}
        <mesh position={[0, 0.72, -0.3]} castShadow>
          <boxGeometry args={[2.6, 0.12, 1.3]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
        {[
          [-1.1, -0.8],
          [1.1, -0.8],
          [-1.1, 0.2],
          [1.1, 0.2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.35, z]} castShadow>
            <boxGeometry args={[0.12, 0.72, 0.12]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
        ))}
        {/* 桌上：書、卷軸、陶罐、放大鏡 */}
        <BookStack position={[-0.8, 0.78, -0.4]} n={4} />
        <mesh position={[0.2, 0.85, -0.5]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 10]} />
          <meshStandardMaterial color="#f2e8d0" />
        </mesh>
        <Pot position={[0.9, 0.78, -0.5]} scale={0.55} />
        {/* 放大鏡 */}
        <group position={[0.35, 0.82, 0.1]} rotation={[-Math.PI / 2.3, 0, 0.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.03, 8, 18]} />
            <meshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 18]} />
            <meshStandardMaterial color="#bfe0ea" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.22, -0.2, 0]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[0.025, 0.03, 0.3, 6]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
        </group>
        {/* 學者 */}
        <Person position={[0, 0, 1.2]} color="#4a6b8a" rotation={Math.PI} hat="band" hatColor="#2b2118" />
        {/* 書牆 */}
        <group position={[0, 0, -2.9]}>
          <mesh position={[0, 1.3, 0]} castShadow>
            <boxGeometry args={[3.4, 2.6, 0.5]} />
            <meshStandardMaterial color="#6d4a2a" />
          </mesh>
          {[0.5, 1.15, 1.8, 2.45].map((y, r) => (
            <group key={r}>
              {[-1.3, -0.85, -0.4, 0.05, 0.5, 0.95, 1.3].map((x, i) => (
                <mesh key={i} position={[x, y, 0.28]} castShadow>
                  <boxGeometry args={[0.28, 0.5, 0.1]} />
                  <meshStandardMaterial
                    color={["#b3452f", "#3f6fae", "#3f8f52", "#c9a227", "#6b4a86", "#c05a3a"][(i + r) % 6]}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
        {/* 事件告示牌（歷史事件） */}
        <group position={[-2.4, 0, 0.8]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 1.4, 6]} />
            <meshStandardMaterial color="#7d6248" />
          </mesh>
          <mesh position={[0, 1.15, 0]} castShadow>
            <boxGeometry args={[0.9, 0.6, 0.06]} />
            <meshStandardMaterial color="#f2e8d0" />
          </mesh>
          {[0.28, 0.13, -0.02].map((y, i) => (
            <mesh key={i} position={[0, 0.87 + y, 0.035]}>
              <boxGeometry args={[0.64 - i * 0.1, 0.05, 0.01]} />
              <meshStandardMaterial color="#8d8478" />
            </mesh>
          ))}
        </group>
        <Torch position={[2.2, 0, 1.6]} scale={0.9} />
      </group>

      {/* ── 文字之門（z≈-6） ── */}
      <group position={[0, 0, -5.6]}>
        {/* 史前石門（岩畫） */}
        <group position={[-2.4, 0, 0.4]}>
          <Gate position={[0, 0, 0]} color="#8d8478" scale={0.8} />
          <Rock position={[-1, 0.1, 0.5]} scale={0.8} />
          {/* 岩畫（鹿與人的塗鴉色塊） */}
          <mesh position={[-0.3, 1, 0.12]}>
            <boxGeometry args={[0.3, 0.18, 0.02]} />
            <meshStandardMaterial color="#a34a3f" />
          </mesh>
          <mesh position={[0.25, 0.85, 0.12]}>
            <boxGeometry args={[0.12, 0.3, 0.02]} />
            <meshStandardMaterial color="#a34a3f" />
          </mesh>
        </group>
        {/* 歷史紙門（竹簡/紙卷） */}
        <group position={[2.4, 0, 0]}>
          <Gate position={[0, 0, 0]} color="#c05a3a" scale={0.8} />
          {/* 垂掛的紙卷 */}
          {[-0.4, 0.1, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 1.15, 0.1]} castShadow>
              <boxGeometry args={[0.26, 0.9 - i * 0.15, 0.02]} />
              <meshStandardMaterial color="#f7f1e3" />
            </mesh>
          ))}
        </group>
        {/* 中央大毛筆紀念碑 */}
        <group position={[0, 0, -0.6]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.85, 0.3, 10]} />
            <meshStandardMaterial color="#cbb896" />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 2.6, 10]} />
            <meshStandardMaterial color="#2b2118" />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.16, 0.5, 10]} />
            <meshStandardMaterial color="#f2e8d0" />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 10]} />
            <meshStandardMaterial color="#2b2118" />
          </mesh>
        </group>
      </group>

      {/* ── 時間巨輪區（x≈6） ── */}
      <group position={[6, 0, 0]}>
        <BigClock position={[0.2, 0, -0.4]} />
        {/* 四面紀年旗（位置對應資料檔熱點） */}
        <Flag position={[-2.1, 0, 2.3]} color="#f2ead3" stripe="#c9a227" height={1.7} />
        <Flag position={[2.6, 0, 1.7]} color="#3f6fae" stripe="#f2ead3" height={1.7} />
        <Flag position={[-1.9, 0, -1.9]} color="#c0392b" stripe="#e8c33d" height={1.7} />
        <Flag position={[2.4, 0, -2.3]} color="#6b4a86" stripe="#c9a227" height={1.7} />
        {/* 1894 / 1912 里程碑＋石板小徑 */}
        <Milestone position={[-0.9, 0, 2.9]} color="#dcc9a0" />
        <Milestone position={[1.4, 0, 2.7]} color="#e8dbc0" />
        {[
          [-2.2, 3.6],
          [-0.9, 3.4],
          [0.3, 3.3],
          [1.5, 3.2],
          [2.7, 3.4],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, i]}>
            <circleGeometry args={[0.32, 8]} />
            <meshStandardMaterial color="#9c8f7c" />
          </mesh>
        ))}
        <Person position={[-0.6, 0, 1.4]} color="#c9793f" rotation={0.6} hat="straw" scale={0.9} />
      </group>
    </group>
  );
}
