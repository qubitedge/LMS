'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, BookOpen, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EventEditDialogProps {
  event?: any;
}

export default function EventEditDialog({ event }: EventEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    is_active: event?.is_active ?? true,
  });

  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('CRITICAL: Are you sure you want to delete this event? This will permanently remove ALL modules, days, and content associated with it.')) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/events?id=${event.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete event');

      toast.success('Event deleted successfully');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: event?.id }),
      });

      if (!res.ok) throw new Error('Failed to save event');

      toast.success(event ? 'Event updated!' : 'Event created!');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        event ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
            <Edit3 size={18} className="text-[#7182C7]" />
          </Button>
        ) : (
          <Button className="h-14 px-8 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
            <Plus size={20} className="mr-2" />
            New Event
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="h-32 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10">
          <DialogTitle className="text-3xl font-black text-white">{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Event Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Applied AI Bootcamp"
                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-bold focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Description</Label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe the event..."
                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-bold focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                {formData.is_active ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-slate-400" />}
                <div>
                  <p className="text-sm font-black text-[#1A1A2E]">Event Visibility</p>
                  <p className="text-[10px] font-bold text-[#7182C7]">Hide or show this entire programme</p>
                </div>
              </div>
              <Button 
                type="button"
                variant={formData.is_active ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`h-10 px-4 rounded-xl font-black text-xs transition-all ${formData.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              >
                {formData.is_active ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-16 rounded-[1.5rem] bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-lg shadow-xl shadow-blue-500/20 mt-4 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <BookOpen size={20} className="mr-2" />}
              {isLoading ? 'Saving...' : event ? 'Update Event' : 'Deploy Event'}
            </Button>
            {event && (
              <Button 
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                variant="outline"
                className="h-16 w-16 rounded-[1.5rem] border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 mt-4 transition-all shadow-sm"
              >
                <Trash2 size={24} />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
