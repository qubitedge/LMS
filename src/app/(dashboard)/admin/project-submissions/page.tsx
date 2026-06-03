import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import ProjectReviewDialog from '@/components/admin/project-review-dialog';
import ProjectsUnlockToggle from '@/components/admin/projects-unlock-toggle';
import { Code } from 'lucide-react';

export const revalidate = 0;

export default async function AdminProjectSubmissionsPage() {
  const supabase = await createClient();

  const [{ data: submissions }, { data: setting }] = await Promise.all([
    supabase
      .from('project_submissions')
      .select('*, profiles(full_name, domain, email)')
      .order('submitted_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'projects_unlocked')
      .maybeSingle(),
  ]);

  const isUnlocked = setting?.value === true;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            Project Submissions
          </h1>
          <p className="text-sm" style={{ color: '#7A7268' }}>
            Review intern mini-project submissions and control visibility.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ProjectsUnlockToggle isUnlocked={isUnlocked} />
          <p className="text-xs text-[#7A7268]">
            {isUnlocked
              ? 'Interns can currently see and submit projects.'
              : 'Projects are hidden from interns.'}
          </p>
        </div>
      </div>

      <Card className="qe-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableRow>
                  <TableHead className="font-bold">Intern</TableHead>
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
                    <TableCell colSpan={6} className="text-center py-10 text-[#7A7268]">
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
                        >
                          <Code size={14} /> Repository
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
