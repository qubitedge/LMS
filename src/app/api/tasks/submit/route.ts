import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateStreak } from '@/lib/utils/streak';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

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
