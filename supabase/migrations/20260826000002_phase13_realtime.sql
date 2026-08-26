-- Add held_by to show_seats to track who is holding a seat before checkout
ALTER TABLE show_seats
ADD COLUMN held_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Index for fast lookup of a user's held seats
CREATE INDEX idx_show_seats_held_by ON show_seats(held_by) WHERE status = 'HELD';

-- toggle_seat_hold
-- Used when a user clicks a seat in the UI to lock it for themselves
CREATE OR REPLACE FUNCTION toggle_seat_hold(p_show_id UUID, p_seat_id BIGINT, p_user_id UUID, p_hold BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    IF p_hold THEN
        -- Try to hold the seat if it's available (or hold has expired)
        UPDATE show_seats
        SET status = 'HELD',
            held_by = p_user_id,
            hold_expires_at = now() + interval '10 minutes'
        WHERE show_id = p_show_id
          AND seat_id = p_seat_id
          AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));
          
        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        
        IF v_updated_count = 0 THEN
            RAISE EXCEPTION 'Seat is not available';
        END IF;
    ELSE
        -- Try to release the seat, but ONLY if held by the requesting user
        UPDATE show_seats
        SET status = 'AVAILABLE',
            held_by = NULL,
            hold_expires_at = NULL
        WHERE show_id = p_show_id
          AND seat_id = p_seat_id
          AND status = 'HELD'
          AND held_by = p_user_id;
          
        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        
        -- If it wasn't updated, either they didn't hold it, or it was already booked/available. 
        -- We don't raise an exception here to allow graceful UI syncing.
    END IF;

    RETURN TRUE;
END;
$$;

-- checkout_held_seats
-- Used during checkout to assign the booking_id to all seats the user is currently holding
CREATE OR REPLACE FUNCTION checkout_held_seats(p_show_id UUID, p_user_id UUID, p_booking_id UUID, p_seat_ids INT[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE show_seats
    SET booking_id = p_booking_id
    WHERE show_id = p_show_id
      AND status = 'HELD'
      AND held_by = p_user_id
      AND seat_id = ANY(p_seat_ids::BIGINT[])
      AND hold_expires_at > now();
      
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN v_updated_count;
END;
$$;
