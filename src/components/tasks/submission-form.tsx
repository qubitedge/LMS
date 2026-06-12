'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SubmissionFormat } from '@/types';

interface SubmissionFormProps {
  taskId: string;
  acceptedFormats: string[];
}

export default function SubmissionForm({ taskId, acceptedFormats }: SubmissionFormProps) {
  const [activeTab, setActiveTab] = useState<SubmissionFormat>(
    (acceptedFormats[0] as SubmissionFormat) || 'github'
  );
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!content.trim()) throw new Error('Please provide submission content');

      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          format: activeTab,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      toast.success('Task submitted successfully!');
      setContent('');
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SubmissionFormat)}>
        <TabsList className="w-full grid grid-cols-2 bg-[#FAFAFA] border h-12 rounded-xl" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
          <TabsTrigger value="github" disabled={!acceptedFormats.includes('github')} className="data-[state=active]:bg-[#40C4D0] data-[state=active]:text-white rounded-lg transition-colors">
            <Code size={16} className="mr-2 hidden sm:inline" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="text" disabled={!acceptedFormats.includes('text')} className="data-[state=active]:bg-[#40C4D0] data-[state=active]:text-white rounded-lg transition-colors">
            <FileText size={16} className="mr-2 hidden sm:inline" /> Text
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="github" className="m-0">
            <div className="space-y-3">
              <Label htmlFor="github-url">GitHub Repository URL</Label>
              <Input
                id="github-url"
                placeholder="https://github.com/username/repo"
                value={activeTab === 'github' ? content : ''}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-xl border-[1.5px] h-12"
                style={{ borderColor: 'rgba(201,168,130,0.4)', background: '#FAFAFA' }}
              />
            </div>
          </TabsContent>

          <TabsContent value="text" className="m-0">
            <div className="space-y-3">
              <Label htmlFor="text-content">Submission Text</Label>
              <Textarea
                id="text-content"
                placeholder="Write your submission here..."
                value={activeTab === 'text' ? content : ''}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-xl border-[1.5px] min-h-[150px]"
                style={{ borderColor: 'rgba(201,168,130,0.4)', background: '#FAFAFA' }}
              />
            </div>
          </TabsContent>


        </div>
      </Tabs>

      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
        className="btn-primary w-full h-12 text-md"
      >
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
        ) : (
          'Submit Task'
        )}
      </Button>
    </form>
  );
}
