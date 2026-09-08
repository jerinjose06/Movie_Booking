import { createAdminClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { TicketCardClient } from './TicketCardClient';

export default async function TicketPage({
  params,
  searchParams
}: {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ scanned?: string }>;
}) {
  const supabase = createAdminClient();
  const { bookingRef } = await params;
  const { scanned } = await searchParams;

  // Query booking details by unique booking reference
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      shows(
        start_time,
        movies(title, duration_mins),
        auditoriums(
          name,
          theatres(name, location)
        )
      ),
      booking_items(
        price,
        show_seats(
          seats(
            seat_number,
            seat_rows(row_name)
          )
        )
      )
    `)
    .eq('booking_reference', bookingRef)
    .single();

  if (error || !booking) {
    notFound();
  }

  // Also query show_seats directly by booking_id to guarantee all seats are retrieved
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

  // Extract seat labels
  let seatList: string[] = [];

  if (directShowSeats && directShowSeats.length > 0) {
    seatList = directShowSeats.map((s: any) => {
      const seatData = Array.isArray(s.seats) ? s.seats[0] : s.seats;
      const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
      return `${rowData?.row_name || ''}${seatData?.seat_number || ''}`;
    }).filter(Boolean);
  } else if (booking.booking_items && booking.booking_items.length > 0) {
    seatList = booking.booking_items.map((item: any) => {
      const showSeat = Array.isArray(item.show_seats) ? item.show_seats[0] : item.show_seats;
      const seatData = Array.isArray(showSeat?.seats) ? showSeat?.seats[0] : showSeat?.seats;
      const rowData = Array.isArray(seatData?.seat_rows) ? seatData?.seat_rows[0] : seatData?.seat_rows;
      return `${rowData?.row_name || ''}${seatData?.seat_number || ''}`;
    }).filter(Boolean);
  }

  // Generate QR Code data URL with direct verification link and seat numbers
  const headersList = await import('next/headers').then(m => m.headers());
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  const verificationUrl = `${baseUrl}/tickets/${bookingRef}?scanned=true`;
  
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

  const showDate = new Date(booking.shows?.start_time).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const showTime = new Date(booking.shows?.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <TicketCardClient
      booking={booking}
      seatList={seatList}
      qrCodeDataUrl={qrCodeDataUrl}
      showDate={showDate}
      showTime={showTime}
      isScannedDirectly={scanned === 'true'}
    />
  );
}
