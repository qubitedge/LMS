import { format, isToday, isBefore, isAfter, parseISO } from 'date-fns';

export type DayLockStatus = 'locked' | 'active' | 'completed' | 'missed' | 'expired';

/**
 * Determines the lock status of a day based on its calendar date and whether the user has attempted the quiz.
 */
export function getDayStatus(
  dayDate: string,
  hasAttempted: boolean
): DayLockStatus {
  const date = parseISO(dayDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isToday(date)) {
    return hasAttempted ? 'completed' : 'active';
  }

  if (isBefore(date, today)) {
    return hasAttempted ? 'completed' : 'missed';
  }

  if (isAfter(date, today)) {
    return 'locked';
  }

  return 'locked';
}

/**
 * Returns a human-readable label for a given day lock status.
 */
export function getDayStatusLabel(
  status: DayLockStatus,
  dayDate: string,
  score?: number,
  maxScore?: number
): string {
  switch (status) {
    case 'locked':
      return `🔒 Locked — Opens ${format(parseISO(dayDate), 'MMM d')}`;
    case 'active':
      return '📝 Attempt Today\'s Quiz';
    case 'completed':
      return score !== undefined && maxScore !== undefined
        ? `✅ Completed — ${score}/${maxScore}`
        : '✅ Completed';
    case 'missed':
      return '❌ Missed — Expired';
    default:
      return '';
  }
}

/**
 * Server-side validation: checks if a quiz can be attempted today and within the time window.
 */
export function canAttemptQuiz(dayDate: string): boolean {
  return isToday(parseISO(dayDate)) && isWithinQuizWindow();
}

/**
 * Checks if current time is within the allowed quiz window.
 * The quiz opens daily at 12:00 PM IST (12:00 PM - 5:00 PM IST).
 */
export function isWithinQuizWindow(): boolean {
  const now = new Date();
  // Get current time in India Standard Time
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // 12:00 PM (720) to 5 PM (1020)
  return totalMinutes >= 720 && totalMinutes < 1020;
}

/**
 * Helper to check if the current time is before the quiz window starts today.
 */
export function isBeforeQuizWindow(): boolean {
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  return totalMinutes < 720;
}

