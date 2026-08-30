import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MapPin, Calendar, Armchair, Clock, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';

export default async function BookingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { bookingId } = await params;
  const { success } = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *, 
      shows(
        start_time, 
        movies(title, duration_mins),
        auditoriums(name, theatres(name, location))
      )
    `)
    .eq('id', bookingId)
    .eq('profile_id', user.id)
    .single();

  if (!booking) notFound();

  // Fetch show_seats directly associated with this booking
  const { data: directShowSeats } = await supabase
    .from('show_seats')
    .select(`
      id,
      seats(
        seat_number,
        seat_rows(row_name)
      )
    `)
    .eq('booking_id', booking.id);

  const seatList = directShowSeats?.map((s: any) => {
    const seatData = Array.isArray(s.seats) ? s.seats[0] : s.seats;
    const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
    return `${rowData?.row_name || ''}${seatData?.seat_number || ''}`;
  }).filter(Boolean) || [];

  // Generate real QR code linking to digital ticket
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tickets/${booking.booking_reference}?scanned=true`;
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR generation error:', err);
  }

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 max-w-3xl min-h-screen">
      {success && (
        <div className="bg-green-950/40 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Payment Successful!</p>
            <p className="text-xs text-green-400/80">Your seats are confirmed. Please find your digital ticket below.</p>
          </div>
        </div>
      )}

      <Link href="/account/bookings" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </Link>

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
            <div>
              <p className="text-red-100 text-xs font-semibold uppercase tracking-wider mb-1">Movie Ticket</p>
              <h1 className="text-2xl md:text-3xl font-bold font-serif">{booking.shows?.movies?.title}</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
              booking.status === 'CONFIRMED' ? 'bg-white/20 text-white' : 'bg-yellow-500/80 text-white'
            }`}>
              {booking.status}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-red-100 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-100/70 text-xs">Date & Time</p>
                <p className="font-semibold text-sm md:text-base">{new Date(booking.shows?.start_time).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-red-100 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-100/70 text-xs">Duration</p>
                <p className="font-semibold text-sm md:text-base">{booking.shows?.movies?.duration_mins} mins</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-100 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-100/70 text-xs">Theatre</p>
                <p className="font-semibold text-sm">{booking.shows?.auditoriums?.theatres?.name}</p>
                <p className="text-red-100/60 text-xs">{booking.shows?.auditoriums?.theatres?.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Armchair className="w-4 h-4 text-red-100 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-100/70 text-xs">Screen</p>
                <p className="font-semibold text-sm">{booking.shows?.auditoriums?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seats and QR Code */}
        <div className="p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
          <div className="flex-1 w-full">
            <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-4">
              Your Confirmed Seats ({seatList.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {seatList.map((seat: string, idx: number) => (
                <div key={idx} className="bg-[#121212] p-3 md:p-4 rounded-xl border border-gray-800 text-center">
                  <p className="text-gray-500 text-[10px] uppercase mb-1">Row / Seat</p>
                  <p className="text-xl md:text-2xl font-bold text-red-400 font-mono">{seat}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-8">
            <Link 
              href={`/tickets/${booking.booking_reference}?scanned=true`} 
              className="bg-white p-3 rounded-2xl shadow-lg border border-gray-200 block hover:scale-105 transition-transform"
              title="Click to view digital seat pass"
            >
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-28 h-28 md:w-32 md:h-32 object-contain"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-mono">
                  Loading QR...
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/movies" className="text-red-500 hover:text-red-400 font-medium text-sm transition-colors">
          ← Browse more movies
        </Link>
      </div>
    </div>
  );
}
