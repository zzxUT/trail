import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { PositionData } from '../types';

interface OrnamentGroupProps {
  isFormed: boolean;
  type: 'GIFT' | 'BAUBLE' | 'LIGHT';
}

const OrnamentGroup: React.FC<OrnamentGroupProps> = ({ isFormed, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [dummy] = useState(() => new THREE.Object3D());

  // Determine count and visual properties based on type
  const config = useMemo(() => {
    switch (type) {
      case 'GIFT':
        return {
          count: CONFIG.GIFT_COUNT,
          baseScale: 1.3,
          geometry: new THREE.BoxGeometry(1, 1, 1),
          weight: 0.02,
          // Weighted towards reds
          colors: [
            COLORS.VIBRANT_RED, 
            COLORS.VIBRANT_RED, 
            COLORS.RED_RIBBON, 
            COLORS.VELVET_RED, 
            COLORS.GOLD // Occasional gold gift
          ],
          roughness: 0.4,
          metalness: 0.3,
        };
      case 'LIGHT':
        return {
          count: CONFIG.LIGHT_COUNT,
          baseScale: 0.15,
          geometry: new THREE.SphereGeometry(1, 8, 8),
          weight: 0.08,
          colors: [COLORS.WARM_LIGHT],
          roughness: 1,
          metalness: 0,
        };
      case 'BAUBLE':
      default:
        return {
          count: CONFIG.BAUBLE_COUNT,
          baseScale: 0.45,
          geometry: new THREE.SphereGeometry(1, 32, 32),
          weight: 0.04,
          // 50/50 Split Red and Gold
          colors: [COLORS.GOLD, COLORS.VIBRANT_RED],
          roughness: 0.1, // Shiny
          metalness: 0.9, // Metallic
        };
    }
  }, [type]);

  // Generate data
  const data = useMemo<PositionData[]>(() => {
    const items: PositionData[] = [];
    for (let i = 0; i < config.count; i++) {
      let tx, ty, tz;
      
      // Special placement logic for gifts: 50% on floor, 50% on tree (was 75/25)
      let isFloorGift = false;
      if (type === 'GIFT') {
        isFloorGift = Math.random() > 0.5; 
      }

      if (type === 'GIFT' && isFloorGift) {
        // Gifts sit at the bottom
        const r = Math.random() * 3 + 2.0; // Slightly wider spread
        const theta = Math.random() * Math.PI * 2;
        tx = r * Math.cos(theta);
        ty = -CONFIG.TREE_HEIGHT / 2 - 0.5 + (Math.random() * 0.5); // On floor, slight variation
        tz = r * Math.sin(theta);
      } else {
        // Ornaments on tree (and some gifts)
        let yRatio = Math.random();
        let theta = Math.random() * Math.PI * 2;
        
        // Logic for Gifts on Tree: Spiral upwards
        if (type === 'GIFT') {
            // Apply a power curve (1.2) to bias positions slightly towards the bottom
            // This thins out the top density naturally
            yRatio = Math.pow(yRatio, 1.2);

            // Distribute from 5% up to 72% up the tree (lowered from 85%)
            // This ensures the top tip is cleaner and less "bloated"
            yRatio = yRatio * 0.67 + 0.05;
            
            // Spiral calculation: Theta is dependent on height
            // 5 full rotations around the tree
            theta = (yRatio * Math.PI * 2 * 5.0) + (Math.random() * 0.5);
        }

        const y = yRatio * CONFIG.TREE_HEIGHT;
        // Radius calculation:
        // Gifts on tree stick out a bit more (1.15x) to not be buried
        const rMult = type === 'GIFT' ? 1.15 : 0.95; 
        const r = (1 - y / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS * rMult; 
        
        tx = r * Math.cos(theta);
        ty = y - CONFIG.TREE_HEIGHT / 2;
        tz = r * Math.sin(theta);
      }

      // Chaos Logic
      const cx = (Math.random() - 0.5) * 50;
      const cy = (Math.random() - 0.5) * 50;
      const cz = (Math.random() - 0.5) * 30;

      items.push({
        chaos: new THREE.Vector3(cx, cy, cz),
        target: new THREE.Vector3(tx, ty, tz),
        speed: config.weight * (0.8 + Math.random() * 0.4),
        // Randomly pick from the specific color palette for this type
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        rotationChaos: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotationTarget: new THREE.Euler(0, Math.random() * Math.PI, 0),
        scale: config.baseScale * (0.8 + Math.random() * 0.4),
      });
    }
    return items;
  }, [config, type]);

  // Current animation progress for each instance (0 = Chaos, 1 = Formed)
  const progressRefs = useRef<Float32Array>(new Float32Array(config.count).fill(0));

  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((item, i) => {
        meshRef.current!.setColorAt(i, item.color);
      });
      // Ensure the color attribute is updated
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetGlobalState = isFormed ? 1 : 0;
    
    // Update every instance
    for (let i = 0; i < config.count; i++) {
      const item = data[i];
      const current = progressRefs.current[i];
      
      // Determine direction and apply weight-based speed
      const diff = targetGlobalState - current;
      
      // Move current progress towards target
      progressRefs.current[i] += diff * item.speed * (delta * 60); 
      
      // Clamp
      if (progressRefs.current[i] > 1) progressRefs.current[i] = 1;
      if (progressRefs.current[i] < 0) progressRefs.current[i] = 0;

      const p = progressRefs.current[i];
      const easedP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // EaseInOutQuad

      // Interpolate Position
      dummy.position.lerpVectors(item.chaos, item.target, easedP);
      
      // Interpolate Rotation
      dummy.rotation.set(
          THREE.MathUtils.lerp(item.rotationChaos.x, item.rotationTarget.x, easedP),
          THREE.MathUtils.lerp(item.rotationChaos.y, item.rotationTarget.y + state.clock.elapsedTime * 0.1, easedP), 
          THREE.MathUtils.lerp(item.rotationChaos.z, item.rotationTarget.z, easedP)
      );

      dummy.scale.setScalar(item.scale * (type === 'LIGHT' ? (0.8 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.2) : 1));

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[config.geometry, undefined, config.count]}>
      {type === 'LIGHT' ? (
        <meshBasicMaterial
          color={COLORS.WARM_LIGHT}
          toneMapped={false}
        />
      ) : (
        <meshStandardMaterial
          color={0xffffff} // Base color must be white for tinting
          // vertexColors={true} removed to fix black issue
          roughness={config.roughness}
          metalness={config.metalness}
          emissive={new THREE.Color(0x000000)}
          emissiveIntensity={0}
          toneMapped={false}
        />
      )}
    </instancedMesh>
  );
};

export default OrnamentGroup;