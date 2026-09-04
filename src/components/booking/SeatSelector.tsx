'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TwoDSeatMap } from './TwoDSeatMap';
import { useBookingStore } from '@/store/useBookingStore';
import { useRealtimeSeats } from '@/hooks/useRealtimeSeats';
import { type SeatData } from '@/utils/seatMapping';
import { MonitorPlay, LayoutGrid, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
      setSeats((currentSeats) => {
        // Use getState to avoid adding selectedSeatIds to useCallback dependencies
        const currentSelected = useBookingStore.getState().selectedSeatIds;
        // If someone else took the seat we had selected, deselect it
        if (newSeat.status !== 'AVAILABLE' && newSeat.held_by !== userId && currentSelected.includes(newSeat.seat_id)) {
          useBookingStore.getState().toggleSeatSelection(newSeat.seat_id, true); // true = force remove local selection
        }
        return currentSeats.map((seat) => (seat.show_seat_id === newSeat.id ? { ...seat, status: newSeat.status, held_by: newSeat.held_by } : seat));
      });
    }
  }, [userId]);

  const handleReconnect = useCallback(async () => {
    // We use a fresh client for the REST call inside the hook to avoid recreating the callback
    const localSupabase = createClient();
    // Re-fetch all seats to reconcile state
    const { data } = await localSupabase
      .from('show_seats')
      .select('id, seat_id, status, held_by')
      .eq('show_id', showId);
      
    if (data) {
      setSeats(currentSeats => 
        currentSeats.map(seat => {
          const remote = data.find(r => r.id === seat.show_seat_id);
          if (remote) {
            return { ...seat, status: remote.status, held_by: remote.held_by };
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
      alert("This seat is currently unavailable.");
      return;
    }

    const isCurrentlySelected = selectedSeatIds.includes(seatId);
    const willHold = !isCurrentlySelected;

    if (willHold && selectedSeatIds.length >= 8) {
      alert("You can only select up to 8 seats.");
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
      alert(error.message || "Could not reserve seat.");
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
          <div className="absolute top-4 left-0 w-full px-4 z-50">
            <div className="flex gap-2 items-center bg-white/10 backdrop-blur-md p-2 rounded-xl overflow-x-auto whitespace-nowrap hide-scrollbar">
            <button
              onClick={() => setViewMode('2D')}
              className="px-3 md:px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base shrink-0"
            >
              Exit 3D View
            </button>
            <button
              onClick={() => {
                setStoreViewMode('TOP_DOWN');
                setViewingSeatId(null);
              }}
              className={`px-3 md:px-4 py-2 font-semibold rounded-lg transition-colors text-sm md:text-base shrink-0 ${storeViewMode === 'TOP_DOWN' ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
            >
              Top View
            </button>
            <button
              onClick={() => {
                setStoreViewMode('SCREEN_VIEW');
                setViewingSeatId(null);
              }}
              className={`px-3 md:px-4 py-2 font-semibold rounded-lg transition-colors text-sm md:text-base shrink-0 ${storeViewMode === 'SCREEN_VIEW' ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
            >
              Screen View
            </button>
            <button
              onClick={() => {
                setStoreViewMode('ORBIT');
                setViewingSeatId(null);
              }}
              className={`px-3 md:px-4 py-2 font-semibold rounded-lg transition-colors text-sm md:text-base shrink-0 ${storeViewMode === 'ORBIT' ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
            >
              Free Cam
            </button>
            {storeViewMode === 'SEAT' && (
              <button
                onClick={() => {
                  setStoreViewMode('TOP_DOWN');
                  setViewingSeatId(null);
                }}
                className="px-3 md:px-4 py-2 bg-primary/20 text-primary border border-primary/50 font-semibold rounded-lg hover:bg-primary/40 transition-colors text-sm md:text-base shrink-0"
              >
                Exit Seat
              </button>
            )}
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-black/40 rounded-lg text-white shrink-0">
              <span className="text-sm font-medium">Show People</span>
              <button
                onClick={() => useBookingStore.getState().setShowAvatars(!showAvatars)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  showAvatars ? 'bg-primary' : 'bg-gray-500'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  showAvatars ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-black/40 rounded-lg text-white shrink-0">
              <span className="text-sm font-medium">Light Mode</span>
              <button
                onClick={() => useBookingStore.getState().setLightMode(!lightMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  lightMode ? 'bg-primary' : 'bg-gray-500'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  lightMode ? 'translate-x-5' : 'translate-x-1'
                }`} />
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
