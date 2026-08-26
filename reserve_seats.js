const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // Book some seats
  await supabase.from('show_seats').update({ status: 'BOOKED' }).in('seat_id', [45, 46, 47, 88, 89, 102, 103, 104, 150, 151, 152, 210, 211, 212, 213, 214, 215, 216, 217, 218, 250, 251, 280, 281, 282, 283]);
  // Hold some seats
  await supabase.from('show_seats').update({ status: 'HELD' }).in('seat_id', [20, 21, 140, 141, 190, 191]);
  console.log('Seats reserved!');
}
run();
