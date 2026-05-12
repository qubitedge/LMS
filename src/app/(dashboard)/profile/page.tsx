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

  // Fetch Stats
  const [
    { data: scores },
    { count: completedTasksCount },
    { count: attendanceCount }
  ] = await Promise.all([
    supabase.from('scores').select('score').eq('user_id', user.id),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  const totalQuizScore = (scores || []).reduce((acc, s) => acc + s.score, 0);
  const totalPoints = totalQuizScore + ((attendanceCount || 0) * 5) + ((profile?.current_streak || 0) * 2);
  const totalExpectedDays = 30; // Consistent with dashboard

  return (
    <ProfileContent 
      initialProfile={profile} 
      stats={{
        totalPoints,
        quizzesCount: scores?.length || 0,
        attendanceCount: attendanceCount || 0,
        totalExpectedDays
      }}
    />
  );
}
