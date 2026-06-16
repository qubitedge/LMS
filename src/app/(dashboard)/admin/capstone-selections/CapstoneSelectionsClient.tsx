'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Database, Code, Activity, Network, Users } from 'lucide-react';

export default function CapstoneSelectionsClient({ selections }: { selections: any[] }) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

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

  const filteredSelections = selectedDomain 
    ? safeSelections.filter(sel => sel.domain === selectedDomain)
    : safeSelections;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
          Capstone Selections
        </h1>
        <p className="text-sm" style={{ color: '#7A7268' }}>
          View domain preferences submitted by eligible interns for their capstone projects. Click on a domain card to filter.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card 
          className={`cursor-pointer transition-all ${selectedDomain === null ? 'ring-2 ring-gray-400 bg-gray-50' : 'border-none bg-gray-50/50 hover:bg-gray-100'} shadow-sm`}
          onClick={() => setSelectedDomain(null)}
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-800">All</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-gray-900">{totalSelections}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedDomain === 'AI/ML' ? 'ring-2 ring-indigo-400 bg-indigo-50' : 'border-none bg-indigo-50/50 hover:bg-indigo-100'} shadow-sm`}
          onClick={() => setSelectedDomain(selectedDomain === 'AI/ML' ? null : 'AI/ML')}
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-indigo-800">AI/ML</CardTitle>
            <Network className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-900">{counts['AI/ML']}</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${selectedDomain === 'Python' ? 'ring-2 ring-blue-400 bg-blue-50' : 'border-none bg-blue-50/50 hover:bg-blue-100'} shadow-sm`}
          onClick={() => setSelectedDomain(selectedDomain === 'Python' ? null : 'Python')}
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-800">Python</CardTitle>
            <Code className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-900">{counts['Python']}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedDomain === 'Data Analytics' ? 'ring-2 ring-emerald-400 bg-emerald-50' : 'border-none bg-emerald-50/50 hover:bg-emerald-100'} shadow-sm`}
          onClick={() => setSelectedDomain(selectedDomain === 'Data Analytics' ? null : 'Data Analytics')}
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-800">Data Analytics</CardTitle>
            <Database className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-900">{counts['Data Analytics']}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedDomain === 'IoT' ? 'ring-2 ring-amber-400 bg-amber-50' : 'border-none bg-amber-50/50 hover:bg-amber-100'} shadow-sm`}
          onClick={() => setSelectedDomain(selectedDomain === 'IoT' ? null : 'IoT')}
        >
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-amber-800">IoT</CardTitle>
            <Activity className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-900">{counts['IoT']}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: '#2C2C2C' }}>
          {selectedDomain ? `${selectedDomain} Submissions` : 'All Submissions'} ({filteredSelections.length})
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
                  <TableHead className="font-bold">Branch</TableHead>
                  <TableHead className="font-bold">College</TableHead>
                  <TableHead className="font-bold text-center">Selected Domain</TableHead>
                  <TableHead className="font-bold">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSelections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-[#7A7268]">
                      No capstone selections found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSelections.map((sel: any, index: number) => (
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
                      <TableCell>
                        <p className="text-sm text-[#7A7268]">{sel.profiles?.domain || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-[#7A7268]">{sel.profiles?.address || 'N/A'}</p>
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
