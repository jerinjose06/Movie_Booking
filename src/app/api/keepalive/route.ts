import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Revalidate 0 ensures this isn't statically cached
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // We use the service role key to ensure the query works regardless of RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Perform a lightweight query to wake up / keep the DB alive
    const { data, error } = await supabase.from('theatres').select('id').limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      status: 'awake', 
      message: 'Supabase database pinged successfully', 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error('Keepalive error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message }, 
      { status: 500 }
    );
  }
}
