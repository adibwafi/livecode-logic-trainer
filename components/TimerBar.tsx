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
    const timeoutId = setTimeout(() => {
      setSecondsLeft(initialMinutes * 60);
    }, 0);
    return () => clearTimeout(timeoutId);
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
        background: 'rgba(254, 242, 242, 0.95)',
        border: '1px solid rgba(248, 113, 113, 0.6)',
        color: 'rgb(185, 28, 28)',
        animation: 'dangerPulse 1.5s cubic-bezier(0.4,0,0.2,1) infinite',
      }
    : isWarningTime
    ? {
        background: 'rgba(255, 251, 235, 0.95)',
        border: '1px solid rgba(251, 191, 36, 0.6)',
        color: 'rgb(180, 83, 9)',
        boxShadow: '0 0 0 1px rgba(245,158,11,0.2), 0 2px 10px rgba(245,158,11,0.1)',
      }
    : {
        background: 'rgba(244, 244, 245, 0.9)',
        border: '1px solid rgba(228, 228, 231, 1)',
        color: 'rgb(39, 39, 42)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      };

  const elapsedSeconds = initialMinutes * 60 - secondsLeft;
  const isPrepPhase = elapsedSeconds < 300; // First 5 minutes

  return (
    <div className="flex items-center gap-2">
      {/* Live Coding Phase Badge */}
      <span
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
        style={{
          background: isPrepPhase ? 'rgba(238, 242, 255, 0.95)' : 'rgba(240, 253, 244, 0.95)',
          color: isPrepPhase ? 'rgb(67, 56, 202)' : 'rgb(21, 128, 61)',
          border: isPrepPhase ? '1px solid rgba(199, 210, 254, 0.8)' : '1px solid rgba(187, 247, 208, 0.8)',
        }}
        title={isPrepPhase ? 'Fase 5 Menit: Pahami soal, batasan, dan rancang algoritma' : 'Fase 15 Menit: Tulis kode solusi & jalankan unit test'}
      >
        {isPrepPhase ? '📖 5m Prep Phase' : '⚡ Live Coding Phase'}
      </span>

      <div
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-sm shadow-xs"
        style={{
          ...stateStyles,
          transition: 'background 400ms cubic-bezier(0.16,1,0.3,1), border-color 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms cubic-bezier(0.16,1,0.3,1), color 400ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <Clock
          className="w-3.5 h-3.5"
          style={{ color: isLowTime ? 'rgb(220, 38, 38)' : isWarningTime ? 'rgb(217, 119, 6)' : 'rgb(113, 113, 122)' }}
        />
        <span className="font-semibold tracking-wider">{formattedTime}</span>

        {isLowTime && (
          <span
            className="flex items-center gap-1 text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full animate-scale-in"
            style={{ background: 'rgba(254,226,226,1)', color: 'rgb(185,28,28)' }}
          >
            <AlertTriangle className="w-3 h-3" /> {t('timeWarning')}
          </span>
        )}

        <button
          onClick={onTogglePause}
          className="ml-0.5 p-1 rounded-full text-zinc-500 hover:text-zinc-900 btn-glass"
          style={{ transition: 'background 150ms cubic-bezier(0.16,1,0.3,1), color 150ms cubic-bezier(0.16,1,0.3,1)' }}
          title={isPaused ? t('resumeTimer') : t('pauseTimer')}
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
