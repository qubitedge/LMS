'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/utils/streak';
import { revalidatePath } from 'next/cache';

export async function markPastAttendance(dateStr: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check if already marked
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (existing) {
      return { success: false, message: 'Attendance already marked for this date' };
    }

    // Insert attendance
    const { error: insertError } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        date: dateStr,
      });

    if (insertError) {
      console.error('Error inserting attendance:', insertError);
      return { success: false, message: 'Failed to mark attendance' };
    }

    // Update streak - even for past days we can just call calculateStreak for consistency,
    // though realistically past days shouldn't break the streak if they're backfilled,
    // but calculating streak based on 'last_active_date' might be tricky if backfilling.
    // We will just do a simple streak update to keep it consistent.
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

      // Only update last_active_date if this past date is newer than the current one,
      // or just leave last_active_date as is unless it's today. For simplicity, just update streak.
      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
        })
        .eq('id', user.id);
    }

    revalidatePath('/attendance');
    return { success: true };
  } catch (error: any) {
    console.error('Attendance mark error:', error);
    return { success: false, message: error.message || 'Internal Server Error' };
  }
}
