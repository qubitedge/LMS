import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Database, Code, Activity, Network } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCapstoneSelectionsPage() {
  const supabase = await createClient();

  // Fetch all capstone selections with user details
  const { data: selections } = await supabase
    .from('capstone_selections')
    .select('id, domain, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  const safeSelections = selections || [];

  // Calculate aggregates
  const counts = {
    'AI/ML': 0,
    'Python': 0,
    'Data Analytics': 0,
    'IoT': 0
  };

  safeSelections.forEach((sel: any) => {
    if (counts[sel.domain as keyof typeof counts] !== undefined) {
      counts[sel.domain as keyof typeof counts]++;
    }
  });

  const totalSelections = safeSelections.length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
          Capstone Selections
        </h1>
        <p className="text-sm" style={{ color: '#7A7268' }}>
          View domain preferences submitted by eligible interns for their capstone projects.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-none bg-indigo-50/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-indigo-800">AI/ML</CardTitle>
            <Network className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-900">{counts['AI/ML']}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-blue-50/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-800">Python</CardTitle>
            <Code className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-900">{counts['Python']}</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-emerald-50/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-800">Data Analytics</CardTitle>
            <Database className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-900">{counts['Data Analytics']}</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-amber-50/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-amber-800">IoT</CardTitle>
            <Activity className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-900">{counts['IoT']}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#2C2C2C' }}>
          All Submissions ({totalSelections})
        </h2>
      </div>

      <Card className="qe-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#FAFAFA]">
                <TableRow>
                  <TableHead className="font-bold w-[60px] text-center">Sl No.</TableHead>
                  <TableHead className="font-bold">Intern Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold text-center">Selected Domain</TableHead>
                  <TableHead className="font-bold">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeSelections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-[#7A7268]">
                      No capstone selections found.
                    </TableCell>
                  </TableRow>
                ) : (
                  safeSelections.map((sel: any, index: number) => (
                    <TableRow key={sel.id} className="hover:bg-gray-50/50 transition-colors border-b-gray-100">
                      <TableCell className="text-center text-sm font-bold text-[#7A7268]">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-sm text-[#2C2C2C]">{sel.profiles?.full_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-[#7A7268]">{sel.profiles?.email}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          sel.domain === 'AI/ML' ? 'bg-indigo-100 text-indigo-800' :
                          sel.domain === 'Python' ? 'bg-blue-100 text-blue-800' :
                          sel.domain === 'Data Analytics' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }>
                          {sel.domain}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#7A7268]">
                        {format(parseISO(sel.created_at), 'MMM d, h:mm a')}
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
