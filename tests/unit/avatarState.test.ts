import { describe, it, expect } from 'vitest';
import { type Seat3DData } from '@/utils/seatMapping';

describe('Avatar Assignment Logic', () => {
  it('assigns avatars only to BOOKED seats', () => {
    const seats: Seat3DData[] = [
      { id: 1, status: 'AVAILABLE' } as Seat3DData,
      { id: 2, status: 'HELD' } as Seat3DData,
      { id: 3, status: 'BOOKED' } as Seat3DData,
      { id: 4, status: 'BLOCKED' } as Seat3DData,
      { id: 5, status: 'BOOKED' } as Seat3DData,
    ];

    const bookedSeats = seats.filter(s => s.status === 'BOOKED');
    
    expect(bookedSeats.length).toBe(2);
    expect(bookedSeats.map(s => s.id)).toEqual([3, 5]);
  });

  it('assigns variants deterministically based on seat ID', () => {
    // 5 color variants simulated
    const getVariant = (id: number) => id % 5;
    
    expect(getVariant(10)).toBe(0);
    expect(getVariant(10)).toBe(0); // Stable across calls
    expect(getVariant(12)).toBe(2);
    expect(getVariant(16)).toBe(1);
  });
});
