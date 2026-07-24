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
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-slate-200 shrink-0">
      {/* Left Title section */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Back to Problems"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100">{problem.title}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {problem.role}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
              {problem.level}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Run Tests
        </button>

        <button
          onClick={onSubmitAssessment}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
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
