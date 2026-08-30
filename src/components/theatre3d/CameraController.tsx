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
  const isTransitioning = useRef(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Reset look angles when seat changes or view changes
  useEffect(() => {
    isTransitioning.current = true;
    setGyroActive(false);
    targetYaw.current = 0;
    targetPitch.current = 0;
    currentYaw.current = 0;
    currentPitch.current = 0;

    const timer = setTimeout(() => {
      isTransitioning.current = false;
      if (isSeatView && isMobile) {
        setGyroActive(true);
      }
    }, 800);

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
        // Move camera position smoothly to seat eye height
        easing.damp3(camera.position, seat.cameraPosition, 0.35, delta);

        // Smoothly interpolate look-around rotation
        currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, Math.min(1, delta * 12));
        currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, Math.min(1, delta * 12));

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
    } else if (viewMode === 'TOP_DOWN') {
      easing.damp3(camera.position, [0, 28, 12], 0.6, delta);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 8);
      }
    } else if (viewMode === 'SCREEN_VIEW') {
      easing.damp3(camera.position, [0, 5.5, -6.5], 0.6, delta);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 4, 12);
      }
    } else {
      // Default ORBIT / Free Cam
      if (isTransitioning.current) {
        easing.damp3(camera.position, [0, 16, 26], 0.6, delta);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 3, 6);
        }
      }
    }
  });

  if (isSeatView && isMobile && gyroActive) {
    return <DeviceOrientationControls makeDefault alphaOffset={Math.PI} />;
  }

  // When not in seated first-person view, use standard OrbitControls
  if (!isSeatView) {
    return (
      <OrbitControls
        ref={controlsRef}
        makeDefault
        minDistance={2}
        maxDistance={55}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.06}
        enablePan={true}
        enableZoom={true}
      />
    );
  }

  return null;
}
