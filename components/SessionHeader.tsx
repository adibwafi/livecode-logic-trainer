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
    const timeoutId = setTimeout(() => {
      setMuted(isSoundMuted());
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  return (
    <header
      className="h-14 px-4 flex items-center justify-between text-zinc-900 shrink-0 gap-2 relative bg-white/80 backdrop-blur-2xl border-b border-zinc-200"
      style={{
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* Left — Title section */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/"
          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 btn-glass hover-lift"
          title={t('backToProblems')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-semibold text-zinc-900 truncate max-w-[200px] md:max-w-xs">
              {problem.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              {problem.role}
            </span>
          </div>
        </div>
      </div>

      {/* Center-Left — Recruiter Mood Meter */}
      <div className="hidden lg:flex items-center flex-1 justify-center">
        <RecruiterMoodMeter
          secondsSpent={secondsSpent}
          totalSeconds={problem.timeLimit * 60}
          testRun={testRun}
          isSubmitting={isSubmitting}
          persona={persona}
          onPersonaChange={onPersonaChange}
        />
      </div>

      {/* Center — Timer */}
      <div className="flex items-center gap-2 shrink-0">
        <TimerBar
          initialMinutes={problem.timeLimit}
          onTimeUp={onTimeUp}
          isPaused={isTimerPaused}
          onTogglePause={onToggleTimerPause}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Right — Action & Audio buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mute Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 btn-glass"
          title={muted ? 'Unmute Web Audio' : 'Mute Web Audio'}
        >
          {muted
            ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
            : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
          }
        </button>

        {/* Run Tests */}
        <button
          onClick={onRunTests}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-emerald-50 text-zinc-800 hover:text-emerald-700 border border-zinc-200 hover:border-emerald-300 text-xs font-medium btn-glass disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          {t('runTests')}
        </button>

        {/* Submit Assessment */}
        <button
          onClick={onSubmitAssessment}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold btn-glass hover-lift shadow-sm disabled:opacity-50"
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
