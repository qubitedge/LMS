import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import SubmissionReviewDialog from '@/components/admin/submission-review-dialog';

export const revalidate = 60;

export default async function AdminSubmissionsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : '';

  const supabase = await createClient();

  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select('*, profiles(full_name, domain, email, address), tasks(title)')
    .order('submitted_at', { ascending: false });

  let submissions = rawSubmissions || [];

  if (sort === 'college') {
    submissions = [...submissions].sort((a: any, b: any) => {
      const colA = a.profiles?.address || '';
      const colB = b.profiles?.address || '';
      return colA.localeCompare(colB);
    });
  }



  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            Submissions Review
          </h1>
          <p className="text-sm" style={{ color: '#7A7268' }}>
            Review and grade intern task submissions.
          </p>
        </div>
        
        <div className="flex gap-2">
          {sort === 'college' ? (
            <Link href="/admin/submissions">
              <Button variant="outline" className="text-xs text-[#7A7268]">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                Sort by Date
              </Button>
            </Link>
          ) : (
            <Link href="/admin/submissions?sort=college">
              <Button variant="outline" className="text-xs text-[#7A7268]">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                Sort by College
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="qe-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableRow>
                  <TableHead className="font-bold w-[60px] text-center">Sl No.</TableHead>
                  <TableHead className="font-bold">Intern</TableHead>
                  <TableHead className="font-bold">College</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-10 text-[#7A7268]">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub: any, index: number) => (
                    <TableRow key={sub.id} className="hover:bg-gray-50/50 transition-colors border-b-gray-100">
                      <TableCell className="text-center text-sm font-bold text-[#7A7268]">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-sm text-[#2C2C2C]">{sub.profiles?.full_name}</p>
                        <p className="text-xs text-[#7A7268]">{sub.profiles?.domain}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-[#7A7268] max-w-[150px] truncate" title={sub.profiles?.address || 'N/A'}>
                          {sub.profiles?.address || 'N/A'}
                        </p>
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
