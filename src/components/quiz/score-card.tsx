import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ScoreCardProps {
  score: number;
  maxScore: number;
}

export default function ScoreCard({ score, maxScore }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const isPass = percentage >= 70;
  
  const accentColor = isPass ? '#4A5DB5' : '#D95F5F';
  const message = isPass ? 'Great Job!' : 'Keep Practicing!';

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] max-w-md mx-auto overflow-hidden">
      <div className="h-3 w-full bg-gradient-to-r from-[#4A5DB5] to-[#7182C7]" />
      <CardContent className="pt-10 pb-8 text-center px-8 md:px-10">
        <div 
          className="mx-auto w-24 h-24 rounded-[2rem] bg-[#4A5DB5]/20 border border-[#4A5DB5]/30 flex items-center justify-center mb-6 text-[#A0ACDC] shadow-2xl shadow-[#4A5DB5]/20"
        >
          <Trophy size={48} className="text-[#A0ACDC]" />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight italic" style={{ fontFamily: 'Playfair Display' }}>
          {message}
        </h2>
        <p className="text-sm font-bold text-white/60 mb-8">
          You have completed today's quiz assessment.
        </p>

        <div className="py-8 px-6 rounded-[2rem] border-2 border-dashed border-white/20 bg-white/5 mb-8 backdrop-blur-sm shadow-inner">
          <p className="text-xs font-black text-[#A0ACDC] uppercase tracking-[0.2em] mb-2">Your Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-7xl font-black font-mono text-white">{score}</span>
            <span className="text-3xl font-bold text-white/40">/{maxScore}</span>
          </div>
        </div>

        <Link href="/progress">
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#4A5DB5] to-[#7182C7] hover:scale-[1.02] active:scale-95 transition-all text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/30 flex items-center justify-center border-none">
            <ArrowLeft size={18} className="mr-3" />
            Back to Curriculum
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
