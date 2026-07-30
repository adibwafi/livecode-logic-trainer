'use client';

/**
 * components/AdaptiveTracker.tsx
 * EdTech-style adaptive progress tracking component.
 *
 * Displays:
 *  - SVG donut ring: completion rate
 *  - Animated number counters: avg score, avg time
 *  - Recent sessions list
 *
 * Reads from Zustand persistent store (localStorage-backed).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore, selectAvgScore, selectAvgTime } from '@/lib/store';
import { PROBLEMS } from '@/lib/problems';
import { TrendingUp, Clock, Target, CheckCircle2, Trophy } from 'lucide-react';

const TOTAL_PROBLEMS = PROBLEMS.length;
const RING_R = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

// Animated counter hook
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return value;
}

export default function AdaptiveTracker() {
  const { completedProblems, metrics } = useAppStore();

  const completionRate = TOTAL_PROBLEMS > 0 ? completedProblems.length / TOTAL_PROBLEMS : 0;
  const rawAvgScore = selectAvgScore({ completedProblems, metrics } as Parameters<typeof selectAvgScore>[0]);
  const rawAvgTime = selectAvgTime({ completedProblems, metrics } as Parameters<typeof selectAvgTime>[0]);

  const displayCompleted = useCountUp(completedProblems.length);
  const displayScore = useCountUp(rawAvgScore);
  const displayTime = useCountUp(Math.round(rawAvgTime / 60)); // convert to minutes

  // SVG donut arc
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - completionRate);

  const recentSessions = metrics.slice(-3).reverse();

  if (completedProblems.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-3 border border-zinc-200/80 bg-white/80 backdrop-blur-xl">
        <div className="inline-flex p-3 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Belum Ada Sesi Terselesaikan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Selesaikan salah satu tantangan 30 menit untuk membuka analisa progres adaptif dan skor AI kamu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-panel rounded-2xl p-5 space-y-4 w-full"
      style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}
      role="region"
      aria-label="Your progress tracker"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-violet-50 border border-violet-100">
          <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <span className="text-xs font-bold text-zinc-900 tracking-tight">Your Progress</span>
        <span className="ml-auto text-[10px] text-zinc-400 font-medium">
          {completedProblems.length} / {TOTAL_PROBLEMS} challenges
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4">
        {/* Donut Ring */}
        <div className="relative shrink-0" aria-label={`${Math.round(completionRate * 100)}% complete`}>
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            {/* Track */}
            <circle
              cx="44" cy="44" r={RING_R}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="7"
            />
            {/* Progress arc */}
            <circle
              cx="44" cy="44" r={RING_R}
              fill="none"
              stroke="url(#trackerGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
            />
            <defs>
              <linearGradient id="trackerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-extrabold text-zinc-900 leading-none font-mono">
              {displayCompleted}
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">done</span>
          </div>
        </div>

        {/* Metric pills */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">
              <Target className="w-3 h-3" />
              Avg Score
            </div>
            <div className="text-lg font-extrabold text-emerald-800 font-mono leading-none">
              {displayScore}
              <span className="text-xs font-normal text-emerald-600">/100</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold uppercase tracking-wide">
              <Clock className="w-3 h-3" />
              Avg Time
            </div>
            <div className="text-lg font-extrabold text-amber-800 font-mono leading-none">
              {displayTime}
              <span className="text-xs font-normal text-amber-600">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3 h-3" /> Recent Sessions
          </div>
          {recentSessions.map((m) => (
            <div
              key={m.completedAt}
              className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-zinc-50 border border-zinc-100"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className={`w-3 h-3 shrink-0 ${
                  m.status === 'PASS' ? 'text-emerald-500' :
                  m.status === 'PARTIAL' ? 'text-amber-500' : 'text-rose-500'
                }`} />
                <span className="text-zinc-700 font-medium truncate">{m.problemTitle}</span>
              </div>
              <span className={`font-mono font-bold shrink-0 ml-2 ${
                m.score >= 80 ? 'text-emerald-600' :
                m.score >= 55 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {m.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
