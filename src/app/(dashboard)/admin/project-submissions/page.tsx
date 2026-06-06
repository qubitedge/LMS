import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import ProjectReviewDialog from '@/components/admin/project-review-dialog';
import ProjectsUnlockToggle from '@/components/admin/projects-unlock-toggle';
import { Code, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminProjectSubmissionsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : '';

  const supabase = await createClient();

  const [{ data: rawSubmissions }, { data: setting }] = await Promise.all([
    supabase
      .from('project_submissions')
      .select('*, profiles(full_name, domain, email, address)')
      .order('submitted_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'projects_unlocked')
      .maybeSingle(),
  ]);

  let submissions = rawSubmissions || [];

  if (sort === 'college') {
    submissions = [...submissions].sort((a: any, b: any) => {
      const colA = a.profiles?.address || '';
      const colB = b.profiles?.address || '';
      return colA.localeCompare(colB);
    });
  }

  const isUnlocked = setting?.value === true;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            Project Submissions
          </h1>
          <p className="text-sm" style={{ color: '#7A7268' }}>
            Review intern mini-project submissions and control visibility.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-col items-end gap-1">
            <ProjectsUnlockToggle isUnlocked={isUnlocked} />
            <p className="text-xs text-[#7A7268]">
              {isUnlocked
                ? 'Interns can currently see and submit projects.'
                : 'Projects are hidden from interns.'}
            </p>
          </div>
          <div className="flex gap-2">
            {sort === 'college' ? (
              <Link href="/admin/project-submissions">
                <Button variant="outline" className="text-xs text-[#7A7268]">
                  <ArrowUpDown className="mr-2 h-3 w-3" />
                  Sort by Date
                </Button>
              </Link>
            ) : (
              <Link href="/admin/project-submissions?sort=college">
                <Button variant="outline" className="text-xs text-[#7A7268]">
                  <ArrowUpDown className="mr-2 h-3 w-3" />
                  Sort by College
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Card className="qe-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableRow>
                  <TableHead className="font-bold">Intern</TableHead>
                  <TableHead className="font-bold">College</TableHead>
                  <TableHead className="font-bold">Project</TableHead>
                  <TableHead className="font-bold">GitHub</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold">Submitted At</TableHead>
                  <TableHead className="font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!submissions || submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-[#7A7268]">
                      No project submissions found.
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
                        <p className="text-xs font-medium text-[#7A7268] max-w-[150px] truncate" title={sub.profiles?.address || 'N/A'}>
                          {sub.profiles?.address || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm text-[#2C2C2C] max-w-[200px] truncate" title={sub.project_name}>
                          {sub.project_name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-[#40C4D0] hover:underline"
                          title={sub.github_url}
                        >
                          <Code size={14} className="shrink-0" /> 
                          <span className="font-medium">Click to Url</span>
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#7A7268]">
                        {format(parseISO(sub.submitted_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProjectReviewDialog submission={sub} />
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
