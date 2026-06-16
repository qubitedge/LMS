import { createClient } from '@/lib/supabase/server';
import CapstoneSelectionsClient from './CapstoneSelectionsClient';

export const revalidate = 0;

export default async function AdminCapstoneSelectionsPage() {
  const supabase = await createClient();

  // Fetch all capstone selections with user details
  const { data: selections } = await supabase
    .from('capstone_selections')
    .select('id, domain, created_at, profiles(full_name, email, domain, address)')
    .order('created_at', { ascending: false });

  return <CapstoneSelectionsClient selections={selections || []} />;
}
