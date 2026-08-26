'use client';

import { Architecture } from './Architecture';
import { SeatGroup } from './SeatGroup';
import { type Seat3DData } from '@/utils/seatMapping';

interface AuditoriumProps {
  seats: Seat3DData[];
  onSeatClick?: (seatId: number) => void;
}

export function Auditorium({ seats, onSeatClick }: AuditoriumProps) {
  return (
    <group>
      <Architecture />
      <SeatGroup seats={seats} onSeatClick={onSeatClick} />
    </group>
  );
}
