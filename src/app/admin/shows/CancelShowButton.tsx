'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelShow } from '../actions';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function CancelShowButton({ showId }: { showId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this show? This will delete all associated tickets/bookings and cannot be undone.')) return;
    
    setLoading(true);
    try {
      await cancelShow(showId);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Cancel Show"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
