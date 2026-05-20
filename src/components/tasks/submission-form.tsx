'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Code, FileText, Loader2, FileArchive, User } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfileName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.full_name) {
            setStudentName(profile.full_name);
          } else if (user.email) {
            // Fallback to name parsed from email
            const parsedName = user.email.split('@')[0]
              .split('.')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
            setStudentName(parsedName);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile name:', err);
      }
    };

    fetchProfileName();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let res;

      // Handle file upload
      if ((activeTab === 'pdf' || activeTab === 'zip')) {
        if (!file) throw new Error('Please upload a file');
        if (!studentName.trim()) throw new Error('Please enter your name');

        const formData = new FormData();
        formData.append('taskId', taskId);
        formData.append('format', activeTab);
        formData.append('file', file);
        formData.append('studentName', studentName.trim());

        res = await fetch('/api/tasks/submit', {
          method: 'POST',
          body: formData, // Send as multipart/form-data
        });
      } else {
        if (!content.trim()) throw new Error('Please provide submission content');

        res = await fetch('/api/tasks/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            format: activeTab,
            content: content.trim(),
          }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      toast.success('Task submitted successfully!');
      setFile(null);
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
        <TabsList className="w-full grid grid-cols-4 bg-[#FAFAFA] border h-12 rounded-xl" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
          <TabsTrigger value="github" disabled={!acceptedFormats.includes('github')} className="data-[state=active]:bg-[#40C4D0] data-[state=active]:text-white rounded-lg transition-colors">
            <Code size={16} className="mr-2 hidden sm:inline" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="pdf" disabled={!acceptedFormats.includes('pdf')} className="data-[state=active]:bg-[#40C4D0] data-[state=active]:text-white rounded-lg transition-colors">
            <FileText size={16} className="mr-2 hidden sm:inline" /> Document
          </TabsTrigger>
          <TabsTrigger value="zip" disabled={!acceptedFormats.includes('zip')} className="data-[state=active]:bg-[#40C4D0] data-[state=active]:text-white rounded-lg transition-colors">
            <FileArchive size={16} className="mr-2 hidden sm:inline" /> ZIP
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

          <TabsContent value="pdf" className="m-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name-pdf" className="text-sm font-bold flex items-center gap-2" style={{ color: '#2C2C2C' }}>
                <User size={16} className="text-[#40C4D0]" /> Your Full Name (for Google Drive record)
              </Label>
              <Input
                id="student-name-pdf"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="rounded-xl border-[1.5px] h-12"
                style={{ borderColor: 'rgba(201,168,130,0.4)', background: '#FAFAFA' }}
              />
            </div>
            
            <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-gray-50 relative"
              style={{ borderColor: '#40C4D0' }}>
              <Input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={40} className="mx-auto text-[#40C4D0] mb-4" />
              <p className="text-sm font-medium mb-1" style={{ color: '#2C2C2C' }}>
                {file ? file.name : 'Click or drag document to upload'}
              </p>
              <p className="text-xs" style={{ color: '#7A7268' }}>Supports: PDF, Word, Excel, PPT, CSV (Max 10MB)</p>
            </div>
          </TabsContent>

          <TabsContent value="zip" className="m-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name-zip" className="text-sm font-bold flex items-center gap-2" style={{ color: '#2C2C2C' }}>
                <User size={16} className="text-[#40C4D0]" /> Your Full Name (for Google Drive record)
              </Label>
              <Input
                id="student-name-zip"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="rounded-xl border-[1.5px] h-12"
                style={{ borderColor: 'rgba(201,168,130,0.4)', background: '#FAFAFA' }}
              />
            </div>

            <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-gray-50 relative"
              style={{ borderColor: '#40C4D0' }}>
              <Input
                type="file"
                accept=".zip,.rar"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileArchive size={40} className="mx-auto text-[#40C4D0] mb-4" />
              <p className="text-sm font-medium mb-1" style={{ color: '#2C2C2C' }}>
                {file ? file.name : 'Click or drag ZIP archive to upload'}
              </p>
              <p className="text-xs" style={{ color: '#7A7268' }}>Max file size 50MB</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Button 
        type="submit" 
        disabled={isSubmitting || (['pdf', 'zip'].includes(activeTab) && (!file || !studentName.trim())) || (['github', 'text'].includes(activeTab) && !content.trim())}
        className="btn-primary w-full h-12 text-md"
      >
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting to Drive...</>
        ) : (
          'Submit Task'
        )}
      </Button>
    </form>
  );
}
