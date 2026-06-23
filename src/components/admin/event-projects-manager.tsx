'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit3, Trash2, Loader2, Code, Database, FolderGit2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EventProjectsManagerProps {
  eventId: string;
}

export default function EventProjectsManager({ eventId }: EventProjectsManagerProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    problem_statement: '',
    features: '',
    technologies: '',
    sql_concepts: '',
    python_skills: '',
    tables: '',
    example_reports: '',
    skills_learned: '',
    bonus: '',
    real_world_relevance: '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/projects?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [eventId]);

  const openAddDialog = () => {
    setEditingProject(null);
    setForm({
      name: '',
      problem_statement: '',
      features: '',
      technologies: '',
      sql_concepts: '',
      python_skills: '',
      tables: '',
      example_reports: '',
      skills_learned: '',
      bonus: '',
      real_world_relevance: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (project: any) => {
    setEditingProject(project);
    setForm({
      name: project.name || '',
      problem_statement: project.problem_statement || '',
      features: (project.features || []).join('\n'),
      technologies: (project.technologies || []).join(', '),
      sql_concepts: (project.sql_concepts || []).join(', '),
      python_skills: (project.python_skills || []).join(', '),
      tables: (project.tables || []).join(', '),
      example_reports: (project.example_reports || []).join('\n'),
      skills_learned: (project.skills_learned || []).join('\n'),
      bonus: project.bonus || '',
      real_world_relevance: project.real_world_relevance || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mini-project?')) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Project deleted successfully');
        fetchProjects();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      id: editingProject?.id,
      event_id: eventId,
      name: form.name,
      problem_statement: form.problem_statement,
      features: form.features.split('\n').map(x => x.trim()).filter(Boolean),
      technologies: form.technologies.split(',').map(x => x.trim()).filter(Boolean),
      sql_concepts: form.sql_concepts.split(',').map(x => x.trim()).filter(Boolean),
      python_skills: form.python_skills.split(',').map(x => x.trim()).filter(Boolean),
      tables: form.tables.split(',').map(x => x.trim()).filter(Boolean),
      example_reports: form.example_reports.split('\n').map(x => x.trim()).filter(Boolean),
      skills_learned: form.skills_learned.split('\n').map(x => x.trim()).filter(Boolean),
      bonus: form.bonus,
      real_world_relevance: form.real_world_relevance,
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingProject ? 'Project updated' : 'Project created');
        setDialogOpen(false);
        fetchProjects();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pl-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
          <FolderGit2 className="text-[#4A5DB5]" /> Mini Projects
        </h3>
        <Button 
          onClick={openAddDialog}
          className="h-10 px-4 rounded-xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-black text-xs uppercase tracking-widest shadow-md flex gap-2"
        >
          <Plus size={16} /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-[#4A5DB5]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed rounded-3xl border-slate-200">
          <p className="text-slate-400 font-bold text-sm">No mini-projects created for this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="relative rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-lg font-black text-[#1A1A2E] leading-tight">{project.name}</h4>
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(project)}
                      className="h-8 w-8 rounded-lg hover:bg-slate-50 text-blue-500"
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(project.id)}
                      className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {project.problem_statement && (
                  <p className="text-xs text-[#7182C7] font-medium italic line-clamp-2">
                    "{project.problem_statement}"
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(project.technologies || []).map((tech: string, i: number) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-[#4A5DB5] px-2 py-0.5 rounded border border-slate-100">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl">
          <div className="h-24 bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center px-10">
            <DialogTitle className="text-2xl font-black text-white">
              {editingProject ? 'Edit Mini Project' : 'Add Mini Project'}
            </DialogTitle>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Project Name</Label>
                <Input 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Student Attendance Management System"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 font-bold focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Problem Statement</Label>
                <Textarea 
                  value={form.problem_statement}
                  onChange={(e) => setForm({ ...form, problem_statement: e.target.value })}
                  placeholder="Describe the problem this project solves..."
                  className="rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 font-bold focus:bg-white min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Technologies (comma-separated)</Label>
                  <Input 
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    placeholder="Python, SQLite, Matplotlib"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Tables (comma-separated)</Label>
                  <Input 
                    value={form.tables}
                    onChange={(e) => setForm({ ...form, tables: e.target.value })}
                    placeholder="users, expenses, categories"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Features (one per line)</Label>
                <Textarea 
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Daily attendance marking&#10;Monthly summaries"
                  className="rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">SQL Concepts (comma-separated)</Label>
                  <Input 
                    value={form.sql_concepts}
                    onChange={(e) => setForm({ ...form, sql_concepts: e.target.value })}
                    placeholder="GROUP BY, INNER JOIN"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Python Skills (comma-separated)</Label>
                  <Input 
                    value={form.python_skills}
                    onChange={(e) => setForm({ ...form, python_skills: e.target.value })}
                    placeholder="CRUD, CSV parsing"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Example Reports (one per line)</Label>
                <Textarea 
                  value={form.example_reports}
                  onChange={(e) => setForm({ ...form, example_reports: e.target.value })}
                  placeholder="Top category spending&#10;Daily trends"
                  className="rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 min-h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Skills Learned (one per line)</Label>
                <Textarea 
                  value={form.skills_learned}
                  onChange={(e) => setForm({ ...form, skills_learned: e.target.value })}
                  placeholder="Relational Database Design&#10;Business Reporting"
                  className="rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Bonus Objective (Optional)</Label>
                  <Input 
                    value={form.bonus}
                    onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                    placeholder="e.g. Export reports to PDF"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black text-[#7182C7] uppercase tracking-widest px-2">Real World Relevance (Optional)</Label>
                  <Input 
                    value={form.real_world_relevance}
                    onChange={(e) => setForm({ ...form, real_world_relevance: e.target.value })}
                    placeholder="e.g. Retail shops, Pharmacies"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="h-12 px-6 rounded-xl border-slate-200 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="h-12 px-6 rounded-xl bg-[#4A5DB5] hover:bg-[#2238A4] text-white font-bold"
              >
                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
