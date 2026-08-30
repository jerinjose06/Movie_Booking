import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ScreenConfigForm } from './ScreenConfigForm';

export default async function AuditoriumDetailsPage({ params }: { params: Promise<{ auditoriumId: string }> }) {
  const { auditoriumId } = await params;
  const supabase = await createClient();
  
  // Get screen details
  const { data: auditorium } = await supabase
    .from('auditoriums')
    .select('*, theatre:theatres(*)')
    .eq('id', auditoriumId)
    .single();

  if (!auditorium) {
    notFound();
  }

  // Get total rows and seats count to display current stats
  const { data: rows } = await supabase
    .from('seat_rows')
    .select('id, seats(id, pos_x)')
    .eq('auditorium_id', auditoriumId);

  const totalRows = rows?.length || 0;
  const totalSeats = rows?.reduce((acc, row) => acc + (row.seats?.length || 0), 0) || 0;

  // Deduce columns per section from first populated row
  let deducedColumns: number[] = [4, 10, 4]; // default fallback
  let deducedSections = 3;

  if (rows && rows.length > 0) {
    const sampleRow = rows.find(r => r.seats && r.seats.length > 0);
    if (sampleRow && sampleRow.seats) {
      const sortedSeats = [...sampleRow.seats].sort((a: any, b: any) => a.pos_x - b.pos_x);
      
      let currentSectionCount = 0;
      const cols: number[] = [];
      
      for (let i = 0; i < sortedSeats.length; i++) {
        currentSectionCount++;
        if (i < sortedSeats.length - 1) {
          const gap = sortedSeats[i+1].pos_x - sortedSeats[i].pos_x;
          if (gap > 1.5) { // Aisle gap
            cols.push(currentSectionCount);
            currentSectionCount = 0;
          }
        } else {
          cols.push(currentSectionCount);
        }
      }
      if (cols.length > 0) {
        deducedColumns = cols;
        deducedSections = cols.length;
      }
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href={`/admin/theatres/${auditorium.theatre_id}`} className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Theatre
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Configure {auditorium.name}</h1>
        <p className="text-gray-400">Theatre: {auditorium.theatre?.name}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>Current Rows: {totalRows}</span>
          <span>•</span>
          <span>Current Seats: {totalSeats}</span>
        </div>
      </div>

      <ScreenConfigForm 
        auditoriumId={auditoriumId} 
        currentName={auditorium.name} 
        currentRows={totalRows}
        currentSections={deducedSections}
        currentColumnsStr={deducedColumns.join(', ')}
      />
    </div>
  );
}
