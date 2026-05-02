import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

test.describe('Database Validation', () => {
  
  test('Supabase connection should be valid', async () => {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    expect(error).toBeNull();
  });

  const tables = ['profiles', 'weeks', 'days', 'quizzes', 'scores', 'attendance', 'tasks', 'submissions', 'announcements'];

  tables.forEach(table => {
    test(`Table "${table}" should exist and be accessible`, async () => {
      const { error } = await supabase.from(table).select('id').limit(1);
      expect(error, `Failed to access table ${table}: ${error?.message}`).toBeNull();
    });
  });

  test('Foreign key consistency: days -> weeks', async () => {
    const { data: days, error: daysError } = await supabase.from('days').select('id, week_id');
    const { data: weeks, error: weeksError } = await supabase.from('weeks').select('id');
    
    expect(daysError).toBeNull();
    expect(weeksError).toBeNull();

    const weekIds = new Set(weeks?.map(w => w.id));
    
    const orphanDays = days?.filter(day => !day.week_id || !weekIds.has(day.week_id));
    
    expect(orphanDays?.length, `Found ${orphanDays?.length} days with missing or invalid week_id: ${JSON.stringify(orphanDays)}`).toBe(0);
  });

  test('Foreign key consistency: quizzes -> days', async () => {
    const { data: quizzes, error: qError } = await supabase.from('quizzes').select('id, day_id');
    const { data: days, error: dError } = await supabase.from('days').select('id');
    
    expect(qError).toBeNull();
    expect(dError).toBeNull();

    const dayIds = new Set(days?.map(d => d.id));
    const orphanQuizzes = quizzes?.filter(q => !q.day_id || !dayIds.has(q.day_id));
    
    expect(orphanQuizzes?.length, `Found ${orphanQuizzes?.length} quizzes with missing or invalid day_id`).toBe(0);
  });

  test('Constraint validation: profiles should have full_name and email', async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    expect(error).toBeNull();
    
    const invalidProfiles = data?.filter(p => !p.full_name || !p.email);
    expect(invalidProfiles?.length, `Found ${invalidProfiles?.length} profiles with missing required fields`).toBe(0);
  });

  test('Check for orphan profiles (missing auth.users)', async () => {
    // This is harder to check without direct access to auth schema via SQL, 
    // but we can assume if we can select them from profiles, they are somewhat linked.
    // However, if we want to be thorough, we'd need to list users from auth.
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id');
    expect(pError).toBeNull();

    const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
    expect(uError).toBeNull();

    const authUserIds = new Set(users.map(u => u.id));
    const orphanProfiles = profiles?.filter(p => !authUserIds.has(p.id));

    expect(orphanProfiles?.length, `Found ${orphanProfiles?.length} profiles that do not have a corresponding auth user`).toBe(0);
  });
});
