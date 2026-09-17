import { QuizQuestion, QuizTrack, QuizAnswerRecord } from './types';
import { BACKEND_QUESTION_BANK } from './backend-bank';
import { FRONTEND_QUESTION_BANK } from './frontend-bank';

export const QUESTIONS_PER_SESSION = 25;
export const QUESTION_TIME_LIMIT_SEC = 45; // 45 seconds per question
export const TOTAL_SESSION_MAX_TIME_SEC = 30 * 60; // 30 minutes in seconds

/**
 * Fisher-Yates shuffle algorithm to generate a randomized subset of questions.
 */
export function getRandomizedQuestions(track: QuizTrack, count: number = QUESTIONS_PER_SESSION): QuizQuestion[] {
  const bank = track === 'backend' ? [...BACKEND_QUESTION_BANK] : [...FRONTEND_QUESTION_BANK];

  // Shuffle in place
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }

  return bank.slice(0, Math.min(count, bank.length));
}

/**
 * Kahoot-style speed-based scoring formula:
 * Faster responses earn closer to 1,000 points.
 * Correctness is required to earn points.
 * Streaks award bonus combo multipliers.
 */
export function calculateKahootScore(
  isCorrect: boolean,
  timeSpentSec: number,
  timeLimitSec: number = QUESTION_TIME_LIMIT_SEC,
  currentStreak: number = 0
): { points: number; streakBonus: number } {
  if (!isCorrect) {
    return { points: 0, streakBonus: 0 };
  }

  const clampedTime = Math.min(Math.max(0.1, timeSpentSec), timeLimitSec);
  const speedRatio = 1 - clampedTime / timeLimitSec; // 1.0 (instant) to 0.0 (deadline)
  
  // Base score: between 500 and 1000 points
  const basePoints = Math.round(500 + 500 * Math.max(0, speedRatio));

  // Streak combo bonus
  let streakBonus = 0;
  if (currentStreak >= 10) {
    streakBonus = 350;
  } else if (currentStreak >= 5) {
    streakBonus = 200;
  } else if (currentStreak >= 3) {
    streakBonus = 100;
  } else if (currentStreak >= 2) {
    streakBonus = 50;
  }

  return {
    points: basePoints + streakBonus,
    streakBonus,
  };
}

export interface ReadinessEvaluation {
  tierTitle: string;
  badgeEmoji: string;
  verdict: string;
  colorCls: string;
  borderCls: string;
  glowCls: string;
  description: string;
}

export function evaluateReadiness(accuracyPercent: number): ReadinessEvaluation {
  if (accuracyPercent >= 88) {
    return {
      tierTitle: 'Unicorn Staff / Lead Ready',
      badgeEmoji: '🏆',
      verdict: 'Lolos Tahap OA & Siap Livecode / User Interview!',
      colorCls: 'text-emerald-700 bg-emerald-50',
      borderCls: 'border-emerald-300',
      glowCls: 'shadow-emerald-500/10',
      description: 'Pemahaman mendalam mengenai edge-cases, memory lifecycle, concurrency, dan performa arsitektur. Anda berada di persentil 10% teratas pelamar unicorn Indonesia (Tokopedia, GoTo, Traveloka, Shopee).'
    };
  } else if (accuracyPercent >= 72) {
    return {
      tierTitle: 'Solid Mid-Senior Engineer',
      badgeEmoji: '🚀',
      verdict: 'Passing Grade Screening Terpenuhi!',
      colorCls: 'text-blue-700 bg-blue-50',
      borderCls: 'border-blue-300',
      glowCls: 'shadow-blue-500/10',
      description: 'Dasar logika dan arsitektur sangat solid. Tinggal mengasah detail kecil pada traps console.log atau deadlock concurrency untuk mengunci tawaran di tahap live coding selanjutnya.'
    };
  } else if (accuracyPercent >= 50) {
    return {
      tierTitle: 'Junior-to-Mid Contender',
      badgeEmoji: '📈',
      verdict: 'Cukup Baik, Perlu Pemantapan Teori',
      colorCls: 'text-amber-700 bg-amber-50',
      borderCls: 'border-amber-300',
      glowCls: 'shadow-amber-500/10',
      description: 'Memahami konsep dasar namun masih sering terjebak di pertanyaan trick, priority queue microtask, atau indexing order. Pelajari pembahasan setiap soal di bawah!'
    };
  } else {
    return {
      tierTitle: 'Fundamental Review Needed',
      badgeEmoji: '📚',
      verdict: 'Butuh Deep-Dive Konsep Dasar',
      colorCls: 'text-rose-700 bg-rose-50',
      borderCls: 'border-rose-300',
      glowCls: 'shadow-rose-500/10',
      description: 'Banyak jebakan sintaks dan arsitektur yang terlewat. Pelajari catatan pembahasan di bawah sebelum mengikuti technical assessment perusahaan teknologi sesungguhnya.'
    };
  }
}

export function computeSessionStats(records: QuizAnswerRecord[]) {
  const total = records.length;
  const correctCount = records.filter((r) => r.isCorrect).length;
  const timeoutCount = records.filter((r) => r.isTimeout).length;
  const wrongCount = total - correctCount - timeoutCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const totalScore = records.reduce((sum, r) => sum + r.pointsEarned, 0);
  const totalTimeSpent = records.reduce((sum, r) => sum + r.timeSpentSec, 0);
  const avgTimePerQuestion = total > 0 ? Math.round((totalTimeSpent / total) * 10) / 10 : 0;

  return {
    total,
    correctCount,
    timeoutCount,
    wrongCount,
    accuracy,
    totalScore,
    totalTimeSpent,
    avgTimePerQuestion,
  };
}
