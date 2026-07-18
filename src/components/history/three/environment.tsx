"use client";

// 場景「環境套件」——天空、水、雲、鳥、打光。
// 這一層是畫面質感的地基：每個佈景都用同一組環境元件，
// 只調參數（太陽方向、水色、天色）就能有一致又精緻的遊戲感。

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type V3 = [number, number, number];

/* ── 三點打光組：主太陽光（投影）＋天空半球光＋逆光補光 ── */
export function SceneLights({
  sun = [14, 20, 10] as V3,
  intensity = 1.3,
  sunColor = "#fff2dc",
  skyColor = "#bcd8ff",
  groundColor = "#4a5d3f",
  shadowSize = 26,
}: {
  sun?: V3;
  intensity?: number;
  sunColor?: string;
  skyColor?: string;
  groundColor?: string;
  shadowSize?: number;
}) {
  return (
    <group>
      <hemisphereLight args={[skyColor, groundColor, 0.6]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        castShadow
        position={sun}
        intensity={intensity}
        color={sunColor}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* 冷色逆光，讓輪廓從背景跳出來（遊戲感關鍵） */}
      <directionalLight
        position={[-sun[0], sun[1] * 0.5, -sun[2]]}
        intensity={0.35}
        color="#a8c8ff"
      />
    </group>
  );
}

/* ── 天空穹頂：直式漸層＋太陽光暈（shader，不吃霧） ── */
export function SkyDome({
  top = "#5aa9e6",
  horizon = "#dff3fb",
  below = "#3a86ad",
  sunDir = [0.5, 0.35, 0.4] as V3,
  sunGlow = "#fff3c4",
  radius = 120,
}: {
  top?: string;
  horizon?: string;
  below?: string; // 地平線以下的顏色（遠方的海），讓水面看起來無限延伸
  sunDir?: V3;
  sunGlow?: string;
  radius?: number;
}) {
  const uniforms = React.useMemo(
    () => ({
      // 注意：這裡「不」轉 linear——實測這條管線對自訂 shader 是原值直出，
      // 給 sRGB hex 就會顯示 sRGB hex（改動前先截圖驗證，別憑理論改）。
      uTop: { value: new THREE.Color(top) },
      uHorizon: { value: new THREE.Color(horizon) },
      uBelow: { value: new THREE.Color(below) },
      uSunDir: { value: new THREE.Vector3(...sunDir).normalize() },
      uSunGlow: { value: new THREE.Color(sunGlow) },
    }),
    [top, horizon, below, sunDir, sunGlow],
  );
  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 32, 20]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uBelow;
          uniform vec3 uSunDir; uniform vec3 uSunGlow;
          varying vec3 vDir;
          void main() {
            float h = smoothstep(0.0, 0.5, vDir.y);
            vec3 sky = mix(uHorizon, uTop, h);
            // 地平線以下＝遠海：貼近地平線帶一點霧白，往下漸深
            vec3 sea = mix(uHorizon, uBelow, smoothstep(0.0, -0.12, vDir.y));
            vec3 col = vDir.y >= 0.0 ? sky : sea;
            float sun = pow(max(dot(normalize(vDir), uSunDir), 0.0), 24.0);
            col += uSunGlow * sun * 0.85;
            float halo = pow(max(dot(normalize(vDir), uSunDir), 0.0), 4.0);
            col += uSunGlow * halo * 0.12;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ── 風格化水面：波光、閃爍、輕微起伏（unlit shader） ── */
export function StylizedWater({
  position = [0, -0.15, 0] as V3,
  radius = 70,
  shallow = "#7fd8e8",
  deep = "#2f86b8",
}: {
  position?: V3;
  radius?: number;
  shallow?: string;
  deep?: string;
}) {
  const mat = React.useRef<THREE.ShaderMaterial>(null);
  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color(shallow) },
      uDeep: { value: new THREE.Color(deep) },
    }),
    [shallow, deep],
  );
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 64]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin(p.x * 0.45 + uTime * 0.9) * 0.09
                 + cos(p.y * 0.38 + uTime * 0.7) * 0.09;
            vPos = p;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime; uniform vec3 uShallow; uniform vec3 uDeep;
          varying vec2 vUv; varying vec3 vPos;
          void main() {
            // 用世界座標距離做深淺（vPos.xy 是旋轉前的平面座標＝世界 xz 偏移）
            float d = length(vPos.xy);
            vec3 col = mix(uShallow, uDeep, smoothstep(2.0, 13.0, d));
            // 近景才有細節，遠景乾淨（不然滿畫面白點）
            float fade = 1.0 - smoothstep(14.0, 32.0, d);
            // 大片緩慢流動的亮帶（陽光在水面的舞動）
            float band = sin(vPos.x * 0.5 + uTime * 0.55) * sin(vPos.y * 0.38 - uTime * 0.4);
            col += vec3(0.03, 0.045, 0.05) * smoothstep(0.1, 0.95, band) * (0.35 + 0.65 * fade);
            // 細碎閃光
            float sp = sin(vPos.x * 14.0 + uTime * 2.2) * sin(vPos.y * 17.0 - uTime * 1.9);
            col += vec3(0.5) * smoothstep(0.985, 1.0, sp) * fade;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ── 飄動的卡通雲（幾顆白球組成，緩慢橫移循環） ── */
function CloudPuff({ seed }: { seed: number }) {
  const g = React.useRef<THREE.Group>(null);
  const base = React.useMemo(() => {
    const rand = (i: number) => {
      const x = Math.sin(seed * 91.7 + i * 47.3) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      y: 12 + rand(1) * 8,
      z: -30 + rand(2) * 50,
      speed: 0.25 + rand(3) * 0.35,
      scale: 1.1 + rand(4) * 1.3,
      offset: rand(5) * 120,
      blobs: [0, 1, 2, 3].map((i) => ({
        x: (rand(10 + i) - 0.5) * 3.2,
        y: (rand(20 + i) - 0.5) * 0.9,
        z: (rand(30 + i) - 0.5) * 1.4,
        s: 0.8 + rand(40 + i) * 0.9,
      })),
    };
  }, [seed]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const x = ((clock.elapsedTime * base.speed + base.offset) % 120) - 60;
    g.current.position.set(x, base.y, base.z);
  });
  return (
    <group ref={g} scale={base.scale}>
      {base.blobs.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} scale={[1.6, 0.85, 1]}>
          <sphereGeometry args={[b.s, 10, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#dfeaff" emissiveIntensity={0.25} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

export function DriftingClouds({ count = 5 }: { count?: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <CloudPuff key={i} seed={i + 1} />
      ))}
    </group>
  );
}

/* ── 繞圈飛的海鳥（翅膀會拍動） ── */
function Bird({ phase, radius, height }: { phase: number; radius: number; height: number }) {
  const g = React.useRef<THREE.Group>(null);
  const wL = React.useRef<THREE.Mesh>(null);
  const wR = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.25 + phase;
    if (g.current) {
      g.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 3) * 0.6, Math.sin(t) * radius);
      g.current.rotation.y = -t - Math.PI / 2;
    }
    const flap = Math.sin(clock.elapsedTime * 9 + phase * 7) * 0.7;
    if (wL.current) wL.current.rotation.z = flap;
    if (wR.current) wR.current.rotation.z = -flap;
  });
  return (
    <group ref={g}>
      <mesh scale={[0.32, 0.1, 0.1]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      <mesh ref={wL} position={[0, 0.02, 0.05]}>
        <boxGeometry args={[0.16, 0.02, 0.42]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
      <mesh ref={wR} position={[0, 0.02, -0.05]}>
        <boxGeometry args={[0.16, 0.02, 0.42]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>
    </group>
  );
}

export function Seabirds({
  center = [0, 0, 0] as V3,
  count = 3,
  radius = 9,
  height = 7,
}: {
  center?: V3;
  count?: number;
  radius?: number;
  height?: number;
}) {
  return (
    <group position={center}>
      {Array.from({ length: count }, (_, i) => (
        <Bird key={i} phase={(i / count) * Math.PI * 2} radius={radius + i * 1.3} height={height + i * 0.8} />
      ))}
    </group>
  );
}

/* ── 小草叢（幾根彎葉片） ── */
export function GrassTuft({ position, scale = 1, color = "#5f9e4a" }: { position: V3; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 1.7) * 0.06, 0.12, Math.sin(i * 1.7) * 0.06]}
          rotation={[Math.cos(i) * 0.35, i * 1.6, Math.sin(i) * 0.3]}
        >
          <coneGeometry args={[0.035, 0.3, 4]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ── 小花（莖＋花瓣球） ── */
export function Flower({ position, color = "#ff8fb3", scale = 1 }: { position: V3; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.2, 5]} />
        <meshStandardMaterial color="#4c8a3f" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.055, 7, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.024, 6, 5]} />
        <meshStandardMaterial color="#ffe28a" emissive="#ffd34d" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ── 火把（木桿＋跳動火焰＋光） ── */
