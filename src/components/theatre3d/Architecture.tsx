'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export function Architecture() {
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#11151c', roughness: 0.9 }), []);
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }), []);
  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffffff', 
    emissive: '#88ccff',
    emissiveIntensity: 0.3,
    roughness: 0.2
  }), []);
  const stripMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#38bdf8', 
    emissive: '#38bdf8',
    emissiveIntensity: 2
  }), []);

  return (
    <group>
      {/* Front Floor (Flat near screen) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -10]} material={floorMaterial}>
        <planeGeometry args={[100, 40]} />
      </mesh>

      {/* Inclined Seating Floor (Steeper angle, matched to seats) */}
      <mesh receiveShadow rotation={[-Math.PI / 2 - 0.343, 0, 0]} position={[0, 3.0, 10]} material={floorMaterial}>
        <planeGeometry args={[100, 40]} />
      </mesh>

      {/* Screen (Given thickness so it's visible from Top View) */}
      <mesh position={[0, 4, -8]} material={screenMaterial}>
        <boxGeometry args={[24, 10, 0.5]} />
      </mesh>
      
      {/* Front Wall (behind screen) */}
      <mesh position={[0, 10, -10.1]} material={wallMaterial}>
        <planeGeometry args={[100, 40]} />
      </mesh>

      {/* Back Wall (behind seats) */}
      <mesh position={[0, 10, 28]} rotation={[0, Math.PI, 0]} material={wallMaterial}>
        <planeGeometry args={[100, 40]} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-25, 10, 5]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[100, 40]} />
        {/* Glowing Strips */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[(i - 3.5) * 6, -5, 0.1]} rotation={[0, 0, 0.2]} material={stripMaterial}>
            <planeGeometry args={[0.2, 15]} />
          </mesh>
        ))}
      </mesh>
      
      <mesh position={[25, 10, 5]} rotation={[0, -Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[100, 40]} />
        {/* Glowing Strips */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[(i - 3.5) * -6, -5, 0.1]} rotation={[0, 0, -0.2]} material={stripMaterial}>
            <planeGeometry args={[0.2, 15]} />
          </mesh>
        ))}
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 30, 5]} rotation={[Math.PI / 2, 0, 0]} material={wallMaterial}>
        <planeGeometry args={[100, 100]} />
      </mesh>
    </group>
  );
}
