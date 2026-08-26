import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CheckoutClient } from './CheckoutClient';

export default async function CheckoutPage({ params }: { params: { bookingId: string } }) {
  const supabase = await createClient();
  const { bookingId } = await params;

  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, shows(movies(title))')
    .eq('id', bookingId)
    .eq('profile_id', user.id)
    .single();

  if (!booking) notFound();

  // If already confirmed, redirect to success
  if (booking.status === 'CONFIRMED') {
    redirect(`/account/bookings/${booking.id}?success=true`);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-gray-600">You&apos;re booking tickets for {booking.shows?.movies?.title}</p>
      </div>
      <CheckoutClient booking={booking} />
    </div>
  );
}
