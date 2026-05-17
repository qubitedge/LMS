'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/types';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuizPlayerProps {
  quizId: string;
  questions: QuizQuestion[];
}

export default function QuizPlayer({ quizId, questions }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResult, setShowResult] = useState(false);
  
  const router = useRouter();
  const currentQ = questions[currentIdx];

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIdx] = selectedOption;
    setAnswers(newAnswers);
    
    setShowResult(true);
  };

  const handleContinue = async () => {
    setShowResult(false);
    setSelectedOption(null);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    let score = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].correct_index) {
        score++;
      }
    });

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, score, answers }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Submission failed');
      }

      toast.success('Quiz completed successfully!');
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-[#A0ACDC]">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <span className="text-sm font-black text-[#7182C7]">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="h-2 w-full bg-white/10 backdrop-blur-sm rounded-full mb-8 overflow-hidden p-0.5 border border-white/10">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-[#4A5DB5] to-[#7182C7] transition-all duration-500 shadow-lg shadow-blue-500/50" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-white mb-8 leading-relaxed tracking-tight">
            {currentQ.question}
          </h2>

          <div className="space-y-4 mb-10">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let borderClass = 'border-2 border-white/10';
              let bgClass = 'bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/90';
              let iconEl = null;
              
              if (isSelected && !showResult) {
                borderClass = 'border-2 border-[#4A5DB5]';
                bgClass = 'bg-[#4A5DB5]/20 text-white shadow-xl shadow-[#4A5DB5]/20';
              } else if (showResult) {
                if (idx === currentQ.correct_index) {
                  borderClass = 'border-2 border-emerald-500';
                  bgClass = 'bg-emerald-500/20 text-white shadow-xl shadow-emerald-500/20';
                  iconEl = <CheckCircle2 size={22} className="text-emerald-400 shrink-0 ml-4" />;
                } else if (isSelected && idx !== currentQ.correct_index) {
                  borderClass = 'border-2 border-rose-500';
                  bgClass = 'bg-rose-500/20 text-white shadow-xl shadow-rose-500/20';
                  iconEl = <XCircle size={22} className="text-rose-400 shrink-0 ml-4" />;
                } else {
                  bgClass = 'bg-white/5 text-white/40 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showResult && handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${borderClass} ${bgClass} flex justify-between items-center font-bold text-sm md:text-base`}
                >
                  <span className="leading-normal">{opt}</span>
                  {iconEl}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            {!showResult ? (
              <Button 
                onClick={handleNext} 
                disabled={selectedOption === null}
                className="h-14 px-10 rounded-2xl bg-gradient-to-r from-[#4A5DB5] to-[#7182C7] hover:scale-[1.02] active:scale-95 transition-all text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/30 disabled:opacity-50 disabled:hover:scale-100"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleContinue} 
                disabled={isSubmitting}
                className="h-14 px-10 rounded-2xl bg-white hover:bg-slate-100 text-[#1A1A2E] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center hover:scale-[1.02] active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Continue <ArrowRight size={18} className="ml-3" /></>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
