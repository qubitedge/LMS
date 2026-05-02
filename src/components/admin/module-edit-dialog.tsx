'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2, Calendar, Edit3, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ModuleEditDialogProps {
  eventId: string;
  module?: any;
}

export default function ModuleEditDialog({ eventId, module }: ModuleEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: module?.title || '',
    week_number: module?.week_number || 1,
    start_date: module?.start_date || '',
    end_date: module?.end_date || '',
    is_visible: module?.is_visible ?? true,
    domain: module?.domain || 'Intern',
  });

  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this module? This will also remove all days and content within it.')) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/modules?id=${module.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete module');

      toast.success('Module deleted successfully');
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
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, event_id: eventId, id: module?.id }),
      });

      if (!res.ok) throw new Error('Failed to save module');

      toast.success(module ? 'Module updated!' : 'Module added!');
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
        module ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
            <Edit3 size={14} className="text-[#7182C7]" />
          </Button>
        ) : (
          <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-[#7182C7] font-bold hover:bg-slate-50 transition-all">
            <Plus size={16} className="mr-2" />
            Add Module
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="h-24 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10">
          <DialogTitle className="text-2xl font-black text-white">{module ? 'Edit Module' : 'Add Module'}</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Module Title</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Week 1: Foundations"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Index</Label>
                <Input 
                  type="number"
                  value={formData.week_number}
                  onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold focus:bg-white transition-all text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Start Date</Label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">End Date</Label>
                <Input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                {formData.is_visible ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-slate-400" />}
                <div>
                  <p className="text-sm font-black text-[#1A1A2E]">Visibility</p>
                  <p className="text-[10px] font-bold text-[#7182C7]">Control if interns can see this module</p>
                </div>
              </div>
              <Button 
                type="button"
                variant={formData.is_visible ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
                className={`h-10 px-4 rounded-xl font-black text-xs transition-all ${formData.is_visible ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              >
                {formData.is_visible ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-14 rounded-2xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-md shadow-xl shadow-blue-500/20 mt-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Calendar size={18} className="mr-2" />}
              {isLoading ? 'Saving...' : module ? 'Update Module' : 'Add Module'}
            </Button>
            {module && (
              <Button 
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                variant="outline"
                className="h-14 w-14 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 mt-2 transition-all"
              >
                <Trash2 size={20} />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
