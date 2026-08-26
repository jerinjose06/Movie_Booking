'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { loginAsGuest } from './actions';

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  
  useEffect(() => {
    let isMounted = true;
    
    async function doGuestLogin() {
      const res = await loginAsGuest();
      if (!isMounted) return;
      
      if (res.error) {
        setError(res.error);
      } else {
        router.push(next);
        router.refresh();
      }
    }
    
    doGuestLogin();
    
    return () => {
      isMounted = false;
    };
  }, [next, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-xl font-bold text-gray-900">Setting up your session...</h1>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
