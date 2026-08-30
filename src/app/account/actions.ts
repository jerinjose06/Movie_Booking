'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
