import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateStreak } from '@/lib/utils/streak';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ message: 'Missing Event ID' }, { status: 400 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Check timing window in Asia/Kolkata (10:15 AM to 2:00 PM IST)
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = istDate.getHours();
    const minute = istDate.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const isWithinWindow = totalMinutes >= 615 && totalMinutes < 840;

    if (!isWithinWindow) {
      return NextResponse.json({ 
        message: 'Attendance can only be marked between 10:15 AM and 2:00 PM IST.' 
      }, { status: 403 });
    }

    // Check if today is a module day for this event
    const { data: todayModule } = await supabase
      .from('days')
      .select('id, date, week:weeks!inner(event_id)')
      .eq('date', todayStr)
      .eq('week.event_id', eventId)
      .maybeSingle();

    const isTodayModuleDay = !!todayModule;

    if (!isTodayModuleDay) {
      return NextResponse.json({
        message: 'Attendance can only be marked on active module days.'
      }, { status: 403 });
    }

    // Check if already marked today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .eq('date', todayStr)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 409 });
    }

    // Insert attendance
    const { error: insertError } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        event_id: eventId,
        date: todayStr,
      });

    if (insertError) throw insertError;

    // Update streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date')
      .eq('id', user.id)
      .single();

    if (profile) {
      const { newStreak, newLongest } = calculateStreak(
        profile.current_streak,
        profile.longest_streak,
        profile.last_active_date
      );

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

