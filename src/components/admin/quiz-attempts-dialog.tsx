'use client';

import { useState, useEffect } from 'react';
import { Users, User, Trophy, CalendarClock, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface QuizAttemptsDialogProps {
  quiz: any;
}

export default function QuizAttemptsDialog({ quiz }: QuizAttemptsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Handle both array of scores (old way) and count object (new way)
  const attemptsCount = Array.isArray(quiz.scores) && quiz.scores.length > 0 && typeof quiz.scores[0] !== 'object'
    ? quiz.scores.length
    : quiz.scores?.[0]?.count || (Array.isArray(quiz.scores) ? quiz.scores.length : 0);

  useEffect(() => {
    if (open) {
      const fetchAttempts = async () => {
        setIsLoading(true);
        const { data } = await supabase
          .from('scores')
          .select('id, score, attempted_at, profiles(full_name, email, avatar_url)')
          .eq('quiz_id', quiz.id)
          .order('attempted_at', { ascending: false });
        
        if (data) setAttempts(data);
        setIsLoading(false);
      };
      fetchAttempts();
    }
  }, [open, quiz.id, supabase]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" className="h-10 px-4 rounded-xl border border-slate-200 text-[#4A5DB5] hover:bg-[#4A5DB5] hover:text-white hover:border-[#4A5DB5] transition-all flex items-center gap-2" />}>
        <Users size={16} />
        <span className="font-black">{attemptsCount} Attempts</span>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg">
                <Users size={28} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight italic">
                  Quiz Attempts
                </DialogTitle>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                  Day {quiz.days?.day_number} — {quiz.days?.topic}
                </p>
              </div>
            </div>
          </div>

          <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 size={32} className="animate-spin text-[#4A5DB5]" />
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-[#1A1A2E] mb-2">No attempts yet</h3>
                <p className="text-[#7182C7] font-bold text-sm">Members haven't attempted this quiz.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7182C7] to-[#4A5DB5] flex items-center justify-center text-white shadow-md overflow-hidden">
                        {attempt.profiles?.avatar_url ? (
                          <Image src={attempt.profiles.avatar_url} alt="avatar" fill className="object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-[#1A1A2E] group-hover:text-[#4A5DB5] transition-colors">{attempt.profiles?.full_name || 'Unknown User'}</h4>
                        <div className="flex items-center gap-3 text-xs font-bold text-[#A0ACDC] mt-1">
                          <span className="flex items-center gap-1"><Mail size={12}/> {attempt.profiles?.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-[#4A5DB5]">
                        <Trophy size={14} />
                        <span className="font-black text-sm">{attempt.score} <span className="opacity-60 text-xs">/ {quiz.max_score}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#A0ACDC] uppercase tracking-wider">
                        <CalendarClock size={12} />
                        {format(parseISO(attempt.attempted_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
