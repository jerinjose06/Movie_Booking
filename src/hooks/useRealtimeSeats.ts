import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

export function useRealtimeSeats(
  showId: string, 
  onSeatUpdate: (payload: any) => void,
  onReconnect: () => void
) {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`show-${showId}-seats`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'show_seats',
          filter: `show_id=eq.${showId}`
        },
        (payload) => {
          onSeatUpdate(payload.new);
        }
      )
      .subscribe((evt) => {
        if (evt === 'SUBSCRIBED') {
          setStatus('CONNECTED');
          onReconnect(); // Reconcile state just in case we missed events while disconnected
        } else if (evt === 'CHANNEL_ERROR' || evt === 'TIMED_OUT') {
          setStatus('DISCONNECTED');
        } else if (evt === 'CLOSED') {
          setStatus('DISCONNECTED');
        }
      });

    // Supabase JS handles automatic reconnection, but we can monitor connection state
    // We can also poll or set up custom reconnect logic if needed, but 'SUBSCRIBED' 
    // will fire again upon successful auto-reconnect.

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, onSeatUpdate, onReconnect, supabase]);

  return { status };
}
