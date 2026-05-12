'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function BulkUserUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsUploading(true);
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to expected API format
        // Expected columns: Name, Email, Password, Domain, Role
        const users = jsonData.map((row: any) => ({
          name: row.Name || row.name || row['Full Name'],
          email: row.Email || row.email || row['Email Address'],
          password: row.Password || row.password || row['Temp Password'] || 'LMS123@temp',
          domain: row.Domain || row.domain || row['Type of Intern'] || row['Intern Type'],
          role: row.Role || row.role || 'intern'
        }));

        const res = await fetch('/api/admin/users/bulk-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users }),
        });

        const result = await res.json();
        if (result.success) {
          setResults(result.results);
          toast.success(`Bulk upload completed! ${result.results.added.length} added.`);
          router.refresh();
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      { 'Name': 'John Doe', 'Email': 'john@example.com', 'Temp Password': 'Password123', 'Type of Intern': 'Python Development', 'Role': 'intern' }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "LMS_Bulk_Upload_Template.xlsx");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setResults(null);
    }}>
      <DialogTrigger render={<Button className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 flex gap-2" />}>
        <Upload size={16} /> Bulk Upload
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] bg-white/90 backdrop-blur-xl border-white/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-[#1A1A2E] flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-500" /> Bulk User Upload
          </DialogTitle>
          <DialogDescription className="text-[#7182C7] font-bold">
            Upload an Excel sheet to create multiple users at once.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-8 py-6">
            <div className="p-8 border-2 border-dashed border-emerald-100 rounded-[2rem] bg-emerald-50/30 text-center flex flex-col items-center gap-4 group hover:border-emerald-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-black text-[#1A1A2E]">Drop your Excel file here</p>
                <p className="text-xs text-[#7182C7] font-bold">or click to browse from your computer</p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
              <AlertCircle className="text-[#4A5DB5] shrink-0" size={20} />
              <div className="space-y-2">
                <p className="text-xs font-black text-[#4A5DB5] uppercase tracking-wider">Requirements</p>
                <ul className="text-sm font-bold text-[#7182C7] space-y-1 list-disc pl-4">
                  <li>Columns should include: Name, Email, Temp Password, Type of Intern.</li>
                  <li>Existing emails will be skipped automatically.</li>
                  <li>Passwords must be at least 6 characters long.</li>
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={downloadTemplate}
                  className="mt-2 text-[#4A5DB5] hover:bg-white p-0 h-auto font-black text-xs uppercase tracking-widest gap-2"
                >
                  <Download size={14} /> Download Template
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Added</p>
                <p className="text-2xl font-black text-emerald-700">{results.added.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Skipped</p>
                <p className="text-2xl font-black text-amber-700">{results.skipped.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                <p className="text-[10px] font-black uppercase text-rose-600 mb-1">Errors</p>
                <p className="text-2xl font-black text-rose-700">{results.errors.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {results.added.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} /> Successfully Added
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-xl border border-emerald-50 bg-white p-2 text-xs font-bold text-[#7182C7]">
                    {results.added.map((u: any, i: number) => (
                      <div key={i} className="py-1 px-2 border-b border-slate-50 last:border-0">{u.name} ({u.email})</div>
                    ))}
                  </div>
                </div>
              )}

              {results.skipped.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> Skipped (Duplicates)
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-xl border border-amber-50 bg-white p-2 text-xs font-bold text-[#7182C7]">
                    {results.skipped.map((u: any, i: number) => (
                      <div key={i} className="py-1 px-2 border-b border-slate-50 last:border-0">{u.email} - {u.reason}</div>
                    ))}
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                    <XCircle size={14} /> Errors
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-xl border border-rose-50 bg-white p-2 text-xs font-bold text-[#7182C7]">
                    {results.errors.map((e: any, i: number) => (
                      <div key={i} className="py-1 px-2 border-b border-slate-50 last:border-0">{e.email}: {e.error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full h-12 rounded-xl bg-[#1A1A2E] text-white font-black uppercase tracking-widest"
            >
              Done
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#4A5DB5]" size={48} />
            <p className="font-black text-[#1A1A2E] animate-pulse">Processing bulk upload...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
