import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify Admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { submissionId, status, adminComment, score } = await req.json();

    if (!submissionId || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('project_submissions')
      .update({
        status,
        admin_comment: adminComment || null,
        score: status === 'approved' ? (score || null) : null,
        has_seen_review: false,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating project submission:', updateError);
      return NextResponse.json({ message: 'Failed to update submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in project review route:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
