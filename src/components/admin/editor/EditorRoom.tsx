'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface EditorRoomProps {
  config: {
    room_width: number;
    room_depth: number;
    room_height: number;
    screen_width: number;
    screen_height: number;
  };
}

export function EditorRoom({ config }: EditorRoomProps) {
  const wallMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#0f172a', 
    wireframe: true,
    transparent: true,
    opacity: 0.3
  }), []);
  
  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffffff', 
    emissive: '#88ccff',
    emissiveIntensity: 0.5
  }), []);

  return (
    <group>
      {/* Screen */}
      <mesh position={[0, config.screen_height / 2 + 1, -config.room_depth / 2 + 0.5]} material={screenMaterial}>
        <planeGeometry args={[config.screen_width, config.screen_height]} />
      </mesh>

      {/* Room Bounds (Wireframe) */}
      <mesh position={[0, config.room_height / 2, 0]} material={wallMaterial}>
        <boxGeometry args={[config.room_width, config.room_height, config.room_depth]} />
      </mesh>
    </group>
  );
}
