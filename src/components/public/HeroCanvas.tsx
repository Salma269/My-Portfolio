import { Float, Line, Sphere } from '@react-three/drei';
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

function WorkflowConstellation() {
  const groupRef = useRef<Group>(null);
  const points = useMemo(
    () => [
      [-3.6, 1.2, 0],
      [-2.1, -0.5, 0.9],
      [-0.4, 0.8, -0.4],
      [1.2, -0.7, 0.7],
      [2.8, 0.9, -0.1],
      [3.5, -1.1, 0.4],
      [0.5, 2.0, 0.2],
    ] as [number, number, number][],
    [],
  );

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.16 + pointer.x * 0.08;
    groupRef.current.rotation.x = Math.cos(clock.elapsedTime * 0.16) * 0.08 - pointer.y * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Line points={points} color="#2dd4bf" lineWidth={1.25} transparent opacity={0.42} />
      {points.map((point, index) => (
        <Float key={point.join('-')} speed={1.2 + index * 0.08} rotationIntensity={0.45} floatIntensity={0.5}>
          <Sphere position={point} args={[index === 0 || index === 4 ? 0.16 : 0.1, 24, 24]}>
            <meshStandardMaterial color={index % 2 === 0 ? '#38bdf8' : '#2dd4bf'} emissive="#0f766e" emissiveIntensity={0.4} roughness={0.32} />
          </Sphere>
        </Float>
      ))}
      <gridHelper args={[8, 18, '#2dd4bf', '#334155']} position={[0, -1.7, 0]} rotation={[0.05, 0, 0]} />
    </group>
  );
}

export function HeroCanvas() {
  const enabled = typeof window !== 'undefined' && canUseWebGL();
  if (!enabled) return null;
  return (
    <Canvas camera={{ position: [0, 0.35, 6.4], fov: 48 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 3, 4]} intensity={18} color="#a7f3d0" />
      <Suspense fallback={null}>
        <WorkflowConstellation />
      </Suspense>
    </Canvas>
  );
}
