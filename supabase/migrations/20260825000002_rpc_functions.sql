-- hold_seats
CREATE OR REPLACE FUNCTION hold_seats(p_show_id UUID, p_seat_ids BIGINT[], p_user_id UUID, p_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
    v_requested_count INTEGER;
BEGIN
    v_requested_count := array_length(p_seat_ids, 1);

    -- Try to update all requested seats if they are available or their hold has expired
    UPDATE show_seats
    SET status = 'HELD',
        booking_id = p_booking_id,
        hold_expires_at = now() + interval '10 minutes'
    WHERE show_id = p_show_id
      AND seat_id = ANY(p_seat_ids)
      AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    -- If we didn't update exactly the requested number of seats, someone else got one or more.
    -- Rollback the transaction.
    IF v_updated_count != v_requested_count THEN
        RAISE EXCEPTION 'One or more seats are not available';
    END IF;

    RETURN TRUE;
END;
$$;

-- confirm_booking
CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE bookings SET status = 'CONFIRMED' WHERE id = p_booking_id;
    
    UPDATE show_seats 
    SET status = 'BOOKED',
        hold_expires_at = NULL
    WHERE booking_id = p_booking_id AND status = 'HELD';
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN v_updated_count > 0;
END;
$$;

-- release_expired_holds
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_released_count INTEGER;
BEGIN
    UPDATE show_seats
    SET status = 'AVAILABLE',
        booking_id = NULL,
        hold_expires_at = NULL
    WHERE status = 'HELD' AND hold_expires_at < now();
    
    GET DIAGNOSTICS v_released_count = ROW_COUNT;
    RETURN v_released_count;
END;
$$;
