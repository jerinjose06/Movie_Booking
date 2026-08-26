'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function loginAsGuest() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@moviebooking.local`;
    const password = `guest_${Date.now()}`;

    // Create auto-confirmed user bypassing email verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      return { error: error?.message || 'Failed to create guest user' };
    }

    // Create profile
    await supabaseAdmin.from('profiles').insert([
      { id: data.user.id, full_name: 'Guest User', role: 'customer' }
    ]);

    // Sign in using normal client to set cookies
    const supabase = await createServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { error: signInError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
