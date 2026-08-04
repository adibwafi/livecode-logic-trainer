'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { PROBLEMS } from '@/lib/problems';
import { t } from '@/lib/i18n';
import {
  Code2,
  Clock,
  Sparkles,
  Terminal,
  BrainCircuit,
  Play,
  User,
} from 'lucide-react';

// ─── Framer Motion variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 30 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  },
};

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const roleFilters = [
    { key: 'ALL', label: t('allRoles') },
    { key: 'Backend', label: 'Backend Engineer' },
    { key: 'Frontend', label: 'Frontend Engineer' },
    { key: 'Full Stack', label: 'Full Stack Engineer' },
    { key: 'QA', label: 'QA Engineer' },
    { key: 'DevOps', label: 'DevOps Engineer' },
  ];

  const filteredProblems = selectedRole === 'ALL'
    ? PROBLEMS
    : PROBLEMS.filter((p) => p.role.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-hidden">

      {/* ── Navigation ── */}
      <nav
        className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs hover-lift btn-glass">
              <Code2 className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900">
              LiveCode <span className="text-zinc-500 font-normal">{t('appSubtitle')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex glow-badge bg-zinc-100/80 text-zinc-700 border-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {t('navBadge')}
            </span>

            <Link
              href="/profile"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white font-medium text-xs shadow-sm hover:bg-zinc-800 hover-lift transition-all duration-200"
              aria-label="View Candidate Profile"
            >
              <User className="w-3.5 h-3.5 text-violet-300" />
              <span>{t('navProfile')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main Layout: Hero + Filters + Cards ── */}
      <div className="max-w-5xl mx-auto px-6">

        {/* ── Hero Section ── */}
        <m.header
          className="pt-20 pb-14 text-center space-y-7 relative"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Live status pill */}
          <m.div variants={pillVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 backdrop-blur-md text-zinc-700 text-xs font-medium tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            {t('heroBadge')}
          </m.div>

          {/* Hero headline */}
          <m.h1 variants={heroVariants} className="text-4xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.1]">
            {t('heroTitle1')}{' '}
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #09090b 0%, #7c3aed 45%, #2563eb 90%)' }}
            >
              {t('heroTitle2')}
            </span>
          </m.h1>

          {/* Subtitle */}
          <m.p variants={heroVariants} className="max-w-2xl mx-auto text-sm md:text-base text-zinc-600 leading-relaxed font-normal">
            {t('heroDesc')}
          </m.p>

          {/* Feature pills */}
          <m.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="pt-1 flex flex-wrap items-center justify-center gap-2.5 text-xs"
          >
            {[
              { label: '☕ Indo Tech Lead & 🧐 FAANG Recruiter Personas', cls: 'bg-zinc-100/80 border-zinc-200 text-zinc-800' },
              { label: '🔊 Web Audio FX & ⚡ Badges', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { label: '⏱️ Max 30 Min Interview Limit', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
            ].map(({ label, cls }) => (
              <m.span
                key={label}
                variants={pillVariants}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-medium backdrop-blur-md hover-lift btn-glass cursor-default shadow-xs ${cls}`}
              >
                {label}
              </m.span>
            ))}
          </m.div>
        </m.header>

        {/* ── Role Filter Pills ── */}
        <section className="pb-10">
          <m.div
            className="flex items-center justify-center gap-2 flex-wrap text-xs"
            layout
          >
            {roleFilters.map(({ key, label }) => (
              <m.button
                key={key}
                layout
                onClick={() => setSelectedRole(key)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-medium btn-glass transition-all duration-200 ${
                  selectedRole === key
                    ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm ring-2 ring-violet-500/20 font-semibold'
                    : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200 hover:text-zinc-900'
                }`}
                aria-pressed={selectedRole === key}
              >
                {label}
              </m.button>
            ))}
          </m.div>
        </section>

        {/* ── Problem Cards Grid ── */}
        <section className="pb-24">
          <AnimatePresence mode="popLayout">
            <m.div
              key={selectedRole}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredProblems.map((prob) => (
                <m.div
                  key={prob.id}
                  variants={cardVariants}
                  layout
                  className="group relative rounded-2xl p-6 flex flex-col justify-between glass-card bg-white border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200 overflow-hidden"
                >

                  <div className="space-y-4 relative">
                    {/* Badges row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                          {prob.role}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border font-medium ${
                          prob.level === 'Junior'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prob.level === 'Mid-Level'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {prob.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-zinc-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {prob.timeLimit} {t('minsLabel')}
                      </div>
                    </div>

                    {/* Title & category */}
                    <div>
                      <h2 className="text-[15px] font-bold text-zinc-900 group-hover:text-violet-950 transition-colors duration-200 leading-snug">
                        {prob.title}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">{prob.category}</p>
                    </div>

                    {/* Requirements */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs text-zinc-700">
                      <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-zinc-500" /> {t('coreTask')}
                      </div>
                      <ul className="space-y-1.5 text-zinc-600 list-disc list-inside font-normal">
                        <li>In-Memory REST API Logic & HTTP Status Validation</li>
                        <li>Strict Time Limit: {prob.timeLimit} mins (Recruiter Interview Standard)</li>
                        <li className="text-zinc-800 font-medium">Architecture Bonus: {prob.bonusQuestion}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="pt-5 mt-5 border-t border-zinc-200/80 flex items-center justify-between relative">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      Monaco IDE • JavaScript
                    </div>
                    <Link
                      href={`/session/${prob.id}`}
                      className="group/cta flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs text-white bg-zinc-900 hover:bg-zinc-800 shadow-md btn-glass hover-lift transition-all duration-200"
                      aria-label={`Start ${prob.title} challenge`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current transition-transform duration-200 group-hover/cta:scale-110" />
                      {t('startChallenge')}
                    </Link>
                  </div>
                </m.div>
              ))}
            </m.div>
          </AnimatePresence>
        </section>
      </div>

      {/* ── Feature Highlights Footer ── */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            {[
              { icon: <Terminal className="w-3.5 h-3.5 text-zinc-600" />, title: t('featureEditor'), desc: t('featureEditorDesc') },
              { icon: <Clock className="w-3.5 h-3.5 text-zinc-600" />,    title: t('featureTimer'),  desc: t('featureTimerDesc') },
              { icon: <BrainCircuit className="w-3.5 h-3.5 text-zinc-600" />, title: t('featureAI'), desc: t('featureAIDesc') },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="space-y-2.5">
                <div className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-zinc-200 shadow-xs">{icon}</div>
                  {title}
                </div>
                <p className="text-zinc-500 leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
