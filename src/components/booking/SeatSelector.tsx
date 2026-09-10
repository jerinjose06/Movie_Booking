'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TwoDSeatMap } from './TwoDSeatMap';
import { useBookingStore } from '@/store/useBookingStore';
import { useRealtimeSeats } from '@/hooks/useRealtimeSeats';
import { type SeatData } from '@/utils/seatMapping';
import { MonitorPlay, LayoutGrid, Wifi, WifiOff, Loader2, X, Map as MapIcon, Video, Users, Sun, Moon, ArrowLeft, Camera } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const TheatreScene = dynamic(
  () => import('../theatre3d/TheatreScene').then((mod) => mod.TheatreScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-3" />
        <p className="font-serif text-lg">Loading 3D Cinema Experience...</p>
      </div>
    ),
  }
);

interface SeatSelectorProps {
  showId: string;
  initialSeats: SeatData[];
  userId: string;
}

export function SeatSelector({ showId, initialSeats, userId }: SeatSelectorProps) {
  const [seats, setSeats] = useState<SeatData[]>(initialSeats);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const { selectedSeatIds, toggleSeatSelection, clearSelection, showAvatars, lightMode, viewMode: storeViewMode, setViewMode: setStoreViewMode, setViewingSeatId } = useBookingStore();
  const supabase = createClient();

  // Initialize store with seats that are already held by this user
  React.useEffect(() => {
    clearSelection();
    const myHeldSeats = initialSeats.filter(s => s.status === 'HELD' && s.held_by === userId);
    myHeldSeats.forEach(s => toggleSeatSelection(s.id, false));
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeatUpdate = useCallback((newSeat: any) => {
    if (newSeat) {
      const now = new Date();
      let computedStatus = newSeat.status;
      let computedHeldBy = newSeat.held_by;
      if (newSeat.status === 'HELD' && newSeat.hold_expires_at) {
        if (new Date(newSeat.hold_expires_at) < now) {
          computedStatus = 'AVAILABLE';
          computedHeldBy = null;
        }
      }

      setSeats((currentSeats) => {
        // Use getState to avoid adding selectedSeatIds to useCallback dependencies
        const currentSelected = useBookingStore.getState().selectedSeatIds;
        // If someone else took the seat we had selected, deselect it
        if (computedStatus !== 'AVAILABLE' && computedHeldBy !== userId && currentSelected.includes(newSeat.seat_id)) {
          useBookingStore.getState().toggleSeatSelection(newSeat.seat_id, true); // true = force remove local selection
        }
        return currentSeats.map((seat) => (seat.show_seat_id === newSeat.id ? { ...seat, status: computedStatus, held_by: computedHeldBy } : seat));
      });
    }
  }, [userId]);

  const handleReconnect = useCallback(async () => {
    // We use a fresh client for the REST call inside the hook to avoid recreating the callback
    const localSupabase = createClient();
    // Re-fetch all seats to reconcile state
    const { data } = await localSupabase
      .from('show_seats')
      .select('id, seat_id, status, held_by, hold_expires_at')
      .eq('show_id', showId);
      
    if (data) {
      const now = new Date();
      setSeats(currentSeats => 
        currentSeats.map(seat => {
          const remote = data.find(r => r.id === seat.show_seat_id);
          if (remote) {
            let computedStatus = remote.status;
            let computedHeldBy = remote.held_by;
            if (remote.status === 'HELD' && remote.hold_expires_at) {
              if (new Date(remote.hold_expires_at) < now) {
                computedStatus = 'AVAILABLE';
                computedHeldBy = null;
              }
            }
            return { ...seat, status: computedStatus, held_by: computedHeldBy };
          }
          return seat;
        })
      );
    }
  }, [showId, supabase]);

  const { status: connStatus } = useRealtimeSeats(showId, handleSeatUpdate, handleReconnect);

  const handleSeatClick = async (seatId: number) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    
    // Check if it's already held by someone else
    if (seat.status !== 'AVAILABLE' && seat.held_by !== userId) {
      toast("This seat is currently unavailable.");
      return;
    }

    const isCurrentlySelected = selectedSeatIds.includes(seatId);
    const willHold = !isCurrentlySelected;

    if (willHold && selectedSeatIds.length >= 8) {
      toast("You can only select up to 8 seats.");
      return;
    }
    
    // Optimistic update locally
    toggleSeatSelection(seatId, false);

    // Persist hold on server
    const { error } = await supabase.rpc('toggle_seat_hold', {
      p_show_id: showId,
      p_seat_id: seatId,
      p_user_id: userId,
      p_hold: willHold
    });

    if (error) {
      // Revert optimistic update
      toggleSeatSelection(seatId, true); // Force remove
      toast.error(error.message || "Could not reserve seat.");
    }
  };

  const rows = useMemo(() => {
    const rowMap = new Map<number, any>();
    seats.forEach((seat) => {
      if (!rowMap.has(seat.row_id)) {
        rowMap.set(seat.row_id, {
          id: seat.row_id,
          row_identifier: seat.row_identifier,
          seats: []
        });
      }
      rowMap.get(seat.row_id).seats.push(seat);
    });

    const rowsArray = Array.from(rowMap.values());
    rowsArray.sort((a, b) => a.row_identifier.localeCompare(b.row_identifier));
    rowsArray.forEach(row => {
      row.seats.sort((a: any, b: any) => parseInt(a.seat_number) - parseInt(b.seat_number));
    });

    return rowsArray;
  }, [seats]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* View Toggle & Status */}
      <div className="flex justify-between items-center flex-wrap px-4">
        <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === '2D' ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            2D Map
          </button>
          <button
            onClick={() => {
              setViewMode('3D');
              if (selectedSeatIds.length > 0) {
                setStoreViewMode('SEAT');
                setViewingSeatId(selectedSeatIds[selectedSeatIds.length - 1]);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === '3D' ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            3D View
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {connStatus === 'CONNECTED' ? (
            <span className="flex items-center gap-1 text-green-500 font-medium">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <WifiOff className="w-3 h-3" /> {connStatus === 'CONNECTING' ? 'Connecting...' : 'Reconnecting...'}
            </span>
          )}
        </div>
      </div>

      {/* Render selected view */}
      {viewMode === '2D' && (
        <TwoDSeatMap 
          rows={rows} 
          selectedSeatIds={selectedSeatIds} 
          onSeatClick={handleSeatClick} 
        />
      )}

      {viewMode === '3D' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="absolute top-4 left-0 w-full px-2 md:px-4 z-50 flex flex-row items-start justify-between pointer-events-none">
            
            {/* Left Nav */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5 items-center bg-black/60 md:bg-white/10 backdrop-blur-md p-1.5 md:p-2 rounded-xl pointer-events-auto">
                <button
                  onClick={() => setViewMode('2D')}
                  className="flex items-center justify-center p-2.5 md:px-4 md:py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                  aria-label="Exit 3D View"
                >
                  <ArrowLeft className="w-5 h-5 md:hidden" />
                  <span className="hidden md:inline text-sm md:text-base">Exit 3D</span>
                </button>

                <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

                <button
                  onClick={() => { setStoreViewMode('TOP_DOWN'); setViewingSeatId(null); }}
                  className={`p-2.5 md:px-4 md:py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${storeViewMode === 'TOP_DOWN' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                  aria-label="Top View"
                >
                  <MapIcon className="w-5 h-5 md:hidden" />
                  <span className="hidden md:inline text-sm md:text-base">Top</span>
                </button>

                <button
                  onClick={() => { setStoreViewMode('SCREEN_VIEW'); setViewingSeatId(null); }}
                  className={`p-2.5 md:px-4 md:py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${storeViewMode === 'SCREEN_VIEW' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                  aria-label="Screen View"
                >
                  <MonitorPlay className="w-5 h-5 md:hidden" />
                  <span className="hidden md:inline text-sm md:text-base">Screen</span>
                </button>

                <button
                  onClick={() => { setStoreViewMode('ORBIT'); setViewingSeatId(null); }}
                  className={`p-2.5 md:px-4 md:py-2 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${storeViewMode === 'ORBIT' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                  aria-label="Free Cam"
                >
                  <Video className="w-5 h-5 md:hidden" />
                  <span className="hidden md:inline text-sm md:text-base">Free</span>
                </button>
              </div>

              {storeViewMode === 'SEAT' && (
                <div className="pointer-events-auto self-start mt-2">
                  <button
                    onClick={() => { setStoreViewMode('TOP_DOWN'); setViewingSeatId(null); }}
                    className="p-3 md:px-4 md:py-2 bg-red-600/90 backdrop-blur-md text-white shadow-lg border border-red-500/50 font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-sm">Exit Seat View</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Toggles */}
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-1.5 items-center bg-black/60 md:bg-white/10 backdrop-blur-md p-1.5 md:p-2 rounded-xl pointer-events-auto">
                <button
                  onClick={() => useBookingStore.getState().setShowAvatars(!showAvatars)}
                  className={`p-2.5 md:px-4 md:py-2 font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 ${showAvatars ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'}`}
                  aria-label="Toggle People"
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">People</span>
                </button>

                <button
                  onClick={() => useBookingStore.getState().setLightMode(!lightMode)}
                  className={`p-2.5 md:px-4 md:py-2 font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 ${lightMode ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-white/10'}`}
                  aria-label="Toggle Light Mode"
                >
                  {lightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="hidden md:inline text-sm">Light</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <TheatreScene liveSeats={seats} onSeatClick={handleSeatClick} />
          </div>
        </div>
      )}
    </div>
  );
}
