import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getDayStatus, isWithinQuizWindow } from '@/lib/utils/dayLock';
import DayEditDialog from '@/components/admin/day-edit-dialog';
import QuizPlayer from '@/components/quiz/quiz-player';
import ScoreCard from '@/components/quiz/score-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, User, PlayCircle, Edit3, ClipboardList } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

export default async function DayDetailPage({ params }: { params: { dayId: string } }) {
  // Await params first to resolve the Promise
  const resolvedParams = await params;
  const dayId = resolvedParams.dayId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch Day + Quiz
  const { data: day, error } = await supabase
    .from('days')
    .select('*, quizzes(*), weeks(week_number, title)')
    .eq('id', dayId)
    .single();

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

  // Fetch user profile for role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const hasAttempted = !!scoreObj;
  const status = getDayStatus(day.date, hasAttempted);
  const isAdmin = profile?.role === 'admin';

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
              {day.video_url ? (
                day.video_url.includes('youtube.com') || day.video_url.includes('youtu.be') ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${day.video_url.split('v=')[1]?.split('&')[0] || day.video_url.split('/').pop()}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center p-10">
                    <p className="font-bold text-[#7182C7] mb-6">Recording available on external platform</p>
                    <a href={day.video_url} target="_blank" rel="noopener noreferrer">
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

            {day.task_link && (
              <div className="mb-8 p-6 rounded-[2rem] bg-[#F4F9F6] border border-[#34C759]/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-[#34C759]/5 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#34C759] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <ClipboardList size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black italic text-[#1A1A2E]">Today's Task</h4>
                    <p className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest mt-1">Complete the assigned activity</p>
                  </div>
                </div>
                <a href={day.task_link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#34C759] hover:bg-[#2DB24F] text-white font-black shadow-xl shadow-[#34C759]/20 hover:scale-[1.02] active:scale-95 transition-all">
                    View & Download Task <ExternalLink size={18} className="ml-2" />
                  </Button>
                </a>
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
                        {day.resource_link.includes('docs.google.com/presentation') ? (
                          <iframe 
                            src={day.resource_link.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000')} 
                            className="absolute inset-0 w-full h-full border-none"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="flex items-center justify-center h-full flex-col gap-6">
                            <BookOpen size={64} className="text-white/20" />
                            <p className="text-white/60 font-bold">This resource cannot be embedded directly.</p>
                            <a href={day.resource_link} target="_blank" rel="noopener noreferrer">
                              <Button className="h-14 px-8 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black">
                                Open in New Tab <ExternalLink size={18} className="ml-2" />
                              </Button>
                            </a>
                          </div>
                        )}
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
                <p className="text-md font-bold leading-relaxed text-[#7182C7] italic">
                  {day.description || 'This session covers the fundamental principles and practical applications of the topic.'}
                </p>
              </div>

              {day.sub_topics && (
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

              <p className="text-white/60 font-bold mb-10 text-sm leading-relaxed">
                Complete the daily assessment to validate your understanding and earn progress badges.
              </p>

              {day.quiz_link ? (
                (isWithinQuizWindow() || isAdmin) ? (
                  <a href={day.quiz_link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-20 rounded-[2rem] bg-gradient-to-r from-[#4A5DB5] to-[#7182C7] hover:scale-[1.02] active:scale-95 transition-all text-white font-black text-xl shadow-2xl shadow-blue-500/40">
                      GET QUIZ <ExternalLink size={24} className="ml-3" />
                    </Button>
                  </a>
                ) : (
                  <div className="text-center py-8 px-6 rounded-[2rem] border-2 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                    <p className="text-red-400 font-black italic uppercase tracking-widest text-sm mb-2">
                      Quiz Window Closed
                    </p>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      Available daily between 10:00 AM - 02:00 PM IST
                    </p>
                  </div>
                )
              ) : quiz ? (
                hasAttempted ? (
                  <ScoreCard score={scoreObj.score} maxScore={quiz.max_score} />
                ) : (isWithinQuizWindow() || isAdmin) ? (
                  <QuizPlayer quizId={quiz.id} questions={quiz.questions} />
                ) : (
                  <div className="text-center py-8 px-6 rounded-[2rem] border-2 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                    <p className="text-red-400 font-black italic uppercase tracking-widest text-sm mb-2">
                      Quiz Window Closed
                    </p>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      Available daily between 10:00 AM - 02:00 PM IST
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 px-4 rounded-[2rem] border-2 border-dashed border-white/20">
                  <p className="text-white/40 font-black italic uppercase tracking-widest text-sm">
                    Quiz will be updated soon
                  </p>
                </div>
              )}
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#4A5DB5]/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </div>

  );
}
