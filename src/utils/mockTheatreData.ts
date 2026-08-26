export interface SeatData {
  id: string;
  row: string;
  number: number;
  position: [number, number, number];
  rotation: [number, number, number];
  status: 'AVAILABLE' | 'BOOKED' | 'HELD';
}

export interface TheatreData {
  capacity: number;
  seats: SeatData[];
}

export function generateTheatreData(): TheatreData {
  const seats: SeatData[] = [];
  
  // Dimensions and layout
  const rows = 14;
  const seatsPerRow = 25;
  const seatSpacingX = 0.8;
  const rowSpacingZ = 1.2;
  const rowElevationY = 0.3; // Stepped seating
  const curveRadius = 25;
  
  for (let r = 0; r < rows; r++) {
    const rowChar = String.fromCharCode(65 + r); // A, B, C...
    const rowZ = r * rowSpacingZ;
    const rowY = r * rowElevationY;
    
    for (let s = 0; s < seatsPerRow; s++) {
      // Center seats around x=0
      const xOffset = (s - (seatsPerRow - 1) / 2) * seatSpacingX;
      
      // Calculate curve (pushing edges slightly forward)
      const curveZ = -Math.sqrt(Math.max(0, curveRadius * curveRadius - xOffset * xOffset)) + curveRadius;
      
      const position: [number, number, number] = [
        xOffset,
        rowY,
        rowZ + curveZ
      ];
      
      // Rotate seats to face center screen
      const rotationY = Math.atan2(xOffset, curveRadius);
      const rotation: [number, number, number] = [0, rotationY, 0];
      
      seats.push({
        id: `${rowChar}${s + 1}`,
        row: rowChar,
        number: s + 1,
        position,
        rotation,
        status: Math.random() > 0.8 ? 'BOOKED' : 'AVAILABLE' // random mock status
      });
    }
  }

  return {
    capacity: seats.length,
    seats
  };
}
