const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMissingVoters() {
  try {
    console.log('Fetching profiles...');
    // Get all interns
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'intern');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    console.log(`Found ${profiles.length} interns.`);

    console.log('Fetching selections...');
    // Get all selections
    const { data: selections, error: selectionError } = await supabase
      .from('capstone_selections')
      .select('user_id');

    if (selectionError) {
      console.error('Error fetching selections:', selectionError);
      return;
    }

    console.log(`Found ${selections.length} selections.`);

    const selectedUserIds = new Set(selections.map((s) => s.user_id));

    const missingVoters = profiles.filter((p) => !selectedUserIds.has(p.id));

    console.log('\n--- Interns who have NOT made a selection yet ---');
    console.log(`Total missing: ${missingVoters.length}`);
    missingVoters.forEach((v) => {
      console.log(`- ${v.full_name} (${v.email})`);
    });
    console.log('-------------------------------------------------');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

findMissingVoters();
