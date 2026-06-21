// ═══ qubitedge LMS — TypeScript Types ═══

export type Role = 'intern' | 'admin';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type SubmissionFormat = 'pdf' | 'zip' | 'github' | 'text';
export type AnnouncementType = 'general' | 'important' | 'deadline';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  domain: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  performance_percentage: number;
  created_at: string;
}

export interface Week {
  id: string;
  title: string;
  domain: string;
  week_number: number;
  start_date: string;
}

export interface Day {
  id: string;
  week_id: string;
  day_number: number;
  date: string;
  topic: string;
  description: string | null;
  resource_link: string | null;
  tutor_name: string | null;
  video_url: string | null;
  sub_topics: string | null;
  quiz_link: string | null;
  task_link: string | null;
}

export interface Quiz {
  id: string;
  day_id: string;
  questions: QuizQuestion[];
  max_score: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

export interface Score {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  attempted_at: string;
  answers: number[] | null;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  checked_in_at: string;
}

export interface Task {
  id: string;
  day_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  accepted_formats: SubmissionFormat[];
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  format: SubmissionFormat;
  content: string | null;
  file_path: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  submitted_at: string;
}

export interface ProjectSubmission {
  id: string;
  user_id: string;
  project_id: number;
  project_name: string;
  github_url: string;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  message: string;
  posted_by: string;
  posted_at: string;
  is_active: boolean;
}

// ═══ Extended types with joins ═══

export interface DayWithQuiz extends Day {
  quiz: Quiz | null;
  task: Task | null;
}

export interface DayWithStatus extends DayWithQuiz {
  status: 'locked' | 'active' | 'completed' | 'missed' | 'expired';
  score?: number;
  hasAttendance?: boolean;
  hasSubmission?: boolean;
  isRevisionDay?: boolean;
}

export interface WeekWithDays extends Week {
  days: DayWithStatus[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  domain: string | null;
  score: number;
  current_streak: number;
}

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  progressPercent: number;
  attendanceCount: number;
  totalDays: number;
  leaderboardRank: number;
  quizzesCompleted: number;
  tasksSubmitted: number;
}
