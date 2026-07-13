import { Box, Line, Sphere } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };
type ViewportProfile = 'mobile' | 'tablet' | 'desktop';
type LayoutDirection = 'ltr' | 'rtl';

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const hasWebgl = Boolean(canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = ((navigator as NavigatorWithMemory).deviceMemory ?? 8) <= 2;
    return hasWebgl && !reduceMotion && !lowMemory;
  } catch {
    return false;
  }
}

function getViewportProfile(width: number): ViewportProfile {
  if (width < 620) return 'mobile';
  if (width < 960) return 'tablet';
  return 'desktop';
}

function useSceneLayout() {
  const [profile, setProfile] = useState<ViewportProfile>(() =>
    typeof window === 'undefined' ? 'desktop' : getViewportProfile(window.innerWidth),
  );
  const [dir, setDir] = useState<LayoutDirection>(() =>
    typeof document === 'undefined' ? 'ltr' : document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr',
  );

  useEffect(() => {
    const update = () => {
      setProfile(getViewportProfile(window.innerWidth));
      setDir(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  return { profile, dir };
}

function getScrollProgress(): number {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function circlePoints(radius: number, axis: 'xy' | 'xz' | 'yz', segments = 80): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    const a = Math.cos(angle) * radius;
    const b = Math.sin(angle) * radius;
    if (axis === 'xy') return [a, b, 0];
    if (axis === 'xz') return [a, 0, b];
    return [0, a, b];
  });
}

function CodePanel({ position, rotation = [0, 0, 0] as [number, number, number], accent = '#2dd4bf' }: { position: [number, number, number]; rotation?: [number, number, number]; accent?: string }) {
  const widths = [1.05, 0.68, 1.28, 0.82, 1.12, 0.54];
  return (
    <group position={position} rotation={rotation}>
      <Box args={[1.9, 1.2, 0.035]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.48} roughness={0.2} metalness={0.35} />
      </Box>
      <Box position={[0, 0.56, 0.03]} args={[1.9, 0.035, 0.025]}>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
      </Box>
      {widths.map((width, index) => (
        <Box key={`${width}-${index}`} position={[-0.62 + width / 2, 0.34 - index * 0.145, 0.045]} args={[width, 0.032, 0.025]}>
          <meshStandardMaterial color={index % 2 === 0 ? accent : '#38bdf8'} emissive={index % 2 === 0 ? accent : '#38bdf8'} emissiveIntensity={0.45} transparent opacity={0.92} />
        </Box>
      ))}
      {[0.3, 0, -0.3].map((y) => (
        <Sphere key={y} position={[-0.78, y, 0.06]} args={[0.035, 16, 16]}>
          <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.65} />
        </Sphere>
      ))}
    </group>
  );
}

function ServerStack({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2].map((layer) => (
        <group key={layer} position={[0, layer * 0.24, 0]}>
          <Box args={[0.64, 0.16, 0.42]}>
            <meshStandardMaterial color="#102033" roughness={0.28} metalness={0.34} />
          </Box>
          <Box position={[-0.18, 0.01, 0.22]} args={[0.14, 0.025, 0.025]}>
            <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.65} />
          </Box>
          <Box position={[0.1, 0.01, 0.22]} args={[0.22, 0.025, 0.025]}>
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.55} />
          </Box>
        </group>
      ))}
    </group>
  );
}

