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

export default function ResultsModal({
  result,
  problem,
  onClose,
  onRetry
}: ResultsModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'errors' | 'best_practices' | 'bonus' | 'solution'>('summary');

  useEffect(() => {
    if (result.status === 'PASS') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result.status]);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
            <Award className="w-3.5 h-3.5" /> {t('passed')}
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/50">
            <AlertTriangle className="w-3.5 h-3.5" /> {t('partialPass')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-400 border border-rose-800/50">
            <XCircle className="w-3.5 h-3.5" /> {t('needsImprovement')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                {t('assessmentReport')}
                {getStatusBadge()}
              </h2>
              <p className="text-xs text-zinc-400">{problem.title} • {problem.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score Gauge */}
            <div className="text-right">
              <div className="text-2xl font-extrabold font-mono text-zinc-100">{result.score}/100</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{t('overallScore')}</div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-zinc-950/60 border-b border-zinc-800/80 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> {t('tabOverview')}
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {t('tabIssues')} ({result.errors?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('best_practices')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'best_practices'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> {t('tabBestPractices')}
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'bonus'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> {t('tabBonusQuestion')}
          </button>

          <button
            onClick={() => setActiveTab('solution')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'solution'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> {t('tabIdealSolution')}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[350px]">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">{t('executiveSummary')}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">{result.summary}</p>
              </div>

              {result.achievements && result.achievements.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-amber-500/30 space-y-3">
                  <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> Pencapaian Unlocked (Badges)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.achievements.map((ach) => (
                      <div key={ach.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                        <span className="text-xl leading-none">{ach.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-zinc-100">{ach.title}</div>
                          <div className="text-[11px] text-zinc-400 font-normal">{ach.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {t('verifiedRequirements')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300 font-normal">
                    {result.edgeCasesPassed?.map((ec, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {ec}
                      </li>
                    )) || <li>Semua pemeriksaan standar telah dievaluasi</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> {t('unhandledEdgeCases')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300 font-normal">
                    {result.edgeCasesMissed?.length ? (
                      result.edgeCasesMissed.map((ec, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          {ec}
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-400 italic">{t('noEdgeCases')}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {t('detectedIssues')}
              </h3>
              {result.errors?.length ? (
                result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200 text-xs flex items-start gap-3"
                  >
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-300">{t('issue')} #{i + 1}</div>
                      <div className="text-xs text-rose-200/90 leading-relaxed mt-1">{err}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
                  {t('noIssues')}
                </div>
              )}
            </div>
          )}

          {activeTab === 'best_practices' && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                {t('bestPracticeTitle')}
              </h3>
              {result.bestPractices?.map((bp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs flex items-start gap-3"
                >
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-zinc-100">{t('recommendation')} #{i + 1}</div>
                    <div className="text-xs text-zinc-400 leading-relaxed mt-1 font-normal">{bp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bonus' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  {t('bonusEvalTitle')}
                </h3>
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                  {result.bonusEvaluation}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-3 flex flex-col h-[350px]">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">{t('idealSolutionTitle')}</span>
                <span>{t('idealSolutionSub')}</span>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800">
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
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-t border-zinc-800/80">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('tryAgain')}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors shadow-sm"
          >
            {t('backToEditor')}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
