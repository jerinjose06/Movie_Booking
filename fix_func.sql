CREATE OR REPLACE FUNCTION checkout_held_seats(p_show_id UUID, p_user_id UUID, p_booking_id UUID, p_seat_ids BIGINT[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE show_seats
    SET booking_id = p_booking_id
    WHERE show_id = p_show_id
      AND status = 'HELD'
      AND held_by = p_user_id
      AND seat_id = ANY(p_seat_ids)
      AND hold_expires_at > now();
      
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN v_updated_count;
END;
$$$;