export function Torch({ position, scale = 1 }: { position: V3; scale?: number }) {
  const flame = React.useRef<THREE.Mesh>(null);
  const light = React.useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (flame.current) {
      const s = 1 + Math.sin(t * 8 + position[0] * 3) * 0.15;
      flame.current.scale.set(s, 1 + Math.sin(t * 6 + position[2]) * 0.25, s);
    }
    if (light.current) light.current.intensity = 1.5 + Math.sin(t * 10 + position[0]) * 0.35;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.045, 0.8, 6]} />
        <meshStandardMaterial color="#6d4a2a" flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.06, 0.045, 0.12, 6]} />
        <meshStandardMaterial color="#3d2f22" flatShading />
      </mesh>
      <mesh ref={flame} position={[0, 0.98, 0]}>
        <coneGeometry args={[0.07, 0.24, 6]} />
        <meshStandardMaterial color="#ffb347" emissive="#ff7a00" emissiveIntensity={2.2} />
      </mesh>
      <pointLight ref={light} position={[0, 1.05, 0]} color="#ffab52" distance={5} decay={2} />
    </group>
  );
}

/* ── 船的航跡漣漪：一圈圈擴散淡出的白環 ── */
export function WakeRings({ position, scale = 1 }: { position: V3; scale?: number }) {
  const refs = [React.useRef<THREE.Mesh>(null), React.useRef<THREE.Mesh>(null), React.useRef<THREE.Mesh>(null)];
  useFrame(({ clock }) => {
    refs.forEach((r, i) => {
      if (!r.current) return;
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1;
      const s = 0.3 + t * 1.6;
      r.current.scale.set(s, s, s);
      (r.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - t);
    });
  });
  return (
    <group position={position} scale={scale}>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.85, 1, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
