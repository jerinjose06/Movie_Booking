export interface SeatData {
  id: number;
  seat_id: number;
  show_seat_id: string; // The UUID from the show_seats table
  row_id: number;
  row_identifier: string;
  seat_number: string;
  type_id: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  held_by?: string;
  price: number;
  pos_x?: number;
  pos_y?: number;
  pos_z?: number;
}

export interface Seat3DData extends SeatData {
  position: [number, number, number];
  rotation: [number, number, number];
  cameraPosition: [number, number, number];
  lookAtTarget: [number, number, number];
  distanceToScreen: number;
  viewingAngle: number;
  screenCoverage: number;
  obstruction: number;
  quality: 'Excellent' | 'Good' | 'Average';
}

// Convert A-Z identifier to a 0-based index (A = 0, B = 1)
function getRowIndex(rowIdentifier: string): number {
  return rowIdentifier.charCodeAt(0) - 65;
}

export function calculateSeatCoordinates(seats: SeatData[]): Seat3DData[] {
  const seatSpacingX = 0.8;
  const rowSpacingZ = 1.4;
  const rowElevationY = 0.5; // Steeper stadium seating
  const curveRadius = 45; // Flatter curve
  const aisleWidth = 1.5;

  return seats.map((seat) => {
    // If DB provides positions, use them
    if (seat.pos_x !== undefined && seat.pos_y !== undefined && seat.pos_z !== undefined) {
      // Invert X coordinate so 3D perspective matches the user's expected orientation
      const posX = -seat.pos_x;
      const position: [number, number, number] = [posX, seat.pos_y, seat.pos_z];
      
      const xOffset = posX;
      const rotationY = Math.atan2(xOffset, curveRadius);
      const rotation: [number, number, number] = [0, rotationY, 0];

      const cameraPosition: [number, number, number] = [
        position[0],
        position[1] + 0.8, // Average sitting eye level
        position[2]
      ];
      
      // Look at center of the screen
      const lookAtTarget: [number, number, number] = [0, 6.5, -8];

      const distanceToScreen = Math.sqrt(
        Math.pow(cameraPosition[0] - lookAtTarget[0], 2) +
        Math.pow(cameraPosition[1] - lookAtTarget[1], 2) +
        Math.pow(cameraPosition[2] - lookAtTarget[2], 2)
      );

      const viewingAngle = Math.abs(rotationY * (180 / Math.PI));
      const screenCoverage = Math.max(10, Math.min(100, 100 - (distanceToScreen / 20) * 60));
      
      let quality: 'Excellent' | 'Good' | 'Average' = 'Average';
      if (distanceToScreen < 15 && viewingAngle < 15) quality = 'Excellent';
      else if (distanceToScreen < 25 && viewingAngle < 30) quality = 'Good';

      return {
        ...seat,
        position,
        rotation,
        cameraPosition,
        lookAtTarget,
        distanceToScreen,
        viewingAngle,
        screenCoverage,
        obstruction: 10,
        quality
      };
    }

    // Fallback logic
    const rowIndex = getRowIndex(seat.row_identifier);
    const totalRows = 15;
    const physicalRow = totalRows - 1 - rowIndex;

    const s = parseInt(seat.seat_number, 10);
    const rowZ = physicalRow * rowSpacingZ;
    const rowY = physicalRow * rowElevationY;

    let xOffset = -(s - 11) * seatSpacingX;
    if (s <= 5) xOffset += aisleWidth;
    else if (s >= 17) xOffset -= aisleWidth;
    
    const curveZ = -Math.sqrt(Math.max(0, curveRadius * curveRadius - xOffset * xOffset)) + curveRadius;
    const position: [number, number, number] = [xOffset, rowY, rowZ + curveZ];
    const rotationY = Math.atan2(xOffset, curveRadius);
    const rotation: [number, number, number] = [0, rotationY, 0];
    const cameraPosition: [number, number, number] = [position[0], position[1] + 0.8, position[2]];
    const lookAtTarget: [number, number, number] = [0, 6.5, -8];
    const distanceToScreen = Math.sqrt(
      Math.pow(cameraPosition[0] - lookAtTarget[0], 2) +
      Math.pow(cameraPosition[1] - lookAtTarget[1], 2) +
      Math.pow(cameraPosition[2] - lookAtTarget[2], 2)
    );
    const viewingAngle = Math.abs(rotationY * (180 / Math.PI));
    const screenCoverage = Math.max(10, Math.min(100, 100 - (distanceToScreen / 20) * 60));
    const obstruction = physicalRow === 0 ? 0 : Math.min(30, physicalRow * 2 + (viewingAngle * 0.2));
    
    let quality: 'Excellent' | 'Good' | 'Average' = 'Average';
    if (distanceToScreen < 15 && viewingAngle < 15) quality = 'Excellent';
    else if (distanceToScreen < 25 && viewingAngle < 30) quality = 'Good';

    return {
      ...seat,
      position,
      rotation,
      cameraPosition,
      lookAtTarget,
      distanceToScreen,
      viewingAngle,
      screenCoverage,
      obstruction,
      quality
    };
  });
}
