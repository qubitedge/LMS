'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Code, BookOpen } from 'lucide-react';


export default function GithubGuideModal() {
  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="outline" className="w-full justify-start text-left h-auto py-3 bg-white hover:bg-slate-50 text-[#4A5DB5] border-[#4A5DB5]/20 hover:border-[#4A5DB5]/40 mt-2">
          <BookOpen size={16} className="mr-2 shrink-0" />
          <span className="font-semibold text-sm">View Complete Step-by-Step GitHub Guide</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-4xl w-[95vw] md:w-[90vw] rounded-3xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Playfair Display', color: '#2C2C2C' }}>
            <Code size={24} /> Complete GitHub Submission Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pb-10 text-[#4a4a4a]">
            
            {/* Step 1 & 2 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 1: Create a GitHub Account</h3>
              <p className="mb-2">If you don't already have one:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Go to GitHub</li>
                <li>Click Sign Up</li>
                <li>Verify your email</li>
                <li>Log in</li>
              </ul>
            </section>

            {/* Step 3 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 3: Create a New Repository</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Click the <span className="font-bold">+</span> icon (top right)</li>
                <li>Select <strong>New Repository</strong></li>
                <li>Repository Name Example: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">student-attendance-system</code> or <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">expense-tracker</code></li>
                <li>Set visibility to: <strong>Public ✅ (Recommended)</strong></li>
                <li>Click <strong>Create Repository</strong></li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm font-semibold mb-2">GitHub will show commands similar to:</p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono break-all">
                  git remote add origin https://github.com/yourusername/project-name.git
                </code>
                <p className="text-xs text-gray-500 mt-2 font-bold italic">Keep this page open.</p>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 4: Initialize Git in Your Project</h3>
              <p className="mb-2">Open Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows).</p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Navigate to your project folder:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">cd path/to/project</code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Initialize Git:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git init</code>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Output: <code className="text-gray-800 bg-gray-100 px-1 rounded">Initialized empty Git repository</code></p>
                  <p className="italic mt-1">This tells Git to start tracking your project files.</p>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 5: Add Files to Git</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Check project status:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git status</code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Add all files:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git add .</code>
                  <p className="text-xs text-gray-500 mt-1">This stages all project files for commit.</p>
                </div>
              </div>
            </section>

            {/* Step 6 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 6: Commit Your Project</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Create your first commit:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git commit -m "Initial project submission"</code>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Example output: <code className="text-gray-800 bg-gray-100 px-1 rounded">10 files changed</code></p>
                  <p className="italic mt-1">A commit is like a snapshot of your project.</p>
                </div>
              </div>
            </section>

            {/* Step 7 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 7: Connect Your GitHub Repository</h3>
              <div className="space-y-4">
                <p className="text-sm">Copy the repository URL from GitHub (Example: <code>https://github.com/john/student-attendance-system.git</code>)</p>
                <div>
                  <p className="text-sm font-medium mb-1">Connect local project to GitHub:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono break-all">git remote add origin https://github.com/john/student-attendance-system.git</code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Verify:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git remote -v</code>
                </div>
              </div>
            </section>

            {/* Step 8 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 8: Push Your Project to GitHub</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Rename branch to main:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git branch -M main</code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Push project:</p>
                  <code className="block bg-gray-900 text-white p-3 rounded-lg text-sm font-mono">git push -u origin main</code>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-sm">
                  <p className="font-bold text-yellow-800 mb-1">If prompted:</p>
                  <ul className="list-disc list-inside text-yellow-700 ml-2">
                    <li>Enter GitHub username</li>
                    <li>Enter Personal Access Token (PAT)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step 9 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 9: Verify Upload</h3>
              <p className="mb-2">Open your repository in GitHub and verify you can see:</p>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">✅ Python files</li>
                <li className="flex items-center gap-2">✅ SQL schema</li>
                <li className="flex items-center gap-2">✅ README</li>
                <li className="flex items-center gap-2">✅ Screenshots</li>
                <li className="flex items-center gap-2">✅ Reports</li>
              </ul>
            </section>

            {/* Step 10 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 10: Prepare README.md</h3>
              <p className="mb-4 text-sm">Your README should contain the following structure:</p>
              <div className="bg-white border rounded-xl overflow-hidden text-sm">
                <div className="bg-gray-100 px-4 py-2 border-b font-mono text-gray-500 text-xs">README.md</div>
                <pre className="p-4 overflow-x-auto whitespace-pre-wrap font-mono text-gray-800">
{`# Student Attendance Management System

## Problem Statement
Explain the business problem. (Example: Schools and colleges need a system to track student attendance and generate reports.)

## Features
- Student Registration
- Attendance Marking
- Attendance Reports
- Attendance Percentage

## Technologies Used
- Python
- SQLite
- SQL
- Git
- GitHub

## Database Schema
Include tables used:
- students
- courses
- attendance

## How to Run
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`

## Screenshots
Add screenshots showing the application working.`}
                </pre>
              </div>
            </section>

            {/* Step 11 */}
            <section>
              <h3 className="text-lg font-bold text-[#4A5DB5] mb-3">Step 11: Submit Your Repository</h3>
              <p className="mb-2">Submit your GitHub Repository URL using the blue <strong>Submit Project</strong> button on the Mini Projects page.</p>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-600 break-all">
                Example: https://github.com/john/student-attendance-system
              </div>
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
