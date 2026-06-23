import { createClient } from '@/lib/supabase/server';
import { getDayStatus } from '@/lib/utils/dayLock';
import { WeekWithDays, DayWithStatus } from '@/types';
import CurriculumGrid from '@/components/progress/curriculum-grid';
import capstoneTeams from '@/lib/capstone-teams.json';
import InternshipFeedbackModal from '@/components/progress/internship-feedback-modal';

export const revalidate = 60;

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's scores, profile, events, settings, and enrollments in parallel
  const [scoresResult, profileResult, eventsResult, settingResult, enrollmentsResult] = await Promise.all([
    supabase
      .from('scores')
      .select('quiz_id, score')
      .eq('user_id', user.id),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('events')
      .select('*, weeks(*, days(*, quizzes(id, max_score)))')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'unlocked_days')
      .maybeSingle(),
    supabase
      .from('user_enrollments')
      .select('event_id')
      .eq('user_id', user.id)
  ]);

  const scores = scoresResult.data;
  const profile = profileResult.data;
  const eventsData = eventsResult.data;
  const setting = settingResult.data;
  const enrollments = enrollmentsResult.data;

  const scoresMap = new Map((scores || []).map(s => [s.quiz_id, s.score]));
  const isAdmin = profile?.role === 'admin';

  const unlockedDays = setting?.value || [];
  const enrolledEventIds = (enrollments || []).map(e => e.event_id);

  const capstoneUser = capstoneTeams.find(t => t.email === user.email);
  const isCapstoneSelected = !!capstoneUser;

  // Filter out invisible weeks and specific workshops for interns
  const events = (eventsData || [])
    .filter(event => {
      if (isAdmin) return true;
      // Interns should ONLY see their enrolled programs in their learning path
      return enrolledEventIds.includes(event.id);
    })

    .map(event => ({
    ...event,
    weeks: (event.weeks as any[] || [])
      .filter(week => week.is_visible)
      .sort((a: any, b: any) => a.week_number - b.week_number)
      .flatMap((week: any) => {
        const isCapstoneWeek = week.title.toLowerCase().includes('capstone');
        const showRevision = isCapstoneWeek && !isCapstoneSelected && !isAdmin;

        const mapWeek = (isRev: boolean, idSuffix: string = '') => {
          let mappedTitle = week.title;
          let mappedDomain = week.domain;

          if (isRev) {
            mappedTitle = 'Revision & Recording Sessions';
            mappedDomain = 'Revision';
          }

          return {
            ...week,
            id: week.id + idSuffix,
            title: mappedTitle,
            domain: mappedDomain,
            days: (week.days || []).sort((a: any, b: any) => a.day_number - b.day_number).map((day: any, idx: number): DayWithStatus => {
              const quizId = day.quizzes?.[0]?.id;
              const hasAttempted = !!(quizId && scoresMap.has(quizId));
              const score = quizId ? scoresMap.get(quizId) : undefined;
              
              const checkId = isRev ? `${day.id}-revision` : day.id;
              const isUnlocked = unlockedDays.includes(checkId);
              let status = (isAdmin || isUnlocked) ? getDayStatus(day.date, hasAttempted) : 'locked';
              if (status === 'locked' && (isAdmin || isUnlocked)) {
                status = 'active';
              }

              let tutor_name = day.tutor_name;
              let topic = day.topic;
              let sub_topics = day.sub_topics;

              if (isCapstoneWeek && !isRev) {
                const mentorName = capstoneUser?.mentorName;
                const teamName = (capstoneUser as any)?.teamName;
                tutor_name = teamName && mentorName ? `${teamName} - Mentor: ${mentorName}` : (mentorName || tutor_name);
              } else if (isRev) {
                const revisionNames = [
                  'Week-1 Revision',
                  'Week-2',
                  'Week-3',
                  'Week-4',
                  'Week-5'
                ];
                topic = revisionNames[idx] || `Week-${idx + 1} Revision`;
                sub_topics = null;
                tutor_name = 'Qubitedge Team';
              }

              return {
                ...day,
                tutor_name,
                status,
                score,
                topic,
                sub_topics,
                quiz: day.quizzes?.[0] ? { ...day.quizzes[0] } : null,
                isRevisionDay: isRev,
              };
            })
          };
        };

        if (isAdmin && isCapstoneWeek) {
          return [mapWeek(false), mapWeek(true, '-revision')];
        }

        return [mapWeek(showRevision)];
      })
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
      <InternshipFeedbackModal shouldShow={!isCapstoneSelected && !isAdmin} />
    </div>
  );
}
