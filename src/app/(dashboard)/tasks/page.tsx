import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileText, Calendar, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, days(date, week_id, weeks(title, week_number))')
    .order('due_date', { ascending: true });

  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id, status')
    .eq('user_id', user.id);

  const subMap = new Map((submissions || []).map(s => [s.task_id, s.status]));

  return (
    <div className="pb-10">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
          Assignments & Tasks
        </h1>
        <p className="text-lg font-bold text-[#7182C7]">
          Transform theory into practice with hands-on challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(tasks || []).map((task) => {
          const originalStatus = subMap.get(task.id);
          const status = originalStatus ? 'approved' : undefined;
          let badgeClass = 'bg-slate-100 text-[#7182C7] border-slate-200';
          let statusText = 'Pending Submission';

          if (status === 'approved') {
            badgeClass = 'bg-emerald-50 text-[#10B981] border-emerald-200';
            statusText = 'Approved';
          }

          return (
            <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
              <Card className="qe-card h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-white/40 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#E9EEF9] flex items-center justify-center text-[#4A5DB5] shadow-inner">
                        <FileText size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC]">
                        Week {task.days?.weeks?.week_number}
                      </span>
                    </div>
                    <Badge variant="outline" className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest ${badgeClass}`}>
                      {statusText}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black leading-tight text-[#1A1A2E] group-hover:text-[#2238A4] transition-colors">
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium leading-relaxed text-[#7182C7] line-clamp-3 mb-8">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-6 pt-6 border-t border-blue-50">
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4A5DB5]">
                        <Calendar size={16} />
                        Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2238A4]">
                      <Upload size={16} />
                      {task.accepted_formats.join(', ').toUpperCase()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
