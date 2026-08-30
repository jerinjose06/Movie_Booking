'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { type Seat3DData } from '@/utils/seatMapping';

interface CompareHUDProps {
  seats: Seat3DData[];
}

export function CompareHUD({ seats }: CompareHUDProps) {
  const { compareSeatIds, removeCompareSeat, clearCompare, viewingSeatId, setViewingSeatId, toggleSeatSelection, selectedSeatIds, setViewMode } = useBookingStore();
  
  if (compareSeatIds.length === 0) return null;

  const compareSeats = compareSeatIds.map(id => seats.find(s => s.id === id)).filter(Boolean) as Seat3DData[];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700/50 pointer-events-auto">
          <span className="text-xs font-bold text-gray-300 tracking-wider">COMPARE MODE</span>
          <span className="mx-2 text-gray-500">•</span>
          <span className="text-xs text-blue-400 font-medium">Select up to 3 seats in the theatre</span>
        </div>
        
        <button 
          onClick={clearCompare}
          className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700/50 text-sm font-medium transition-colors text-white"
        >
          Exit Comparison
        </button>
      </div>

      {/* Bottom Cards */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-2 pointer-events-auto w-full max-w-full hide-scrollbar">
        {compareSeats.map((seat) => {
          const isSelected = selectedSeatIds.includes(seat.id);
          const isViewing = viewingSeatId === seat.id;
          
          return (
            <div 
              key={seat.id} 
              className={`flex-1 min-w-[280px] bg-black/80 backdrop-blur-md p-5 rounded-xl border transition-all ${
                isViewing ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">Seat {seat.row_identifier}{seat.seat_number}</h3>
                  <div className="text-sm font-medium mt-1">
                    <span className={
                      seat.quality === 'Excellent' ? 'text-emerald-400' :
                      seat.quality === 'Good' ? 'text-blue-400' : 'text-gray-400'
                    }>
                      {seat.quality} View
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">₹{seat.price.toFixed(2)}</div>
                  <button 
                    onClick={() => removeCompareSeat(seat.id)}
                    className="text-xs text-gray-400 hover:text-red-400 mt-1 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Distance</span>
                  <span className="text-gray-200">{seat.distanceToScreen.toFixed(1)}m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Angle</span>
                  <span className="text-gray-200">{seat.viewingAngle.toFixed(0)}°</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Screen Fill</span>
                  <span className="text-gray-200">{seat.screenCoverage.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Obstruction</span>
                  <span className="text-gray-200">{seat.obstruction.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setViewingSeatId(seat.id);
                    setViewMode('SEAT');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isViewing 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {isViewing ? 'Viewing' : 'View Seat'}
                </button>
                <button 
                  onClick={() => {
                    toggleSeatSelection(seat.id);
                    if (!isSelected) {
                      clearCompare();
                      setViewMode('ORBIT');
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                      : 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isSelected ? 'Remove' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Placeholder for remaining slots */}
        {Array.from({ length: 3 - compareSeats.length }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 min-w-[280px] border border-dashed border-gray-700/50 rounded-xl bg-black/20 flex flex-col items-center justify-center text-gray-500 p-6 min-h-[200px]">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Add seat to compare</span>
          </div>
        ))}
      </div>
    </div>
  );
}
