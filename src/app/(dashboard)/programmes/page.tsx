'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, CheckCircle2, ArrowRight, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  external_link: string | null;
  created_at: string;
  weeks: any[];
}

export default function ProgrammesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*, weeks(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const getEventStatus = (event: Event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!event.weeks || event.weeks.length === 0) return 'NEW';

    const dates = event.weeks.map((w: any) => ({
      start: w.start_date ? new Date(w.start_date) : null,
      end: w.end_date ? new Date(w.end_date) : null
    }));

    const allPast = dates.every((d: any) => d.end && d.end < today);
    if (allPast) return 'ENDED';

    const anyRunning = dates.some((d: any) => 
      (d.start && d.start <= today) && (!d.end || d.end >= today)
    );
    if (anyRunning) return 'RUNNING';

    const allFuture = dates.every((d: any) => d.start && d.start > today);
    if (allFuture) return 'UPCOMING';

    return 'ACTIVE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'UPCOMING': return 'bg-[#4A5DB5] text-white shadow-blue-200';
      case 'ENDED': return 'bg-slate-400 text-white shadow-slate-200';
      default: return 'bg-orange-500 text-white shadow-orange-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#4A5DB5] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="relative mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10"
        >
          <h1 className="text-6xl font-black text-[#1A1A2E] tracking-tighter italic">
            Training Programmes
          </h1>
          <p className="text-xl font-bold text-[#7182C7] mt-2">
            Explore and master the industry's most advanced technologies.
          </p>
        </motion.div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#4A5DB5]/5 blur-3xl rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {events.map((event, idx) => {
          const status = getEventStatus(event);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="h-full bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 border border-slate-50 flex flex-col transition-all duration-500 group-hover:shadow-blue-900/15 group-hover:border-[#4A5DB5]/20">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#4A5DB5] group-hover:bg-[#4A5DB5] group-hover:text-white transition-all duration-500">
                    <BookOpen size={32} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${getStatusColor(status)}`}>
                    {status}
                  </div>
                </div>

                <h3 className="text-3xl font-black text-[#1A1A2E] mb-4 tracking-tight leading-tight italic">
                  {event.title}
                </h3>
                <p className="text-sm font-bold text-[#7182C7] mb-8 line-clamp-3">
                  {event.description || 'Elevate your skills with this comprehensive industry-standard training program.'}
                </p>

                <div className="mt-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-2 text-[#A0ACDC] mb-1">
                        <TrendingUp size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Modules</span>
                      </div>
                      <p className="text-lg font-black text-[#1A1A2E]">{event.weeks?.length || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-2 text-[#A0ACDC] mb-1">
                        <Clock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Type</span>
                      </div>
                      <p className="text-lg font-black text-[#1A1A2E]">Live</p>
                    </div>
                  </div>

                  {event.external_link ? (
                    <a href={event.external_link} target={event.external_link.startsWith('http') ? "_blank" : "_self"} className="block">
                      <button className={`w-full h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-500 shadow-sm ${event.title === 'Quantum Workshop' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#E9EEF9] text-[#4A5DB5] hover:bg-[#4A5DB5] hover:text-white hover:shadow-blue-500/20'}`}>
                        {event.title === 'Quantum Workshop' ? 'Event Ended' : 'View Curriculum'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </a>
                  ) : (
                    <Link href="/progress" className="block">
                      <button className="w-full h-16 rounded-2xl bg-[#E9EEF9] text-[#4A5DB5] font-black flex items-center justify-center gap-3 group-hover:bg-[#4A5DB5] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-500/20">
                        View Curriculum
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  )}
                </div>

                {/* Decorative background element */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#4A5DB5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-xl" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
