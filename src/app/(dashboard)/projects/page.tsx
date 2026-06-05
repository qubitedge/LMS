import { miniProjects } from '@/lib/projects-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProjectSubmissionDialog from '@/components/projects/project-submission-dialog';
import { AlertCircle, Code, Database, FolderGit2, Info, BookOpen, Lightbulb, FileText, TableProperties, Lock } from 'lucide-react';
import GithubGuideModal from '@/components/projects/github-guide-modal';
import ProjectGuideModal from '@/components/projects/project-guide-modal';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/get-profile';

export const metadata = {
  title: 'Mini Projects - Qubitedge LMS',
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isAdmin = false;
  if (user) {
    const profile = await getProfile(user.id);
    isAdmin = profile?.role === 'admin';
  }

  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'projects_unlocked')
    .maybeSingle();

  const isUnlocked = setting?.value === true || isAdmin;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-gray-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: 'Playfair Display' }}>
            Projects Locked
          </h2>
          <p className="text-[#7A7268] text-sm">
            The capstone mini-projects are currently locked. Your administrator will unlock them when it's time to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
          Mini Projects
        </h1>
        <p className="text-sm mb-4" style={{ color: '#7A7268' }}>
          Complete these mini projects to practice your Python and SQL skills. 
          Submit your GitHub repository link when finished.
        </p>
        
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-xl flex items-start gap-3">
          <Info size={20} className="shrink-0 mt-0.5 text-indigo-600" />
          <p className="text-sm font-medium">
            <strong>Important:</strong> You only need to complete <span className="font-bold">any ONE</span> of these projects to be selected for the capstone project!
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6 mb-12">
        {miniProjects.map((project) => (
          <Card key={project.id} className="qe-card border-none overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl leading-tight" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
                {project.id}. {project.name}
              </CardTitle>
              {project.problemStatement && (
                <p className="text-sm mt-2 text-[#4a4a4a] italic">"{project.problemStatement}"</p>
              )}
              {project.technologies && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      tech === 'Python' ? 'bg-blue-100 text-blue-700' :
                      tech === 'SQLite' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tech === 'Python' ? '🐍' : tech === 'SQLite' ? '🗄️' : '📋'} {tech}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                
                {/* Features and Skills Learned */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-2 flex items-center gap-1">
                      <Lightbulb size={12} /> Features
                    </h4>
                    <ul className="text-xs space-y-1 text-[#4a4a4a]">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#40C4D0] mt-0.5">•</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {project.skillsLearned && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-2 flex items-center gap-1">
                        <BookOpen size={12} /> Skills Learned
                      </h4>
                      <ul className="text-xs space-y-1 text-[#4a4a4a]">
                        {project.skillsLearned.map((skill, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#4A5DB5] mt-0.5">•</span> {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Example Reports & Tables */}
                <div className="grid grid-cols-2 gap-4">
                  {project.exampleReports && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-2 flex items-center gap-1">
                        <FileText size={12} /> Example Reports
                      </h4>
                      <ul className="text-xs space-y-1 text-[#4a4a4a]">
                        {project.exampleReports.map((report, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#40C4D0] mt-0.5">•</span> {report}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.tables && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-2 flex items-center gap-1">
                        <TableProperties size={12} /> Tables
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.tables.map((table, i) => (
                          <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 text-[9px] px-1.5 py-0">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] mb-2">Tech Stack Concepts</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.sqlConcepts.map((concept, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        <Database size={10} className="mr-1" /> {concept}
                      </Badge>
                    ))}
                    {project.pythonSkills?.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <Code size={10} className="mr-1" /> {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {(project.bonus || project.realWorldRelevance) && (
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-gray-100">
                    {project.bonus && (
                      <p className="text-xs text-[#7A7268]"><span className="font-bold text-[#2C2C2C]">Bonus:</span> {project.bonus}</p>
                    )}
                    {project.realWorldRelevance && (
                      <p className="text-xs text-[#7A7268]"><span className="font-bold text-[#2C2C2C]">Real-World Relevance:</span> {project.realWorldRelevance}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <ProjectSubmissionDialog project={project} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-8 bg-[#FAFAFA] rounded-3xl border" style={{ borderColor: 'rgba(201,168,130,0.3)' }}>
        <h3 className="font-bold text-xl flex items-center gap-2 mb-6 text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display' }}>
          <FolderGit2 className="text-[#40C4D0]" /> Submission Guidelines
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-bold text-[#4A5DB5] flex items-center gap-2 mb-3">
                <Info size={18} /> Complete Guides
              </h4>
              <p className="text-sm text-[#4a4a4a] mb-2">
                Need help with your Python project code or putting your project on GitHub? Follow our comprehensive step-by-step guides.
              </p>
              <div className="flex flex-col gap-2">
                <ProjectGuideModal />
                <GithubGuideModal />
              </div>
            </div>
            <div>
               <p className="text-sm text-[#7A7268] bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex items-start gap-3">
                 <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
                 <span>Make sure to include your SQL schema inside a <code className="font-bold">README.md</code> or <code className="font-bold">schema.sql</code> file!</span>
               </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-bold text-[#4A5DB5] mb-3">Suggested Folder Structure</h4>
            <pre className="text-sm bg-white p-5 rounded-2xl border border-gray-200 overflow-x-auto text-gray-700 font-mono shadow-sm">
{`project/
│
├── main.py
├── database.py
├── requirements.txt
├── schema.sql
├── data/
└── reports/`}
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}
