import { calculateSeatCoordinates, type SeatData } from './seatMapping';
import { describe, it, expect } from 'vitest';

describe('Seat Mapping', () => {
  it('assigns 3D coordinates based on row and number', () => {
    const mockSeats: SeatData[] = [
      { id: 1, seat_id: 1, show_seat_id: "1", row_id: 1, seat_number: "1", type_id: 1, status: "AVAILABLE", price: 10, row_identifier: "A" },
      { id: 2, seat_id: 2, show_seat_id: "2", row_id: 1, seat_number: "2", type_id: 1, status: "AVAILABLE", price: 10, row_identifier: "A" },
      { id: 3, seat_id: 3, show_seat_id: "3", row_id: 2, seat_number: "1", type_id: 1, status: "AVAILABLE", price: 10, row_identifier: "B" }
    ];

    const mapped = calculateSeatCoordinates(mockSeats);

    expect(mapped.length).toBe(3);
    expect(mapped[0].position).toBeDefined();
    expect(mapped[0].rotation).toBeDefined();

    // Row A should be elevated compared to Row B
    expect(mapped[0].position[1]).toBeGreaterThan(mapped[2].position[1]);
  });
});
