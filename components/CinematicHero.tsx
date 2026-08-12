"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

export default function CinematicHero({
  primary = "#22C55E",
  accent = "#3B82F6",
  count = 7,
  bloomIntensity = 0.75,
  cameraDistance = 7,
}: {
  primary?: string;
  accent?: string;
  count?: number;
  bloomIntensity?: number;
  cameraDistance?: number;
}) {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let settleTimer: number | undefined;
    const onScroll = () => {
      setFrameloop((cur) => (cur === "never" ? cur : "never"));
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => setFrameloop("always"), 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }} aria-hidden="true">
      <Canvas
        frameloop={reduced ? "demand" : frameloop}
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, cameraDistance], fov: 40 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 4]} intensity={2.1} color="#ffffff" />
        <directionalLight position={[-5, 3, -3]} intensity={1.1} color={accent} />
        <Environment preset="studio" />
        <GlassCluster primary={primary} accent={accent} count={count} spin={!reduced} />
        {bloomIntensity > 0 && !reduced && (
          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={0.32}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

function GlassCluster({ primary, accent, count, spin }: { primary: string; accent: string; count: number; spin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; scale: number; color: string }> = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = (-Math.PI / 3) + t * ((Math.PI * 2) / 3);
      const r = 3.2;
      const y = (t - 0.5) * 2.2;
      items.push({
        pos: [Math.cos(a) * r, y, Math.sin(a) * r * 0.35],
        scale: 0.9 + ((i * 37) % 5) * 0.06,
        color: i % 2 === 0 ? primary : accent,
      });
    }
    return items;
  }, [count, primary, accent]);

  useFrame((_, delta) => {
    if (!spin || !group.current) return;
    group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group}>
      {positions.map((it, i) => (
        <RoundedBox key={i} args={[1, 1.6, 1]} radius={0.14} smoothness={5} position={it.pos} scale={it.scale}>
          <meshPhysicalMaterial
            color={it.color}
            emissive={it.color}
            emissiveIntensity={0.28}
            metalness={0}
            roughness={0.15}
            transmission={0.85}
            thickness={1.2}
            ior={1.35}
            attenuationDistance={2.4}
            attenuationColor={it.color}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </RoundedBox>
      ))}
    </group>
  );
}
