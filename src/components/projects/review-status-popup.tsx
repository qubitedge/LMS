'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ReviewStatusPopup() {
  const [submission, setSubmission] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSubmission = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('has_seen_review', false)
        .neq('status', 'pending')
        .order('reviewed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSubmission(data);
        setIsOpen(true);
      }
    };

    fetchSubmission();
  }, []);

  const handleClose = async () => {
    setIsOpen(false);
    if (submission) {
      await supabase
        .from('project_submissions')
        .update({ has_seen_review: true })
        .eq('id', submission.id);
    }
  };

  if (!submission) return null;

  const isApproved = submission.status === 'approved';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isApproved ? (
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <XCircle size={32} />
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-2xl" style={{ fontFamily: 'Playfair Display' }}>
            {isApproved ? 'Project Approved!' : 'Project Rejected'}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {isApproved 
              ? 'Congratulations! Your project has been approved. Get ready for the capstone.' 
              : 'Your project has been rejected. Please review the feedback and try again.'}
          </DialogDescription>
        </DialogHeader>

        {submission.admin_comment && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Info size={16} className="text-[#40C4D0]" /> Admin Feedback
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{submission.admin_comment}</p>
          </div>
        )}

        <div className="mt-6">
          <Button 
            onClick={handleClose}
            className="w-full rounded-xl h-12 bg-[#2238A4] hover:bg-[#1A2A7A] text-white"
          >
            Acknowledge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
