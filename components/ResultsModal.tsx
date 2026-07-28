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
      ? '0 0 0 1px rgba(52,211,153,0.15), 0 0 60px rgba(52,211,153,0.08)'
      : result.status === 'PARTIAL'
      ? '0 0 0 1px rgba(251,191,36,0.15), 0 0 60px rgba(251,191,36,0.06)'
      : '0 0 0 1px rgba(251,113,133,0.15), 0 0 60px rgba(251,113,133,0.06)';

  const getStatusBadge = () => {
    switch (result.status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 animate-scale-in">
            <Award className="w-3.5 h-3.5" /> {t('passed')}
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/40 animate-scale-in">
            <AlertTriangle className="w-3.5 h-3.5" /> {t('partialPass')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-400 border border-rose-800/40 animate-scale-in">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(9,9,11,0.88)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
      }}
    >
      {/* ── Modal Container ── */}
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl animate-scale-in"
        style={{
          background: 'rgba(12,12,15,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `${statusGlow}, 0 24px 80px rgba(0,0,0,0.7)`,
          transition: 'box-shadow 600ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(0,0,0,0.40)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                background: result.status === 'PASS'
                  ? 'rgba(6,78,59,0.35)'
                  : result.status === 'PARTIAL'
                  ? 'rgba(120,53,15,0.35)'
                  : 'rgba(136,19,55,0.35)',
                border: result.status === 'PASS'
                  ? '1px solid rgba(52,211,153,0.25)'
                  : result.status === 'PARTIAL'
                  ? '1px solid rgba(245,158,11,0.25)'
                  : '1px solid rgba(251,113,133,0.25)',
              }}
            >
              <Trophy
                className="w-5 h-5"
                style={{
                  color: result.status === 'PASS' ? '#34d399' : result.status === 'PARTIAL' ? '#fbbf24' : '#fb7185',
                }}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
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
                color: result.score >= 80 ? '#34d399' : result.score >= 55 ? '#fbbf24' : '#fb7185',
                textShadow: result.score >= 80
                  ? '0 0 20px rgba(52,211,153,0.4)'
                  : result.score >= 55
                  ? '0 0 20px rgba(251,191,36,0.3)'
                  : '0 0 20px rgba(251,113,133,0.3)',
              }}
            >
              {result.score}/100
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{t('overallScore')}</div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div
          className="flex items-center gap-1 px-6 py-2 overflow-x-auto custom-scrollbar"
          style={{
            background: 'rgba(0,0,0,0.25)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {tabs.map(({ id, label, icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium btn-glass flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                activeTab === id
                  ? 'text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={
                activeTab === id
                  ? {
                      background: 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.13)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }
              }
            >
              {icon}
              {label}
              {count !== undefined && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-950/40 text-rose-400 border border-rose-800/30 font-mono">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[350px]">

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-5 animate-fade-in">
              {/* Executive Summary */}
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">{t('executiveSummary')}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">{result.summary}</p>
              </div>

              {/* Achievement Badges */}
              {result.achievements && result.achievements.length > 0 && (
                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(120,53,15,0.12)', border: '1px solid rgba(251,191,36,0.18)' }}
                >
                  <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> Achievements Unlocked
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.achievements.map((ach, i) => (
                      <div
                        key={ach.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg animate-badge-entrance stagger-${Math.min(i + 1, 4)}`}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-xl leading-none">{ach.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-zinc-100">{ach.title}</div>
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
                  className="p-4 rounded-xl space-y-2"
                  style={{ background: 'rgba(6,78,59,0.10)', border: '1px solid rgba(52,211,153,0.15)' }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {t('verifiedRequirements')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400 font-normal">
                    {result.edgeCasesPassed?.map((ec, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {ec}
                      </li>
                    )) || <li>All standard checks evaluated.</li>}
                  </ul>
                </div>

                <div
                  className="p-4 rounded-xl space-y-2"
                  style={{ background: 'rgba(136,19,55,0.10)', border: '1px solid rgba(251,113,133,0.15)' }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> {t('unhandledEdgeCases')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400 font-normal">
                    {result.edgeCasesMissed?.length ? (
                      result.edgeCasesMissed.map((ec, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-rose-300/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
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
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {t('detectedIssues')}
              </h3>
              {result.errors?.length ? (
                result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl text-xs flex items-start gap-3"
                    style={{ background: 'rgba(136,19,55,0.15)', border: '1px solid rgba(251,113,133,0.18)' }}
                  >
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-300">{t('issue')} #{i + 1}</div>
                      <div className="text-xs text-rose-200/80 leading-relaxed mt-1">{err}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-4 rounded-xl text-zinc-400 text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {t('noIssues')}
                </div>
              )}
            </div>
          )}

          {/* Best Practices Tab */}
          {activeTab === 'best_practices' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                {t('bestPracticeTitle')}
              </h3>
              {result.bestPractices?.map((bp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-xs flex items-start gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-200">{t('recommendation')} #{i + 1}</div>
                    <div className="text-xs text-zinc-400 leading-relaxed mt-1 font-normal">{bp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bonus Tab */}
          {activeTab === 'bonus' && (
            <div className="space-y-4 animate-fade-in">
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  {t('bonusEvalTitle')}
                </h3>
                <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line font-normal">
                  {result.bonusEvaluation}
                </div>
              </div>
            </div>
          )}

          {/* Ideal Solution Tab */}
          {activeTab === 'solution' && (
            <div className="space-y-3 flex flex-col h-[350px] animate-fade-in">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">{t('idealSolutionTitle')}</span>
                <span>{t('idealSolutionSub')}</span>
              </div>
              <div
                className="flex-1 rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
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
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(0,0,0,0.40)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-zinc-300 text-xs font-semibold btn-glass hover-lift"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('tryAgain')}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-zinc-950 text-xs font-semibold btn-glass hover-lift"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e4e4e7 100%)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 12px rgba(0,0,0,0.35)',
            }}
          >
            {t('backToEditor')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
