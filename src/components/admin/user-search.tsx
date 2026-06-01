'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('q', debouncedQuery);
    } else {
      params.delete('q');
    }
    // Always reset to page 0 when search changes so results start from the beginning
    params.delete('page');
    router.replace(`?${params.toString()}`);
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="relative w-full max-w-md group">
      <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7182C7] group-focus-within:text-[#4A5DB5] transition-colors" size={18} />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-10 h-12 rounded-2xl border-white/40 bg-white/50 backdrop-blur-md shadow-sm font-bold focus:ring-[#4A5DB5] focus:bg-white/80 transition-all text-[#1A1A2E] placeholder:text-[#A0ACDC]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-[#7182C7] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
