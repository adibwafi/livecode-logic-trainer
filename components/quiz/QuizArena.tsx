'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  QuizSessionState,
  QuizAnswerRecord,
} from '@/lib/quiz/types';
import {
  QUESTION_TIME_LIMIT_SEC,
  TOTAL_SESSION_MAX_TIME_SEC,
  calculateKahootScore,
} from '@/lib/quiz/quiz-engine';
import {
  playSuccessSound,
  playErrorSound,
  playQuizTickSound,
  playQuizStreakSound,
  playQuizTimeoutSound,
  playQuizSelectSound,
  isSoundMuted,
  setSoundMuted,
} from '@/lib/soundFX';
import {
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronRight,
} from 'lucide-react';

interface QuizArenaProps {
  session: QuizSessionState;
  onAnswerQuestion: (record: QuizAnswerRecord) => void;
  onFinishSession: () => void;
  onExit: () => void;
}

const OPTION_STYLES = [
  {
    id: 'A',
    icon: '▲',
    shape: 'Triangle',
    bgBase: 'bg-rose-500 hover:bg-rose-600',
    activeRing: 'ring-rose-400',
    border: 'border-rose-400',
    iconBg: 'bg-rose-700 text-white',
    shadow: 'shadow-rose-500/20',
  },
  {
    id: 'B',
    icon: '◆',
    shape: 'Diamond',
    bgBase: 'bg-blue-600 hover:bg-blue-700',
    activeRing: 'ring-blue-400',
    border: 'border-blue-400',
    iconBg: 'bg-blue-800 text-white',
    shadow: 'shadow-blue-500/20',
  },
  {
    id: 'C',
    icon: '●',
    shape: 'Circle',
    bgBase: 'bg-amber-500 hover:bg-amber-600',
    activeRing: 'ring-amber-400',
    border: 'border-amber-400',
    iconBg: 'bg-amber-700 text-white',
    shadow: 'shadow-amber-500/20',
  },
  {
    id: 'D',
    icon: '■',
    shape: 'Square',
    bgBase: 'bg-emerald-600 hover:bg-emerald-700',
    activeRing: 'ring-emerald-400',
    border: 'border-emerald-400',
    iconBg: 'bg-emerald-800 text-white',
    shadow: 'shadow-emerald-500/20',
  },
];

