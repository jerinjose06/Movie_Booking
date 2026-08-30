import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: movies } = await supabase.from('movies').select('*').order('title');
  const { data: theatres } = await supabase.from('theatres').select('*, auditoriums(*)').order('name');
  return NextResponse.json({ movies, theatres });
}
