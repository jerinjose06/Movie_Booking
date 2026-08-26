'use client';

import { useRef, useState } from 'react';
import { useEditorStore, EditorSeat as IEditorSeat } from '@/store/useEditorStore';
import * as THREE from 'three';

interface EditorSeatProps {
  seat: IEditorSeat;
}

const defaultMaterial = new THREE.MeshStandardMaterial({ color: '#4ade80' }); // Normal seat
const selectedMaterial = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 0.5 }); // Selected

export function EditorSeat({ seat }: EditorSeatProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { selectedSeatIds, toggleSelection, mode } = useEditorStore();
  
  const isSelected = selectedSeatIds.includes(seat.id);

  return (
    <group 
      ref={meshRef}
      position={[seat.x, seat.y, seat.z]}
      rotation={[seat.rotX, seat.rotY, seat.rotZ]}
      onPointerUp={(e) => {
        if (e.delta > 10) return;
        e.stopPropagation();
        if (mode === 'PREVIEW') return;
        toggleSelection(seat.id, e.shiftKey);
      }}
    >
      {/* Visual seat mesh */}
      <mesh position={[0, 0.25, 0]} material={isSelected ? selectedMaterial : defaultMaterial}>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
      </mesh>
      <mesh position={[0, 0.75, -0.3]} material={isSelected ? selectedMaterial : defaultMaterial}>
        <boxGeometry args={[0.8, 0.6, 0.2]} />
      </mesh>

      {/* Row Label (only when selected for clutter reduction) */}
      {isSelected && (
        <mesh position={[0, 1.2, 0]}>
           <planeGeometry args={[0.5, 0.5]} />
           <meshBasicMaterial color="white" />
        </mesh>
      )}
    </group>
  );
}
