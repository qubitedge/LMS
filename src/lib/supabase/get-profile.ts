import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, address, is_active, domain')
    .eq('id', userId)
    .single();
    
  return profile;
});
