'use client';

import React from 'react';
import { RecruiterPersona, TestRunResult } from '@/lib/types';
import { Coffee, ShieldCheck, Rocket, MessageSquareQuote } from 'lucide-react';

interface RecruiterMoodMeterProps {
  secondsSpent: number;
  totalSeconds: number;
  testRun: TestRunResult | null;
  isSubmitting: boolean;
  persona: RecruiterPersona;
  onPersonaChange: (p: RecruiterPersona) => void;
}

export default function RecruiterMoodMeter({
  secondsSpent,
  totalSeconds,
  testRun,
  isSubmitting,
  persona,
  onPersonaChange
}: RecruiterMoodMeterProps) {
  const personas: { id: RecruiterPersona; name: string; avatar: string; icon: any }[] = [
    { id: 'indo-tech-lead', name: 'Indo Tech Lead', avatar: '☕', icon: Coffee },
    { id: 'faang-interviewer', name: 'FAANG Lead', avatar: '🧐', icon: ShieldCheck },
    { id: 'yc-founder', name: 'YC Founder', avatar: '🚀', icon: Rocket }
  ];

  const ratio = totalSeconds > 0 ? secondsSpent / totalSeconds : 0;

  const getCommentary = (): string => {
    if (isSubmitting) {
      if (persona === 'indo-tech-lead') return 'Sip! Gw check sebentar jawaban dan bonus logic lu ya...';
      if (persona === 'faang-interviewer') return 'Evaluating code structure, edge cases, and algorithmic complexity...';
      return 'Awesome effort! Running full AI code review now...';
    }

    if (testRun) {
      if (testRun.passedCount === testRun.totalCount && testRun.totalCount > 0) {
        if (persona === 'indo-tech-lead') return 'Mantap! Semua unit test lokal PASS! Siap submit bro! 🎉';
        if (persona === 'faang-interviewer') return 'All local test assertions passed. Excellent boundary condition handling. 🛡️';
        return 'Boom! 100% test pass rate. Submit it and let us ship! 🚀';
      } else {
        if (persona === 'indo-tech-lead') return 'Ada test yang gagal bro, tenang aja, cek log console lalu adjust logic-nya! 💡';
        if (persona === 'faang-interviewer') return 'Some test cases failed. Take a minute to debug your error status codes.';
        return 'Few bugs remaining. Quick fix and hit Run Tests again!';
      }
    }

    if (ratio < 0.3) {
      if (persona === 'indo-tech-lead') return 'Waktu masih santai bro, pahami requirement & struktur in-memory data-nya.';
      if (persona === 'faang-interviewer') return 'Take time to structure your architecture cleanly before coding.';
      return 'Let us build a clean initial prototype rapidly!';
    } else if (ratio < 0.75) {
      if (persona === 'indo-tech-lead') return 'Kodingan rapi! Jangan lupa test status HTTP 400 & 404 ya.';
      if (persona === 'faang-interviewer') return 'Focus on input sanitization and returning clean JSON responses.';
      return 'Great momentum! Run your local test suite soon.';
    } else {
      if (persona === 'indo-tech-lead') return 'Tinggal beberapa menit lagi bro! Yuk klik "Run Tests" di bawah!';
      if (persona === 'faang-interviewer') return 'Under 5 minutes remaining. Finalize your implementation & submit.';
      return 'Crunch time! Test your endpoint now!';
    }
  };

  const activePersona = personas.find((p) => p.id === persona) || personas[0];

  return (
    <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 rounded-full px-3.5 py-1.5 shadow-sm text-xs font-sans">
      {/* Persona Selector Dropdown Pill */}
      <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3">
        <span className="text-base leading-none">{activePersona.avatar}</span>
        <select
          value={persona}
          onChange={(e) => onPersonaChange(e.target.value as RecruiterPersona)}
          className="bg-transparent text-zinc-300 font-medium focus:outline-none cursor-pointer hover:text-white text-xs"
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recruiter Live Speech Commentary */}
      <div className="flex items-center gap-2 text-zinc-300 max-w-xs md:max-w-md truncate">
        <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate text-[11px] font-medium text-zinc-300">
          "{getCommentary()}"
        </span>
      </div>
    </div>
  );
}
