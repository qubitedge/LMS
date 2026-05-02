import { createAdminClient } from '../src/lib/supabase/admin';

async function analyze() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('weeks').select('domain');
  if (error) {
    console.error(error);
    return;
  }
  const domains = [...new Set(data.map(w => w.domain))];
  console.log('Existing Domains:', domains);
}

analyze();
