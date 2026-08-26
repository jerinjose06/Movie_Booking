import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // Initialize inside handler so env vars are available at runtime, not build time
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any
  });
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );


  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  // Verify webhook signature (mock skipping if not configured correctly for local dev)
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      if (!sig) throw new Error('Missing stripe-signature header');
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  } else {
    // For local dev without stripe CLI webhook forwarding
    event = JSON.parse(payload);
  }

  try {
    // 1. Idempotency Check
    const { data: existingEvent, error: checkError } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed. Skipping.`);
      return NextResponse.json({ received: true });
    }

    // Insert idempotency record FIRST to prevent race conditions
    // If another request for the same event is processing, it will fail unique constraint on event_id
    const { error: insertError } = await supabaseAdmin
      .from('webhook_events')
      .insert({ event_id: event.id, type: event.type });

    if (insertError) {
      if (insertError.code === '23505') { // unique violation
        console.log(`Event ${event.id} already processing by another worker. Skipping.`);
        return NextResponse.json({ received: true });
      }
      throw insertError;
    }

    // 2. Handle Event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) throw new Error('Missing bookingId in metadata');

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
          amount: (session.amount_total || 0) / 100, // Convert from cents
          status: 'SUCCESS',
          provider_payment_id: session.id,
        });

      // Confirm Seats (Change HELD to BOOKED, clearing hold_expires_at)
      await supabaseAdmin
        .from('show_seats')
        .update({ status: 'BOOKED', hold_expires_at: null })
        .eq('booking_id', bookingId)
        .eq('status', 'HELD');

    } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) throw new Error('Missing bookingId in metadata');

      // Mark Booking Cancelled
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', bookingId);

      // Record Failed Payment
      await supabaseAdmin
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: (session.amount_total || 0) / 100,
          status: 'FAILED',
          provider_payment_id: session.id,
        });

      // Free Seats (Make AVAILABLE, clear booking_id & hold_expires_at)
      await supabaseAdmin
        .from('show_seats')
        .update({ status: 'AVAILABLE', booking_id: null, hold_expires_at: null })
        .eq('booking_id', bookingId)
        .eq('status', 'HELD');
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
