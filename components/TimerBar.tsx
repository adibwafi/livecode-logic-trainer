'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';

interface TimerBarProps {
  initialMinutes: number;
  onTimeUp: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onTimeUpdate?: (secondsLeft: number) => void;
}

export default function TimerBar({
  initialMinutes,
  onTimeUp,
  isPaused,
  onTogglePause,
  onTimeUpdate
}: TimerBarProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialMinutes * 60);

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (onTimeUpdate) onTimeUpdate(next);
        if (next <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, isPaused, onTimeUp, onTimeUpdate]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsLeft <= 300; // < 5 minutes
  const isWarningTime = secondsLeft <= 600 && secondsLeft > 300; // < 10 minutes

  return (
    <div
      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border font-mono transition-all duration-300 ${
        isLowTime
          ? 'bg-rose-950/40 border-rose-600/60 text-rose-400 animate-pulse shadow-lg shadow-rose-900/20'
          : isWarningTime
          ? 'bg-amber-950/30 border-amber-600/50 text-amber-300'
          : 'bg-slate-900 border-slate-700 text-cyan-400'
      }`}
    >
      <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-cyan-400'}`} />
      <span className="text-base font-bold tracking-wider">{formattedTime}</span>

      {isLowTime && (
        <span className="flex items-center gap-1 text-xs font-sans font-semibold text-rose-400 bg-rose-900/50 px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> Time Limit Warning
        </span>
      )}

      <button
        onClick={onTogglePause}
        className="ml-1 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
        title={isPaused ? 'Resume Timer' : 'Pause Timer'}
      >
        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
