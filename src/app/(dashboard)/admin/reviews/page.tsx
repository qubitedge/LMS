import { createClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  // Fetch reviews joined with profile
  const { data: reviews, error } = await supabase
    .from('internship_reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles (
        full_name,
        email,
        college_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
  }

  return (
    <div className="pb-20 space-y-10">
      <div className="relative mb-16">
        <h1 className="text-5xl font-black text-[#1A1A2E] tracking-tighter italic">
          Internship Reviews
        </h1>
        <p className="text-xl font-bold text-[#7182C7] mt-2">
          Feedback and ratings submitted by interns.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-[#1A1A2E]">All Submitted Feedback</h2>
            <p className="text-sm font-bold text-slate-500">
              Total Responses: {reviews?.length || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(!reviews || reviews.length === 0) && (
            <p className="text-slate-500 italic">No reviews submitted yet.</p>
          )}
          {reviews?.map((review: any) => (
            <div key={review.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[#1A1A2E]">{review.profiles?.full_name || 'Unknown User'}</h3>
                  <p className="text-xs text-slate-500">{review.profiles?.email}</p>
                  {review.profiles?.college_name && (
                    <p className="text-xs text-[#7182C7] font-medium mt-1">{review.profiles.college_name}</p>
                  )}
                </div>
                <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <Star size={14} className="fill-amber-400 text-amber-400 mr-1" />
                  <span className="text-sm font-black text-[#1A1A2E]">{review.rating}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl text-sm text-slate-700 flex-grow border border-slate-100 italic">
                "{review.comment || 'No comment provided.'}"
              </div>
              <p className="text-[10px] text-slate-400 mt-4 text-right">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
