'use client';

import { useState } from 'react';
import { promoteToAdmin } from './actions';
import { useRouter } from 'next/navigation';

export function PromoteButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePromote = async () => {
    setLoading(true);
    try {
      await promoteToAdmin();
      router.refresh();
    } catch (err) {
      alert("Failed to promote: " + err);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePromote}
      disabled={loading}
      className="bg-red-650 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-950/20"
    >
      {loading ? "Promoting..." : "Promote Me to Admin"}
    </button>
  );
}
