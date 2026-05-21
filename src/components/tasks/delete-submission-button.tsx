'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Deleting the record from Supabase
      // Note: This does not delete the file from Google Drive, just the database record
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission deleted successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete submission');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-10 px-4 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs"
    >
      {isDeleting ? (
        <Loader2 size={14} className="mr-1.5 animate-spin" />
      ) : (
        <Trash2 size={14} className="mr-1.5" />
      )}
      Delete
    </Button>
  );
}
