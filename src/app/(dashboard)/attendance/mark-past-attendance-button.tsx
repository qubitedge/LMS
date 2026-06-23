'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { markPastAttendance } from './actions';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function MarkPastAttendanceButton({ date, eventId }: { date: string; eventId: string }) {
  const [loading, setLoading] = useState(false);

  const handleMark = async () => {
    setLoading(true);
    const result = await markPastAttendance(date, eventId);
    setLoading(false);

    if (result.success) {
      toast.success(`Successfully marked attendance for ${date}.`);
    } else {
      toast.error(result.message || 'Failed to mark attendance.');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMark}
      disabled={loading}
      className="h-8 text-xs font-bold rounded-xl border-blue-100 text-[#4A5DB5] hover:bg-blue-50"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Plus className="w-3 h-3 mr-1" />
      )}
      Mark
    </Button>
  );
}
