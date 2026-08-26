'use client';

import { Environment } from '@react-three/drei';
import { useBookingStore } from '@/store/useBookingStore';

export function TheatreEnvironment() {
  const { lightMode } = useBookingStore();

  return (
    <>
      <color attach="background" args={[lightMode ? '#e5e7eb' : '#050505']} />
      {!lightMode && <fog attach="fog" args={['#050505', 10, 50]} />}
      
      <ambientLight intensity={lightMode ? 1.5 : 0.1} />
      
      {/* Screen glow light */}
      <spotLight 
        position={[0, 5, -5]} 
        angle={Math.PI / 3} 
        penumbra={1} 
        intensity={lightMode ? 0 : 2} 
        color="#88ccff" 
        castShadow={!lightMode} 
      />
      
      {/* Directional Light for light mode to see shapes clearly */}
      {lightMode && (
        <directionalLight position={[5, 15, 10]} intensity={1.5} castShadow />
      )}
      
      {/* Dim aisle lights */}
      {!lightMode && (
        <>
          <pointLight position={[-12, 1, 5]} intensity={0.5} color="#ffaa55" distance={10} />
          <pointLight position={[12, 1, 5]} intensity={0.5} color="#ffaa55" distance={10} />
        </>
      )}

      <Environment preset={lightMode ? 'city' : 'night'} environmentIntensity={lightMode ? 0.8 : 0.1} />
    </>
  );
}
