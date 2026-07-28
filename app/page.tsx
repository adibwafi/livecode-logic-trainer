'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems';
import { t } from '@/lib/i18n';
import {
  Code2,
  Clock,
  Sparkles,
  Terminal,
  BrainCircuit,
  Play
} from 'lucide-react';

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const roleFilters = [
    { key: 'ALL', label: t('allRoles') },
    { key: 'Backend', label: 'Backend Engineer' },
    { key: 'Frontend', label: 'Frontend Engineer' },
    { key: 'Full Stack', label: 'Full Stack Engineer' },
    { key: 'QA', label: 'QA Engineer' },
  ];

  const filteredProblems = selectedRole === 'ALL'
    ? PROBLEMS
    : PROBLEMS.filter((p) => p.role.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 relative overflow-hidden">
      {/* Subtle Background Radial Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-zinc-800/20 blur-[140px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-sm">
              <Code2 className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-100">
              LiveCode <span className="text-zinc-500 font-normal">{t('appSubtitle')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('navBadge')}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-sm text-zinc-300 text-xs font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t('heroBadge')}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.1]">
          {t('heroTitle1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600">
            {t('heroTitle2')}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
          {t('heroDesc')}
        </p>

        {/* Fun Mode Highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium shadow-sm">
            ☕ Indo Tech Lead & 🧐 FAANG Recruiter Personas
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-medium">
            🔊 Web Audio FX & ⚡ Badges
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
            ⏱️ Max 30 Min Interview Limit
          </span>
        </div>
      </header>


      {/* Role Filters */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {roleFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                selectedRole === key
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Problem Cards Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className="group relative bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-950 flex flex-col justify-between backdrop-blur-xl"
            >
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 font-medium">
                      {prob.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border font-normal ${
                      prob.level === 'Junior'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                        : prob.level === 'Mid-Level'
                        ? 'bg-blue-950/40 text-blue-400 border-blue-800/50'
                        : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                    }`}>
                      {prob.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {prob.timeLimit} {t('minsLabel')}
                  </div>
                </div>

                {/* Title & Category */}
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {prob.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">{prob.category}</p>
                </div>

                {/* Requirements highlights */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs text-zinc-300">
                  <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" /> {t('coreTask')}
                  </div>
                  <ul className="space-y-1.5 text-zinc-400 list-disc list-inside font-normal">
                    <li>Logika REST API In-Memory & Validasi HTTP Status</li>
                    <li>Batas Waktu Strict: {prob.timeLimit} Menit (Standar User Interview)</li>
                    <li className="text-zinc-300 font-medium">
                      Bonus Arsitektur: {prob.bonusQuestion}
                    </li>
                  </ul>
                </div>

              </div>

              {/* Card Footer CTA */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  Monaco IDE • JavaScript
                </div>

                <Link
                  href={`/session/${prob.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {t('startChallenge')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Feature Highlights */}
      <section className="border-t border-zinc-800/80 bg-zinc-900/30 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" /> {t('featureEditor')}
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                {t('featureEditorDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" /> {t('featureTimer')}
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                {t('featureTimerDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-zinc-400" /> {t('featureAI')}
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                {t('featureAIDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
