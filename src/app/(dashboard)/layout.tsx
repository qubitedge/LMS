import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/get-profile';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import SupportButton from '@/components/support-button';
import ReviewStatusPopup from '@/components/projects/review-status-popup';
import CapstonePopup from '@/components/capstone/capstone-popup';
import DeveloperCredit from '@/components/layout/developer-credit';

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

  const profile = await getProfile(user.id);

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    redirect('/login?error=account_disabled');
  }

  const [{ count: completedDays }, { data: setting }, { data: approvedProjects }, { data: capstoneSelection }] = await Promise.all([
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'projects_unlocked')
      .maybeSingle(),
    supabase
      .from('project_submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .limit(1),
    supabase
      .from('capstone_selections')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
  ]);

  const isEligibleForCapstone = approvedProjects && approvedProjects.length > 0;
  const hasSubmittedCapstone = !!capstoneSelection;
  const showCapstonePopup = false; // Capstone voting time is over

  const projectsUnlocked = setting?.value === true;

  return (
    <div className="flex h-[100dvh] overflow-hidden w-full relative">
      {/* Sidebar - Desktop & Bottom Nav - Mobile */}
      <Sidebar user={profile} completedDays={completedDays || 0} projectsUnlocked={projectsUnlocked} />

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

      {/* Review Status Popup */}
      <ReviewStatusPopup />

      {/* Capstone Selection Popup */}
      {showCapstonePopup && <CapstonePopup />}

      {/* Developer Credit */}
      <DeveloperCredit />
    </div>
  );
}
