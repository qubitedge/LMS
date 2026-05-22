'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Loader2, 
  Check, 
  X, 
  ExternalLink, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  FolderArchive,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SubmissionReviewDialog({ submission }: { submission: any }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  
  const router = useRouter();

  const handleReview = async (status: 'approved' | 'rejected') => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submission.id, status, feedback }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to review submission');
      }

      toast.success(`Submission marked as ${status}`);
      setOpen(false);
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert links to embed preview URLs
  const getEmbedUrl = (format: string, url: string, content: string): string | null => {
    let targetUrl = url || '';
    
    // If it's a github format but submitted in the content field, let's treat content as the URL
    if (format === 'github' && content && content.startsWith('http')) {
      targetUrl = content;
    }

    if (!targetUrl) return null;

    // Google Drive File (Standard or PDF view)
    const driveFileMatch = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileMatch && driveFileMatch[1]) {
      return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
    }

    // Google Spreadsheets
    const sheetMatch = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch && sheetMatch[1]) {
      return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
    }

    // Google Docs
    const docMatch = targetUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
    }

    // Google Presentation/Slides
    const slideMatch = targetUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slideMatch && slideMatch[1]) {
      return `https://docs.google.com/presentation/d/${slideMatch[1]}/preview`;
    }

    // PDF direct links (Supabase Storage or external direct PDFs)
    if (targetUrl.toLowerCase().endsWith('.pdf') || format === 'pdf') {
      return targetUrl;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(submission.format, submission.file_path, submission.content);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="sm" className="h-8 px-2 text-[#40C4D0] hover:text-[#32B0BC] hover:bg-[#40C4D0]/10">
          <Eye size={16} className="mr-1" /> View
        </Button>
      } />
      
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[85vh] rounded-2xl border-none p-0 overflow-hidden bg-white flex flex-col md:flex-row shadow-2xl">
        
        {/* LEFT COLUMN: INTERACTIVE PREVIEW PANEL (65% width) */}
        <div className="flex-1 md:w-[65%] bg-gray-50 border-r border-gray-100 flex flex-col overflow-hidden min-h-0">
          {embedUrl ? (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {/* Premium Preview Control Bar */}
              <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-[#7A7268] flex-shrink-0">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5 truncate max-w-[70%]">
                  <FileText size={14} className="text-[#40C4D0]" />
                  {submission.content || "Interactive Document View"}
                </span>
                <a 
                  href={submission.file_path || submission.content} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center text-[#40C4D0] hover:text-[#32B0BC] hover:underline font-bold transition-colors"
                >
                  Open in New Tab <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
              
              {/* Iframe Viewport */}
              <div className="flex-1 w-full bg-white relative">
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full border-none" 
                  title="Submission Document Preview" 
                  allow="autoplay"
                />
              </div>
            </div>
          ) : (
            /* Fallback Content Visualizers */
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {submission.format === 'github' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-gray-50/50">
                  <div className="w-16 h-16 rounded-full bg-[#40C4D0]/10 flex items-center justify-center text-[#40C4D0] mb-4 border border-[#40C4D0]/20">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">GitHub Repository Submitted</h3>
                  <p className="text-sm text-[#7A7268] max-w-md mb-6 leading-relaxed">
                    This task requires reviewing code directly inside a repository. Click the primary link below to open the student's workspace in GitHub.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <a 
                      href={submission.content} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] transition-all font-semibold shadow-md hover:shadow-lg gap-2 text-sm"
                    >
                      Browse Code on GitHub <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  <div className="mt-6 w-full max-w-md">
                    <span className="text-xs text-gray-400 block mb-1">Repository Link</span>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 break-all select-all block">
                      {submission.content}
                    </span>
                  </div>
                </div>
              ) : submission.format === 'text' ? (
                <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0 bg-white">
                  <div className="border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-1 shadow-inner bg-gray-50/50">
                    <div className="bg-gray-100/80 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs text-[#7A7268] font-mono">
                      <span className="flex items-center gap-1.5"><FileText size={14} /> SUBMISSION_CONTENT.txt</span>
                      <span>{submission.content?.length || 0} chars</span>
                    </div>
                    <pre className="flex-1 p-6 overflow-auto text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed select-text bg-white">
                      {submission.content}
                    </pre>
                  </div>
                </div>
              ) : (
                /* ZIP / Unrecognized Attachment fallbacks */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-gray-50/50">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border border-amber-100">
                    <FolderArchive size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ZIP Archive Submission</h3>
                  <p className="text-sm text-[#7A7268] max-w-md mb-6 leading-relaxed">
                    This file is stored as a compressed zip archive and cannot be previewed directly inside the web browser. Please download it below to inspect locally.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <a 
                      href={submission.file_path || '#'} 
                      download
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#40C4D0] text-white hover:bg-[#32B0BC] hover:scale-[1.02] transition-all font-semibold shadow-md hover:shadow-lg gap-2 text-sm"
                    >
                      Download ZIP Archive <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  {submission.content && (
                    <div className="mt-6 w-full max-w-md">
                      <span className="text-xs text-gray-400 block mb-1">Uploaded Filename</span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 break-all block">
                        {submission.content}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION & GRADING SIDEBAR (35% width) */}
        <div className="w-full md:w-[35%] flex flex-col h-full bg-white overflow-hidden min-h-0 flex-shrink-0">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
                Review Submission
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-[#7A7268] bg-[#E8E4DE] px-2 py-0.5 rounded">
                {submission.format}
              </span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                submission.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                submission.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {submission.status}
              </span>
            </div>
          </div>

          {/* Scrollable details panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Candidate / Submission Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#7A7268] uppercase tracking-wider">Candidate Profile</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-[#2C2C2C] truncate">{submission.profiles?.full_name}</p>
                    <p className="text-xs text-[#7A7268] truncate">{submission.profiles?.domain || 'General Intern'}</p>
                  </div>
                </div>
                
                {submission.profiles?.email && (
                  <div className="flex items-center gap-3 text-xs text-[#7A7268] overflow-hidden">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{submission.profiles.email}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Task Context */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#7A7268] uppercase tracking-wider">Task Assignment</h4>
              
              <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-2">
                <p className="font-bold text-xs text-[#2C2C2C] line-clamp-2" title={submission.tasks?.title}>
                  {submission.tasks?.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#7A7268]">
                  <Calendar size={12} className="text-gray-400" />
                  <span>Submitted at: {new Date(submission.submitted_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Feedback Input Field */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-xs font-bold text-[#7A7268] uppercase tracking-wider">
                Review Feedback
              </Label>
              <Textarea 
                id="feedback" 
                placeholder="Give constructive feedback here. Describe corrections if rejecting or explain praise if approving..."
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)} 
                className="rounded-xl min-h-[140px] border-gray-200 focus:border-[#40C4D0] focus:ring-1 focus:ring-[#40C4D0] text-sm resize-none"
              />
            </div>
          </div>

          {/* Fixed Footer with Approve/Reject buttons */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex gap-3">
            <Button 
              onClick={() => handleReview('rejected')} 
              disabled={isLoading || submission.status === 'rejected'}
              variant="outline"
              className="flex-1 h-11 rounded-xl text-[#D95F5F] hover:text-[#D95F5F] hover:bg-[#D95F5F]/10 border-[#D95F5F]/30 font-semibold text-xs md:text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X size={16} className="mr-1.5" /> Reject</>}
            </Button>
            
            <Button 
              onClick={() => handleReview('approved')} 
              disabled={isLoading || submission.status === 'approved'}
              className="flex-1 h-11 rounded-xl text-white hover:opacity-90 font-semibold text-xs md:text-sm"
              style={{ background: '#4CAF7D' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check size={16} className="mr-1.5" /> Approve</>}
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
