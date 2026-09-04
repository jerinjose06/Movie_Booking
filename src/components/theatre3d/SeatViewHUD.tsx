'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { type Seat3DData } from '@/utils/seatMapping';

interface SeatViewHUDProps {
  onSeatClick?: (seatId: number) => void;
  seats: Seat3DData[];
  forcedSeatId?: number;
}

export function SeatViewHUD({ seats, forcedSeatId, onSeatClick }: SeatViewHUDProps) {
  const { viewMode, viewingSeatId, setViewMode, toggleSeatSelection, selectedSeatIds, addCompareSeat, isComparing } = useBookingStore();
  
  const activeSeatId = forcedSeatId || viewingSeatId;
  const isVisible = viewMode === 'SEAT' && activeSeatId && !isComparing;
  
  if (!isVisible) return null;

  const activeSeat = seats.find(s => s.id === activeSeatId);
  if (!activeSeat) return null;

  const isSelected = selectedSeatIds.includes(activeSeat.id);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      <div className="flex justify-between items-start mt-16 md:mt-20">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700/50 pointer-events-auto flex items-center shadow-lg">
          <span className="text-xs md:text-sm font-bold text-gray-200 tracking-wider">
            YOUR VIEW
          </span>
          <span className="mx-2 text-gray-500">•</span>
          <span className="text-[10px] md:text-xs font-semibold text-emerald-400/90 tracking-wide">SIMULATED VIEW</span>
        </div>
        
        <button 
          onClick={() => setViewMode('ORBIT')}
          className="pointer-events-auto bg-gray-900/80 hover:bg-black backdrop-blur-md px-4 py-2 rounded-full border border-gray-600 text-sm font-medium transition-all text-white shadow-lg shadow-black/50 hover:scale-105"
        >
          Back to Theatre
        </button>
      </div>

      <div className="flex justify-between items-end w-full">
        <div className="bg-black/80 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700/50 w-full md:w-auto md:min-w-[250px] pointer-events-auto shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Seat {activeSeat.row_identifier}{activeSeat.seat_number}
          </h2>
          <div className="text-emerald-400 font-medium mb-3 md:mb-4 text-sm md:text-base">Standard</div>
          
          <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-white font-medium">₹{activeSeat.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Viewing Dist.</span>
              <span className="text-white font-medium">~{activeSeat.distanceToScreen.toFixed(1)}m</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2">
            <button 
              onClick={() => onSeatClick ? onSeatClick(activeSeat.id) : toggleSeatSelection(activeSeat.id)}
              className={`flex-1 md:w-full py-2.5 md:py-3 rounded-lg font-bold text-sm md:text-base transition-colors ${
                isSelected 
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isSelected ? 'Remove' : 'Select'}
            </button>

            <button 
              onClick={() => addCompareSeat(activeSeat.id)}
              className="flex-1 md:w-full py-2.5 md:py-3 rounded-lg font-bold text-sm md:text-base bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

