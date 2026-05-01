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

async function updateUsers() {
  console.log('🔄 Starting email updates...');
  
  for (const item of mapping) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ email: item.email })
      .eq('full_name', item.name)
      .select();

    if (error) {
      console.error(`❌ Error updating ${item.name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${item.name} -> ${item.email}`);
    } else {
      console.warn(`⚠️ User not found: ${item.name}`);
    }
  }
  
  console.log('✨ Updates completed!');
}

updateUsers();
