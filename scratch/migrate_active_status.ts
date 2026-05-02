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

async function migrate() {
  console.log('🚀 Running database migration: adding is_active to profiles...');
  
  // Using RPC if available or just raw SQL via a trick (if any)
  // Since we don't have a direct SQL execution tool, we'll try to use a function if it exists
  // Or we can just try to update a non-existent column to see if it fails, 
  // but better is to inform the user or use a migration script they can run.
  
  // Actually, I'll check if there's a way to run SQL in this project's setup.
  // Many Supabase projects have a 'supabase/migrations' folder.
  
  console.log('Please run the following SQL in your Supabase SQL Editor:');
  console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;');
}

migrate();
