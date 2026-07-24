'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Editor from '@monaco-editor/react';
import { AssessmentResult, Problem } from '@/lib/types';
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Award className="w-4 h-4" /> PASSED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-4 h-4" /> PARTIAL PASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <XCircle className="w-4 h-4" /> NEEDS IMPROVEMENT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Assessment Report
                {getStatusBadge()}
              </h2>
              <p className="text-xs text-slate-400">{problem.title} • {problem.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score Gauge */}
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-cyan-400">{result.score}/100</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-slate-950/50 border-b border-slate-800/80 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Overview
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> What Went Wrong ({result.errors?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('best_practices')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'best_practices'
                ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> Best Practice Feedback
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'bonus'
                ? 'bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Bonus Question
          </button>

          <button
            onClick={() => setActiveTab('solution')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'solution'
                ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Ideal Solution
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[350px]">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-cyan-300">Executive Summary</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Verified Requirements
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.edgeCasesPassed?.map((ec, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {ec}
                      </li>
                    )) || <li>All standard checks evaluated</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Unhandled Edge Cases
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {result.edgeCasesMissed?.length ? (
                      result.edgeCasesMissed.map((ec, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          {ec}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No missing edge cases detected!</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Detected Issues & Logic Violations
              </h3>
              {result.errors?.length ? (
                result.errors.map((err, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-200 text-sm flex items-start gap-3"
                  >
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-300">Issue #{i + 1}</div>
                      <div className="text-xs text-rose-200/90 leading-relaxed mt-1">{err}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-sm">
                  🎉 Outstanding! No critical logic errors were found in your code submission.
                </div>
              )}
            </div>
          )}

          {activeTab === 'best_practices' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Engineering Best Practice Feedback
              </h3>
              {result.bestPractices?.map((bp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-sm flex items-start gap-3"
                >
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-300">Recommendation #{i + 1}</div>
                    <div className="text-xs text-amber-100/90 leading-relaxed mt-1">{bp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bonus' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-purple-200 space-y-2">
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  PostgreSQL Race Condition Answer Evaluation
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {result.bonusEvaluation}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-3 flex flex-col h-[350px]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">Ideal Production-Grade Solution (Express.js)</span>
                <span>Includes validation, edge-case checks, and bonus answer commentary</span>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-800">
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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again / Refactor
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
          >
            Back to Editor
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
