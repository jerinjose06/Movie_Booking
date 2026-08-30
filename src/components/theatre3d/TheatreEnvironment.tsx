'use client';

import { useBookingStore } from '@/store/useBookingStore';

export function TheatreEnvironment() {
  const { lightMode } = useBookingStore();

  return (
    <>
      <color attach="background" args={[lightMode ? '#e5e7eb' : '#050505']} />
      
      <ambientLight intensity={lightMode ? 1.5 : 0.25} />
      
      {/* Screen glow light with no shadows to prevent any raster noise */}
      <spotLight 
        position={[0, 5, -5]} 
        angle={Math.PI / 3} 
        penumbra={1} 
        intensity={lightMode ? 0 : 2} 
        color="#88ccff" 
        castShadow={false} 
      />
      
      {/* Directional Light for light mode */}
      {lightMode && (
        <directionalLight position={[5, 15, 10]} intensity={1.5} />
      )}
    </>
  );
}
