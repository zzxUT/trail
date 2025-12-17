import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Foliage from './Foliage';
import OrnamentGroup from './Ornaments';
import { Star } from './Star';

interface SceneProps {
  isFormed: boolean;
}

const Scene: React.FC<SceneProps> = ({ isFormed }) => {
  return (
    <div className="w-full h-screen bg-[#020502]">
      <Canvas
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        camera={{ position: [0, 4, 25], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          <Environment preset="lobby" background={false} blur={0.6} />
          
          {/* Main directional light for dramatic shadows */}
          <directionalLight
            position={[10, 10, 5]}
            intensity={2}
            color="#fffae3"
            castShadow
          />
          <ambientLight intensity={0.2} color="#004225" />
          
          {/* Spotlight for the tree top */}
          <spotLight
            position={[0, 20, 0]}
            angle={0.3}
            penumbra={0.5}
            intensity={4}
            color="#FFD700"
            distance={50}
          />

          <group position={[0, 0, 0]}>
            <Foliage isFormed={isFormed} />
            <OrnamentGroup isFormed={isFormed} type="GIFT" />
            <OrnamentGroup isFormed={isFormed} type="BAUBLE" />
            <OrnamentGroup isFormed={isFormed} type="LIGHT" />
            <Star isFormed={isFormed} />
          </group>
          
          <ContactShadows
            opacity={0.5}
            scale={20}
            blur={2}
            far={4}
            resolution={256}
            color="#000000"
          />

          <EffectComposer enableNormalPass={false}>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.8}
              luminanceSmoothing={0.02}
              mipmapBlur
              // KernelSize.LARGE = 3
              kernelSize={3}
              // Resolution.AUTO_SIZE = 0
              resolutionX={0}
              resolutionY={0}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={10}
            maxDistance={40}
            autoRotate={isFormed}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;