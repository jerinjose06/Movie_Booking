'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { type Seat3DData } from '@/utils/seatMapping';
import { useBookingStore } from '@/store/useBookingStore';

interface AvatarManagerProps {
  seats: Seat3DData[];
}

export function AvatarManager({ seats }: AvatarManagerProps) {
  const { showAvatars } = useBookingStore();

  // Find all booked seats
  const bookedSeats = useMemo(() => seats.filter(s => s.status === 'BOOKED'), [seats]);

  const count = bookedSeats.length;

  const torsoMeshRef = useRef<THREE.InstancedMesh>(null);
  const headMeshRef = useRef<THREE.InstancedMesh>(null);

  // 5 Shirt Colors
  const colors = useMemo(() => [
    new THREE.Color('#374151'), // dark gray
    new THREE.Color('#1e3a8a'), // dark blue
    new THREE.Color('#7f1d1d'), // dark red
    new THREE.Color('#14532d'), // dark green
    new THREE.Color('#4c1d95'), // dark purple
  ], []);

  const headColor = useMemo(() => new THREE.Color('#9ca3af'), []); // generic gray

  useEffect(() => {
    if (!torsoMeshRef.current || !headMeshRef.current || count === 0) return;

    const dummy = new THREE.Object3D();

    bookedSeats.forEach((seat, index) => {
      // Base position of the seat
      const [sx, sy, sz] = seat.position;
      const [rx, ry, rz] = seat.rotation;

      // Position torso slightly above the seat bottom
      // Seat bottom is at sy, thickness 0.1, so top of seat is sy + 0.05
      // Torso is height 0.5. Center is at sy + 0.05 + 0.25 = sy + 0.3
      dummy.position.set(sx, sy + 0.3, sz);
      dummy.rotation.set(rx, ry, rz);
      
      // Add slight random leaning or looking (deterministically based on id)
      const randomLean = ((seat.id % 10) - 5) * 0.02; 
      dummy.rotation.y += randomLean;
      
      dummy.updateMatrix();
      torsoMeshRef.current!.setMatrixAt(index, dummy.matrix);
      
      // Determine variant color (seat.id % 5)
      const colorVariant = colors[seat.id % colors.length];
      torsoMeshRef.current!.setColorAt(index, colorVariant);

      // Position Head above torso
      dummy.position.set(sx, sy + 0.65, sz);
      // Heads might look slightly different directions
      const randomLook = ((seat.id % 7) - 3) * 0.05;
      dummy.rotation.set(rx, ry + randomLook, rz);
      
      dummy.updateMatrix();
      headMeshRef.current!.setMatrixAt(index, dummy.matrix);
      headMeshRef.current!.setColorAt(index, headColor);
    });

    torsoMeshRef.current.instanceMatrix.needsUpdate = true;
    if (torsoMeshRef.current.instanceColor) torsoMeshRef.current.instanceColor.needsUpdate = true;
    
    headMeshRef.current.instanceMatrix.needsUpdate = true;
    if (headMeshRef.current.instanceColor) headMeshRef.current.instanceColor.needsUpdate = true;

  }, [bookedSeats, count, colors, headColor]);

  if (count === 0) return null;

  return (
    <group visible={showAvatars}>
      {/* Torsos */}
      <instancedMesh
        ref={torsoMeshRef}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
        raycast={() => null} // Disable raycasting to prevent blocking seat selection
      >
        <boxGeometry args={[0.35, 0.45, 0.25]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>

      {/* Heads */}
      <instancedMesh
        ref={headMeshRef}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
        raycast={() => null} // Disable raycasting
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </group>
  );
}
