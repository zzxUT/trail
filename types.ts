import * as THREE from 'three';

export interface PositionData {
  chaos: THREE.Vector3;
  target: THREE.Vector3;
  speed: number; // Simulates weight
  color: THREE.Color;
  rotationChaos: THREE.Euler;
  rotationTarget: THREE.Euler;
  scale: number;
}

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export interface FoliageUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColor: { value: THREE.Color };
}
