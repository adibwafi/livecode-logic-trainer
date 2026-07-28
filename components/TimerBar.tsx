'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';
import { t } from '@/lib/i18n';

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

  // Store callbacks in refs to decouple timer interval from render phase
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

  // Pure interval countdown — no external side-effects inside reducer
  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, secondsLeft <= 0]);

  // Safely notify parent callbacks outside render phase
  useEffect(() => {
    if (onTimeUpdateRef.current) onTimeUpdateRef.current(secondsLeft);
    if (secondsLeft === 0) onTimeUpRef.current();
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime     = secondsLeft <= 300;              // < 5 min
  const isWarningTime = secondsLeft <= 600 && secondsLeft > 300; // < 10 min

  // Compute dynamic classes and styles for cinematic state transitions
  const stateStyles = isLowTime
    ? {
        background: 'rgba(127, 29, 29, 0.35)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        color: 'rgb(252, 165, 165)',
        animation: 'dangerPulse 1.5s cubic-bezier(0.4,0,0.2,1) infinite',
      }
    : isWarningTime
    ? {
        background: 'rgba(120, 53, 15, 0.30)',
        border: '1px solid rgba(245, 158, 11, 0.40)',
        color: 'rgb(252, 211, 77)',
        boxShadow: '0 0 0 1px rgba(245,158,11,0.25), 0 0 16px rgba(245,158,11,0.15)',
      }
    : {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: 'rgb(228, 228, 231)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
      };

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-sm"
      style={{
        ...stateStyles,
        transition: 'background 400ms cubic-bezier(0.16,1,0.3,1), border-color 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms cubic-bezier(0.16,1,0.3,1), color 400ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Clock
        className="w-3.5 h-3.5"
        style={{ color: isLowTime ? 'rgb(248, 113, 113)' : isWarningTime ? 'rgb(251, 191, 36)' : 'rgb(113, 113, 122)' }}
      />
      <span className="font-semibold tracking-wider">{formattedTime}</span>

      {isLowTime && (
        <span
          className="flex items-center gap-1 text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full animate-scale-in"
          style={{ background: 'rgba(239,68,68,0.18)', color: 'rgb(252,165,165)' }}
        >
          <AlertTriangle className="w-3 h-3" /> {t('timeWarning')}
        </span>
      )}

      <button
        onClick={onTogglePause}
        className="ml-0.5 p-1 rounded-full text-zinc-400 hover:text-zinc-100 btn-glass"
        style={{ transition: 'background 150ms cubic-bezier(0.16,1,0.3,1), color 150ms cubic-bezier(0.16,1,0.3,1)' }}
        title={isPaused ? t('resumeTimer') : t('pauseTimer')}
      >
        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
}
