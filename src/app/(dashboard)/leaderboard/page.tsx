import { createClient } from '@/lib/supabase/server';
import LeaderboardContent from '@/components/leaderboard/leaderboard-content';

export const revalidate = 0;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch only necessary data for calculation
  const [
    { data: profiles },
    { data: scoresData }
  ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, domain, role').eq('role', 'intern'),
    supabase.from('scores').select('user_id, score'),
  ]);

  // Group scores
  const scoreTotalMap = new Map<string, number>();
  
  scoresData?.forEach(s => {
    scoreTotalMap.set(s.user_id, (scoreTotalMap.get(s.user_id) || 0) + s.score);
  });

  // Calculate final leaderboard data
  const leaderboardEntries = (profiles || [])
    .map(p => {
      const totalQuizScore = scoreTotalMap.get(p.id) || 0;
      
      return {
        user_id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        domain: p.domain,
        score: totalQuizScore, // Rank only by quiz marks
      };
    });

  // Sort by Quiz Score
  leaderboardEntries.sort((a, b) => b.score - a.score);
  
  const entriesWithRank = leaderboardEntries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  return (
    <LeaderboardContent 
      entries={entriesWithRank} 
      currentUserId={user.id} 
    />
  );
}
