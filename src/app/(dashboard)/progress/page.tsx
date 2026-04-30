import { createClient } from '@/lib/supabase/server';
import { getDayStatus } from '@/lib/utils/dayLock';
import { WeekWithDays, DayWithStatus } from '@/types';
import CurriculumGrid from '@/components/progress/curriculum-grid';

export const revalidate = 0;

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch weeks and days
  const { data: weeksData } = await supabase
    .from('weeks')
    .select('*, days(*, quizzes(id, max_score))')
    .order('week_number', { ascending: true })
    .order('day_number', { referencedTable: 'days', ascending: true });

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

  // Process data
  const weeks: WeekWithDays[] = (weeksData || [])
    .filter((week: any) => week.title !== 'Capstone Project')
    .map((week: any) => ({
    ...week,
    days: (week.days || []).map((day: any): DayWithStatus => {
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
  }));

  return (
    <div className="pb-20">
      <CurriculumGrid weeks={weeks} isAdmin={isAdmin} />
    </div>
  );
}
