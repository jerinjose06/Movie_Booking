import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  // Initialize inside handler so env vars are available at runtime, not build time
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const ref = searchParams.get('ref');

    if (!bookingId || !ref) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const eventId = `mock_event_${Date.now()}`;

    // 1. Idempotency Check
    const { data: existingEvent } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (!existingEvent) {
      await supabaseAdmin.from('webhook_events').insert({ event_id: eventId, type: 'mock_success' });

      // 2. Fetch booking
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('total_amount, status')
        .eq('id', bookingId)
        .single();

      if (booking?.status === 'PENDING') {
        // Update Booking
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'CONFIRMED' })
          .eq('id', bookingId);

        // Create Payment Record
        await supabaseAdmin
          .from('payments')
          .insert({
            booking_id: bookingId,
            amount: booking.total_amount,
            status: 'SUCCESS',
            provider_payment_id: `mock_pi_${Date.now()}`,
          });

        // Confirm Seats (Change HELD to BOOKED, clearing hold_expires_at)
        await supabaseAdmin
          .from('show_seats')
          .update({ status: 'BOOKED', hold_expires_at: null })
          .eq('booking_id', bookingId)
          .eq('status', 'HELD');
      }
    }

    // Redirect to the success page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/tickets/${ref}`);
  } catch (error: any) {
    console.error('Mock webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
