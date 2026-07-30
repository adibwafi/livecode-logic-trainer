'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { m, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { AssessmentResult, Problem } from '@/lib/types';
import { t } from '@/lib/i18n';
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Database,
  Code,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Award,
  X,
} from 'lucide-react';

interface ResultsModalProps {
  result: AssessmentResult;
  problem: Problem;
  onClose: () => void;
  onRetry: () => void;
}

type ActiveTab = 'summary' | 'errors' | 'best_practices' | 'bonus' | 'solution';

// ─── Framer Motion variants ────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28, delay: 0.05 },
  },
  exit: {
    opacity: 0, scale: 0.97, y: 12,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 32 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
};

const badgeStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const badgeItem = {
  hidden: { opacity: 0, y: 8, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 28 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultsModal({ result, problem, onClose, onRetry }: ResultsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

  useEffect(() => {
    if (result.status === 'PASS') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#34d399', '#f4f4f5'],
      });
    }
  }, [result.status]);

  // Status-keyed glow ring
  const statusGlow =
    result.status === 'PASS'
      ? '0 0 0 1px rgba(16,185,129,0.25), 0 20px 60px rgba(16,185,129,0.10)'
      : result.status === 'PARTIAL'
      ? '0 0 0 1px rgba(245,158,11,0.25), 0 20px 60px rgba(245,158,11,0.08)'
      : '0 0 0 1px rgba(244,63,94,0.25), 0 20px 60px rgba(244,63,94,0.08)';

  const getStatusBadge = () => {
    switch (result.status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-3.5 h-3.5" /> {t('passed')}
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> {t('partialPass')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> {t('needsImprovement')}
          </span>
        );
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'summary',        label: t('tabOverview'),       icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'errors',         label: t('tabIssues'),         icon: <AlertTriangle className="w-3.5 h-3.5" />, count: result.errors?.length },
    { id: 'best_practices', label: t('tabBestPractices'),  icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'bonus',          label: t('tabBonusQuestion'),  icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'solution',       label: t('tabIdealSolution'),  icon: <Code className="w-3.5 h-3.5" /> },
  ];

  return (
    /* ── Backdrop ── */
    <m.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      variants={backdropVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Assessment Results"
    >
      {/* ── Modal Container ── */}
      <m.div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white border border-zinc-200"
        style={{ boxShadow: `${statusGlow}, 0 24px 80px rgba(0,0,0,0.10)` }}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                background: result.status === 'PASS' ? 'rgba(209,250,229,0.8)' : result.status === 'PARTIAL' ? 'rgba(254,243,199,0.8)' : 'rgba(254,226,226,0.8)',
                border: result.status === 'PASS' ? '1px solid rgba(16,185,129,0.25)' : result.status === 'PARTIAL' ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(244,63,94,0.25)',
              }}
            >
              <Trophy
                className="w-5 h-5"
                style={{ color: result.status === 'PASS' ? '#059669' : result.status === 'PARTIAL' ? '#d97706' : '#e11d48' }}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                {t('assessmentReport')}
                {getStatusBadge()}
              </h2>
              <p className="text-xs text-zinc-500">{problem.title} • {problem.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="text-right">
              <div
                className="text-2xl font-extrabold font-mono"
                style={{ color: result.score >= 80 ? '#059669' : result.score >= 55 ? '#d97706' : '#e11d48' }}
              >
                {result.score}/100
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{t('overallScore')}</div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 btn-glass transition-all"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto custom-scrollbar bg-zinc-50/80 border-b border-zinc-100">
          {tabs.map(({ id, label, icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium btn-glass flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? 'text-zinc-900 font-semibold bg-white border border-zinc-200 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent border border-transparent'
              }`}
              aria-selected={activeTab === id}
              role="tab"
            >
              {icon}
              {label}
              {count !== undefined && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[350px] bg-white">
          <AnimatePresence mode="wait">
            <m.div
              key={activeTab}
              className="p-6 space-y-4 text-zinc-900"
              variants={tabContentVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role="tabpanel"
            >

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-5">
                  {/* Executive Summary */}
                  <div className="p-4 rounded-xl space-y-2 bg-zinc-50 border border-zinc-100">
                    <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">{t('executiveSummary')}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed font-normal">{result.summary}</p>
                  </div>

                  {/* Achievement Badges */}
                  {result.achievements && result.achievements.length > 0 && (
                    <div className="p-4 rounded-xl space-y-3 bg-amber-50/70 border border-amber-100">
                      <h3 className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-600" /> Achievements Unlocked
                      </h3>
                      <m.div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" variants={badgeStagger} initial="hidden" animate="show">
                        {result.achievements.map((ach) => (
                          <m.div
                            key={ach.id}
                            variants={badgeItem}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-amber-100 shadow-xs"
                          >
                            <span className="text-xl leading-none">{ach.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-zinc-900">{ach.title}</div>
                              <div className="text-[11px] text-zinc-500 font-normal">{ach.description}</div>
                            </div>
                          </m.div>
                        ))}
                      </m.div>
                    </div>
                  )}

                  {/* Edge Cases Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl space-y-2 bg-emerald-50/60 border border-emerald-100">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('verifiedRequirements')}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-700 font-normal">
                        {result.edgeCasesPassed?.map((ec, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {ec}
                          </li>
                        )) || <li>All standard checks evaluated.</li>}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl space-y-2 bg-rose-50/60 border border-rose-100">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" /> {t('unhandledEdgeCases')}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-700 font-normal">
                        {result.edgeCasesMissed?.length ? (
                          result.edgeCasesMissed.map((ec, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              {ec}
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-500 italic">{t('noEdgeCases')}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors Tab */}
              {activeTab === 'errors' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {t('detectedIssues')}
                  </h3>
                  {result.errors?.length ? (
                    result.errors.map((err, i) => (
                      <div key={i} className="p-4 rounded-xl text-xs flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-950">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-rose-900">{t('issue')} #{i + 1}</div>
                          <div className="text-xs text-rose-800 leading-relaxed mt-1">{err}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl text-zinc-600 text-xs bg-zinc-50 border border-zinc-100">
                      {t('noIssues')}
                    </div>
                  )}
                </div>
              )}

              {/* Best Practices Tab */}
              {activeTab === 'best_practices' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {t('bestPracticeTitle')}
                  </h3>
                  {result.bestPractices?.map((bp, i) => (
                    <div key={i} className="p-4 rounded-xl text-xs flex items-start gap-3 bg-zinc-50 border border-zinc-100 text-zinc-800">
                      <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-zinc-900">{t('recommendation')} #{i + 1}</div>
                        <div className="text-xs text-zinc-600 leading-relaxed mt-1 font-normal">{bp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bonus Tab */}
              {activeTab === 'bonus' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl space-y-2 bg-zinc-50 border border-zinc-100 text-zinc-800">
                    <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4 text-zinc-500" />
                      {t('bonusEvalTitle')}
                    </h3>
                    <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line font-normal">
                      {result.bonusEvaluation}
                    </div>
                  </div>
                </div>
              )}

              {/* Ideal Solution Tab */}
              {activeTab === 'solution' && (
                <div className="space-y-3 flex flex-col h-[350px]">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">{t('idealSolutionTitle')}</span>
                    <span>{t('idealSolutionSub')}</span>
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden border border-zinc-200">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs"
                      value={result.idealSolution}
                      options={{
                        readOnly: true,
                        fontSize: 13,
                        fontFamily: "'Fira Code', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontLigatures: true,
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                </div>
              )}

            </m.div>
          </AnimatePresence>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-zinc-100">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold btn-glass hover-lift"
            aria-label="Try again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('tryAgain')}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold btn-glass hover-lift shadow-md"
            aria-label="Back to editor"
          >
            {t('backToEditor')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
