'use client';

import { useState } from 'react';
import { ProjectData } from '@/data/projects';
import { ProjectSubmission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button as UIButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Clock, Github, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: ProjectData;
  submission?: ProjectSubmission;
  onSubmissionComplete: () => void;
}

export default function ProjectCard({ project, submission, onSubmissionComplete }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !githubUrl.includes('github.com')) {
      toast.error('Please enter a valid GitHub repository URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.title,
          githubUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      toast.success('Project submitted successfully!');
      setIsOpen(false);
      onSubmissionComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl text-primary font-bold">{project.title}</CardTitle>
          {submission && (
            <Badge 
              variant={submission.status === 'approved' ? 'default' : 'secondary'}
              className={submission.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500/20 text-yellow-700'}
            >
              {submission.status === 'approved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
              {submission.status.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Features</h4>
          <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
            {project.features.map((feature, i) => <li key={i}>{feature}</li>)}
          </ul>
        </div>

        <div className="flex gap-4">
          {project.pythonConcepts && (
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Python Skills</h4>
              <div className="flex flex-wrap gap-1">
                {project.pythonConcepts.map((concept, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{concept}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">SQL Skills</h4>
            <div className="flex flex-wrap gap-1">
              {project.sqlConcepts.map((concept, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{concept}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Required Tables</h4>
          <div className="flex flex-wrap gap-1">
            {project.tables.map((table, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-mono">{table}</Badge>
            ))}
          </div>
        </div>

        {project.bonus && (
          <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800 flex items-start gap-2">
            <Star className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
            <p><strong>Bonus:</strong> {project.bonus}</p>
          </div>
        )}

        {project.relevance && (
          <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-emerald-800 flex items-start gap-2">
            <Star className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
            <p><strong>Real-World Relevance:</strong> {project.relevance}</p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100">
          {submission ? (
            <div className="flex items-center justify-between text-sm">
              <a href={submission.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <Github className="w-4 h-4" />
                View Submission
              </a>
              <span className="text-slate-400">
                {new Date(submission.submitted_at).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger render={
                <UIButton className="w-full gap-2 group">
                  <Github className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Submit Project
                </UIButton>
              } />
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Submit {project.title}</DialogTitle>
                    <DialogDescription>
                      Please provide the link to your public GitHub repository containing this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <label className="text-sm font-medium mb-2 block">GitHub Repository URL</label>
                    <Input 
                      placeholder="https://github.com/username/project-repo" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <UIButton type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</UIButton>
                    <UIButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Link'}
                    </UIButton>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
