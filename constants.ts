import * as THREE from 'three';

export const COLORS = {
  EMERALD: new THREE.Color('#0F5928'), // Deeper, richer pine green
  GOLD: new THREE.Color('#FFD700'),
  SILVER: new THREE.Color('#C0C0C0'),
  RED_RIBBON: new THREE.Color('#8a0303'),
  WARM_LIGHT: new THREE.Color('#fffae3'),
  // New specific colors for ornaments
  VIBRANT_RED: new THREE.Color('#D6001C'), // Classic bright Christmas red
  VELVET_RED: new THREE.Color('#4a0404'),  // Deep, dark luxury red
};

export const CONFIG = {
  FOLIAGE_COUNT: 25000, // Increased density
  BAUBLE_COUNT: 120,    // Reduced count to avoid clutter
  GIFT_COUNT: 56,       // Slightly reduced from 60 to allow breathing room at top
  LIGHT_COUNT: 300,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
};

// Shader for the pine needles (Foliage)
export const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying float vAlpha;

  // Easing function for smooth transition
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }

  void main() {
    float t = easeOutCubic(uProgress);
    
    // Add some individual delay based on randomness
    float individualProgress = smoothstep(0.0, 1.0, (uProgress * 1.2) - (aRandom * 0.2));
    
    vec3 pos = mix(aChaosPos, aTargetPos, individualProgress);
    
    // Slight wind/sparkle movement
    float wind = sin(uTime * 2.0 + aRandom * 10.0) * 0.05;
    pos.x += wind * (1.0 - individualProgress); // More movement in chaos
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation - INCREASED BASE SIZE from 4.0 to 7.0
    gl_PointSize = (7.0 * (1.0 + aRandom)) * (10.0 / -mvPosition.z);
    
    // Fade out slightly in chaos mode for depth
    vAlpha = 0.6 + 0.4 * individualProgress; 
  }
`;

export const FOLIAGE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    if (dot(circCoord, circCoord) > 1.0) {
      discard;
    }
    
    // Gradient from center for a "glow" look
    float strength = 1.0 - dot(circCoord, circCoord);
    strength = pow(strength, 2.0);

    // Use the color more directly, slightly boosted for bloom but keeping hue true
    gl_FragColor = vec4(uColor * 1.8, vAlpha * strength); 
  }
`;