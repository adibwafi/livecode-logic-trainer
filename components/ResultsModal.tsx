'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
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
  Award
} from 'lucide-react';

interface ResultsModalProps {
  result: AssessmentResult;
  problem: Problem;
  onClose: () => void;
  onRetry: () => void;
}

type ActiveTab = 'summary' | 'errors' | 'best_practices' | 'bonus' | 'solution';

export default function ResultsModal({
  result,
  problem,
  onClose,
  onRetry
}: ResultsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

  useEffect(() => {
    if (result.status === 'PASS') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#34d399', '#f4f4f5'],
      });
    }
  }, [result.status]);

  // Status-keyed glow ring for modal container
  const statusGlow =
    result.status === 'PASS'
      ? '0 0 0 1px rgba(16,185,129,0.3), 0 20px 60px rgba(16,185,129,0.12)'
      : result.status === 'PARTIAL'
      ? '0 0 0 1px rgba(245,158,11,0.3), 0 20px 60px rgba(245,158,11,0.10)'
      : '0 0 0 1px rgba(244,63,94,0.3), 0 20px 60px rgba(244,63,94,0.10)';

  const getStatusBadge = () => {
    switch (result.status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-scale-in">
            <Award className="w-3.5 h-3.5" /> {t('passed')}
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-scale-in">
            <AlertTriangle className="w-3.5 h-3.5" /> {t('partialPass')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-scale-in">
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-zinc-950/60 backdrop-blur-md"
    >
      {/* ── Modal Container ── */}
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl animate-scale-in bg-white border border-zinc-200 shadow-2xl"
        style={{
          boxShadow: `${statusGlow}, 0 24px 80px rgba(0,0,0,0.15)`,
          transition: 'box-shadow 600ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                background: result.status === 'PASS'
                  ? 'rgba(209, 250, 229, 0.8)'
                  : result.status === 'PARTIAL'
                  ? 'rgba(254, 243, 199, 0.8)'
                  : 'rgba(254, 226, 226, 0.8)',
                border: result.status === 'PASS'
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : result.status === 'PARTIAL'
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : '1px solid rgba(244, 63, 94, 0.3)',
              }}
            >
              <Trophy
                className="w-5 h-5"
                style={{
                  color: result.status === 'PASS' ? '#059669' : result.status === 'PARTIAL' ? '#d97706' : '#e11d48',
                }}
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

          {/* Score Gauge */}
          <div className="text-right">
            <div
              className="text-2xl font-extrabold font-mono"
              style={{
                color: result.score >= 80 ? '#059669' : result.score >= 55 ? '#d97706' : '#e11d48',
              }}
            >
              {result.score}/100
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{t('overallScore')}</div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div
          className="flex items-center gap-1 px-6 py-2 overflow-x-auto custom-scrollbar bg-zinc-100/70 border-b border-zinc-200"
        >
          {tabs.map(({ id, label, icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium btn-glass flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? 'text-zinc-900 font-semibold bg-white border border-zinc-200 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent border border-transparent'
              }`}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[350px] bg-white text-zinc-900">

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-5 animate-fade-in">
              {/* Executive Summary */}
              <div
                className="p-4 rounded-xl space-y-2 bg-zinc-50 border border-zinc-200"
              >
                <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">{t('executiveSummary')}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-normal">{result.summary}</p>
              </div>

              {/* Achievement Badges */}
              {result.achievements && result.achievements.length > 0 && (
                <div
                  className="p-4 rounded-xl space-y-3 bg-amber-50/80 border border-amber-200"
                >
                  <h3 className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600" /> Achievements Unlocked
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.achievements.map((ach, i) => (
                      <div
                        key={ach.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-amber-200/80 shadow-2xs animate-badge-entrance stagger-${Math.min(i + 1, 4)}`}
                      >
                        <span className="text-xl leading-none">{ach.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{ach.title}</div>
                          <div className="text-[11px] text-zinc-500 font-normal">{ach.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edge Cases Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl space-y-2 bg-emerald-50/70 border border-emerald-200 text-emerald-950"
                >
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

                <div
                  className="p-4 rounded-xl space-y-2 bg-rose-50/70 border border-rose-200 text-rose-950"
                >
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
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {t('detectedIssues')}
              </h3>
              {result.errors?.length ? (
                result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl text-xs flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-950"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-900">{t('issue')} #{i + 1}</div>
                      <div className="text-xs text-rose-800 leading-relaxed mt-1">{err}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-4 rounded-xl text-zinc-600 text-xs bg-zinc-50 border border-zinc-200"
                >
                  {t('noIssues')}
                </div>
              )}
            </div>
          )}

          {/* Best Practices Tab */}
          {activeTab === 'best_practices' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                {t('bestPracticeTitle')}
              </h3>
              {result.bestPractices?.map((bp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-xs flex items-start gap-3 bg-zinc-50 border border-zinc-200 text-zinc-800"
                >
                  <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
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
            <div className="space-y-4 animate-fade-in">
              <div
                className="p-4 rounded-xl space-y-2 bg-zinc-50 border border-zinc-200 text-zinc-800"
              >
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
            <div className="space-y-3 flex flex-col h-[350px] animate-fade-in">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-900">{t('idealSolutionTitle')}</span>
                <span>{t('idealSolutionSub')}</span>
              </div>
              <div
                className="flex-1 rounded-xl overflow-hidden border border-zinc-200"
              >
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
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-200"
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold btn-glass hover-lift"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('tryAgain')}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold btn-glass hover-lift shadow-md"
          >
            {t('backToEditor')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
