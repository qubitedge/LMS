'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CapstonePopup() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const domains = ['AI/ML', 'Python', 'Data Analytics', 'IoT'];

  const handleSubmit = async () => {
    if (!selectedDomain) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/capstone/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain: selectedDomain })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSuccess(true);
      
      // Allow user to read success message before refreshing to remove the block
      setTimeout(() => {
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -z-10" />

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display' }}>
              Thanks for your selection!
            </h2>
            <p className="text-gray-500">
              Your domain preference has been successfully recorded. You will be redirected shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display' }}>
                Capstone Domain Selection
              </h2>
              <p className="text-sm text-gray-600">
                Congratulations on completing your mini-project! Please select the domain you are most interested in for your capstone project.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-8">
              {domains.map((domain) => (
                <div
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedDomain === domain
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${selectedDomain === domain ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {domain}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedDomain === domain ? 'border-indigo-600' : 'border-gray-300'
                    }`}>
                      {selectedDomain === domain && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={!selectedDomain || isSubmitting}
              className="w-full h-12 text-base rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Selection'
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Note: You must make a selection to continue. This action cannot be undone.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
