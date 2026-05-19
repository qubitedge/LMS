import { createClient } from '@/lib/supabase/server';
import AdminDashboardContent from '@/components/admin/admin-dashboard-content';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Basic stats
  const [
    { count: usersCount },
    { count: submissionsCount },
    { count: pendingCount },
    { data: settings }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'intern').eq('is_active', true),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('site_settings').select('*'),
  ]);

  const showPreviousWorks = settings?.find(s => s.key === 'show_previous_works')?.value || true;

  return (
    <AdminDashboardContent 
      usersCount={usersCount || 0}
      submissionsCount={submissionsCount || 0}
      pendingCount={pendingCount || 0}
      showPreviousWorks={showPreviousWorks}
    />
  );
}
