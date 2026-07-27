'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TimerBar from './TimerBar';
import RecruiterMoodMeter from './RecruiterMoodMeter';
import { Problem, RecruiterPersona, TestRunResult } from '@/lib/types';
import { isSoundMuted, setSoundMuted } from '@/lib/soundFX';
import { ArrowLeft, Play, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { t } from '@/lib/i18n';

interface SessionHeaderProps {
  problem: Problem;
  onTimeUp: () => void;
  isTimerPaused: boolean;
  onToggleTimerPause: () => void;
  onRunTests: () => void;
  onSubmitAssessment: () => void;
  isSubmitting: boolean;
  onTimeUpdate: (seconds: number) => void;
  secondsSpent: number;
  testRun: TestRunResult | null;
  persona: RecruiterPersona;
  onPersonaChange: (p: RecruiterPersona) => void;
}

export default function SessionHeader({
  problem,
  onTimeUp,
  isTimerPaused,
  onToggleTimerPause,
  onRunTests,
  onSubmitAssessment,
  isSubmitting,
  onTimeUpdate,
  secondsSpent,
  testRun,
  persona,
  onPersonaChange
}: SessionHeaderProps) {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  return (
    <header className="h-14 bg-zinc-950/90 border-b border-zinc-800/80 px-4 flex items-center justify-between text-zinc-200 shrink-0 backdrop-blur-xl gap-2">
      {/* Left Title section */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/"
          className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800/60"
          title={t('backToProblems')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-semibold text-zinc-100 truncate max-w-[200px] md:max-w-xs">{problem.title}</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 shrink-0">
              {problem.role}
            </span>
          </div>
        </div>
      </div>

      {/* Recruiter Mood Meter (Center-Left) */}
      <div className="hidden lg:flex items-center">
        <RecruiterMoodMeter
          secondsSpent={secondsSpent}
          totalSeconds={problem.timeLimit * 60}
          testRun={testRun}
          isSubmitting={isSubmitting}
          persona={persona}
          onPersonaChange={onPersonaChange}
        />
      </div>

      {/* Center Timer */}
      <div className="flex items-center gap-2 shrink-0">
        <TimerBar
          initialMinutes={problem.timeLimit}
          onTimeUp={onTimeUp}
          isPaused={isTimerPaused}
          onTogglePause={onToggleTimerPause}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Right Action & Audio buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 text-xs transition-all"
          title={muted ? 'Unmute Web Audio' : 'Mute Web Audio'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={onRunTests}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          {t('runTests')}
        </button>

        <button
          onClick={onSubmitAssessment}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t('evaluating')}
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              {t('submit')}
            </>
          )}
        </button>
      </div>
    </header>
  );
}

