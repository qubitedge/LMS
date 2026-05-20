import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { WEEKS, DAYS_TOPICS, QUIZ_QUESTIONS, INTERNSHIP_START_DATE, TASKS_DATA } from '../src/lib/seed-data';
import { addDays, parseISO, format } from 'date-fns';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🚀 Starting database seeding...');

  try {
    // 1. Seed Weeks
    console.log('📅 Seeding weeks...');
    const startDate = parseISO(INTERNSHIP_START_DATE);
    const weeksToInsert = WEEKS.map(w => ({
      ...w,
      start_date: format(addDays(startDate, (w.week_number - 1) * 7), 'yyyy-MM-dd')
    }));

    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .upsert(weeksToInsert, { onConflict: 'domain,week_number' })
      .select();

    if (weeksError) throw weeksError;
    console.log(`✅ Seeded ${weeks?.length} weeks.`);

    const weekMap = new Map(weeks?.map(w => [w.week_number, w.id]));

    // Helper for Tutor Name based on Date
    const getTutorName = (dateStr: string) => {
      const date = parseISO(dateStr);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      if (formattedDate >= '2026-05-04' && formattedDate <= '2026-05-08') return 'Eugenia';
      if (formattedDate >= '2026-05-11' && formattedDate <= '2026-05-15') return 'Navya';
      if (formattedDate >= '2026-05-18' && formattedDate <= '2026-05-22') return 'Praveen';
      if (formattedDate >= '2026-05-25' && formattedDate <= '2026-05-29') return 'Dr. G. JayaSuma';
      if (formattedDate >= '2026-06-01' && formattedDate <= '2026-06-05') return 'Satish';
      if (formattedDate >= '2026-06-08' && formattedDate <= '2026-06-12') return 'Capstone Team';
      return 'TBA';
    };

    // 2. Seed Days
    console.log('☀️ Seeding days...');
    
    const daysToInsert = DAYS_TOPICS.map(d => {
      const weekNumber = Math.ceil(d.day / 5); 
      const date = format(addDays(startDate, (weekNumber - 1) * 7 + ((d.day - 1) % 5)), 'yyyy-MM-dd');
      
      return {
        week_id: weekMap.get(weekNumber),
        day_number: ((d.day - 1) % 5) + 1, // Fix day_number to be 1-5 per week
        date,
        topic: d.topic,
        description: d.description,
        tutor_name: getTutorName(date),
        resource_link: d.resource_link || null,
        video_url: d.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        task_link: d.task_link || null
      };
    });

    const { data: insertedDays, error: daysError } = await supabase
      .from('days')
      .upsert(daysToInsert, { onConflict: 'week_id,day_number' })
      .select();

    if (daysError) throw daysError;
    console.log(`✅ Seeded ${insertedDays?.length} days.`);

    const dayMap = new Map(insertedDays?.map(d => [d.day_number + (weeks.find(w => w.id === d.week_id)?.week_number - 1) * 5, d.id]));

    // 3. Seed Quizzes
    console.log('📝 Seeding quizzes...');
    const quizzesToInsert = Object.entries(QUIZ_QUESTIONS).map(([dayNum, questions]) => {
      const dayId = dayMap.get(parseInt(dayNum));
      if (!dayId) return null;
      return {
        day_id: dayId,
        questions,
        max_score: questions.length,
      };
    }).filter(Boolean);

    const { error: quizzesError } = await supabase
      .from('quizzes')
      .upsert(quizzesToInsert, { onConflict: 'day_id' });

    if (quizzesError) throw quizzesError;
    console.log(`✅ Seeded ${quizzesToInsert.length} quizzes.`);

    // 4. Seed Tasks
    console.log('🛠️ Seeding tasks...');
    const tasksToInsert = TASKS_DATA.map(t => {
      const dayId = dayMap.get(t.day);
      if (!dayId) return null;
      return {
        day_id: dayId,
        title: t.title,
        description: t.description,
        due_date: format(addDays(startDate, (Math.ceil(t.day / 5) - 1) * 7 + ((t.day - 1) % 5) + 2), 'yyyy-MM-dd'),
        accepted_formats: ['github', 'text', 'pdf'],
      };
    }).filter(Boolean);

    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(tasksToInsert, { onConflict: 'day_id, title' });

    if (tasksError) throw tasksError;
    console.log(`✅ Seeded ${tasksToInsert.length} tasks.`);

    // 5. Seed Admin User
    console.log('👤 Seeding admin user...');
    const adminEmail = 'likhithmanakala@gmail.com';
    const defaultPassword = 'Password@123';

    const getOrCreateUser = async (email: string, password: string, fullName: string, role: 'admin' | 'intern', extraData = {}) => {
      let userId: string | undefined;

      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      } catch (error: any) {
        if (error.message?.includes('already registered') || error.code === 'email_exists') {
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) throw listError;
          const existing = existingUsers.users.find(u => u.email === email);
          if (existing) userId = existing.id;
        } else {
          throw error;
        }
      }

      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fullName,
            email,
            role,
            ...extraData,
          }, { onConflict: 'id' });
        
        if (profileError) throw profileError;
        console.log(`✅ ${role} user seeded: ${email}`);
        return userId;
      }
    };

    await getOrCreateUser(adminEmail, defaultPassword, 'Admin User', 'admin');

    // 6. Seed Intern Users
    console.log('👤 Seeding 3 types of intern users...');
    
    // 1. Standard Intern
    await getOrCreateUser('intern@qubitedge.com', defaultPassword, 'Standard Intern', 'intern', {
      domain: 'Intern',
      current_streak: 5,
      longest_streak: 10,
    });

    // 2. Project Intern
    await getOrCreateUser('project.intern@qubitedge.com', defaultPassword, 'Project Intern', 'intern', {
      domain: 'Project Intern',
      current_streak: 0,
      longest_streak: 0,
    });

    // 3. Paid Intern
    await getOrCreateUser('paid.intern@qubitedge.com', defaultPassword, 'Paid Intern', 'intern', {
      domain: 'Paid Intern',
      current_streak: 3,
      longest_streak: 3,
    });

    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

seed();
