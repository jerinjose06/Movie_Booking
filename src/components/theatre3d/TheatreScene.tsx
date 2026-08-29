'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { TheatreEnvironment } from './TheatreEnvironment';
import { SeatCameraController } from './CameraController';
import { Auditorium } from './Auditorium';
import { AvatarManager } from './AvatarManager';
import { calculateSeatCoordinates, type SeatData } from '@/utils/seatMapping';
import { Loader } from '@react-three/drei';
import { useBookingStore } from '@/store/useBookingStore';
import { SeatViewHUD } from './SeatViewHUD';
import { CompareHUD } from './CompareHUD';

interface TheatreSceneProps {
  liveSeats: SeatData[];
  onSeatClick?: (seatId: number) => void;
}

export function TheatreScene({ liveSeats, onSeatClick }: TheatreSceneProps) {
  const { viewMode, viewingSeatId, isComparing } = useBookingStore();
  
  const seats3D = useMemo(() => calculateSeatCoordinates(liveSeats), [liveSeats]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black rounded-lg overflow-hidden border border-gray-800">
      
      {!isComparing && (
        <SeatViewHUD seats={seats3D} forcedSeatId={viewingSeatId || undefined} onSeatClick={onSeatClick} />
      )}
      
      {isComparing && (
        <CompareHUD seats={seats3D} />
      )}

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <TheatreEnvironment />
          <SeatCameraController seats={seats3D} forcedSeatId={viewingSeatId || undefined} />
          <Auditorium seats={seats3D} onSeatClick={onSeatClick} />
          <AvatarManager seats={seats3D} />
        </Suspense>
      </Canvas>

      <Loader />
    </div>
  );
}

