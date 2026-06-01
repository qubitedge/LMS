'use client';

import { Menu, User as UserIcon, Shield, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface TopbarProps {
  user: { full_name: string; avatar_url: string | null; role: string } | null;
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const isViewingAdmin = pathname.startsWith('/admin');
  const accentColor = isAdmin && isViewingAdmin ? '#2238A4' : '#4A5DB5';

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-40"
      style={{ borderColor: 'rgba(34, 56, 164, 0.1)' }}>
      <div className="flex items-center gap-2">
        <Image 
          src="/logo.jpg" 
          width={28} 
          height={28} 
          alt="Qubitedge"
          priority
          className="rounded-lg object-cover"
        />
        <h1 className="text-base font-bold" style={{ fontFamily: 'DM Sans', color: accentColor }}>
          qubitedge
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 mr-2">
            <Link href="/dashboard" className="relative px-3 py-1.5 rounded-lg overflow-hidden">
              {!isViewingAdmin && (
                <motion.div layoutId="mobile-toggle" className="absolute inset-0 bg-white shadow-sm border border-blue-100 rounded-lg" />
              )}
              <span className={`relative z-10 text-[10px] font-black uppercase tracking-tight transition-colors ${!isViewingAdmin ? 'text-[#2238A4]' : 'text-slate-400'}`}>
                Intern
              </span>
            </Link>
            <Link href="/admin" className="relative px-3 py-1.5 rounded-lg overflow-hidden">
              {isViewingAdmin && (
                <motion.div layoutId="mobile-toggle" className="absolute inset-0 bg-white shadow-sm border border-blue-100 rounded-lg" />
              )}
              <span className={`relative z-10 text-[10px] font-black uppercase tracking-tight transition-colors ${isViewingAdmin ? 'text-[#2238A4]' : 'text-slate-400'}`}>
                Admin
              </span>
            </Link>
          </div>
        )}
        
        <Link href="/profile" className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #2238A4)` }}>
          {user?.full_name?.charAt(0) || 'U'}
        </Link>
      </div>
    </header>
  );
}
