import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Check if the user already submitted a review to avoid duplicates
    const { data: existingReview } = await supabase
      .from('internship_reviews')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted' }, { status: 400 });
    }

    const { error } = await supabase
      .from('internship_reviews')
      .insert({
        user_id: user.id,
        rating,
        comment,
      });

    if (error) {
      console.error('Error inserting review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
