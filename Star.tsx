import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS, CONFIG } from '../constants';

export const Star = ({ isFormed }: { isFormed: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.4;
    
    // Create Star Shape
    // Explicitly move to the first point (which is the bottom tip before rotation)
    // to avoid seam artifacts (cracks) at the vertex.
    const startAngle = -Math.PI / 2;
    shape.moveTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);

    for (let i = 1; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 4, // Increased segments for smoother finish
      steps: 1,
      bevelSize: 0.05, // Reduced slightly to prevent inner corner overlaps/cracks
      bevelThickness: 0.1
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state, delta) => {
    if(!meshRef.current) return;
    
    // Slow, majestic rotation around Y axis
    meshRef.current.rotation.y += delta * 0.5;
    
    // Scale animation based on isFormed. 
    // It stays static in position, but grows/shrinks to appear/disappear.
    const targetScale = isFormed ? 1 : 0;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
    
    meshRef.current.scale.setScalar(newScale);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      // Lifted the star up by 1.2 units to sit on top of the foliage cone
      position={[0, CONFIG.TREE_HEIGHT / 2 + 1.2, 0]} 
      // Rotate Z by PI to make the start point (which was down) point up
      rotation={[0, 0, Math.PI]}
    >
        <meshStandardMaterial 
            color={COLORS.GOLD}
            emissive={COLORS.GOLD}
            emissiveIntensity={1.0}
            roughness={0.05}
            metalness={1}
            toneMapped={false}
        />
    </mesh>
  );
};