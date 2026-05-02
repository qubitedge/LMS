import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Business Logic Validation', () => {

  test('Leaderboard ranking logic should be consistent', async () => {
    // Fetch top scores and verify they are ordered correctly
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, current_streak')
      .order('current_streak', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    if (data && data.length > 1) {
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].current_streak).toBeGreaterThanOrEqual(data[i+1].current_streak);
      }
    }
  });

  test('Quiz score calculation consistency', async () => {
    // Check if any score exceeds max_score of its quiz
    const { data, error } = await supabase
      .from('scores')
      .select('score, quiz_id, quizzes(max_score)');

    expect(error).toBeNull();
    
    const invalidScores = data?.filter(s => {
      const max = (s.quizzes as any)?.max_score || 10;
      return s.score > max;
    });

    expect(invalidScores?.length, `Found ${invalidScores?.length} scores exceeding max_score`).toBe(0);
  });

  test('Day unlock logic: days should have valid dates', async () => {
    const { data, error } = await supabase.from('days').select('date, day_number');
    expect(error).toBeNull();

    const invalidDates = data?.filter(d => isNaN(Date.parse(d.date)));
    expect(invalidDates?.length, `Found ${invalidDates?.length} days with invalid dates`).toBe(0);
  });
});
