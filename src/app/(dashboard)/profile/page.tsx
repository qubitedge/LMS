import { createClient } from '@/lib/supabase/server';
import ProfileContent from '@/components/profile/profile-content';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const [
    { count: completedTasksCount },
    { count: attendanceCount }
  ] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  const totalExpectedDays = 30;

  return (
    <ProfileContent 
      initialProfile={profile} 
      stats={{
        quizzesCount: completedTasksCount || 0,
        attendanceCount: attendanceCount || 0,
        totalExpectedDays
      }}
    />
  );
}
