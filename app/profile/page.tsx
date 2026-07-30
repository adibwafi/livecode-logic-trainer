'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { useAppStore, selectAvgScore, selectAvgTime } from '@/lib/store';
import { PROBLEMS } from '@/lib/problems';
import { t } from '@/lib/i18n';
import AdaptiveTracker from '@/components/AdaptiveTracker';
import {
  ArrowLeft,
  User,
  Code2,
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Flame,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

export default function ProfilePage() {
  const { completedProblems, metrics, clearAllData } = useAppStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const totalProblems = PROBLEMS.length;
  const avgScore = selectAvgScore({ completedProblems, metrics } as any);
  const avgTimeSeconds = selectAvgTime({ completedProblems, metrics } as any);
  const avgTimeMinutes = Math.round(avgTimeSeconds / 60);

  // Calculate Candidate Mastery Rank
  let masteryRank = 'Entry Candidate';
  let rankBadgeColor = 'bg-zinc-100 text-zinc-700 border-zinc-200';
  if (completedProblems.length >= 3 && avgScore >= 80) {
    masteryRank = 'Senior Logic Architect';
    rankBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (completedProblems.length >= 1 && avgScore >= 60) {
    masteryRank = 'Mid-Level API Specialist';
    rankBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  // Calculate per-role metrics
  const roles = ['Backend', 'Frontend', 'Full Stack', 'QA'];
  const roleBreakdown = roles.map((role) => {
    const roleProblems = PROBLEMS.filter((p) => p.role.toLowerCase().includes(role.toLowerCase()));
    const roleCompleted = roleProblems.filter((p) => completedProblems.includes(p.id));
    const roleMetrics = metrics.filter((m) =>
      roleProblems.some((p) => p.id === m.problemId)
    );
    const roleAvgScore =
      roleMetrics.length > 0
        ? Math.round(roleMetrics.reduce((sum, item) => sum + item.score, 0) / roleMetrics.length)
        : 0;

    return {
      role,
      total: roleProblems.length,
      completed: roleCompleted.length,
      avgScore: roleAvgScore,
      percentage: roleProblems.length > 0 ? Math.round((roleCompleted.length / roleProblems.length) * 100) : 0,
    };
  });

  const handleClearHistory = () => {
    clearAllData();
    setShowConfirmClear(false);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-hidden pb-24">
      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-violet-200/30 blur-[140px] animate-glow-pulse" />
        <div className="absolute top-[400px] left-[-100px] w-[500px] h-[400px] rounded-full bg-emerald-200/20 blur-[130px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Navigation Header ── */}
      <nav
        className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors btn-glass px-3 py-1.5 rounded-full border border-zinc-200/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToHome')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900">
              <Code2 className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-sm text-zinc-900 tracking-tight">
              LiveCode <span className="text-zinc-500 font-normal">Candidate Profile</span>
            </span>
          </div>

          <div className="w-24 flex justify-end">
            <span className="glow-badge bg-zinc-100/80 text-zinc-700 border-zinc-200 text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Sana Simplicity
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main Content Container (Centered Single-Column) ── */}
      <main className="max-w-4xl mx-auto px-6 pt-10">
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* ── Candidate Profile Header ── */}
          <m.section variants={itemVariants} className="glass-panel p-8 rounded-3xl border border-zinc-200/90 bg-white/80 backdrop-blur-2xl shadow-sm relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-100/50 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-violet-950 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-white font-extrabold text-2xl">
                    <User className="w-9 h-9 text-violet-400" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Candidate Status: Active">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              {/* Identity & Rank */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                    Candidate Developer
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${rankBadgeColor}`}>
                    {masteryRank}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 max-w-lg leading-relaxed">
                  {t('profileSub')}
                </p>

                {/* Stat pills summary */}
                <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-zinc-600">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{completedProblems.length} / {totalProblems} Selesai</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Rata-Rata Skor: {avgScore}/100</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Rata-Rata Waktu: {avgTimeMinutes} Menit</span>
                  </div>
                </div>
              </div>
            </div>
          </m.section>

          {/* ── Adaptive Tracker Highlight ── */}
          <m.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
              <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
              <span>Ringkasan Progres Adaptif</span>
            </div>
            <AdaptiveTracker />
          </m.section>

          {/* ── Skill Breakdown per Role ── */}
          <m.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('roleBreakdown')}</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">4 Peran Utama</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleBreakdown.map((r) => (
                <div
                  key={r.role}
                  className="glass-panel p-5 rounded-2xl border border-zinc-200/90 bg-white/80 backdrop-blur-xl space-y-3 shadow-xs hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">{r.role} Engineer</h3>
                      <p className="text-[11px] text-zinc-500 font-mono">{r.completed} dari {r.total} Soal Selesai</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-zinc-900">
                        {r.avgScore} <span className="text-[10px] text-zinc-400 font-normal">skor avg</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-500"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{r.percentage}% Penguasaan</span>
                      <span>{r.completed === r.total && r.total > 0 ? '🏆 Selesai Semua' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </m.section>

          {/* ── Complete Session History Log ── */}
          <m.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('sessionHistory')}</span>
              </div>
              {metrics.length > 0 && (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium btn-glass px-3 py-1 rounded-full border border-rose-200/80 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('clearHistory')}</span>
                </button>
              )}
            </div>

            {metrics.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center space-y-3 border border-zinc-200/80 bg-white/80">
                <div className="inline-flex p-3 rounded-full bg-zinc-100 text-zinc-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-800">Belum Ada Riwayat Sesi</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Mulai salah satu tantangan 30 menit dari halaman utama untuk melihat rekam jejak evaluasi interview kamu.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm transition-all"
                  >
                    <span>Pilih Tantangan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-zinc-200/90 bg-white/90 backdrop-blur-xl overflow-hidden shadow-xs">
                <div className="divide-y divide-zinc-200/70">
                  {metrics.slice().reverse().map((mEntry) => {
                    const problemDef = PROBLEMS.find((p) => p.id === mEntry.problemId);
                    const formattedDate = new Date(mEntry.completedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={mEntry.completedAt}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="pt-0.5">
                            {mEntry.status === 'PASS' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : mEntry.status === 'PARTIAL' ? (
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500" />
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-sm font-bold text-zinc-900 truncate">
                              {mEntry.problemTitle}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 font-mono">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-sans font-medium">
                                {problemDef?.role || 'Engineer'}
                              </span>
                              <span>•</span>
                              <span>{Math.round(mEntry.secondsSpent / 60)} menit</span>
                              <span>•</span>
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono ${
                              mEntry.status === 'PASS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : mEntry.status === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {mEntry.status} ({mEntry.score}/100)
                          </span>

                          <Link
                            href={`/session/${mEntry.problemId}`}
                            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 font-medium btn-glass px-3 py-1 rounded-full border border-zinc-200"
                          >
                            <span>Coba Lagi</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </m.section>
        </m.div>

        {/* ── Clear Confirmation Modal ── */}
        <AnimatePresence>
          {showConfirmClear && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full border border-zinc-200 shadow-2xl space-y-4 text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{t('clearHistory')}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {t('confirmClear')}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    Ya, Hapus Data
                  </button>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
