import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, projectName, githubUrl } = await req.json();

    if (!projectId || !projectName || !githubUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Insert or update submission
    // Using an upsert based on (user_id, project_id) since it's a UNIQUE constraint
    const { error: insertError } = await supabase
      .from('project_submissions')
      .upsert({
        user_id: user.id,
        project_id: projectId,
        project_name: projectName,
        github_url: githubUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
      }, {
        onConflict: 'user_id, project_id'
      });

    if (insertError) {
      console.error('Project submission insert error:', insertError);
      return NextResponse.json({ message: 'Failed to save submission. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Project submitted successfully' });

  } catch (error: any) {
    console.error('Error handling project submission:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
