'use client';

import { TheatreScene } from '@/components/theatre3d/TheatreScene';
import { generateTheatreData } from '@/utils/mockTheatreData';
import { useMemo } from 'react';
import { type SeatData } from '@/utils/seatMapping';

export default function TheatreDemoPage() {
  const mockSeats = useMemo(() => {
    // Generate old mock format and map to new DB-like format
    const oldData = generateTheatreData();
    return oldData.seats.map((s, i) => ({
      id: i + 1,
      seat_id: i + 1,
      show_seat_id: (i + 1).toString(),
      row_id: s.row.charCodeAt(0) - 64,
      seat_number: s.number.toString(),
      type_id: 1,
      status: s.status as SeatData['status'],
      price: 15.00,
      row_identifier: s.row
    }));
  }, []);

  return (
    <main className="w-full h-screen overflow-hidden bg-black text-white">
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-lg border border-gray-800 backdrop-blur-md">
        <h1 className="text-xl font-bold mb-2">3D Theatre Engine (Phase 4 Demo)</h1>
        <p className="text-sm text-gray-300">
          Capacity: ~350 Seats (14 Rows x 25 Seats) <br />
          Procedural Layout with Curve & Elevation <br />
          Interactive Instanced Meshes (60FPS) <br />
          Restricted Camera Boundaries
        </p>
      </div>
      
      <TheatreScene liveSeats={mockSeats} />
    </main>
  );
}
