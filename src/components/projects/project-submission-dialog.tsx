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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProjectData } from '@/lib/projects-data';

export default function ProjectSubmissionDialog({ project, submission }: { project: ProjectData, submission?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      toast.error('GitHub URL is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          githubUrl: githubUrl.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit project');
      }

      toast.success('Project submitted successfully!');
      setIsOpen(false);
      setGithubUrl('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submission?.status === 'approved') {
    return (
      <div className="w-full bg-emerald-50 text-emerald-700 py-3 px-4 rounded-xl shadow-sm text-center font-medium border border-emerald-200">
        🎉 Congratulations! Your project has been approved.
      </div>
    );
  }

  if (submission) {
    return (
      <div className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-xl shadow-sm text-center font-medium border border-blue-200">
        ✅ Submitted ({submission.status})
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button className="w-full bg-[#40C4D0] hover:bg-[#35A5B0] text-white rounded-xl shadow-sm">
          Submit Project
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            Submit: {project.name}
          </DialogTitle>
          <DialogDescription style={{ color: '#7A7268' }}>
            Push your project folder to GitHub and provide the repository URL below. 
            Make sure your repository includes a README with your schema and follows the suggested folder structure.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="githubUrl" className="font-bold flex items-center gap-2">
              <Code size={18} /> GitHub Repository URL
            </Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/username/project-repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="rounded-xl border-[1.5px] h-12"
              style={{ borderColor: 'rgba(201,168,130,0.4)', background: '#FAFAFA' }}
              disabled={isSubmitting}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !githubUrl.trim()}
            className="w-full h-12 rounded-xl bg-[#2238A4] hover:bg-[#1A2A7A] text-white"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              'Submit Project'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
