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

export default function ProjectReviewDialog({ submission }: { submission: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleReview = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/projects/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          status,
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-8">
          Review
        </Button>
      </DialogTrigger>
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
