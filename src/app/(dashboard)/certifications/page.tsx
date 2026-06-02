import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CertificationsContent from '@/components/certifications/certifications-content';

export const revalidate = 60;

export default async function CertificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/dashboard');
  }

  return (
    <div className="relative min-h-screen pb-20">
      <div className="bg-mesh opacity-20" />
      <div className="relative z-10">
        <CertificationsContent profile={profile} />
      </div>
    </div>
  );
}
