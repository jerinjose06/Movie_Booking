'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface ArchitectureProps {
  theatreWidth?: number;
  theatreDepth?: number;
  floorAngle?: number;
  floorLength?: number;
  floorMidY?: number;
  floorMidZ?: number;
}

export function Architecture({ 
  theatreWidth = 50, 
  theatreDepth = 50,
  floorAngle = 0.343,
  floorLength = 40,
  floorMidY = 3.0,
  floorMidZ = 10
}: ArchitectureProps) {
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#11151c', roughness: 0.9 }), []);
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }), []);
  
  // The classic blue glowing cinema screen material
  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffffff', 
    emissive: '#88ccff',
    emissiveIntensity: 0.35,
    roughness: 0.2
  }), []);

  const stripMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#38bdf8', 
    emissive: '#38bdf8',
    emissiveIntensity: 2
  }), []);

  const screenWidth = Math.max(20, Math.min(32, theatreWidth - 10));
  const screenHeight = screenWidth * (10 / 24);
  const wallX = Math.max(25, theatreWidth / 2);
  const backZ = Math.max(35, theatreDepth - 10);

  return (
    <group>
      {/* Front Floor (Flat near screen) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -10]} material={floorMaterial}>
        <planeGeometry args={[theatreWidth * 2, 40]} />
      </mesh>

      {/* Inclined Seating Floor */}
      <mesh rotation={[-Math.PI / 2 - floorAngle, 0, 0]} position={[0, floorMidY, floorMidZ]} material={floorMaterial}>
        <planeGeometry args={[theatreWidth * 2, floorLength]} />
      </mesh>

      {/* Blue Glowing Cinema Screen */}
      <mesh position={[0, 4.5, -8]} material={screenMaterial}>
        <boxGeometry args={[screenWidth, screenHeight, 0.4]} />
      </mesh>
      
      {/* Front Wall (behind screen) */}
      <mesh position={[0, 10, -10.1]} material={wallMaterial}>
        <planeGeometry args={[theatreWidth * 2, 40]} />
      </mesh>

      {/* Back Wall (behind seats) */}
      <mesh position={[0, 10, backZ]} rotation={[0, Math.PI, 0]} material={wallMaterial}>
        <planeGeometry args={[theatreWidth * 2, 40]} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-wallX, 10, 5]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[theatreDepth * 2, 40]} />
        {/* Glowing Strips */}
        {[...Array(Math.floor(theatreDepth / 6))].map((_, i) => (
          <mesh key={i} position={[(i - 3.5) * 6, -5, 0.1]} rotation={[0, 0, 0.2]} material={stripMaterial}>
            <planeGeometry args={[0.2, 15]} />
          </mesh>
        ))}
      </mesh>
      
      <mesh position={[wallX, 10, 5]} rotation={[0, -Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[theatreDepth * 2, 40]} />
        {/* Glowing Strips */}
        {[...Array(Math.floor(theatreDepth / 6))].map((_, i) => (
          <mesh key={i} position={[(i - 3.5) * -6, -5, 0.1]} rotation={[0, 0, -0.2]} material={stripMaterial}>
            <planeGeometry args={[0.2, 15]} />
          </mesh>
        ))}
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 30, 5]} rotation={[Math.PI / 2, 0, 0]} material={wallMaterial}>
        <planeGeometry args={[theatreWidth * 2, theatreDepth * 2]} />
      </mesh>
    </group>
  );
}
