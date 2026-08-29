import React from 'react';

interface Seat {
  id: number;
  row_id: number;
  seat_number: string;
  type_id: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  price: number;
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
  return (
    <div className="w-full bg-[#121212] relative overflow-hidden mb-32">
      {/* Scroll indicator for mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#121212] to-transparent pointer-events-none md:hidden z-10"></div>
      <div className="w-full overflow-x-auto p-4 flex flex-col md:items-center items-start">
      <div className="flex flex-col items-center min-w-max pb-4 px-2">
        
        <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <div className="w-6 text-center font-bold text-gray-500 text-xs">{row.row_identifier}</div>
            
            <div className="flex gap-2">
              {Array.from({ length: 21 }, (_, i) => i + 1).map((s) => {
                const seat = row.seats.find((st) => parseInt(st.seat_number, 10) === s);
                const hasLeftAisle = s === 6;
                const hasRightAisle = s === 17;

                if (!seat) {
                  return (
                    <React.Fragment key={`empty-${s}`}>
                      {hasLeftAisle && <div className="w-4 md:w-6" />}
                      {hasRightAisle && <div className="w-4 md:w-6" />}
                      <div className="w-9 h-9 md:w-10 md:h-10" />
                    </React.Fragment>
                  );
                }

                const isSelected = selectedSeatIds.includes(seat.id);
                const isAvailable = seat.status === 'AVAILABLE';
                
                let bgColor = 'bg-gray-800'; // Default / Blocked / Booked
                if (isSelected) {
                  bgColor = 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)]';
                } else if (isAvailable) {
                  bgColor = 'bg-white hover:bg-red-100 transition-colors cursor-pointer';
                }

                return (
                  <React.Fragment key={seat.id}>
                    {hasLeftAisle && <div className="w-4 md:w-6" />}
                    {hasRightAisle && <div className="w-4 md:w-6" />}
                    <button
                      onClick={() => isAvailable || isSelected ? onSeatClick(seat.id) : null}
                      disabled={!isAvailable && !isSelected}
                      aria-label={`Seat ${row.row_identifier}${seat.seat_number}, ${seat.status}, $${seat.price}`}
                      aria-pressed={isSelected}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-t-md rounded-b-sm flex items-center justify-center text-[10px] md:text-xs font-medium transition-all ${bgColor}`}
                    >
                      <span className={isSelected ? 'text-white' : 'text-transparent md:text-gray-400'}>{seat.seat_number}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            
            <div className="w-6 text-center font-bold text-gray-500 text-xs">{row.row_identifier}</div>
          </div>
        ))}
      </div>
      
      {/* Glowing Red Screen at Bottom */}
      <div className="w-[80vw] max-w-[400px] h-12 border-b-[3px] border-red-600 rounded-b-[100px] mt-12 mb-4 flex flex-col items-center justify-end text-sm font-serif font-bold text-gray-300 shadow-[0_15px_30px_rgba(220,38,38,0.2)]">
        <span className="mb-4 opacity-50">SCREEN</span>
      </div>

      <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-sm"></div>Booked</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-sm border border-gray-300"></div>Empty</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded-sm shadow-[0_0_5px_rgba(220,38,38,0.6)]"></div>Selected</div>
      </div>
      </div>
    </div>
    </div>
  );
}
