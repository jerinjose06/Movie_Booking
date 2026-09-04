'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { easing } from 'maath';
import { OrbitControls, DeviceOrientationControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useBookingStore } from '@/store/useBookingStore';
import { type Seat3DData } from '@/utils/seatMapping';

interface SeatCameraControllerProps {
  seats: Seat3DData[];
  forcedSeatId?: number;
}

export function SeatCameraController({ seats, forcedSeatId }: SeatCameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { viewMode, viewingSeatId } = useBookingStore();
  const { camera, gl } = useThree();

  const activeSeatId = forcedSeatId || viewingSeatId;
  const isSeatView = viewMode === 'SEAT';
  const [gyroActive, setGyroActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gyroOffset, setGyroOffset] = useState<number>(0);
  const offsetComputed = useRef(false);

  // First-person mouse drag look state
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const transitionActive = useRef(false);

  // Calibrate gyroscope so the user always faces the screen initially, regardless of physical compass direction
  useEffect(() => {
    if (isSeatView && isMobile) {
      offsetComputed.current = false;

      const handleOrientation = (event: DeviceOrientationEvent) => {
        // Some devices might return null if they lack a magnetometer, but if it has one, we calibrate
        if (event.alpha !== null && !offsetComputed.current) {
          offsetComputed.current = true;
          const alphaRad = THREE.MathUtils.degToRad(event.alpha);
          
          let baseYaw = 0;
          const seat = seats.find(s => s.id === activeSeatId);
          if (seat) {
            const screenTarget = new THREE.Vector3(0, 6.5, -8.0);
            const camPos = new THREE.Vector3(...seat.cameraPosition);
            const baseDir = screenTarget.clone().sub(camPos).normalize();
            // Calculate the angle needed to look directly at the screen from this specific seat
            baseYaw = Math.atan2(baseDir.x, -baseDir.z); 
          }

          // Offset the physical compass heading by our target virtual heading
          setGyroOffset(baseYaw - alphaRad);
          window.removeEventListener('deviceorientation', handleOrientation);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);

      // Fallback: If no event fires within 1 second, we just leave offset as 0
      const fallbackTimer = setTimeout(() => {
        window.removeEventListener('deviceorientation', handleOrientation);
      }, 1000);

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isSeatView, isMobile, activeSeatId, seats]);

  // Reset look angles when seat changes or view changes
  useEffect(() => {
    transitionActive.current = true;
    setGyroActive(false);
    targetYaw.current = 0;
    targetPitch.current = 0;
    currentYaw.current = 0;
    currentPitch.current = 0;

    if (viewMode === 'TOP_DOWN') {
      targetPos.current.set(0, 28, 12);
      targetLook.current.set(0, 0, 8);
    } else if (viewMode === 'SCREEN_VIEW') {
      targetPos.current.set(0, 5.5, -4.5);
      targetLook.current.set(0, 4, 12);
    } else if (viewMode === 'ORBIT') {
      targetPos.current.set(0, 16, 26);
      targetLook.current.set(0, 3, 6);
    }

    const timer = setTimeout(() => {
      transitionActive.current = false;
      if (isSeatView && isMobile) {
        setGyroActive(true);
      }
    }, 400); // reduced delay for snappier transition

    return () => clearTimeout(timer);
  }, [viewMode, activeSeatId, isSeatView, isMobile]);

  // Pointer drag event handlers for seated first-person view
  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!isSeatView) return;
    isDragging.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
  }, [isSeatView]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isSeatView || !isDragging.current) return;
    const deltaX = e.clientX - prevPointer.current.x;
    const deltaY = e.clientY - prevPointer.current.y;
    prevPointer.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.003;
    targetYaw.current -= deltaX * sensitivity;
    targetPitch.current -= deltaY * sensitivity;

    // Constrain horizontal look (left/right head turn) to +/- 85 degrees
    const maxYaw = Math.PI * 0.47;
    targetYaw.current = Math.max(-maxYaw, Math.min(maxYaw, targetYaw.current));

    // Constrain vertical look (up/down) to -30 to +35 degrees
    const minPitch = -Math.PI * 0.22;
    const maxPitch = Math.PI * 0.25;
    targetPitch.current = Math.max(minPitch, Math.min(maxPitch, targetPitch.current));
  }, [isSeatView]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl.domElement, onPointerDown, onPointerMove, onPointerUp]);

  useFrame((_state, delta) => {
    if (isSeatView && activeSeatId) {
      const seat = seats.find(s => s.id === activeSeatId);
      if (seat) {
        // Snappier transition to seat eye height
        easing.damp3(camera.position, seat.cameraPosition, 0.15, delta);

        // Only use drag-to-look on desktop or if gyro isn't active
        if (!isMobile || !gyroActive) {
          // Snappier interpolation for look-around
          currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, Math.min(1, delta * 20));
          currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, Math.min(1, delta * 20));

          // Base vector pointing towards center of the screen
          const screenTarget = new THREE.Vector3(0, 6.5, -8.0);
          const camPos = new THREE.Vector3(...seat.cameraPosition);
          const baseDir = screenTarget.clone().sub(camPos).normalize();

          // Calculate base angles
          const baseYaw = Math.atan2(baseDir.x, -baseDir.z);
          const basePitch = Math.asin(baseDir.y);

          const totalYaw = baseYaw + currentYaw.current;
          const totalPitch = basePitch + currentPitch.current;

          // Compute forward look direction
          const lookDir = new THREE.Vector3(
            Math.sin(totalYaw) * Math.cos(totalPitch),
            Math.sin(totalPitch),
            -Math.cos(totalYaw) * Math.cos(totalPitch)
          ).normalize();

          const lookAtPos = camera.position.clone().add(lookDir);
          camera.lookAt(lookAtPos);
        }
      }
    } else {
      // For TOP_DOWN, SCREEN_VIEW, and FREE
      if (transitionActive.current) {
        easing.damp3(camera.position, targetPos.current, 0.25, delta);
        if (controlsRef.current) {
          easing.damp3(controlsRef.current.target, targetLook.current, 0.25, delta);
        }
      }

      // Spatial clamp and dynamic floor collision
      if (controlsRef.current && !transitionActive.current) {
        let clamped = false;
        
        // Prevent going behind the screen (screen is at z = -8, wall is at -10)
        if (camera.position.z < -6) {
          camera.position.z = -6;
          clamped = true;
        }
        
        // Prevent going outside the side walls (wallX is around 25)
        if (camera.position.x < -23) {
          camera.position.x = -23;
          clamped = true;
        }
        if (camera.position.x > 23) {
          camera.position.x = 23;
          clamped = true;
        }

        // Prevent going through the back wall (backZ is around 35)
        if (camera.position.z > 33) {
          camera.position.z = 33;
          clamped = true;
        }

        // Reorient camera if we pushed it to prevent jerky visual glitches
        if (clamped) {
          camera.lookAt(controlsRef.current.target);
        }

        // --- NEW: Prevent camera from going under the seats ---
        // The seating profile slopes up towards the back: roughly y = max(0, z * 0.357)
        // We enforce a dynamic maxPolarAngle on OrbitControls to prevent dipping below this slope
        const z = camera.position.z;
        const floorHeight = Math.max(0.5, z * 0.357);
        const minCameraY = floorHeight + 1.2; // Stay at least 1.2m above floor/seats
        
        const targetY = controlsRef.current.target.y;
        const dy = minCameraY - targetY;
        
        if (dy > 0) {
          const dx = camera.position.x - controlsRef.current.target.x;
          const dz = camera.position.z - controlsRef.current.target.z;
          const distHorizontal = Math.sqrt(dx*dx + dz*dz);
          
          if (distHorizontal > 0.1) {
            const maxAngle = Math.atan2(distHorizontal, dy);
            controlsRef.current.maxPolarAngle = Math.min(Math.PI / 2 - 0.05, maxAngle);
          }
        } else {
          // If target is high enough, default clamp to just above flat floor
          controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
        }
      }
    }
  });

  if (isSeatView && isMobile && gyroActive) {
    return <DeviceOrientationControls makeDefault alphaOffset={gyroOffset} />;
  }

  // When not in seated first-person view, use standard OrbitControls
  if (!isSeatView) {
    return (
      <OrbitControls
        ref={controlsRef}
        makeDefault
        minDistance={3}
        maxDistance={45}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent clipping through the floor
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        enableZoom={true}
      />
    );
  }

  return null;
}
