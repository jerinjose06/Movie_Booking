'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Attempt login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If user doesn't exist, try signing up for ease of testing
      if (signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          setError(signUpError.message);
        } else {
          // Insert profile for new user
          if (signUpData?.user) {
            await supabase.from('profiles').insert([
              { id: signUpData.user.id, full_name: email.split('@')[0] }
            ]);
          }
          // Signup successful, redirect
          router.push(next);
          router.refresh();
        }
      } else {
        setError(signInError.message);
      }
    } else {
      // Login successful
      router.push(next);
      router.refresh();
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Sign In to Continue</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter an email and password. If the account doesn't exist, we'll create it for you to easily test the app.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium mt-6 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign In / Sign Up'}
          </button>
          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account? Sign up
          </div>
        </form>
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
