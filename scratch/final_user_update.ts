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
  { oldName: 'Silass', newName: 'S O', newEmail: 'O@gmail.com' },
  { oldName: 'Guntuku Abhishek Sai', newName: 'Guntuku Abhishek Sai', newEmail: 'scs634959@gmail.com' },
  { oldName: 'Konada Rashmitha', newName: 'KONADA RASHMITHA', newEmail: 'k.rashmitha2023@gmail.com' },
  { oldName: 'Kambhampati Sruthi', newName: 'Kambhampati Sruthi', newEmail: 'kambhampatisruthi@gmail.com' },
  { oldName: 'Pandi Prabhavathi', newName: 'PANDI PRABHAVATHI', newEmail: 'pandiprabhavathi67@gmail.com' },
  { oldName: 'Manepalli Poornima Sri Sarvani', newName: 'Manepalli Poornima Sri Sarvani', newEmail: 'poornimasarvani@gmail.com' },
  { oldName: 'Nuthi Venkata Sai Sindhura', newName: 'NUTHI VENKATA SAI SINDHURA', newEmail: 'saisindhura111@gmail.com' },
  { oldName: 'Vishwaksena', newName: 'Vishwaksena', newEmail: 'vishwaksena024@gmail.com' },
  { oldName: 'Monica Kolli', newName: 'MONICA KOLLI', newEmail: 'monicaah.0692@gmail.com' },
  { oldName: 'Dasari Aishwarya', newName: 'Dasari.Aishwarya', newEmail: 'civil85599@gmail.com' },
  { oldName: 'Dr Balla Satyanarayana', newName: 'Dr BALLA SATYANARAYANA', newEmail: 'snballa1670@gmail.com' },
  { oldName: 'Dr Karimizetty Sujatha', newName: 'Dr. Karimisetty Sujatha', newEmail: 'sujathakota29@gmail.com' },
  { oldName: 'Chikkala S K V R Naidu', newName: 'Chikkala S K V R Naidu', newEmail: 'naidu.skvr@gmail.com' },
  { oldName: 'Tatapudi Madhu Sarvani', newName: 'Tatapudi Madhu Sarvani', newEmail: 'madhusarvani626@gmail.com' },
  { oldName: 'Kundum Pravallika', newName: 'Kundum Pravallika', newEmail: 'pravallikakundum18@gmail.com' },
  { oldName: 'Mankala Likhith Kumar', newName: 'Mankala Likhith Kumar', newEmail: 'lik@gmail.com' } // Reverting previous change
];

async function finalUpdate() {
  console.log('🚀 Starting final user data sync...');
  
  for (const item of mapping) {
    // 1. Find user by old name to get ID
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', item.oldName)
      .single();

    if (fetchError || !profileData) {
      console.warn(`⚠️ Could not find profile for: ${item.oldName}`);
      continue;
    }

    const userId = profileData.id;

    // 2. Update Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { email: item.newEmail, email_confirm: true }
    );

    if (authError) {
      console.error(`❌ Auth error for ${item.newName}:`, authError.message);
    } else {
      // 3. Update Profile (Name and Email)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: item.newName, email: item.newEmail })
        .eq('id', userId);

      if (profileError) {
        console.error(`❌ Profile error for ${item.newName}:`, profileError.message);
      } else {
        console.log(`✅ Fully updated: ${item.newName} (${item.newEmail})`);
      }
    }
  }
  
  console.log('✨ All users updated successfully!');
}

finalUpdate();
