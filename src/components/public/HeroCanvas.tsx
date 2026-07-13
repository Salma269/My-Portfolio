import { Box, Line, Sphere } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import type { Group } from 'three';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const hasWebgl = Boolean(canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smallViewport = window.innerWidth < 760;
    const lowMemory = ((navigator as NavigatorWithMemory).deviceMemory ?? 8) <= 4;
    return hasWebgl && !reduceMotion && !smallViewport && !lowMemory;
  } catch {
    return false;
  }
}

function getScrollProgress(): number {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function CodeLines({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const widths = [0.68, 1.1, 0.82, 1.35, 0.58];
  return (
    <group position={position} rotation={rotation}>
      <Box args={[1.72, 1.16, 0.035]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} roughness={0.5} />
      </Box>
      {widths.map((width, index) => (
        <Box key={index} position={[-0.5 + width / 2, 0.38 - index * 0.18, 0.035]} args={[width, 0.035, 0.035]}>
          <meshStandardMaterial color={index % 2 === 0 ? '#2dd4bf' : '#38bdf8'} emissive={index % 2 === 0 ? '#134e4a' : '#075985'} emissiveIntensity={0.65} />
        </Box>
      ))}
    </group>
  );
}

function SoftwareEngineerScene() {
  const sceneRef = useRef<Group>(null);
  const panelRef = useRef<Group>(null);
  const dataPath = useMemo(
    () => [
      [-2.5, 0.95, -0.2],
      [-1.55, 1.45, -0.35],
      [-0.62, 1.05, -0.15],
      [0.32, 1.5, -0.3],
      [1.28, 1.05, -0.12],
      [2.1, 1.38, -0.32],
    ] as [number, number, number][],
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const scroll = getScrollProgress();
    if (sceneRef.current) {
      sceneRef.current.rotation.y = -0.38 + scroll * 0.78 + Math.sin(t * 0.45) * 0.025;
      sceneRef.current.rotation.x = -0.05 + scroll * 0.18;
      sceneRef.current.position.y = Math.sin(t * 0.8) * 0.035 - scroll * 0.18;
    }
    if (panelRef.current) {
      panelRef.current.position.y = Math.sin(t * 0.9) * 0.06;
      panelRef.current.rotation.y = 0.28 + scroll * 0.28;
    }
  });

  return (
    <group ref={sceneRef} position={[1.15, -0.18, 0]}>
      {/* Desk and workstation */}
      <Box position={[0, -1.22, 0]} args={[3.8, 0.12, 1.18]}>
        <meshStandardMaterial color="#18324b" roughness={0.42} metalness={0.08} />
      </Box>
      <Box position={[0, -0.92, 0.22]} args={[1.38, 0.08, 0.82]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.36} metalness={0.25} />
      </Box>
      <Box position={[0, -0.53, -0.14]} args={[1.35, 0.86, 0.06]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color="#102033" emissive="#082f49" emissiveIntensity={0.35} roughness={0.34} />
      </Box>
      {[0.35, 0.08, -0.2].map((y, index) => (
        <Box key={y} position={[-0.42 + index * 0.18, y - 0.54, -0.095]} args={[0.42 + index * 0.18, 0.035, 0.018]}>
          <meshStandardMaterial color={index === 1 ? '#38bdf8' : '#2dd4bf'} emissive="#0f766e" emissiveIntensity={0.75} />
        </Box>
      ))}

      {/* Engineer silhouette */}
      <Sphere position={[0, 0.26, 0.5]} args={[0.23, 32, 32]}>
        <meshStandardMaterial color="#f0b48e" roughness={0.48} />
      </Sphere>
      <Box position={[0, -0.28, 0.47]} args={[0.58, 0.82, 0.34]}>
        <meshStandardMaterial color="#0f9f8d" roughness={0.42} />
      </Box>
      <Box position={[-0.43, -0.39, 0.32]} args={[0.12, 0.72, 0.14]} rotation={[0, 0, -0.55]}>
        <meshStandardMaterial color="#0f9f8d" roughness={0.42} />
      </Box>
      <Box position={[0.43, -0.39, 0.32]} args={[0.12, 0.72, 0.14]} rotation={[0, 0, 0.55]}>
        <meshStandardMaterial color="#0f9f8d" roughness={0.42} />
      </Box>

      {/* Code panels and engineering/data flow */}
      <group ref={panelRef}>
        <CodeLines position={[-1.95, 0.68, -0.55]} rotation={[0, 0.44, 0.05]} />
        <CodeLines position={[1.88, 0.62, -0.62]} rotation={[0, -0.42, -0.04]} />
      </group>
      <Line points={dataPath} color="#38bdf8" lineWidth={1.1} transparent opacity={0.48} />
      {dataPath.map((point, index) => (
        <Sphere key={point.join('-')} position={point} args={[index % 2 === 0 ? 0.065 : 0.05, 20, 20]}>
          <meshStandardMaterial color={index % 2 === 0 ? '#2dd4bf' : '#38bdf8'} emissive="#0f766e" emissiveIntensity={0.7} roughness={0.2} />
        </Sphere>
      ))}
      <gridHelper args={[6.4, 16, '#2dd4bf', '#334155']} position={[0, -1.34, -0.2]} rotation={[0.03, 0, 0]} />
    </group>
  );
}

export function HeroCanvas() {
  const enabled = typeof window !== 'undefined' && canUseWebGL();
  if (!enabled) return null;
  return (
    <Canvas camera={{ position: [0, 0.15, 6.3], fov: 47 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.8, 3.6, 4]} intensity={2.2} color="#e0f2fe" />
      <pointLight position={[-2, 2.5, 2]} intensity={22} color="#5eead4" />
      <Suspense fallback={null}>
        <SoftwareEngineerScene />
      </Suspense>
    </Canvas>
  );
}
