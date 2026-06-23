'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MarkAttendanceButton({ disabled, eventId }: { disabled?: boolean; eventId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAttendance = async () => {
    if (disabled) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark attendance');
      }

      toast.success('Attendance marked successfully!');
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleMarkAttendance} 
      disabled={isLoading || disabled}
      className={`w-full max-w-[240px] h-14 rounded-2xl text-md font-black shadow-xl transition-all 
        ${disabled 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
          : 'bg-[#4A5DB5] hover:bg-[#2238A4] text-white shadow-blue-500/20 hover:scale-[1.02] active:scale-95'}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Verifying...
        </>
      ) : (
        disabled ? 'Window Closed' : 'Mark Attendance'
      )}
    </Button>
  );
}
