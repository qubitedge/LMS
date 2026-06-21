import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getDayStatus, isWithinQuizWindow } from '@/lib/utils/dayLock';
import DayEditDialog from '@/components/admin/day-edit-dialog';
import QuizPlayer from '@/components/quiz/quiz-player';
import ScoreCard from '@/components/quiz/score-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, User, PlayCircle, Edit3, ClipboardList, FileText } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { createAdminClient } from '@/lib/supabase/admin';
import SubmissionForm from '@/components/tasks/submission-form';
import DeleteSubmissionButton from '@/components/tasks/delete-submission-button';
import { Badge } from '@/components/ui/badge';

import capstoneTeams from '@/lib/capstone-teams.json';

export default async function DayDetailPage({ 
  params,
  searchParams
}: { 
  params: { dayId: string };
  searchParams: { play?: string; view?: string };
}) {
  // Await params first to resolve the Promise
  const resolvedParams = await params;
  const dayId = resolvedParams.dayId;
  const resolvedSearchParams = await searchParams;
  const playVideoId = resolvedSearchParams?.play;
  const viewMode = resolvedSearchParams?.view;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch Day + Quiz, user profile, and settings in parallel
  const [dayResult, profileResult, settingResult] = await Promise.all([
    supabase
      .from('days')
      .select('*, quizzes(*), weeks(week_number, title)')
      .eq('id', dayId)
      .single(),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'unlocked_days')
      .maybeSingle()
  ]);

  const { data: day, error } = dayResult;
  const profile = profileResult.data;
  const setting = settingResult.data;

  if (error || !day) notFound();

  const quiz = day.quizzes;

  // Fetch attempt
  let scoreObj = null;
  if (quiz) {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', quiz.id)
      .maybeSingle();
    scoreObj = data;
  }

  const unlockedDays = setting?.value || [];
  const isAdmin = profile?.role === 'admin';

  // Check if Capstone user
  const capstoneUser = capstoneTeams.find(t => t.email === user.email);
  const isCapstoneSelected = !!capstoneUser;
  const showRevision = day.weeks?.week_number === 6 && (!isCapstoneSelected && !isAdmin || (isAdmin && viewMode === 'revision'));

  const checkId = showRevision ? `${dayId}-revision` : dayId;
  const isUnlocked = unlockedDays.includes(checkId);

  if (!isAdmin && !isUnlocked) {
    redirect('/progress');
  }

  const hasAttempted = !!scoreObj;
  let status = getDayStatus(day.date, hasAttempted);
  if (status === 'locked' && (isAdmin || isUnlocked)) {
    status = 'active';
  }

  let targetWeekNumber = 1;
  let targetDaysList: any[] = [];
  let activeVideoUrl = day.video_url;

  if (showRevision) {
    targetWeekNumber = day.day_number - 25; // Day 26 -> Week 1, Day 27 -> Week 2, etc.
    const revisionNames = [
      'Week-1 Revision',
      'Week-2',
      'Week-3',
      'Week-4',
      'Week-5'
    ];
    day.topic = revisionNames[day.day_number - 26] || `Week-${targetWeekNumber} Revision`;
    day.description = `Review all session recordings, presentation decks, and materials from Week ${targetWeekNumber}.`;
    day.tutor_name = 'Qubitedge Team';
    if (day.weeks) {
      day.weeks.title = 'Revision & Recording Sessions';
    }

    // Fetch days of that week from database
    const { data: targetDays } = await supabase
      .from('days')
      .select('*, weeks!inner(*)')
      .eq('weeks.week_number', targetWeekNumber)
      .order('day_number', { ascending: true });
    
    targetDaysList = targetDays || [];
    const selectedDayObj = playVideoId 
      ? targetDaysList.find((d: any) => d.id === playVideoId) 
      : targetDaysList.find((d: any) => d.video_url);
    const finalSelectedDay = selectedDayObj || targetDaysList.find((d: any) => d.video_url) || targetDaysList[0];
    activeVideoUrl = finalSelectedDay?.video_url || null;
  }

  // Fetch Task for this day
  let { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('day_id', dayId)
    .maybeSingle();

  // If day has a task link but no task row in DB, create one automatically using admin client!
  if (!task && day.task_link) {
    const adminSupabase = createAdminClient();
    const { data: newTask, error: createError } = await adminSupabase
      .from('tasks')
      .insert({
        day_id: dayId,
        title: `Task for Day ${day.day_number}: ${day.topic}`,
        description: `Complete the task assigned for Day ${day.day_number}. Download the task sheet using the link provided above.`,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        accepted_formats: ['pdf', 'zip', 'github', 'text']
      })
      .select()
      .single();

    if (!createError && newTask) {
      task = newTask;
    }
  }

  // Fetch submission for this task
  let submission = null;
  if (task) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('task_id', task.id)
      .eq('user_id', user.id)
      .maybeSingle();
    submission = data;
  }

  // Security: block access if locked (Admins bypass)
  if (status === 'locked' && !isAdmin) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">This day is locked</h2>
        <p className="text-gray-500 mb-8">It will be available on {format(parseISO(day.date), 'MMMM d, yyyy')}</p>
        <Link href="/progress">
          <Button variant="outline">Return to Progress</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <Link href="/progress" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-[#7182C7] hover:text-[#4A5DB5] mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Curriculum
          </Link>
          <h1 className="text-5xl font-black text-[#1A1A2E] tracking-tighter italic">
            {day.topic}
          </h1>
          <p className="text-[#7182C7] font-bold mt-2">
            Module {day.weeks?.week_number}: {day.weeks?.title} • Day {day.day_number}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <DayEditDialog day={day}>
              <Button variant="outline" className="h-14 px-6 rounded-2xl border-[#4A5DB5]/20 text-[#4A5DB5] font-black uppercase text-xs tracking-widest hover:bg-[#4A5DB5] hover:text-white transition-all shadow-lg shadow-blue-900/5">
                <Edit3 size={18} className="mr-2" /> Edit Module
              </Button>
            </DayEditDialog>
          )}
          <div className="px-6 py-3 bg-white rounded-2xl border border-blue-50 shadow-xl shadow-blue-900/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7182C7] to-[#4A5DB5] flex items-center justify-center text-white shadow-lg">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-widest">Instructor</p>
              <p className="text-sm font-black text-[#1A1A2E]">{day.tutor_name || 'TBA'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Box 1: Watch recorded video with PPT and Deck */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/10 border border-white flex flex-col h-full group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                  <PlayCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#1A1A2E] italic">Watch Recording</h3>
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-50 px-4 py-2 rounded-full">Session Video</span>
            </div>

            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-50 mb-8 bg-slate-100 flex items-center justify-center">
              {activeVideoUrl ? (
                activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be') ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1] || activeVideoUrl.split('/').pop()}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center p-10">
                    <p className="font-bold text-[#7182C7] mb-6">Recording available on external platform</p>
                    <a href={activeVideoUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="h-16 px-10 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-lg shadow-xl shadow-red-500/20">
                        Open Recording <ExternalLink size={20} className="ml-2" />
                      </Button>
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center p-10">
                  <PlayCircle size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-bold text-slate-400 italic">Recording will be uploaded soon</p>
                </div>
              )}
            </div>

            <div className="mb-8 flex flex-col items-center justify-center p-6 bg-[#FAFAFA] rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-4">Follow us for more updates</h4>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="https://youtube.com/@qubitedge?si=YMPd0bLHXGA9aVM-" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="h-10 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold transition-all shadow-sm">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    Subscribe
                  </Button>
                </a>
                <a href="https://www.instagram.com/qubitedge?igsh=MTl6djFzNWdranFlcA==" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="h-10 rounded-xl border-fuchsia-200 text-fuchsia-500 hover:bg-fuchsia-50 hover:text-fuchsia-600 font-bold transition-all shadow-sm">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Follow
                  </Button>
                </a>
                <a href="https://www.linkedin.com/company/qubitedge.in/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="h-10 rounded-xl border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 font-bold transition-all shadow-sm">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Connect
                  </Button>
                </a>
              </div>
            </div>

            {showRevision && (
              <div className="mb-8 p-8 rounded-[2.5rem] bg-[#FAFAFA] border border-slate-100 shadow-md">
                <h3 className="text-2xl font-black text-[#1A1A2E] italic mb-6 flex items-center gap-3">
                  <PlayCircle className="text-[#4A5DB5]" size={28} />
                  Week {targetWeekNumber} Session Recordings
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {targetDaysList.map((d: any) => {
                    const isPlaying = playVideoId ? d.id === playVideoId : (d.video_url === activeVideoUrl);
                    return (
                      <div 
                        key={d.id} 
                        className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4
                          ${isPlaying 
                            ? 'bg-[#F0F4FF] border-[#4A5DB5]/30 shadow-md' 
                            : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'
                          }
                        `}
                      >
                        <div>
                          <p className="text-[10px] font-black text-[#7182C7] uppercase tracking-wider mb-1">
                            Day {d.day_number}
                          </p>
                          <h4 className="font-bold text-lg text-[#1A1A2E]">
                            {d.topic}
                          </h4>
                          {d.description && (
                            <p className="text-xs text-[#7182C7] mt-1 line-clamp-1">{d.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {d.video_url ? (
                            isPlaying ? (
                              <Badge className="bg-[#4A5DB5] text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-full border-none">
                                Now Playing
                              </Badge>
                            ) : (
                              <Link href={`/progress/${dayId}?play=${d.id}`}>
                                <Button className="h-10 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#4A5DB5] font-black text-xs shadow-sm">
                                  Play Session
                                </Button>
                              </Link>
                            )
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 font-black text-[10px] uppercase px-3 py-1.5 rounded-full">
                              No Recording
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!showRevision && day.task_link && (
              <div className="mb-8 p-6 rounded-[2rem] bg-[#F4F9F6] border border-[#34C759]/20 flex flex-col items-stretch gap-6 shadow-lg shadow-[#34C759]/5 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#34C759] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <ClipboardList size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black italic text-[#1A1A2E]">Today's Task</h4>
                      <p className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest mt-1">Complete the assigned activity</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {day.task_link.split(',').map((link: string, idx: number) => {
                      const cleanLink = link.trim();
                      if (!cleanLink) return null;
                      const isMultiple = day.task_link.includes(',');
                      const buttonText = isMultiple ? `View & Download Task ${idx + 1}` : 'View & Download Task';
                      return (
                        <a key={idx} href={cleanLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-initial">
                          <Button className="w-full h-14 px-8 rounded-2xl bg-[#34C759] hover:bg-[#2DB24F] text-white font-black shadow-xl shadow-[#34C759]/20 hover:scale-[1.02] active:scale-95 transition-all">
                            {buttonText} <ExternalLink size={18} className="ml-2" />
                          </Button>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {!showRevision && task && (
              <div className="mb-8 bg-[#FAFAFA] rounded-[2rem] p-8 border border-slate-100 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/50">
                  <div>
                    <h3 className="text-2xl font-black text-[#1A1A2E] italic">Submit Your Task</h3>
                    <p className="text-xs font-bold text-[#7182C7] mt-1">
                      {submission 
                        ? `Successfully submitted on ${format(parseISO(submission.submitted_at), 'MMM d, yyyy h:mm a')}`
                        : 'Upload your completed task here. Your files are securely stored on Google Drive.'
                      }
                    </p>
                  </div>
                  {submission && (
                    <Badge className={
                      submission.status === 'approved' ? 'bg-emerald-500 text-white font-black text-xs uppercase px-3 py-1.5 rounded-full border-none shadow-md shadow-emerald-100' : 
                      submission.status === 'rejected' ? 'bg-rose-500 text-white font-black text-xs uppercase px-3 py-1.5 rounded-full border-none shadow-md shadow-rose-100' : 
                      'bg-amber-500 text-white font-black text-xs uppercase px-3 py-1.5 rounded-full border-none shadow-md shadow-amber-100'
                    }>
                      {submission.status.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {submission ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={18} className="text-[#4A5DB5]" />
                        <span className="font-black text-xs text-[#1A1A2E] uppercase tracking-wider">Format: {submission.format.toUpperCase()}</span>
                      </div>
                      
                      {submission.format === 'github' ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <a href={submission.content} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-[#4A5DB5] hover:underline font-bold break-all">
                            {submission.content} <ExternalLink size={14} className="ml-1" />
                          </a>
                          {submission.status !== 'approved' && (
                            <DeleteSubmissionButton submissionId={submission.id} />
                          )}
                        </div>
                      ) : submission.format === 'text' ? (
                        <div className="flex flex-col gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 border text-xs text-[#1A1A2E] whitespace-pre-wrap font-medium">
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
                          <span className="text-xs font-bold text-[#7182C7] italic break-all">{submission.content}</span>
                          <div className="flex items-center gap-2">
                            {submission.status !== 'approved' && (
                              <DeleteSubmissionButton submissionId={submission.id} />
                            )}
                            <a href={submission.file_path || '#'} target="_blank" rel="noreferrer">
                              <Button className="h-10 px-4 rounded-xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-xs">
                                Open in Google Drive <ExternalLink size={14} className="ml-1.5" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                        <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Faculty Feedback</h4>
                        <p className="text-xs text-amber-900 font-bold italic">{submission.feedback}</p>
                      </div>
                    )}

                    {submission.status !== 'approved' && (
                      <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                        <h4 className="text-md font-black italic mb-4 text-[#1A1A2E]">Update Your Solution</h4>
                        <SubmissionForm taskId={task.id} acceptedFormats={task.accepted_formats} />
                      </div>
                    )}
                  </div>
                ) : (
                  <SubmissionForm taskId={task.id} acceptedFormats={task.accepted_formats} />
                )}
              </div>
            )}

            <div className="mt-auto">
              <h4 className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-4">Study Materials</h4>
              <div className="flex flex-wrap gap-4">
                {day.resource_link ? (
                  <Dialog>
                    <DialogTrigger 
                      render={
                        <button className="flex-1 text-left w-full">
                          <div className="flex items-center gap-4 p-6 rounded-3xl bg-[#F0F4FF] border border-[#4A5DB5]/10 hover:bg-[#4A5DB5] hover:text-white transition-all group/btn">
                            <div className="w-12 h-12 rounded-2xl bg-white text-[#4A5DB5] flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                              <BookOpen size={24} />
                            </div>
                            <div>
                              <p className="font-black italic">PPT & Class Deck</p>
                              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">View Presentation</p>
                            </div>
                          </div>
                        </button>
                      }
                    />
                    <DialogContent className="sm:max-w-[90vw] md:max-w-6xl w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col bg-[#1A1A2E] rounded-[2rem] border-none shadow-2xl">
                      <DialogHeader className="px-6 py-4 bg-[#1A1A2E] border-b border-white/10 flex justify-between items-center z-10">
                        <DialogTitle className="text-white font-black italic tracking-wider">{day.topic} - Class Deck</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 w-full bg-[#1A1A2E] relative">
                        {(() => {
                          const isGoogleLink = day.resource_link.includes('docs.google.com') || day.resource_link.includes('drive.google.com');
                          const idMatch = day.resource_link.match(/\/d\/([a-zA-Z0-9_-]+)/);
                          const fileId = idMatch ? idMatch[1] : null;
                          
                          if (isGoogleLink && fileId) {
                            return (
                              <iframe 
                                src={`https://drive.google.com/file/d/${fileId}/preview`} 
                                className="absolute inset-0 w-full h-full border-none bg-white"
                                allowFullScreen
                              ></iframe>
                            );
                          }
                          
                          return (
                            <div className="flex items-center justify-center h-full flex-col gap-6">
                              <BookOpen size={64} className="text-white/20" />
                              <p className="text-white/60 font-bold">This resource cannot be embedded directly.</p>
                              <a href={day.resource_link} target="_blank" rel="noopener noreferrer">
                                <Button className="h-14 px-8 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black">
                                  Open in New Tab <ExternalLink size={18} className="ml-2" />
                                </Button>
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="flex-1 flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 opacity-50 cursor-not-allowed">
                    <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <p className="font-black italic">PPT & Class Deck</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Not Available Yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-8">
          {/* Box 2: Description of class */}
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/10 border border-white group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#4A5DB5] flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A2E] italic">Class Insights</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-3">Overview</h4>
                {showRevision && targetWeekNumber === 1 ? (
                  <div className="text-sm font-medium leading-relaxed text-[#7182C7] space-y-4">
                    <h5 className="font-bold text-[#1A1A2E] text-base mb-2">Data Foundations & SQL Bootcamp — Study Notes</h5>
                    <div>
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 1 — What is Data · Data Lifecycle · Basic Functions</h6>
                      <p><strong>What is Data</strong><br />Data is raw facts and figures — numbers, text, dates, images — that have no meaning on their own until processed. Example: 25, "John", 90000 are just values; together they become "John earns ₹90,000 aged 25."</p>
                      <p className="mt-2"><strong>Data Lifecycle</strong><br />The journey data takes from creation to deletion:<br />Collection → Storage → Processing → Analysis → Visualization → Archival/Deletion</p>
                      <p className="mt-2"><strong>Basic Excel Functions</strong><br />
                      • SUM(A1:A10) — Adds up a range of numbers<br />
                      • AVERAGE(B1:B10) — Finds the mean value<br />
                      • COUNT(C1:C10) — Counts numeric cells<br />
                      • MAX / MIN — Finds highest or lowest value<br />
                      • IF(A1&gt;50, "Pass", "Fail") — Returns value based on condition</p>
                    </div>
                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 2 — Lookup Functions · Logical Functions · Data Cleaning · Data Matching</h6>
                      <p><strong>Lookup Functions</strong><br />Used to search and retrieve data from a table.<br />
                      • VLOOKUP(102, A:C, 2, FALSE) — Looks up Employee ID 102 and retrieves corresponding data</p>
                    </div>
                  </div>
                ) : showRevision && targetWeekNumber === 2 ? (
                  <div className="text-sm font-medium leading-relaxed text-[#7182C7] space-y-4">
                    <h5 className="font-bold text-[#1A1A2E] text-base mb-2">Data Analysis & SQL Deep Dive — Study Notes</h5>
                    
                    <div>
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 6 — SQL Filtering, Sorting & Aggregations</h6>
                      <p><strong>Filtering with WHERE</strong><br />Narrow down rows based on conditions before fetching results.<br />
                      • SELECT * FROM employees WHERE department = 'IT' AND salary &gt; 50000;<br />
                      • BETWEEN — WHERE salary BETWEEN 30000 AND 80000<br />
                      • IN — WHERE city IN ('Hyderabad', 'Bangalore', 'Chennai')<br />
                      • LIKE — WHERE name LIKE 'A%' → names starting with A</p>
                      
                      <p className="mt-2"><strong>Sorting with ORDER BY</strong><br />Arrange results in ascending or descending order.<br />
                      • SELECT name, salary FROM employees ORDER BY salary DESC;<br />
                      • ASC = lowest to highest (default)<br />
                      • DESC = highest to lowest</p>
                      
                      <p className="mt-2"><strong>Aggregation Functions</strong><br />Summarize many rows into a single value.<br />
                      • COUNT(*) — Total number of rows<br />
                      • SUM(salary) — Total of all salaries<br />
                      • AVG(salary) — Average salary<br />
                      • MAX(salary) / MIN(salary) — Highest / lowest value</p>
                      
                      <p className="mt-2"><strong>GROUP BY & HAVING</strong><br />
                      Group rows by a category, then apply aggregation per group.<br />
                      • SELECT department, AVG(salary) FROM employees GROUP BY department;<br />
                      Like WHERE but filters after grouping — used with aggregations.<br />
                      • SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) &gt; 5;</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 7 — SQL Joins</h6>
                      <p><strong>What is a Join?</strong><br />Combines rows from two or more tables based on a related column.</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>INNER JOIN:</strong> Returns only rows that have a match in both tables.</li>
                        <li><strong>LEFT JOIN:</strong> Returns all rows from the left table + matched rows from right. Unmatched right side shows NULL.</li>
                        <li><strong>RIGHT JOIN:</strong> Opposite of LEFT JOIN — all rows from right table, matched from left.</li>
                        <li><strong>FULL OUTER JOIN:</strong> Returns everything from both tables. NULLs where no match exists on either side.</li>
                        <li><strong>SELF JOIN:</strong> A table joined to itself — useful for hierarchies like employee-manager relationships.</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 8 — Subqueries · CTEs · Window Functions</h6>
                      <p><strong>Subqueries:</strong> A query nested inside another query — inner query runs first, result is used by outer query.<br />
                      <strong>CTEs:</strong> A named temporary result set using WITH — makes complex queries readable and reusable.<br />
                      <strong>Window Functions:</strong> Perform calculations across a set of rows related to the current row.</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>ROW_NUMBER() — Assigns a unique rank to each row</li>
                        <li>RANK() — Same but ties get the same rank (with gaps)</li>
                        <li>DENSE_RANK() — Same rank for ties but no gaps</li>
                        <li>LAG() / LEAD() — Fetch previous/next row's value</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 9 & 10 — Data Analysis Workflow & Real Data</h6>
                      <p><strong>Types of Data Analysis:</strong> Descriptive (What happened), Diagnostic (Why), Predictive (What will happen), Prescriptive (What should we do).</p>
                      <p className="mt-2"><strong>Key Concepts:</strong> Mean/Median/Mode, Standard Deviation, Correlation, Outliers.</p>
                      <p className="mt-2"><strong>Handling Real Data Problems:</strong><br />
                      • Missing values → Fill with mean/median or drop<br />
                      • Duplicates → Identify with COUNT + GROUP BY, remove with DISTINCT<br />
                      • Wrong data types / Inconsistent labels → Cast or standardize</p>
                      <p className="mt-2"><strong>Insight Generation:</strong> Don't just run queries — ask "so what?" after every result to find business value.</p>
                    </div>

                  </div>
                ) : showRevision && targetWeekNumber === 3 ? (
                  <div className="text-sm font-medium leading-relaxed text-[#7182C7] space-y-4">
                    <h5 className="font-bold text-[#1A1A2E] text-base mb-2">Python for Data Analysis — Study Notes</h5>
                    
                    <div>
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 11 — Python Basics</h6>
                      <p><strong>What is Python?</strong><br />A high-level, easy-to-read programming language widely used in data science, AI, web development, and automation.</p>
                      
                      <p className="mt-2"><strong>Variables & Data Types</strong><br />
                      • String: <code>name = "Likhith"</code><br />
                      • Integer: <code>age = 21</code><br />
                      • Float: <code>gpa = 8.5</code><br />
                      • Boolean: <code>is_student = True</code></p>
                      
                      <p className="mt-2"><strong>Basic Operators & Strings</strong><br />
                      • Arithmetic: +, -, *, /, // (floor div), % (modulus), ** (power)<br />
                      • Strings: <code>name.upper()</code>, <code>name.replace("l","L")</code>, <code>len(name)</code>, <code>f"Hello name"</code></p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 12 — Control Flow and Functions</h6>
                      <p><strong>Control Flow:</strong><br />
                      • <code>if/elif/else</code> for conditional execution<br />
                      • <code>for</code> loops for iterating over a sequence (e.g., <code>for i in range(1, 6):</code>)<br />
                      • <code>while</code> loops repeat as long as a condition is True<br />
                      • <code>break</code> (exit loop), <code>continue</code> (skip iteration)</p>
                      
                      <p className="mt-2"><strong>Functions:</strong><br />
                      Reusable blocks of code defined using <code>def</code>.<br />
                      • Default & Keyword Arguments: <code>def power(base, exp=2):</code><br />
                      • Lambda Functions: One-line anonymous functions (e.g., <code>square = lambda x: x ** 2</code>)</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 13 — Data Structures</h6>
                      <p><strong>List:</strong> Ordered, mutable (changeable) collection. <code>[85, 90, 78, 92]</code><br />
                      <strong>Tuple:</strong> Ordered but immutable (cannot change). <code>(17.38, 78.48)</code><br />
                      <strong>Dictionary:</strong> Key-value pairs. <code>{`{"name": "Likhith", "age": 21}`}</code><br />
                      <strong>Set:</strong> Unordered collection of unique values. Removes duplicates automatically. <code>{`{"python", "sql"}`}</code></p>
                      
                      <p className="mt-2"><strong>List Comprehension:</strong> Compact way to create lists.<br />
                      <code>{`[x**2 for x in range(1, 6)]`}</code> → [1, 4, 9, 16, 25]</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 14 & 15 — Python Data Libraries (NumPy, Pandas, Visualization)</h6>
                      <p><strong>NumPy:</strong> Fast array operations. <code>arr.mean()</code>, <code>arr.max()</code><br />
                      <strong>Pandas:</strong> Data manipulation using DataFrames.<br />
                      • Load: <code>df = pd.read_csv("data.csv")</code><br />
                      • Explore: <code>df.head()</code>, <code>df.info()</code>, <code>df.describe()</code><br />
                      • Filter: <code>df[df["salary"] &gt; 50000]</code><br />
                      • Missing Values: <code>df.isnull().sum()</code>, <code>df.dropna()</code><br />
                      • Grouping: <code>df.groupby("department")["salary"].mean()</code></p>
                      
                      <p className="mt-2"><strong>Visualization:</strong><br />
                      • <strong>Matplotlib:</strong> Basic charting like <code>plt.bar()</code><br />
                      • <strong>Seaborn:</strong> Advanced charting like <code>sns.histplot()</code>, <code>sns.heatmap()</code></p>
                    </div>

                  </div>
                ) : showRevision && targetWeekNumber === 4 ? (
                  <div className="text-sm font-medium leading-relaxed text-[#7182C7] space-y-4">
                    <h5 className="font-bold text-[#1A1A2E] text-base mb-2">Machine Learning & AI — Study Notes</h5>
                    
                    <div>
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 16 — AI: From Fundamentals to Future Innovations</h6>
                      <p><strong>What is AI?</strong> Simulation of human intelligence in machines — enabling them to think, learn, reason, and make decisions.</p>
                      <p className="mt-2"><strong>AI vs ML vs DL:</strong><br />
                      • <strong>AI:</strong> Broad concept of intelligent machines<br />
                      • <strong>ML:</strong> Machines learning from data without explicit programming<br />
                      • <strong>DL:</strong> ML using neural networks with many layers</p>
                      <p className="mt-2"><strong>Types of AI:</strong> Narrow AI (ANI) for specific tasks, General AI (AGI) for human-level reasoning, Super AI (ASI) surpassing human intelligence.</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 17 — Supervised Learning</h6>
                      <p><strong>Supervised Learning:</strong> Learning from labeled data where every training example has a known correct output.</p>
                      <p className="mt-2"><strong>Two Types of Tasks:</strong><br />
                      • <strong>Regression:</strong> Predict a continuous number (e.g., house price)<br />
                      • <strong>Classification:</strong> Predict a category/class (e.g., Spam or Not Spam)</p>
                      <p className="mt-2"><strong>Key Algorithms:</strong><br />
                      • Linear Regression (y = mx + c)<br />
                      • Logistic Regression (Probabilities for classification)<br />
                      • Decision Trees & Random Forests (Splits data using yes/no questions)<br />
                      • Support Vector Machines (SVM)</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 18 — Unsupervised Learning</h6>
                      <p><strong>Unsupervised Learning:</strong> Learning from unlabeled data. The model finds hidden patterns or structures on its own.</p>
                      <p className="mt-2"><strong>Two Main Tasks:</strong><br />
                      • <strong>Clustering:</strong> Group similar data points (e.g., K-Means, DBSCAN, Hierarchical)<br />
                      • <strong>Dimensionality Reduction:</strong> Reduce features while keeping information (e.g., PCA)</p>
                      <p className="mt-2"><strong>K-Means:</strong> Choose K clusters, assign points to nearest centroid, update centers iteratively.</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 19 — Classifications</h6>
                      <p><strong>Algorithms:</strong><br />
                      • <strong>KNN:</strong> K-Nearest Neighbors classifies by majority vote.<br />
                      • <strong>Naive Bayes:</strong> Fast, probability-based, good for text/spam.<br />
                      • <strong>SVM:</strong> Max margin separator between classes.</p>
                      <p className="mt-2"><strong>Evaluation Metrics:</strong><br />
                      • <strong>Accuracy:</strong> Correct Predictions / Total Predictions<br />
                      • <strong>Precision:</strong> True Positives / (True Positives + False Positives)<br />
                      • <strong>Recall:</strong> True Positives / (True Positives + False Negatives)<br />
                      • <strong>F1 Score:</strong> Harmonic mean of Precision and Recall</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 20 — Deep Learning & Model Evaluation</h6>
                      <p><strong>Deep Learning:</strong> Neural Networks with hidden layers (Input → Hidden → Output). Uses activation functions like ReLU, Sigmoid, Softmax.</p>
                      <p className="mt-2"><strong>Learning Process:</strong> Backpropagation and Gradient Descent to update weights based on Loss Functions (MSE, Cross-Entropy).</p>
                      <p className="mt-2"><strong>Model Evaluation:</strong> Train/Validation/Test splits and K-Fold Cross Validation.</p>
                      <p className="mt-2"><strong>Overfitting/Underfitting Fixes:</strong> Regularization (L1/L2), Dropout, Early Stopping. Hyperparameters to tune include Learning Rate, Batch Size, Epochs, and Network structure.</p>
                    </div>

                  </div>
                ) : showRevision && targetWeekNumber === 5 ? (
                  <div className="text-sm font-medium leading-relaxed text-[#7182C7] space-y-4">
                    <h5 className="font-bold text-[#1A1A2E] text-base mb-2">IoT & LLMs — Study Notes</h5>
                    
                    <div>
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 21 — IoT Fundamentals</h6>
                      <p><strong>What is IoT?</strong> Internet of Things — a network of physical devices embedded with sensors, software, and connectivity that exchange data over the internet without human intervention.</p>
                      <p className="mt-2"><strong>Core Components:</strong><br />
                      • <strong>Sensors/Actuators:</strong> Collect data / perform actions (e.g., Temp sensor, Motors).<br />
                      • <strong>Microcontrollers:</strong> The brain (e.g., Arduino, Raspberry Pi, ESP32).<br />
                      • <strong>Connectivity:</strong> WiFi, Bluetooth, Zigbee, LoRa.<br />
                      • <strong>Processing:</strong> Edge Computing (local) vs Cloud Computing (remote).</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 22 — IoT Communication & Protocols</h6>
                      <p><strong>Key Protocols:</strong><br />
                      • <strong>MQTT:</strong> Lightweight publish-subscribe protocol (Publisher → Broker → Subscriber).<br />
                      • <strong>HTTP/REST:</strong> Standard web protocol (GET/POST).<br />
                      • <strong>CoAP:</strong> Like HTTP for low-power devices, uses UDP.<br />
                      • <strong>LoRaWAN:</strong> Long range (up to 15km), low power, low data rate.</p>
                      <p className="mt-2"><strong>Network Topologies:</strong> Star, Mesh, Bus, P2P.</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 23 — IoT Cloud Integration & Security</h6>
                      <p><strong>Cloud Integration:</strong> Scalable storage, remote access, analytics. Platforms include AWS IoT Core, Azure IoT Hub.<br />
                      <strong>Gateway & Digital Twin:</strong> Gateways aggregate data before cloud. Digital Twins are virtual replicas of physical devices for real-time monitoring.</p>
                      <p className="mt-2"><strong>Security Best Practices:</strong><br />
                      • Authentication (X.509 certs)<br />
                      • Encryption (TLS/SSL, AES)<br />
                      • Network Segmentation (VLANs)<br />
                      • Edge Computing for Security (processing data locally)</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 24 — LLMs Part 1 (Fundamentals)</h6>
                      <p><strong>What is an LLM?</strong> Large Language Model — trained on massive amounts of text to understand and generate language.</p>
                      <p className="mt-2"><strong>Transformer Architecture:</strong> Uses Self-Attention to weigh the importance of every word in context relative to other words.</p>
                      <p className="mt-2"><strong>Key Concepts:</strong><br />
                      • <strong>Tokenization:</strong> Text broken into numbers.<br />
                      • <strong>Pretraining vs Fine-tuning:</strong> Learning language vs adapting to a specific task.<br />
                      • <strong>Prompt Engineering:</strong> Zero-shot, Few-shot, Chain of Thought.</p>
                    </div>

                    <div className="mt-4">
                      <h6 className="font-bold text-[#4A5DB5] mb-1">📅 Day 25 — LLMs Part 2 (Applications & Advanced Concepts)</h6>
                      <p><strong>RAG (Retrieval Augmented Generation):</strong> Solves knowledge cutoff by retrieving relevant documents from a vector database before generating an answer.</p>
                      <p className="mt-2"><strong>Advanced Concepts:</strong><br />
                      • <strong>Vector Embeddings:</strong> Semantically similar text is close in vector space.<br />
                      • <strong>Context Window:</strong> Max tokens the model can process at once (e.g., 128K for GPT-4, 1M for Gemini).<br />
                      • <strong>AI Agents:</strong> LLMs combined with tools (browse web, run code) to act autonomously.</p>
                    </div>

                  </div>
                ) : (
                  <p className="text-md font-bold leading-relaxed text-[#7182C7] italic">
                    {day.description || 'This session covers the fundamental principles and practical applications of the topic.'}
                  </p>
                )}
              </div>

              {showRevision ? (
                <div>
                  <h4 className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-4">Weekly Curriculum</h4>
                  <div className="flex flex-col gap-3">
                    {targetDaysList.map((d: any) => (
                      <div key={d.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-black text-[#4A5DB5] uppercase tracking-wider">Day {d.day_number}</p>
                        <p className="text-xs font-bold text-[#1A1A2E] mt-0.5">{d.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                day.sub_topics && (
                  <div>
                    <h4 className="text-[10px] font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-4">Core Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {day.sub_topics.split('-').map((topic: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-[#4A5DB5] uppercase tracking-tighter">
                          {topic.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Box 3: Quiz Box */}
          <div className="bg-[#1A1A2E] rounded-[3rem] p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 text-white">
              <ClipboardList size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                  <ClipboardList size={32} />
                </div>
                <h3 className="text-2xl font-black text-white italic">Knowledge Check</h3>
              </div>

              <>
                <p className="text-white/60 font-bold mb-10 text-sm leading-relaxed">
                  Complete the daily assessment to validate your understanding and earn progress badges.
                </p>

                {day.quiz_link ? (
                    <a href={day.quiz_link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-[#4A5DB5] to-[#7182C7] hover:scale-[1.02] active:scale-95 transition-all text-white font-black text-xl shadow-2xl shadow-blue-500/40">
                        GET QUIZ <ExternalLink size={24} className="ml-3" />
                      </Button>
                    </a>
                ) : quiz ? (
                  hasAttempted ? (
                    <ScoreCard score={scoreObj.score} maxScore={quiz.max_score} />
                  ) : (
                    <QuizPlayer quizId={quiz.id} questions={quiz.questions} />
                  )
                ) : (
                  <div className="text-center py-6 px-4 rounded-[2rem] border-2 border-dashed border-white/20">
                    <p className="text-white/40 font-black italic uppercase tracking-widest text-sm">
                      Quiz will be updated soon
                    </p>
                  </div>
                )}
              </>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#4A5DB5]/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </div>

  );
}
