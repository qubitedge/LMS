'use client';

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface UserListExportProps {
  users: any[];
  role: string;
}

export default function UserListExport({ users, role }: UserListExportProps) {
  const handleExport = () => {
    try {
      if (!users || users.length === 0) {
        toast.error('No users to export');
        return;
      }

      // Map users to a clean format for Excel
      const exportData = users.map(user => ({
        'Full Name': user.full_name,
        'Email': user.email,
        'Category/Domain': user.domain || 'Intern',
        'Status': user.is_active ? 'Active' : 'Disabled',
        'Joined Date': new Date(user.created_at).toLocaleDateString(),
        'Role': user.role
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      
      const fileName = `LMS_${role}_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('User list exported successfully!');
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleExport}
      className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-white border-blue-50 text-[#7182C7] hover:bg-blue-50 hover:text-[#4A5DB5] shadow-sm flex gap-2"
    >
      <FileDown size={16} /> Export List
    </Button>
  );
}
