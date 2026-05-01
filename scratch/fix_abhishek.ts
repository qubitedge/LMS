import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function fixAbhishek() {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', 'Guntuku Abhishek Sai')
    .single();

  if (profileData) {
    const userId = profileData.id;
    const newEmail = 'scs634959@gmail.com';

    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { email: newEmail, email_confirm: true }
    );

    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', userId);
      console.log('✅ Updated Guntuku Abhishek Sai -> scs634959@gmail.com');
    }
  }
}

fixAbhishek();
