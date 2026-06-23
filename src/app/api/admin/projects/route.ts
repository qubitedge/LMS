import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    let query = supabase.from('mini_projects').select('*');
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { 
      id, event_id, name, problem_statement, features, 
      technologies, sql_concepts, python_skills, tables, 
      example_reports, skills_learned, bonus, real_world_relevance 
    } = body;

    if (!event_id || !name) {
      return NextResponse.json({ message: 'Event ID and Name are required' }, { status: 400 });
    }

    const payload = {
      event_id,
      name,
      problem_statement,
      features: features || [],
      technologies: technologies || [],
      sql_concepts: sql_concepts || [],
      python_skills: python_skills || [],
      tables: tables || [],
      example_reports: example_reports || [],
      skills_learned: skills_learned || [],
      bonus: bonus || null,
      real_world_relevance: real_world_relevance || null
    };

    if (id) {
      const { data, error } = await supabase
        .from('mini_projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('mini_projects')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

    const { error } = await supabase.from('mini_projects').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
