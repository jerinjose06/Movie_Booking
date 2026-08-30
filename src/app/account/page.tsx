import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AccountSettingsForm } from './AccountSettingsForm';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-screen">
      <h1 className="text-3xl font-serif font-bold mb-8 text-white">My Account</h1>
      <AccountSettingsForm profile={profile} email={user.email || ''} />
    </div>
  );
}
