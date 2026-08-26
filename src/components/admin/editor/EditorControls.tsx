'use client';

import { useEffect, useRef, useState } from 'react';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { useEditorStore } from '@/store/useEditorStore';
import * as THREE from 'three';

export function EditorControls() {
  const { mode, selectedSeatIds, seats, updateSeat } = useEditorStore();
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<any>(null);
  
  const startCenter = useRef<THREE.Vector3>(new THREE.Vector3());
  const [dragStart, setDragStart] = useState<{ id: string, pos: THREE.Vector3, rot: THREE.Euler }[]>([]);

  useEffect(() => {
    if (selectedSeatIds.length > 0 && groupRef.current && !groupRef.current.userData.isDragging) {
      const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
      if (selectedSeats.length === 0) return;

      const center = new THREE.Vector3();
      selectedSeats.forEach(s => {
        center.x += s.x;
        center.y += s.y;
        center.z += s.z;
      });
      center.divideScalar(selectedSeats.length);
      
      groupRef.current.position.copy(center);
      groupRef.current.rotation.set(0, 0, 0);
      startCenter.current.copy(center);
    }
  }, [selectedSeatIds, seats]);

  const tMode = mode === 'MOVE' ? 'translate' : (mode === 'ROTATE' ? 'rotate' : null);
  // Instead of checking groupRef.current during render, we can render TransformControls
  // and pass the ref directly or use state. Actually TransformControls takes the ref itself?
  // TransformControls object expects an Object3D, not a RefObject. But wait, it can take an Object3D if we pass groupRef.current. To avoid accessing ref during render, we can use state to store the group.
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (groupRef.current) {
      setGroupObj(groupRef.current);
    }
  }, []);

  const enabled = tMode !== null && selectedSeatIds.length > 0;

  return (
    <>
      <OrbitControls 
        ref={orbitRef} 
        makeDefault 
        enabled={mode !== 'PREVIEW'} 
      />

      <group ref={groupRef} />

      {enabled && groupObj && (
        <TransformControls
          object={groupObj}
          mode={tMode as 'translate' | 'rotate'}
          onMouseDown={() => {
            if (orbitRef.current) orbitRef.current.enabled = false;
            if (groupRef.current) groupRef.current.userData.isDragging = true;
            
            const currentSelected = seats.filter(s => selectedSeatIds.includes(s.id));
            setDragStart(currentSelected.map(s => ({
              id: s.id,
              pos: new THREE.Vector3(s.x, s.y, s.z),
              rot: new THREE.Euler(s.rotX, s.rotY, s.rotZ)
            })));
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
            if (groupRef.current) groupRef.current.userData.isDragging = false;
            
            if (groupRef.current) {
              const deltaPos = groupRef.current.position.clone().sub(startCenter.current);
              // For rotation, calculating delta Euler is complex, simplified for now
              
              dragStart.forEach(start => {
                updateSeat(start.id, {
                  x: start.pos.x + deltaPos.x,
                  y: start.pos.y + deltaPos.y,
                  z: start.pos.z + deltaPos.z,
                  // TODO: Apply rotation delta
                });
              });
              startCenter.current.copy(groupRef.current.position);
            }
          }}
        />
      )}
    </>
  );
}
