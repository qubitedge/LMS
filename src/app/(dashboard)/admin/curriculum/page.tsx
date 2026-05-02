import { createClient } from '@/lib/supabase/server';
import EventsManagementClient from '@/components/admin/events-management-client';

export const revalidate = 0;

export default async function AdminCurriculumPage() {
  const supabase = await createClient();

  // Fetch events with nested weeks and days
  const { data: events } = await supabase
    .from('events')
    .select('*, weeks(*, days(*))')
    .order('created_at', { ascending: false });

  return <EventsManagementClient events={events} />;
}
