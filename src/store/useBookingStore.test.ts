import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBookingStore } from './useBookingStore';

describe('useBookingStore', () => {
  beforeEach(() => {
    useBookingStore.setState({ selectedSeatIds: [], holdExpiresAt: null });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should toggle a seat selection', () => {
    const store = useBookingStore.getState();
    
    // Add seat
    store.toggleSeatSelection(1);
    expect(useBookingStore.getState().selectedSeatIds).toEqual([1]);
    
    // Add another
    useBookingStore.getState().toggleSeatSelection(2);
    expect(useBookingStore.getState().selectedSeatIds).toEqual([1, 2]);
    
    // Remove first
    useBookingStore.getState().toggleSeatSelection(1);
    expect(useBookingStore.getState().selectedSeatIds).toEqual([2]);
  });

  it('should not allow selecting more than 8 seats', () => {
    const store = useBookingStore.getState();
    
    for (let i = 1; i <= 8; i++) {
      store.toggleSeatSelection(i);
    }
    
    expect(useBookingStore.getState().selectedSeatIds.length).toBe(8);
    
    // Try to add 9th seat
    useBookingStore.getState().toggleSeatSelection(9);
    expect(useBookingStore.getState().selectedSeatIds.length).toBe(8);
    expect(useBookingStore.getState().selectedSeatIds).not.toContain(9);
  });

  it('should clear selection', () => {
    const store = useBookingStore.getState();
    store.toggleSeatSelection(1);
    store.toggleSeatSelection(2);
    
    useBookingStore.getState().clearSelection();
    expect(useBookingStore.getState().selectedSeatIds).toEqual([]);
  });

  it('should start timer and clear it', () => {
    const store = useBookingStore.getState();
    store.startTimer();
    
    const expiresAt = useBookingStore.getState().holdExpiresAt;
    expect(expiresAt).toBeDefined();
    
    // Ensure it's roughly 10 minutes in the future
    const tenMinutes = 10 * 60 * 1000;
    expect(expiresAt!.getTime() - Date.now()).toBeGreaterThanOrEqual(tenMinutes - 1000);
    expect(expiresAt!.getTime() - Date.now()).toBeLessThanOrEqual(tenMinutes + 1000);
    
    useBookingStore.getState().clearTimer();
    expect(useBookingStore.getState().holdExpiresAt).toBeNull();
  });
});
