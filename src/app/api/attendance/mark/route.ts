import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateStreak } from '@/lib/utils/streak';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Check timing window: 10:00 AM to 2:00 PM (14:00)
    // Using local hours for now, but in production this should ideally consider the target timezone
    const hour = now.getHours();
    const isWithinWindow = hour >= 10 && hour < 14;

    if (!isWithinWindow) {
      return NextResponse.json({ 
        message: 'Attendance can only be marked between 10:00 AM and 2:00 PM.' 
      }, { status: 403 });
    }

    // Check if already marked today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
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
