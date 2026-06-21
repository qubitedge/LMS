import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateStreak } from '@/lib/utils/streak';
import { uploadToGoogleDrive } from '@/lib/googleDrive';
import capstoneTeams from '@/lib/capstone-teams.json';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';
    
    let taskId = '';
    let format = '';
    let content = '';
    let filePath = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      taskId = formData.get('taskId') as string;
      format = formData.get('format') as string;
      
      const file = formData.get('file') as File;
      const studentName = (formData.get('studentName') as string || '').trim();

      if (file && (format === 'pdf' || format === 'zip')) {
        // Retrieve full profile details to use their name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const nameToUse = studentName || profile?.full_name || user.email || 'Student';
        const fileExt = file.name.split('.').pop();
        // Create an easily identifiable filename for Google Drive
        const googleDriveFileName = `${nameToUse.replace(/[^a-zA-Z0-9]/g, '_')}_Task_${taskId}_${Date.now()}.${fileExt}`;

        try {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const uploadResult = await uploadToGoogleDrive(
            fileBuffer,
            googleDriveFileName,
            file.type || 'application/octet-stream'
          );
          
          filePath = uploadResult.webViewLink || uploadResult.webContentLink;
          content = file.name; // Keep the original filename in text content
        } catch (driveError: any) {
          console.error('Google Drive upload failed, falling back to Supabase Storage:', driveError);
          
          // Fallback to Supabase Storage
          const fileName = `${user.id}/${taskId}_${Date.now()}.${fileExt}`;
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          
          const { data, error: uploadError } = await supabase.storage
            .from('submissions')
            .upload(fileName, fileBuffer, {
              contentType: file.type || 'application/octet-stream',
              upsert: true
            });

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('submissions')
            .getPublicUrl(fileName);
            
          filePath = publicUrl;
          content = file.name;
        }
      } else {
        content = formData.get('content') as string || '';
      }
    } else {
      // JSON fallback (for standard JSON submissions from other parts of the site)
      const body = await req.json();
      taskId = body.taskId;
      format = body.format;
      content = body.content;
      filePath = body.filePath;
    }

    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
    }

    // Fetch task and its associated day ID
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('id, day_id, days(day_number, weeks(week_number))')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Fetch user profile for role check
    const { data: roleProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = roleProfile?.role === 'admin';

    if (!isAdmin) {
      // Check if this day is unlocked by the admin
      const { data: setting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'unlocked_days')
        .maybeSingle();

      const unlockedDays = setting?.value || [];
      
      const capstoneUser = capstoneTeams.find(t => t.email === user.email);
      const isCapstoneSelected = !!capstoneUser;
      
      const daysData = task.days as any;
      const weekNumber = Array.isArray(daysData) ? daysData[0]?.weeks?.week_number : daysData?.weeks?.week_number;
      
      const isRev = weekNumber === 6 && !isCapstoneSelected;
      const checkId = isRev ? `${task.day_id}-revision` : task.day_id;
      const isUnlocked = unlockedDays.includes(checkId);

      if (!isUnlocked) {
        return NextResponse.json({ message: 'This task is currently locked by the administrator.' }, { status: 403 });
      }
    }

    // Check existing submission (if any, it will update status to pending again)
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', taskId)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          format,
          content,
          file_path: filePath,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          format,
          content,
          file_path: filePath,
          status: 'pending',
        });

      if (insertError) throw insertError;
    }

    // Update streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date')
      .eq('id', user.id)
      .single();

    if (profile) {
      const { newStreak, newLongest } = calculateStreak(
        profile.current_streak,
        profile.longest_streak,
        profile.last_active_date
      );

      const todayStr = new Date().toISOString().split('T')[0];

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: todayStr,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error handling submission:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ message: 'Submission ID is required' }, { status: 400 });
    }

    const { data: submission } = await supabase
      .from('submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single();

    if (!submission) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    if (submission.user_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const { createClient: createAdminClient } = require('@supabase/supabase-js');
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: deleteError, data: deletedData } = await adminSupabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)
      .select();

    if (deleteError) {
      return NextResponse.json({ message: 'Failed to delete submission' }, { status: 500 });
    }
    
    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ message: 'Submission could not be deleted (it might not exist anymore)' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
