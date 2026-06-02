import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpCircle, Trash2, Edit3, TrendingUp } from 'lucide-react';
import QuizCreateDialog from '@/components/admin/quiz-create-dialog';
import QuizActions from '@/components/admin/quiz-actions';
import QuizAttemptsDialog from '@/components/admin/quiz-attempts-dialog';

export const revalidate = 60;

export default async function AdminQuizzesPage() {
  const supabase = await createClient();

  // Fetch quizzes with day info
  const { data: quizzesData } = await supabase
    .from('quizzes')
    .select('id, day_id, max_score, questions, days(day_number, topic), scores(count)');

  // Sort quizzes by day_number in JS since ordering by joined table column can cause Supabase errors
  const quizzes = (quizzesData || []).sort((a: any, b: any) => {
    const dayA = Array.isArray(a.days) ? a.days[0]?.day_number : a.days?.day_number || 0;
    const dayB = Array.isArray(b.days) ? b.days[0]?.day_number : b.days?.day_number || 0;
    return dayA - dayB;
  });

  // Fetch days for the creation dialog
  const { data: days } = await supabase
    .from('days')
    .select('id, day_number, topic, week_id')
    .order('day_number', { ascending: true });

  return (
    <div className="relative pb-10">
      <div className="bg-mesh opacity-20" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
              Quiz Architecture
            </h1>
            <p className="text-lg font-bold text-[#7182C7]">
              Craft immersive daily assessments to validate intern progress.
            </p>
          </div>
          <QuizCreateDialog days={days || []} />
        </div>

        <Card className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#E9EEF9]/50">
                  <TableRow className="border-b-blue-100/50">
                    <TableHead className="font-black text-[#1A1A2E] px-8 py-6 w-[150px]">Day</TableHead>
                    <TableHead className="font-black text-[#1A1A2E]">Module Topic</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">Questions</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-center">Attempts</TableHead>
                    <TableHead className="font-black text-[#1A1A2E] text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!quizzes || quizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 text-[#7182C7]">
                          <TrendingUp size={48} className="opacity-20" />
                          <p className="font-bold">No quizzes have been designed yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    quizzes.map((quiz: any) => (
                      <TableRow key={quiz.id} className="hover:bg-blue-50/30 transition-colors border-b-blue-50/50">
                        <TableCell className="px-8 py-6 font-black text-[#4A5DB5]">
                          Day {quiz.days?.day_number}
                        </TableCell>
                        <TableCell className="font-black text-[#1A1A2E]">
                          {quiz.days?.topic}
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#2238A4]">
                          <span className="px-3 py-1 rounded-lg bg-blue-50">
                            {quiz.questions?.length || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <QuizAttemptsDialog quiz={quiz} />
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <QuizActions quiz={quiz} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
