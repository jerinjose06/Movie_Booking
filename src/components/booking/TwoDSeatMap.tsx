import React from 'react';

interface Seat {
  id: number;
  row_id: number;
  seat_number: string;
  type_id: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  price: number;
  pos_x?: number;
  pos_y?: number;
  pos_z?: number;
}

interface Row {
  id: number;
  row_identifier: string;
  seats: Seat[];
}

interface TwoDSeatMapProps {
  rows: Row[];
  selectedSeatIds: number[];
  onSeatClick: (seatId: number) => void;
}

export function TwoDSeatMap({ rows, selectedSeatIds, onSeatClick }: TwoDSeatMapProps) {
  // Sort rows in reverse (e.g. J, I, H ... B, A) so Row A (front row) is closest to the screen at the bottom
  const sortedRows = [...rows].sort((a, b) => b.row_identifier.localeCompare(a.row_identifier));

  return (
    <div className="w-full bg-[#121212] relative overflow-hidden mb-12 select-none">
      {/* Scroll indicator for mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#121212] to-transparent pointer-events-none md:hidden z-10" />

      <div className="w-full overflow-x-auto p-4 flex flex-col items-center">
        <div className="flex flex-col items-center min-w-max pb-4 px-4">
          
          {/* Seat Grid */}
          <div className="flex flex-col gap-2 md:gap-3 pt-4">
            {sortedRows.map((row) => {
              // Sort seats by physical X position or seat number
              const sortedSeats = [...row.seats].sort((a, b) => {
                if (a.pos_x !== undefined && b.pos_x !== undefined) {
                  return a.pos_x - b.pos_x;
                }
                return parseInt(a.seat_number, 10) - parseInt(b.seat_number, 10);
              });

              return (
                <div key={row.id} className="flex items-center gap-2 md:gap-4">
                  {/* Left Row Label */}
                  <div className="w-4 md:w-6 text-center font-bold text-gray-500 text-xs md:text-sm">
                    {row.row_identifier}
                  </div>
                  
                  {/* Seats & Dynamic Aisles */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    {sortedSeats.map((seat, index) => {
                      // Check for aisle gap based on pos_x distance between adjacent seats
                      let hasAisleBefore = false;
                      const prevSeat = index > 0 ? sortedSeats[index - 1] : undefined;
                      if (prevSeat && seat.pos_x !== undefined && prevSeat.pos_x !== undefined) {
                        const gap = seat.pos_x - prevSeat.pos_x;
                        if (gap > 1.5) {
                          hasAisleBefore = true;
                        }
                      }

                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isAvailable = seat.status === 'AVAILABLE';
                      
                      let bgColor = 'bg-gray-800 text-gray-600 cursor-not-allowed'; // Booked / Blocked
                      if (isSelected) {
                        bgColor = 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.7)] ring-2 ring-red-400';
                      } else if (isAvailable) {
                        bgColor = 'bg-white hover:bg-red-50 text-gray-800 hover:text-red-600 transition-all cursor-pointer shadow-sm';
                      }

                      return (
                        <React.Fragment key={seat.id}>
                          {hasAisleBefore && (
                            <div className="w-5 sm:w-8 md:w-10 flex-shrink-0" aria-hidden="true" />
                          )}
                          <button
                            onClick={() => (isAvailable || isSelected ? onSeatClick(seat.id) : null)}
                            disabled={!isAvailable && !isSelected}
                            aria-label={`Seat ${row.row_identifier}${seat.seat_number}, ${seat.status}, ₹${seat.price}`}
                            aria-pressed={isSelected}
                            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-t-lg rounded-b-sm flex items-center justify-center text-[10px] md:text-xs font-bold transition-transform active:scale-95 ${bgColor}`}
                          >
                            <span>{seat.seat_number}</span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                  
                  {/* Right Row Label */}
                  <div className="w-4 md:w-6 text-center font-bold text-gray-500 text-xs md:text-sm">
                    {row.row_identifier}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Glowing Red Screen at Bottom (Front of Theatre) */}
          <div className="w-[85vw] max-w-[520px] h-12 border-b-[3px] border-red-600 rounded-b-[140px] mt-12 mb-6 flex flex-col items-center justify-end text-[11px] font-serif font-bold tracking-[0.25em] text-gray-400 shadow-[0_15px_30px_rgba(220,38,38,0.3)]">
            <span className="mb-3 opacity-70">SCREEN THIS WAY</span>
          </div>

          {/* Legend */}
          <div className="mt-8 flex justify-center items-center gap-6 sm:gap-8 text-xs text-gray-400 font-medium border-t border-gray-800/80 pt-6 w-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-t-md rounded-b-sm shadow-sm" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-t-md rounded-b-sm shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-t-md rounded-b-sm" />
              <span>Booked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
