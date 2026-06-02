import { createClient } from '@/lib/supabase/server';
import EventsManagementClient from '@/components/admin/events-management-client';

export const revalidate = 60;

export default async function AdminCurriculumPage() {
  const supabase = await createClient();

  // Fetch events with nested weeks and days
  const { data: events } = await supabase
    .from('events')
    .select('*, weeks(*, days(*))')
    .order('created_at', { ascending: false });

  // Fetch the unlocked days site setting
  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'unlocked_days')
    .maybeSingle();

  const initialUnlockedDays = setting?.value || [];

  return <EventsManagementClient events={events} initialUnlockedDays={initialUnlockedDays} />;
}
