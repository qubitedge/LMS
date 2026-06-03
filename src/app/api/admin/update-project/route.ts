import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, status, userId } = body;

    if (!submissionId || !status || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update the submission status
    const { error: updateError } = await supabase
      .from('project_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      throw updateError;
    }

    // 2. If approved, add 10 to performance_percentage (cap at 100)
    if (status === 'approved') {
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('performance_percentage')
        .eq('id', userId)
        .single();

      if (!profileError && targetProfile) {
        const newPercentage = Math.min((targetProfile.performance_percentage || 0) + 10, 100);
        
        await supabase
          .from('profiles')
          .update({ performance_percentage: newPercentage })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating project status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
