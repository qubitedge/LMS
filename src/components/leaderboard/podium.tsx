import { LeaderboardEntry } from '@/types';
import { Flame } from 'lucide-react';

interface PodiumProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const getCardClasses = (rank: number, isCurrentUser: boolean) => {
  let baseClass = "flex flex-col items-center justify-end rounded-t-3xl border border-b-0 relative ";
  if (rank === 1) baseClass += "bg-[#C9A882]/10 border-[#C9A882]/30 pt-16 pb-8 ";
  if (rank === 2) baseClass += "bg-[#B0B0B0]/10 border-[#B0B0B0]/30 pt-10 pb-6 ";
  if (rank === 3) baseClass += "bg-[#C9A882]/5 border-[#C9A882]/15 pt-6 pb-4 ";
  return baseClass;
};

const getRankColor = (rank: number) => {
  if (rank === 1) return '#C9A882';
  if (rank === 2) return '#B0B0B0';
  if (rank === 3) return 'rgba(201, 168, 130, 0.7)';
  return '#2C2C2C';
};

const PodiumItem = ({ entry, rank, heightClass, currentUserId }: { entry?: LeaderboardEntry, rank: number, heightClass: string, currentUserId: string }) => {
  if (!entry) return <div className={`flex-1 ${heightClass}`}></div>;

  const isCurrentUser = entry.user_id === currentUserId;
  const rankColor = getRankColor(rank);

  return (
    <div className="flex-1 flex flex-col items-center justify-end">
      {/* User Info above podium */}
      <div className="flex flex-col items-center mb-4 z-10">
        <div 
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold border-4 mb-3 ${isCurrentUser ? 'ring-4 ring-[#40C4D0]/30' : ''}`}
          style={{ 
            borderColor: 'white',
            background: rankColor,
            color: 'white',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
          }}
        >
          {entry.full_name.charAt(0)}
          <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-white" style={{ background: '#2C2C2C', color: 'white' }}>
            {rank}
          </div>
        </div>
        <h3 className="font-bold text-sm md:text-base text-center truncate w-24 md:w-32" style={{ color: '#2C2C2C' }}>
          {entry.full_name.split(' ')[0]}
        </h3>
        <p className="text-xs font-medium text-center" style={{ color: '#7A7268' }}>{entry.domain || 'Intern'}</p>
      </div>

      {/* Podium Block */}
      <div className={`w-full ${heightClass} ${getCardClasses(rank, isCurrentUser)}`}>
        <p className="text-2xl font-bold font-mono mb-1" style={{ color: rankColor }}>
          {entry.score}
        </p>
        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-[#B8768A]">
          <Flame size={12} /> {entry.current_streak}
        </div>
      </div>
    </div>
  );
};

export default function Podium({ entries, currentUserId }: PodiumProps) {
  if (!entries || entries.length === 0) return null;

  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-4 h-[350px] px-2 border-b-4 border-[#2C2C2C]/5">
      <PodiumItem entry={second} rank={2} heightClass="h-[60%]" currentUserId={currentUserId} />
      <PodiumItem entry={first} rank={1} heightClass="h-[80%]" currentUserId={currentUserId} />
      <PodiumItem entry={third} rank={3} heightClass="h-[45%]" currentUserId={currentUserId} />
    </div>
  );
}
