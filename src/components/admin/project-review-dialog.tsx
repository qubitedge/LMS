'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Code, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProjectReviewDialog({ submission }: { submission: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminComment, setAdminComment] = useState(submission.admin_comment || '');
  const [score, setScore] = useState<string>(submission.score !== null && submission.score !== undefined ? String(submission.score) : '');
  const router = useRouter();

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (status === 'approved' && score !== '' && (Number(score) < 0 || Number(score) > 10)) {
      toast.error('If provided, score must be between 0 and 10.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/projects/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          status,
          adminComment,
          score: status === 'approved' && score !== '' ? Number(score) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update submission status');

      toast.success(`Submission ${status} successfully!`);
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="text-xs h-8">
          Review
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            Review Project
          </DialogTitle>
          <DialogDescription>
            {submission.profiles?.full_name} - {submission.project_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="p-4 bg-gray-50 rounded-xl border">
            <h4 className="text-sm font-bold text-gray-700 mb-2">GitHub Repository</h4>
            <a 
              href={submission.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#40C4D0] hover:underline bg-white p-3 rounded-lg border border-gray-200"
            >
              <Code size={18} />
              <span className="truncate flex-1">{submission.github_url}</span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">Admin Comment (Optional)</Label>
            <Textarea
              placeholder="e.g. Needs enhancements on the styling..."
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              disabled={isUpdating}
              className="resize-none h-24 bg-white rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">Score (out of 10) - Optional</Label>
            <Input
              type="number"
              min="0"
              max="10"
              placeholder="e.g. 8"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              disabled={isUpdating}
              className="bg-white rounded-xl border-gray-200"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => handleReview('approved')}
              disabled={isUpdating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
            >
              {isUpdating ? <Loader2 className="animate-spin h-5 w-5" /> : <><CheckCircle2 className="mr-2" /> Approve</>}
            </Button>
            <Button 
              onClick={() => handleReview('rejected')}
              disabled={isUpdating}
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-12"
            >
              {isUpdating ? <Loader2 className="animate-spin h-5 w-5" /> : <><XCircle className="mr-2" /> Reject</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
