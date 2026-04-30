'use client';

import { motion } from 'framer-motion';
import { Flame, Target, CalendarCheck, Trophy, Sparkles, Binary, Cpu, ChevronRight } from 'lucide-react';
import AnnouncementStrip from '@/components/dashboard/announcement-strip';
import StatCard from '@/components/dashboard/stat-card';
import QuickActions from '@/components/dashboard/quick-actions';
import ActivityFeed from '@/components/dashboard/activity-feed';
import { Button } from '@/components/ui/button';

interface DashboardContentProps {
  profile: any;
  announcements: any[];
  attendanceCount: number;
  quizzesCount: number;
  tasksCount: number;
  progressPercent: number;
  todayAttendance: any;
  todayDay: any;
  hasAttemptedTodayQuiz: boolean;
  activities: any[];
  totalExpectedDays: number;
  showPreviousWorks: boolean;
}

export default function DashboardContent({
  profile,
  announcements,
  attendanceCount,
  quizzesCount,
  tasksCount,
  progressPercent,
  todayAttendance,
  todayDay,
  hasAttemptedTodayQuiz,
  activities,
  totalExpectedDays,
  showPreviousWorks,
}: DashboardContentProps) {
  return (
    <div className="relative pb-20">
      {/* Premium Background Effects */}
      <div className="bg-mesh" />
      <div className="bg-glow top-20 right-20" />
      <div className="bg-glow -bottom-40 -left-40" style={{ animationDelay: '-10s' }} />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        <AnnouncementStrip announcements={announcements || []} />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p className="text-lg font-bold text-[#7182C7]">
            Ready to continue your mastery today?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            title="Current Streak"
            value={profile?.current_streak || 0}
            subtitle={`Longest: ${profile?.longest_streak || 0}`}
            icon={Flame}
            accentColor="#7182C7"
          />
          <StatCard
            title="Mastery Progress"
            value={`${progressPercent}%`}
            icon={Target}
            accentColor="#4A5DB5"
            isProgress
            progressValue={progressPercent}
          />
          <StatCard
            title="Days Present"
            value={`${attendanceCount || 0}/${totalExpectedDays}`}
            icon={CalendarCheck}
            accentColor="#A0ACDC"
          />
          <StatCard
            title="Leaderboard Rank"
            value="--" 
            icon={Trophy}
            accentColor="#2238A4"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <QuickActions 
              hasMarkedAttendance={!!todayAttendance} 
              todayDayId={todayDay?.id}
              hasAttemptedTodayQuiz={hasAttemptedTodayQuiz}
            />

            {/* My Learning Section */}
            {showPreviousWorks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A2E]">My Learning</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative"
                  >
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                        <Binary size={24} />
                      </div>
                      <h3 className="text-xl font-black text-[#1A1A2E] mb-2">Data Science Mastery</h3>
                      <p className="text-sm font-bold text-[#7182C7] mb-6">Explore the depths of predictive modeling and neural networks.</p>
                      <Button variant="ghost" className="p-0 h-auto font-black text-blue-500 hover:bg-transparent flex items-center group-hover:gap-2 transition-all">
                        View Resources <ChevronRight size={18} />
                      </Button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Binary size={120} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative"
                  >
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                        <Cpu size={24} />
                      </div>
                      <h3 className="text-xl font-black text-[#1A1A2E] mb-2">Quantum Computing</h3>
                      <p className="text-sm font-bold text-[#7182C7] mb-6">Introduction to qubits, superposition, and quantum algorithms.</p>
                      <a href="https://youtu.be/zsQ6ieXahg8?si=OtsG_c66PGeAOGhk" target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" className="p-0 h-auto font-black text-purple-500 hover:bg-transparent flex items-center group-hover:gap-2 transition-all">
                          View Resources <ChevronRight size={18} />
                        </Button>
                      </a>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Cpu size={120} />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
