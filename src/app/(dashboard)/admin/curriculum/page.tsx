import { createClient } from '@/lib/supabase/server';
import EventsManagementClient from '@/components/admin/events-management-client';

export const revalidate = 60;

export default async function AdminCurriculumPage() {
  const supabase = await createClient();

  // Fetch events and settings in parallel
  const [eventsResult, settingResult] = await Promise.all([
    supabase
      .from('events')
      .select('*, weeks(*, days(*))')
      .order('created_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'unlocked_days')
      .maybeSingle()
  ]);

  const events = eventsResult.data;
  const initialUnlockedDays = settingResult.data?.value || [];

  return <EventsManagementClient events={events} initialUnlockedDays={initialUnlockedDays} />;
}
