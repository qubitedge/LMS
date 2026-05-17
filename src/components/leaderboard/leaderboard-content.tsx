'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Star, CheckCircle2, 
  Search, Filter, ChevronRight, Crown,
  User, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  domain: string | null;
  role?: string;
  score: number;
}

interface LeaderboardContentProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export default function LeaderboardContent({ entries, currentUserId }: LeaderboardContentProps) {
  const [filter, setFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [filteredEntries, setFilteredEntries] = useState(entries);

  const domains = ['All', ...Array.from(new Set(entries.map(e => e.domain).filter(Boolean))) as string[]];

  useEffect(() => {
    let result = entries;
    if (filter) {
      result = result.filter(e => e.full_name.toLowerCase().includes(filter.toLowerCase()));
    }
    if (domainFilter !== 'All') {
      result = result.filter(e => e.domain === domainFilter);
    }
    setFilteredEntries(result);
  }, [filter, domainFilter, entries]);

  const top3 = entries.slice(0, 3);
  const remaining = filteredEntries.slice(filteredEntries[0]?.rank <= 3 ? 3 - (entries.indexOf(filteredEntries[0])) : 0);
  
  // Confetti for Rank 1 on mount
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-20 space-y-16">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge className="bg-[#E9EEF9] text-[#2238A4] px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] border border-blue-100">
          Seasonal Rankings
        </Badge>
        <h1 className="text-6xl font-black tracking-tighter text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display' }}>
          Leaderboard
        </h1>
        <p className="text-[#7182C7] font-bold text-xl max-w-2xl mx-auto">
          The most dedicated minds in the qubitedge ecosystem.
        </p>
      </motion.div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto px-4">
        {/* Rank 2 */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <PodiumCard entry={top3[1]} type="silver" isCurrentUser={top3[1].user_id === currentUserId} />
          </motion.div>
        )}

        {/* Rank 1 */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2"
          >
            <PodiumCard entry={top3[0]} type="gold" isCurrentUser={top3[0].user_id === currentUserId} />
          </motion.div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="order-3 md:order-3"
          >
            <PodiumCard entry={top3[2]} type="bronze" isCurrentUser={top3[2].user_id === currentUserId} />
          </motion.div>
        )}
      </div>

      {/* Table Section */}
      <Card className="qe-card border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl max-w-6xl mx-auto">
        <div className="p-8 border-b border-blue-50 bg-white/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7182C7]" size={20} />
              <Input 
                placeholder="Find a performer..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-blue-50 bg-white shadow-inner font-bold focus:ring-[#4A5DB5]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {domains.map(d => (
                <Button
                  key={d}
                  variant={domainFilter === d ? 'default' : 'outline'}
                  onClick={() => setDomainFilter(d)}
                  className={`h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                    ${domainFilter === d ? 'bg-[#2238A4] text-white shadow-lg' : 'bg-white text-[#7182C7] border-blue-50 hover:bg-blue-50'}`}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0ACDC]">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0ACDC]">Performer</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0ACDC] hidden md:table-cell">Expertise</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0ACDC]">Quiz Marks 📝</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A0ACDC]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry) => (
                    <motion.tr 
                      layout
                      key={entry.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`group transition-all hover:bg-[#E9EEF9]/30 ${entry.user_id === currentUserId ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <span className={`text-xl font-black ${entry.rank <= 3 ? 'text-[#2238A4]' : 'text-slate-400'}`}>
                             {entry.rank.toString().padStart(2, '0')}
                           </span>
                           {entry.rank <= 3 ? (
                             <Medal size={18} className={entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-400' : 'text-amber-600'} />
                           ) : (
                             <Minus size={14} className="text-slate-200" />
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#E9EEF9] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                            {entry.avatar_url ? (
                              <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="text-[#4A5DB5]" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-[#1A1A2E] text-md group-hover:text-[#2238A4] transition-colors">{entry.full_name}</p>
                            <p className="text-[10px] font-bold text-[#7182C7] md:hidden">{entry.domain || (entry.role === 'admin' ? 'Administrator' : 'Intern')}</p>
                            {entry.user_id === currentUserId && (
                              <Badge className="bg-blue-500 text-white text-[8px] h-4 mt-1">You</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-sm font-bold text-[#7182C7]">{entry.domain || (entry.role === 'admin' ? 'Administrator' : 'Intern')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-xl text-[#2238A4]">{entry.score.toLocaleString()}</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#4A5DB5]" style={{ width: `${Math.min(100, (entry.score / (entries[0]?.score || 1)) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-md transition-all">
                          <ChevronRight size={20} className="text-[#A0ACDC]" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PodiumCard({ entry, type, isCurrentUser }: { entry: LeaderboardEntry; type: 'gold' | 'silver' | 'bronze'; isCurrentUser: boolean }) {
  const styles = {
    gold: {
      card: 'bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-yellow-900/10 scale-110 -translate-y-8 z-10',
      avatar: 'border-yellow-400 ring-yellow-400/20 ring-8',
      rank: 'bg-yellow-500 shadow-yellow-500/50',
      icon: <Crown className="text-yellow-500 fill-yellow-500" size={32} />,
      label: 'Grand Champion',
      glow: 'bg-yellow-400/20'
    },
    silver: {
      card: 'bg-white border-slate-200 shadow-slate-900/5 z-0',
      avatar: 'border-slate-300 ring-slate-300/10 ring-8',
      rank: 'bg-slate-400 shadow-slate-400/50',
      icon: <Medal className="text-slate-400" size={28} />,
      label: 'Silver Contender',
      glow: 'bg-slate-400/10'
    },
    bronze: {
      card: 'bg-white border-orange-100 shadow-orange-900/5 z-0',
      avatar: 'border-orange-200 ring-orange-200/10 ring-8',
      rank: 'bg-orange-600 shadow-orange-600/50',
      icon: <Medal className="text-orange-600" size={28} />,
      label: 'Bronze Master',
      glow: 'bg-orange-600/10'
    }
  }[type];

  return (
    <motion.div 
      whileHover={{ y: type === 'gold' ? -15 : -10 }}
      className={`relative p-8 rounded-[3rem] border-2 shadow-2xl transition-all duration-500 group ${styles.card}`}
    >
      <div className={`absolute inset-0 blur-[4rem] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${styles.glow}`} />
      
      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        <div className="relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
            {styles.icon}
          </div>
          <div className={`w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 shadow-2xl ${styles.avatar}`}>
            {entry.avatar_url ? (
              <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#E9EEF9] flex items-center justify-center">
                 <User className="text-[#4A5DB5]" size={40} />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${styles.rank}`}>
            #{entry.rank}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight group-hover:text-[#2238A4] transition-colors">{entry.full_name}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7182C7] mt-1">{styles.label}</p>
        </div>

        <div className="w-full h-[1px] bg-blue-50" />

        <div className="grid grid-cols-2 gap-4 w-full">
           <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-1">Score</p>
              <p className="text-xl font-black text-[#2238A4]">{entry.score.toLocaleString()}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A0ACDC] mb-1">Domain</p>
              <p className="text-[10px] font-black text-[#1A1A2E] truncate">
                {entry.domain || (entry.role === 'admin' ? 'Administrator' : 'Intern')}
              </p>
           </div>
        </div>

        {isCurrentUser && (
          <Badge className="bg-[#2238A4] text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/30">
            You are here
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