export function QuizArena({
  session,
  onAnswerQuestion,
  onFinishSession,
  onExit,
}: QuizArenaProps) {
  const currentQuestion = session.questions[session.currentIndex];
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(QUESTION_TIME_LIMIT_SEC);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(TOTAL_SESSION_MAX_TIME_SEC);
  const [muted, setMutedState] = useState<boolean>(false);
  const [earnedFeedback, setEarnedFeedback] = useState<{ points: number; streakBonus: number } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  useEffect(() => {
    setMutedState(isSoundMuted());
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMutedState(next);
    setSoundMuted(next);
  };

  // Reset state on question change
  useEffect(() => {
    setSelectedOptionId(null);
    setHasAnswered(false);
    hasAnsweredRef.current = false;
    setIsTimeout(false);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT_SEC);
    setEarnedFeedback(null);
    startTimeRef.current = Date.now();
  }, [session.currentIndex]);

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (optionId: string | null, timedOut = false) => {
      if (hasAnsweredRef.current) return;
      hasAnsweredRef.current = true;
      setHasAnswered(true);
      setSelectedOptionId(optionId);
      setIsTimeout(timedOut);

      const elapsedSec = Math.min(
        QUESTION_TIME_LIMIT_SEC,
        Math.max(0.1, (Date.now() - startTimeRef.current) / 1000)
      );

      const isCorrect = !timedOut && optionId === currentQuestion.correctOptionId;
      const scoreResult = calculateKahootScore(
        isCorrect,
        elapsedSec,
        QUESTION_TIME_LIMIT_SEC,
        session.streak
      );

      setEarnedFeedback(scoreResult);

      if (timedOut) {
        playQuizTimeoutSound();
      } else if (isCorrect) {
        if (session.streak + 1 >= 3) {
          playQuizStreakSound();
        } else {
          playSuccessSound();
        }
      } else {
        playErrorSound();
      }

      const answerRecord: QuizAnswerRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion,
        selectedOptionId: optionId,
        isCorrect,
        isTimeout: timedOut,
        timeSpentSec: elapsedSec,
        pointsEarned: scoreResult.points,
        streakAtAnswer: isCorrect ? session.streak + 1 : 0,
      };

      onAnswerQuestion(answerRecord);
    },
    [currentQuestion, onAnswerQuestion, session.streak]
  );

  // Per-Question & Global Countdown Timer
  useEffect(() => {
    if (hasAnswered) return;

    timerIntervalRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleSelectOption(null, true);
          return 0;
        }

        // Tense ticking sound in last 8 seconds
        if (prev <= 8) {
          playQuizTickSound();
        }

        return prev - 1;
      });

      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          onFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [hasAnswered, handleSelectOption, onFinishSession]);

  // Keyboard Navigation: keys 1, 2, 3, 4 or A, B, C, D to answer, Space/Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!hasAnswered) {
        const key = e.key.toUpperCase();
        if (key === '1' || key === 'A') {
          playQuizSelectSound();
          handleSelectOption('A');
        } else if (key === '2' || key === 'B') {
          playQuizSelectSound();
          handleSelectOption('B');
        } else if (key === '3' || key === 'C') {
          playQuizSelectSound();
          handleSelectOption('C');
        } else if (key === '4' || key === 'D') {
          playQuizSelectSound();
          handleSelectOption('D');
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, handleSelectOption]);

  const handleNext = () => {
    if (session.currentIndex + 1 >= session.questions.length) {
      onFinishSession();
    } else {
      session.currentIndex += 1;
      setSelectedOptionId(null);
      setHasAnswered(false);
      hasAnsweredRef.current = false;
      setIsTimeout(false);
      setQuestionTimeLeft(QUESTION_TIME_LIMIT_SEC);
      setEarnedFeedback(null);
      startTimeRef.current = Date.now();
    }
  };

  const progressPercent = ((session.currentIndex + 1) / session.questions.length) * 100;
  const timeProgressPercent = (questionTimeLeft / QUESTION_TIME_LIMIT_SEC) * 100;

  const formatMinutes = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerCritical = questionTimeLeft <= 10;
  const isTimerWarning = questionTimeLeft <= 20 && !isTimerCritical;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between selection:bg-violet-500/20 overflow-x-hidden">
      {/* ── TOP HUD HEADER ── */}
      <header
        className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl sticky top-0 z-30 px-4 md:px-8 py-3.5"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Exit & Track Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-xs text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover-lift btn-glass transition-all"
            >
              Keluar
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                  session.track === 'backend'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-violet-50 border-violet-200 text-violet-800'
                }`}
              >
                {session.track === 'backend' ? '☕ Backend Track' : '⚡ Frontend Track'}
              </span>
              <span className="hidden sm:inline-block text-xs text-zinc-500 font-mono">
                Soal <span className="text-zinc-900 font-bold">{session.currentIndex + 1}</span>/{session.questions.length}
              </span>
            </div>
          </div>

          {/* Center: Live Timer and Streak */}
          <div className="flex items-center gap-4">
            {session.streak >= 2 && (
              <m.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500" />
                <span>{session.streak}x STREAK!</span>
              </m.div>
            )}

            {/* Global 30-min countdown */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatMinutes(sessionTimeLeft)}</span>
            </div>
          </div>

          {/* Right: Score & Audio Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block leading-none">Score</span>
              <span className="text-base md:text-lg font-black tracking-tight text-zinc-900 font-mono">
                {session.score.toLocaleString()}
              </span>
            </div>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors btn-glass"
              aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full bg-zinc-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <m.div
            className="h-full bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* ── QUESTION & TIMER SECTION ── */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Per-Question Tension Timer Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold text-[11px] shadow-xs">
                <Award className="w-3 h-3 text-amber-500" />
                {currentQuestion.companyTag}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 text-xs font-mono">{currentQuestion.category}</span>
            </div>

            {/* Countdown seconds indicator */}
            <div
              className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                isTimerCritical
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : isTimerWarning
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{questionTimeLeft}s</span>
            </div>
          </div>

          {/* Time Bar */}
          <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-200">
            <m.div
              className={`h-full rounded-full transition-colors ${
                isTimerCritical
                  ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : isTimerWarning
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              }`}
              initial={false}
              animate={{ width: `${timeProgressPercent}%` }}
              transition={{ duration: 0.2, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Question Prompt Box */}
        <m.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 text-xs text-zinc-500">
            <span>Tingkat: <strong className="text-zinc-800">{currentQuestion.difficulty}</strong></span>
            <span className="text-[11px] text-zinc-400">Shortcut: Tekan tombol [1, 2, 3, 4]</span>
          </div>

          <h1 className="text-lg md:text-2xl font-bold text-zinc-950 leading-relaxed tracking-tight">
            {currentQuestion.question}
          </h1>

          {/* Code Snippet Box (Dark Monaco-style container inside light panel) */}
          {currentQuestion.codeSnippet && (
            <div className="mt-5 rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-md">
              <div className="bg-[#121216] px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-[11px] text-zinc-400">
                    snippet.{currentQuestion.codeLanguage || 'js'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Console / Code</span>
              </div>
              <pre className="p-4 md:p-5 font-mono text-xs md:text-sm text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            </div>
          )}
        </m.div>

        {/* ── KAHOOT-STYLE 4 OPTIONS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => {
            const style = OPTION_STYLES[idx % 4];
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === currentQuestion.correctOptionId;

            let cardStateClasses = `${style.bgBase} text-white shadow-md ${style.shadow}`;
            if (hasAnswered) {
              if (isCorrect) {
                cardStateClasses =
                  'bg-emerald-600 text-white ring-4 ring-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.5)] scale-[1.01]';
              } else if (isSelected && !isCorrect) {
                cardStateClasses = 'bg-rose-900 border-2 border-rose-500 text-rose-100 opacity-80';
              } else {
                cardStateClasses = 'bg-zinc-100 border border-zinc-200 text-zinc-400 opacity-40';
              }
            }

            return (
              <m.button
                key={option.id}
                onClick={() => {
                  if (!hasAnswered) {
                    playQuizSelectSound();
                    handleSelectOption(option.id);
                  }
                }}
                disabled={hasAnswered}
                whileHover={!hasAnswered ? { scale: 1.015, translateY: -2 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                className={`relative p-5 md:p-6 rounded-2xl flex items-center justify-between text-left transition-all duration-200 cursor-pointer min-h-[90px] md:min-h-[105px] select-none btn-glass hover-lift ${cardStateClasses}`}
              >
                <div className="flex items-center gap-4 w-full pr-4">
                  <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                    {style.icon}
                  </div>
                  <span className="font-semibold text-sm md:text-base leading-snug whitespace-pre-line">
                    {option.label}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!hasAnswered && (
                    <span className="hidden sm:inline-block px-2 py-1 rounded bg-black/20 text-[11px] font-mono font-bold opacity-80">
                      {idx + 1}
                    </span>
                  )}

                  {hasAnswered && isCorrect && (
                    <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}

                  {hasAnswered && isSelected && !isCorrect && (
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg">
                      <XCircle className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </m.button>
            );
          })}
        </div>
      </main>

      {/* ── ANSWER FEEDBACK MODAL / DRAWER OVERLAY ── */}
      <AnimatePresence>
        {hasAnswered && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 bg-white/95 border-t border-zinc-200 backdrop-blur-2xl shadow-2xl"
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  {isTimeout ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-extrabold text-base md:text-lg">
                      <AlertCircle className="w-5 h-5" /> Waktu Habis! (+0 pts)
                    </span>
                  ) : selectedOptionId === currentQuestion.correctOptionId ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold text-base md:text-lg">
                      <Sparkles className="w-5 h-5" /> Tepat Sekali! +{earnedFeedback?.points.toLocaleString()} pts
                      {earnedFeedback?.streakBonus ? (
                        <span className="text-amber-800 text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                          🔥 +{earnedFeedback.streakBonus} Combo!
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-rose-700 font-extrabold text-base md:text-lg">
                      <XCircle className="w-5 h-5" /> Kurang Tepat! (+0 pts)
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm text-zinc-600 line-clamp-2 max-w-2xl leading-relaxed">
                  <strong className="text-zinc-900">Penjelasan:</strong> {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-bold text-sm shadow-md hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 btn-glass"
                >
                  <span>{session.currentIndex + 1 >= session.questions.length ? 'Lihat Hasil Akhir' : 'Soal Berikutnya'}</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
