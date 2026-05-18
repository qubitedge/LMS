import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateStreak } from '@/lib/utils/streak';
import { canAttemptQuiz, isWithinQuizWindow } from '@/lib/utils/dayLock';
import { parseISO, isToday } from 'date-fns';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { quizId, score, answers } = await req.json();

    // 1. Fetch Quiz & Day Info
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, day_id, days(date)')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

    // 2. Fetch user profile for role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, current_streak, longest_streak, last_active_date')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // 3. Validate Date Lock (Server-side enforcement)
    const daysData = quiz.days as any;
    const dayDate = Array.isArray(daysData) ? daysData[0]?.date : daysData?.date;

    if (!isAdmin) {
      if (!dayDate || !isToday(parseISO(dayDate))) {
        return NextResponse.json({ message: 'This quiz is not available for attempt today.' }, { status: 403 });
      }
      if (!isWithinQuizWindow()) {
        return NextResponse.json({ message: 'Quiz window is closed. Available between 9:30 AM - 02:00 PM IST.' }, { status: 403 });
      }
    }

    // 3. Check for existing attempt
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'You have already attempted this quiz.' }, { status: 409 });
    }

    // 4. Insert Score
    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        answers,
      });

    if (insertError) throw insertError;

    // 6. Update Streak
    if (profile) {
      const { newStreak, newLongest } = calculateStreak(
        profile.current_streak,
        profile.longest_streak,
        profile.last_active_date
      );

      const todayStr = new Date().toISOString().split('T')[0];

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: todayStr,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
