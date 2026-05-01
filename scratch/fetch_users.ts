import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUsers() {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('email, full_name', { count: 'exact' });

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Total Users: ${count}`);
  console.log('User List:');
  data?.forEach((user, index) => {
    console.log(`${index + 1}. ${user.full_name || 'N/A'} (${user.email})`);
  });
}

getUsers();
