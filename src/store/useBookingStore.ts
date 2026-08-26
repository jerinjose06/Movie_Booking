import { create } from 'zustand';

interface BookingState {
  selectedSeatIds: number[];
  holdExpiresAt: Date | null;
  viewMode: 'TOP_DOWN' | 'SCREEN_VIEW' | 'ORBIT' | 'SEAT';
  viewingSeatId: number | null;
  compareSeatIds: number[];
  isComparing: boolean;
  showAvatars: boolean;
  lightMode: boolean;
  
  // Actions
  toggleSeatSelection: (seatId: number, forceRemove?: boolean) => void;
  setViewMode: (mode: 'TOP_DOWN' | 'SCREEN_VIEW' | 'ORBIT' | 'SEAT') => void;
  setViewingSeatId: (seatId: number | null) => void;
  addCompareSeat: (seatId: number) => void;
  removeCompareSeat: (seatId: number) => void;
  clearCompare: () => void;
  setShowAvatars: (show: boolean) => void;
  setLightMode: (light: boolean) => void;
  clearSelection: () => void;
  startTimer: () => void;
  clearTimer: () => void;
}

const MAX_SEATS = 8;
const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedSeatIds: [],
  isHolding: false,
  error: null,
  holdExpiresAt: null,
  
  viewMode: 'TOP_DOWN',
  viewingSeatId: null,
  compareSeatIds: [],
  isComparing: false,
  showAvatars: true,
  lightMode: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setViewingSeatId: (seatId) => set({ viewingSeatId: seatId }),
  
  addCompareSeat: (seatId) => {
    const current = get().compareSeatIds;
    if (current.includes(seatId)) return;
    if (current.length >= 3) {
      alert("You can only compare up to 3 seats at a time.");
      return;
    }
    set({ compareSeatIds: [...current, seatId], isComparing: true });
  },
  
  removeCompareSeat: (seatId) => {
    const updated = get().compareSeatIds.filter(id => id !== seatId);
    set({ compareSeatIds: updated });
    if (updated.length === 0) {
      set({ isComparing: false, viewMode: 'ORBIT' });
    }
  },
  
  clearCompare: () => set({ compareSeatIds: [], isComparing: false, viewMode: 'ORBIT' }),

  setShowAvatars: (show) => set({ showAvatars: show }),
  setLightMode: (light) => set({ lightMode: light }),

  toggleSeatSelection: (seatId: number, forceRemove?: boolean) => {
    const currentSeats = get().selectedSeatIds;
    
    if (currentSeats.includes(seatId)) {
      set({ selectedSeatIds: currentSeats.filter(id => id !== seatId) });
    } else if (!forceRemove) {
      if (currentSeats.length < MAX_SEATS) {
        set({ selectedSeatIds: [...currentSeats, seatId] });
      }
    }
  },
  
  clearSelection: () => {
    set({ selectedSeatIds: [] });
  },
  
  startTimer: () => {
    const expiresAt = new Date(Date.now() + HOLD_DURATION_MS);
    set({ holdExpiresAt: expiresAt });
  },
  
  clearTimer: () => {
    set({ holdExpiresAt: null });
  }
}));