function HolographicCore({ compact = false }: { compact?: boolean }) {
  const ringXy = useMemo(() => circlePoints(compact ? 0.58 : 0.72, 'xy', compact ? 48 : 80), [compact]);
  const ringXz = useMemo(() => circlePoints(compact ? 0.72 : 0.9, 'xz', compact ? 48 : 80), [compact]);
  const ringYz = useMemo(() => circlePoints(compact ? 0.5 : 0.62, 'yz', compact ? 48 : 80), [compact]);
  const nodes = useMemo(
    () =>
      [
        [-0.72, 0.08, 0.1],
        [-0.34, 0.48, -0.18],
        [0.18, 0.34, 0.32],
        [0.68, -0.05, -0.08],
        [0.26, -0.46, 0.22],
        [-0.42, -0.34, -0.28],
      ] as [number, number, number][],
    [],
  );

  return (
    <group>
      <Sphere args={[compact ? 0.14 : 0.18, compact ? 20 : 32, compact ? 20 : 32]}>
        <meshStandardMaterial color="#e0f2fe" emissive="#2dd4bf" emissiveIntensity={1.2} roughness={0.18} metalness={0.2} />
      </Sphere>
      <Line points={ringXy} color="#2dd4bf" lineWidth={1.1} transparent opacity={0.48} />
      <Line points={ringXz} color="#38bdf8" lineWidth={1.1} transparent opacity={0.42} />
      <Line points={ringYz} color="#a7f3d0" lineWidth={1} transparent opacity={0.32} />
      <Line points={nodes} color="#38bdf8" lineWidth={1} transparent opacity={0.54} />
      {nodes.map((point, index) => (
        <Sphere key={point.join('-')} position={point} args={[index % 2 ? 0.05 : 0.065, 16, 16]}>
          <meshStandardMaterial color={index % 2 ? '#38bdf8' : '#2dd4bf'} emissive={index % 2 ? '#38bdf8' : '#2dd4bf'} emissiveIntensity={0.72} roughness={0.16} />
        </Sphere>
      ))}
    </group>
  );
}

function SceneCamera({ profile }: { profile: ViewportProfile }) {
  const { camera } = useThree();

  useEffect(() => {
    if (profile === 'mobile') {
      camera.position.set(0, 0.08, 5.35);
    } else if (profile === 'tablet') {
      camera.position.set(0, 0.12, 6.1);
    } else {
      camera.position.set(0, 0.14, 6.45);
    }
    if ('fov' in camera) {
      camera.fov = profile === 'mobile' ? 52 : profile === 'tablet' ? 49 : 47;
      camera.updateProjectionMatrix();
    }
  }, [camera, profile]);

  return null;
}

