'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { QuizTrack, QuizSessionState, QuizAnswerRecord } from '@/lib/quiz/types';
import { getRandomizedQuestions, QUESTIONS_PER_SESSION } from '@/lib/quiz/quiz-engine';
import { QuizArena } from '@/components/quiz/QuizArena';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizLeaderboardModal } from '@/components/quiz/QuizLeaderboardModal';
import {
  Sparkles,
  Flame,
  Clock,
  Trophy,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Server,
  Layout,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export default function QuizPage() {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [selectedTrack, setSelectedTrack] = useState<QuizTrack>('backend');
  const [session, setSession] = useState<QuizSessionState | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Start new randomized session
  const handleStartQuiz = (trackToStart: QuizTrack = selectedTrack) => {
    const questions = getRandomizedQuestions(trackToStart, QUESTIONS_PER_SESSION);
    const newSession: QuizSessionState = {
      track: trackToStart,
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      answerRecords: [],
      sessionStartTime: Date.now(),
      isSessionFinished: false,
    };

    setSession(newSession);
    setSelectedTrack(trackToStart);
    setGameState('playing');
  };

  const handleAnswerQuestion = (record: QuizAnswerRecord) => {
    if (!session) return;

    const newRecords = [...session.answerRecords, record];
    const newStreak = record.isCorrect ? session.streak + 1 : 0;
    const newMaxStreak = Math.max(session.maxStreak, newStreak);
    const newScore = session.score + record.pointsEarned;

    setSession({
      ...session,
      score: newScore,
      streak: newStreak,
      maxStreak: newMaxStreak,
      answerRecords: newRecords,
    });
  };

  const handleFinishSession = () => {
    if (!session) return;
    setSession({
      ...session,
      isSessionFinished: true,
    });
    setGameState('results');
  };

  const handleExitSession = () => {
    if (window.confirm('Yakin ingin keluar? Progres sesi quiz ini tidak akan disimpan.')) {
      setGameState('lobby');
      setSession(null);
    }
  };

  // If in playing state and session is active
  if (gameState === 'playing' && session) {
    return (
      <QuizArena
        session={session}
        onAnswerQuestion={handleAnswerQuestion}
        onFinishSession={handleFinishSession}
        onExit={handleExitSession}
      />
    );
  }

  // If in results state and session is complete
  if (gameState === 'results' && session) {
    return (
      <>
        <QuizResults
          session={session}
          onPlayAgain={() => handleStartQuiz(session.track)}
          onChangeTrack={() => {
            const nextTrack = session.track === 'backend' ? 'frontend' : 'backend';
            handleStartQuiz(nextTrack);
          }}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
        <QuizLeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          initialTrack={session.track}
          onStartTrack={(t) => handleStartQuiz(t)}
        />
      </>
    );
  }

  // Default: Lobby Screen
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-violet-500/20 overflow-x-hidden">
      {/* ── TOP NAV ── */}
      <nav
        className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 hover:bg-zinc-200 shadow-xs hover-lift btn-glass transition-all"
              aria-label="Kembali ke Home"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-zinc-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                Kahoot Tech Quiz <span className="text-zinc-500 font-normal">Arena</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs hover-lift btn-glass transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Leaderboard</span>
            </button>
            <Link
              href="/"
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors"
            >
              LiveCode IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO LOBBY ── */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24 space-y-12">
        <header className="text-center space-y-5 max-w-3xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold shadow-xs glow-badge"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Online Assessment (OA) Simulation • Curated for Indonesian Tech
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]"
          >
            Gamified Tech Screening{' '}
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #09090b 0%, #d97706 40%, #7c3aed 85%)' }}
            >
              Uji Teori & Console Traps
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-600 text-sm md:text-base leading-relaxed"
          >
            Persiapkan diri Anda sebelum live coding dengan tipe soal pilihan ganda interaktif ala <strong>Kahoot</strong>. Soal diambil acak dari bank soal kemungkinan terbesar yang sering keluar di tahap screening Tokopedia, GoTo, Traveloka, Shopee, Blibli, dan Bank Digital.
          </m.p>
        </header>

        {/* ── TRACK SELECTOR CARDS ── */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
              Pilih Spesialisasi Sesi (25 Soal • 30 Menit)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backend Track Card */}
            <div
              onClick={() => setSelectedTrack('backend')}
              className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group glass-card hover-lift ${
                selectedTrack === 'backend'
                  ? 'bg-gradient-to-b from-blue-500/[0.04] to-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-100/80 text-blue-700 border border-blue-200">
                  <Server className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-800">
                  Backend Engineer
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-blue-700 transition-colors">
                ☕ Backend Engineering Track
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                Menguji pemahaman inti arsitektur backend, event loop Node.js, concurrency Go, composite DB indexing B-Tree, optimasi query N+1, Kafka partition key, Redis cache stampede, dan ACID isolation levels.
              </p>

              {/* Highlights */}
              <div className="space-y-2 text-xs text-zinc-700 border-t border-zinc-200/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Prediksi Output Console.log & Async/Await Queues</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Optimistic vs Pessimistic Locking & Idempotency</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standar Tokopedia, GoTo, BCA Digital, DANA</span>
                </div>
              </div>

              {selectedTrack === 'backend' && (
                <div className="mt-6 flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Track Aktif Terpilih
                </div>
              )}
            </div>

            {/* Frontend Track Card */}
            <div
              onClick={() => setSelectedTrack('frontend')}
              className={`p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group glass-card hover-lift ${
                selectedTrack === 'frontend'
                  ? 'bg-gradient-to-b from-violet-500/[0.04] to-white border-violet-500 shadow-md ring-2 ring-violet-500/20'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-violet-100/80 text-violet-700 border border-violet-200">
                  <Layout className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-800">
                  Frontend Engineer
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-violet-700 transition-colors">
                ⚡ Frontend Engineering Track
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                Menguji JavaScript runtime, closure trap di perulangan, `this` context binding, React 18/19 rendering triggers & hook cleanups, DOM event bubbling, Reflow/Repaint, CSS Specificity, dan Web Vitals.
              </p>

              {/* Highlights */}
              <div className="space-y-2 text-xs text-zinc-700 border-t border-zinc-200/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Jebakan Type Coercion & Console.log Quirks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mental Model React Hooks, Memoization & Batching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standar Traveloka, Shopee, Blibli, Tiket.com</span>
                </div>
              </div>

              {selectedTrack === 'frontend' && (
                <div className="mt-6 flex items-center gap-2 text-violet-700 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                  Track Aktif Terpilih
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── RULES & MECHANICS PILLS ── */}
        <section className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/90 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 block">25 Soal Acak</strong>
                <span className="text-zinc-500">Bank soal berbeda tiap sesi</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 block">45s / Soal + 30m Max</strong>
                <span className="text-zinc-500">Timer tegang countdown</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 block">Streak Combo</strong>
                <span className="text-zinc-500">Makin cepat makin tinggi poin</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-zinc-900 block">Leaderboard & Review</strong>
                <span className="text-zinc-500">Hitung timeout & akurasi</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── START CTA BUTTON ── */}
        <div className="text-center pt-2">
          <button
            onClick={() => handleStartQuiz(selectedTrack)}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-base md:text-lg shadow-xl hover-lift btn-glass transition-all"
          >
            <span>Mulai 25 Soal ({selectedTrack === 'backend' ? 'Backend' : 'Frontend'})</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <QuizLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        initialTrack={selectedTrack}
        onStartTrack={(t) => handleStartQuiz(t)}
      />
    </div>
  );
}
