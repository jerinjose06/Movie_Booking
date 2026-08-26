'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { easing } from 'maath';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useBookingStore } from '@/store/useBookingStore';
import { type Seat3DData } from '@/utils/seatMapping';

interface SeatCameraControllerProps {
  seats: Seat3DData[];
  forcedSeatId?: number; // Used for split screen
}

export function SeatCameraController({ seats, forcedSeatId }: SeatCameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { viewMode, viewingSeatId, isComparing } = useBookingStore();
  const { camera } = useThree();
  
  // Local target for maath to interpolate towards
  const currentTarget = useRef(new THREE.Vector3(0, 2, -10));

  const activeSeatId = forcedSeatId || viewingSeatId;
  const isSeatView = viewMode === 'SEAT';
  const isTransitioning = useRef(false);

  useEffect(() => {
    isTransitioning.current = true;
    const timer = setTimeout(() => {
      isTransitioning.current = false;
    }, 1200); // Allow 1.2s for transition
    return () => clearTimeout(timer);
  }, [viewMode, activeSeatId]);

  useFrame((state, delta) => {
    if (isTransitioning.current) {
      if (isSeatView && activeSeatId) {
        const seat = seats.find(s => s.id === activeSeatId);
        if (seat) {
          // Calculate a pivot point just 0.1 units in front of the camera
          const camPos = new THREE.Vector3(...seat.cameraPosition);
          const lookTarget = new THREE.Vector3(...seat.lookAtTarget);
          const dir = lookTarget.sub(camPos).normalize();
          const pivotPoint = camPos.clone().add(dir.multiplyScalar(0.1));

          easing.damp3(camera.position, seat.cameraPosition, 0.4, delta);
          easing.damp3(currentTarget.current, [pivotPoint.x, pivotPoint.y, pivotPoint.z], 0.4, delta);
        }
      } else if (viewMode === 'TOP_DOWN') {
        easing.damp3(camera.position, [0, 25, 10], 0.6, delta);
        easing.damp3(currentTarget.current, [0, 0, 10], 0.6, delta);
      } else if (viewMode === 'SCREEN_VIEW') {
        easing.damp3(camera.position, [0, 6, -6], 0.6, delta);
        easing.damp3(currentTarget.current, [0, 4, 10], 0.6, delta);
      } else {
        // Default ORBIT or fallback
        easing.damp3(camera.position, [0, 15, 25], 0.6, delta);
        easing.damp3(currentTarget.current, [0, 2, 5], 0.6, delta);
      }
      
      // Update orbit controls target ONLY when we are forcing a view
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentTarget.current);
      }
    }

    // Enforce camera bounds (never go beyond screen at Z = -8)
    const SCREEN_Z_BOUND = -7.5;
    if (camera.position.z < SCREEN_Z_BOUND) {
      const diff = SCREEN_Z_BOUND - camera.position.z;
      camera.position.setZ(SCREEN_Z_BOUND);
      if (controlsRef.current && !isTransitioning.current) {
        controlsRef.current.target.z += diff;
      }
    }

    // Enforce Y bounds (never go under the floor)
    // Floor is flat at y=-0.2 near screen (z < 0), slopes up for seating (z > 0)
    const minFloorY = camera.position.z < 0 ? -0.2 : (camera.position.z * 0.35) - 0.2;
    const CAMERA_HEIGHT_OFFSET = 0.2; // Don't let camera get closer than 0.2 to the floor
    
    if (camera.position.y < minFloorY + CAMERA_HEIGHT_OFFSET) {
      const diff = (minFloorY + CAMERA_HEIGHT_OFFSET) - camera.position.y;
      camera.position.y = minFloorY + CAMERA_HEIGHT_OFFSET;
      if (controlsRef.current && !isTransitioning.current && viewMode !== 'SEAT') {
        controlsRef.current.target.y += diff;
      }
    }
  });

  // Calculate constraints based on view mode
  let minDistance = 1;
  let maxDistance = 50;
  let minPolarAngle = 0;
  let maxPolarAngle = Math.PI / 2; // Prevent orbiting under the floor
  let minAzimuthAngle = -Infinity;
  let maxAzimuthAngle = Infinity;
  let enablePan = true;
  let enableZoom = true;

  if (isSeatView) {
    minDistance = 0.1;
    maxDistance = 0.1;
    minPolarAngle = Math.PI / 3;
    maxPolarAngle = Math.PI / 2 + 0.1;
    minAzimuthAngle = -Math.PI / 2;
    maxAzimuthAngle = Math.PI / 2;
    enablePan = false;
    enableZoom = false;
  } else if (viewMode === 'TOP_DOWN') {
    // Top down is mostly locked from above, but allow some orbit and pan
    minPolarAngle = 0;
    maxPolarAngle = Math.PI / 4;
  } else if (viewMode === 'SCREEN_VIEW') {
    // Screen view, looking at seats
    minPolarAngle = Math.PI / 4;
    maxPolarAngle = Math.PI / 2;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      
      minDistance={minDistance}
      maxDistance={maxDistance}
      
      minPolarAngle={minPolarAngle}     
      maxPolarAngle={maxPolarAngle} 
      
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      
      enableDamping
      dampingFactor={0.05}
      enablePan={enablePan}
      enableZoom={enableZoom}
    />
  );
}
