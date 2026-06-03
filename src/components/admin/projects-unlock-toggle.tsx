'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LockOpen, Lock, Loader2 } from 'lucide-react';

export default function ProjectsUnlockToggle({ isUnlocked }: { isUnlocked: boolean }) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/toggle-projects-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlocked: !unlocked }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setUnlocked(!unlocked);
      toast.success(!unlocked ? 'Projects unlocked for all interns!' : 'Projects locked for interns.');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border
        ${unlocked
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
        }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : unlocked ? (
        <LockOpen size={16} />
      ) : (
        <Lock size={16} />
      )}
      {loading ? 'Updating...' : unlocked ? 'Projects Unlocked' : 'Projects Locked'}
    </button>
  );
}
