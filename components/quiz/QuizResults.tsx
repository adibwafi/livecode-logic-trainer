'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { QuizSessionState } from '@/lib/quiz/types';
import { computeSessionStats, evaluateReadiness } from '@/lib/quiz/quiz-engine';
import { saveLeaderboardEntry } from '@/lib/quiz/leaderboard';
import { playFanfareSound } from '@/lib/soundFX';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';

interface QuizResultsProps {
  session: QuizSessionState;
  onPlayAgain: () => void;
  onChangeTrack: () => void;
  onOpenLeaderboard: () => void;
}

export function QuizResults({
  session,
  onPlayAgain,
  onChangeTrack,
  onOpenLeaderboard,
}: QuizResultsProps) {
  const stats = computeSessionStats(session.answerRecords);
  const evaluation = evaluateReadiness(stats.accuracy);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const [candidateName, setCandidateName] = useState<string>('');
  const [targetCompany, setTargetCompany] = useState<string>('Tokopedia / Tech Unicorn');
  const [isSavedToLeaderboard, setIsSavedToLeaderboard] = useState<boolean>(false);

  // Trigger celebration effects if accuracy >= 70%
  useEffect(() => {
    if (stats.accuracy >= 70) {
      playFanfareSound();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch (err) {
        console.warn('Confetti error', err);
      }
    }
  }, [stats.accuracy]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || isSavedToLeaderboard) return;

    saveLeaderboardEntry({
      name: candidateName.trim(),
      companyTarget: targetCompany.trim(),
      track: session.track,
      score: stats.totalScore,
      accuracy: stats.accuracy,
      correctCount: stats.correctCount,
      totalQuestions: stats.total,
    });

    setIsSavedToLeaderboard(true);
  };

  const filteredRecords = session.answerRecords.filter((rec) => {
    if (filterMode === 'correct') return rec.isCorrect;
    if (filterMode === 'wrong') return !rec.isCorrect;
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans py-12 px-4 md:px-8 selection:bg-violet-500/20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── TOP HERO SCORE PODIUM ── */}
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl p-8 md:p-10 text-center relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white border border-zinc-200/90 shadow-sm"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-violet-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Track Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {session.track === 'backend' ? 'Backend Engineering Track' : 'Frontend Engineering Track'} • Sesi Selesai
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-2">
            Hasil Akhir Screening Quiz
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-lg mx-auto mb-6">
            Evaluasi kesiapan technical test tahap Online Assessment (OA) perusahaan teknologi Indonesia.
          </p>

          {/* Big Score Display */}
          <div className="inline-block p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-1">
              Total Kahoot Score
            </span>
            <div className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 font-mono">
              {stats.totalScore.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              Max Streak: <strong className="text-amber-600">🔥 {session.maxStreak}x</strong>
            </div>
          </div>

          {/* ── METRICS STATS BAR (Timeout, Benar, Salah, Accuracy) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {/* Benar */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs uppercase mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Benar
              </div>
              <div className="text-2xl md:text-3xl font-black text-emerald-700 font-mono">
                {stats.correctCount}
              </div>
              <span className="text-[11px] text-zinc-500">dari {stats.total} soal</span>
            </div>

            {/* Salah */}
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-rose-800 font-bold text-xs uppercase mb-1">
                <XCircle className="w-4 h-4 text-rose-600" /> Salah
              </div>
              <div className="text-2xl md:text-3xl font-black text-rose-700 font-mono">
                {stats.wrongCount}
              </div>
              <span className="text-[11px] text-zinc-500">jawaban keliru</span>
            </div>

            {/* Timeout */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs uppercase mb-1">
                <Clock className="w-4 h-4 text-amber-600" /> Timeout
              </div>
              <div className="text-2xl md:text-3xl font-black text-amber-700 font-mono">
                {stats.timeoutCount}
              </div>
              <span className="text-[11px] text-zinc-500">&gt; 45s per soal</span>
            </div>

            {/* Accuracy */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-blue-800 font-bold text-xs uppercase mb-1">
                <Trophy className="w-4 h-4 text-blue-600" /> Akurasi
              </div>
              <div className="text-2xl md:text-3xl font-black text-blue-700 font-mono">
                {stats.accuracy}%
              </div>
              <span className="text-[11px] text-zinc-500">rata {stats.avgTimePerQuestion}s/soal</span>
            </div>
          </div>
        </m.div>

        {/* ── READINESS TIER CARD ── */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl p-6 md:p-8 border shadow-sm ${evaluation.borderCls} ${evaluation.colorCls}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{evaluation.badgeEmoji}</span>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-zinc-950 tracking-tight">
                    {evaluation.tierTitle}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800">{evaluation.verdict}</p>
                </div>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-black/10 bg-white text-zinc-800 shadow-xs">
              Grade: {stats.accuracy >= 88 ? 'A (Passing)' : stats.accuracy >= 72 ? 'B (Passing)' : stats.accuracy >= 50 ? 'C (Borderline)' : 'D (Needs Prep)'}
            </span>
          </div>

          <p className="text-xs md:text-sm text-zinc-700 leading-relaxed mt-4">
            {evaluation.description}
          </p>
        </m.div>

        {/* ── SUBMIT TO LEADERBOARD FORM ── */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-6 md:p-8 bg-zinc-50 border border-zinc-200/90 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-zinc-900">Simpan ke Leaderboard Nasional</h3>
          </div>

          {isSavedToLeaderboard ? (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Skor Anda ({stats.totalScore.toLocaleString()} pts) berhasil dicatat di Leaderboard!
              </span>
              <button
                onClick={onOpenLeaderboard}
                className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors btn-glass"
              >
                Lihat Ranking
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveScore} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Nama Anda (cth: Budi Setiawan)"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
              />
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Target Perusahaan (cth: Tokopedia, Traveloka)"
                className="sm:w-64 px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover-lift btn-glass transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Skor</span>
              </button>
            </form>
          )}
        </m.div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-md hover-lift btn-glass transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi (Bank Soal Baru)</span>
          </button>

          <button
            onClick={onChangeTrack}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm border border-zinc-200 hover-lift btn-glass shadow-xs transition-all"
          >
            <span>Ganti Track ({session.track === 'backend' ? 'Frontend' : 'Backend'})</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300 hover-lift btn-glass shadow-xs transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Buka Leaderboard</span>
          </button>
        </div>

        {/* ── QUESTION-BY-QUESTION REVIEW ACCORDION ── */}
        <section className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                Review & Pembahasan Mendalam (25 Soal)
              </h2>
              <p className="text-xs text-zinc-500">
                Pahami alasan teknis di balik setiap jawaban untuk mengantisipasi pertanyaan live interview.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterMode === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Semua ({stats.total})
              </button>
              <button
                onClick={() => setFilterMode('wrong')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterMode === 'wrong' ? 'bg-rose-100 text-rose-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Salah & Timeout ({stats.wrongCount + stats.timeoutCount})
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterMode === 'correct' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Benar ({stats.correctCount})
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="space-y-3">
            {filteredRecords.map((rec, idx) => {
              const isExpanded = expandedIndex === idx;
              const correctOption = rec.question.options.find(
                (o) => o.id === rec.question.correctOptionId
              );
              const chosenOption = rec.question.options.find(
                (o) => o.id === rec.selectedOptionId
              );

              return (
                <div
                  key={rec.questionId}
                  className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-3">
                      {rec.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : rec.isTimeout ? (
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {rec.question.companyTag}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {rec.question.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                          {rec.question.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        {rec.pointsEarned > 0 ? `+${rec.pointsEarned} pts` : '0 pts'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Explanation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 border-t border-zinc-100 bg-zinc-50/50 space-y-4 pt-4 text-xs md:text-sm"
                      >
                        {/* Code snippet if any */}
                        {rec.question.codeSnippet && (
                          <pre className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-emerald-300 text-xs overflow-x-auto shadow-inner">
                            <code>{rec.question.codeSnippet}</code>
                          </pre>
                        )}

                        {/* Answer comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white border border-zinc-200">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                              Jawaban Anda:
                            </span>
                            <span
                              className={`font-semibold ${
                                rec.isCorrect
                                  ? 'text-emerald-700'
                                  : rec.isTimeout
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {rec.isTimeout
                                ? '⏱️ Waktu Habis (Tidak Menjawab)'
                                : chosenOption
                                ? `[${chosenOption.id}] ${chosenOption.label}`
                                : '-'}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                              Kunci Jawaban Tepat:
                            </span>
                            <span className="font-semibold text-emerald-800">
                              [{correctOption?.id}] {correctOption?.label}
                            </span>
                          </div>
                        </div>

                        {/* Technical Explanation */}
                        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-1">
                          <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Pembahasan & Standar Interview:
                          </div>
                          <p className="text-zinc-600 leading-relaxed text-xs">
                            {rec.question.explanation}
                          </p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
