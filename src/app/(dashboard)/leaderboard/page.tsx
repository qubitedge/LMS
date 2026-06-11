import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import LeaderboardContent from '@/components/leaderboard/leaderboard-content';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Use admin client to bypass scores RLS select policy for leaderboard calculation
  const adminSupabase = createAdminClient();

  // Helper to fetch all rows circumventing Supabase 1000 row limit
  async function fetchAll(table: string, columns: string) {
    let allData: any[] = [];
    let page = 0;
    while (true) {
      const { data, error } = await adminSupabase.from(table).select(columns).range(page * 1000, (page + 1) * 1000 - 1);
      if (error || !data || data.length === 0) break;
      allData.push(...data);
      if (data.length < 1000) break;
      page++;
    }
    return allData;
  }

  // Fetch all necessary data for calculation
  const [profiles, scoresData] = await Promise.all([
    fetchAll('profiles', 'id, full_name, avatar_url, domain, role'),
    fetchAll('scores', 'user_id, score'),
  ]);

  // Group scores
  const scoreTotalMap = new Map<string, number>();
  
  scoresData?.forEach(s => {
    scoreTotalMap.set(s.user_id, (scoreTotalMap.get(s.user_id) || 0) + s.score);
  });

  // Calculate final leaderboard data
  const leaderboardEntries = (profiles || [])
    .filter(p => p.role !== 'admin' && p.domain?.toLowerCase() !== 'paid intern')
    .map(p => {
      const totalQuizScore = scoreTotalMap.get(p.id) || 0;
      
      return {
        user_id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        domain: p.domain,
        role: p.role,
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
