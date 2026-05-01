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

const mapping = [
  { name: 'Manepalli Poornima Sri Sarvani', email: 'poornimasarvani@gmail.com' },
  { name: 'Guntuku Abhishek Sai', email: 'samoguri@gmail.com' },
  { name: 'Konada Rashmitha', email: 'k.rashmitha2023@gmail.com' },
  { name: 'Dr Karimizetty Sujatha', email: 'sujathakota29@gmail.com' },
  { name: 'Kambhampati Sruthi', email: 'kambhampatisruthi@gmail.com' },
  { name: 'Nuthi Venkata Sai Sindhura', email: 'saisindhura111@gmail.com' },
  { name: 'Pandi Prabhavathi', email: 'pandiprabhavathi67@gmail.com' },
  { name: 'Monica Kolli', email: 'monicaah.0692@gmail.com' },
  { name: 'Dr Balla Satyanarayana', email: 'snballa1670@gmail.com' },
  { name: 'Vishwaksena', email: 'vishwaksena024@gmail.com' },
  { name: 'Dasari Aishwarya', email: 'civil85599@gmail.com' },
  { name: 'Chikkala S K V R Naidu', email: 'chskvrnaidu@diet.edu.in' },
  { name: 'Tatapudi Madhu Sarvani', email: 'madhusarvani626@gmail.com' },
  { name: 'Kundum Pravallika', email: 'pravallikakundum18@gmail.com' },
  { name: 'Mankala Likhith Kumar', email: 'scs634959@gmail.com' }
];

async function updateAuthUsers() {
  console.log('🔐 Starting auth.users email updates...');
  
  for (const item of mapping) {
    // 1. Get the user ID from profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', item.name)
      .single();

    if (profileError || !profileData) {
      console.error(`❌ Profile not found for ${item.name}`);
      continue;
    }

    const userId = profileData.id;

    // 2. Update auth.users using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        email: item.email,
        email_confirm: true // Confirming the email so they don't have to verify
      }
    );

    if (authError) {
      console.error(`❌ Error updating Auth for ${item.name}:`, authError.message);
    } else {
      console.log(`✅ Updated Auth for ${item.name} -> ${item.email}`);
    }
  }
  
  console.log('✨ Auth updates completed!');
}

updateAuthUsers();
