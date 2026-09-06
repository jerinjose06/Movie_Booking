'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

import { cookies } from 'next/headers';

export async function checkAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return { isAuthorized: session?.value === 'true' };
}

export async function adminLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  const adminClient = createAdminClient();
  const { data: creds } = await adminClient
    .from('admin_credentials')
    .select('*')
    .eq('username', username)
    .single();
    
  if (!creds || creds.password !== password) {
    throw new Error("Invalid username or password");
  }
  
  const cookieStore = await cookies();
  cookieStore.set('admin_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  });
  
  return { success: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  revalidatePath('/admin');
}

export async function changeAdminPassword(formData: FormData) {
  const { isAuthorized } = await checkAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const oldPassword = formData.get('old_password') as string;
  const newPassword = formData.get('new_password') as string;

  const adminClient = createAdminClient();
  const { data: creds } = await adminClient
    .from('admin_credentials')
    .select('*')
    .eq('username', 'jerinjose')
    .single();

  if (!creds || creds.password !== oldPassword) {
    throw new Error("Incorrect old password");
  }

  const { error } = await adminClient
    .from('admin_credentials')
    .update({ password: newPassword })
    .eq('username', 'jerinjose');

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function promoteToAdmin() {
  // Kept for backward compatibility if any client files still import it
  return;
}

export async function createMovie(formData: FormData) {
  const { isAuthorized } = await checkAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const duration_mins = parseInt(formData.get('duration_mins') as string);
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const release_date = formData.get('release_date') as string;
  const posterFile = formData.get('poster') as File;

  const adminClient = createAdminClient();
  let poster_url = null;

  if (posterFile && posterFile.size > 0) {
    const fileExt = posterFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('posters')
      .upload(fileName, posterFile);
      
    if (uploadError) throw new Error("Upload failed: " + uploadError.message);
    
    const { data: { publicUrl } } = adminClient.storage
      .from('posters')
      .getPublicUrl(fileName);
      
    poster_url = publicUrl;
  }

  const { error } = await adminClient.from('movies').insert({
    title,
    duration_mins,
    description,
    release_date,
    poster_url,
    category
  });

  if (error) throw new Error(error.message);

  revalidatePath('/admin/movies');
  return { success: true };
}

export async function createTheatre(formData: FormData) {
  const { isAuthorized } = await checkAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;

  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient.from('theatres').insert({
    name,
    location,
    owner_id: null
  }).select().single();

  if (error) throw new Error(error.message);

  revalidatePath('/admin/theatres');
  return { success: true, theatreId: data.id };
}

export async function createAuditoriumLayout(theatreId: string, name: string, rows: number, columnsPerSection: number[]) {
  const { isAuthorized } = await checkAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const adminClient = createAdminClient();

  const { data: auditorium, error: audError } = await adminClient.from('auditoriums').insert({
    theatre_id: theatreId,
    name
  }).select().single();

  if (audError) throw new Error(audError.message);

  const auditoriumId = auditorium.id;
  const SEAT_TYPE_STANDARD = 1;
  const SEAT_SPACING_X = 1.2;
  const SEAT_SPACING_Z = 1.5;
  const AISLE_WIDTH = 2.0;
  const ROW_ELEVATION = 0.35;

  const totalSeatsInRow = columnsPerSection.reduce((a, b) => a + b, 0);
  const numAisles = columnsPerSection.length - 1;
  const totalWidth = (totalSeatsInRow - 1) * SEAT_SPACING_X + numAisles * AISLE_WIDTH;
  const startX = -totalWidth / 2;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < rows; r++) {
    const rowName = alphabet[r % alphabet.length] + (r >= 26 ? Math.floor(r / 26) : '');
    
    const { data: rowRecord, error: rowError } = await adminClient.from('seat_rows').insert({
      auditorium_id: auditoriumId,
      row_name: rowName
    }).select().single();
    if (rowError) throw new Error(rowError.message);

    let currentX = startX;
    let seatNumber = 1;
    const seatsToInsert = [];

    const zPos = r * SEAT_SPACING_Z;
    const yPos = r * ROW_ELEVATION;

    for (let s = 0; s < columnsPerSection.length; s++) {
      const cols = columnsPerSection[s];
      for (let c = 0; c < cols; c++) {
        seatsToInsert.push({
          row_id: rowRecord.id,
          seat_number: seatNumber,
          seat_type_id: SEAT_TYPE_STANDARD,
          pos_x: currentX,
          pos_y: yPos,
          pos_z: zPos
        });
        currentX += SEAT_SPACING_X;
        seatNumber++;
      }
      if (s < columnsPerSection.length - 1) {
        currentX -= SEAT_SPACING_X;
        currentX += AISLE_WIDTH;
      }
    }

    const { error: seatsError } = await adminClient.from('seats').insert(seatsToInsert);
    if (seatsError) throw new Error(seatsError.message);
  }

  revalidatePath('/admin/theatres/' + theatreId);
  return { success: true, auditoriumId };
}

export async function createShow(formData: FormData) {
  const { isAuthorized } = await checkAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const movie_id = formData.get('movie_id') as string;
  const auditorium_id = formData.get('auditorium_id') as string;
  const dateStr = formData.get('start_date') as string; // from our UI update
  const showTimesStr = formData.get('show_times') as string;

  console.log("createShow called with:", { movie_id, auditorium_id, dateStr, showTimesStr });

  if (!dateStr || !showTimesStr) throw new Error("Missing date or show times");

  const showTimes = showTimesStr.split(',').map(t => t.trim());
  const adminClient = createAdminClient();
  
  // Get all seat rows and seats for the auditorium once
  const { data: seatRows } = await adminClient.from('seat_rows').select('id, seats(id)').eq('auditorium_id', auditorium_id);
  
  const allSeatIds: string[] = [];
  if (seatRows) {
    for (const row of seatRows) {
      for (const seat of row.seats) {
        allSeatIds.push(seat.id);
      }
    }
  }

  // Loop over each time and create a show
  for (const time of showTimes) {
    const start_time = new Date(`${dateStr}T${time}:00`).toISOString();
    
    const { data: show, error } = await adminClient.from('shows').insert({
      movie_id,
      auditorium_id,
      start_time,
      base_price_multiplier: 1.0
    }).select().single();

    if (error) throw new Error(error.message);

    if (allSeatIds.length > 0) {
      const showSeats = allSeatIds.map(seatId => ({
        show_id: show.id,
        seat_id: seatId,
        status: 'AVAILABLE'
      }));
      
      const { error: ssError } = await adminClient.from('show_seats').insert(showSeats);
      if (ssError) console.error("Failed to insert show_seats", ssError);
    }
  }

  revalidatePath('/admin/shows');
  return { success: true };
}


export async function updateScreenConfig(auditoriumId: string, name: string, rows: number, columnsPerSection: number[]) {
  try {
    const { isAuthorized } = await checkAdmin();
    if (!isAuthorized) return { error: "Unauthorized" };

    const adminClient = createAdminClient();

    // 1. Update Auditorium Name
    const { error: audError } = await adminClient
      .from('auditoriums')
      .update({ name })
      .eq('id', auditoriumId);

    if (audError) return { error: audError.message };

    // 1.5. Clear show_seats for all shows in this auditorium (FK constraint before deleting seats)
    const { data: shows } = await adminClient.from('shows').select('id').eq('auditorium_id', auditoriumId);
    if (shows && shows.length > 0) {
      const showIds = shows.map(s => s.id);
      const { error: ssDeleteErr } = await adminClient.from('show_seats').delete().in('show_id', showIds);
      if (ssDeleteErr) return { error: ssDeleteErr.message };
    }

    // 2. Clear existing seats and rows
    // Fetch row IDs first to delete seats (due to foreign key constraint)
    const { data: rowsToDelete } = await adminClient
      .from('seat_rows')
      .select('id')
      .eq('auditorium_id', auditoriumId);

    if (rowsToDelete && rowsToDelete.length > 0) {
      const rowIds = rowsToDelete.map(r => r.id);
      const { error: seatsDeleteErr } = await adminClient
        .from('seats')
        .delete()
        .in('row_id', rowIds);
      if (seatsDeleteErr) return { error: seatsDeleteErr.message };

      const { error: rowsDeleteErr } = await adminClient
        .from('seat_rows')
        .delete()
        .eq('auditorium_id', auditoriumId);
      if (rowsDeleteErr) return { error: rowsDeleteErr.message };
    }

    // 3. Generate New Seating Layout
    const SEAT_TYPE_STANDARD = 1;
    const SEAT_SPACING_X = 1.2;
    const SEAT_SPACING_Z = 1.5;
    const AISLE_WIDTH = 2.0;
    const ROW_ELEVATION = 0.35;

    const totalSeatsInRow = columnsPerSection.reduce((a, b) => a + b, 0);
    const numAisles = columnsPerSection.length - 1;
    const totalWidth = (totalSeatsInRow - 1) * SEAT_SPACING_X + numAisles * AISLE_WIDTH;
    const startX = -totalWidth / 2;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < rows; r++) {
      const rowName = alphabet[r % alphabet.length] + (r >= 26 ? Math.floor(r / 26) : '');
      
      const { data: rowRecord, error: rowError } = await adminClient.from('seat_rows').insert({
        auditorium_id: auditoriumId,
        row_name: rowName
      }).select().single();
      if (rowError) return { error: rowError.message };

      let currentX = startX;
      let seatNumber = 1;
      const seatsToInsert = [];

      const zPos = r * SEAT_SPACING_Z;
      const yPos = r * ROW_ELEVATION;

      for (let s = 0; s < columnsPerSection.length; s++) {
        const cols = columnsPerSection[s];
        for (let c = 0; c < cols; c++) {
          seatsToInsert.push({
            row_id: rowRecord.id,
            seat_number: seatNumber,
            seat_type_id: SEAT_TYPE_STANDARD,
            pos_x: currentX,
            pos_y: yPos,
            pos_z: zPos
          });
          currentX += SEAT_SPACING_X;
          seatNumber++;
        }
        if (s < columnsPerSection.length - 1) {
          currentX -= SEAT_SPACING_X;
          currentX += AISLE_WIDTH;
        }
      }

      const { error: seatsError } = await adminClient.from('seats').insert(seatsToInsert);
      if (seatsError) return { error: seatsError.message };
    }

    // Also update active shows to recreate show_seats if needed
    if (shows && shows.length > 0) {
      const { data: allSeatRows } = await adminClient.from('seat_rows').select('id, seats(id)').eq('auditorium_id', auditoriumId);
      if (allSeatRows) {
        for (const show of shows) {
          // Add new show seats
          const showSeats = [];
          for (const row of allSeatRows) {
            for (const seat of row.seats) {
              showSeats.push({
                show_id: show.id,
                seat_id: seat.id,
                status: 'AVAILABLE'
              });
            }
          }
          if (showSeats.length > 0) {
            await adminClient.from('show_seats').insert(showSeats);
          }
        }
      }
    }

    revalidatePath('/admin/auditoriums/' + auditoriumId);
    return { success: true };
  } catch (err: any) {
    console.error("updateScreenConfig Action Error:", err);
    return { error: err.message || "An unexpected error occurred" };
  }
}
export async function updateMovie(movieId: string, formData: FormData) {
  try {
    const { isAuthorized } = await checkAdmin();
    if (!isAuthorized) return { error: "Unauthorized" };

    const title = formData.get('title') as string;
    const duration_mins = parseInt(formData.get('duration_mins') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const release_date = formData.get('release_date') as string;
    const posterFile = formData.get('poster') as File;

    const adminClient = createAdminClient();
    let poster_url = formData.get('existing_poster_url') as string || null;

    if (posterFile && posterFile.size > 0) {
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('posters')
        .upload(fileName, posterFile);
        
      if (uploadError) return { error: "Upload failed: " + uploadError.message };
      
      const { data: { publicUrl } } = adminClient.storage
        .from('posters')
        .getPublicUrl(fileName);
        
      poster_url = publicUrl;
    }

    const { error } = await adminClient
      .from('movies')
      .update({
        title,
        duration_mins,
        description,
        release_date,
        poster_url,
        category
      })
      .eq('id', movieId);

    if (error) return { error: error.message };

    revalidatePath('/admin/movies');
    return { success: true };
  } catch (err: any) {
    console.error("updateMovie Action Error:", err);
    return { error: err.message || "An unexpected error occurred" };
  }
}


export async function cancelShow(showId: string) { const { isAuthorized } = await checkAdmin(); if (!isAuthorized) throw new Error('Unauthorized'); const adminClient = createAdminClient(); const { data: bookings } = await adminClient.from('bookings').select('id').eq('show_id', showId); const bookingIds = bookings?.map(b => b.id) || []; if (bookingIds.length > 0) { await adminClient.from('tickets').delete().in('booking_id', bookingIds); } await adminClient.from('bookings').delete().eq('show_id', showId); await adminClient.from('show_seats').delete().eq('show_id', showId); const { error } = await adminClient.from('shows').delete().eq('id', showId); if (error) throw new Error(error.message); revalidatePath('/admin/shows'); }
