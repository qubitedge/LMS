'use client';

import Link from 'next/link';
import { CalendarCheck, PlayCircle, Trophy, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  hasMarkedAttendance: boolean;
  todayDayId?: string;
  hasAttemptedTodayQuiz?: boolean;
}

export default function QuickActions({
  hasMarkedAttendance,
  todayDayId,
  hasAttemptedTodayQuiz,
}: QuickActionsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="qe-card mt-8 border-none bg-white/40 shadow-2xl rounded-[3rem]">
        <CardHeader className="pb-8 pt-10 px-10">
          <CardTitle className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { 
                href: "/attendance", 
                label: hasMarkedAttendance ? 'Marked' : 'Attendance', 
                icon: CalendarCheck,
                color: hasMarkedAttendance ? '#10B981' : '#4A5DB5',
                active: hasMarkedAttendance,
                bg: hasMarkedAttendance ? 'bg-emerald-50' : 'bg-white'
              },
              { 
                href: todayDayId ? `/progress/${todayDayId}` : '/progress', 
                label: hasAttemptedTodayQuiz ? 'Completed' : 'Today\'s Quiz', 
                icon: PlayCircle,
                color: hasAttemptedTodayQuiz ? '#10B981' : '#7182C7',
                active: hasAttemptedTodayQuiz,
                bg: 'bg-white'
              },
              { 
                href: "/leaderboard", 
                label: 'Leaderboard', 
                icon: Trophy,
                color: '#2238A4',
                active: false,
                bg: 'bg-white'
              },
              { 
                href: "/profile", 
                label: 'My Profile', 
                icon: User,
                color: '#4A5DB5',
                active: false,
                bg: 'bg-white'
              }
            ].map((action, idx) => (
              <motion.div key={idx} variants={item}>
                <Link href={action.href} className="block group">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center justify-center gap-6 p-8 rounded-[2.5rem] transition-all duration-500 shadow-xl border-2 relative overflow-hidden h-full
                      ${action.active ? 'border-emerald-500/30' : 'border-white/60'} ${action.bg}`}
                  >
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 
                      ${action.active ? 'bg-emerald-100 shadow-inner' : 'bg-[#E9EEF9] shadow-lg shadow-blue-900/5'}`}>
                      <action.icon size={36} color={action.color} className="drop-shadow-sm" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors group-hover:text-[#2238A4] text-[#1A1A2E]">
                      {action.label}
                    </span>
                    
                    {/* Animated Pulsing Accent */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 
                      ${action.active ? 'bg-emerald-500' : 'bg-[#4A5DB5] opacity-0 group-hover:opacity-100'}`} />
                    
                    {/* Background Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
