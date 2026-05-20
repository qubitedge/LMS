import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import SupportButton from '@/components/support-button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    redirect('/login?error=account_disabled');
  }

  const { count: completedDays } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="flex h-[100dvh] overflow-hidden w-full relative">
      {/* Sidebar - Desktop & Bottom Nav - Mobile */}
      <Sidebar user={profile} completedDays={completedDays || 0} />

      {/* Topbar - Mobile only */}
      <Topbar user={profile} />

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden md:pl-80 pt-[60px] md:pt-0 pb-[80px] md:pb-0">
        <div className="w-full p-4 md:p-10 min-h-full">
          {children}
        </div>
      </main>

      {/* Floating Support Button */}
      <SupportButton userName={profile?.full_name} />
    </div>
  );
}
