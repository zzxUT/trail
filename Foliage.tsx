import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS, FOLIAGE_VERTEX_SHADER, FOLIAGE_FRAGMENT_SHADER } from '../constants';

interface FoliageProps {
  isFormed: boolean;
}

const Foliage: React.FC<FoliageProps> = ({ isFormed }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Custom shader material ref to update uniforms
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate data once
  const { positions, chaosPositions, randoms } = useMemo(() => {
    const count = CONFIG.FOLIAGE_COUNT;
    const chaosPosArray = new Float32Array(count * 3);
    const targetPosArray = new Float32Array(count * 3);
    const randomArray = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Target Positions (Cone)
      // Height varies from 0 to TREE_HEIGHT
      const y = Math.random() * CONFIG.TREE_HEIGHT;
      // Radius decreases as y increases (Cone shape)
      // We add a little noise to thickness so it's not a perfect geometric cone
      const r = (1 - y / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS * (0.8 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;

      const tx = r * Math.cos(theta);
      const tz = r * Math.sin(theta);
      const ty = y - CONFIG.TREE_HEIGHT / 2; // Center vertically

      targetPosArray[i * 3] = tx;
      targetPosArray[i * 3 + 1] = ty;
      targetPosArray[i * 3 + 2] = tz;

      // 2. Chaos Positions (Sphere/Cloud)
      // Distribute widely
      const cx = (Math.random() - 0.5) * 40;
      const cy = (Math.random() - 0.5) * 40;
      const cz = (Math.random() - 0.5) * 20; // Flatter depth

      chaosPosArray[i * 3] = cx;
      chaosPosArray[i * 3 + 1] = cy;
      chaosPosArray[i * 3 + 2] = cz;

      // 3. Random attribute
      randomArray[i] = Math.random();
    }

    return {
      positions: targetPosArray, // Initial buffer (not strictly used by shader logic but needed for bounding)
      chaosPositions: chaosPosArray,
      randoms: randomArray,
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;
    
    // Time for subtle sparkle
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    // Lerp progress based on state
    const targetProgress = isFormed ? 1.0 : 0.0;
    const currentProgress = materialRef.current.uniforms.uProgress.value;
    
    // Smooth transition speed
    const delta = (targetProgress - currentProgress) * 0.04; 
    materialRef.current.uniforms.uProgress.value += delta;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor: { value: COLORS.EMERALD },
  }), []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions} // Standard position attribute (required by Three, though shader overrides)
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Foliage;
