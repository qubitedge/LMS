import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SubmissionForm from '@/components/tasks/submission-form';
import DeleteSubmissionButton from '@/components/tasks/delete-submission-button';
import FeedbackDisplay from '@/components/tasks/feedback-display';

export default async function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const resolvedParams = await params;
  const taskId = resolvedParams.taskId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, days(date, weeks(week_number))')
    .eq('id', taskId)
    .single();

  if (error || !task) notFound();

  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Link href="/tasks" className="inline-flex items-center text-sm font-medium hover:underline mb-6" style={{ color: '#7A7268' }}>
        <ArrowLeft size={16} className="mr-1" /> Back to Tasks
      </Link>

      <div className="bg-white rounded-2xl p-6 md:p-8 border mb-8" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md uppercase" style={{ background: '#E8E4DE', color: '#7A7268' }}>
                Week {task.days?.weeks?.week_number}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
              {task.title}
            </h1>
          </div>
          {task.due_date && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-[#FAFAFA] shrink-0" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
              <Calendar size={18} className="text-[#E8A838]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">Due Date</p>
                <p className="text-sm font-semibold" style={{ color: '#2C2C2C' }}>{format(parseISO(task.due_date), 'MMM d, yyyy')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none mb-8 text-[#7A7268]">
          <p>{task.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {submission ? (
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
              <div className="flex items-center justify-between mb-6 pb-6 border-b" style={{ borderColor: 'rgba(201,168,130,0.1)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#2C2C2C' }}>Your Submission</h3>
                  <p className="text-xs" style={{ color: '#7A7268' }}>
                    Submitted on {format(parseISO(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge className={
                  submission.status === 'approved' ? 'badge-approved' : 
                  submission.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                }>
                  {submission.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-[#C9A882]" />
                  <span className="text-sm font-bold" style={{ color: '#2C2C2C' }}>Format: {submission.format.toUpperCase()}</span>
                </div>
                {submission.format === 'github' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <a href={submission.content} target="_blank" rel="noreferrer" className="text-sm text-[#40C4D0] hover:underline break-all">
                      {submission.content}
                    </a>
                    {submission.status !== 'approved' && (
                      <DeleteSubmissionButton submissionId={submission.id} />
                    )}
                  </div>
                ) : submission.format === 'text' ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-[#FAFAFA] border text-sm text-[#2C2C2C] whitespace-pre-wrap" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
                      {submission.content}
                    </div>
                    {submission.status !== 'approved' && (
                      <div className="flex justify-end">
                        <DeleteSubmissionButton submissionId={submission.id} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <a href={submission.file_path || '#'} target="_blank" rel="noreferrer" className="text-sm text-[#40C4D0] hover:underline break-all">
                      Download attachment
                    </a>
                    {submission.status !== 'approved' && (
                      <DeleteSubmissionButton submissionId={submission.id} />
                    )}
                  </div>
                )}
              </div>

              {submission.status !== 'approved' && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(201,168,130,0.1)' }}>
                  <h4 className="text-sm font-bold mb-4" style={{ color: '#2C2C2C' }}>Update Submission</h4>
                  <SubmissionForm taskId={taskId} acceptedFormats={task.accepted_formats} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: '#2C2C2C' }}>Submit Task</h3>
              <SubmissionForm taskId={taskId} acceptedFormats={task.accepted_formats} />
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {submission?.feedback && (
            <FeedbackDisplay feedback={submission.feedback} status={submission.status} />
          )}
        </div>
      </div>
    </div>
  );
}
