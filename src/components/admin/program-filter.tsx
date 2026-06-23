'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface ProgramFilterProps {
  events: { id: string; title: string }[];
  currentEventId?: string;
}

export default function ProgramFilter({ events, currentEventId = '' }: ProgramFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProgramChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('eventId', value);
    } else {
      params.delete('eventId');
    }
    params.delete('page'); // Reset to page 0
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-xs group">
      <Select onValueChange={handleProgramChange} defaultValue={currentEventId || 'all'}>
        <SelectTrigger className="h-12 rounded-2xl border-white/40 bg-white/50 backdrop-blur-md shadow-sm font-bold focus:ring-[#4A5DB5] focus:bg-white/80 transition-all text-[#1A1A2E] pl-10 relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7182C7]" size={16} />
          <SelectValue placeholder="All Programs" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white p-2">
          <SelectItem value="all" className="rounded-xl font-bold py-2.5 hover:bg-slate-50">All Programs</SelectItem>
          {events.map((e) => (
            <SelectItem key={e.id} value={e.id} className="rounded-xl font-bold py-2.5 hover:bg-slate-50">
              {e.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
