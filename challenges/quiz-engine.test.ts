import {
  getRandomizedQuestions,
  calculateKahootScore,
  evaluateReadiness,
  computeSessionStats,
  QUESTIONS_PER_SESSION,
  QUESTION_TIME_LIMIT_SEC,
} from '../lib/quiz/quiz-engine';
import { BACKEND_QUESTION_BANK } from '../lib/quiz/backend-bank';
import { FRONTEND_QUESTION_BANK } from '../lib/quiz/frontend-bank';
import { QuizAnswerRecord } from '../lib/quiz/types';

describe('Quiz Engine & Question Banks', () => {
  test('Backend question bank has at least 30 questions with valid structure', () => {
    expect(BACKEND_QUESTION_BANK.length).toBeGreaterThanOrEqual(30);
    BACKEND_QUESTION_BANK.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.options).toHaveLength(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctOptionId);
      expect(q.explanation.length).toBeGreaterThan(15);
      expect(q.track).toBe('backend');
    });
  });

  test('Frontend question bank has at least 30 questions with valid structure', () => {
    expect(FRONTEND_QUESTION_BANK.length).toBeGreaterThanOrEqual(30);
    FRONTEND_QUESTION_BANK.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.options).toHaveLength(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correctOptionId);
      expect(q.explanation.length).toBeGreaterThan(15);
      expect(q.track).toBe('frontend');
    });
  });

  test('getRandomizedQuestions picks exactly QUESTIONS_PER_SESSION distinct items', () => {
    const beSession = getRandomizedQuestions('backend', QUESTIONS_PER_SESSION);
    expect(beSession).toHaveLength(QUESTIONS_PER_SESSION);
    const uniqueIds = new Set(beSession.map((q) => q.id));
    expect(uniqueIds.size).toBe(QUESTIONS_PER_SESSION);

    const feSession = getRandomizedQuestions('frontend', QUESTIONS_PER_SESSION);
    expect(feSession).toHaveLength(QUESTIONS_PER_SESSION);
    const uniqueFeIds = new Set(feSession.map((q) => q.id));
    expect(uniqueFeIds.size).toBe(QUESTIONS_PER_SESSION);
  });

  test('calculateKahootScore awards higher score for faster correct answers and streaks', () => {
    const fastScore = calculateKahootScore(true, 1.0, QUESTION_TIME_LIMIT_SEC, 0);
    const slowScore = calculateKahootScore(true, 40.0, QUESTION_TIME_LIMIT_SEC, 0);
    const wrongScore = calculateKahootScore(false, 1.0, QUESTION_TIME_LIMIT_SEC, 0);

    expect(fastScore.points).toBeGreaterThan(slowScore.points);
    expect(wrongScore.points).toBe(0);

    const streakScore = calculateKahootScore(true, 1.0, QUESTION_TIME_LIMIT_SEC, 5);
    expect(streakScore.streakBonus).toBe(200);
    expect(streakScore.points).toBeGreaterThan(fastScore.points);
  });

  test('evaluateReadiness correctly assigns tiers based on accuracy', () => {
    expect(evaluateReadiness(95).tierTitle).toContain('Unicorn');
    expect(evaluateReadiness(75).tierTitle).toContain('Mid-Senior');
    expect(evaluateReadiness(60).tierTitle).toContain('Junior-to-Mid');
    expect(evaluateReadiness(40).tierTitle).toContain('Review');
  });

  test('computeSessionStats correctly aggregates timeout, correct, and wrong', () => {
    const mockRecords: QuizAnswerRecord[] = [
      {
        questionId: 'q1',
        question: BACKEND_QUESTION_BANK[0],
        selectedOptionId: 'B',
        isCorrect: true,
        isTimeout: false,
        timeSpentSec: 5,
        pointsEarned: 900,
        streakAtAnswer: 1,
      },
      {
        questionId: 'q2',
        question: BACKEND_QUESTION_BANK[1],
        selectedOptionId: 'C',
        isCorrect: false,
        isTimeout: false,
        timeSpentSec: 10,
        pointsEarned: 0,
        streakAtAnswer: 0,
      },
      {
        questionId: 'q3',
        question: BACKEND_QUESTION_BANK[2],
        selectedOptionId: null,
        isCorrect: false,
        isTimeout: true,
        timeSpentSec: 45,
        pointsEarned: 0,
        streakAtAnswer: 0,
      },
    ];

    const stats = computeSessionStats(mockRecords);
    expect(stats.total).toBe(3);
    expect(stats.correctCount).toBe(1);
    expect(stats.wrongCount).toBe(1);
    expect(stats.timeoutCount).toBe(1);
    expect(stats.accuracy).toBe(33);
    expect(stats.totalScore).toBe(900);
  });
});
