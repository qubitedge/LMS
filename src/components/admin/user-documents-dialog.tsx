'use client';

import { useState } from 'react';
import { FileText, Loader2, Upload, X, CheckCircle2, Download } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserDocumentsDialogProps {
  user: {
    id: string;
    full_name: string;
    offer_letter_url?: string;
    certificate_url?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDocumentsDialog({ user, open, onOpenChange }: UserDocumentsDialogProps) {
  const [isUploading, setIsUploading] = useState<'offer' | 'cert' | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (file: File, type: 'offer' | 'cert') => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    setIsUploading(type);
    try {
      const fileExt = 'pdf';
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      const bucket = 'documents';

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // 3. Update Profile
      const updateData = type === 'offer' 
        ? { offer_letter_url: publicUrl } 
        : { certificate_url: publicUrl };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success(`${type === 'offer' ? 'Offer Letter' : 'Certificate'} uploaded successfully.`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document.');
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl">
        <div className="h-24 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10">
          <DialogTitle className="text-2xl font-black text-white">Manage Documents</DialogTitle>
        </div>
        
        <div className="p-10 space-y-8">
          <div>
            <h3 className="text-sm font-black text-[#1A1A2E] mb-2 uppercase tracking-wider">User: {user.full_name}</h3>
            <p className="text-xs text-[#7182C7] font-bold">Upload and manage official documents for this intern.</p>
          </div>

          <div className="space-y-6">
            {/* Offer Letter Section */}
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-black text-[#1A1A2E] text-sm">Offer Letter</p>
                    <p className="text-[10px] font-bold text-[#7182C7] uppercase">PDF Format</p>
                  </div>
                </div>
                {user.offer_letter_url && (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                )}
              </div>

              {user.offer_letter_url ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl border-slate-200 text-xs font-black text-[#4A5DB5]"
                    onClick={() => window.open(user.offer_letter_url, '_blank')}
                  >
                    <Download size={14} className="mr-2" /> View Current
                  </Button>
                  <label className="flex-1">
                    <div className={`h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#7182C7] cursor-pointer hover:bg-slate-50 transition-colors ${isUploading === 'offer' ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploading === 'offer' ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                      Replace
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'offer')}
                    />
                  </label>
                </div>
              ) : (
                <label className="block">
                  <div className={`h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#4A5DB5] cursor-pointer hover:border-[#4A5DB5] transition-all ${isUploading === 'offer' ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading === 'offer' ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                    Upload Offer Letter
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'offer')}
                  />
                </label>
              )}
            </div>

            {/* Certificate Section */}
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-black text-[#1A1A2E] text-sm">Completion Certificate</p>
                    <p className="text-[10px] font-bold text-[#7182C7] uppercase">PDF Format</p>
                  </div>
                </div>
                {user.certificate_url && (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                )}
              </div>

              {user.certificate_url ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl border-slate-200 text-xs font-black text-[#4A5DB5]"
                    onClick={() => window.open(user.certificate_url, '_blank')}
                  >
                    <Download size={14} className="mr-2" /> View Current
                  </Button>
                  <label className="flex-1">
                    <div className={`h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#7182C7] cursor-pointer hover:bg-slate-50 transition-colors ${isUploading === 'cert' ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploading === 'cert' ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                      Replace
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'cert')}
                    />
                  </label>
                </div>
              ) : (
                <label className="block">
                  <div className={`h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-[#4A5DB5] cursor-pointer hover:border-[#4A5DB5] transition-all ${isUploading === 'cert' ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading === 'cert' ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                    Upload Certificate
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'cert')}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-14 w-full rounded-2xl border-slate-200 font-black text-[#7182C7]"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
