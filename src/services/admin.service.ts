import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54021';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createTheatre(name: string, location: string, ownerId: string): Promise<string> {
  const { data, error } = await supabase.from('theatres').insert({
    name,
    location,
    owner_id: ownerId
  }).select('id').single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function createAuditorium(theatreId: string, name: string): Promise<number> {
  const { data, error } = await supabase.from('auditoriums').insert({
    theatre_id: theatreId,
    name
  }).select('id').single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function createMovie(title: string, durationMins: number, description?: string): Promise<string> {
  const { data, error } = await supabase.from('movies').insert({
    title,
    duration_mins: durationMins,
    description
  }).select('id').single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function createShow(movieId: string, auditoriumId: number, startTime: string, endTime: string, basePriceMultiplier: number = 1.0): Promise<string> {
  const { data, error } = await supabase.from('shows').insert({
    movie_id: movieId,
    auditorium_id: auditoriumId,
    start_time: startTime,
    end_time: endTime,
    base_price_multiplier: basePriceMultiplier
  }).select('id').single();

  if (error) throw new Error(error.message);
  
  // NOTE: In a real system, you would call a Postgres function here to pre-allocate
  // show_seats for the new show, copying all seats from the auditorium into show_seats.
  
  return data.id;
}
