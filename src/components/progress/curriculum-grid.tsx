'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, PlayCircle, CheckCircle2, XCircle, 
  ChevronRight, BookOpen, Clock, Zap, Target, User,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { WeekWithDays, DayWithStatus } from '@/types';
import { getDayStatusLabel } from '@/lib/utils/dayLock';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CurriculumGridProps {
  weeks: WeekWithDays[];
  title?: string;
  description?: string;
  isAdmin?: boolean;
}

export default function CurriculumGrid({ 
  weeks, 
  title = "Applied AI and Data Science Bootcamp",
  description = "Master your path with precision and style",
  isAdmin = false 
}: CurriculumGridProps) {
  const [selectedDay, setSelectedDay] = useState<DayWithStatus | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(weeks.length > 0 ? [weeks[0].id] : []));
  const [isMainExpanded, setIsMainExpanded] = useState(false);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };
  
  const totalDays = weeks.reduce((acc, week) => acc + week.days.length, 0);
  const completedDays = weeks.reduce((acc, week) => 
    acc + week.days.filter(d => d.status === 'completed').length, 0
  );
  const overallProgress = Math.round((completedDays / totalDays) * 100) || 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-12">
      {/* Premium Header with Overall Progress */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setIsMainExpanded(!isMainExpanded)}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-blue-900/5 cursor-pointer group hover:bg-white/80 transition-all"
      >
        <div>
          <h1 className="text-5xl font-black mb-3 tracking-tight text-[#1A1A2E] flex items-center gap-4">
            {title}
            <div className="text-[#A0ACDC] group-hover:text-[#4A5DB5] transition-colors">
              {isMainExpanded ? <ChevronUp size={40} /> : <ChevronDown size={40} />}
            </div>
          </h1>
          <p className="text-[#7182C7] font-bold text-lg">{description}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 min-w-[280px]">
          <div className="flex justify-between w-full mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Overall Mastery</span>
            <span className="text-sm font-black text-[#2238A4]">{overallProgress}%</span>
          </div>
          <div className="w-full h-4 bg-[#E9EEF9] rounded-full overflow-hidden shadow-inner border border-blue-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#7182C7] via-[#4A5DB5] to-[#2238A4] shadow-lg shadow-blue-500/20"
            />
          </div>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#4A5DB5]">
              <Target size={16} />
              {completedDays} / {totalDays} Days
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-[#2238A4]">
              <Zap size={16} />
              {completedDays} Badges
            </div>
          </div>
        </div>
      </motion.div>

      {/* Week Sections */}
      <AnimatePresence>
        {isMainExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="space-y-20 overflow-hidden"
          >
        {weeks.map((week, weekIdx) => {
          const weekCompleted = week.days.filter(d => d.status === 'completed').length;
          const weekProgress = Math.round((weekCompleted / week.days.length) * 100) || 0;

          return (
            <div key={week.id} className="space-y-8">
              {/* Week Header */}
              <div 
                onClick={() => toggleWeek(week.id)}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#7182C7] to-[#2238A4] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                    {week.week_number}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#1A1A2E] flex items-center gap-3">
                      {week.title}
                      {expandedWeeks.has(week.id) ? (
                        <ChevronUp className="text-[#A0ACDC]" size={24} />
                      ) : (
                        <ChevronDown className="text-[#A0ACDC]" size={24} />
                      )}
                    </h2>
                    <Badge variant="outline" className="mt-2 border-[#A0ACDC]/30 text-[#4A5DB5] bg-white font-bold py-1 px-3 rounded-xl">
                      {week.domain}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 bg-white/50 p-3 rounded-2xl border border-white">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-1">Week Stats</p>
                    <p className="text-sm font-black text-[#2238A4]">{weekProgress}% Complete</p>
                  </div>
                  <div className="w-40 h-2.5 bg-[#E9EEF9] rounded-full overflow-hidden border border-blue-50/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${weekProgress}%` }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-[#4A5DB5]" 
                    />
                  </div>
                </div>
              </div>

              {/* Days Grid - Collapsible */}
              <AnimatePresence>
                {expandedWeeks.has(week.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <motion.div 
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-3 pt-4"
                    >
                      {week.days.map((day) => {
                        const isLocked = day.status === 'locked';
                        const isActive = day.status === 'active';
                        const isCompleted = day.status === 'completed';

                        return (
                          <motion.div 
                            key={day.id} 
                            variants={item}
                            whileHover={(!isLocked || isAdmin) ? { 
                              x: 10,
                              transition: { type: "spring", stiffness: 400, damping: 25 }
                            } : {}}
                            onClick={() => (!isLocked || isAdmin) && (window.location.href = `/progress/${day.id}`)}
                            className={`relative group rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden border flex items-center gap-5
                              ${(isLocked && !isAdmin) ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white shadow-sm border-white hover:shadow-md hover:border-blue-100'}
                              ${isActive ? 'ring-2 ring-[#4A5DB5]/10 border-[#4A5DB5]/20' : ''}
                            `}
                          >
                            {/* Icon / Status */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 
                              ${(isLocked && !isAdmin) ? 'bg-slate-100 text-slate-400' : 
                                isCompleted ? 'bg-emerald-50 text-emerald-500' : 
                                isActive ? 'bg-[#4A5DB5] text-white' : 
                                'bg-[#E9EEF9] text-[#4A5DB5]'}`}
                            >
                              {(isLocked && !isAdmin) ? <Lock size={20} /> : 
                               isCompleted ? <CheckCircle2 size={20} /> : 
                               isActive ? <Zap size={20} className="fill-white" /> : 
                               <BookOpen size={20} />}
                            </div>

                            {/* Content Middle */}
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-3 mb-0.5">
                                <span className="text-[10px] font-bold text-[#7182C7] uppercase tracking-wider">
                                  Day {day.day_number}
                                </span>
                                {isActive && (
                                  <Badge className="bg-[#4A5DB5] text-white text-[9px] px-2 py-0 h-4 uppercase font-black">Active Now</Badge>
                                )}
                                {day.day_number === 2 && isLocked && !isAdmin && (
                                  <Badge className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0 h-4 uppercase font-black border-none hover:bg-amber-200 transition-colors">
                                    Will be opened at 12:00 PM
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-bold text-lg text-[#1A1A2E] truncate group-hover:text-[#2238A4] transition-colors">
                                {day.sub_topics || day.topic}
                              </h3>
                            </div>

                            {/* Meta Right (Desktop) */}
                            <div className="hidden md:flex items-center gap-8 flex-shrink-0 text-right pr-4">
                              <div className="flex flex-col items-end">
                                <p className="text-[10px] font-bold text-[#A0ACDC] uppercase tracking-tighter">Instructor</p>
                                <p className="text-xs font-bold text-[#4A5DB5]">{day.tutor_name || 'TBA'}</p>
                              </div>
                              <div className="flex flex-col items-end min-w-[80px]">
                                <p className="text-[10px] font-bold text-[#A0ACDC] uppercase tracking-tighter">Date</p>
                                <p className="text-xs font-bold text-[#1A1A2E]">{format(parseISO(day.date), 'MMM d')}</p>
                              </div>
                              <ChevronRight className="text-[#A0ACDC] group-hover:text-[#2238A4] transition-colors" size={20} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hybrid Modal */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
          {selectedDay && (
            <div className="relative">
              {/* Modal Header Aesthetic */}
              <div className="h-40 bg-gradient-to-br from-[#4A5DB5] via-[#2238A4] to-[#1A1A2E] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="absolute top-10 left-10 p-5 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <div className="text-white">
                    {selectedDay.status === 'completed' ? <CheckCircle2 size={40} className="fill-white/10" /> : <BookOpen size={40} className="fill-white/10" />}
                  </div>
                </div>
                <div className="absolute top-10 right-10">
                  <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white py-1.5 px-4 rounded-full font-black text-xs uppercase tracking-widest">
                    Day {selectedDay.day_number}
                  </Badge>
                </div>
              </div>

              <div className="px-10 pb-10 pt-8">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-4xl font-black mb-3 tracking-tight text-[#1A1A2E]">
                    {selectedDay.topic}
                  </DialogTitle>
                  <DialogDescription className="text-md font-medium leading-relaxed text-[#7182C7]">
                    {selectedDay.description || 'Prepare yourself for an immersive learning session designed to elevate your professional expertise.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-5 mb-10">
                  <div className="p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-2">Status</p>
                    <p className="text-sm font-black flex items-center gap-2" style={{ 
                      color: selectedDay.status === 'completed' ? '#10B981' : '#4A5DB5' 
                    }}>
                      {selectedDay.status === 'completed' ? <CheckCircle2 size={16} /> : <Zap size={16} className="fill-current" />}
                      {getDayStatusLabel(selectedDay.status, selectedDay.date, selectedDay.score)}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-2">Release Date</p>
                    <p className="text-sm font-black flex items-center gap-2 text-[#1A1A2E]">
                      <Clock size={16} />
                      {format(parseISO(selectedDay.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-[#E9EEF9]/50 border border-blue-100/50 col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-2">Instructor</p>
                    <p className="text-sm font-black flex items-center gap-2 text-[#2238A4]">
                      <User size={16} />
                      {selectedDay.tutor_name || 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedDay.video_url && (
                    <a href={selectedDay.video_url} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full h-16 rounded-[1.5rem] text-lg font-black border-2 border-[#4A5DB5] text-[#4A5DB5] hover:bg-blue-50 shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                        <PlayCircle size={20} className="mr-2" /> Watch Recording
                      </Button>
                    </a>
                  )}
                  <div className="flex gap-4">
                    <Link href={`/progress/${selectedDay.id}`} className="flex-1">
                      <Button className="w-full h-16 rounded-[1.5rem] text-lg font-black bg-[#4A5DB5] hover:bg-[#2238A4] text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95">
                        <Zap size={20} className="mr-2 fill-white" /> Start Learning
                      </Button>
                    </Link>
                    <Link href={`/progress/${selectedDay.id}?view=details`} className="flex-none">
                      <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-95 text-[#4A5DB5]">
                        <ChevronRight size={28} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
