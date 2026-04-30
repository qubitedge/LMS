'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, CalendarCheck, ClipboardList,
  Trophy, User, LogOut, Shield,
} from 'lucide-react';
import QubitedgeLogo from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const internNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/progress', label: 'My Learning', icon: TrendingUp },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: User },
  { href: '/admin/curriculum', label: 'Curriculum', icon: ClipboardList },
  { href: '/admin/quizzes', label: 'Quizzes', icon: TrendingUp },
  { href: '/admin/submissions', label: 'Submissions', icon: ClipboardList },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/admin/announcements', label: 'Announcements', icon: Trophy },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

interface SidebarProps {
  user: { full_name: string; avatar_url: string | null; role: string; current_streak?: number } | null;
  completedDays: number;
}

export default function Sidebar({ user, completedDays }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin && pathname.startsWith('/admin') ? adminNav : internNav;
  const accentColor = isAdmin && pathname.startsWith('/admin') ? '#2238A4' : '#4A5DB5';
  const activeColor = '#2238A4';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 h-screen bg-white border-r fixed left-0 top-0 z-40 shadow-sm"
        style={{ borderColor: 'rgba(34, 56, 164, 0.1)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8 border-b" style={{ borderColor: 'rgba(34, 56, 164, 0.05)' }}>
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <QubitedgeLogo size={42} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'DM Sans', color: activeColor }}>
              qubitedge
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: activeColor }}>LMS Portal</p>
          </div>
        </div>

        {/* Admin / Intern toggle */}
        {isAdmin && (
          <div className="flex gap-1 mx-6 mt-6 p-1.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Link href="/dashboard" className="relative flex-1">
              {!pathname.startsWith('/admin') && (
                <motion.div layoutId="toggle" className="absolute inset-0 bg-white rounded-xl shadow-md border border-blue-50" />
              )}
              <span className={`relative z-10 block text-center py-2.5 rounded-xl text-xs font-black transition-colors 
                ${!pathname.startsWith('/admin') ? 'text-[#2238A4]' : 'text-slate-400'}`}>
                Intern
              </span>
            </Link>
            <Link href="/admin" className="relative flex-1">
              {pathname.startsWith('/admin') && (
                <motion.div layoutId="toggle" className="absolute inset-0 bg-white rounded-xl shadow-md border border-blue-50" />
              )}
              <span className={`relative z-10 block text-center py-2.5 rounded-xl text-xs font-black transition-colors 
                ${pathname.startsWith('/admin') ? 'text-[#2238A4]' : 'text-slate-400'}`}>
                Admin
              </span>
            </Link>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="relative block group">
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#4A5DB5]/10 rounded-2xl border-l-4 border-[#2238A4]" 
                  />
                )}
                <div className={`relative z-10 flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300
                  ${isActive ? 'text-[#2238A4]' : 'text-[#7182C7] hover:bg-slate-50 hover:text-[#4A5DB5]'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-white shadow-sm text-[#2238A4]' : 'bg-transparent text-current'}`}
                  >
                    <item.icon size={20} />
                  </motion.div>
                  <span className="tracking-tight">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Premium User Profile Card */}
        <div className="p-6 mt-auto">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group rounded-[2.5rem] p-6 transition-all duration-500 shadow-xl border overflow-hidden bg-white/50 backdrop-blur-xl"
            style={{ borderColor: 'rgba(34, 56, 164, 0.1)' }}
          >
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white text-lg font-black shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${activeColor})` }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </motion.div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm">
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-md font-black truncate text-[#1A1A2E]">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-50" style={{ color: activeColor }}>
                  {isAdmin ? 'Administrator' : 'Intern'}
                </p>
              </div>
            </div>

            {/* Micro Stats */}
            {!isAdmin && (
              <div className="flex items-center justify-between gap-2 mb-6 p-4 rounded-2xl bg-[#E9EEF9]/50 border border-white shadow-inner">
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7182C7] mb-1">Streak</p>
                  <p className="text-sm font-black text-[#1A1A2E] flex items-center justify-center gap-1">
                    <span className="text-orange-500">🔥</span>
                    {user?.current_streak || 0}
                  </p>
                </div>
                <div className="w-[1px] h-6 bg-slate-200" />
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7182C7] mb-1">Present</p>
                  <p className="text-sm font-black text-[#1A1A2E] flex items-center justify-center gap-1">
                    <span className="text-blue-500">✅</span>
                    {completedDays}
                  </p>
                </div>
              </div>
            )}

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-xs font-black transition-all bg-white hover:bg-rose-50 border shadow-sm group/logout text-rose-500 border-rose-100"
            >
              <LogOut size={14} className="group-hover/logout:-translate-x-1 transition-transform" />
              Sign Out
            </motion.button>
            
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-[#4A5DB5]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] blur-3xl"></div>
          </motion.div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-around py-4 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-slate-100">
        {internNav.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="relative flex-1 flex justify-center">
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav"
                  className="absolute inset-0 bg-[#4A5DB5]/10 rounded-2xl" 
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-1.5 py-2 px-4 transition-all duration-300
                ${isActive ? 'text-[#2238A4]' : 'text-[#7182C7]'}`}>
                <motion.div 
                  whileTap={{ scale: 0.8 }}
                  className={`transition-all duration-500 ${isActive ? 'drop-shadow-sm scale-110' : ''}`}
                >
                  <item.icon size={22} />
                </motion.div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
