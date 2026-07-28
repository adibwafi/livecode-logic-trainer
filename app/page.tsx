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
  Play,
  Zap,
  Shield
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-hidden">

      {/* ── Ambient Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Primary violet orb */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-violet-950/30 blur-[140px] animate-glow-pulse" />
        {/* Secondary emerald accent */}
        <div className="absolute top-[300px] right-[-100px] w-[500px] h-[400px] rounded-full bg-emerald-950/20 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        {/* Subtle mesh grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-100 shadow-sm hover-lift btn-glass">
              <Code2 className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-100">
              LiveCode <span className="text-zinc-500 font-normal">{t('appSubtitle')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="glow-badge text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('navBadge')}
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center space-y-7 relative">
        {/* Live status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md text-zinc-300 text-xs font-medium tracking-wide animate-scale-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          {t('heroBadge')}
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.1] animate-fade-in">
          {t('heroTitle1')}{' '}
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #f4f4f5 0%, #c4b5fd 40%, #a1a1aa 80%)',
            }}
          >
            {t('heroTitle2')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
          {t('heroDesc')}
        </p>

        {/* Feature highlight pills */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 text-xs animate-fade-in" style={{ animationDelay: '120ms' }}>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-200 font-medium backdrop-blur-md hover-lift btn-glass cursor-default">
            ☕ Indo Tech Lead & 🧐 FAANG Recruiter Personas
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/30 text-emerald-300 border border-emerald-800/40 font-medium backdrop-blur-md hover-lift btn-glass cursor-default">
            🔊 Web Audio FX & ⚡ Badges
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/30 text-amber-300 border border-amber-800/40 font-medium backdrop-blur-md hover-lift btn-glass cursor-default">
            ⏱️ Max 30 Min Interview Limit
          </span>
        </div>
      </header>

      {/* ── Role Filter Pills ── */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          {roleFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`px-4 py-2 rounded-full font-medium btn-glass transition-all duration-200 ${
                selectedRole === key
                  ? 'bg-white/[0.10] text-zinc-100 border border-white/[0.18] shadow-sm ring-1 ring-violet-500/30 font-semibold'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 border border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Problem Cards Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProblems.map((prob, idx) => (
            <div
              key={prob.id}
              className="group relative rounded-2xl p-6 flex flex-col justify-between glass-card overflow-hidden"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Inset hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="space-y-4 relative">
                {/* Badges row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-200 font-medium">
                      {prob.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border font-medium ${
                      prob.level === 'Junior'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : prob.level === 'Mid-Level'
                        ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                        : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                    }`}>
                      {prob.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-zinc-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {prob.timeLimit} {t('minsLabel')}
                  </div>
                </div>

                {/* Title & category */}
                <div>
                  <h2 className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors duration-200 leading-snug">
                    {prob.title}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">{prob.category}</p>
                </div>

                {/* Requirements */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2 text-xs text-zinc-300">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-zinc-500" /> {t('coreTask')}
                  </div>
                  <ul className="space-y-1.5 text-zinc-400 list-disc list-inside font-normal">
                    <li>In-Memory REST API Logic & HTTP Status Validation</li>
                    <li>Strict Time Limit: {prob.timeLimit} mins (Recruiter Interview Standard)</li>
                    <li className="text-zinc-300 font-medium">
                      Architecture Bonus: {prob.bonusQuestion}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between relative">
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
                  Monaco IDE • JavaScript
                </div>

                <Link
                  href={`/session/${prob.id}`}
                  className="group/cta flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs btn-glass hover-lift"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e4e4e7 100%)',
                    color: '#09090b',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <Play className="w-3.5 h-3.5 fill-current transition-transform duration-200 group-hover/cta:scale-110" />
                  {t('startChallenge')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Highlights Footer ── */}
      <section className="border-t border-white/[0.05] bg-white/[0.01] backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2.5">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                {t('featureEditor')}
              </div>
              <p className="text-zinc-500 leading-relaxed font-normal">{t('featureEditorDesc')}</p>
            </div>

            <div className="space-y-2.5">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                {t('featureTimer')}
              </div>
              <p className="text-zinc-500 leading-relaxed font-normal">{t('featureTimerDesc')}</p>
            </div>

            <div className="space-y-2.5">
              <div className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <BrainCircuit className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                {t('featureAI')}
              </div>
              <p className="text-zinc-500 leading-relaxed font-normal">{t('featureAIDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
