'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit3, Loader2, Save, BookOpen, User, Video, Link as LinkIcon, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DayEditDialogProps {
  day: {
    id: string;
    day_number: number;
    topic: string;
    description: string | null;
    tutor_name: string | null;
    video_url: string | null;
    resource_link: string | null;
    sub_topics?: string | null;
  };
  children?: React.ReactNode;
}

export default function DayEditDialog({ day, children }: DayEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: day.topic,
    description: day.description || '',
    tutor_name: day.tutor_name || '',
    video_url: day.video_url || '',
    resource_link: day.resource_link || '',
    sub_topics: day.sub_topics || '',
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('days')
        .update(formData)
        .eq('id', day.id);

      if (error) throw error;

      toast.success('Module updated successfully!');
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
      <DialogTrigger 
        render={
          children || (
            <button className="p-3 rounded-xl bg-white border border-slate-100 text-[#7182C7] hover:text-[#4A5DB5] hover:border-[#4A5DB5]/30 transition-all shadow-sm">
              <Edit3 size={18} />
            </button>
          )
        }
      />
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="h-32 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10">
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Edit Module</DialogTitle>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Day {day.day_number} Curriculum Update</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Topic Title</Label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    name="topic"
                    value={formData.topic} 
                    onChange={handleChange} 
                    required
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Sub-Topics</Label>
                <div className="relative">
                  <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    name="sub_topics"
                    value={formData.sub_topics} 
                    onChange={handleChange} 
                    placeholder="e.g. Loops, Conditions, Variables"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Description</Label>
                <Textarea 
                  name="description"
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="What will interns learn in this module?"
                  className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 p-6 font-bold focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Instructor Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                    <Input 
                      name="tutor_name"
                      value={formData.tutor_name} 
                      onChange={handleChange} 
                      placeholder="e.g. Navya"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Video URL (YouTube)</Label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                    <Input 
                      name="video_url"
                      value={formData.video_url} 
                      onChange={handleChange} 
                      placeholder="https://youtube.com/..."
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">External Resource Link</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0ACDC]" size={18} />
                  <Input 
                    name="resource_link"
                    value={formData.resource_link} 
                    onChange={handleChange} 
                    placeholder="https://github.com/..."
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 font-bold focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 rounded-[1.5rem] bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-lg shadow-xl shadow-blue-500/20 mt-4 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              {isLoading ? 'Updating Module...' : 'Save Curriculum Changes'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
