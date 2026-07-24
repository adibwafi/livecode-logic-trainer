'use client';

import React, { useEffect, useState, useRef } from 'react';
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

  // Store callbacks in refs to decouple timer interval tick from render phase setStates
  const onTimeUpRef = useRef(onTimeUp);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUp, onTimeUpdate]);

  // Reset timer when initialMinutes prop changes
  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  // Pure interval countdown without executing external side-effects inside reducer callback
  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsLeft <= 0]);

  // Safely notify parent callbacks outside render phase
  useEffect(() => {
    if (onTimeUpdateRef.current) {
      onTimeUpdateRef.current(secondsLeft);
    }
    if (secondsLeft === 0) {
      onTimeUpRef.current();
    }
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsLeft <= 300; // < 5 minutes
  const isWarningTime = secondsLeft <= 600 && secondsLeft > 300; // < 10 minutes

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
        isLowTime
          ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse'
          : isWarningTime
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 shadow-sm'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-rose-400' : 'text-zinc-400'}`} />
      <span className="font-semibold tracking-wider">{formattedTime}</span>

      {isLowTime && (
        <span className="flex items-center gap-1 text-[10px] font-sans font-medium text-rose-400 bg-rose-900/40 px-1.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Time Warning
        </span>
      )}

      <button
        onClick={onTogglePause}
        className="ml-0.5 p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors"
        title={isPaused ? 'Resume Timer' : 'Pause Timer'}
      >
        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
}