function ProfessionalEngineeringScene({ profile, dir }: { profile: ViewportProfile; dir: LayoutDirection }) {
  const sceneRef = useRef<Group>(null);
  const hologramRef = useRef<Group>(null);
  const panelsRef = useRef<Group>(null);
  const compact = profile !== 'desktop';
  const sideOffset = profile === 'mobile' ? 0 : profile === 'tablet' ? 0.42 : 1.18;
  const sceneX = dir === 'rtl' ? -sideOffset : sideOffset;
  const dataBus = useMemo(
    () =>
      [
        [-2.45, 0.18, -0.25],
        [-1.58, 0.74, -0.3],
        [-0.56, 0.42, -0.12],
        [0.22, 0.98, -0.2],
        [1.04, 0.46, -0.16],
        [2.12, 0.82, -0.34],
      ] as [number, number, number][],
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const scroll = getScrollProgress();
    const motionScale = profile === 'mobile' ? 0.45 : 1;

    if (sceneRef.current) {
      sceneRef.current.rotation.y = (-0.34 + scroll * 0.66 + Math.sin(t * 0.38) * 0.018) * motionScale;
      sceneRef.current.rotation.x = (-0.06 + scroll * 0.14) * motionScale;
      sceneRef.current.position.y = Math.sin(t * 0.65) * 0.028 * motionScale - scroll * 0.14;
    }
    if (hologramRef.current) {
      hologramRef.current.rotation.y = (t * 0.16 + scroll * 0.95) * motionScale;
      hologramRef.current.rotation.z = Math.sin(t * 0.28) * 0.08 * motionScale;
      hologramRef.current.position.y = 0.18 + Math.sin(t * 0.9) * 0.055 * motionScale;
    }
    if (panelsRef.current) {
      panelsRef.current.position.y = Math.sin(t * 0.72) * 0.045 * motionScale;
      panelsRef.current.rotation.y = (0.2 + scroll * 0.22) * motionScale;
    }
  });

  if (profile === 'mobile') {
    return (
      <group ref={sceneRef} position={[0, -0.12, 0]}>
        <group ref={hologramRef} position={[0, 0.12, 0]}>
          <HolographicCore compact />
        </group>
        <gridHelper args={[4.8, 14, '#2dd4bf', '#334155']} position={[0, -1.05, -0.18]} rotation={[0.03, 0, 0]} />
      </group>
    );
  }

  return (
    <group ref={sceneRef} position={[sceneX, -0.28, 0]}>
      <Box position={[0, -1.23, 0]} args={[4.2, 0.1, 1.24]}>
        <meshStandardMaterial color="#132a40" roughness={0.22} metalness={0.32} transparent opacity={0.9} />
      </Box>
      <Box position={[0, -0.92, 0.22]} args={[1.6, 0.07, 0.9]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.28} metalness={0.42} />
      </Box>
      <Box position={[0, -0.51, -0.15]} args={[1.55, 0.92, 0.055]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color="#0b1f33" emissive="#082f49" emissiveIntensity={0.32} roughness={0.18} metalness={0.35} />
      </Box>
      {[0, 1, 2, 3].map((index) => (
        <Box key={index} position={[-0.55 + index * 0.36, -0.87, 0.66]} args={[0.22, 0.018, 0.045]}>
          <meshStandardMaterial color={index % 2 ? '#38bdf8' : '#2dd4bf'} emissive={index % 2 ? '#38bdf8' : '#2dd4bf'} emissiveIntensity={0.58} />
        </Box>
      ))}

      <group ref={hologramRef} position={[0, 0.18, 0.22]}>
        <HolographicCore compact={compact} />
      </group>

      {profile === 'desktop' ? (
        <group ref={panelsRef}>
          <CodePanel position={[-2.08, 0.58, -0.58]} rotation={[0.02, 0.5, 0.06]} accent="#2dd4bf" />
          <CodePanel position={[1.92, 0.58, -0.64]} rotation={[0.02, -0.44, -0.05]} accent="#38bdf8" />
          <CodePanel position={[0.12, 1.34, -0.82]} rotation={[0.16, 0.02, 0]} accent="#a7f3d0" />
        </group>
      ) : null}

      {profile === 'desktop' ? (
        <>
          <ServerStack position={[-1.62, -0.88, 0.18]} rotation={[0, 0.28, 0]} />
          <ServerStack position={[1.62, -0.88, 0.12]} rotation={[0, -0.28, 0]} />
          <Line points={dataBus} color="#38bdf8" lineWidth={1.15} transparent opacity={0.46} />
          {dataBus.map((point, index) => (
            <Sphere key={point.join('-')} position={point} args={[index % 2 === 0 ? 0.06 : 0.045, 18, 18]}>
              <meshStandardMaterial color={index % 2 === 0 ? '#2dd4bf' : '#38bdf8'} emissive={index % 2 === 0 ? '#2dd4bf' : '#38bdf8'} emissiveIntensity={0.7} roughness={0.18} />
            </Sphere>
          ))}
        </>
      ) : null}

      <gridHelper args={[profile === 'tablet' ? 5.4 : 6.6, profile === 'tablet' ? 16 : 18, '#2dd4bf', '#334155']} position={[0, -1.34, -0.22]} rotation={[0.03, 0, 0]} />
    </group>
  );
}

export function HeroCanvas() {
  const { profile, dir } = useSceneLayout();
  const enabled = typeof window !== 'undefined' && canUseWebGL();
  const dpr: [number, number] = profile === 'mobile' ? [1, 1] : profile === 'tablet' ? [1, 1.25] : [1, 1.5];

  if (!enabled) return null;

  return (
    <Canvas camera={{ position: [0, 0.14, 6.45], fov: 47 }} dpr={dpr} gl={{ antialias: profile !== 'mobile', powerPreference: profile === 'mobile' ? 'low-power' : 'high-performance' }}>
      <SceneCamera profile={profile} />
      <ambientLight intensity={profile === 'mobile' ? 0.9 : 0.76} />
      <directionalLight position={[2.8, 3.6, 4]} intensity={profile === 'mobile' ? 1.6 : 2.15} color="#e0f2fe" />
      <pointLight position={[-2.2, 2.4, 2]} intensity={profile === 'mobile' ? 12 : 20} color="#5eead4" />
      <pointLight position={[2.2, 1.4, 1.6]} intensity={profile === 'mobile' ? 6 : 9} color="#38bdf8" />
      <Suspense fallback={null}>
        <ProfessionalEngineeringScene profile={profile} dir={dir} />
      </Suspense>
    </Canvas>
  );
}
