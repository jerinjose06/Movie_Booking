'use client';

import { useMemo } from 'react';
import { Architecture } from './Architecture';
import { SeatGroup } from './SeatGroup';
import { type Seat3DData } from '@/utils/seatMapping';
import { useBookingStore } from '@/store/useBookingStore';

interface AuditoriumProps {
  seats: Seat3DData[];
  onSeatClick?: (seatId: number) => void;
}

export function Auditorium({ seats, onSeatClick }: AuditoriumProps) {
  const { lightMode } = useBookingStore();

  // Calculate bounding box of seats
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  let minZ = 0;
  let maxZ = 20;

  if (seats.length > 0) {
    minX = Math.min(...seats.map(s => s.position[0]));
    maxX = Math.max(...seats.map(s => s.position[0]));
    minY = Math.min(...seats.map(s => s.position[1]));
    maxY = Math.max(...seats.map(s => s.position[1]));
    minZ = Math.min(...seats.map(s => s.position[2]));
    maxZ = Math.max(...seats.map(s => s.position[2]));
  }

  // Calculate floor incline details
  const slopeAngle = maxZ > minZ ? Math.atan2(maxY - minY, maxZ - minZ) : 0;
  const floorLength = (maxZ - minZ) + 15;
  const floorMidY = (minY + maxY) / 2 - 0.35;
  const floorMidZ = (minZ + maxZ) / 2;

  // Add padding for room bounds
  const theatreWidth = Math.max(30, (maxX - minX) + 10);
  const theatreDepth = Math.max(40, maxZ + 20);

  // Dynamically find aisle X positions from gaps between seat columns
  const aisleXs = useMemo(() => {
    if (seats.length === 0) return [];
    
    // Group seats by Z coordinate (rows)
    const rowMap: { [z: number]: number[] } = {};
    seats.forEach(s => {
      const z = Math.round(s.position[2] * 10) / 10;
      if (!rowMap[z]) rowMap[z] = [];
      rowMap[z].push(s.position[0]);
    });

    const zKeys = Object.keys(rowMap).map(Number);
    if (zKeys.length === 0) return [];
    
    // Sample the middle row for stable column layout
    const sampleZ = zKeys[Math.floor(zKeys.length / 2)];
    const xs = rowMap[sampleZ].sort((a, b) => a - b);
    
    const aisles: number[] = [];
    for (let i = 0; i < xs.length - 1; i++) {
      const gap = xs[i+1] - xs[i];
      // Standard spacing between seats is 1.2, aisles are ~2.0+
      if (gap > 1.5) {
        aisles.push((xs[i] + xs[i+1]) / 2);
      }
    }
    return aisles;
  }, [seats]);

  return (
    <group>
      <Architecture 
        theatreWidth={theatreWidth} 
        theatreDepth={theatreDepth}
        floorAngle={slopeAngle}
        floorLength={floorLength}
        floorMidY={floorMidY}
        floorMidZ={floorMidZ}
      />
      
      {/* Dynamic aisle lights */}
      {!lightMode && aisleXs.map((x, idx) => {
        const lights = [];
        // Place a light every 5 units along the Z axis of the aisle walkway
        for (let z = 0; z <= maxZ + 5; z += 5) {
          // Calculate height of floor at this Z coordinate to keep light close to floor
          const zProgress = z - floorMidZ;
          const heightOffset = Math.sin(slopeAngle) * zProgress;
          const y = floorMidY + heightOffset + 0.8; // 0.8 units above floor level

          lights.push(
            <pointLight 
              key={`${idx}-${z}`} 
              position={[x, y, z]} 
              intensity={0.4} 
              color="#ffaa55" 
              distance={8} 
            />
          );
        }
        return <group key={idx}>{lights}</group>;
      })}

      <SeatGroup seats={seats} onSeatClick={onSeatClick} />
    </group>
  );
}
