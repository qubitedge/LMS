import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { QUIZ_QUESTIONS } from '../src/lib/seed-data';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🚀 Starting LMS updates...');

  try {
    // 1. Update all pending submissions to approved
    console.log('📝 Updating pending submissions to approved...');
    const { data: updatedSubmissions, error: subError } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('status', 'pending')
      .select('id, user_id');

    if (subError) throw subError;
    console.log(`✅ Successfully updated ${updatedSubmissions?.length || 0} pending submissions to 'approved'.`);

    // 2. Locate the Day IDs for the learning path
    console.log('📅 Locating day records for days 4 to 10...');
    
    const { data: days, error: daysError } = await supabase
      .from('days')
      .select('id, topic, day_number')
      .gte('day_number', 4)
      .lte('day_number', 10);

    if (daysError) throw daysError;

    const dayMap = new Map<number, string>();
    for (const d of days || []) {
      dayMap.set(d.day_number, d.id);
    }

    // 3. Clear out existing attempts (scores) for Day 4 and Day 5 quizzes since questions changed
    const day4Id = dayMap.get(4);
    const day5Id = dayMap.get(5);

    if (day4Id) {
      const { data: q4 } = await supabase.from('quizzes').select('id').eq('day_id', day4Id).maybeSingle();
      if (q4) {
        console.log(`🧹 Deleting scores for Day 4 quiz (Quiz ID: ${q4.id})...`);
        const { error: err } = await supabase.from('scores').delete().eq('quiz_id', q4.id);
        if (err) throw err;
      }
    }

    if (day5Id) {
      const { data: q5 } = await supabase.from('quizzes').select('id').eq('day_id', day5Id).maybeSingle();
      if (q5) {
        console.log(`🧹 Deleting scores for Day 5 quiz (Quiz ID: ${q5.id})...`);
        const { error: err } = await supabase.from('scores').delete().eq('quiz_id', q5.id);
        if (err) throw err;
      }
    }

    // 4. Update the quizzes table with exactly 5 questions per day
    console.log('✍️ Updating quizzes with new 5-question structures for days 4 to 8...');

    const quizUpdates = [
      { dayNum: 4, label: 'SQL Basics' },
      { dayNum: 5, label: 'String Functions' },
      { dayNum: 6, label: 'Aggregation' },
      { dayNum: 7, label: 'Joins' },
      { dayNum: 8, label: 'Advanced SQL' }
    ];

    for (const update of quizUpdates) {
      const dayId = dayMap.get(update.dayNum);
      if (!dayId) {
        console.warn(`⚠️ Warning: Day ID for Day ${update.dayNum} not found. Skipping.`);
        continue;
      }

      const questions = QUIZ_QUESTIONS[update.dayNum];
      if (!questions || questions.length !== 5) {
        throw new Error(`Expected exactly 5 questions for Day ${update.dayNum}, found: ${questions?.length}`);
      }

      console.log(`   Updating Quiz for Day ${update.dayNum} (${update.label})...`);

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          day_id: dayId,
          questions: questions,
          max_score: 5
        }, { onConflict: 'day_id' })
        .select();

      if (quizError) throw quizError;
      console.log(`   ✅ Quiz updated successfully. ID: ${quiz?.[0]?.id}`);
    }

    // 5. Delete quizzes for Day 9 and Day 10
    const deleteDays = [9, 10];
    for (const dayNum of deleteDays) {
      const dayId = dayMap.get(dayNum);
      if (dayId) {
        console.log(`❌ Deleting Quiz for Day ${dayNum}...`);
        const { error: deleteError } = await supabase
          .from('quizzes')
          .delete()
          .eq('day_id', dayId);

        if (deleteError) throw deleteError;
        console.log(`   ✅ Deleted Day ${dayNum} quiz.`);
      }
    }

    console.log('✨ LMS Updates Completed Successfully!');
  } catch (error) {
    console.error('❌ Error executing updates:', error);
    process.exit(1);
  }
}

main();
