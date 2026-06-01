import { createClient } from '@/lib/supabase/server';
import { calculateProgress } from '@/lib/utils/scoring';
import DashboardContent from '@/components/dashboard/dashboard-content';

// In a real app, this would query a complex materialized view or handle aggregation efficiently
export const revalidate = 60;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Optimized fetch using RPC
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase.rpc('get_dashboard_data', {
    p_user_id: user.id,
    p_today: todayDateStr
  });

  if (error) {
    console.error('Dashboard RPC Error:', error);
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-black text-rose-500">Dashboard Failed to Load</h2>
        <p className="text-[#7182C7] font-bold">Please ensure you have executed the RPC SQL function in your Supabase SQL Editor.</p>
        <p className="text-slate-400 text-sm font-mono bg-slate-100 p-4 rounded-xl border border-slate-200">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  // Typecast or alias the returned fields
  const profile = data.profile;
  const announcements = data.announcements || [];
  const attendanceCount = data.attendance_count || 0;
  const quizzesCount = data.quizzes_count || 0;
  const tasksCount = data.tasks_count || 0;
  const todayAttendance = data.today_attendance;
  const todayDay = data.today_day;
  const activities = data.recent_activities || [];
  
  let hasAttemptedTodayQuiz = false;
  if (todayDay?.quizzes?.[0]?.id && data.today_score !== null && data.today_score !== undefined) {
    hasAttemptedTodayQuiz = true;
  }

  // Fetch settings separately since it's global and might be cached natively better by Next.js if isolated, 
  // but for simplicity we fetch it here. (RPC didn't include it because it doesn't depend on user_id)
  const { data: settings } = await supabase.from('site_settings').select('key, value');
  const showPreviousWorks = settings?.find((s: any) => s.key === 'show_previous_works')?.value || false;

  const totalExpectedDays = 30; // From 6 week curriculum
  const progressPercent = calculateProgress(
    attendanceCount,
    quizzesCount,
    tasksCount,
    totalExpectedDays
  );

  return (
    <DashboardContent
      profile={profile}
      announcements={announcements}
      attendanceCount={attendanceCount}
      quizzesCount={quizzesCount}
      tasksCount={tasksCount}
      progressPercent={progressPercent}
      todayAttendance={todayAttendance}
      todayDay={todayDay}
      hasAttemptedTodayQuiz={hasAttemptedTodayQuiz}
      activities={activities.map((a: any) => ({
        id: a.attempted_at,
        type: 'quiz' as const,
        title: `Completed Quiz: ${a.quizzes?.days?.topic || 'Daily Quiz'}`,
        description: `Scored ${a.score} points`,
        date: a.attempted_at,
      }))}
      totalExpectedDays={totalExpectedDays}
      showPreviousWorks={showPreviousWorks}
    />
  );
}
