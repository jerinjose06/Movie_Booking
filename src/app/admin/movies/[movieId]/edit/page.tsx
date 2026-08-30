import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditMovieForm } from './EditMovieForm';

export default async function EditMoviePage({ params }: { params: Promise<{ movieId: string }> }) {
  const { movieId } = await params;
  const supabase = await createClient();

  const { data: movie } = await supabase
    .from('movies')
    .select('*')
    .eq('id', movieId)
    .single();

  if (!movie) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link href="/admin/movies" className="text-red-500 hover:text-red-400 text-sm mb-4 inline-block font-medium">
        &larr; Back to Movies
      </Link>
      <h1 className="text-3xl font-serif font-bold mb-6 text-white">Edit Movie</h1>
      
      <EditMovieForm movie={movie} />
    </div>
  );
}
