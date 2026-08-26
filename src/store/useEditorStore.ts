import { create } from 'zustand';

export interface EditorSeat {
  id: string; // Temporary ID for editor, or real ID from DB
  dbId?: number;
  rowName: string;
  seatNumber: number;
  typeId: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

interface EditorState {
  mode: 'SELECT' | 'MOVE' | 'ROTATE' | 'PREVIEW';
  seats: EditorSeat[];
  selectedSeatIds: string[];
  roomConfig: {
    room_width: number;
    room_depth: number;
    room_height: number;
    screen_width: number;
    screen_height: number;
  };
  
  setMode: (mode: 'SELECT' | 'MOVE' | 'ROTATE' | 'PREVIEW') => void;
  setRoomConfig: (config: Partial<EditorState['roomConfig']>) => void;
  setSeats: (seats: EditorSeat[]) => void;
  addSeat: (seat: EditorSeat) => void;
  updateSeat: (id: string, updates: Partial<EditorSeat>) => void;
  deleteSelected: () => void;
  toggleSelection: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  duplicateSelected: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'SELECT',
  seats: [],
  selectedSeatIds: [],
  roomConfig: {
    room_width: 50,
    room_depth: 60,
    room_height: 20,
    screen_width: 24,
    screen_height: 10
  },

  setMode: (mode) => set({ mode }),
  
  setRoomConfig: (config) => set((state) => ({ 
    roomConfig: { ...state.roomConfig, ...config } 
  })),
  
  setSeats: (seats) => set({ seats }),
  
  addSeat: (seat) => set((state) => ({ 
    seats: [...state.seats, seat] 
  })),
  
  updateSeat: (id, updates) => set((state) => ({
    seats: state.seats.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  
  deleteSelected: () => set((state) => ({
    seats: state.seats.filter(s => !state.selectedSeatIds.includes(s.id)),
    selectedSeatIds: []
  })),
  
  toggleSelection: (id, multi = false) => set((state) => {
    if (!multi) {
      return { selectedSeatIds: [id] };
    }
    if (state.selectedSeatIds.includes(id)) {
      return { selectedSeatIds: state.selectedSeatIds.filter(sId => sId !== id) };
    }
    return { selectedSeatIds: [...state.selectedSeatIds, id] };
  }),
  
  clearSelection: () => set({ selectedSeatIds: [] }),
  
  duplicateSelected: () => set((state) => {
    const newSeats: EditorSeat[] = [];
    const selectedIds: string[] = [];
    
    state.seats.forEach(s => {
      if (state.selectedSeatIds.includes(s.id)) {
        const newId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        newSeats.push({
          ...s,
          id: newId,
          dbId: undefined,
          x: s.x + 1, // offset
          z: s.z + 1
        });
        selectedIds.push(newId);
      }
    });
    
    return {
      seats: [...state.seats, ...newSeats],
      selectedSeatIds: selectedIds
    };
  })
}));
