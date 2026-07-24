'use client';

import React from 'react';
import Link from 'next/link';
import TimerBar from './TimerBar';
import { Problem } from '@/lib/types';
import { ArrowLeft, Play, Send, Loader2 } from 'lucide-react';

interface SessionHeaderProps {
  problem: Problem;
  onTimeUp: () => void;
  isTimerPaused: boolean;
  onToggleTimerPause: () => void;
  onRunTests: () => void;
  onSubmitAssessment: () => void;
  isSubmitting: boolean;
  onTimeUpdate: (seconds: number) => void;
}

export default function SessionHeader({
  problem,
  onTimeUp,
  isTimerPaused,
  onToggleTimerPause,
  onRunTests,
  onSubmitAssessment,
  isSubmitting,
  onTimeUpdate
}: SessionHeaderProps) {
  return (
    <header className="h-14 bg-zinc-950/90 border-b border-zinc-800/80 px-4 flex items-center justify-between text-zinc-200 shrink-0 backdrop-blur-xl">
      {/* Left Title section */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800/60"
          title="Back to Problems"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs md:text-sm font-semibold text-zinc-100">{problem.title}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
              {problem.role}
            </span>
          </div>
        </div>
      </div>

      {/* Center Timer */}
      <div className="flex items-center gap-2">
        <TimerBar
          initialMinutes={problem.timeLimit}
          onTimeUp={onTimeUp}
          isPaused={isTimerPaused}
          onTogglePause={onToggleTimerPause}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRunTests}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          Run Tests
        </button>

        <button
          onClick={onSubmitAssessment}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Submit Assessment
            </>
          )}
        </button>
      </div>
    </header>
  );
}
