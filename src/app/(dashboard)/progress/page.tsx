import { createClient } from '@/lib/supabase/server';
import { getDayStatus } from '@/lib/utils/dayLock';
import { WeekWithDays, DayWithStatus } from '@/types';
import CurriculumGrid from '@/components/progress/curriculum-grid';

export const revalidate = 0;

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's scores
  const { data: scores } = await supabase
    .from('scores')
    .select('quiz_id, score')
    .eq('user_id', user.id);

  const scoresMap = new Map((scores || []).map(s => [s.quiz_id, s.score]));

  // Fetch user profile for role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  const isAdmin = profile?.role === 'admin';

  // Fetch events with visible weeks and days
  const { data: eventsData } = await supabase
    .from('events')
    .select('*, weeks(*, days(*, quizzes(id, max_score)))')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  // Filter out invisible weeks and specific workshops for interns
  const events = (eventsData || [])
    .filter(event => {
      if (isAdmin) return true;
      // Interns should ONLY see their enrolled bootcamp in their learning path
      return event.title === 'Applied AI & Data Science Bootcamp';
    })
    .map(event => ({
    ...event,
    weeks: (event.weeks as any[] || [])
      .filter(week => week.is_visible)
      .sort((a: any, b: any) => a.week_number - b.week_number)
      .map((week: any) => ({
        ...week,
        days: (week.days || []).sort((a: any, b: any) => a.day_number - b.day_number).map((day: any): DayWithStatus => {
          const quizId = day.quizzes?.[0]?.id;
          const hasAttempted = !!(quizId && scoresMap.has(quizId));
          const score = quizId ? scoresMap.get(quizId) : undefined;
          const status = getDayStatus(day.date, hasAttempted);

          return {
            ...day,
            status,
            score,
            quiz: day.quizzes?.[0] ? { ...day.quizzes[0] } : null,
          };
        })
      }))
  }));

  return (
    <div className="pb-20 space-y-20">
      {events.map(event => (
        <div key={event.id} className="space-y-10">
          <CurriculumGrid 
            weeks={event.weeks} 
            title={event.title}
            description={event.description || undefined}
            isAdmin={isAdmin} 
          />
        </div>
      ))}
    </div>
  );
}
