import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import SubmissionReviewDialog from '@/components/admin/submission-review-dialog';

export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, profiles(full_name, domain, email), tasks(title)')
    .order('submitted_at', { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
          Submissions Review
        </h1>
        <p className="text-sm" style={{ color: '#7A7268' }}>
          Review and grade intern task submissions.
        </p>
      </div>

      <Card className="qe-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableRow>
                  <TableHead className="font-bold">Intern</TableHead>
                  <TableHead className="font-bold">Task</TableHead>
                  <TableHead className="font-bold text-center">Format</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold">Submitted</TableHead>
                  <TableHead className="font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!submissions || submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-[#7A7268]">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub: any) => (
                    <TableRow key={sub.id} className="hover:bg-gray-50/50 transition-colors border-b-gray-100">
                      <TableCell>
                        <p className="font-bold text-sm text-[#2C2C2C]">{sub.profiles?.full_name}</p>
                        <p className="text-xs text-[#7A7268]">{sub.profiles?.domain}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm text-[#2C2C2C] max-w-[200px] truncate" title={sub.tasks?.title}>
                          {sub.tasks?.title}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-bold uppercase text-[#7A7268] bg-[#E8E4DE] px-2 py-1 rounded">
                          {sub.format}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          sub.status === 'approved' ? 'badge-approved' : 
                          sub.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                        }>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#7A7268]">
                        {format(parseISO(sub.submitted_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <SubmissionReviewDialog submission={sub} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
